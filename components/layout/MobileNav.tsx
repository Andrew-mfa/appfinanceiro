'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ThemeToggle } from '@/components/ThemeToggle'
import {
  Wallet,
  LayoutDashboard,
  Receipt,
  LogOut,
  Menu,
  Target,
  FileBarChart,
  Sparkles,
  Settings,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transações', icon: Receipt },
]

const comingSoonItems = [
  { label: 'Metas', icon: Target },
  { label: 'Relatórios', icon: FileBarChart },
  { label: 'IA Insights', icon: Sparkles },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="md:hidden sticky top-0 z-40 flex items-center justify-between h-15 px-4 border-b border-border/50 bg-sidebar/90 backdrop-blur-xl">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/25">
          <Wallet className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm leading-none">FinançasPro</span>
          <span className="text-[9px] text-muted-foreground/60 uppercase tracking-widest">Premium</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <ThemeToggle />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className="inline-flex items-center justify-center rounded-xl w-9 h-9 text-sm transition-colors hover:bg-accent text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </SheetTrigger>

          <SheetContent side="left" className="w-72 p-0 border-r border-border/50 bg-sidebar">
            {/* Sheet header */}
            <div className="flex items-center justify-between px-5 h-16 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
                  <Wallet className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-bold text-sm leading-none">FinançasPro</p>
                  <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest">Premium</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-5 flex flex-col gap-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-3 mb-2">
                Principal
              </p>
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = pathname === href
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                      active
                        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                    )}
                  >
                    <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-primary-foreground' : 'text-muted-foreground')} />
                    {label}
                  </Link>
                )
              })}

              <div className="mt-6">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-3 mb-2">
                  Em breve
                </p>
                {comingSoonItems.map(({ label, icon: Icon }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground/40 cursor-not-allowed"
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

            {/* Bottom */}
            <div className="px-3 pb-5 flex flex-col gap-1 border-t border-border/50 pt-4">
              <div className="flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Settings className="w-4 h-4" />
                  <span>Tema</span>
                </div>
                <ThemeToggle />
              </div>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent rounded-xl h-10 text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sair da conta
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
