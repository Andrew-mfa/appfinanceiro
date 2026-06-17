import { type SupabaseClient } from '@supabase/supabase-js'
import { type Plan } from '@/types'

export const WHATSAPP_PLAN_LIMITS: Record<Plan, number> = {
  free: 0,
  pro: 50,
  premium_plus: Infinity,
}

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7) // 'YYYY-MM'
}

export interface UsageResult {
  allowed: boolean
  used: number
  limit: number
}

export async function checkAndIncrementUsage(
  admin: SupabaseClient,
  userId: string,
  plan: Plan,
): Promise<UsageResult> {
  const limit = WHATSAPP_PLAN_LIMITS[plan]
  const month = currentMonth()

  if (limit === 0) {
    return { allowed: false, used: 0, limit: 0 }
  }

  const { data } = await admin
    .from('whatsapp_usage')
    .select('count')
    .eq('user_id', userId)
    .eq('month', month)
    .single()

  const used = data?.count ?? 0

  if (limit !== Infinity && used >= limit) {
    return { allowed: false, used, limit }
  }

  await admin.from('whatsapp_usage').upsert(
    { user_id: userId, month, count: used + 1, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,month' },
  )

  return { allowed: true, used: used + 1, limit }
}

export function buildLimitMessage(used: number, limit: number): string {
  if (limit === 0) {
    return (
      '⚠️ *Plano gratuito não inclui o chatbot WhatsApp.*\n\n' +
      'Faça upgrade para o Plano Pro e envie até 50 mensagens/mês.\n' +
      '👉 moneto-kappa.vercel.app/pricing'
    )
  }

  return (
    `⚠️ *Limite mensal atingido (${used}/${limit} mensagens).*\n\n` +
    'Seu plano Pro permite 50 mensagens por mês.\n' +
    'O limite reinicia no próximo mês — ou faça upgrade para o plano *Vitalício* e use sem limites.\n' +
    '👉 moneto-kappa.vercel.app/pricing'
  )
}
