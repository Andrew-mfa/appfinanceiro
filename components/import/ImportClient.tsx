'use client'

import { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Upload, FileText, CheckCircle2, AlertTriangle, ArrowLeft,
  Sparkles, TrendingUp, TrendingDown, Wallet, X, RefreshCw,
  FileSpreadsheet, ChevronRight, Download, Loader2,
  UtensilsCrossed, Car, Home, Music, Heart,
  GraduationCap, Briefcase, Laptop, MoreHorizontal,
} from 'lucide-react'
import { parseCSV } from '@/lib/parsers/csv-parser'
import { parseOFX } from '@/lib/parsers/ofx-parser'
import { parsePDF } from '@/lib/parsers/pdf-parser'
import { type ParsedTransaction } from '@/lib/parsers/types'
import { CATEGORIES, CATEGORY_COLORS, type Category } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/* ── Constants ─────────────────────────────────────────────────── */

const CATEGORY_ICONS: Record<Category, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Alimentação: UtensilsCrossed, Transporte: Car, Moradia: Home,
  Lazer: Music, Saúde: Heart, Educação: GraduationCap,
  Salário: Briefcase, Freelance: Laptop, Outros: MoreHorizontal,
}

type Step = 'upload' | 'preview' | 'success'

/* ── Sub-components ─────────────────────────────────────────────── */

