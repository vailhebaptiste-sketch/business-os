'use client'

import { useParams, useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft, FileText, User, Euro, Calendar, Send, CheckCircle, XCircle, Trash2, RotateCcw, Edit, Receipt
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

const statutConfig = {
  brouillon: { label: 'Brouillon', bg: 'bg-gray-100',   text: 'text-gray-600' },
  envoye:    { label: 'Envoyé',    bg: 'bg-blue-100',   text: 'text-blue-700' },
  accepte:   { label: 'Accepté',   bg: 'bg-green-100',  text: 'text-green-700' },
  refuse:    { label: 'Refusé',    bg: 'bg-red-100',    text: 'text-red-700' },
  expire:    { label: 'Expiré',    bg: 'bg-gray-100',   text: 'text-gray-500' },
}

export default function DevisDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { devis, updateDevis, deleteDevis } = useStore()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const d = devis.find(x => x.id === id)

  if (!d) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-gray-500">Devis introuvable.</p>
        <Link href="/dashboard/devis">
          <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-1.5" />Retour</Button>
        </Link>
      </div>
    )
  }

  const cfg = statutConfig[d.statut]
  const totalHT    = d.lignes.reduce((s, l) => s + l.total, 0)
  const montantTVA = +(totalHT * d.tva_taux / 100).toFixed(2)
  const totalTTC   = +(totalHT + montantTVA).toFixed(2)

  function todayISO() {
    const dt = new Date()
    return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`
  }

  function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    deleteDevis(id)
    router.push('/dashboard/devis')
  }

  return (
    <div className="space-y-5 max-w-3xl">

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <Link href="/dashboard/devis">
            <Button variant="outline" size="sm" className="shrink-0">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Retour
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg md:text-xl font-bold text-gray-900">{d.numero}</h1>
              <span className={`text-sm font-semibold px-3 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
                {cfg.label}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{d.mission_titre} · Créé le {new Date(d.created_at).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
        {/* Boutons d'action */}
        <div className="flex items-center gap-2 flex-wrap">
          {d.statut === 'brouillon' && (
            <>
              <Link href={`/dashboard/devis/${id}/modifier`}>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-1.5" />
                  Modifier
                </Button>
              </Link>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => updateDevis(id, { statut: 'envoye', date_envoi: todayISO() })}
              >
                <Send className="w-4 h-4 mr-1.5" />
                Envoyer
              </Button>
            </>
          )}
          {d.statut === 'envoye' && (
            <>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => updateDevis(id, { statut: 'accepte' })}
              >
                <CheckCircle className="w-4 h-4 mr-1.5" />
                Accepté
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-500 hover:bg-red-50"
                onClick={() => updateDevis(id, { statut: 'refuse' })}
              >
                <XCircle className="w-4 h-4 mr-1.5" />
                Refusé
              </Button>
            </>
          )}
          {d.statut === 'accepte' && (
            <Button
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => router.push(`/dashboard/factures/nouvelle?from_devis=${id}`)}
            >
              <Receipt className="w-4 h-4 mr-1.5" />
              Créer une facture
            </Button>
          )}
          {(d.statut === 'refuse' || d.statut === 'expire') && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateDevis(id, { statut: 'brouillon', date_envoi: null })}
            >
              <RotateCcw className="w-4 h-4 mr-1.5" />
              Remettre en brouillon
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className={confirmDelete ? 'border-red-500 text-red-600 hover:bg-red-50' : 'text-gray-400 hover:text-red-500'}
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4" />
            {confirmDelete && <span className="ml-1.5">Confirmer</span>}
          </Button>
        </div>
      </div>

      {/* Infos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              Client
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                {d.client_nom.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{d.client_nom}</p>
                <Link href={`/dashboard/clients/${d.client_id}`} className="text-xs text-blue-600 hover:underline">
                  Voir la fiche client →
                </Link>
              </div>
            </div>
            {d.mission_id && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium flex items-center gap-1">
                  <FileText className="w-3 h-3" /> Mission liée
                </p>
                <Link href={`/dashboard/missions/${d.mission_id}`} className="text-sm text-blue-600 hover:underline mt-1 block">
                  {d.mission_titre} →
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              Informations
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Date d&apos;envoi</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {d.date_envoi ? new Date(d.date_envoi).toLocaleDateString('fr-FR') : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Validité</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{d.validite_jours} jours</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">TVA</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{d.tva_taux} %</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Total TTC</p>
                <p className="text-sm font-bold text-gray-900 mt-1">{totalTTC.toLocaleString('fr-FR')} €</p>
              </div>
            </div>
            {d.notes && (
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                <p className="text-xs font-medium text-amber-700 mb-1">Notes</p>
                <p className="text-sm text-amber-800">{d.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lignes du devis */}
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Euro className="w-4 h-4 text-gray-400" />
            Détail des prestations
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide pb-2 pr-4">Description</th>
                  <th className="text-center text-xs font-medium text-gray-400 uppercase tracking-wide pb-2 px-2">Qté</th>
                  <th className="text-center text-xs font-medium text-gray-400 uppercase tracking-wide pb-2 px-2">Unité</th>
                  <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wide pb-2 px-2">P.U. HT</th>
                  <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wide pb-2 pl-2">Total HT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {d.lignes.map((ligne) => (
                  <tr key={ligne.id}>
                    <td className="py-2.5 pr-4 text-gray-900 font-medium">{ligne.description}</td>
                    <td className="py-2.5 px-2 text-center text-gray-600">{ligne.quantite}</td>
                    <td className="py-2.5 px-2 text-center text-gray-500">{ligne.unite}</td>
                    <td className="py-2.5 px-2 text-right text-gray-600">{ligne.prix_unitaire.toFixed(2)} €</td>
                    <td className="py-2.5 pl-2 text-right font-semibold text-gray-900">{ligne.total.toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totaux */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
            <div className="space-y-1.5 min-w-[200px]">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total HT</span>
                <span className="font-medium text-gray-900">{totalHT.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">TVA ({d.tva_taux} %)</span>
                <span className="font-medium text-gray-900">{montantTVA.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-1.5 mt-1.5">
                <span className="text-gray-900">Total TTC</span>
                <span className="text-blue-700 text-base">{totalTTC.toLocaleString('fr-FR')} €</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
