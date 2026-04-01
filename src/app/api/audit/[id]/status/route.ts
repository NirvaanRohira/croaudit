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
      .select('id, status, score, performance_score, accessibility_score, created_at, completed_at')
      .eq('id', id)
      .single()

    if (error || !audit) {
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
