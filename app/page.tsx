import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  PieChart,
  Shield,
  Download,
  Smartphone,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Wallet,
  Sparkles,
  Target,
  Brain,
  Zap,
  Lock,
  Star,
  ArrowUpRight,
} from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'IA Financeira',
    description: 'Insights automáticos baseados nos seus padrões de gasto. Entenda seu dinheiro em segundos.',
    gradient: 'from-violet-500/20 to-purple-500/10',
    iconColor: 'text-violet-400',
    iconBg: 'bg-violet-500/15',
  },
  {
    icon: BarChart3,
    title: 'Dashboard Pro',
    description: 'Visualize receitas, despesas e saldo em tempo real com gráficos interativos e elegantes.',
    gradient: 'from-blue-500/20 to-cyan-500/10',
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/15',
  },
  {
    icon: Lock,
    title: 'Segurança Total',
    description: 'Seus dados protegidos com Row Level Security, autenticação robusta e criptografia ponta a ponta.',
    gradient: 'from-emerald-500/20 to-teal-500/10',
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/15',
  },
  {
    icon: Download,
    title: 'Relatórios',
    description: 'Exporte relatórios completos em CSV com filtros avançados. Seus dados sempre disponíveis.',
    gradient: 'from-orange-500/20 to-amber-500/10',
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-500/15',
  },
  {
    icon: Target,
    title: 'Metas Financeiras',
    description: 'Defina objetivos, acompanhe o progresso e celebre cada conquista no seu caminho financeiro.',
    gradient: 'from-pink-500/20 to-rose-500/10',
    iconColor: 'text-pink-400',
    iconBg: 'bg-pink-500/15',
  },
  {
    icon: Smartphone,
    title: 'Multi-Plataforma',
    description: 'Acesse do celular, tablet ou desktop. Interface adaptável com experiência consistente.',
    gradient: 'from-indigo-500/20 to-blue-500/10',
    iconColor: 'text-indigo-400',
    iconBg: 'bg-indigo-500/15',
  },
]

const stats = [
  { value: '10k+', label: 'Usuários ativos' },
  { value: 'R$50M+', label: 'Gerenciados' },
  { value: '4.9★', label: 'Avaliação média' },
  { value: '99.9%', label: 'Uptime garantido' },
]

const steps = [
  {
    number: '01',
    title: 'Crie sua conta',
    description: 'Cadastre-se em menos de 30 segundos. Sem cartão de crédito, sem pegadinhas.',
    icon: Zap,
  },
  {
    number: '02',
    title: 'Registre transações',
    description: 'Adicione receitas e despesas por categoria. Interface rápida e intuitiva.',
    icon: PieChart,
  },
  {
    number: '03',
    title: 'Receba insights',
    description: 'A IA analisa seus padrões e entrega insights personalizados para sua vida financeira.',
    icon: Sparkles,
  },
]

