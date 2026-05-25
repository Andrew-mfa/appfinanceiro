import { autoCategorize } from './auto-categorize'
import { type ParsedTransaction } from './types'

// Patterns that strongly indicate income
const INCOME_RE = [
  /sal[áa]rio/i, /folha\s/i, /remunera/i, /holerite/i,
  /pix\srecebido/i, /transf.*recebida/i, /cr[eé]dito.*recebido/i,
  /freelance/i, /freela/i, /honor[áa]rio/i, /aut[oô]nomo/i,
  /rendimento/i, /dividendo/i, /resgate/i, /dep[oó]sito\srecebido/i,
]

function isIncome(description: string): boolean {
  return INCOME_RE.some((re) => re.test(description))
}

function parseDate(raw: string): string | null {
  const parts = raw.split('/')
  if (parts.length < 2) return null

  const day = parts[0].padStart(2, '0')
  const month = parts[1].padStart(2, '0')
  if (+month < 1 || +month > 12 || +day < 1 || +day > 31) return null

  const year =
    parts.length >= 3
      ? parts[2].length === 2
        ? '20' + parts[2]
        : parts[2]
      : new Date().getFullYear().toString()

  return `${year}-${month}-${day}`
}

function parseAmount(raw: string): number {
  return Math.abs(
    parseFloat(raw.replace(/R\$\s*/g, '').replace(/\./g, '').replace(',', '.'))
  )
}

interface RawItem {
  text: string
  x: number
  y: number
}

async function extractLines(arrayBuffer: ArrayBuffer): Promise<string[]> {
  const pdfjsLib = await import('pdfjs-dist')
  const { version, GlobalWorkerOptions, getDocument } = pdfjsLib

  // Lock worker to the same installed version via CDN
  GlobalWorkerOptions.workerSrc =
    `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.min.mjs`

  const pdf = await getDocument({ data: arrayBuffer }).promise
  const allItems: RawItem[] = []

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const textContent = await page.getTextContent()

    for (const item of textContent.items) {
      if (!('str' in item)) continue
      const it = item as { str: string; transform: number[] }
      if (!it.str.trim()) continue
      const [, , , , x, pdfY] = it.transform
      // Invert y (PDF is bottom-up) and offset by page so pages sort sequentially
      allItems.push({ text: it.str, x, y: pageNum * 100_000 - pdfY })
    }
  }

  // Sort top-to-bottom then left-to-right
  allItems.sort((a, b) => a.y - b.y || a.x - b.x)

  // Group items within 8 PDF units vertically into visual lines
  const lines: string[] = []
  let group: RawItem[] = []
  let groupY = -Infinity

  for (const item of allItems) {
    if (Math.abs(item.y - groupY) > 8) {
      if (group.length) {
        lines.push(group.map((i) => i.text).join(' ').replace(/\s+/g, ' ').trim())
      }
      group = [item]
      groupY = item.y
    } else {
      group.push(item)
    }
  }
  if (group.length) {
    lines.push(group.map((i) => i.text).join(' ').replace(/\s+/g, ' ').trim())
  }

  return lines.filter(Boolean)
}

export async function parsePDF(arrayBuffer: ArrayBuffer): Promise<ParsedTransaction[]> {
  const lines = await extractLines(arrayBuffer)
  const transactions: ParsedTransaction[] = []

  // Strict: date at start, amount + optional D/C at end
  // e.g. "15/01/2024 IFOOD*RESTAURANTE 50,00 D"
  const STRICT_RE =
    /^(\d{2}\/\d{2}(?:\/\d{2,4})?)\s+(.+?)\s+([-+]?(?:R\$\s*)?\d{1,3}(?:\.\d{3})*,\d{2})\s*([DC]?)$/i

  // Loose: same but allows content before the date
  const LOOSE_RE =
    /(\d{2}\/\d{2}(?:\/\d{2,4})?)\s+(.+?)\s+([-+]?(?:R\$\s*)?\d{1,3}(?:\.\d{3})*,\d{2})\s*([DC]?)/i

  for (const line of lines) {
    const match = line.match(STRICT_RE) ?? line.match(LOOSE_RE)
    if (!match) continue

    const [, rawDate, rawDesc, rawAmt, indicator] = match

    const dateStr = parseDate(rawDate)
    if (!dateStr) continue

    const description = rawDesc.trim()
    if (description.length < 2) continue

    const amount = parseAmount(rawAmt)
    if (!amount || isNaN(amount)) continue

    // Determine type from D/C indicator, sign, then description
    const ind = indicator?.toUpperCase()
    let type: 'receita' | 'despesa'
    if (ind === 'C') {
      type = 'receita'
    } else if (ind === 'D') {
      type = 'despesa'
    } else if (rawAmt.trim().startsWith('+')) {
      type = 'receita'
    } else if (rawAmt.trim().startsWith('-')) {
      type = 'despesa'
    } else {
      type = isIncome(description) ? 'receita' : 'despesa'
    }

    const category = autoCategorize(description)

    // Category overrides type when auto-categorize is confident about income
    if ((category === 'Salário' || category === 'Freelance') && type === 'despesa') {
      type = 'receita'
    }

    transactions.push({
      id: crypto.randomUUID(),
      date: dateStr,
      description,
      amount,
      type,
      category,
    })
  }

  return transactions
}
