// Site crawler — discovers pages and auto-classifies them by URL pattern

export interface DiscoveredPage {
  url: string
  suggested_type: string
  confidence: number
}

// Maximum pages to return from a crawl (large sitemaps can have 100K+ URLs)
const MAX_PAGES = 500
// Collect more raw URLs before sampling down for type diversity
const MAX_RAW_URLS = 5000

/**
 * Classify a URL into a page type by pattern matching.
 * Checks hostname first (e.g., checkout.domain.com), then path patterns.
 */
export function classifyUrl(url: string): { type: string; confidence: number } {
  const parsed = new URL(url)
  const hostname = parsed.hostname.toLowerCase()
  const path = parsed.pathname.toLowerCase()

  // Hostname-based classification (subdomains like checkout.*, cart.*, etc.)
  if (hostname.startsWith('checkout.') || hostname.includes('.checkout.'))
    return { type: 'checkout', confidence: 0.97 }
  if (hostname.startsWith('cart.') || hostname.includes('.cart.'))
    return { type: 'cart', confidence: 0.97 }

  // Path-based classification
  if (path === '/' || path === '') return { type: 'home', confidence: 0.99 }

  // Checkout paths (check before product to avoid /checkout/products being classified as product)
  if (path.includes('/checkout')) return { type: 'checkout', confidence: 0.97 }
  if (path.includes('/cart') || path.includes('/basket')) return { type: 'cart', confidence: 0.97 }
  if (path.includes('/thank') || path.includes('/order-confirm'))
    return { type: 'thank_you', confidence: 0.90 }

  // Product & category
  if (path.match(/\/products?\//)) return { type: 'product', confidence: 0.95 }
  if (path.includes('/collection') || path.includes('/category') || path.includes('/categor'))
    return { type: 'category', confidence: 0.93 }

  // Landing/promo
  if (path.includes('/landing') || path.includes('/promo') || path.includes('/offer'))
    return { type: 'landing', confidence: 0.80 }

  // E-commerce category heuristics — common browse/department path segments
  const categorySegments = new Set([
    'men', 'women', 'mens', 'womens',
    'kids', 'boys', 'girls', 'baby', 'toddler', 'youth',
    'clothing', 'apparel', 'shoes', 'footwear', 'sneakers',
    'accessories', 'bags', 'jewelry', 'jewellery', 'watches',
    'sale', 'clearance', 'new', 'new-arrivals', 'new-in',
    'tops', 'bottoms', 'dresses', 'jackets', 'coats', 'pants',
    'shorts', 'shirts', 'hoodies', 'sweaters', 'swimwear',
    'activewear', 'sportswear', 'underwear', 'socks', 'outerwear',
    'furniture', 'decor', 'kitchen', 'bath', 'bedroom',
    'electronics', 'phones', 'laptops', 'tablets',
    'beauty', 'skincare', 'makeup', 'fragrance', 'haircare',
    'gifts', 'best-sellers', 'trending', 'featured',
    'brands', 'shop', 'shop-all', 'all', 'collections',
  ])

  const segments = path.split('/').filter(Boolean)
  if (segments.length >= 1 && segments.length <= 4) {
    const firstSegment = segments[0].toLowerCase()
    if (categorySegments.has(firstSegment)) {
      const conf = segments.length === 1 ? 0.85 : 0.80
      return { type: 'category', confidence: conf }
    }
  }

  // Paths with 2-3 clean segments (no long IDs or hashes) look like browse paths
  // e.g., /other/point-of-sale/, /men/apparel/tanks-singlets/
  if (segments.length >= 2 && segments.length <= 3
      && !segments.some(s => /\d{5,}|[a-f0-9]{8,}/.test(s))) {
    return { type: 'category', confidence: 0.65 }
  }

  return { type: 'general', confidence: 0.50 }
}

/**
 * Resolve a domain to its canonical base URL, following redirects.
 * e.g., gymshark.com -> https://www.gymshark.com
 *
 * Uses GET instead of HEAD because some servers block HEAD requests,
 * and not all runtimes populate `res.url` for HEAD responses.
 * We abort the body download as soon as we have the response headers.
 */
async function resolveBaseUrl(domain: string): Promise<string> {
  const urls = [`https://${domain}`, `https://www.${domain}`]

  for (const url of urls) {
    const controller = new AbortController()
    try {
      const res = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        headers: { 'User-Agent': 'CROaudit Bot/1.0' },
        signal: AbortSignal.timeout(10000),
      })
      // Abort the body download — we only need the final URL from headers
      controller.abort()
      // Use the final URL after redirects
      const finalUrl = res.url || url
      console.log(`[Crawler] resolveBaseUrl: ${url} -> ${finalUrl}`)
      return new URL(finalUrl).origin
    } catch (err) {
      console.log(`[Crawler] resolveBaseUrl failed for ${url}:`, err instanceof Error ? err.message : err)
      continue
    }
  }

  console.log(`[Crawler] resolveBaseUrl: falling back to https://${domain}`)
  return `https://${domain}`
}

