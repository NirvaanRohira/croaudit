import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { runAudit } from '@/lib/audit-pipeline'
import type { PageType } from '@/lib/checklist'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, page_type = 'home', page_id, site_id } = body

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

    // Try to get logged-in user
    let userId: string | null = null
    let isPaidUser = false

    try {
      const serverSupabase = await createServerClient()
      const { data: { user } } = await serverSupabase.auth.getUser()
      if (user) {
        userId = user.id

        const { data: profile } = await supabase
          .from('profiles')
          .select('plan, subscription_status, audits_used_this_month, audits_limit')
          .eq('id', userId)
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
            .eq('id', userId)
        }
      }
    } catch {
      // No session — anonymous audit
    }

    let effectivePageId = page_id

    // If no page_id provided, create site and page records
    if (!effectivePageId) {
      if (!userId) {
        // For anonymous users: run audit without DB records, return results directly
        // We still need an audit record, so create a temporary user-less flow
        // Instead, just run the audit and return a mock audit_id
        const auditId = crypto.randomUUID()

        // Create a lightweight in-memory audit — store result when done
        runAnonymousAudit(auditId, url, pageType, supabase)

        return NextResponse.json({
          audit_id: auditId,
          status: 'pending',
          is_paid: false,
          message: 'Audit started. Poll /api/audit/[id]/status for updates.',
        })
      }

      const domain = new URL(url).hostname.replace('www.', '')

      // Use existing site if provided, or find/create one
      let effectiveSiteId = site_id
      if (!effectiveSiteId) {
        // Try to find existing site for this user + domain
        const { data: existingSite } = await supabase
          .from('sites')
          .select('id')
          .eq('user_id', userId)
          .eq('domain', domain)
          .limit(1)
          .single()

        if (existingSite) {
          effectiveSiteId = existingSite.id
        } else {
          const { data: newSite, error: siteError } = await supabase
            .from('sites')
            .insert({ user_id: userId, domain, name: domain })
            .select()
            .single()

          if (siteError) {
            console.error('Site creation error:', siteError)
            return NextResponse.json({ error: 'Failed to create site' }, { status: 500 })
          }
          effectiveSiteId = newSite.id
        }
      }

      // Create page record
      const { data: page, error: pageError } = await supabase
        .from('pages')
        .insert({
          site_id: effectiveSiteId,
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

      effectivePageId = page.id
    }

    // Create audit record with pending status
    const { data: audit, error: auditError } = await supabase
      .from('audits')
      .insert({
        page_id: effectivePageId,
        user_id: userId,
        status: 'pending',
      })
      .select()
      .single()

    if (auditError) {
      console.error('Audit creation error:', auditError)
      return NextResponse.json({ error: 'Failed to create audit record' }, { status: 500 })
    }

    // Run the audit pipeline in the background
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

// For anonymous users — store results in a temporary table or just in-memory
// For MVP, we create a special anonymous profile and use that
const ANON_AUDIT_RESULTS = new Map<string, { status: string; result?: Record<string, unknown> }>()

async function runAnonymousAudit(
  auditId: string,
  url: string,
  pageType: PageType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _supabase: any
) {
  ANON_AUDIT_RESULTS.set(auditId, { status: 'auditing' })

  try {
    const result = await runAudit(url, pageType, false)
    ANON_AUDIT_RESULTS.set(auditId, {
      status: 'complete',
      result: {
        score: result.score,
        pass_count: result.pass_count,
        fail_count: result.fail_count,
        unable_count: result.unable_count,
        total_items: result.total_items,
        audit_results: result.audit_results,
        quick_wins: result.quick_wins,
        pagespeed: result.pagespeed,
        html_report: result.html_report,
        model_used_audit: result.model_used_audit,
      },
    })
  } catch (error) {
    console.error('Anonymous audit error:', error)
    ANON_AUDIT_RESULTS.set(auditId, { status: 'failed' })
  }
}

// Export for status endpoint to check
export { ANON_AUDIT_RESULTS }

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
