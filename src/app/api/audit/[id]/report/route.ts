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
    if (anon && anon.result) {
      return NextResponse.json({
        id,
        status: anon.status,
        ...anon.result,
        pages: null,
      })
    }

    // Check DB — RLS enforces auth.uid() = user_id automatically
    const supabase = await createClient()
    const { data: audit, error } = await supabase
      .from('audits')
      .select(`
        *,
        pages:page_id (url, page_type)
      `)
      .eq('id', id)
      .maybeSingle()

    if (!audit || error) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 })
    }

    return NextResponse.json(audit)
  } catch (error) {
    console.error('Report fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