/**
 * Crawl a domain to discover pages.
 * Strategy: sitemap.xml -> robots.txt -> homepage link extraction
 * Caps at MAX_PAGES to prevent overwhelming the UI.
 */
export async function crawlDomain(domain: string): Promise<DiscoveredPage[]> {
  console.log(`[Crawler] Starting crawl for domain: ${domain}`)

  // Resolve the actual base URL (handles redirects like gymshark.com -> www.gymshark.com)
  const baseUrl = await resolveBaseUrl(domain)
  const resolvedDomain = new URL(baseUrl).hostname
  console.log(`[Crawler] Resolved base URL: ${baseUrl} (domain: ${resolvedDomain})`)

  // Phase 1: Collect raw URLs (up to MAX_RAW_URLS) without classifying yet
  const rawUrls = new Set<string>()

  function isSameDomain(urlHost: string): boolean {
    return urlHost === resolvedDomain || urlHost === domain || urlHost === `www.${domain}`
  }

  function addFilteredUrl(url: string) {
    if (rawUrls.size >= MAX_RAW_URLS) return
    try {
      const urlHost = new URL(url).hostname
      if (isSameDomain(urlHost)) {
        const lower = url.toLowerCase()
        // Skip assets, API endpoints, etc.
        if (lower.match(/\.(css|js|png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot|pdf|zip|xml|json)$/)) return
        if (lower.includes('/api/') || lower.includes('/wp-json/') || lower.includes('/feed')) return
        if (lower.includes('/cdn-cgi/') || lower.includes('/_next/')) return
        rawUrls.add(url)
      }
    } catch {
      // Invalid URL, skip
    }
  }

  // Strategy 1: Try sitemap.xml
  try {
    console.log(`[Crawler] Trying sitemap: ${baseUrl}/sitemap.xml`)
    const sitemapUrls = await fetchSitemap(`${baseUrl}/sitemap.xml`, MAX_RAW_URLS)
    console.log(`[Crawler] Sitemap returned ${sitemapUrls.length} URLs`)
    for (const url of sitemapUrls) {
      addFilteredUrl(url)
    }
    console.log(`[Crawler] After sitemap filtering: ${rawUrls.size} URLs`)
  } catch (err) {
    console.log(`[Crawler] Sitemap failed:`, err)
  }

  // Strategy 2: Check robots.txt for Sitemap directives
  if (rawUrls.size === 0) {
    try {
      console.log(`[Crawler] Trying robots.txt: ${baseUrl}/robots.txt`)
      const robotsRes = await fetch(`${baseUrl}/robots.txt`, {
        headers: { 'User-Agent': 'CROaudit Bot/1.0' },
        signal: AbortSignal.timeout(8000),
      })
      if (robotsRes.ok) {
        const robotsTxt = await robotsRes.text()
        const sitemapMatches = robotsTxt.match(/Sitemap:\s*(.+)/gi)
        console.log(`[Crawler] Found ${sitemapMatches?.length || 0} sitemap directives in robots.txt`)
        if (sitemapMatches) {
          for (const match of sitemapMatches) {
            if (rawUrls.size >= MAX_RAW_URLS) break
            const sitemapUrl = match.replace(/Sitemap:\s*/i, '').trim()
            try {
              const urls = await fetchSitemap(sitemapUrl, MAX_RAW_URLS - rawUrls.size)
              for (const url of urls) {
                addFilteredUrl(url)
              }
            } catch {
              // Skip failed sitemaps
            }
          }
        }
      }
    } catch {
      // Robots.txt not available
    }
  }

  // Strategy 3: Crawl homepage for internal links
  if (rawUrls.size === 0) {
    try {
      console.log(`[Crawler] Trying homepage link extraction: ${baseUrl}`)
      const homeRes = await fetch(baseUrl, {
        headers: { 'User-Agent': 'CROaudit Bot/1.0' },
        redirect: 'follow',
        signal: AbortSignal.timeout(15000),
      })
      if (homeRes.ok) {
        const html = await homeRes.text()
        const links = extractInternalLinks(html, resolvedDomain)
        console.log(`[Crawler] Found ${links.length} internal links on homepage`)
        for (const url of links) {
          addFilteredUrl(url)
        }
      }
    } catch {
      // Homepage not reachable
    }
  }

  // Always include the homepage
  if (!rawUrls.has(baseUrl) && !rawUrls.has(`${baseUrl}/`)) {
    rawUrls.add(baseUrl)
  }

  console.log(`[Crawler] Total raw URLs collected: ${rawUrls.size}`)

  // Phase 2: Classify all collected URLs
  const allPages: DiscoveredPage[] = []
  for (const url of rawUrls) {
    const { type, confidence } = classifyUrl(url)
    allPages.push({ url, suggested_type: type, confidence })
  }

  // Phase 3: Diverse sampling — ensure all page types are represented
  const results = diverseSample(allPages, MAX_PAGES)

  console.log(`[Crawler] Final result: ${results.length} pages (sampled from ${allPages.length})`)
  return results
}

