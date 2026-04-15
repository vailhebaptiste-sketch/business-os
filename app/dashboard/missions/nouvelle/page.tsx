'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save, Wrench } from 'lucide-react'
import Link from 'next/link'

export default function NouvelleMissionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { clients, addMission } = useStore()

  const [form, setForm] = useState({
    client_id: searchParams.get('client') || '',
    titre: '',
    description: '',
    categorie: '',
    priorite: 'normale' as 'normale' | 'urgente',
    duree_estimee: '',
    montant_estime: '',
    adresse: '',
    date_prevue: '',
    heure_prevue: '',
    responsable: '',
    notes: '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Auto-fill adresse from selected client
  useEffect(() => {
    if (form.client_id) {
      const c = clients.find(c => c.id === form.client_id)
      if (c && c.adresse) {
        setForm(prev => ({ ...prev, adresse: `${c.adresse}, ${c.code_postal} ${c.ville}`.trim() }))
      }
    }
  }, [form.client_id, clients])

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.titre.trim()) { setError('Le titre est requis.'); return }
    if (!form.client_id) { setError('Veuillez sélectionner un client.'); return }
    if (!form.categorie) { setError('Veuillez choisir une catégorie.'); return }
    if (!form.date_prevue) { setError('La date est requise.'); return }

    const client = clients.find(c => c.id === form.client_id)
    if (!client) { setError('Client introuvable.'); return }

    setSaving(true)
    const mission = addMission({
      client_id: form.client_id,
      client_nom: `${client.prenom} ${client.nom}`,
      titre: form.titre.trim(),
      description: form.description.trim(),
      categorie: form.categorie,
      priorite: form.priorite,
      duree_estimee: form.duree_estimee.trim(),
      montant_estime: parseFloat(form.montant_estime) || 0,
      adresse: form.adresse.trim(),
      date_prevue: form.date_prevue,
      heure_prevue: form.heure_prevue,
      responsable: form.responsable.trim(),
      notes: form.notes.trim(),
    })
    router.push(`/dashboard/missions/${mission.id}`)
  }

  return (
    <div className="space-y-5 max-w-2xl">

      <div className="flex items-center gap-4">
        <Link href="/dashboard/missions">
          <Button variant="outline" size="sm" className="shrink-0">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Nouvelle mission</h1>
          <p className="text-sm text-gray-500 mt-0.5">Remplissez les informations ci-dessous</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-gray-400" />
              Détails de la mission
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div>
              <Label htmlFor="titre" className="text-xs font-medium text-gray-600">Titre *</Label>
              <Input
                id="titre"
                placeholder="Titre de la mission"
                className="mt-1.5 bg-white border-gray-200"
                value={form.titre}
                onChange={e => set('titre', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-xs font-medium text-gray-600">Description</Label>
              <textarea
                id="description"
                rows={3}
                placeholder="Description de la prestation ou du problème à traiter"
                className="mt-1.5 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                value={form.description}
                onChange={e => set('description', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="categorie" className="text-xs font-medium text-gray-600">Catégorie *</Label>
                <select
                  id="categorie"
                  className="mt-1.5 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.categorie}
                  onChange={e => set('categorie', e.target.value)}
                >
                  <option value="">Choisir une catégorie</option>
                  <option value="Prestation">Prestation</option>
                  <option value="Entretien">Entretien</option>
                  <option value="Installation">Installation</option>
                  <option value="Réparation">Réparation</option>
                  <option value="Conseil">Conseil</option>
                  <option value="Urgence">Urgence</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              <div>
                <Label htmlFor="priorite" className="text-xs font-medium text-gray-600">Priorité</Label>
                <select
                  id="priorite"
                  className="mt-1.5 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.priorite}
                  onChange={e => set('priorite', e.target.value)}
                >
                  <option value="normale">Normale</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duree" className="text-xs font-medium text-gray-600">Durée estimée</Label>
                <Input
                  id="duree"
                  placeholder="ex: 2h, demi-journée"
                  className="mt-1.5 bg-white border-gray-200"
                  value={form.duree_estimee}
                  onChange={e => set('duree_estimee', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="montant" className="text-xs font-medium text-gray-600">Montant estimé (€)</Label>
                <Input
                  id="montant"
                  type="number"
                  min="0"
                  placeholder="0"
                  className="mt-1.5 bg-white border-gray-200"
                  value={form.montant_estime}
                  onChange={e => set('montant_estime', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Client & Planning</CardTitle>
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
                  value={form.client_id}
                  onChange={e => set('client_id', e.target.value)}
                >
                  <option value="">Sélectionner un client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.prenom} {c.nom} — {c.ville}</option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <Label htmlFor="adresse" className="text-xs font-medium text-gray-600">Lieu d&apos;intervention</Label>
              <Input
                id="adresse"
                placeholder="Adresse complète"
                className="mt-1.5 bg-white border-gray-200"
                value={form.adresse}
                onChange={e => set('adresse', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date" className="text-xs font-medium text-gray-600">Date prévue *</Label>
                <Input
                  id="date"
                  type="date"
                  className="mt-1.5 bg-white border-gray-200"
                  value={form.date_prevue}
                  onChange={e => set('date_prevue', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="heure" className="text-xs font-medium text-gray-600">Heure prévue</Label>
                <Input
                  id="heure"
                  type="time"
                  className="mt-1.5 bg-white border-gray-200"
                  value={form.heure_prevue}
                  onChange={e => set('heure_prevue', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="responsable" className="text-xs font-medium text-gray-600">Responsable</Label>
              <Input
                id="responsable"
                placeholder="Nom de la personne responsable"
                className="mt-1.5 bg-white border-gray-200"
                value={form.responsable}
                onChange={e => set('responsable', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="notes" className="text-xs font-medium text-gray-600">Notes internes</Label>
              <textarea
                id="notes"
                rows={2}
                placeholder="Informations utiles pour le responsable (accès, consignes...)"
                className="mt-1.5 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>
        )}

        <div className="flex items-center gap-3 justify-end">
          <Link href="/dashboard/missions">
            <Button variant="outline" type="button">Annuler</Button>
          </Link>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={saving}>
            <Save className="w-4 h-4 mr-1.5" />
            Créer la mission
          </Button>
        </div>
      </form>
    </div>
  )
}
