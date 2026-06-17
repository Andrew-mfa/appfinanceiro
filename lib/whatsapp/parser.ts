import { autoCategorize } from '@/lib/parsers/auto-categorize'
import { type TransactionType, type Category } from '@/types'

export interface ParsedTransaction {
  type: TransactionType
  amount: number
  description: string
  category: Category
}

const EXPENSE_TRIGGERS = [
  'gastei', 'paguei', 'despesa', 'gasto', 'comprei', 'pago',
  'saiu', 'debitou', 'debitei', 'perdi', 'cobrado',
]

const INCOME_TRIGGERS = [
  'recebi', 'ganhei', 'receita', 'entrada', 'recebimento',
  'caiu', 'creditou', 'depositei', 'faturei',
]

// Matches: 50 | 50.00 | 50,00 | R$50 | R$ 50 | R$50,00
const AMOUNT_REGEX = /R?\$?\s*(\d{1,7}(?:[.,]\d{1,2})?)/i

export function parseWhatsAppMessage(text: string): ParsedTransaction | null {
  const lower = text.trim().toLowerCase()

  let type: TransactionType | null = null
  let triggerWord = ''

  for (const w of EXPENSE_TRIGGERS) {
    if (lower.startsWith(w)) { type = 'despesa'; triggerWord = w; break }
  }
  if (!type) {
    for (const w of INCOME_TRIGGERS) {
      if (lower.startsWith(w)) { type = 'receita'; triggerWord = w; break }
    }
  }

  if (!type) return null

  const match = text.match(AMOUNT_REGEX)
  if (!match) return null

  const amount = parseFloat(match[1].replace(',', '.'))
  if (isNaN(amount) || amount <= 0) return null

  // Everything after the matched amount (strip "reais" prefix if present)
  const afterAmount = text.slice(text.toLowerCase().indexOf(match[0].toLowerCase()) + match[0].length)
  const description = afterAmount.replace(/^\s*(reais?|real)\s*/i, '').trim() || triggerWord

  return { type, amount, description, category: autoCategorize(description) }
}

export function formatReply(tx: ParsedTransaction): string {
  const emoji = tx.type === 'receita' ? '💰' : '💸'
  const label = tx.type === 'receita' ? 'Receita' : 'Despesa'
  const value = tx.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  return `${emoji} *${label}* de *${value}* adicionada!\n📂 Categoria: ${tx.category}\n📝 "${tx.description}"`
}

export const HELP_MESSAGE = `*FinançasPro via WhatsApp* 📊

Para adicionar uma transação, envie:

*Despesas:*
• gastei 50 almoço
• paguei 120 uber
• comprei 30 remédio

*Receitas:*
• recebi 2000 salário
• ganhei 500 freelance

_Os valores podem ser escritos como: 50, 50.00, 50,00 ou R$50_`
