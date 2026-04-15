'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Wrench,
  FileText,
  Receipt,
  Calendar,
  Settings,
  Building2,
  Upload,
  UsersRound,
  X,
  Menu,
  BarChart3,
} from 'lucide-react'

export const navItems = [
  { href: '/dashboard',            label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/dashboard/clients',    label: 'Clients',         icon: Users },
  { href: '/dashboard/missions',   label: 'Missions',        icon: Wrench },
  { href: '/dashboard/devis',      label: 'Devis',           icon: FileText },
  { href: '/dashboard/factures',   label: 'Factures',        icon: Receipt },
  { href: '/dashboard/kpis',       label: 'KPIs',            icon: BarChart3 },
  { href: '/dashboard/planning',   label: 'Planning',        icon: Calendar },
  { href: '/dashboard/equipe',     label: 'Équipe',          icon: UsersRound },
]

const bottomItems = [
  { href: '/dashboard/import',   label: 'Importer',   icon: Upload },
  { href: '/dashboard/settings', label: 'Paramètres', icon: Settings },
]

function NavLink({
  href, label, icon: Icon, pathname, onClick,
}: { href: string; label: string; icon: React.ElementType; pathname: string; onClick?: () => void }) {
  const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
        isActive
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {label}
    </Link>
  )
}

/* ── Sidebar desktop (md+) ─────────────────────────────────────── */
export function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Fermer le drawer quand la route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  // Bloquer le scroll body quand le drawer est ouvert
  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const sidebarContent = (onClick?: () => void) => (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-none">Business OS</p>
            <p className="text-xs text-gray-400 mt-0.5">Espace de travail</p>
          </div>
        </div>
        {/* Bouton fermer (mobile seulement) */}
        {onClick && (
          <button onClick={onClick} className="md:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(item => (
          <NavLink key={item.href} {...item} pathname={pathname} onClick={onClick} />
        ))}
      </nav>

      {/* Bas */}
      <div className="p-3 border-t border-gray-200 space-y-0.5">
        {bottomItems.map(item => (
          <NavLink key={item.href} {...item} pathname={pathname} onClick={onClick} />
        ))}
      </div>
    </>
  )

  return (
    <>
      {/* ── Bouton hamburger (visible uniquement mobile) ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3.5 left-4 z-40 p-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 shadow-sm"
        aria-label="Menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* ── Overlay mobile ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Drawer mobile ── */}
      <div className={cn(
        'md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {sidebarContent(() => setMobileOpen(false))}
      </div>

      {/* ── Sidebar desktop fixe ── */}
      <div className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col shrink-0">
        {sidebarContent()}
      </div>
    </>
  )
}

/* ── Bottom nav mobile (affiché en bas sur petits écrans) ─────── */
export function BottomNav() {
  const pathname = usePathname()
  const mainItems = navItems.slice(0, 5) // dashboard, clients, missions, devis, factures

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-200 flex items-stretch safe-area-inset-bottom">
      {mainItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
              isActive ? 'text-blue-600' : 'text-gray-400'
            )}
          >
            <Icon className={cn('w-5 h-5', isActive ? 'text-blue-600' : 'text-gray-400')} />
            <span className="truncate max-w-[56px] text-center leading-tight">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
