import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { STRIPE_PLANS, type PlanKey } from '@/lib/stripe/config'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { plan, annual } = await req.json() as { plan: 'pro' | 'ltd'; annual?: boolean }

  const planKey: PlanKey = plan === 'ltd' ? 'ltd' : annual ? 'pro_annual' : 'pro_monthly'
  const selected = STRIPE_PLANS[planKey]

  // Buscar ou criar Stripe Customer
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('user_profiles')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  let customerId = profile?.stripe_customer_id as string | undefined

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email!,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id

    await admin
      .from('user_profiles')
      .upsert({ user_id: user.id, stripe_customer_id: customerId })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: plan === 'ltd' ? 'payment' : 'subscription',
    line_items: [{ price: selected.priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard?checkout=success`,
    cancel_url: `${appUrl}/pricing?checkout=cancelled`,
    metadata: {
      supabase_user_id: user.id,
      plan_key: planKey,
    },
    allow_promotion_codes: true,
  })

  return NextResponse.json({ url: session.url })
}
