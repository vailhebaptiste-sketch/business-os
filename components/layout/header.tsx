'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { Bell, Search, User, Settings, LogOut, Users, Upload, AlertTriangle, FileText, Clock, X } from 'lucide-react'
import { signOut } from '@/lib/supabase/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import { useSettings } from '@/lib/settings-store'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Tableau de bord',
  '/dashboard/clients': 'Clients',
  '/dashboard/missions': 'Missions',
  '/dashboard/devis': 'Devis',
  '/dashboard/planning': 'Planning',
  '/dashboard/settings': 'Paramètres',
  '/dashboard/import': 'Importer des données',
  '/dashboard/equipe': 'Équipe',
  '/dashboard/mon-compte': 'Mon profil',
}

function getTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname]
  if (pathname.includes('/missions/nouvelle')) return 'Nouvelle mission'
  if (pathname.includes('/missions/') && pathname.includes('/modifier')) return 'Modifier la mission'
  if (pathname.includes('/missions/')) return 'Détail mission'
  if (pathname.includes('/clients/nouveau')) return 'Nouveau client'
  if (pathname.includes('/clients/') && pathname.includes('/modifier')) return 'Modifier le client'
  if (pathname.includes('/clients/')) return 'Fiche client'
  if (pathname.includes('/devis/nouveau')) return 'Nouveau devis'
  if (pathname.includes('/devis/') && pathname.includes('/modifier')) return 'Modifier le devis'
  if (pathname.includes('/devis/')) return 'Détail devis'
  return 'Business OS'
}

