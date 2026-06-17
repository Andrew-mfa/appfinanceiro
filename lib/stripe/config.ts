export type PlanKey =
  | 'pro_monthly'
  | 'pro_annual'
  | 'premium_plus_monthly'
  | 'premium_plus_annual'

export type Plan = 'free' | 'pro' | 'premium_plus'

export const STRIPE_PLANS: Record<PlanKey, { priceId: string; label: string; plan: Plan }> = {
  pro_monthly: {
    priceId: process.env.STRIPE_PRICE_PRO_MONTHLY!,
    label: 'Pro Mensal',
    plan: 'pro',
  },
  pro_annual: {
    priceId: process.env.STRIPE_PRICE_PRO_ANNUAL!,
    label: 'Pro Anual',
    plan: 'pro',
  },
  premium_plus_monthly: {
    priceId: process.env.STRIPE_PRICE_PREMIUM_PLUS_MONTHLY!,
    label: 'Premium Plus Mensal',
    plan: 'premium_plus',
  },
  premium_plus_annual: {
    priceId: process.env.STRIPE_PRICE_PREMIUM_PLUS_ANNUAL!,
    label: 'Premium Plus Anual',
    plan: 'premium_plus',
  },
}
