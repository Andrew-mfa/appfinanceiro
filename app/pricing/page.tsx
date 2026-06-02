'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Check,
  X,
  ChevronDown,
  Wallet,
  Shield,
  Sparkles,
  Zap,
  Star,
  ArrowRight,
  CheckCircle2,
  Crown,
  Loader2,
  AlertCircle,
} from 'lucide-react'

const freeIncluded = [
  'Até 30 transações/mês',
  'Dashboard básico',
  '2 categorias personalizadas',
]

const freeExcluded = [
  'IA financeira',
  'Exportar relatórios',
  'Metas financeiras',
]

const proFeatures = [
  'Transações ilimitadas',
  'Dashboard completo',
  'Categorias ilimitadas',
  'IA financeira',
  'Exportar relatórios CSV',
  'Metas financeiras',
]

const ltdFeatures = [
  'Tudo do plano Pro',
  'Acesso vitalício',
  'Atualizações futuras',
  'Suporte prioritário',
]

const faqs = [
  {
    question: 'Posso cancelar a qualquer momento?',
    answer:
      'Sim, você pode cancelar sua assinatura a qualquer momento sem multa ou burocracia. O acesso permanece até o fim do período pago. Para o plano Free, não há nada para cancelar — é gratuito para sempre.',
  },
  {
    question: 'Por quanto tempo o plano Free é gratuito?',
    answer:
      'Para sempre. O plano Free não tem data de expiração, não vira trial e não requer cartão de crédito. Você pode usar gratuitamente por tempo ilimitado dentro dos limites do plano.',
  },
  {
    question: 'O que é o Lifetime Deal (LTD)?',
    answer:
      'O LTD é uma oferta de lançamento onde você paga uma única vez e tem acesso vitalício ao Moneto Pro, incluindo todas as atualizações futuras e suporte prioritário. É a melhor opção para quem quer o máximo sem mensalidade.',
  },
  {
    question: 'Quais formas de pagamento são aceitas?',
    answer:
      'Aceitamos cartão de crédito, débito, Pix e boleto bancário. Para assinaturas mensais/anuais, o pagamento é recorrente via cartão. O LTD pode ser pago via Pix ou cartão em parcela única.',
  },
]