type SearchResult = {
  type: 'client' | 'mission' | 'devis'
  id: string
  title: string
  sub: string
  href: string
}

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const title = getTitle(pathname)

  const { clients, missions, devis } = useStore()
  const { profile } = useSettings()

  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const [query, setQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const mobileSearchRef = useRef<HTMLDivElement>(null)

  const [showNotifs, setShowNotifs] = useState(false)
  const notifsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false)
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowResults(false)
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target as Node)) {
        setSearchOpen(false); setQuery(''); setShowResults(false)
      }
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) setShowNotifs(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const results: SearchResult[] = query.trim().length < 2 ? [] : (() => {
    const q = query.toLowerCase()
    const out: SearchResult[] = []
    clients.forEach(c => {
      if (`${c.prenom} ${c.nom} ${c.ville} ${c.telephone} ${c.email}`.toLowerCase().includes(q))
        out.push({ type: 'client', id: c.id, title: `${c.prenom} ${c.nom}`,
          sub: `${c.ville || 'Client'} · ${c.telephone}`, href: `/dashboard/clients/${c.id}` })
    })
    missions.forEach(m => {
      if (`${m.titre} ${m.client_nom} ${m.categorie} ${m.description}`.toLowerCase().includes(q))
        out.push({ type: 'mission', id: m.id, title: m.titre,
          sub: `${m.client_nom} · ${m.date_prevue}`, href: `/dashboard/missions/${m.id}` })
    })
    devis.forEach(d => {
      if (`${d.numero} ${d.client_nom} ${d.mission_titre}`.toLowerCase().includes(q))
        out.push({ type: 'devis', id: d.id, title: d.numero,
          sub: `${d.client_nom} · ${d.total_ttc.toLocaleString('fr-FR')} €`, href: `/dashboard/devis/${d.id}` })
    })
    return out.slice(0, 8)
  })()

  type Notif = { id: string; icon: React.ElementType; iconColor: string; title: string; sub: string; href: string }
  const notifItems: Notif[] = []
  missions.filter(m => m.priorite === 'urgente' && m.statut !== 'termine' && m.statut !== 'annule').forEach(m => {
    notifItems.push({ id: m.id, icon: AlertTriangle, iconColor: 'text-red-500',
      title: `Mission urgente — ${m.titre}`, sub: `${m.client_nom} · ${m.date_prevue}`, href: `/dashboard/missions/${m.id}` })
  })
  devis.filter(d => d.statut === 'envoye').forEach(d => {
    notifItems.push({ id: d.id, icon: FileText, iconColor: 'text-blue-500',
      title: `Devis en attente — ${d.numero}`, sub: `${d.client_nom} · ${d.total_ttc.toLocaleString('fr-FR')} €`, href: `/dashboard/devis/${d.id}` })
  })
  const todayISO = (() => { const dt = new Date(); return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}` })()
  missions.filter(m => m.date_prevue === todayISO && m.statut !== 'termine' && m.statut !== 'annule').forEach(m => {
    if (!notifItems.find(n => n.id === m.id))
      notifItems.push({ id: m.id, icon: Clock, iconColor: 'text-orange-500',
        title: `Mission aujourd'hui — ${m.titre}`, sub: `${m.heure_prevue || ''} · ${m.client_nom}`, href: `/dashboard/missions/${m.id}` })
  })
  const notifCount = notifItems.length

  const avatarInitiales = profile.avatarInitiales || (profile.prenom ? profile.prenom[0].toUpperCase() : 'B')
  const avatarCouleur   = profile.avatarCouleur || 'bg-blue-600'
  const displayName     = profile.prenom || 'Baptiste'
  const displayRole     = profile.poste || 'Administrateur'

  function handleSearchSelect(href: string) {
    setQuery(''); setShowResults(false); setSearchOpen(false)
    router.push(href)
  }

  const typeBg    = { client: 'bg-blue-100 text-blue-600', mission: 'bg-orange-100 text-orange-600', devis: 'bg-purple-100 text-purple-600' }
  const typeLabel = { client: 'Client', mission: 'Mission', devis: 'Devis' }

  function SearchResults() {
    if (query.trim().length < 2) return null
    if (results.length === 0)
      return <p className="text-sm text-gray-400 text-center py-4">Aucun résultat pour &quot;{query}&quot;</p>
    return (
      <>
        <p className="px-3 pt-2 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          {results.length} résultat{results.length > 1 ? 's' : ''}
        </p>
        {results.map(r => (
          <button key={`${r.type}-${r.id}`} onClick={() => handleSearchSelect(r.href)}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${typeBg[r.type]}`}>{typeLabel[r.type]}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">{r.title}</p>
              <p className="text-xs text-gray-400 truncate">{r.sub}</p>
            </div>
          </button>
        ))}
      </>
    )
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between shrink-0 gap-3">
        {/* Titre — pl-10 mobile pour ne pas chevaucher le hamburger */}
        <h1 className="text-base md:text-lg font-bold text-gray-900 pl-10 md:pl-0 truncate min-w-0">{title}</h1>

        <div className="flex items-center gap-1 md:gap-2 shrink-0">

          {/* ── Search desktop ── */}
          <div className="relative hidden md:block" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Rechercher..." className="pl-9 w-56 h-9 bg-gray-50 border-gray-200 text-sm"
              value={query}
              onChange={e => { setQuery(e.target.value); setShowResults(true) }}
              onFocus={() => setShowResults(true)}
            />
            {query && (
              <button onClick={() => { setQuery(''); setShowResults(false) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {showResults && query.trim().length >= 2 && (
              <div className="absolute right-0 top-11 z-50 w-80 bg-white border border-gray-200 rounded-xl shadow-xl py-1 max-h-80 overflow-y-auto">
                <SearchResults />
              </div>
            )}
          </div>

          {/* ── Search icon mobile ── */}
          <button onClick={() => setSearchOpen(true)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100">
            <Search className="w-4 h-4" />
          </button>

          {/* ── Notification bell ── */}
          <div className="relative" ref={notifsRef}>
            <button onClick={() => setShowNotifs(v => !v)}
              className="relative w-9 h-9 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 transition-colors">
              <Bell className="w-4 h-4" />
              {notifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {notifCount > 9 ? '9+' : notifCount}
                </span>
              )}
            </button>
            {showNotifs && (
              <div className="absolute right-0 top-11 z-50 w-72 md:w-80 bg-white border border-gray-200 rounded-xl shadow-xl py-1 max-w-[calc(100vw-1rem)]">
                <div className="px-4 py-2.5 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">Notifications</p>
                </div>
                {notifItems.length === 0 ? (
                  <div className="text-center py-6">
                    <Bell className="w-6 h-6 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Aucune notification</p>
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto">
                    {notifItems.map(n => {
                      const Icon = n.icon
                      return (
                        <Link key={n.id} href={n.href} onClick={() => setShowNotifs(false)}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                          <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                            <Icon className={`w-3.5 h-3.5 ${n.iconColor}`} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 leading-snug">{n.title}</p>
                            <p className="text-xs text-gray-400 mt-0.5 truncate">{n.sub}</p>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Avatar + menu ── */}
          <div className="relative" ref={menuRef}>
            <button onClick={() => setShowMenu(v => !v)}>
              <Avatar className="w-8 h-8 cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all">
                <AvatarFallback className={`${avatarCouleur} text-white text-xs font-semibold`}>
                  {avatarInitiales}
                </AvatarFallback>
              </Avatar>
            </button>
            {showMenu && (
              <div className="absolute right-0 top-10 z-50 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-1">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                  <p className="text-xs text-gray-500">{displayRole}</p>
                </div>
                <div className="py-1">
                  <Link href="/dashboard/mon-compte" onClick={() => setShowMenu(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <User className="w-4 h-4 text-gray-400" /> Mon profil
                  </Link>
                  <Link href="/dashboard/equipe" onClick={() => setShowMenu(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <Users className="w-4 h-4 text-gray-400" /> Équipe
                  </Link>
                  <Link href="/dashboard/import" onClick={() => setShowMenu(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <Upload className="w-4 h-4 text-gray-400" /> Importer des données
                  </Link>
                  <Link href="/dashboard/settings" onClick={() => setShowMenu(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <Settings className="w-4 h-4 text-gray-400" /> Paramètres
                  </Link>
                </div>
                <div className="border-t border-gray-100 py-1">
                  <button
                    onClick={() => { setShowMenu(false); signOut() }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut className="w-4 h-4" /> Se déconnecter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Overlay recherche mobile ── */}
      {searchOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white flex flex-col" ref={mobileSearchRef}>
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input autoFocus
              placeholder="Rechercher client, mission, devis..."
              className="flex-1 text-sm text-gray-900 bg-transparent outline-none"
              value={query}
              onChange={e => { setQuery(e.target.value); setShowResults(true) }}
            />
            <button onClick={() => { setSearchOpen(false); setQuery(''); setShowResults(false) }}
              className="text-gray-400 p-1 shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-1">
            <SearchResults />
          </div>
        </div>
      )}
    </>
  )
}
