'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import {
  Wallet,
  LayoutDashboard,
  Receipt,
  LogOut,
  Target,
  FileBarChart,
  Sparkles,
  Settings,
  Upload,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/dashboard',    label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/transactions', label: 'Transações', icon: Receipt },
  { href: '/import',       label: 'Importar',   icon: Upload },
]

const comingSoonItems = [
  { label: 'Metas', icon: Target },
  { label: 'Relatórios', icon: FileBarChart },
  { label: 'IA Insights', icon: Sparkles },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-border/50 bg-sidebar h-screen sticky top-0 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-sidebar-border/60">
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 shrink-0">
          <Wallet className="w-4 h-4 text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm leading-tight text-sidebar-foreground">FinançasPro</span>
          <span className="text-[10px] text-muted-foreground/70 leading-tight font-medium uppercase tracking-widest">Premium</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 flex flex-col gap-1 overflow-y-auto">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-3 mb-2">
          Principal
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 shrink-0 transition-transform duration-150',
                  active ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-sidebar-foreground',
                  !active && 'group-hover:scale-105'
                )}
              />
              {label}
            </Link>
          )
        })}

        {/* Em breve */}
        <div className="mt-6">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-3 mb-2">
            Em breve
          </p>
          {comingSoonItems.map(({ label, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground/40 cursor-not-allowed select-none"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-muted/60 text-muted-foreground/60 rounded-md px-1.5 py-0.5">
                soon
              </span>
            </div>
          ))}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-5 flex flex-col gap-1 border-t border-sidebar-border/60 pt-4">
        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Settings className="w-4 h-4" />
            <span>Tema</span>
          </div>
          <ThemeToggle />
        </div>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent rounded-xl h-10 text-sm font-medium transition-all duration-150"
        >
          <LogOut className="w-4 h-4" />
          Sair da conta
        </Button>
      </div>
    </aside>
  )
}
