const GRAPH_API = 'https://graph.facebook.com/v20.0'

export async function sendWhatsAppReply(to: string, message: string): Promise<void> {
  const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID
  const token = process.env.META_WHATSAPP_TOKEN

  if (!phoneNumberId || !token) {
    console.warn('[meta] META_WHATSAPP_PHONE_NUMBER_ID ou META_WHATSAPP_TOKEN não configurados')
    return
  }

  const res = await fetch(`${GRAPH_API}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: message },
    }),
  })

  if (!res.ok) {
    console.error('[meta] Falha ao enviar mensagem:', res.status, await res.text())
  }
}
