import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-03-25.dahlia',
    })
  }
  return _stripe
}

// Re-export as getter for convenience
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getStripe() as any)[prop]
  },
})

export const PLANS = {
  pro: {
    name: 'Pro',
    price: 2900, // $29.00
    auditsLimit: 15,
    priceId: process.env.STRIPE_PRO_PRICE_ID || '',
  },
  agency: {
    name: 'Agency',
    price: 9900, // $99.00
    auditsLimit: 50,
    priceId: process.env.STRIPE_AGENCY_PRICE_ID || '',
  },
} as const

export type PlanKey = keyof typeof PLANS
