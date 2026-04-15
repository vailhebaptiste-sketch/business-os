'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save, FileText, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

type Ligne = { id: number; description: string; quantite: number; unite: string; prix_unitaire: number }

export default function NouveauDevisPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { clients, missions, addDevis } = useStore()

  const [clientId, setClientId] = useState(searchParams.get('client') || '')
  const [missionId, setMissionId] = useState(searchParams.get('mission') || '')
  const [validite, setValidite] = useState('30')
  const [tva, setTva] = useState(20)
  const [notes, setNotes] = useState('')
  const [lignes, setLignes] = useState<Ligne[]>([
    { id: 1, description: '', quantite: 1, unite: 'forfait', prix_unitaire: 0 },
  ])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Missions filtrées par client sélectionné
  const missionsClient = clientId ? missions.filter(m => m.client_id === clientId) : missions

  const addLigne = () => setLignes(l => [...l, { id: Date.now(), description: '', quantite: 1, unite: 'forfait', prix_unitaire: 0 }])
  const removeLigne = (id: number) => setLignes(l => l.filter(x => x.id !== id))
  const updateLigne = (id: number, field: keyof Ligne, value: string | number) =>
    setLignes(l => l.map(x => x.id === id ? { ...x, [field]: value } : x))

  const totalHT    = lignes.reduce((s, l) => s + l.quantite * l.prix_unitaire, 0)
  const montantTVA = +(totalHT * tva / 100).toFixed(2)
  const totalTTC   = +(totalHT + montantTVA).toFixed(2)

  function uid() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36)
  }

  function handleSave(statut: 'brouillon' | 'envoye') {
    if (!clientId) { setError('Veuillez sélectionner un client.'); return }
    const client = clients.find(c => c.id === clientId)
    if (!client) { setError('Client introuvable.'); return }

    const mission = missionId ? missions.find(m => m.id === missionId) : null
    const lignesFinales = lignes.filter(l => l.description.trim())

    if (lignesFinales.length === 0) { setError('Ajoutez au moins une prestation.'); return }

    setSaving(true)
    const todayISO = () => {
      const dt = new Date()
      return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`
    }

    const devis = addDevis({
      client_id: clientId,
      client_nom: `${client.prenom} ${client.nom}`,
      mission_id: missionId || '',
      mission_titre: mission?.titre || '',
      statut,
      lignes: lignesFinales.map(l => ({
        id: uid(),
        description: l.description.trim(),
        quantite: l.quantite,
        unite: l.unite,
        prix_unitaire: l.prix_unitaire,
        total: +(l.quantite * l.prix_unitaire).toFixed(2),
      })),
      total_ht: +totalHT.toFixed(2),
      tva_taux: tva,
      total_ttc: totalTTC,
      validite_jours: parseInt(validite) || 30,
      notes: notes.trim(),
      date_envoi: statut === 'envoye' ? todayISO() : null,
    })
    router.push(`/dashboard/devis/${devis.id}`)
  }

  return (
    <div className="space-y-5 max-w-2xl">

      <div className="flex items-center gap-4">
        <Link href="/dashboard/devis">
          <Button variant="outline" size="sm" className="shrink-0">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Nouveau devis</h1>
          <p className="text-sm text-gray-500 mt-0.5">Remplissez les informations ci-dessous</p>
        </div>
      </div>

      <div className="space-y-4">

        {/* Client & Mission */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              Client & Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div>
              <Label htmlFor="client" className="text-xs font-medium text-gray-600">Client *</Label>
              {clients.length === 0 ? (
                <div className="mt-1.5 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                  Aucun client disponible.{' '}
                  <Link href="/dashboard/clients/nouveau" className="underline font-medium">Créer un client d&apos;abord →</Link>
                </div>
              ) : (
                <select
                  id="client"
                  className="mt-1.5 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={clientId}
                  onChange={e => { setClientId(e.target.value); setMissionId('') }}
                >
                  <option value="">Sélectionner un client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.prenom} {c.nom} — {c.ville}</option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <Label htmlFor="mission" className="text-xs font-medium text-gray-600">Mission liée</Label>
              <select
                id="mission"
                className="mt-1.5 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={missionId}
                onChange={e => setMissionId(e.target.value)}
              >
                <option value="">Aucune mission liée</option>
                {missionsClient.map((m) => (
                  <option key={m.id} value={m.id}>{m.titre} — {m.client_nom}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="validite" className="text-xs font-medium text-gray-600">Validité (jours)</Label>
                <Input
                  id="validite"
                  type="number"
                  min="1"
                  className="mt-1.5 bg-white border-gray-200"
                  value={validite}
                  onChange={e => setValidite(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="tva" className="text-xs font-medium text-gray-600">TVA (%)</Label>
                <select
                  id="tva"
                  value={tva}
                  onChange={e => setTva(Number(e.target.value))}
                  className="mt-1.5 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={20}>20 % — taux normal</option>
                  <option value={10}>10 % — taux intermédiaire</option>
                  <option value={5.5}>5,5 % — taux réduit</option>
                  <option value={0}>0 % — exonéré</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lignes */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-semibold text-gray-700">Prestations</CardTitle>
            <button
              type="button"
              onClick={addLigne}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus className="w-3 h-3" /> Ajouter une ligne
            </button>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="hidden sm:grid grid-cols-12 gap-2 text-xs text-gray-400 font-medium px-1 mb-1">
                <span className="col-span-5">Description</span>
                <span className="col-span-2 text-center">Qté</span>
                <span className="col-span-2 text-center">Unité</span>
                <span className="col-span-2 text-right">P.U. HT</span>
                <span className="col-span-1" />
              </div>
              {lignes.map((ligne) => (
                <div key={ligne.id} className="space-y-1.5 sm:space-y-0 sm:grid sm:grid-cols-12 sm:gap-2 sm:items-center border sm:border-0 border-gray-100 rounded-lg p-2 sm:p-0">
                  {/* Description — full width on mobile */}
                  <div className="sm:col-span-5">
                    <Input
                      placeholder="Description de la prestation"
                      value={ligne.description}
                      onChange={e => updateLigne(ligne.id, 'description', e.target.value)}
                      className="bg-white border-gray-200 text-sm h-9"
                    />
                  </div>
                  {/* Qté + Unité + Prix sur une ligne mobile */}
                  <div className="flex gap-2 sm:contents">
                    <div className="sm:col-span-2 w-16 sm:w-auto shrink-0">
                      <Input
                        type="number"
                        min="0"
                        value={ligne.quantite}
                        onChange={e => updateLigne(ligne.id, 'quantite', Number(e.target.value))}
                        className="bg-white border-gray-200 text-sm h-9 text-center"
                      />
                    </div>
                    <div className="sm:col-span-2 w-20 sm:w-auto shrink-0">
                      <Input
                        placeholder="unité"
                        value={ligne.unite}
                        onChange={e => updateLigne(ligne.id, 'unite', e.target.value)}
                        className="bg-white border-gray-200 text-sm h-9 text-center"
                      />
                    </div>
                    <div className="sm:col-span-2 flex-1">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={ligne.prix_unitaire}
                        onChange={e => updateLigne(ligne.id, 'prix_unitaire', Number(e.target.value))}
                        className="bg-white border-gray-200 text-sm h-9 text-right"
                      />
                    </div>
                    <div className="sm:col-span-1 flex items-center justify-center shrink-0">
                      {lignes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLigne(ligne.id)}
                          className="text-gray-300 hover:text-red-400 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totaux calculés en temps réel */}
            <div className="mt-5 pt-4 border-t border-gray-100 flex justify-end">
              <div className="space-y-1.5 min-w-[200px] text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total HT</span>
                  <span className="font-medium text-gray-900">{totalHT.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">TVA ({tva} %)</span>
                  <span className="font-medium text-gray-900">{montantTVA.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-2 mt-1">
                  <span className="text-gray-900">Total TTC</span>
                  <span className="text-blue-700">{totalTTC.toFixed(2)} €</span>
                </div>
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
              rows={3}
              placeholder="Conditions particulières, délai de paiement, garanties..."
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </CardContent>
        </Card>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>
        )}

        <div className="flex flex-wrap items-center gap-3 justify-end">
          <Link href="/dashboard/devis">
            <Button variant="outline" type="button">Annuler</Button>
          </Link>
          <Button type="button" variant="outline" onClick={() => handleSave('brouillon')} disabled={saving}>
            Enregistrer en brouillon
          </Button>
          <Button type="button" className="bg-blue-600 hover:bg-blue-700" onClick={() => handleSave('envoye')} disabled={saving}>
            <Save className="w-4 h-4 mr-1.5" />
            Créer et envoyer
          </Button>
        </div>
      </div>
    </div>
  )
}
