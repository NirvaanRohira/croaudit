import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ANON_AUDIT_RESULTS } from '../../run/route'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createAdminClient()

    // Check DB first
    const { data: audit, error } = await supabase
      .from('audits')
      .select(`
        *,
        pages:page_id (url, page_type)
      `)
      .eq('id', id)
      .single()

    if (audit) {
      return NextResponse.json(audit)
    }

    // Check anonymous in-memory store
    const anon = ANON_AUDIT_RESULTS.get(id)
    if (anon && anon.result) {
      return NextResponse.json({
        id,
        status: anon.status,
        ...anon.result,
        pages: null,
      })
    }

    if (error) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Audit not found' }, { status: 404 })
  } catch (error) {
    console.error('Report fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
