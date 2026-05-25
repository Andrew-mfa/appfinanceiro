import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface SummaryCardsProps {
  totalReceitas: number
  totalDespesas: number
}

export function SummaryCards({ totalReceitas, totalDespesas }: SummaryCardsProps) {
  const saldo = totalReceitas - totalDespesas
  const savingsRate = totalReceitas > 0 ? ((saldo / totalReceitas) * 100) : 0
  const expenseRate = totalReceitas > 0 ? ((totalDespesas / totalReceitas) * 100) : 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {/* Receitas */}
      <div className="group relative rounded-2xl border border-border/50 bg-card p-6 overflow-hidden transition-all duration-250 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/5 hover:border-emerald-500/20">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="relative">
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
              Receitas
            </p>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/12 border border-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
          </div>

          <p className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mb-3">
            {formatCurrency(totalReceitas)}
          </p>

          {totalReceitas > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600/70 dark:text-emerald-400/70">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Total do mês</span>
            </div>
          )}
          {totalReceitas === 0 && (
            <p className="text-xs text-muted-foreground/60">Nenhuma receita registrada</p>
          )}
        </div>
      </div>

      {/* Despesas */}
      <div className="group relative rounded-2xl border border-border/50 bg-card p-6 overflow-hidden transition-all duration-250 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-500/5 hover:border-red-500/20">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="relative">
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
              Despesas
            </p>
            <div className="w-9 h-9 rounded-xl bg-red-500/12 border border-red-500/20 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-red-500" />
            </div>
          </div>

          <p className="text-3xl font-bold tracking-tight text-red-600 dark:text-red-400 mb-3">
            {formatCurrency(totalDespesas)}
          </p>

          {totalReceitas > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-red-500/70 transition-all duration-700"
                  style={{ width: `${Math.min(expenseRate, 100)}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground/60 shrink-0">
                {expenseRate.toFixed(0)}% da receita
              </span>
            </div>
          )}
          {totalReceitas === 0 && totalDespesas > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-red-600/70 dark:text-red-400/70">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Total do mês</span>
            </div>
          )}
          {totalDespesas === 0 && (
            <p className="text-xs text-muted-foreground/60">Nenhuma despesa registrada</p>
          )}
        </div>
      </div>

      {/* Saldo */}
      <div className={`group relative rounded-2xl border bg-card p-6 overflow-hidden transition-all duration-250 hover:-translate-y-0.5 hover:shadow-lg ${
        saldo >= 0
          ? 'border-border/50 hover:border-primary/20 hover:shadow-primary/5'
          : 'border-border/50 hover:border-orange-500/20 hover:shadow-orange-500/5'
      }`}>
        <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
          saldo >= 0 ? 'from-primary/5 to-transparent' : 'from-orange-500/5 to-transparent'
        }`} />

        <div className="relative">
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
              Saldo
            </p>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
              saldo >= 0
                ? 'bg-primary/12 border-primary/20'
                : 'bg-orange-500/12 border-orange-500/20'
            }`}>
              <Wallet className={`w-4 h-4 ${saldo >= 0 ? 'text-primary' : 'text-orange-500'}`} />
            </div>
          </div>

          <p className={`text-3xl font-bold tracking-tight mb-3 ${
            saldo >= 0
              ? 'text-primary dark:text-primary'
              : 'text-orange-600 dark:text-orange-400'
          }`}>
            {formatCurrency(saldo)}
          </p>

          {totalReceitas > 0 && saldo >= 0 && (
            <div className="flex items-center gap-1.5 text-xs text-primary/70">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Taxa de poupança: {savingsRate.toFixed(0)}%</span>
            </div>
          )}
          {saldo < 0 && (
            <div className="flex items-center gap-1.5 text-xs text-orange-500/70">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Despesas excedem receitas</span>
            </div>
          )}
          {totalReceitas === 0 && totalDespesas === 0 && (
            <p className="text-xs text-muted-foreground/60">Sem transações este mês</p>
          )}
        </div>
      </div>
    </div>
  )
}
