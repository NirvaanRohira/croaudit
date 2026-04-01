import { NextRequest, NextResponse } from 'next/server'
import { stripe, PLANS, type PlanKey } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const plan = body.plan as PlanKey

    if (!plan || !PLANS[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single()

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email || user.email,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id

      await supabase
        .from('profiles')
        .update({
          stripe_customer_id: customerId,
          billing_provider: 'stripe',
        })
        .eq('id', user.id)
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [
        {
          price: PLANS[plan].priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard?upgraded=true`,
      cancel_url: `${appUrl}/pricing`,
      metadata: {
        supabase_user_id: user.id,
        plan,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
