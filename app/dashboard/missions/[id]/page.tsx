'use client'

import { useParams, useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft, User, MapPin, Calendar, Clock, Wrench,
  CheckCircle, AlertTriangle, Euro, FileText, Phone, Edit, Play, XCircle, Trash2
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

const statutConfig = {
  nouveau:  { label: 'Nouveau',  bg: 'bg-blue-100',   text: 'text-blue-700' },
  en_cours: { label: 'En cours', bg: 'bg-orange-100', text: 'text-orange-700' },
  termine:  { label: 'Terminé',  bg: 'bg-green-100',  text: 'text-green-700' },
  annule:   { label: 'Annulé',   bg: 'bg-gray-100',   text: 'text-gray-500' },
}

export default function MissionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { missions, clients, updateMission, deleteMission } = useStore()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const mission = missions.find((m) => m.id === id)

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

  const cfg = statutConfig[mission.statut]
  const client = clients.find(c => c.id === mission.client_id)

  function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    deleteMission(id)
    router.push('/dashboard/missions')
  }

  return (
    <div className="space-y-5 max-w-3xl">

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <Link href="/dashboard/missions">
            <Button variant="outline" size="sm" className="shrink-0">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Retour
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg md:text-xl font-bold text-gray-900">{mission.titre}</h1>
              {mission.priorite === 'urgente' && (
                <span className="flex items-center gap-1 text-xs text-red-600 font-semibold bg-red-50 px-2 py-1 rounded-full">
                  <AlertTriangle className="w-3 h-3" /> Urgent
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">{mission.categorie} · Créée le {new Date(mission.created_at).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
        {/* Boutons d'action — pleine largeur mobile */}
        <div className="flex items-center gap-2 flex-wrap">
          {mission.statut === 'nouveau' && (
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600" onClick={() => updateMission(id, { statut: 'en_cours' })}>
              <Play className="w-4 h-4 mr-1.5" />
              Démarrer
            </Button>
          )}
          {mission.statut === 'en_cours' && (
            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateMission(id, { statut: 'termine' })}>
              <CheckCircle className="w-4 h-4 mr-1.5" />
              Terminer
            </Button>
          )}
          {(mission.statut === 'nouveau' || mission.statut === 'en_cours') && (
            <Button size="sm" variant="outline" className="text-gray-500" onClick={() => updateMission(id, { statut: 'annule' })}>
              <XCircle className="w-4 h-4 mr-1.5" />
              Annuler
            </Button>
          )}
          {mission.statut === 'annule' && (
            <Button size="sm" variant="outline" onClick={() => updateMission(id, { statut: 'nouveau' })}>
              Réouvrir
            </Button>
          )}
          <Link href={`/dashboard/missions/${id}/modifier`}>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-1.5" />
              Modifier
            </Button>
          </Link>
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

      {/* Statut + montant */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full ${cfg.bg} ${cfg.text}`}>
          {cfg.label}
        </span>
        <span className="text-sm text-gray-500">·</span>
        <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
          <Euro className="w-3.5 h-3.5" />
          {mission.montant_estime} € estimé
        </span>
        {mission.duree_estimee && (
          <>
            <span className="text-sm text-gray-500">·</span>
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {mission.duree_estimee}
            </span>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Infos mission */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-gray-400" />
              Détails de la mission
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {mission.description && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Description</p>
                <p className="text-sm text-gray-700 mt-1">{mission.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Catégorie</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{mission.categorie}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Responsable</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{mission.responsable || '—'}</p>
              </div>
            </div>
            {mission.notes && (
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                <p className="text-xs font-medium text-amber-700 mb-1">Notes</p>
                <p className="text-sm text-amber-800">{mission.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Infos client + lieu */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              Client & lieu
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                {mission.client_nom.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{mission.client_nom}</p>
                <Link href={`/dashboard/clients/${mission.client_id}`} className="text-xs text-blue-600 hover:underline">
                  Voir la fiche client →
                </Link>
              </div>
            </div>
            {mission.adresse && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Adresse d&apos;intervention
                </p>
                <p className="text-sm text-gray-700 mt-1">{mission.adresse}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Date prévue
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">{mission.date_prevue}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Heure
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">{mission.heure_prevue || '—'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" />
            Actions liées
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            <Link href={`/dashboard/devis/nouveau?mission=${id}`}>
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-1.5" />
                Créer un devis
              </Button>
            </Link>
            {client?.telephone && (
              <a href={`tel:${client.telephone.replace(/\s/g, '')}`}>
                <Button variant="outline" size="sm">
                  <Phone className="w-4 h-4 mr-1.5" />
                  Appeler le client
                </Button>
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
