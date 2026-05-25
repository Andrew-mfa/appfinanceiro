import { type Category } from '@/types'

export interface ParsedTransaction {
  id: string
  date: string        // YYYY-MM-DD
  description: string
  amount: number      // always positive
  type: 'receita' | 'despesa'
  category: Category
}
