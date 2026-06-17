import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { STRIPE_PLANS, type PlanKey } from '@/lib/stripe/config'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Assinatura ausente' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 400 })
  }

  const admin = createAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.supabase_user_id
      const planKey = session.metadata?.plan_key as PlanKey | undefined

      if (!userId || !planKey) break

      const plan = STRIPE_PLANS[planKey]?.plan ?? 'free'

      await admin.from('user_profiles').upsert({
        user_id: userId,
        plan,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string | null,
        updated_at: new Date().toISOString(),
      })
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const isActive = sub.status === 'active' || sub.status === 'trialing'

      // Detect plan from price ID
      let activePlan = 'pro'
      if (isActive) {
        const priceId = sub.items.data[0]?.price?.id
        const matched = priceId
          ? Object.values(STRIPE_PLANS).find(p => p.priceId === priceId)
          : null
        if (matched) activePlan = matched.plan
      }

      // current_period_end está no SubscriptionItem na API dahlia
      const periodEnd = sub.items.data[0]?.current_period_end
      const planExpiresAt = isActive || !periodEnd
        ? null
        : new Date(periodEnd * 1000).toISOString()

      await admin.from('user_profiles')
        .update({
          plan: isActive ? activePlan : 'free',
          plan_expires_at: planExpiresAt,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', sub.id)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription

      await admin.from('user_profiles')
        .update({
          plan: 'free',
          stripe_subscription_id: null,
          plan_expires_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', sub.id)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      // Na API dahlia, subscription está em parent.subscription_details.subscription
      const subscriptionId = invoice.parent?.subscription_details?.subscription
      if (!subscriptionId) break

      const subId = typeof subscriptionId === 'string' ? subscriptionId : subscriptionId.id
      await admin.from('user_profiles')
        .update({ plan: 'free', updated_at: new Date().toISOString() })
        .eq('stripe_subscription_id', subId)
      break
    }
  }

  return NextResponse.json({ received: true })
}
