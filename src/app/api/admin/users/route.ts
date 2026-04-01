import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Admin emails that can access this endpoint
const ADMIN_EMAILS = [
  'test-pro@croaudit.io',
  'nirvaanrohira@gmail.com', // Add your email here
]

async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization')

  // Option 1: Bearer token from logged-in user
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const supabase = createAdminClient()
    const { data: { user } } = await supabase.auth.getUser(token)
    if (user && ADMIN_EMAILS.includes(user.email || '')) {
      return true
    }
  }

  // Option 2: Admin secret key (for API/curl calls)
  const adminKey = request.headers.get('x-admin-key')
  if (adminKey && adminKey === process.env.ADMIN_SECRET_KEY) {
    return true
  }

  // Option 3: Service role key (for internal calls)
  if (authHeader === `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
    return true
  }

  return false
}

// GET /api/admin/users — List all users with their plan info
export async function GET(request: NextRequest) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ users: profiles })
}

// PATCH /api/admin/users — Update a user's plan/subscription
export async function PATCH(request: NextRequest) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { user_id, email, plan, audits_limit, subscription_status } = body

    if (!user_id && !email) {
      return NextResponse.json(
        { error: 'Either user_id or email is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Look up user by email if no user_id
    let targetId = user_id
    if (!targetId && email) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()

      if (!profile) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      targetId = profile.id
    }

    // Build update object
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }

    if (plan) {
      updates.plan = plan
      // Auto-set limits based on plan
      if (plan === 'free') {
        updates.audits_limit = 1
        updates.subscription_status = null
        updates.current_period_end = null
      } else if (plan === 'pro') {
        updates.audits_limit = audits_limit ?? 15
        updates.subscription_status = subscription_status ?? 'active'
        updates.billing_provider = 'razorpay'
      } else if (plan === 'agency') {
        updates.audits_limit = audits_limit ?? 100
        updates.subscription_status = subscription_status ?? 'active'
        updates.billing_provider = 'razorpay'
      }
    }

    if (audits_limit !== undefined) updates.audits_limit = audits_limit
    if (subscription_status !== undefined) updates.subscription_status = subscription_status

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', targetId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ user: data, message: 'User updated successfully' })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid request' },
      { status: 400 }
    )
  }
}
