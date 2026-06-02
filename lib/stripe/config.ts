export type PlanKey = 'pro_monthly' | 'pro_annual' | 'ltd'
export type Plan = 'free' | 'pro' | 'ltd'

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
  ltd: {
    priceId: process.env.STRIPE_PRICE_LTD!,
    label: 'Lifetime Deal',
    plan: 'ltd',
  },
}
