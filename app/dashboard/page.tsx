import { createClient } from '@/lib/supabase/server'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { type Category } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Sparkles, TrendingDown, TrendingUp, Award, AlertTriangle } from 'lucide-react'

function getMonthRange(date: Date) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const start = new Date(year, month, 1).toISOString().split('T')[0]
  const end = new Date(year, month + 1, 0).toISOString().split('T')[0]
  return { start, end }
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const now = new Date()
  const { start, end } = getMonthRange(now)

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

  const allTx = transactions ?? []

  const totalReceitas = allTx
    .filter((t) => t.type === 'receita')
    .reduce((acc, t) => acc + Number(t.amount), 0)

  const totalDespesas = allTx
    .filter((t) => t.type === 'despesa')
    .reduce((acc, t) => acc + Number(t.amount), 0)

  const saldo = totalReceitas - totalDespesas

  const categoryMap = new Map<Category, number>()
  for (const t of allTx) {
    if (t.type === 'despesa') {
      const current = categoryMap.get(t.category as Category) ?? 0
      categoryMap.set(t.category as Category, current + Number(t.amount))
    }
  }
  const despesasByCategory = Array.from(categoryMap.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)

  const receitasCategoryMap = new Map<Category, number>()
  for (const t of allTx) {
    if (t.type === 'receita') {
      const current = receitasCategoryMap.get(t.category as Category) ?? 0
      receitasCategoryMap.set(t.category as Category, current + Number(t.amount))
    }
  }
  const receitasByCategory = Array.from(receitasCategoryMap.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)

  const monthName = now.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
  const greeting = getGreeting()

  // Compute AI-style insights from real data
  const insights: Array<{ type: 'success' | 'warning' | 'info'; text: string }> = []

  if (totalReceitas > 0 && saldo >= 0) {
    const pct = Math.round((saldo / totalReceitas) * 100)
    insights.push({
      type: 'success',
      text: `Excelente! Você poupou ${pct}% da sua renda este mês — ${formatCurrency(saldo)} no saldo positivo.`,
    })
  }

  if (totalReceitas > 0 && totalDespesas > totalReceitas * 0.8) {
    const pct = Math.round((totalDespesas / totalReceitas) * 100)
    insights.push({
      type: 'warning',
      text: `Atenção: suas despesas representam ${pct}% das suas receitas. Considere revisar os gastos.`,
    })
  }

  if (despesasByCategory.length > 0) {
    const top = despesasByCategory[0]
    const pct = totalDespesas > 0 ? Math.round((top.total / totalDespesas) * 100) : 0
    insights.push({
      type: 'info',
      text: `Maior gasto: ${top.category} com ${formatCurrency(top.total)} (${pct}% das despesas totais).`,
    })
  }

  if (allTx.length === 0) {
    insights.push({
      type: 'info',
      text: 'Nenhuma transação registrada este mês. Comece registrando suas receitas e despesas!',
    })
  }

  const insightIcons = {
    success: TrendingUp,
    warning: AlertTriangle,
    info: Sparkles,
  }

  const insightStyles = {
    success: {
      container: 'border-emerald-500/20 bg-emerald-500/5',
      icon: 'text-emerald-500 bg-emerald-500/12',
      text: 'text-emerald-700 dark:text-emerald-300',
    },
    warning: {
      container: 'border-amber-500/20 bg-amber-500/5',
      icon: 'text-amber-500 bg-amber-500/12',
      text: 'text-amber-700 dark:text-amber-300',
    },
    info: {
      container: 'border-primary/15 bg-primary/5',
      icon: 'text-primary bg-primary/12',
      text: 'text-primary/80',
    },
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 pt-1">
        <div>
          <p className="text-sm text-muted-foreground/70 font-medium mb-1">{greeting}</p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-widest text-muted-foreground/60 font-semibold">Período</p>
          <p className="text-sm font-semibold capitalize text-foreground/80">{monthName}</p>
        </div>
      </div>

      {/* ── Summary Cards ────────────────────────────────────────── */}
      <SummaryCards totalReceitas={totalReceitas} totalDespesas={totalDespesas} />

      {/* ── AI Insights ──────────────────────────────────────────── */}
      {insights.length > 0 && (
        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-border/40">
            <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">IA Financeira</p>
              <p className="text-xs text-muted-foreground/60">Insights do seu mês</p>
            </div>
            <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider bg-primary/10 text-primary rounded-md px-2 py-0.5 border border-primary/15">
              Novo
            </span>
          </div>
          <div className="p-4 flex flex-col gap-3">
            {insights.map((insight, i) => {
              const Icon = insightIcons[insight.type]
              const style = insightStyles[insight.type]
              return (
                <div
                  key={i}
                  className={`flex items-start gap-3 rounded-xl border p-4 ${style.container}`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${style.icon}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <p className={`text-sm leading-relaxed ${style.text}`}>{insight.text}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Charts ───────────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/60 mb-4">
          Por Categoria
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <CategoryPieChart data={despesasByCategory} title="Despesas por Categoria" />
          <CategoryPieChart data={receitasByCategory} title="Receitas por Categoria" />
        </div>
      </div>

      {/* ── Recent Transactions ──────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/60 mb-4">
          Movimentações
        </h2>
        <RecentTransactions transactions={recentTransactions ?? []} />
      </div>

    </div>
  )
}
