'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useStore } from '@/lib/store'
import { type FactureLigne } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ArrowLeft, Plus, Trash2, Receipt, User,
  Euro, Save, CheckCircle,
} from 'lucide-react'
import Link from 'next/link'

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function fmt(n: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)
}

export default function NouvelleFacturePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { clients, devis, addFacture } = useStore()
  const [saved, setSaved] = useState(false)

  // Pré-remplissage depuis un devis (query param ?from_devis=ID)
  const fromDevisId = searchParams.get('from_devis')
  const sourceDevis = devis.find(d => d.id === fromDevisId)

  const [clientId, setClientId] = useState(sourceDevis?.client_id || '')
  const [clientNom, setClientNom] = useState(sourceDevis?.client_nom || '')
  const [devisId, setDevisId] = useState(sourceDevis?.id || '')
  const [devisNumero, setDevisNumero] = useState(sourceDevis?.numero || '')
  const [dateEcheance, setDateEcheance] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toISOString().split('T')[0]
  })
  const [tva, setTva] = useState(sourceDevis?.tva_taux ?? 20)
  const [notes, setNotes] = useState('')
  const [lignes, setLignes] = useState<FactureLigne[]>(
    sourceDevis?.lignes.map(l => ({ ...l, id: uid() })) || [
      { id: uid(), description: '', quantite: 1, unite: 'u', prix_unitaire: 0, total: 0 }
    ]
  )

  // Quand on sélectionne un client dans le select
  function handleClientChange(id: string) {
    const client = clients.find(c => c.id === id)
    setClientId(id)
    setClientNom(client ? `${client.prenom} ${client.nom}` : '')
  }

  function updateLigne(index: number, field: keyof FactureLigne, value: string | number) {
    setLignes(prev => prev.map((l, i) => {
      if (i !== index) return l
      const updated = { ...l, [field]: value }
      if (field === 'quantite' || field === 'prix_unitaire') {
        updated.total = parseFloat(String(updated.quantite)) * parseFloat(String(updated.prix_unitaire)) || 0
      }
      return updated
    }))
  }

  function addLigne() {
    setLignes(prev => [...prev, { id: uid(), description: '', quantite: 1, unite: 'u', prix_unitaire: 0, total: 0 }])
  }

  function removeLigne(index: number) {
    if (lignes.length === 1) return
    setLignes(prev => prev.filter((_, i) => i !== index))
  }

  const totalHT = lignes.reduce((s, l) => s + (l.total || 0), 0)
  const totalTTC = totalHT * (1 + tva / 100)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!clientNom.trim() || lignes.every(l => !l.description.trim())) return

    const facture = addFacture({
      client_id: clientId,
      client_nom: clientNom.trim(),
      devis_id: devisId || null,
      devis_numero: devisNumero || null,
      statut: 'brouillon',
      lignes: lignes.filter(l => l.description.trim()),
      total_ht: totalHT,
      tva_taux: tva,
      total_ttc: totalTTC,
      date_echeance: dateEcheance,
      date_paiement: null,
      notes: notes.trim(),
    })

    setSaved(true)
    setTimeout(() => router.push(`/dashboard/factures/${facture.id}`), 700)
  }

  return (
    <div className="space-y-5 max-w-2xl">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/factures">
          <Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-1.5" />Retour</Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Nouvelle facture</h1>
          {sourceDevis && (
            <p className="text-sm text-gray-500 mt-0.5">Basée sur le devis {sourceDevis.numero}</p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Client */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" /> Client
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {clients.length > 0 ? (
              <div>
                <Label className="text-xs font-medium text-gray-600">Sélectionner un client *</Label>
                <select
                  value={clientId}
                  onChange={e => handleClientChange(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">— Choisir un client —</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <Label className="text-xs font-medium text-gray-600">Nom du client *</Label>
                <Input
                  value={clientNom}
                  onChange={e => setClientNom(e.target.value)}
                  placeholder="Nom du client"
                  className="mt-1.5 bg-white border-gray-200"
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium text-gray-600">Date d&apos;échéance</Label>
                <Input
                  type="date" value={dateEcheance}
                  onChange={e => setDateEcheance(e.target.value)}
                  className="mt-1.5 bg-white border-gray-200"
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-600">TVA (%)</Label>
                <Input
                  type="number" min="0" max="100" step="0.1"
                  value={tva}
                  onChange={e => setTva(parseFloat(e.target.value) || 0)}
                  className="mt-1.5 bg-white border-gray-200"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lignes */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Euro className="w-4 h-4 text-gray-400" /> Prestations
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">

            {lignes.map((ligne, i) => (
              <div key={ligne.id} className="space-y-1.5 sm:space-y-0 sm:grid sm:grid-cols-12 sm:gap-2 sm:items-center border sm:border-0 border-gray-100 rounded-lg p-2 sm:p-0">
                <div className="sm:col-span-5">
                  <Input
                    value={ligne.description}
                    onChange={e => updateLigne(i, 'description', e.target.value)}
                    placeholder="Description de la prestation"
                    className="bg-white border-gray-200 text-sm"
                  />
                </div>
                <div className="flex gap-2 sm:contents">
                  <div className="sm:col-span-2 w-16 sm:w-auto shrink-0">
                    <Input
                      type="number" min="0" step="0.01"
                      value={ligne.quantite}
                      onChange={e => updateLigne(i, 'quantite', parseFloat(e.target.value) || 0)}
                      placeholder="Qté"
                      className="bg-white border-gray-200 text-sm text-right"
                    />
                  </div>
                  <div className="sm:col-span-2 w-20 sm:w-auto shrink-0">
                    <Input
                      value={ligne.unite}
                      onChange={e => updateLigne(i, 'unite', e.target.value)}
                      placeholder="Unité"
                      className="bg-white border-gray-200 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2 flex-1">
                    <Input
                      type="number" min="0" step="0.01"
                      value={ligne.prix_unitaire}
                      onChange={e => updateLigne(i, 'prix_unitaire', parseFloat(e.target.value) || 0)}
                      placeholder="Prix HT"
                      className="bg-white border-gray-200 text-sm text-right"
                    />
                  </div>
                  <div className="sm:col-span-1 flex items-center justify-end">
                    <span className="text-xs font-semibold text-gray-700 px-1 whitespace-nowrap">
                      {fmt(ligne.total)}
                    </span>
                  </div>
                </div>
                <div className="sm:col-span-0 flex justify-end sm:justify-center">
                  <button
                    type="button"
                    onClick={() => removeLigne(i)}
                    disabled={lignes.length === 1}
                    className="text-gray-400 hover:text-red-500 disabled:opacity-30 p-1 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" size="sm" onClick={addLigne} className="w-full border-dashed">
              <Plus className="w-4 h-4 mr-1.5" /> Ajouter une ligne
            </Button>

            {/* Totaux */}
            <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Total HT</span><span>{fmt(totalHT)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>TVA {tva}%</span><span>{fmt(totalTTC - totalHT)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-1.5 border-t border-gray-200">
                <span>Total TTC</span><span>{fmt(totalTTC)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Notes</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Conditions de paiement, mentions légales supplémentaires..."
              rows={3}
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            className={saved ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
          >
            {saved
              ? <><CheckCircle className="w-4 h-4 mr-1.5" />Enregistrée</>
              : <><Save className="w-4 h-4 mr-1.5" />Créer la facture</>
            }
          </Button>
        </div>
      </form>
    </div>
  )
}
