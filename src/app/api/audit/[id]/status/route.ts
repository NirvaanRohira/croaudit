import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ANON_AUDIT_RESULTS } from '../../run/route'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check anonymous in-memory store first — these are free landing page audits
    const anon = ANON_AUDIT_RESULTS.get(id)
    if (anon) {
      return NextResponse.json({
        id,
        status: anon.status,
        score: anon.result?.score ?? null,
        performance_score: anon.result?.pagespeed
          ? (anon.result.pagespeed as Record<string, unknown>).performance_score
          : null,
        accessibility_score: anon.result?.pagespeed
          ? (anon.result.pagespeed as Record<string, unknown>).accessibility_score
          : null,
        created_at: new Date().toISOString(),
        completed_at: anon.status === 'complete' ? new Date().toISOString() : null,
      })
    }

    // Check DB — RLS enforces auth.uid() = user_id automatically
    const supabase = await createClient()
    const { data: audit, error } = await supabase
      .from('audits')
      .select('id, status, score, performance_score, accessibility_score, created_at, completed_at')
      .eq('id', id)
      .maybeSingle()

    if (!audit || error) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 })
    }

    return NextResponse.json(audit)
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
