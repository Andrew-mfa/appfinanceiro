import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  PieChart,
  Shield,
  Download,
  Smartphone,
  BarChart2,
  ArrowRight,
  CheckCircle2,
  Wallet,
} from 'lucide-react'

const features = [
  {
    icon: BarChart2,
    title: 'Dashboard Visual',
    description: 'Veja receitas, despesas e saldo em tempo real com gráficos interativos.',
  },
  {
    icon: PieChart,
    title: 'Gráficos por Categoria',
    description: 'Entenda onde seu dinheiro vai com gráficos de pizza por categoria.',
  },
  {
    icon: Shield,
    title: 'Seguro e Privado',
    description: 'Seus dados protegidos com autenticação Supabase e Row Level Security.',
  },
  {
    icon: Download,
    title: 'Exportar CSV',
    description: 'Exporte suas transações filtradas para planilhas com um clique.',
  },
  {
    icon: Smartphone,
    title: 'Responsivo',
    description: 'Acesse do celular, tablet ou desktop com layout adaptável.',
  },
  {
    icon: TrendingUp,
    title: 'Filtros Avançados',
    description: 'Filtre por mês, categoria ou busque por descrição.',
  },
]

const categories = [
  'Alimentação', 'Transporte', 'Moradia', 'Lazer',
  'Saúde', 'Educação', 'Salário', 'Freelance', 'Outros',
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Wallet className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">FinançasPro</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Criar conta grátis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-20 pb-16 px-4 sm:px-6 text-center max-w-6xl mx-auto">
        <Badge variant="secondary" className="mb-6">
          Gestão Financeira Pessoal
        </Badge>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
          Controle suas finanças{' '}
          <span className="text-primary">de forma simples</span>{' '}
          e visual
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Registre receitas e despesas, visualize categorias em gráficos e tenha uma visão
          consolidada do seu dinheiro — tudo em um único lugar.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/register">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              Começar agora — é grátis
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Já tenho conta
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-muted/30 border-y border-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-3xl font-bold text-primary">9</p>
            <p className="text-sm text-muted-foreground mt-1">Categorias</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">100%</p>
            <p className="text-sm text-muted-foreground mt-1">Gratuito</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">RLS</p>
            <p className="text-sm text-muted-foreground mt-1">Seus dados, só seus</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold mb-3">Tudo que você precisa</h2>
          <p className="text-muted-foreground text-lg">
            Ferramentas simples e poderosas para organizar suas finanças pessoais.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="rounded-xl border border-border/60 bg-card p-6 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-muted/30 border-y border-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-bold mb-3">Categorias pré-definidas</h2>
          <p className="text-muted-foreground mb-8">
            Organize suas transações nas categorias mais comuns do dia a dia.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <Badge key={cat} variant="secondary" className="text-sm px-3 py-1">
                {cat}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold mb-3">Como funciona</h2>
          <p className="text-muted-foreground text-lg">Em 3 passos simples.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Crie sua conta', desc: 'Cadastre-se com e-mail e senha em segundos.' },
            { step: '02', title: 'Registre transações', desc: 'Adicione receitas e despesas com descrição, valor e categoria.' },
            { step: '03', title: 'Visualize no dashboard', desc: 'Acompanhe gráficos, resumos e exporte relatórios em CSV.' },
          ].map((item) => (
            <div key={item.step} className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-primary font-bold text-lg">{item.step}</span>
              </div>
              <h3 className="font-semibold mb-2 text-lg">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 bg-primary text-primary-foreground">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Comece a controlar suas finanças hoje</h2>
          <p className="text-primary-foreground/80 mb-8 text-lg">
            Grátis, seguro e sem complicações. Seus dados ficam só com você.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="gap-2">
              Criar conta grátis
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-primary-foreground/70">
            <CheckCircle2 className="w-4 h-4" />
            Sem cartão de crédito necessário
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-4 sm:px-6 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
            <Wallet className="w-3 h-3 text-primary-foreground" />
          </div>
          <span className="font-medium text-foreground">FinançasPro</span>
        </div>
        <p>© {new Date().getFullYear()} FinançasPro. Feito com Next.js, Supabase e shadcn/ui.</p>
      </footer>
    </div>
  )
}