/**
 * Round-robin sample across page types so no single type dominates.
 * Guarantees at least MIN_PER_TYPE of each type before filling remaining quota.
 */
function diverseSample(allPages: DiscoveredPage[], maxPages: number): DiscoveredPage[] {
  if (allPages.length <= maxPages) return allPages

  // Group by type
  const byType = new Map<string, DiscoveredPage[]>()
  for (const page of allPages) {
    const arr = byType.get(page.suggested_type) || []
    arr.push(page)
    byType.set(page.suggested_type, arr)
  }

  const result: DiscoveredPage[] = []
  const types = [...byType.keys()]
  const MIN_PER_TYPE = 10

  // First pass: guarantee minimum representation per type
  for (const type of types) {
    const pages = byType.get(type)!
    const take = Math.min(MIN_PER_TYPE, pages.length)
    result.push(...pages.slice(0, take))
  }

  if (result.length >= maxPages) return result.slice(0, maxPages)

  // Second pass: round-robin fill remaining quota
  const usedPerType = new Map(types.map(t => [t, Math.min(MIN_PER_TYPE, byType.get(t)!.length)]))
  let added = 0
  const remaining = maxPages - result.length
  let typeIdx = 0
  let staleRounds = 0

  while (added < remaining && staleRounds < types.length) {
    const type = types[typeIdx % types.length]
    const pages = byType.get(type)!
    const used = usedPerType.get(type)!
    if (used < pages.length) {
      result.push(pages[used])
      usedPerType.set(type, used + 1)
      added++
      staleRounds = 0
    } else {
      staleRounds++
    }
    typeIdx++
  }

  return result
}

async function fetchSitemap(url: string, maxUrls: number): Promise<string[]> {
  console.log(`[Crawler] Fetching sitemap: ${url} (max: ${maxUrls})`)
  const response = await fetch(url, {
    headers: { 'User-Agent': 'CROaudit Bot/1.0' },
    redirect: 'follow',
    signal: AbortSignal.timeout(15000), // 15 second timeout per sitemap
  })
  if (!response.ok) throw new Error(`Sitemap ${url} returned ${response.status}`)

  const xml = await response.text()
  const urls: string[] = []

  // Simple XML parsing for <loc> tags
  const locMatches = xml.matchAll(/<loc>(.*?)<\/loc>/g)
  for (const match of locMatches) {
    if (urls.length >= maxUrls) break
    const loc = match[1].trim()

    // If it's a sitemap index entry, recursively fetch (but only for same-language/primary sitemaps)
    if (loc.endsWith('.xml') || loc.includes('sitemap')) {
      // Skip international/hreflang sitemaps to avoid bloat
      const locPath = new URL(loc).pathname.toLowerCase()
      if (locPath.includes('hreflang') || locPath.match(/\/(es|fr|de|it|pt|ja|ko|zh|ar|nl|sv|da|nb|fi|pl|cs|hu|ro|bg|hr|sk|sl|et|lt|lv|el|tr|he|th|vi|id|ms|tl)-/)) {
        console.log(`[Crawler] Skipping international sitemap: ${loc}`)
        continue
      }

      try {
        const remaining = maxUrls - urls.length
        if (remaining <= 0) break
        const childUrls = await fetchSitemap(loc, remaining)
        urls.push(...childUrls)
      } catch {
        // Skip nested sitemaps that fail
      }
    } else {
      urls.push(loc)
    }
  }

  console.log(`[Crawler] Sitemap ${url} yielded ${urls.length} URLs`)
  return urls.slice(0, maxUrls)
}

function extractInternalLinks(html: string, domain: string): string[] {
  const links: string[] = []
  const hrefRegex = /href=["'](.*?)["']/g
  let match

  while ((match = hrefRegex.exec(html)) !== null) {
    let href = match[1]

    // Skip fragments, javascript:, mailto:, tel:
    if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:'))
      continue

    // Convert relative URLs to absolute
    if (href.startsWith('/')) {
      href = `https://${domain}${href}`
    }

    // Only include same-domain links
    try {
      const url = new URL(href)
      if (url.hostname === domain || url.hostname === `www.${domain}` || url.hostname === domain.replace('www.', '')) {
        links.push(url.origin + url.pathname)
      }
    } catch {
      // Invalid URL, skip
    }
  }

  return [...new Set(links)]
}
