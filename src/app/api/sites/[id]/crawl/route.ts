import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { crawlDomain } from '@/lib/crawler'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting: 5 per hour per IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const { allowed } = rateLimit(`crawl:${ip}`, 5, 60 * 60 * 1000)
    if (!allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 })
    }

    // Auth: verify user is logged in
    const serverSupabase = await createClient()
    const { data: { user } } = await serverSupabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { id: siteId } = await params
    const supabase = createAdminClient()

    // Verify user owns the site
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('*')
      .eq('id', siteId)
      .eq('user_id', user.id)
      .single()

    if (siteError || !site) {
      return NextResponse.json({ error: 'Site not found or access denied' }, { status: 403 })
    }

    // Create crawl record
    const { data: crawl, error: crawlError } = await supabase
      .from('crawl_results')
      .insert({
        site_id: siteId,
        discovered_pages: [],
        status: 'crawling',
      })
      .select()
      .single()

    if (crawlError) {
      return NextResponse.json({ error: 'Failed to start crawl' }, { status: 500 })
    }

    // Run crawl in background
    crawlInBackground(crawl.id, site.domain, siteId, supabase)

    return NextResponse.json({
      crawl_id: crawl.id,
      status: 'crawling',
    })
  } catch (error) {
    console.error('Crawl error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function crawlInBackground(
  crawlId: string,
  domain: string,
  siteId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
) {
  try {
    const pages = await crawlDomain(domain)

    await supabase
      .from('crawl_results')
      .update({
        discovered_pages: pages,
        status: 'complete',
      })
      .eq('id', crawlId)

    // Update site page count
    await supabase
      .from('sites')
      .update({ page_count: pages.length })
      .eq('id', siteId)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? error.stack : undefined
    console.error(`[Crawl] Background crawl failed for domain="${domain}" crawlId="${crawlId}":`, message)
    if (stack) console.error('[Crawl] Stack:', stack)

    await supabase
      .from('crawl_results')
      .update({ status: 'failed', error_message: message })
      .eq('id', crawlId)
      .then(({ error: updateErr }: { error: unknown }) => {
        if (updateErr) console.error('[Crawl] Failed to update crawl status:', updateErr)
      })
  }
}
