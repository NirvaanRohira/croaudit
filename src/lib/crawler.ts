// Site crawler — discovers pages and auto-classifies them by URL pattern

export interface DiscoveredPage {
  url: string
  suggested_type: string
  confidence: number
}

/**
 * Classify a URL into a page type by pattern matching.
 */
export function classifyUrl(url: string): { type: string; confidence: number } {
  const path = new URL(url).pathname.toLowerCase()

  if (path === '/' || path === '') return { type: 'home', confidence: 0.99 }
  if (path.includes('/product')) return { type: 'product', confidence: 0.95 }
  if (path.includes('/collection') || path.includes('/category') || path.includes('/categor'))
    return { type: 'category', confidence: 0.93 }
  if (path.includes('/cart')) return { type: 'cart', confidence: 0.97 }
  if (path.includes('/checkout')) return { type: 'checkout', confidence: 0.97 }
  if (path.includes('/thank') || path.includes('/order-confirm'))
    return { type: 'thank_you', confidence: 0.90 }
  if (path.includes('/landing') || path.includes('/promo') || path.includes('/offer'))
    return { type: 'landing', confidence: 0.80 }

  return { type: 'general', confidence: 0.50 }
}

/**
 * Crawl a domain to discover pages.
 * Strategy: sitemap.xml -> robots.txt -> homepage link extraction
 */
export async function crawlDomain(domain: string): Promise<DiscoveredPage[]> {
  const baseUrl = `https://${domain}`
  const discovered = new Map<string, DiscoveredPage>()

  // Strategy 1: Try sitemap.xml
  try {
    const sitemapUrls = await fetchSitemap(`${baseUrl}/sitemap.xml`)
    for (const url of sitemapUrls) {
      if (!discovered.has(url)) {
        const { type, confidence } = classifyUrl(url)
        discovered.set(url, { url, suggested_type: type, confidence })
      }
    }
  } catch {
    // No sitemap, try robots.txt
  }

  // Strategy 2: Check robots.txt for Sitemap directives
  if (discovered.size === 0) {
    try {
      const robotsRes = await fetch(`${baseUrl}/robots.txt`)
      if (robotsRes.ok) {
        const robotsTxt = await robotsRes.text()
        const sitemapMatches = robotsTxt.match(/Sitemap:\s*(.+)/gi)
        if (sitemapMatches) {
          for (const match of sitemapMatches) {
            const sitemapUrl = match.replace(/Sitemap:\s*/i, '').trim()
            try {
              const urls = await fetchSitemap(sitemapUrl)
              for (const url of urls) {
                if (!discovered.has(url)) {
                  const { type, confidence } = classifyUrl(url)
                  discovered.set(url, { url, suggested_type: type, confidence })
                }
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
  if (discovered.size === 0) {
    try {
      const homeRes = await fetch(baseUrl, {
        headers: { 'User-Agent': 'CROaudit Bot/1.0' },
      })
      if (homeRes.ok) {
        const html = await homeRes.text()
        const links = extractInternalLinks(html, domain)
        for (const url of links) {
          if (!discovered.has(url)) {
            const { type, confidence } = classifyUrl(url)
            discovered.set(url, { url, suggested_type: type, confidence })
          }
        }
      }
    } catch {
      // Homepage not reachable
    }
  }

  // Always include the homepage
  if (!discovered.has(baseUrl) && !discovered.has(`${baseUrl}/`)) {
    discovered.set(baseUrl, {
      url: baseUrl,
      suggested_type: 'home',
      confidence: 0.99,
    })
  }

  // Filter out non-page URLs
  return Array.from(discovered.values()).filter((page) => {
    const url = page.url.toLowerCase()
    // Skip assets, API endpoints, etc.
    if (url.match(/\.(css|js|png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot|pdf|zip|xml|json)$/)) return false
    if (url.includes('/api/') || url.includes('/wp-json/') || url.includes('/feed')) return false
    if (url.includes('/cdn-cgi/') || url.includes('/_next/')) return false
    return true
  })
}

async function fetchSitemap(url: string): Promise<string[]> {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'CROaudit Bot/1.0' },
  })
  if (!response.ok) throw new Error('Sitemap not found')

  const xml = await response.text()
  const urls: string[] = []

  // Simple XML parsing for <loc> tags
  const locMatches = xml.matchAll(/<loc>(.*?)<\/loc>/g)
  for (const match of locMatches) {
    const loc = match[1].trim()

    // If it's a sitemap index, recursively fetch
    if (loc.endsWith('.xml') || loc.includes('sitemap')) {
      try {
        const childUrls = await fetchSitemap(loc)
        urls.push(...childUrls)
      } catch {
        // Skip nested sitemaps that fail
      }
    } else {
      urls.push(loc)
    }
  }

  return urls
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
      if (url.hostname === domain || url.hostname === `www.${domain}`) {
        links.push(url.origin + url.pathname)
      }
    } catch {
      // Invalid URL, skip
    }
  }

  return [...new Set(links)]
}
