'use client'

import { useState, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TransactionDialog } from './TransactionDialog'
import { DeleteDialog } from './DeleteDialog'
import { CATEGORIES, CATEGORY_COLORS, type Transaction, type Category } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Pencil, Trash2, Download, Search, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

interface TransactionsClientProps {
  initialTransactions: Transaction[]
  userId: string
}

export function TransactionsClient({ initialTransactions, userId }: TransactionsClientProps) {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)

  const now = new Date()
  const [filterMonth, setFilterMonth] = useState(String(now.getMonth() + 1))
  const [filterYear, setFilterYear] = useState(String(now.getFullYear()))
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [search, setSearch] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null)

  const years = useMemo(() => {
    const y = new Set(transactions.map((t) => new Date(t.date + 'T00:00:00').getFullYear()))
    y.add(now.getFullYear())
    return Array.from(y).sort((a, b) => b - a)
  }, [transactions])

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const date = new Date(t.date + 'T00:00:00')
      if (filterMonth !== 'all' && date.getMonth() + 1 !== Number(filterMonth)) return false
      if (filterYear !== 'all' && date.getFullYear() !== Number(filterYear)) return false
      if (filterCategory !== 'all' && t.category !== filterCategory) return false
      if (filterType !== 'all' && t.type !== filterType) return false
      if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [transactions, filterMonth, filterYear, filterCategory, filterType, search])

  const totals = useMemo(() => ({
    receitas: filtered.filter((t) => t.type === 'receita').reduce((a, t) => a + Number(t.amount), 0),
    despesas: filtered.filter((t) => t.type === 'despesa').reduce((a, t) => a + Number(t.amount), 0),
  }), [filtered])

  const refreshTransactions = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
    if (data) setTransactions(data as Transaction[])
  }, [userId])

  function handleEdit(t: Transaction) {
    setEditingTransaction(t)
    setDialogOpen(true)
  }

  function handleDelete(t: Transaction) {
    setDeletingTransaction(t)
    setDeleteDialogOpen(true)
  }

  function handleAdd() {
    setEditingTransaction(null)
    setDialogOpen(true)
  }

  function exportCSV() {
    const headers = ['Data', 'Descrição', 'Tipo', 'Categoria', 'Valor']
    const rows = filtered.map((t) => [
      formatDate(t.date),
      `"${t.description.replace(/"/g, '""')}"`,
      t.type === 'receita' ? 'Receita' : 'Despesa',
      t.category,
      t.amount.toFixed(2).replace('.', ','),
    ])
    const csv = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transacoes-${filterYear}-${filterMonth}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function clearFilters() {
    setFilterMonth(String(now.getMonth() + 1))
    setFilterYear(String(now.getFullYear()))
    setFilterCategory('all')
    setFilterType('all')
    setSearch('')
  }

  const hasActiveFilters = filterCategory !== 'all' || filterType !== 'all' || search !== ''

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transações</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} transação(ões) encontrada(s)</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2 hidden sm:flex">
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
          <Button size="sm" onClick={handleAdd} className="gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nova transação</span>
            <span className="sm:hidden">Nova</span>
          </Button>
        </div>
      </div>

      {/* Summary mini-cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border/60">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Receitas</p>
            <p className="text-base font-bold text-green-600 dark:text-green-400">{formatCurrency(totals.receitas)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Despesas</p>
            <p className="text-base font-bold text-red-600 dark:text-red-400">{formatCurrency(totals.despesas)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">Saldo</p>
            <p className={`text-base font-bold ${totals.receitas - totals.despesas >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
              {formatCurrency(totals.receitas - totals.despesas)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border/60">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por descrição..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Select value={filterMonth} onValueChange={(v) => setFilterMonth(v ?? filterMonth)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os meses</SelectItem>
                  {MONTHS.map((m, i) => (
                    <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterYear} onValueChange={(v) => setFilterYear(v ?? filterYear)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os anos</SelectItem>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v ?? filterCategory)}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterType} onValueChange={(v) => setFilterType(v ?? filterType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Receitas e despesas</SelectItem>
                  <SelectItem value="receita">Receitas</SelectItem>
                  <SelectItem value="despesa">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {hasActiveFilters && (
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5 text-muted-foreground h-7 text-xs">
                  <X className="w-3 h-3" />
                  Limpar filtros
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mobile export button */}
      <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2 sm:hidden w-full">
        <Download className="w-4 h-4" />
        Exportar CSV
      </Button>

      {/* Table */}
      <Card className="border-border/60">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="hidden sm:table-cell">Categoria</TableHead>
                <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                    Nenhuma transação encontrada para os filtros selecionados.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-sm whitespace-nowrap">
                      {formatDate(t.date)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium truncate max-w-[160px] sm:max-w-xs">
                          {t.description}
                        </span>
                        <span className="sm:hidden text-xs text-muted-foreground">
                          {t.category}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span
                        className="inline-flex items-center gap-1.5 text-xs"
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: CATEGORY_COLORS[t.category as Category] }}
                        />
                        {t.category}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={t.type === 'receita' ? 'default' : 'destructive'} className="text-xs">
                        {t.type === 'receita' ? 'Receita' : 'Despesa'}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-semibold text-sm ${
                      t.type === 'receita'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {t.type === 'receita' ? '+' : '-'}{formatCurrency(t.amount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7"
                          onClick={() => handleEdit(t)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(t)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        transaction={editingTransaction}
        userId={userId}
        onSuccess={refreshTransactions}
      />

      {deletingTransaction && (
        <DeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          transactionId={deletingTransaction.id}
          description={deletingTransaction.description}
          onSuccess={refreshTransactions}
        />
      )}
    </div>
  )
}