function StepIndicator({ step }: { step: Step }) {
  const steps = [
    { key: 'upload',  label: 'Upload' },
    { key: 'preview', label: 'Revisão' },
    { key: 'success', label: 'Concluído' },
  ] as const

  const current = steps.findIndex((s) => s.key === step)

  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => {
        const done    = i < current
        const active  = i === current
        return (
          <div key={s.key} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 text-xs font-semibold transition-all ${
              active ? 'text-foreground' : done ? 'text-emerald-500' : 'text-muted-foreground/40'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                active
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30'
                  : done
                    ? 'bg-emerald-500 text-white'
                    : 'bg-muted/60 text-muted-foreground/40'
              }`}>
                {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className="hidden sm:block">{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-px w-8 sm:w-12 transition-colors ${done ? 'bg-emerald-500/50' : 'bg-border/40'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── Main component ─────────────────────────────────────────────── */

interface ImportClientProps {
  userId: string
}

export function ImportClient({ userId }: ImportClientProps) {
  const [step, setStep] = useState<Step>('upload')
  const [isDragging, setIsDragging] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([])
  const [importedCount, setImportedCount] = useState(0)

  const fileInputRef = useRef<HTMLInputElement>(null)

  /* ── File reading ─────────────────────────────────────────────── */

  const processFile = useCallback(async (file: File) => {
    const MAX_SIZE = 10 * 1024 * 1024 // 10 MB
    if (file.size > MAX_SIZE) { setError('Arquivo muito grande. Máximo 10 MB.'); return }

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['csv', 'ofx', 'qfx', 'pdf'].includes(ext ?? '')) {
      setError('Formato não suportado. Use arquivos .csv, .ofx ou .pdf')
      return
    }

    setError(null)
    setIsParsing(true)
    setFileName(file.name)
    setFileSize(file.size)

    try {
      await new Promise((r) => setTimeout(r, 600))

      let parsed: ParsedTransaction[] = []
      if (ext === 'csv') {
        parsed = parseCSV(await file.text())
      } else if (ext === 'pdf') {
        parsed = await parsePDF(await file.arrayBuffer())
      } else {
        parsed = parseOFX(await file.text())
      }

      if (parsed.length === 0) {
        setError('Nenhuma transação encontrada. Verifique se o arquivo está no formato correto.')
        setIsParsing(false)
        return
      }

      setTransactions(parsed)
      setStep('preview')
    } catch {
      setError('Erro ao processar o arquivo. Verifique se está no formato correto.')
    } finally {
      setIsParsing(false)
    }
  }, [])

  /* ── Drag & Drop ──────────────────────────────────────────────── */

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
  }, [])

  const onDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) await processFile(file)
  }, [processFile])

  const onFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) await processFile(file)
  }, [processFile])

  /* ── Category edit ────────────────────────────────────────────── */

  function updateCategory(id: string, category: Category) {
    setTransactions((prev) =>
      prev.map((t) => t.id === id ? { ...t, category } : t)
    )
  }

  /* ── Import ───────────────────────────────────────────────────── */

  async function handleImport() {
    setIsImporting(true)
    setError(null)

    try {
      const supabase = createClient()
      const payload = transactions.map((t) => ({
        description: t.description,
        amount:      t.amount,
        date:        t.date,
        type:        t.type,
        category:    t.category,
        user_id:     userId,
      }))

      // Insert in batches of 50
      const BATCH = 50
      for (let i = 0; i < payload.length; i += BATCH) {
        const { error: dbErr } = await supabase
          .from('transactions')
          .insert(payload.slice(i, i + BATCH))
        if (dbErr) throw dbErr
      }

      setImportedCount(transactions.length)
      setStep('success')
    } catch {
      setError('Erro ao salvar transações. Tente novamente.')
    } finally {
      setIsImporting(false)
    }
  }

  function reset() {
    setStep('upload')
    setTransactions([])
    setFileName('')
    setFileSize(0)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  /* ── Derived data ─────────────────────────────────────────────── */

  const totals = {
    receitas:   transactions.filter((t) => t.type === 'receita').reduce((a, t) => a + t.amount, 0),
    despesas:   transactions.filter((t) => t.type === 'despesa').reduce((a, t) => a + t.amount, 0),
    receCount:  transactions.filter((t) => t.type === 'receita').length,
    despCount:  transactions.filter((t) => t.type === 'despesa').length,
    autoCount:  transactions.filter((t) => t.category !== 'Outros').length,
  }

  /* ── Render ─────────────────────────────────────────────────── */

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Importar Extrato</h1>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Importe transações do seu banco automaticamente
          </p>
        </div>
        <StepIndicator step={step} />
      </div>

      {/* ── Error ───────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/6 p-4">
          <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-destructive/60 hover:text-destructive">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ══ STEP 1: UPLOAD ══════════════════════════════════════ */}
      {step === 'upload' && (
        <div className="space-y-5">
          {/* Drop zone */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => !isParsing && fileInputRef.current?.click()}
            className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer overflow-hidden
              ${isDragging
                ? 'border-primary bg-primary/8 scale-[1.01]'
                : 'border-border/50 hover:border-primary/40 hover:bg-muted/20'
              }
              ${isParsing ? 'pointer-events-none' : ''}
            `}
          >
            {/* Animated bg on drag */}
            {isDragging && (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-violet-500/5 animate-pulse" />
            )}

            <div className="relative flex flex-col items-center justify-center py-16 px-6 text-center">
              {isParsing ? (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-primary/12 border border-primary/20 flex items-center justify-center mb-5">
                    <Loader2 className="w-7 h-7 text-primary animate-spin" />
                  </div>
                  <p className="text-base font-semibold mb-1">Processando extrato...</p>
                  <p className="text-sm text-muted-foreground/60">Detectando transações e categorizando automaticamente</p>
                  <div className="flex items-center gap-1.5 mt-4">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs text-primary font-medium">IA categorização ativa</span>
                  </div>
                </>
              ) : (
                <>
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-all duration-200 ${
                    isDragging
                      ? 'bg-primary/20 border border-primary/30 scale-110'
                      : 'bg-muted/60 border border-border/50'
                  }`}>
                    <Upload className={`w-7 h-7 transition-colors ${isDragging ? 'text-primary' : 'text-muted-foreground/60'}`} />
                  </div>

                  <p className="text-base font-semibold mb-1">
                    {isDragging ? 'Solte o arquivo aqui' : 'Arraste seu extrato bancário'}
                  </p>
                  <p className="text-sm text-muted-foreground/60 mb-6">
                    ou clique para selecionar um arquivo do computador
                  </p>

                  {/* File type badges */}
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    {[
                      { ext: 'PDF', icon: FileText, desc: 'Extrato' },
                      { ext: 'CSV', icon: FileSpreadsheet, desc: 'Planilha' },
                      { ext: 'OFX', icon: FileText, desc: 'Open Finance' },
                      { ext: 'QFX', icon: FileText, desc: 'Quicken' },
                    ].map(({ ext, icon: Icon, desc }) => (
                      <div key={ext} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/50 bg-card text-xs font-semibold text-muted-foreground">
                        <Icon className="w-3.5 h-3.5" />
                        {ext}
                        <span className="text-muted-foreground/50 font-normal">{desc}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-[10px] text-muted-foreground/40 mt-4">Máximo 10 MB · Bradesco, Itaú, Nubank, Inter, C6 e outros</p>
                </>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.ofx,.qfx,.pdf"
              onChange={onFileChange}
              className="hidden"
            />
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Sparkles, title: 'IA Categorização', desc: 'Detecta automaticamente a categoria de cada transação com base na descrição.' },
              { icon: CheckCircle2, title: 'Seguro e privado', desc: 'Seu arquivo é processado localmente no navegador. Nunca enviamos para servidores.' },
              { icon: RefreshCw, title: 'Revisão antes de salvar', desc: 'Você vê e pode ajustar todas as transações antes de importar para o sistema.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-border/40 bg-card/50 p-4">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                </div>
                <p className="text-xs font-semibold mb-1">{title}</p>
                <p className="text-[11px] text-muted-foreground/70 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ STEP 2: PREVIEW ═════════════════════════════════════ */}
      {step === 'preview' && (
        <div className="space-y-5">
          {/* File info + summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* File info */}
            <div className="sm:col-span-2 lg:col-span-1 rounded-2xl border border-border/50 bg-card p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/12 border border-primary/20 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate">{fileName}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">{(fileSize / 1024).toFixed(1)} KB</p>
                <p className="text-[10px] text-primary font-semibold mt-1">{transactions.length} transações encontradas</p>
              </div>
            </div>

            {/* Receitas */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/70 dark:text-emerald-400/70 mb-2">Receitas</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totals.receitas)}</p>
              <p className="text-[10px] text-emerald-600/60 dark:text-emerald-400/60 mt-0.5">{totals.receCount} entrada(s)</p>
            </div>

            {/* Despesas */}
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-600/70 dark:text-red-400/70 mb-2">Despesas</p>
              <p className="text-lg font-bold text-red-600 dark:text-red-400">{formatCurrency(totals.despesas)}</p>
              <p className="text-[10px] text-red-600/60 dark:text-red-400/60 mt-0.5">{totals.despCount} saída(s)</p>
            </div>

            {/* IA */}
            <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-2">IA Categorização</p>
              <p className="text-lg font-bold text-primary">{totals.autoCount}</p>
              <p className="text-[10px] text-primary/60 mt-0.5">de {transactions.length} categorizadas</p>
            </div>
          </div>

          {/* AI badge */}
          {totals.autoCount > 0 && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-primary/15 bg-primary/5">
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
              <p className="text-xs text-primary/80">
                <span className="font-semibold">{totals.autoCount} transações</span> foram categorizadas automaticamente pela IA.
                Você pode ajustar individualmente abaixo.
              </p>
            </div>
          )}

          {/* Transaction list */}
          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            {/* Table header */}
            <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3 bg-muted/30 border-b border-border/30">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Transação</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 w-24 text-center">Data</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 w-36">Categoria</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 w-24 text-right">Valor</p>
            </div>

            <div className="divide-y divide-border/25 max-h-[480px] overflow-y-auto">
              {transactions.map((t) => {
                const color = CATEGORY_COLORS[t.category]
                const Icon  = CATEGORY_ICONS[t.category] ?? MoreHorizontal
                const isRec = t.type === 'receita'
                return (
                  <div key={t.id} className="group flex flex-col sm:grid sm:grid-cols-[1fr_auto_auto_auto] sm:gap-4 items-start sm:items-center px-5 py-3.5 hover:bg-muted/20 transition-colors">
                    {/* Description */}
                    <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                      <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center" style={{ backgroundColor: color + '18', border: `1px solid ${color}28` }}>
                        <Icon className="w-3.5 h-3.5" style={{ color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{t.description}</p>
                        <div className="flex items-center gap-2 mt-0.5 sm:hidden">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isRec ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/12 text-red-600 dark:text-red-400'}`}>
                            {isRec ? 'Receita' : 'Despesa'}
                          </span>
                          <span className={`text-xs font-bold tabular-nums ${isRec ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                            {isRec ? '+' : '−'}{formatCurrency(t.amount)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Date */}
                    <p className="hidden sm:block text-xs text-muted-foreground/60 w-24 text-center tabular-nums shrink-0">
                      {format(new Date(t.date + 'T00:00:00'), 'dd/MM/yy', { locale: ptBR })}
                    </p>

                    {/* Category select */}
                    <div className="w-full sm:w-36 mt-2 sm:mt-0">
                      <Select value={t.category} onValueChange={(v) => updateCategory(t.id, v as Category)}>
                        <SelectTrigger className="h-7 rounded-lg text-[11px] border-border/40 bg-muted/20 px-2 w-full">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat} className="text-xs">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
                                {cat}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Amount */}
                    <p className={`hidden sm:block text-sm font-bold tabular-nums w-24 text-right shrink-0 ${
                      isRec ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {isRec ? '+' : '−'}{formatCurrency(t.amount)}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Action row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <Button
              variant="ghost"
              onClick={reset}
              className="gap-2 text-muted-foreground hover:text-foreground rounded-xl h-10 w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Carregar outro arquivo
            </Button>

            <Button
              onClick={handleImport}
              disabled={isImporting}
              className="gap-2 h-10 rounded-xl font-semibold shadow-lg shadow-primary/20 w-full sm:w-auto px-8"
            >
              {isImporting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Importando...</>
              ) : (
                <><Download className="w-4 h-4" /> Importar {transactions.length} transações</>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* ══ STEP 3: SUCCESS ═════════════════════════════════════ */}
      {step === 'success' && (
        <div className="flex flex-col items-center text-center py-12 gap-6">
          {/* Success icon */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-emerald-500/12 border border-emerald-500/20 flex items-center justify-center shadow-xl shadow-emerald-500/15">
              <CheckCircle2 className="w-9 h-9 text-emerald-500" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-md shadow-primary/30">
              <Sparkles className="w-3 h-3 text-primary-foreground" />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">Importação concluída!</h2>
            <p className="text-muted-foreground text-sm max-w-sm">
              <span className="font-semibold text-foreground">{importedCount} transações</span> foram importadas com sucesso e já aparecem no seu dashboard.
            </p>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
            <div className="rounded-xl border border-border/50 bg-card p-3 text-center">
              <TrendingUp className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totals.receitas)}</p>
              <p className="text-[10px] text-muted-foreground/60">Receitas</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card p-3 text-center">
              <TrendingDown className="w-4 h-4 text-red-500 mx-auto mb-1" />
              <p className="text-sm font-bold text-red-600 dark:text-red-400">{formatCurrency(totals.despesas)}</p>
              <p className="text-[10px] text-muted-foreground/60">Despesas</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card p-3 text-center">
              <Wallet className={`w-4 h-4 mx-auto mb-1 ${totals.receitas - totals.despesas >= 0 ? 'text-primary' : 'text-orange-500'}`} />
              <p className={`text-sm font-bold ${totals.receitas - totals.despesas >= 0 ? 'text-primary' : 'text-orange-600 dark:text-orange-400'}`}>
                {formatCurrency(totals.receitas - totals.despesas)}
              </p>
              <p className="text-[10px] text-muted-foreground/60">Saldo</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={reset}
              className="gap-2 rounded-xl h-10 border-border/60"
            >
              <Upload className="w-4 h-4" />
              Importar outro arquivo
            </Button>
            <a href="/transactions">
              <Button className="gap-2 h-10 rounded-xl font-semibold shadow-lg shadow-primary/20 w-full sm:w-auto">
                Ver transações
                <ChevronRight className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
