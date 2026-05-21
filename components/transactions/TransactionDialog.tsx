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
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import { CATEGORIES, type Transaction, type TransactionType, type Category } from '@/types'
import { createClient } from '@/lib/supabase/client'

interface TransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction?: Transaction | null
  userId: string
  onSuccess: () => void
}

// Converte valor digitado em formato BR para número
// Aceita: "5.000", "5.000,50", "5000", "5000,50", "5,99"
function parseBRAmount(raw: string): number {
  const s = raw.trim()
  if (!s) return NaN

  // Se tem vírgula: ponto é separador de milhar, vírgula é decimal
  if (s.includes(',')) {
    const normalized = s.replace(/\./g, '').replace(',', '.')
    return parseFloat(normalized)
  }

  // Sem vírgula: ponto pode ser milhar (5.000) ou decimal (5.5)
  // Se tem ponto com exatamente 3 dígitos após → milhar (5.000 = 5000)
  // Caso contrário trata como decimal (5.5 = 5,50)
  if (s.includes('.')) {
    const parts = s.split('.')
    const lastPart = parts[parts.length - 1]
    if (lastPart.length === 3) {
      // ponto de milhar: remove todos os pontos
      return parseFloat(s.replace(/\./g, ''))
    }
    // ponto decimal (ex: 5.5)
    return parseFloat(s)
  }

  return parseFloat(s)
}

// Formata o número de volta para exibição no campo ao editar transação existente
function formatAmountForInput(amount: number): string {
  return amount.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const EMPTY_FORM = {
  description: '',
  amount: '',
  date: new Date().toISOString().split('T')[0],
  type: 'despesa' as TransactionType,
  category: '' as Category | '',
}

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

  // Permite apenas dígitos, ponto e vírgula no campo de valor
  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    // Permite: números, ponto (milhar) e vírgula (decimal)
    if (/^[\d.,]*$/.test(value)) {
      setForm({ ...form, amount: value })
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.category) {
      setError('Selecione uma categoria.')
      return
    }

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

    if (dbError) {
      setError('Erro ao salvar transação. Tente novamente.')
      return
    }

    onSuccess()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {transaction ? 'Editar transação' : 'Nova transação'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="type">Tipo</Label>
            <Select
              value={form.type}
              onValueChange={(v) => v && setForm({ ...form, type: v as TransactionType })}
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="receita">Receita</SelectItem>
                <SelectItem value="despesa">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex: Almoço no restaurante"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              maxLength={100}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="amount">
                Valor (R$)
              </Label>
              <Input
                id="amount"
                placeholder="Ex: 1.500,00"
                value={form.amount}
                onChange={handleAmountChange}
                required
                inputMode="text"
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground -mt-0.5">
                Use vírgula para centavos
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={form.category}
              onValueChange={(v) => v && setForm({ ...form, category: v as Category })}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                transaction ? 'Salvar alterações' : 'Adicionar'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
