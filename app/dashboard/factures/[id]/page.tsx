'use client'

import { useParams, useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { useSettings } from '@/lib/settings-store'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft, Download, Trash2, CheckCircle, Receipt,
  User, Euro, FileText, Clock, XCircle, CheckCircle2, AlertCircle,
} from 'lucide-react'
import Link from 'next/link'

const STATUT_CONFIG = {
  brouillon: { label: 'Brouillon',  color: 'bg-gray-100 text-gray-600',   icon: FileText },
  envoyee:   { label: 'Envoyée',    color: 'bg-blue-100 text-blue-700',   icon: Clock },
  payee:     { label: 'Payée',      color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  annulee:   { label: 'Annulée',    color: 'bg-red-100 text-red-600',     icon: XCircle },
}

function fmt(n: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function FactureDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { factures, updateFacture, deleteFacture } = useStore()
  const storeSettings = useSettings()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  const facture = factures.find(f => f.id === id)

  if (!facture) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-gray-500">Facture introuvable.</p>
        <Link href="/dashboard/factures">
          <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-1.5" />Retour</Button>
        </Link>
      </div>
    )
  }

  const cfg = STATUT_CONFIG[facture.statut]
  const StatusIcon = cfg.icon

  // Aplatir les settings pour le générateur PDF
  const pdfSettings = {
    nom_entreprise: storeSettings.company.nom_entreprise,
    siret: storeSettings.company.siret,
    adresse: storeSettings.company.adresse,
    ville: '',
    code_postal: '',
    telephone: storeSettings.profile.telephone,
    email: storeSettings.profile.email,
  }

  async function handleDownloadPDF() {
    if (!facture) return
    setPdfLoading(true)
    try {
      const { generateFacturePDF } = await import('@/lib/pdf/facture-pdf')
      await generateFacturePDF(facture, pdfSettings)
    } catch (e) {
      console.error('PDF error:', e)
    } finally {
      setPdfLoading(false)
    }
  }

  function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    deleteFacture(id)
    router.push('/dashboard/factures')
  }

  function markAs(statut: 'envoyee' | 'payee' | 'annulee' | 'brouillon') {
    const patch: Parameters<typeof updateFacture>[1] = { statut }
    if (statut === 'payee') patch.date_paiement = new Date().toISOString().split('T')[0]
    updateFacture(id, patch)
  }

  return (
    <div className="space-y-5 max-w-3xl">

      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href="/dashboard/factures">
          <Button variant="outline" size="sm" className="shrink-0 mt-0.5">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900">{facture.numero}</h1>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
              <StatusIcon className="w-3.5 h-3.5" />{cfg.label}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{facture.client_nom}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button onClick={handleDownloadPDF} disabled={pdfLoading}
          className="bg-blue-600 hover:bg-blue-700 h-9">
          <Download className="w-4 h-4 mr-1.5" />
          {pdfLoading ? 'Génération...' : 'Télécharger PDF'}
        </Button>

        {facture.statut === 'brouillon' && (
          <Button variant="outline" size="sm" onClick={() => markAs('envoyee')}>
            <Clock className="w-4 h-4 mr-1.5 text-blue-500" /> Marquer envoyée
          </Button>
        )}
        {facture.statut === 'envoyee' && (
          <Button variant="outline" size="sm" onClick={() => markAs('payee')}
            className="border-green-200 text-green-700 hover:bg-green-50">
            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Marquer payée
          </Button>
        )}
        {(facture.statut === 'brouillon' || facture.statut === 'envoyee') && (
          <Button variant="outline" size="sm" onClick={() => markAs('annulee')}
            className="border-red-200 text-red-600 hover:bg-red-50">
            <XCircle className="w-4 h-4 mr-1.5" /> Annuler
          </Button>
        )}
        {facture.statut === 'annulee' && (
          <Button variant="outline" size="sm" onClick={() => markAs('brouillon')}>
            <FileText className="w-4 h-4 mr-1.5" /> Remettre en brouillon
          </Button>
        )}

        <Button
          variant="outline" size="sm"
          onClick={handleDelete}
          className={confirmDelete ? 'border-red-300 text-red-600 hover:bg-red-50' : 'text-gray-500'}
        >
          <Trash2 className="w-4 h-4 mr-1.5" />
          {confirmDelete ? 'Confirmer la suppression' : 'Supprimer'}
        </Button>
      </div>

      {/* Infos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> Client
          </p>
          <p className="font-semibold text-gray-900">{facture.client_nom}</p>
          {facture.devis_numero && (
            <p className="text-sm text-gray-500">Issu du devis {facture.devis_numero}</p>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5" /> Dates
          </p>
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Émission</span>
              <span className="font-medium">{fmtDate(facture.created_at)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Échéance</span>
              <span className={`font-medium ${
                facture.date_echeance && new Date(facture.date_echeance) < new Date() && facture.statut !== 'payee'
                  ? 'text-red-600' : ''
              }`}>{fmtDate(facture.date_echeance)}</span>
            </div>
            {facture.date_paiement && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Paiement reçu</span>
                <span className="font-medium text-green-600">{fmtDate(facture.date_paiement)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lignes de prestation */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <Euro className="w-4 h-4 text-gray-400" />
          <p className="text-sm font-semibold text-gray-700">Détail des prestations</p>
        </div>

        {/* Desktop */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Description</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500">Qté</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500">Unité</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500">P.U. HT</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500">Total HT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {facture.lignes.map(l => (
                <tr key={l.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-gray-900">{l.description}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{l.quantite}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{l.unite}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{fmt(l.prix_unitaire)}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">{fmt(l.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="sm:hidden divide-y divide-gray-100">
          {facture.lignes.map(l => (
            <div key={l.id} className="px-4 py-3 space-y-1">
              <p className="font-medium text-gray-900 text-sm">{l.description}</p>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{l.quantite} {l.unite} × {fmt(l.prix_unitaire)}</span>
                <span className="font-semibold text-gray-700">{fmt(l.total)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Totaux */}
        <div className="border-t border-gray-200 px-4 py-3 bg-gray-50 space-y-1.5">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Total HT</span><span>{fmt(facture.total_ht)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>TVA {facture.tva_taux}%</span>
            <span>{fmt(facture.total_ttc - facture.total_ht)}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t border-gray-200">
            <span>Total TTC</span><span>{fmt(facture.total_ttc)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {facture.notes && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" /> Notes
          </p>
          <p className="text-sm text-gray-700 whitespace-pre-line">{facture.notes}</p>
        </div>
      )}

      {/* Mentions légales */}
      {facture.statut === 'payee' && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
          <p className="text-sm text-green-700 font-medium">
            Facture payée le {fmtDate(facture.date_paiement)}
          </p>
        </div>
      )}
    </div>
  )
}