export default function PricingPage() {
  const router = useRouter()
  const [annual, setAnnual] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [loading, setLoading] = useState<'pro' | 'ltd' | null>(null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  const proPrice = annual ? 'R$19' : 'R$24'
  const proNote = annual ? 'Cobrado R$228/ano' : 'Cobrado mensalmente'

  // Dispara checkout automático após login — lê plano do sessionStorage
  useEffect(() => {
    const pendingPlan = sessionStorage.getItem('pendingCheckout') as 'pro' | 'ltd' | null
    if (pendingPlan === 'pro' || pendingPlan === 'ltd') {
      sessionStorage.removeItem('pendingCheckout')
      handleCheckout(pendingPlan)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleCheckout(plan: 'pro' | 'ltd') {
    setLoading(plan)
    setCheckoutError(null)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, annual }),
      })

      if (res.status === 401) {
        sessionStorage.setItem('pendingCheckout', plan)
        router.push('/login')
        return
      }

      const data = await res.json()

      if (!res.ok) {
        setCheckoutError(data.error ?? 'Erro ao iniciar checkout. Tente novamente.')
        return
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        setCheckoutError('Erro: URL de checkout não retornada. Tente novamente.')
      }
    } catch {
      setCheckoutError('Erro de conexão. Verifique sua internet e tente novamente.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
              <Wallet className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-base tracking-tight">Moneto</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Entrar
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="shadow-lg shadow-primary/20 gap-1.5">
                Começar grátis
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-20 pb-14 px-6 mesh-bg">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-[#1D9E75]/6 blur-[100px] animate-glow-pulse [animation-delay:1.5s]" />
          <div className="absolute inset-0 dot-grid opacity-40 dark:opacity-20" />
        </div>

        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/80 backdrop-blur-sm px-4 py-1.5 text-sm mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#1D9E75]" />
            <span className="text-muted-foreground">Oferta de lançamento ativa</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-5">
            <span className="gradient-text-light dark:gradient-text">Invista no seu</span>
            <br />
            <span className="text-foreground">futuro financeiro.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
            Escolha o plano ideal. Comece grátis, faça upgrade quando precisar.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 bg-muted/60 border border-border/50 rounded-full p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                !annual
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                annual
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Anual
              <span className="text-xs bg-[#1D9E75]/15 text-[#1D9E75] px-2 py-0.5 rounded-full font-semibold">
                −21%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ── Erro de checkout ───────────────────────────────────────── */}
      {checkoutError && (
        <div className="max-w-2xl mx-auto px-6 -mt-4 mb-2">
          <div className="flex items-center gap-3 rounded-xl border border-destructive/40 bg-destructive/8 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {checkoutError}
          </div>
        </div>
      )}

      {/* ── Pricing cards ──────────────────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

            {/* Free */}
            <div className="card-premium p-7 flex flex-col">
              <div className="mb-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Free</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-bold tracking-tight">R$0</span>
                  <span className="text-muted-foreground pb-1">/mês</span>
                </div>
                <p className="text-xs text-muted-foreground">Para sempre, sem cartão de crédito</p>
              </div>

              <Link href="/register" className="block mb-7">
                <Button variant="outline" className="w-full rounded-xl h-11">
                  Criar conta grátis
                </Button>
              </Link>

              <div className="flex-1 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Incluso</p>
                {freeIncluded.map((f) => (
                  <div key={f} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#1D9E75]/12 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-[#1D9E75]" />
                    </div>
                    <span className="text-sm">{f}</span>
                  </div>
                ))}
                <div className="border-t border-border/40 pt-3 mt-4 space-y-3">
                  {freeExcluded.map((f) => (
                    <div key={f} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <X className="w-3 h-3 text-muted-foreground/60" />
                      </div>
                      <span className="text-sm text-muted-foreground/60 line-through">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pro — destaque */}
            <div className="relative rounded-[calc(var(--radius)*1.4)] border-2 border-[#1D9E75] bg-card p-7 flex flex-col shadow-[0_0_40px_#1D9E7528] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_56px_#1D9E7540]">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="inline-flex items-center gap-1.5 bg-[#1D9E75] text-white text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-lg shadow-[#1D9E75]/30">
                  <Star className="w-3 h-3 fill-white" />
                  Mais popular
                </span>
              </div>

              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-widest mb-3 text-[#1D9E75]">Pro</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-bold tracking-tight">{proPrice}</span>
                  <span className="text-muted-foreground pb-1">/mês</span>
                </div>
                <p className="text-xs text-muted-foreground">{proNote}</p>
                {annual && (
                  <p className="text-xs text-[#1D9E75] font-semibold mt-1">Economize R$60/ano</p>
                )}
              </div>

              <Button
                onClick={() => handleCheckout('pro')}
                disabled={loading !== null}
                className="w-full rounded-xl h-11 gap-1.5 text-white border-0 mb-7"
                style={{ backgroundColor: '#1D9E75' }}
              >
                {loading === 'pro' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>Assinar Pro <ArrowRight className="w-4 h-4" /></>
                )}
              </Button>

              <div className="flex-1 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Tudo incluso</p>
                {proFeatures.map((f) => (
                  <div key={f} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#1D9E75]/12 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-[#1D9E75]" />
                    </div>
                    <span className="text-sm font-medium">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* LTD */}
            <div className="card-premium p-7 flex flex-col relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/3 pointer-events-none" />

              <div className="relative flex flex-col flex-1">
                <div className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold px-3 py-1 rounded-full w-fit mb-4">
                  <Zap className="w-3 h-3" />
                  Oferta de lançamento
                </div>

                <div className="mb-6">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Lifetime</p>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-4xl font-bold tracking-tight">R$197</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Pagamento único, acesso para sempre</p>
                </div>

                <Button
                  variant="outline"
                  onClick={() => handleCheckout('ltd')}
                  disabled={loading !== null}
                  className="w-full rounded-xl h-11 gap-1.5 border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-500/5 mb-7"
                >
                  {loading === 'ltd' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>Garantir LTD <Crown className="w-4 h-4 text-amber-500" /></>
                  )}
                </Button>

                <div className="flex-1 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Tudo do Pro, mais:</p>
                  {ltdFeatures.map((f) => (
                    <div key={f} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-amber-500/12 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      </div>
                      <span className="text-sm font-medium">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Garantia ───────────────────────────────────────────────── */}
      <section className="py-14 px-6 border-y border-border/40 bg-muted/20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#1D9E75]/10 border border-[#1D9E75]/20 flex items-center justify-center mx-auto mb-5">
            <Shield className="w-7 h-7 text-[#1D9E75]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            Garantia de 7 dias
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-7">
            Experimente o Moneto Pro sem risco. Se não estiver satisfeito nos primeiros
            7 dias, devolvemos 100% do seu dinheiro. Sem perguntas, sem burocracia.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-muted-foreground">
            {['100% reembolso', 'Sem questionamentos', 'Processado em 24h'].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#1D9E75]" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-primary uppercase tracking-widest mb-4">FAQ</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Perguntas frequentes
            </h2>
            <p className="text-muted-foreground">
              Tudo que você precisa saber antes de assinar.
            </p>
          </div>

          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border border-border/50 bg-card overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left gap-4 hover:bg-muted/30 transition-colors duration-150"
                >
                  <span className="font-medium text-sm sm:text-base">{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                      openFaq === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 pt-4 text-sm text-muted-foreground leading-relaxed border-t border-border/40">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-border/40 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-sm">
                <Wallet className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="font-semibold">Moneto</span>
            </Link>
            <nav className="flex items-center gap-8 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Início</Link>
              <Link href="/login" className="hover:text-foreground transition-colors">Entrar</Link>
              <Link href="/register" className="hover:text-foreground transition-colors">Cadastrar</Link>
            </nav>
            <p className="text-xs text-muted-foreground/60">
              © {new Date().getFullYear()} Moneto.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
