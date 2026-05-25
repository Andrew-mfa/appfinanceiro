'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Wallet, Loader2, ArrowRight, Shield, TrendingUp, PieChart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const features = [
  { icon: TrendingUp, text: 'Dashboard com IA financeira' },
  { icon: PieChart, text: 'Gráficos interativos por categoria' },
  { icon: Shield, text: 'Dados protegidos com criptografia' },
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('E-mail ou senha inválidos. Tente novamente.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] shrink-0 flex-col relative overflow-hidden bg-[oklch(0.072_0.004_264)] dark:bg-[oklch(0.055_0.004_264)]">
        {/* Gradient orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] rounded-full bg-primary/15 blur-[100px] animate-glow-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-violet-500/10 blur-[80px] animate-glow-pulse [animation-delay:1.5s]" />
          <div className="absolute inset-0 dot-grid opacity-15" />
        </div>

        <div className="relative flex flex-col h-full px-12 py-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-auto">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <Wallet className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-white text-lg">FinançasPro</span>
          </Link>

          {/* Content */}
          <div className="py-16">
            <h2 className="text-3xl xl:text-4xl font-bold text-white tracking-tight leading-tight mb-4">
              Controle financeiro
              <br />
              <span className="gradient-text">de nível premium.</span>
            </h2>
            <p className="text-white/50 text-base leading-relaxed mb-10 max-w-xs">
              Visualize, analise e otimize suas finanças com inteligência artificial e design que inspira.
            </p>

            <div className="flex flex-col gap-4">
              {features.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/8 border border-white/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm text-white/70">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 p-4 backdrop-blur-sm">
            <div className="flex -space-x-2">
              {['AC', 'RM', 'JA'].map((initials) => (
                <div
                  key={initials}
                  className="w-7 h-7 rounded-full bg-primary/30 border-2 border-white/10 flex items-center justify-center text-[9px] font-bold text-white"
                >
                  {initials}
                </div>
              ))}
            </div>
            <p className="text-xs text-white/60">
              <span className="text-white/80 font-semibold">+10.000 pessoas</span> já controlam suas finanças
            </p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-10">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/25">
            <Wallet className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold">FinançasPro</span>
        </div>

        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight mb-2">Bem-vindo de volta</h1>
            <p className="text-muted-foreground text-sm">
              Entre com sua conta para continuar
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <Alert variant="destructive" className="rounded-xl border-destructive/30 bg-destructive/8">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-sm font-medium">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-11 rounded-xl border-border/60 bg-card text-sm placeholder:text-muted-foreground/50 focus-visible:ring-primary/30"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Senha
                </Label>
                <span className="text-xs text-muted-foreground/60 hover:text-primary transition-colors cursor-pointer">
                  Esqueceu?
                </span>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="h-11 rounded-xl border-border/60 bg-card text-sm placeholder:text-muted-foreground/50 focus-visible:ring-primary/30"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-11 rounded-xl font-semibold shadow-lg shadow-primary/20 gap-2 mt-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar na conta
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/40" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-3 text-xs text-muted-foreground/50">ou</span>
            </div>
          </div>

          {/* Register */}
          <p className="text-center text-sm text-muted-foreground">
            Não tem conta?{' '}
            <Link
              href="/register"
              className="text-primary font-semibold hover:underline underline-offset-4 transition-colors"
            >
              Cadastre-se grátis
            </Link>
          </p>

          {/* Trust */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/50 mt-8">
            <Shield className="w-3.5 h-3.5" />
            <span>Seus dados estão protegidos e criptografados</span>
          </div>
        </div>
      </div>
    </div>
  )
}
