import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createAdminClient()

    const { data: audit, error } = await supabase
      .from('audits')
      .select(`
        *,
        pages:page_id (url, page_type)
      `)
      .eq('id', id)
      .single()

    if (error || !audit) {
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
