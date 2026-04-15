'use client'

import { useMemo } from 'react'
import { useStore } from '@/lib/store'
import {
  TrendingUp, TrendingDown, Euro, FileText, CheckCircle2,
  Users, Wrench, BarChart3, Clock, AlertCircle,
} from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

function fmtPct(n: number) {
  return `${Math.round(n)} %`
}

function monthLabel(date: Date) {
  return date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

type StatCardProps = {
  title: string
  value: string
  sub?: string
  trend?: number   // positive = good, negative = bad, undefined = neutral
  icon: React.ElementType
  color: string    // tailwind bg class for icon badge
  iconColor: string
}

function StatCard({ title, value, sub, trend, icon: Icon, color, iconColor }: StatCardProps) {
  const trendPos = trend !== undefined && trend > 0
  const trendNeg = trend !== undefined && trend < 0

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{title}</p>
        <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center shrink-0`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {(sub || trend !== undefined) && (
          <div className="flex items-center gap-1.5 mt-1">
            {trend !== undefined && (
              trendPos
                ? <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                : trendNeg
                  ? <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                  : null
            )}
            {sub && (
              <p className={`text-xs font-medium ${trendPos ? 'text-green-600' : trendNeg ? 'text-red-600' : 'text-gray-400'}`}>
                {sub}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Mini Bar Chart (pure CSS) ────────────────────────────────────────────────

type BarChartProps = {
  data: { label: string; value: number; value2?: number }[]
  color?: string
  color2?: string
  label: string
  label2?: string
  formatter?: (n: number) => string
}

function BarChart({ data, color = 'bg-blue-500', color2 = 'bg-green-400', label, label2, formatter = String }: BarChartProps) {
  const max = Math.max(...data.map(d => Math.max(d.value, d.value2 ?? 0)), 1)

  return (
    <div className="space-y-2">
      {/* Legend */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className={`w-2.5 h-2.5 rounded-sm ${color}`} />
          <span className="text-xs text-gray-500">{label}</span>
        </div>
        {label2 && (
          <div className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-sm ${color2}`} />
            <span className="text-xs text-gray-500">{label2}</span>
          </div>
        )}
      </div>

      {/* Bars */}
      <div className="flex items-end gap-1.5 h-28">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex items-end gap-0.5 group relative">
            {/* Tooltip */}
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] rounded px-1.5 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
              {formatter(d.value)}{d.value2 !== undefined ? ` / ${formatter(d.value2)}` : ''}
            </div>
            <div
              className={`flex-1 rounded-t ${color} transition-all`}
              style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? '2px' : '0' }}
            />
            {d.value2 !== undefined && (
              <div
                className={`flex-1 rounded-t ${color2} transition-all`}
                style={{ height: `${(d.value2 / max) * 100}%`, minHeight: d.value2 > 0 ? '2px' : '0' }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Labels */}
      <div className="flex gap-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center text-[9px] text-gray-400 truncate">{d.label}</div>
        ))}
      </div>
    </div>
  )
}

// ─── Donut (pure CSS, 2-segment) ──────────────────────────────────────────────

