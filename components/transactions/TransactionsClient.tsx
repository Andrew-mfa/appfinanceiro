'use client'

import { useState, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TransactionDialog } from './TransactionDialog'
import { DeleteDialog } from './DeleteDialog'
import { CATEGORIES, CATEGORY_COLORS, type Transaction, type Category } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  Plus, Pencil, Trash2, Download, Search, X,
  TrendingUp, TrendingDown, Wallet, Receipt,
  UtensilsCrossed, Car, Home, Music, Heart,
  GraduationCap, Briefcase, Laptop, MoreHorizontal,
  Sparkles, AlertTriangle, CheckCircle2,
  ArrowUpRight, ArrowDownRight, SlidersHorizontal,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/* ── Constants ─────────────────────────────────────────────────── */

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const CATEGORY_ICONS: Record<Category, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Alimentação: UtensilsCrossed,
  Transporte: Car,
  Moradia: Home,
  Lazer: Music,
  Saúde: Heart,
  Educação: GraduationCap,
  Salário: Briefcase,
  Freelance: Laptop,
  Outros: MoreHorizontal,
}

/* ── Types ──────────────────────────────────────────────────────── */

interface TransactionsClientProps {
  initialTransactions: Transaction[]
  userId: string
}

/* ── Skeleton Row ───────────────────────────────────────────────── */

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-6 py-4 border-b border-border/30">
      <div className="w-10 h-10 rounded-xl bg-muted/60 shimmer shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-3.5 w-48 rounded-full bg-muted/60 shimmer" />
        <div className="h-2.5 w-28 rounded-full bg-muted/40 shimmer" />
      </div>
      <div className="hidden md:block h-5 w-16 rounded-lg bg-muted/40 shimmer" />
      <div className="h-4 w-24 rounded-full bg-muted/50 shimmer" />
      <div className="w-16 h-7 rounded-lg bg-muted/30 shimmer" />
    </div>
  )
}

/* ── Main Component ─────────────────────────────────────────────── */

