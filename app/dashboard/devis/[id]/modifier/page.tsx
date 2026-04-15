'use client'

import { useParams, useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save, CheckCircle, FileText, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

type LigneLocal = { id: string; description: string; quantite: number; unite: string; prix_unitaire: number }

export default function DevisModifierPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { devis, updateDevis } = useStore()

  const d = devis.find(x => x.id === id)

  const [validite, setValidite] = useState('30')
  const [tva, setTva] = useState(20)
  const [notes, setNotes] = useState('')
  const [lignes, setLignes] = useState<LigneLocal[]>([])
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (d) {
      setValidite(String(d.validite_jours))
      setTva(d.tva_taux)
      setNotes(d.notes)
      setLignes(d.lignes.map(l => ({
        id: l.id,
        description: l.description,
        quantite: l.quantite,
        unite: l.unite,
        prix_unitaire: l.prix_unitaire,
      })))
    }
  }, [d?.id]) // eslint-disable-line react-hooks/exhaustive-deps

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

  if (d.statut !== 'brouillon') {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-gray-500">Seuls les devis en brouillon peuvent être modifiés.</p>
        <Link href={`/dashboard/devis/${id}`}>
          <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-1.5" />Retour au devis</Button>
        </Link>
      </div>
    )
  }

  const addLigne = () => setLignes(l => [...l, {
    id: Math.random().toString(36).slice(2),
    description: '', quantite: 1, unite: 'forfait', prix_unitaire: 0,
  }])

  const removeLigne = (lid: string) => setLignes(l => l.filter(x => x.id !== lid))

  const updateLigne = (lid: string, field: keyof LigneLocal, value: string | number) =>
    setLignes(l => l.map(x => x.id === lid ? { ...x, [field]: value } : x))

  const totalHT    = lignes.reduce((s, l) => s + l.quantite * l.prix_unitaire, 0)
  const montantTVA = +(totalHT * tva / 100).toFixed(2)
  const totalTTC   = +(totalHT + montantTVA).toFixed(2)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const lignesFinales = lignes.filter(l => l.description.trim())
    if (lignesFinales.length === 0) { setError('Ajoutez au moins une prestation.'); return }

    updateDevis(id, {
      lignes: lignesFinales.map(l => ({
        id: l.id,
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
    })

    setSaved(true)
    setTimeout(() => router.push(`/dashboard/devis/${id}`), 800)
  }

  return (
    <div className="space-y-5 max-w-3xl">

      <div className="flex items-center gap-3">
        <Link href={`/dashboard/devis/${id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Modifier le devis</h1>
          <p className="text-sm text-gray-500 mt-0.5">{d.numero} · {d.client_nom}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Infos non modifiables */}
        <Card className="border-gray-100 bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <FileText className="w-4 h-4 text-gray-400 shrink-0" />
              <span>Client : <strong className="text-gray-900">{d.client_nom}</strong></span>
              {d.mission_titre && (
                <><span>·</span><span>Mission : <strong className="text-gray-900">{d.mission_titre}</strong></span></>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lignes de prestation */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Prestations</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {/* Entêtes colonnes */}
            <div className="grid gap-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-1"
              style={{ gridTemplateColumns: '1fr 70px 90px 90px 90px 32px' }}>
              <span>Description</span>
              <span>Qté</span>
              <span>Unité</span>
              <span>P.U. (€ HT)</span>
              <span className="text-right">Total HT</span>
              <span />
            </div>

            {lignes.map(l => (
              <div key={l.id} className="grid gap-2 items-center"
                style={{ gridTemplateColumns: '1fr 70px 90px 90px 90px 32px' }}>
                <Input
                  value={l.description}
                  onChange={e => updateLigne(l.id, 'description', e.target.value)}
                  placeholder="Description de la prestation"
                  className="bg-white border-gray-200 text-sm h-9"
                />
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={l.quantite}
                  onChange={e => updateLigne(l.id, 'quantite', parseFloat(e.target.value) || 0)}
                  className="bg-white border-gray-200 text-sm h-9 text-center"
                />
                <select
                  value={l.unite}
                  onChange={e => updateLigne(l.id, 'unite', e.target.value)}
                  className="h-9 rounded-md border border-gray-200 bg-white px-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {['forfait', 'heure', 'jour', 'unité', 'm²', 'ml'].map(u => <option key={u}>{u}</option>)}
                </select>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={l.prix_unitaire}
                  onChange={e => updateLigne(l.id, 'prix_unitaire', parseFloat(e.target.value) || 0)}
                  className="bg-white border-gray-200 text-sm h-9 text-right"
                />
                <p className="text-sm font-medium text-gray-900 text-right">
                  {(l.quantite * l.prix_unitaire).toFixed(2)} €
                </p>
                <button
                  type="button"
                  onClick={() => removeLigne(l.id)}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <Button type="button" variant="outline" size="sm" onClick={addLigne}>
              <Plus className="w-4 h-4 mr-1.5" /> Ajouter une ligne
            </Button>

            {/* Totaux */}
            <div className="border-t border-gray-100 pt-3 space-y-1">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Total HT</span>
                <span className="font-medium">{totalHT.toFixed(2)} €</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  TVA
                  <select
                    value={tva}
                    onChange={e => setTva(Number(e.target.value))}
                    className="h-7 rounded border border-gray-200 bg-white px-2 text-xs text-gray-900 focus:outline-none"
                  >
                    <option value={20}>20 %</option>
                    <option value={10}>10 %</option>
                    <option value={5.5}>5,5 %</option>
                    <option value={0}>0 %</option>
                  </select>
                </span>
                <span>{montantTVA.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-1 border-t border-gray-100">
                <span>Total TTC</span>
                <span>{totalTTC.toFixed(2)} €</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Options */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Options</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div>
              <Label htmlFor="validite" className="text-xs font-medium text-gray-600">Validité (jours)</Label>
              <Input
                id="validite"
                type="number"
                min="1"
                value={validite}
                onChange={e => setValidite(e.target.value)}
                className="mt-1.5 w-32 bg-white border-gray-200"
              />
            </div>
            <div>
              <Label htmlFor="notes" className="text-xs font-medium text-gray-600">Notes / conditions</Label>
              <textarea
                id="notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Conditions particulières, délais, modalités de paiement..."
                rows={3}
                className="mt-1.5 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            className={saved ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
          >
            {saved
              ? <><CheckCircle className="w-4 h-4 mr-1.5" /> Enregistré</>
              : <><Save className="w-4 h-4 mr-1.5" /> Enregistrer</>
            }
          </Button>
        </div>
      </form>
    </div>
  )
}