function DonutProgress({ value, label, color }: { value: number; label: string; color: string }) {
  const pct = Math.max(0, Math.min(100, value))
  const r = 30
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <svg width="76" height="76" viewBox="0 0 76 76" className="-rotate-90">
          <circle cx="38" cy="38" r={r} fill="none" stroke="#f3f4f6" strokeWidth="8" />
          <circle
            cx="38" cy="38" r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={`${circ} ${circ}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-gray-900">{Math.round(pct)}%</span>
        </div>
      </div>
      <span className="text-xs text-gray-500 text-center leading-tight">{label}</span>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function KpisPage() {
  const { clients, missions, devis, factures, loading } = useStore()

  const stats = useMemo(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    // ── CA facturé (payées) ──
    const caTotalPaye = factures.filter(f => f.statut === 'payee').reduce((s, f) => s + f.total_ttc, 0)
    const caEnAttente = factures.filter(f => f.statut === 'envoyee').reduce((s, f) => s + f.total_ttc, 0)

    // ── CA 6 derniers mois ──
    const months6 = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(currentYear, currentMonth - 5 + i, 1)
      return { label: monthLabel(d), year: d.getFullYear(), month: d.getMonth() }
    })

    const caParMois = months6.map(m => {
      const payees = factures
        .filter(f => f.statut === 'payee' && f.date_paiement)
        .filter(f => {
          const d = new Date(f.date_paiement!)
          return d.getFullYear() === m.year && d.getMonth() === m.month
        })
        .reduce((s, f) => s + f.total_ttc, 0)

      const emises = factures
        .filter(f => {
          const d = new Date(f.created_at)
          return d.getFullYear() === m.year && d.getMonth() === m.month
        })
        .reduce((s, f) => s + f.total_ttc, 0)

      return { label: m.label, value: payees, value2: emises }
    })

    // ── Taux conversion devis ──
    const devisTotal = devis.length
    const devisAcceptes = devis.filter(d => d.statut === 'accepte').length
    const tauxConversion = devisTotal > 0 ? (devisAcceptes / devisTotal) * 100 : 0

    // Devis par statut pour les 6 derniers mois
    const devisParMois = months6.map(m => {
      const envoyes = devis.filter(d => {
        if (!d.date_envoi) return false
        const dt = new Date(d.date_envoi)
        return dt.getFullYear() === m.year && dt.getMonth() === m.month
      }).length
      const acceptes = devis.filter(d => {
        const dt = new Date(d.created_at)
        return dt.getFullYear() === m.year && dt.getMonth() === m.month && d.statut === 'accepte'
      }).length
      return { label: m.label, value: envoyes, value2: acceptes }
    })

    // ── Missions par statut ──
    const missionsNouv = missions.filter(m => m.statut === 'nouveau').length
    const missionsEnCours = missions.filter(m => m.statut === 'en_cours').length
    const missionsDone = missions.filter(m => m.statut === 'termine').length
    const missionsAnnul = missions.filter(m => m.statut === 'annule').length

    // Urgentes
    const urgentes = missions.filter(m => m.priorite === 'urgente' && m.statut !== 'termine' && m.statut !== 'annule').length

    // ── Top 5 clients par CA facturé ──
    const clientCa: Record<string, { nom: string; ca: number; factures: number }> = {}
    factures.filter(f => f.statut === 'payee').forEach(f => {
      if (!clientCa[f.client_id]) clientCa[f.client_id] = { nom: f.client_nom, ca: 0, factures: 0 }
      clientCa[f.client_id].ca += f.total_ttc
      clientCa[f.client_id].factures += 1
    })
    const topClients = Object.values(clientCa)
      .sort((a, b) => b.ca - a.ca)
      .slice(0, 5)
    const maxClientCa = topClients[0]?.ca || 1

    // ── Factures en retard ──
    const facturesEnRetard = factures.filter(f =>
      f.statut === 'envoyee' && f.date_echeance && new Date(f.date_echeance) < now
    ).length

    // ── Taux missions terminées ──
    const tauxMissions = missions.length > 0 ? (missionsDone / missions.length) * 100 : 0

    // ── Taux paiement factures ──
    const facturesNonAnnulees = factures.filter(f => f.statut !== 'annulee').length
    const tauxPaiement = facturesNonAnnulees > 0
      ? (factures.filter(f => f.statut === 'payee').length / facturesNonAnnulees) * 100
      : 0

    return {
      caTotalPaye, caEnAttente, caParMois, devisParMois,
      devisTotal, devisAcceptes, tauxConversion,
      missionsNouv, missionsEnCours, missionsDone, missionsAnnul, urgentes,
      topClients, maxClientCa,
      facturesEnRetard, tauxMissions, tauxPaiement,
    }
  }, [clients, missions, devis, factures])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const hasData = clients.length + missions.length + devis.length + factures.length > 0

  return (
    <div className="space-y-6 max-w-5xl">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Tableau de bord analytique
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">Vue d&apos;ensemble de votre activité</p>
      </div>

      {!hasData && (
        <div className="flex flex-col items-center justify-center py-16 bg-white border border-gray-200 rounded-xl gap-3">
          <BarChart3 className="w-10 h-10 text-gray-200" />
          <p className="text-sm text-gray-400">Aucune donnée pour l&apos;instant. Créez des clients, missions et factures pour voir vos KPIs.</p>
        </div>
      )}

      {hasData && (
        <>
          {/* Alerte retards */}
          {stats.facturesEnRetard > 0 && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-sm text-red-700 font-medium">
                {stats.facturesEnRetard} facture{stats.facturesEnRetard > 1 ? 's' : ''} en retard de paiement
              </p>
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              title="CA encaissé"
              value={fmt(stats.caTotalPaye)}
              sub="factures payées"
              icon={Euro}
              color="bg-green-50"
              iconColor="text-green-600"
            />
            <StatCard
              title="CA en attente"
              value={fmt(stats.caEnAttente)}
              sub="factures envoyées"
              icon={Clock}
              color="bg-blue-50"
              iconColor="text-blue-600"
            />
            <StatCard
              title="Clients"
              value={String(clients.length)}
              sub={`${missions.filter(m => m.statut === 'en_cours').length} mission(s) active(s)`}
              icon={Users}
              color="bg-purple-50"
              iconColor="text-purple-600"
            />
            <StatCard
              title="Taux conversion"
              value={fmtPct(stats.tauxConversion)}
              sub={`${stats.devisAcceptes} / ${stats.devisTotal} devis`}
              trend={stats.tauxConversion >= 50 ? 1 : stats.tauxConversion > 0 ? -1 : undefined}
              icon={FileText}
              color="bg-amber-50"
              iconColor="text-amber-600"
            />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* CA mensuel */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">Chiffre d&apos;affaires mensuel</p>
                <span className="text-xs text-gray-400">6 derniers mois</span>
              </div>
              <BarChart
                data={stats.caParMois}
                color="bg-blue-500"
                color2="bg-blue-200"
                label="Encaissé"
                label2="Facturé"
                formatter={fmt}
              />
            </div>

            {/* Devis envoyés vs acceptés */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">Devis envoyés vs acceptés</p>
                <span className="text-xs text-gray-400">6 derniers mois</span>
              </div>
              <BarChart
                data={stats.devisParMois}
                color="bg-purple-400"
                color2="bg-green-400"
                label="Envoyés"
                label2="Acceptés"
                formatter={n => `${n} devis`}
              />
            </div>
          </div>

          {/* Taux + Missions row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Taux donuts */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
              <p className="text-sm font-semibold text-gray-700">Indicateurs de performance</p>
              <div className="flex items-center justify-around py-2">
                <DonutProgress
                  value={stats.tauxConversion}
                  label="Conversion devis"
                  color="#3b82f6"
                />
                <DonutProgress
                  value={stats.tauxMissions}
                  label="Missions terminées"
                  color="#10b981"
                />
                <DonutProgress
                  value={stats.tauxPaiement}
                  label="Factures payées"
                  color="#8b5cf6"
                />
              </div>
            </div>

            {/* Statut missions */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">Missions par statut</p>
                {stats.urgentes > 0 && (
                  <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">
                    {stats.urgentes} urgente{stats.urgentes > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className="space-y-2.5">
                {[
                  { label: 'Nouvelles', count: stats.missionsNouv, color: 'bg-gray-400', track: 'bg-gray-100' },
                  { label: 'En cours', count: stats.missionsEnCours, color: 'bg-blue-500', track: 'bg-blue-50' },
                  { label: 'Terminées', count: stats.missionsDone, color: 'bg-green-500', track: 'bg-green-50' },
                  { label: 'Annulées', count: stats.missionsAnnul, color: 'bg-red-400', track: 'bg-red-50' },
                ].map(({ label, count, color, track }) => {
                  const pct = missions.length > 0 ? (count / missions.length) * 100 : 0
                  return (
                    <div key={label} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 font-medium">{label}</span>
                        <span className="text-gray-500">{count} ({Math.round(pct)}%)</span>
                      </div>
                      <div className={`h-2 rounded-full ${track}`}>
                        <div
                          className={`h-2 rounded-full ${color} transition-all`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Top clients */}
          {stats.topClients.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
              <p className="text-sm font-semibold text-gray-700">Top clients par chiffre d&apos;affaires encaissé</p>
              <div className="space-y-3">
                {stats.topClients.map((c, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <span className="font-medium text-gray-900 truncate">{c.nom}</span>
                        <span className="text-xs text-gray-400 shrink-0">{c.factures} fact.</span>
                      </div>
                      <span className="font-semibold text-gray-900 shrink-0 ml-2">{fmt(c.ca)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100">
                      <div
                        className="h-1.5 rounded-full bg-blue-500 transition-all"
                        style={{ width: `${(c.ca / stats.maxClientCa) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Récap chiffres bas de page */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-4">
            {[
              { label: 'Total clients', value: clients.length, icon: Users, color: 'text-purple-600' },
              { label: 'Total missions', value: missions.length, icon: Wrench, color: 'text-blue-600' },
              { label: 'Total devis', value: devis.length, icon: FileText, color: 'text-amber-600' },
              { label: 'Total factures', value: factures.length, icon: CheckCircle2, color: 'text-green-600' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3">
                <Icon className={`w-5 h-5 shrink-0 ${color}`} />
                <div>
                  <p className="text-lg font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
