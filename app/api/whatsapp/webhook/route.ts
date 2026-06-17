import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { parseWhatsAppMessage, formatReply, HELP_MESSAGE } from '@/lib/whatsapp/parser'
import { sendWhatsAppReply } from '@/lib/whatsapp/meta'
import { checkAndIncrementUsage, buildLimitMessage } from '@/lib/whatsapp/limits'
import { type Plan } from '@/types'

// Meta webhook verification — GET /?hub.mode=subscribe&hub.verify_token=...&hub.challenge=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.META_WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge ?? '', { status: 200 })
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

interface MetaMessage {
  from: string
  id: string
  type: string
  text?: { body: string }
}

interface MetaPayload {
  object: string
  entry: Array<{
    changes: Array<{
      field: string
      value: {
        messages?: MetaMessage[]
      }
    }>
  }>
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '').replace(/^0+/, '')
}

export async function POST(req: NextRequest) {
  let payload: MetaPayload
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Always return 200 to Meta — otherwise it retries the delivery indefinitely
  if (payload.object !== 'whatsapp_business_account') {
    return NextResponse.json({ ok: true })
  }

  const allowedPhone = normalizePhone(process.env.WHATSAPP_MY_PHONE ?? '')
  const userId_env = process.env.WHATSAPP_MY_USER_ID
  const admin = createAdminClient()

  for (const entry of payload.entry) {
    for (const change of entry.changes) {
      if (change.field !== 'messages') continue

      for (const msg of change.value.messages ?? []) {
        if (msg.type !== 'text' || !msg.text?.body) continue

        const senderPhone = normalizePhone(msg.from)
        const text = msg.text.body.trim()

        // Lookup user by registered phone or fall back to env var (single-user setup)
        let userId = ''
        let plan: Plan = 'free'

        const { data: profileByPhone } = await admin
          .from('user_profiles')
          .select('user_id, plan')
          .eq('whatsapp_phone', senderPhone)
          .single()

        if (profileByPhone) {
          userId = profileByPhone.user_id
          plan = profileByPhone.plan as Plan
        } else if (allowedPhone && senderPhone === allowedPhone && userId_env) {
          // Fallback: owner using env-var setup
          userId = userId_env
          const { data: ownerProfile } = await admin
            .from('user_profiles')
            .select('plan')
            .eq('user_id', userId)
            .single()
          plan = (ownerProfile?.plan ?? 'free') as Plan
        } else {
          // Unknown number — ignore silently (Meta requires 200 response)
          continue
        }

        if (/^(ajuda|help|\?|oi|ol[aá])$/i.test(text)) {
          await sendWhatsAppReply(senderPhone, HELP_MESSAGE)
          continue
        }

        // Enforce plan limits
        const usage = await checkAndIncrementUsage(admin, userId, plan)
        if (!usage.allowed) {
          await sendWhatsAppReply(senderPhone, buildLimitMessage(usage.used, usage.limit))
          continue
        }

        const parsed = parseWhatsAppMessage(text)

        if (!parsed) {
          await sendWhatsAppReply(
            senderPhone,
            'Não entendi. Tente:\n• "gastei 50 almoço"\n• "recebi 2000 salário"\n\nEnvie *ajuda* para ver todos os comandos.',
          )
          continue
        }

        const { error } = await admin.from('transactions').insert({
          user_id: userId,
          description: parsed.description,
          amount: parsed.amount,
          type: parsed.type,
          category: parsed.category,
          date: new Date().toISOString().slice(0, 10),
        })

        if (error) {
          console.error('[whatsapp/webhook] Supabase insert error:', error)
          await sendWhatsAppReply(senderPhone, '❌ Erro ao salvar a transação. Tente novamente.')
        } else {
          await sendWhatsAppReply(senderPhone, formatReply(parsed))
        }
      }
    }
  }

  return NextResponse.json({ ok: true })
}