const testimonials = [
  {
    name: 'Ana Costa',
    role: 'Designer Freelancer',
    text: 'Finalmente um app financeiro que não parece uma planilha dos anos 90. O dashboard é incrível.',
    avatar: 'AC',
    stars: 5,
  },
  {
    name: 'Rafael Mendes',
    role: 'Desenvolvedor Sênior',
    text: 'A clareza dos gráficos mudou a forma como vejo meus gastos. Em 3 meses economizei R$2.000.',
    avatar: 'RM',
    stars: 5,
  },
  {
    name: 'Juliana Alves',
    role: 'Empreendedora',
    text: 'Uso para separar finanças pessoais das do negócio. Simples, rápido e extremamente bonito.',
    avatar: 'JA',
    stars: 5,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── Header ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
              <Wallet className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-base tracking-tight">FinançasPro</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Funcionalidades</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">Como funciona</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Depoimentos</a>
          </nav>
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

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-28 pb-24 px-6 mesh-bg">
        {/* Background orbs */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-violet-500/6 blur-[100px] animate-glow-pulse [animation-delay:1.5s]" />
          <div className="absolute inset-0 dot-grid opacity-40 dark:opacity-20" />
        </div>

        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/80 backdrop-blur-sm px-4 py-1.5 text-sm mb-10 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-muted-foreground">Novo:</span>
            <span className="font-medium text-foreground">Insights com IA financeira</span>
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tighter leading-none mb-6">
            <span className="gradient-text-light dark:gradient-text">
              Suas finanças,
            </span>
            <br />
            <span className="text-foreground">reinventadas.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            O controle financeiro mais elegante do Brasil. Gerencie receitas, despesas e metas
            com a inteligência que você merece.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Link href="/register">
              <Button
                size="lg"
                className="gap-2 text-base px-8 h-12 shadow-xl shadow-primary/25 rounded-xl font-semibold w-full sm:w-auto"
              >
                Começar grátis agora
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 h-12 rounded-xl font-medium border-border/60 w-full sm:w-auto"
              >
                Já tenho conta
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-muted-foreground">
            {[
              { icon: CheckCircle2, text: 'Sem cartão de crédito' },
              { icon: CheckCircle2, text: 'Grátis para sempre' },
              { icon: Shield, text: 'Dados criptografados' },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-1.5">
                <Icon className="w-4 h-4 text-emerald-500" />
                {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────── */}
      <section className="border-y border-border/40 py-10 bg-muted/20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label} className="group">
                <p className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────── */}
      <section id="features" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-primary uppercase tracking-widest mb-4">
              Funcionalidades
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-5">
              Tudo que você precisa,
              <br />
              <span className="text-muted-foreground font-normal">nada que você não precisa.</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Ferramentas poderosas com design minimalista para organizar sua vida financeira.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className={`group relative rounded-2xl border border-border/50 bg-card p-7 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-border`}
                >
                  {/* Gradient bg on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                  <div className="relative">
                    <div className={`w-11 h-11 rounded-xl ${feature.iconBg} flex items-center justify-center mb-5`}>
                      <Icon className={`w-5 h-5 ${feature.iconColor}`} />
                    </div>
                    <h3 className="font-semibold text-base mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────── */}
      <section id="how-it-works" className="py-28 px-6 bg-muted/20 border-y border-border/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-primary uppercase tracking-widest mb-4">
              Como funciona
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-5">
              Simples do início ao fim.
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Do cadastro aos insights, em menos de 5 minutos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden sm:block absolute top-8 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <div key={step.number} className="flex flex-col items-center text-center relative">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-card border border-border/60 flex items-center justify-center shadow-lg shadow-black/5">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <span className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-sm">
                      {i + 1}
                    </span>
                  </div>
                  <div className="inline-block text-xs font-mono text-muted-foreground/60 mb-2">
                    {step.number}
                  </div>
                  <h3 className="font-semibold text-base mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{step.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────── */}
      <section id="testimonials" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-primary uppercase tracking-widest mb-4">
              Depoimentos
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-5">
              Quem usa, aprova.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border border-border/50 bg-card p-7 flex flex-col gap-5 hover:border-border transition-colors duration-200"
              >
                {/* Stars */}
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground flex-1">
                  &ldquo;{t.text}&rdquo;
                </p>

                <div className="flex items-center gap-3 pt-2 border-t border-border/40">
                  <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────── */}
      <section className="py-28 px-6 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-violet-500/8" />
          <div className="absolute inset-0 dot-grid opacity-30 dark:opacity-15" />
        </div>

        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-primary/10">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-5">
            Comece sua jornada
            <br />financeira hoje.
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Junte-se a mais de 10.000 pessoas que já transformaram sua relação com o dinheiro.
            Grátis, seguro, sem complicações.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Link href="/register">
              <Button
                size="lg"
                className="gap-2 text-base px-10 h-12 rounded-xl font-semibold shadow-xl shadow-primary/25 w-full sm:w-auto"
              >
                Criar conta grátis
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            {[
              { icon: CheckCircle2, text: 'Sem cartão de crédito' },
              { icon: CheckCircle2, text: 'Cancele quando quiser' },
              { icon: Shield, text: 'Dados seguros por padrão' },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-1.5">
                <Icon className="w-4 h-4 text-emerald-500" />
                {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-border/40 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-sm">
                <Wallet className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="font-semibold">FinançasPro</span>
            </div>

            <nav className="flex items-center gap-8 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">Funcionalidades</a>
              <a href="#how-it-works" className="hover:text-foreground transition-colors">Como funciona</a>
              <Link href="/login" className="hover:text-foreground transition-colors">Entrar</Link>
            </nav>

            <p className="text-xs text-muted-foreground/60">
              © {new Date().getFullYear()} FinançasPro. Feito com Next.js e Supabase.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
