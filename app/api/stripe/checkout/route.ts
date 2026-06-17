import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { STRIPE_PLANS, type PlanKey } from '@/lib/stripe/config'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { plan, annual } = await req.json() as { plan: 'pro' | 'premium_plus'; annual?: boolean }

    const planKey: PlanKey = plan === 'premium_plus'
      ? (annual ? 'premium_plus_annual' : 'premium_plus_monthly')
      : (annual ? 'pro_annual' : 'pro_monthly')
    const selected = STRIPE_PLANS[planKey]

    if (!selected?.priceId) {
      return NextResponse.json({ error: 'Plano inválido ou Price ID não configurado' }, { status: 400 })
    }

    // Tenta buscar customer existente; ignora se admin client não estiver disponível
    let customerId: string | undefined
    try {
      const admin = createAdminClient()
      const { data: profile } = await admin
        .from('user_profiles')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .single()
      customerId = profile?.stripe_customer_id ?? undefined
    } catch {
      // SUPABASE_SERVICE_ROLE_KEY não configurada — continua sem lookup
    }

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id

      // Salva o customer ID se o admin client estiver disponível
      try {
        const admin = createAdminClient()
        await admin
          .from('user_profiles')
          .upsert({ user_id: user.id, stripe_customer_id: customerId })
      } catch {
        // Segue sem persistir — o webhook vai sincronizar depois
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
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
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
