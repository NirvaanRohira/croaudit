import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { runAudit } from '@/lib/audit-pipeline'
import type { PageType } from '@/lib/checklist'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, page_type = 'home', user_id } = body

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    const validTypes: PageType[] = ['home', 'product', 'category', 'landing', 'cart', 'checkout', 'thank_you', 'general']
    const pageType: PageType = validTypes.includes(page_type) ? page_type : 'home'

    const supabase = createAdminClient()

    // Check if user is paid
    let isPaidUser = false
    const effectiveUserId = user_id || '00000000-0000-0000-0000-000000000000'

    if (user_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan, subscription_status, audits_used_this_month, audits_limit')
        .eq('id', user_id)
        .single()

      if (profile) {
        isPaidUser = profile.plan !== 'free' && profile.subscription_status === 'active'

        // Check audit limits
        if (profile.audits_used_this_month >= profile.audits_limit) {
          return NextResponse.json(
            { error: 'Monthly audit limit reached. Please upgrade your plan.' },
            { status: 429 }
          )
        }

        // Increment usage
        await supabase
          .from('profiles')
          .update({ audits_used_this_month: profile.audits_used_this_month + 1 })
          .eq('id', user_id)
      }
    }

    // Extract domain from URL
    const domain = new URL(url).hostname.replace('www.', '')

    // Create or find site
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .insert({
        user_id: effectiveUserId,
        domain,
        name: domain,
      })
      .select()
      .single()

    if (siteError) {
      console.error('Site creation error:', siteError)
    }

    const { data: page, error: pageError } = await supabase
      .from('pages')
      .insert({
        site_id: site?.id || '00000000-0000-0000-0000-000000000000',
        url,
        page_type: pageType,
        classification_confidence: 0.99,
      })
      .select()
      .single()

    if (pageError) {
      console.error('Page creation error:', pageError)
      return NextResponse.json({ error: 'Failed to create page record' }, { status: 500 })
    }

    // Create audit record with pending status
    const { data: audit, error: auditError } = await supabase
      .from('audits')
      .insert({
        page_id: page.id,
        user_id: effectiveUserId,
        status: 'pending',
      })
      .select()
      .single()

    if (auditError) {
      console.error('Audit creation error:', auditError)
      return NextResponse.json({ error: 'Failed to create audit record' }, { status: 500 })
    }

    // Run the audit pipeline in the background
    // We don't await this — the client will poll for status
    runAuditInBackground(audit.id, url, pageType, isPaidUser, supabase)

    return NextResponse.json({
      audit_id: audit.id,
      status: 'pending',
      is_paid: isPaidUser,
      message: 'Audit started. Poll /api/audit/[id]/status for updates.',
    })
  } catch (error) {
    console.error('Audit run error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function runAuditInBackground(
  auditId: string,
  url: string,
  pageType: PageType,
  isPaidUser: boolean,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
) {
  try {
    // Update status to auditing
    await supabase
      .from('audits')
      .update({ status: 'auditing' })
      .eq('id', auditId)

    // Run the pipeline with correct paid status
    const result = await runAudit(url, pageType, isPaidUser)

    // Update audit with results
    await supabase
      .from('audits')
      .update({
        status: 'complete',
        score: result.score,
        pass_count: result.pass_count,
        fail_count: result.fail_count,
        unable_count: result.unable_count,
        total_items: result.total_items,
        performance_score: result.pagespeed.performance_score,
        accessibility_score: result.pagespeed.accessibility_score,
        mobile_friendly: result.pagespeed.mobile_friendly,
        core_web_vitals: result.pagespeed.core_web_vitals,
        audit_results: result.audit_results,
        quick_wins: result.quick_wins,
        suggestions: result.suggestions,
        html_report: result.html_report,
        model_used_audit: result.model_used_audit,
        model_used_optimize: result.model_used_optimize,
        completed_at: new Date().toISOString(),
      })
      .eq('id', auditId)
  } catch (error) {
    console.error('Background audit error:', error)
    await supabase
      .from('audits')
      .update({
        status: 'failed',
      })
      .eq('id', auditId)
  }
}
