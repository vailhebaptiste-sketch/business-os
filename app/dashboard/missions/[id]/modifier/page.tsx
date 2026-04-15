'use client'

import { useParams, useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save, CheckCircle, Wrench } from 'lucide-react'
import Link from 'next/link'

const CATEGORIES = ['Plomberie', 'Électricité', 'Menuiserie', 'Peinture', 'Maçonnerie', 'Chauffage', 'Climatisation', 'Toiture', 'Jardinage', 'Serrurerie', 'Autre']

export default function MissionModifierPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { missions, updateMission } = useStore()

  const mission = missions.find(m => m.id === id)

  const [titre, setTitre] = useState('')
  const [description, setDescription] = useState('')
  const [categorie, setCategorie] = useState('')
  const [priorite, setPriorite] = useState<'normale' | 'urgente'>('normale')
  const [responsable, setResponsable] = useState('')
  const [datePrevue, setDatePrevue] = useState('')
  const [heurePrevue, setHeurePrevue] = useState('')
  const [adresse, setAdresse] = useState('')
  const [dureeEstimee, setDureeEstimee] = useState('')
  const [montantEstime, setMontantEstime] = useState('')
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (mission) {
      setTitre(mission.titre)
      setDescription(mission.description)
      setCategorie(mission.categorie)
      setPriorite(mission.priorite)
      setResponsable(mission.responsable)
      setDatePrevue(mission.date_prevue)
      setHeurePrevue(mission.heure_prevue)
      setAdresse(mission.adresse)
      setDureeEstimee(mission.duree_estimee)
      setMontantEstime(String(mission.montant_estime || ''))
      setNotes(mission.notes)
    }
  }, [mission])

  if (!mission) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-gray-500">Mission introuvable.</p>
        <Link href="/dashboard/missions">
          <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-1.5" />Retour</Button>
        </Link>
      </div>
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!titre.trim()) return

    updateMission(id, {
      titre: titre.trim(),
      description: description.trim(),
      categorie,
      priorite,
      responsable: responsable.trim(),
      date_prevue: datePrevue,
      heure_prevue: heurePrevue,
      adresse: adresse.trim(),
      duree_estimee: dureeEstimee.trim(),
      montant_estime: parseFloat(montantEstime) || 0,
      notes: notes.trim(),
    })

    setSaved(true)
    setTimeout(() => router.push(`/dashboard/missions/${id}`), 800)
  }

  return (
    <div className="space-y-5 max-w-2xl">

      <div className="flex items-center gap-3">
        <Link href={`/dashboard/missions/${id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Modifier la mission</h1>
          <p className="text-sm text-gray-500 mt-0.5">{mission.titre}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Informations principales */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-gray-400" />
              Informations de la mission
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div>
              <Label htmlFor="titre" className="text-xs font-medium text-gray-600">Titre de la mission *</Label>
              <Input
                id="titre"
                value={titre}
                onChange={e => setTitre(e.target.value)}
                placeholder="Ex : Remplacement chauffe-eau"
                className="mt-1.5 bg-white border-gray-200"
                required
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-xs font-medium text-gray-600">Description</Label>
              <textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Détails de l'intervention..."
                rows={3}
                className="mt-1.5 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="categorie" className="text-xs font-medium text-gray-600">Catégorie</Label>
                <select
                  id="categorie"
                  value={categorie}
                  onChange={e => setCategorie(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <Label htmlFor="priorite" className="text-xs font-medium text-gray-600">Priorité</Label>
                <select
                  id="priorite"
                  value={priorite}
                  onChange={e => setPriorite(e.target.value as 'normale' | 'urgente')}
                  className="mt-1.5 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="normale">Normale</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="responsable" className="text-xs font-medium text-gray-600">Responsable</Label>
              <Input
                id="responsable"
                value={responsable}
                onChange={e => setResponsable(e.target.value)}
                placeholder="Nom du technicien"
                className="mt-1.5 bg-white border-gray-200"
              />
            </div>
          </CardContent>
        </Card>

        {/* Planification */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Planification & lieu</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date_prevue" className="text-xs font-medium text-gray-600">Date prévue *</Label>
                <Input
                  id="date_prevue"
                  type="date"
                  value={datePrevue}
                  onChange={e => setDatePrevue(e.target.value)}
                  className="mt-1.5 bg-white border-gray-200"
                  required
                />
              </div>
              <div>
                <Label htmlFor="heure_prevue" className="text-xs font-medium text-gray-600">Heure prévue</Label>
                <Input
                  id="heure_prevue"
                  type="time"
                  value={heurePrevue}
                  onChange={e => setHeurePrevue(e.target.value)}
                  className="mt-1.5 bg-white border-gray-200"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="adresse" className="text-xs font-medium text-gray-600">Adresse d&apos;intervention</Label>
              <Input
                id="adresse"
                value={adresse}
                onChange={e => setAdresse(e.target.value)}
                placeholder="Adresse complète"
                className="mt-1.5 bg-white border-gray-200"
              />
            </div>
          </CardContent>
        </Card>

        {/* Estimation */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Estimation</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duree_estimee" className="text-xs font-medium text-gray-600">Durée estimée</Label>
                <Input
                  id="duree_estimee"
                  value={dureeEstimee}
                  onChange={e => setDureeEstimee(e.target.value)}
                  placeholder="Ex : 2h, demi-journée"
                  className="mt-1.5 bg-white border-gray-200"
                />
              </div>
              <div>
                <Label htmlFor="montant_estime" className="text-xs font-medium text-gray-600">Montant estimé (€)</Label>
                <Input
                  id="montant_estime"
                  type="number"
                  min="0"
                  step="0.01"
                  value={montantEstime}
                  onChange={e => setMontantEstime(e.target.value)}
                  placeholder="0"
                  className="mt-1.5 bg-white border-gray-200"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes" className="text-xs font-medium text-gray-600">Notes internes</Label>
              <textarea
                id="notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Remarques, accès particulier, matériel à prévoir..."
                rows={3}
                className="mt-1.5 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </CardContent>
        </Card>

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
