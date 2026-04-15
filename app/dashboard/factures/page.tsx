'use client'

import { useStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Plus, Search, Receipt, Euro, CheckCircle2,
  Clock, XCircle, FileText, ChevronRight,
} from 'lucide-react'
import Link from 'next/link'

const STATUT_CONFIG = {
  brouillon:  { label: 'Brouillon',  color: 'bg-gray-100 text-gray-600',    icon: FileText },
  envoyee:    { label: 'Envoyée',    color: 'bg-blue-100 text-blue-700',    icon: Clock },
  payee:      { label: 'Payée',      color: 'bg-green-100 text-green-700',  icon: CheckCircle2 },
  annulee:    { label: 'Annulée',    color: 'bg-red-100 text-red-600',      icon: XCircle },
}

function fmt(n: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)
}

function fmtDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function FacturesPage() {
  const { factures } = useStore()
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [filtre, setFiltre] = useState<string>('tous')

  const filtered = factures.filter(f => {
    const matchSearch = !search || [f.numero, f.client_nom, f.statut]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()))
    const matchFiltre = filtre === 'tous' || f.statut === filtre
    return matchSearch && matchFiltre
  }).sort((a, b) => b.created_at.localeCompare(a.created_at))

  // Stats
  const totalTTC = factures.reduce((s, f) => s + (f.total_ttc || 0), 0)
  const payees = factures.filter(f => f.statut === 'payee')
  const totalPaye = payees.reduce((s, f) => s + (f.total_ttc || 0), 0)
  const enAttente = factures.filter(f => f.statut === 'envoyee')
  const totalAttente = enAttente.reduce((s, f) => s + (f.total_ttc || 0), 0)

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Factures</h1>
          <p className="text-sm text-gray-500 mt-0.5">{factures.length} facture{factures.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/dashboard/factures/nouvelle">
          <Button className="bg-blue-600 hover:bg-blue-700 h-9">
            <Plus className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Nouvelle facture</span>
            <span className="sm:hidden">Nouveau</span>
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total facturé', value: fmt(totalTTC), icon: Receipt, color: 'text-gray-600', bg: 'bg-gray-50' },
          { label: 'Encaissé', value: fmt(totalPaye), icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'En attente', value: fmt(totalAttente), icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl p-3`}>
            <Icon className={`w-4 h-4 ${color} mb-1.5`} />
            <p className="text-xs text-gray-500">{label}</p>
            <p className={`text-sm font-bold ${color} mt-0.5`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filtres + Recherche */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Rechercher par numéro, client..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-white border-gray-200"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {['tous', 'brouillon', 'envoyee', 'payee', 'annulee'].map(s => (
            <button
              key={s}
              onClick={() => setFiltre(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                filtre === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === 'tous' ? 'Toutes' : STATUT_CONFIG[s as keyof typeof STATUT_CONFIG]?.label}
              {s !== 'tous' && (
                <span className="ml-1 opacity-75">
                  ({factures.filter(f => f.statut === s).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
            <Receipt className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">
            {search || filtre !== 'tous' ? 'Aucun résultat' : 'Aucune facture'}
          </p>
          <p className="text-sm text-gray-400">
            {!search && filtre === 'tous' && 'Créez votre première facture ou convertissez un devis accepté.'}
          </p>
          {!search && filtre === 'tous' && (
            <Link href="/dashboard/factures/nouvelle">
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-1.5" /> Nouvelle facture
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(facture => {
            const cfg = STATUT_CONFIG[facture.statut]
            const Icon = cfg.icon
            return (
              <button
                key={facture.id}
                onClick={() => router.push(`/dashboard/factures/${facture.id}`)}
                className="w-full bg-white border border-gray-200 rounded-xl p-3.5 hover:border-blue-300 hover:shadow-sm transition-all text-left"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                      <Receipt className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900 text-sm">{facture.numero}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                          <Icon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{facture.client_nom}</p>
                      {facture.date_echeance && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Échéance : {fmtDate(facture.date_echeance)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-2">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{fmt(facture.total_ttc)}</p>
                      <p className="text-xs text-gray-400">TTC</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