export function TransactionsClient({ initialTransactions, userId }: TransactionsClientProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const now = new Date()
  const [filterMonth, setFilterMonth] = useState(String(now.getMonth() + 1))
  const [filterYear, setFilterYear] = useState(String(now.getFullYear()))
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null)

  /* ── Derived state ──────────────────────────────────────────── */

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

  const totals = useMemo(() => {
    const receitas = filtered.filter((t) => t.type === 'receita').reduce((a, t) => a + Number(t.amount), 0)
    const despesas = filtered.filter((t) => t.type === 'despesa').reduce((a, t) => a + Number(t.amount), 0)
    return { receitas, despesas, saldo: receitas - despesas }
  }, [filtered])

  const categoryBreakdown = useMemo(() => {
    const map = new Map<Category, number>()
    filtered
      .filter((t) => t.type === 'despesa')
      .forEach((t) => {
        const curr = map.get(t.category as Category) ?? 0
        map.set(t.category as Category, curr + Number(t.amount))
      })
    return Array.from(map.entries())
      .map(([category, total]) => ({
        category,
        total,
        pct: totals.despesas > 0 ? (total / totals.despesas) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
  }, [filtered, totals.despesas])

  const insights = useMemo(() => {
    const result: Array<{ type: 'success' | 'warning' | 'info'; text: string }> = []
    if (filtered.length === 0) return result

    if (totals.receitas > 0) {
      const rate = ((totals.saldo / totals.receitas) * 100)
      if (rate >= 20) {
        result.push({ type: 'success', text: `Taxa de poupança de ${rate.toFixed(0)}% neste período — resultado excelente!` })
      } else if (rate < 0) {
        result.push({ type: 'warning', text: `Despesas superam receitas em ${formatCurrency(Math.abs(totals.saldo))}. Revise seus gastos.` })
      } else {
        result.push({ type: 'info', text: `Saldo de ${formatCurrency(totals.saldo)} neste período (${rate.toFixed(0)}% de poupança).` })
      }
    }

    if (categoryBreakdown.length > 0) {
      const top = categoryBreakdown[0]
      result.push({
        type: 'info',
        text: `Maior despesa: ${top.category} com ${formatCurrency(top.total)} (${top.pct.toFixed(0)}% do total gasto).`,
      })
    }

    const expCount = filtered.filter((t) => t.type === 'despesa').length
    if (expCount > 1) {
      const avg = totals.despesas / expCount
      result.push({ type: 'info', text: `Média de ${formatCurrency(avg)} por despesa em ${expCount} transações neste período.` })
    }

    return result.slice(0, 2)
  }, [filtered, totals, categoryBreakdown])

  const hasActiveFilters = filterCategory !== 'all' || filterType !== 'all' || search !== ''
  const activeFilterCount = [filterCategory !== 'all', filterType !== 'all', search !== ''].filter(Boolean).length

  /* ── Handlers ───────────────────────────────────────────────── */

  const refreshTransactions = useCallback(async () => {
    setIsRefreshing(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
    if (data) setTransactions(data as Transaction[])
    setIsRefreshing(false)
  }, [userId])

  function handleEdit(t: Transaction) { setEditingTransaction(t); setDialogOpen(true) }
  function handleDelete(t: Transaction) { setDeletingTransaction(t); setDeleteDialogOpen(true) }
  function handleAdd() { setEditingTransaction(null); setDialogOpen(true) }

  function clearFilters() {
    setFilterCategory('all')
    setFilterType('all')
    setSearch('')
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

  const insightIcons = { success: CheckCircle2, warning: AlertTriangle, info: Sparkles }
  const insightStyles = {
    success: { wrap: 'border-emerald-500/20 bg-emerald-500/5', icon: 'text-emerald-500 bg-emerald-500/12', text: 'text-emerald-700 dark:text-emerald-300' },
    warning: { wrap: 'border-amber-500/20 bg-amber-500/5', icon: 'text-amber-500 bg-amber-500/12', text: 'text-amber-700 dark:text-amber-300' },
    info: { wrap: 'border-primary/15 bg-primary/5', icon: 'text-primary bg-primary/12', text: 'text-primary/80' },
  }

  /* ── Render ─────────────────────────────────────────────────── */

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Transações</h1>
          <p className="text-sm text-muted-foreground/70 mt-1">
            <span className="font-semibold text-foreground">{filtered.length}</span> transação(ões) · período selecionado
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            className="gap-2 border-border/60 h-9 rounded-xl text-muted-foreground hover:text-foreground"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </Button>
          <Button
            size="sm"
            onClick={handleAdd}
            className="gap-2 h-9 rounded-xl shadow-lg shadow-primary/20 font-semibold"
          >
            <Plus className="w-4 h-4" />
            Nova transação
          </Button>
        </div>
      </div>

      {/* ── Metric Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Receitas */}
        <div className="group rounded-2xl border border-border/50 bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/5 hover:border-emerald-500/20">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Receitas</p>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/12 border border-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            </div>
          </div>
          <p className="text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totals.receitas)}
          </p>
          <div className="flex items-center gap-1 mt-2 text-[10px] text-emerald-600/60 dark:text-emerald-400/60">
            <ArrowUpRight className="w-3 h-3" />
            <span>{filtered.filter(t => t.type === 'receita').length} entrada(s)</span>
          </div>
        </div>

        {/* Despesas */}
        <div className="group rounded-2xl border border-border/50 bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-500/5 hover:border-red-500/20">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Despesas</p>
            <div className="w-8 h-8 rounded-xl bg-red-500/12 border border-red-500/20 flex items-center justify-center">
              <TrendingDown className="w-3.5 h-3.5 text-red-500" />
            </div>
          </div>
          <p className="text-xl font-bold tracking-tight text-red-600 dark:text-red-400">
            {formatCurrency(totals.despesas)}
          </p>
          <div className="flex items-center gap-1 mt-2 text-[10px] text-red-600/60 dark:text-red-400/60">
            <ArrowDownRight className="w-3 h-3" />
            <span>{filtered.filter(t => t.type === 'despesa').length} saída(s)</span>
          </div>
        </div>

        {/* Saldo */}
        <div className={`group rounded-2xl border border-border/50 bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${totals.saldo >= 0 ? 'hover:shadow-primary/5 hover:border-primary/20' : 'hover:shadow-orange-500/5 hover:border-orange-500/20'}`}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Saldo</p>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${totals.saldo >= 0 ? 'bg-primary/12 border-primary/20' : 'bg-orange-500/12 border-orange-500/20'}`}>
              <Wallet className={`w-3.5 h-3.5 ${totals.saldo >= 0 ? 'text-primary' : 'text-orange-500'}`} />
            </div>
          </div>
          <p className={`text-xl font-bold tracking-tight ${totals.saldo >= 0 ? 'text-primary' : 'text-orange-600 dark:text-orange-400'}`}>
            {formatCurrency(totals.saldo)}
          </p>
          <div className={`flex items-center gap-1 mt-2 text-[10px] ${totals.saldo >= 0 ? 'text-primary/60' : 'text-orange-500/60'}`}>
            {totals.saldo >= 0
              ? <><ArrowUpRight className="w-3 h-3" /><span>positivo</span></>
              : <><ArrowDownRight className="w-3 h-3" /><span>negativo</span></>
            }
          </div>
        </div>

        {/* Total */}
        <div className="group rounded-2xl border border-border/50 bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Total</p>
            <div className="w-8 h-8 rounded-xl bg-muted/60 border border-border/60 flex items-center justify-center">
              <Receipt className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
          </div>
          <p className="text-xl font-bold tracking-tight">
            {filtered.length}
          </p>
          <p className="text-[10px] text-muted-foreground/60 mt-2">transações filtradas</p>
        </div>
      </div>

      {/* ── Insights + Category Breakdown ───────────────────────── */}
      {filtered.length > 0 && (insights.length > 0 || categoryBreakdown.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* AI Insights */}
          {insights.length > 0 && (
            <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border/40">
                <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                </div>
                <p className="text-sm font-semibold">IA Insights</p>
                <span className="ml-auto text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary rounded-md px-2 py-0.5 border border-primary/15">
                  Ao vivo
                </span>
              </div>
              <div className="p-4 flex flex-col gap-3">
                {insights.map((insight, i) => {
                  const Icon = insightIcons[insight.type]
                  const s = insightStyles[insight.type]
                  return (
                    <div key={i} className={`flex items-start gap-3 rounded-xl border p-3.5 ${s.wrap}`}>
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${s.icon}`}>
                        <Icon className="w-3 h-3" />
                      </div>
                      <p className={`text-xs leading-relaxed ${s.text}`}>{insight.text}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Category Breakdown */}
          {categoryBreakdown.length > 0 && (
            <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border/40">
                <p className="text-sm font-semibold">Despesas por Categoria</p>
                <span className="ml-auto text-[10px] text-muted-foreground/60 bg-muted/50 rounded-lg px-2 py-0.5">
                  top {categoryBreakdown.length}
                </span>
              </div>
              <div className="p-5 flex flex-col gap-4">
                {categoryBreakdown.map(({ category, total, pct }) => {
                  const color = CATEGORY_COLORS[category]
                  const Icon = CATEGORY_ICONS[category]
                  return (
                    <div key={category} className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: color + '18', border: `1px solid ${color}30` }}
                      >
                        <Icon className="w-3.5 h-3.5" style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium">{category}</span>
                          <span className="text-xs font-semibold tabular-nums">{formatCurrency(total)}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted/60 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground/60 w-7 text-right shrink-0 tabular-nums">
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Filters ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
        {/* Filter header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border/40">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
            <Input
              placeholder="Buscar por descrição..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 rounded-xl bg-muted/30 border-border/50 text-sm placeholder:text-muted-foreground/40 focus-visible:ring-primary/20"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`gap-2 h-9 rounded-xl border-border/60 text-sm shrink-0 transition-colors ${showFilters ? 'bg-primary/10 border-primary/30 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filtros
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="gap-1.5 h-9 rounded-xl text-muted-foreground text-xs hover:text-foreground shrink-0"
            >
              <X className="w-3 h-3" />
              Limpar
            </Button>
          )}
        </div>

        {/* Expandable filter row */}
        {showFilters && (
          <div className="px-5 py-4 border-b border-border/30 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/20">
            <Select value={filterMonth} onValueChange={(v) => setFilterMonth(v ?? filterMonth)}>
              <SelectTrigger className="h-9 rounded-xl border-border/50 text-sm bg-card">
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
              <SelectTrigger className="h-9 rounded-xl border-border/50 text-sm bg-card">
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
              <SelectTrigger className="h-9 rounded-xl border-border/50 text-sm bg-card">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas categorias</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={(v) => setFilterType(v ?? filterType)}>
              <SelectTrigger className="h-9 rounded-xl border-border/50 text-sm bg-card">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tudo</SelectItem>
                <SelectItem value="receita">Receitas</SelectItem>
                <SelectItem value="despesa">Despesas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* ── Transaction List ───────────────────────────────────── */}
        <div className={`transition-opacity duration-200 ${isRefreshing ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          {isRefreshing ? (
            <>
              {[1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)}
            </>
          ) : filtered.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-14 h-14 rounded-2xl bg-muted/50 border border-border/40 flex items-center justify-center">
                <Receipt className="w-6 h-6 text-muted-foreground/40" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">Nenhuma transação encontrada</p>
                <p className="text-xs text-muted-foreground/60 mt-1 max-w-xs">
                  {hasActiveFilters
                    ? 'Tente ajustar ou limpar os filtros para ver mais resultados.'
                    : 'Comece adicionando sua primeira transação.'}
                </p>
              </div>
              {hasActiveFilters ? (
                <Button variant="outline" size="sm" onClick={clearFilters} className="gap-2 rounded-xl h-9 text-xs">
                  <X className="w-3.5 h-3.5" />
                  Limpar filtros
                </Button>
              ) : (
                <Button size="sm" onClick={handleAdd} className="gap-2 rounded-xl h-9 text-xs shadow-md shadow-primary/15">
                  <Plus className="w-3.5 h-3.5" />
                  Nova transação
                </Button>
              )}
            </div>
          ) : (
            /* Transaction rows */
            <div>
              {/* Table header — desktop only */}
              <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto_auto] items-center px-6 py-2.5 bg-muted/30 border-b border-border/30">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Transação</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 w-28 text-center">Data</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 w-20 text-center">Tipo</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 w-28 text-right">Valor</p>
                <p className="w-16" />
              </div>

              {filtered.map((t) => {
                const color = CATEGORY_COLORS[t.category as Category]
                const Icon = CATEGORY_ICONS[t.category as Category] ?? MoreHorizontal
                const isReceita = t.type === 'receita'
                const dateStr = format(new Date(t.date + 'T00:00:00'), "dd MMM yyyy", { locale: ptBR })

                return (
                  <div
                    key={t.id}
                    className="group flex items-center gap-4 px-5 sm:px-6 py-4 border-b border-border/25 last:border-0 hover:bg-muted/25 transition-colors duration-150"
                  >
                    {/* Category icon */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-105"
                      style={{
                        backgroundColor: color + '18',
                        border: `1px solid ${color}28`,
                      }}
                    >
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>

                    {/* Description + category */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{t.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md leading-none"
                          style={{ color, backgroundColor: color + '18' }}
                        >
                          {t.category}
                        </span>
                        <span className="text-[10px] text-muted-foreground/40 sm:hidden">· {dateStr}</span>
                      </div>
                    </div>

                    {/* Date — desktop */}
                    <p className="hidden sm:block text-xs text-muted-foreground/60 w-28 text-center tabular-nums shrink-0">
                      {dateStr}
                    </p>

                    {/* Type badge — desktop */}
                    <div className="hidden sm:flex w-20 justify-center shrink-0">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg leading-none ${
                        isReceita
                          ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/12 text-red-600 dark:text-red-400 border border-red-500/20'
                      }`}>
                        {isReceita ? 'Receita' : 'Despesa'}
                      </span>
                    </div>

                    {/* Amount */}
                    <p className={`text-sm font-bold tabular-nums w-28 text-right shrink-0 ${
                      isReceita
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {isReceita ? '+' : '−'}{formatCurrency(t.amount)}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150 shrink-0 w-16 justify-end">
                      <button
                        onClick={() => handleEdit(t)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-150"
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(t)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-150"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-3.5 bg-muted/20 border-t border-border/30">
                <p className="text-xs text-muted-foreground/60">
                  {filtered.length} {filtered.length === 1 ? 'transação' : 'transações'}
                </p>
                <button
                  onClick={exportCSV}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-primary transition-colors"
                >
                  <Download className="w-3 h-3" />
                  Exportar CSV
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Dialogs ─────────────────────────────────────────────── */}
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
