import { type ParsedTransaction } from './types'
import { autoCategorize } from './auto-categorize'

function extractTag(block: string, tag: string): string {
  // Matches both <TAG>value</TAG> and SGML <TAG>value\n
  const xmlReg = new RegExp(`<${tag}>([^<]*)(?:<\/${tag}>)?`, 'i')
  const match = block.match(xmlReg)
  return match ? match[1].trim() : ''
}

function parseOFXDate(dateStr: string): string {
  // Format: 20240115120000[-3:BRT] or 20240115 or 20240115120000
  const clean = dateStr.replace(/\[.*\]/, '').trim()
  const year  = clean.substring(0, 4)
  const month = clean.substring(4, 6)
  const day   = clean.substring(6, 8)
  if (!year || !month || !day) return ''
  return `${year}-${month}-${day}`
}

export function parseOFX(content: string): ParsedTransaction[] {
  const results: ParsedTransaction[] = []

  // Handle both XML (<STMTTRN>...</STMTTRN>) and SGML (no closing tags on leaf elements)
  const trnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi
  let match
  let index = 0

  while ((match = trnRegex.exec(content)) !== null) {
    const block = match[1]

    const dateStr   = extractTag(block, 'DTPOSTED')
    const amountStr = extractTag(block, 'TRNAMT')
    const memo      = extractTag(block, 'MEMO') || extractTag(block, 'NAME') || extractTag(block, 'FITID') || 'Sem descrição'
    const trnType   = extractTag(block, 'TRNTYPE').toUpperCase()

    if (!dateStr || !amountStr) continue

    const date = parseOFXDate(dateStr)
    if (!date) continue

    const rawAmount = parseFloat(amountStr.replace(',', '.'))
    if (isNaN(rawAmount) || rawAmount === 0) continue

    // Determine type: OFX CREDIT = receita, DEBIT = despesa
    // Also use sign: positive = receita, negative = despesa
    let type: 'receita' | 'despesa'
    if (trnType === 'CREDIT') {
      type = 'receita'
    } else if (trnType === 'DEBIT') {
      type = 'despesa'
    } else {
      type = rawAmount >= 0 ? 'receita' : 'despesa'
    }

    const amount   = Math.abs(rawAmount)
    const category = autoCategorize(memo)

    results.push({
      id:          `ofx-${index++}`,
      date,
      description: memo,
      amount,
      type,
      category,
    })
  }

  return results
}
