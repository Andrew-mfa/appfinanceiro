'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Wallet,
  Loader2,
  Mail,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Shield,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const perks = [
  'Grátis para sempre, sem pegadinhas',
  'Dados criptografados e seguros',
  'Sem cartão de crédito necessário',
  'Acesse de qualquer dispositivo',
]

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    })

    if (error) {
      setError(error.message === 'User already registered'
        ? 'Este e-mail já está cadastrado.'
        : 'Erro ao criar conta. Tente novamente.')
      setLoading(false)
      return
    }

    setRegisteredEmail(email)
    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="rounded-2xl border border-border/50 bg-card p-8 shadow-xl shadow-black/5 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/12 border border-primary/15 flex items-center justify-center mx-auto mb-5">
              <Mail className="w-7 h-7 text-primary" />
            </div>

            <h2 className="text-xl font-bold mb-2 tracking-tight">Confirme seu e-mail</h2>
            <p className="text-muted-foreground text-sm mb-5">
              Enviamos um link para:
            </p>
            <div className="bg-muted/60 rounded-xl px-4 py-3 mb-6 border border-border/40">
              <p className="font-semibold text-sm break-all">{registeredEmail}</p>
            </div>

            <div className="flex flex-col gap-3 mb-6 text-left">
              {[
                'Abra seu e-mail e procure uma mensagem do FinançasPro',
                'Clique em "Confirmar e-mail" dentro da mensagem',
                'Após confirmar, faça login com suas credenciais',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground">{step}</span>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-2.5 bg-amber-500/8 border border-amber-500/20 rounded-xl px-4 py-3 text-left mb-6">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Não encontrou? Verifique a pasta de <strong>Spam</strong> ou <strong>Lixo eletrônico</strong>.
              </p>
            </div>

            <Link href="/login">
              <Button className="w-full gap-2 h-11 rounded-xl font-semibold shadow-lg shadow-primary/20">
                Ir para o login
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            E-mail errado?{' '}
            <button
              onClick={() => setSuccess(false)}
              className="text-primary font-semibold hover:underline underline-offset-4"
            >
              Voltar e corrigir
            </button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] shrink-0 flex-col relative overflow-hidden bg-[oklch(0.072_0.004_264)] dark:bg-[oklch(0.055_0.004_264)]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 w-[400px] h-[400px] rounded-full bg-primary/15 blur-[100px] animate-glow-pulse" />
          <div className="absolute bottom-1/3 right-1/3 w-[300px] h-[300px] rounded-full bg-violet-500/10 blur-[80px] animate-glow-pulse [animation-delay:2s]" />
          <div className="absolute inset-0 dot-grid opacity-15" />
        </div>

        <div className="relative flex flex-col h-full px-12 py-12">
          <Link href="/" className="flex items-center gap-3 mb-auto">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <Wallet className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
            <span className="font-bold text-white text-lg">FinançasPro</span>
          </Link>

          <div className="py-16">
            <h2 className="text-3xl xl:text-4xl font-bold text-white tracking-tight leading-tight mb-4">
              Sua jornada financeira
              <br />
              <span className="gradient-text">começa agora.</span>
            </h2>
            <p className="text-white/50 text-base leading-relaxed mb-10 max-w-xs">
              Crie sua conta em menos de 30 segundos e comece a transformar sua relação com o dinheiro.
            </p>

            <div className="flex flex-col gap-3">
              {perks.map((perk) => (
                <div key={perk} className="flex items-center gap-3">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                  <span className="text-sm text-white/70">{perk}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/8 bg-white/4 p-4 backdrop-blur-sm">
            <p className="text-xs text-white/50 leading-relaxed">
              &ldquo;Finalmente um app financeiro que não parece uma planilha. Em 3 meses economizei mais de R$2.000.&rdquo;
            </p>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-6 h-6 rounded-full bg-primary/30 flex items-center justify-center text-[9px] font-bold text-white">
                RM
              </div>
              <p className="text-xs text-white/50">Rafael M. · Dev Sênior</p>
            </div>
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
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight mb-2">Crie sua conta</h1>
            <p className="text-muted-foreground text-sm">
              Grátis, para sempre. Sem cartão de crédito.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <Alert variant="destructive" className="rounded-xl border-destructive/30 bg-destructive/8">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-sm font-medium">E-mail</Label>
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
              <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="h-11 rounded-xl border-border/60 bg-card text-sm placeholder:text-muted-foreground/50 focus-visible:ring-primary/30"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirmar senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repita a senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
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
                  Criando conta...
                </>
              ) : (
                <>
                  Criar conta grátis
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground/60">
              Ao criar uma conta, você concorda com nossos Termos de Uso e Política de Privacidade.
            </p>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/40" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-3 text-xs text-muted-foreground/50">ou</span>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Já tem conta?{' '}
            <Link
              href="/login"
              className="text-primary font-semibold hover:underline underline-offset-4 transition-colors"
            >
              Entrar agora
            </Link>
          </p>

          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/50 mt-8">
            <Shield className="w-3.5 h-3.5" />
            <span>Dados protegidos com criptografia ponta a ponta</span>
          </div>
        </div>
      </div>
    </div>
  )
}
