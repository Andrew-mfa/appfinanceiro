'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  UtensilsCrossed,
  Car,
  Home,
  Music,
  Heart,
  GraduationCap,
  Briefcase,
  Laptop,
  MoreHorizontal,
} from 'lucide-react'
import { CATEGORIES, CATEGORY_COLORS, type Transaction, type TransactionType, type Category } from '@/types'
import { createClient } from '@/lib/supabase/client'

/* ── Parsers ────────────────────────────────────────────────────── */

function parseBRAmount(raw: string): number {
  const s = raw.trim()
  if (!s) return NaN
  if (s.includes(',')) return parseFloat(s.replace(/\./g, '').replace(',', '.'))
  if (s.includes('.')) {
    const parts = s.split('.')
    if (parts[parts.length - 1].length === 3) return parseFloat(s.replace(/\./g, ''))
    return parseFloat(s)
  }
  return parseFloat(s)
}

function formatAmountForInput(amount: number): string {
  return amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/* ── Category icon map ──────────────────────────────────────────── */

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

interface TransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction?: Transaction | null
  userId: string
  onSuccess: () => void
}

const EMPTY_FORM = {
  description: '',
  amount: '',
  date: new Date().toISOString().split('T')[0],
  type: 'despesa' as TransactionType,
  category: '' as Category | '',
}

/* ── Component ──────────────────────────────────────────────────── */

export function TransactionDialog({
  open,
  onOpenChange,
  transaction,
  userId,
  onSuccess,
}: TransactionDialogProps) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (transaction) {
      setForm({
        description: transaction.description,
        amount: formatAmountForInput(Number(transaction.amount)),
        date: transaction.date,
        type: transaction.type,
        category: transaction.category,
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setError('')
  }, [transaction, open])

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    if (/^[\d.,]*$/.test(value)) setForm({ ...form, amount: value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.category) { setError('Selecione uma categoria.'); return }

    const amount = parseBRAmount(form.amount)
    if (isNaN(amount) || amount <= 0) {
      setError('Informe um valor válido maior que zero. Ex: 1.500,00 ou 150,99')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const payload = {
      description: form.description.trim(),
      amount,
      date: form.date,
      type: form.type,
      category: form.category,
      user_id: userId,
    }

    const { error: dbError } = transaction
      ? await supabase.from('transactions').update(payload).eq('id', transaction.id)
      : await supabase.from('transactions').insert(payload)

    setLoading(false)
    if (dbError) { setError('Erro ao salvar transação. Tente novamente.'); return }

    onSuccess()
    onOpenChange(false)
  }

  const isReceita = form.type === 'receita'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl border border-border/60 shadow-2xl shadow-black/10 p-0 gap-0 overflow-hidden">
        {/* Header with type indicator */}
        <div className={`px-6 pt-6 pb-5 border-b border-border/40 ${isReceita ? 'bg-emerald-500/4' : 'bg-red-500/4'}`}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-base font-semibold">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                isReceita
                  ? 'bg-emerald-500/12 border-emerald-500/20'
                  : 'bg-red-500/12 border-red-500/20'
              }`}>
                {isReceita
                  ? <TrendingUp className="w-4 h-4 text-emerald-500" />
                  : <TrendingDown className="w-4 h-4 text-red-500" />
                }
              </div>
              {transaction ? 'Editar transação' : 'Nova transação'}
            </DialogTitle>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-6 py-5">
          {error && (
            <Alert variant="destructive" className="rounded-xl border-destructive/30 bg-destructive/8 py-3">
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          {/* Type toggle */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              Tipo
            </Label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted/50 rounded-xl border border-border/40">
              {(['despesa', 'receita'] as TransactionType[]).map((type) => {
                const active = form.type === type
                const isRec = type === 'receita'
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm({ ...form, type })}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-150 ${
                      active
                        ? isRec
                          ? 'bg-card shadow-sm text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-card shadow-sm text-red-600 dark:text-red-400 border border-red-500/20'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {isRec
                      ? <TrendingUp className="w-3.5 h-3.5" />
                      : <TrendingDown className="w-3.5 h-3.5" />
                    }
                    {isRec ? 'Receita' : 'Despesa'}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              Descrição
            </Label>
            <Input
              id="description"
              placeholder="Ex: Almoço no restaurante"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              maxLength={100}
              className="h-10 rounded-xl border-border/60 bg-muted/20 text-sm placeholder:text-muted-foreground/40 focus-visible:ring-primary/20"
            />
          </div>

          {/* Amount + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="amount" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                Valor (R$)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/60 font-medium">R$</span>
                <Input
                  id="amount"
                  placeholder="0,00"
                  value={form.amount}
                  onChange={handleAmountChange}
                  required
                  inputMode="text"
                  autoComplete="off"
                  className="h-10 rounded-xl border-border/60 bg-muted/20 text-sm pl-8 placeholder:text-muted-foreground/40 focus-visible:ring-primary/20 font-mono"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="date" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                Data
              </Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
                className="h-10 rounded-xl border-border/60 bg-muted/20 text-sm focus-visible:ring-primary/20"
              />
            </div>
          </div>

          {/* Category — visual grid */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              Categoria
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const color = CATEGORY_COLORS[cat]
                const Icon = CATEGORY_ICONS[cat]
                const active = form.category === cat
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat })}
                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-[10px] font-semibold transition-all duration-150 ${
                      active
                        ? 'shadow-sm scale-[1.02]'
                        : 'border-border/40 hover:border-border text-muted-foreground hover:text-foreground bg-muted/20 hover:bg-muted/40'
                    }`}
                    style={active ? {
                      backgroundColor: color + '12',
                      borderColor: color + '40',
                      color,
                    } : undefined}
                  >
                    <Icon className="w-4 h-4" style={active ? { color } : undefined} />
                    {cat}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1 h-10 rounded-xl border-border/60 text-sm"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className={`flex-1 h-10 rounded-xl text-sm font-semibold shadow-lg gap-2 ${
                isReceita ? 'shadow-emerald-500/15' : 'shadow-primary/15'
              }`}
            >
              {loading ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Salvando...</>
              ) : (
                transaction ? 'Salvar alterações' : 'Adicionar'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
