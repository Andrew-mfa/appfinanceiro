import { createClient } from '@/lib/supabase/server'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { type Category } from '@/types'

function getMonthRange(date: Date) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const start = new Date(year, month, 1).toISOString().split('T')[0]
  const end = new Date(year, month + 1, 0).toISOString().split('T')[0]
  return { start, end }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { start, end } = getMonthRange(new Date())

  const { data: transactions = [] } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user!.id)
    .gte('date', start)
    .lte('date', end)
    .order('date', { ascending: false })

  const { data: recentTransactions = [] } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user!.id)
    .order('date', { ascending: false })
    .limit(5)

  const totalReceitas = (transactions ?? [])
    .filter((t) => t.type === 'receita')
    .reduce((acc, t) => acc + Number(t.amount), 0)

  const totalDespesas = (transactions ?? [])
    .filter((t) => t.type === 'despesa')
    .reduce((acc, t) => acc + Number(t.amount), 0)

  const categoryMap = new Map<Category, number>()
  for (const t of transactions ?? []) {
    if (t.type === 'despesa') {
      const current = categoryMap.get(t.category as Category) ?? 0
      categoryMap.set(t.category as Category, current + Number(t.amount))
    }
  }
  const despesasByCategory = Array.from(categoryMap.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)

  const receitasCategoryMap = new Map<Category, number>()
  for (const t of transactions ?? []) {
    if (t.type === 'receita') {
      const current = receitasCategoryMap.get(t.category as Category) ?? 0
      receitasCategoryMap.set(t.category as Category, current + Number(t.amount))
    }
  }
  const receitasByCategory = Array.from(receitasCategoryMap.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)

  const now = new Date()
  const monthName = now.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground capitalize">
          Resumo de {monthName}
        </p>
      </div>

      <SummaryCards totalReceitas={totalReceitas} totalDespesas={totalDespesas} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPieChart data={despesasByCategory} title="Despesas por Categoria" />
        <CategoryPieChart data={receitasByCategory} title="Receitas por Categoria" />
      </div>

      <RecentTransactions transactions={recentTransactions ?? []} />
    </div>
  )
}
