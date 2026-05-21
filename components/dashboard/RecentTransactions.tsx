import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CATEGORY_COLORS, type Transaction } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowRight } from 'lucide-react'

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Transações Recentes</CardTitle>
        <Link href="/transactions">
          <Button variant="ghost" size="sm" className="gap-1 text-xs">
            Ver todas <ArrowRight className="w-3 h-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhuma transação ainda.{' '}
            <Link href="/transactions" className="text-primary hover:underline">
              Adicione a primeira!
            </Link>
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-border/40">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center gap-3 py-3">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[t.category] }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(t.date + 'T00:00:00'), 'dd MMM yyyy', { locale: ptBR })} · {t.category}
                  </p>
                </div>
                <span className={`text-sm font-semibold shrink-0 ${
                  t.type === 'receita'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {t.type === 'receita' ? '+' : '-'}{formatCurrency(t.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
