import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CATEGORY_COLORS, type Transaction } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowRight, Receipt } from 'lucide-react'

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border/40">
        <div>
          <p className="text-sm font-semibold text-foreground">Transações Recentes</p>
          <p className="text-xs text-muted-foreground/60 mt-0.5">Últimas movimentações</p>
        </div>
        <Link href="/transactions">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs h-8 text-muted-foreground hover:text-foreground rounded-lg"
          >
            Ver todas
            <ArrowRight className="w-3 h-3" />
          </Button>
        </Link>
      </div>

      {/* Body */}
      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 gap-3">
          <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center">
            <Receipt className="w-5 h-5 text-muted-foreground/50" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">Nenhuma transação ainda</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              <Link href="/transactions" className="text-primary hover:underline">
                Adicione sua primeira transação
              </Link>
            </p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-border/30">
          {transactions.map((t) => (
            <div
              key={t.id}
              className="group flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors duration-150"
            >
              {/* Category dot */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold shadow-sm"
                style={{ backgroundColor: CATEGORY_COLORS[t.category] + '22', border: `1px solid ${CATEGORY_COLORS[t.category]}33` }}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[t.category] }}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{t.description}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className="text-[10px] font-semibold rounded-md px-1.5 py-0.5"
                    style={{
                      backgroundColor: CATEGORY_COLORS[t.category] + '18',
                      color: CATEGORY_COLORS[t.category],
                    }}
                  >
                    {t.category}
                  </span>
                  <span className="text-[10px] text-muted-foreground/50">·</span>
                  <span className="text-[10px] text-muted-foreground/60">
                    {format(new Date(t.date + 'T00:00:00'), "dd 'de' MMM", { locale: ptBR })}
                  </span>
                </div>
              </div>

              {/* Amount */}
              <div className="text-right shrink-0">
                <span
                  className={`text-sm font-bold tabular-nums ${
                    t.type === 'receita'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {t.type === 'receita' ? '+' : '−'}
                  {formatCurrency(t.amount)}
                </span>
                <p className="text-[10px] text-muted-foreground/50 mt-0.5 capitalize">
                  {t.type}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer link */}
      {transactions.length > 0 && (
        <div className="px-6 py-3 border-t border-border/30 bg-muted/20">
          <Link
            href="/transactions"
            className="text-xs text-muted-foreground/60 hover:text-primary transition-colors flex items-center gap-1 group"
          >
            Ver todas as transações
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      )}
    </div>
  )
}
