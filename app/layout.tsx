import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/ThemeProvider'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Moneto — Gestão Financeira Pessoal com IA',
  description: 'O controle financeiro mais elegante do Brasil. Gerencie receitas, despesas e metas com inteligência artificial. Comece grátis.',
  metadataBase: new URL('https://moneto-kappa.vercel.app'),
  openGraph: {
    title: 'Moneto — Gestão Financeira com IA',
    description: 'Controle suas finanças com um dashboard bonito, insights de IA e relatórios automáticos. Plano gratuito disponível.',
    url: 'https://moneto-kappa.vercel.app',
    siteName: 'Moneto',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Moneto — Gestão Financeira com IA',
    description: 'Controle suas finanças com dashboard bonito e insights de IA. Comece grátis.',
  },
  keywords: ['finanças pessoais', 'controle financeiro', 'gestão financeira', 'app financeiro', 'dashboard financeiro', 'IA financeira'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
