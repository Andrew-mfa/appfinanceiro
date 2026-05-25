import Papa from 'papaparse'
import { type ParsedTransaction } from './types'
import { autoCategorize } from './auto-categorize'

/* ── Column detection ───────────────────────────────────────────── */

interface ColMap {
  date:        number
  description: number
  amount:      number
  type?:       number
  balance?:    number
}

const DATE_KEYS   = ['data', 'date', 'dt lançamento', 'dt.lancamento', 'dt lancamento', 'data movimento']
const DESC_KEYS   = ['descricao', 'descri', 'historico', 'memo', 'description', 'observacao', 'lancamento', 'titulo', 'transacao', 'estabelecimento']
const AMOUNT_KEYS = ['valor', 'value', 'amount', 'quantia', 'credito/debito', 'debito/credito', 'debcred', 'movimentacao', 'entrada/saida']
const TYPE_KEYS   = ['tipo', 'type', 'natureza', 'tipo lancamento']

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s\/]/g, '')
    .trim()
}

function detectCols(headers: string[]): ColMap | null {
  const normed = headers.map(normalize)

  const find = (keys: string[]) => {
    for (const k of keys) {
      const i = normed.findIndex((h) => h.includes(normalize(k)))
      if (i !== -1) return i
    }
    return -1
  }

  const dateCol   = find(DATE_KEYS)
  const descCol   = find(DESC_KEYS)
  const amountCol = find(AMOUNT_KEYS)
  const typeCol   = find(TYPE_KEYS)

  if (dateCol === -1 || amountCol === -1) return null

  // If no description col found, pick first col that isn't date/amount
  const fallbackDesc = [0, 1, 2].find((i) => i !== dateCol && i !== amountCol) ?? 0

  return {
    date:        dateCol,
    description: descCol !== -1 ? descCol : fallbackDesc,
    amount:      amountCol,
    type:        typeCol !== -1 ? typeCol : undefined,
  }
}

/* ── Value parsers ──────────────────────────────────────────────── */

function parseDate(raw: string): string {
  const s = raw.replace(/"/g, '').trim()

  // DD/MM/YYYY
  const dmy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.substring(0, 10)

  // DD-MM-YYYY
  const dmyd = s.match(/^(\d{1,2})-(\d{1,2})-(\d{4})/)
  if (dmyd) return `${dmyd[3]}-${dmyd[2].padStart(2, '0')}-${dmyd[1].padStart(2, '0')}`

  // YYYY/MM/DD
  const ymd = s.match(/^(\d{4})\/(\d{2})\/(\d{2})/)
  if (ymd) return `${ymd[1]}-${ymd[2]}-${ymd[3]}`

  return s.substring(0, 10)
}

function parseAmount(raw: string): number {
  let s = raw.replace(/"/g, '').trim()

  const negative = s.startsWith('-') || /\bD\b/.test(s) || s.endsWith(' D')
  const positive = /\bC\b/.test(s) || s.endsWith(' C')

  // Strip everything except digits, comma, dot
  s = s.replace(/[^0-9,.\-]/g, '').replace(/^-/, '')

  let value: number

  // Brazilian format: 1.234,56
  if (/\d{1,3}(\.\d{3})+,\d{2}$/.test(s)) {
    value = parseFloat(s.replace(/\./g, '').replace(',', '.'))
  }
  // Comma as decimal: 1234,56
  else if (s.includes(',') && !s.includes('.')) {
    value = parseFloat(s.replace(',', '.'))
  }
  // Standard float
  else {
    value = parseFloat(s)
  }

  if (isNaN(value)) return NaN

  if (negative && !positive) return -value
  return value
}

function resolveType(
  amountValue: number,
  typeCell?: string,
): 'receita' | 'despesa' {
  if (typeCell) {
    const t = typeCell.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    if (/credito|entrada|receita|credit|income|c\b/.test(t)) return 'receita'
    if (/debito|saida|despesa|debit|expense|d\b/.test(t))    return 'despesa'
  }
  return amountValue >= 0 ? 'receita' : 'despesa'
}

/* ── Main parser ────────────────────────────────────────────────── */

export function parseCSV(content: string): ParsedTransaction[] {
  // Detect separator: if first line has more semicolons than commas → semicolon
  const firstLine = content.split('\n')[0] ?? ''
  const sep = (firstLine.match(/;/g)?.length ?? 0) >= (firstLine.match(/,/g)?.length ?? 0) ? ';' : ','

  const { data, errors } = Papa.parse<string[]>(content, {
    delimiter:      sep,
    skipEmptyLines: true,
  })

  if (errors.length > 0 && data.length === 0) return []
  if (data.length < 2) return []

  const headers = data[0] as string[]
  const cols    = detectCols(headers)
  if (!cols) return []

  const results: ParsedTransaction[] = []

  for (let i = 1; i < data.length; i++) {
    const row = data[i] as string[]
    if (!row || row.every((c) => !c.trim())) continue

    const dateRaw   = row[cols.date]   ?? ''
    const descRaw   = row[cols.description] ?? ''
    const amountRaw = row[cols.amount] ?? ''
    const typeRaw   = cols.type !== undefined ? row[cols.type] : undefined

    const date        = parseDate(dateRaw)
    const description = descRaw.replace(/^"|"$/g, '').trim()
    const rawAmount   = parseAmount(amountRaw)

    if (!date || !description || isNaN(rawAmount) || rawAmount === 0) continue

    const type     = resolveType(rawAmount, typeRaw)
    const amount   = Math.abs(rawAmount)
    const category = autoCategorize(description)

    results.push({
      id: `csv-${i}`,
      date,
      description,
      amount,
      type,
      category,
    })
  }

  return results
}
