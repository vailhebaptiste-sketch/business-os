'use client'

import { useParams, useRouter, notFound } from 'next/navigation'
import { useStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft, Phone, Mail, MapPin, FileText,
  Wrench, Calendar, Edit, Plus, Clock, CheckCircle, Trash2
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

const statutConfig = {
  nouveau:  { label: 'Nouveau',  bg: 'bg-blue-100',   text: 'text-blue-700' },
  en_cours: { label: 'En cours', bg: 'bg-orange-100', text: 'text-orange-700' },
  termine:  { label: 'Terminé',  bg: 'bg-green-100',  text: 'text-green-700' },
  annule:   { label: 'Annulé',   bg: 'bg-gray-100',   text: 'text-gray-500' },
}

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { clients, missions, deleteClient } = useStore()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const client = clients.find((c) => c.id === id)
  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-gray-500">Client introuvable.</p>
        <Link href="/dashboard/clients">
          <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-1.5" />Retour</Button>
        </Link>
      </div>
    )
  }

  const clientMissions = missions.filter((m) => m.client_id === id)
  const initials = `${client.prenom[0]}${client.nom[0]}`

  function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    deleteClient(id)
    router.push('/dashboard/clients')
  }

  return (
    <div className="space-y-5 max-w-3xl">

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <Link href="/dashboard/clients">
            <Button variant="outline" size="sm" className="shrink-0">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Retour
            </Button>
          </Link>
          <div className="flex-1 min-w-0 flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <h1 className="text-lg md:text-xl font-bold text-gray-900 truncate">{client.prenom} {client.nom}</h1>
              <p className="text-sm text-gray-500 mt-0.5">{client.ville} · {clientMissions.length} mission{clientMissions.length > 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
        {/* Boutons d'action */}
        <div className="flex gap-2 flex-wrap">
          <Link href={`/dashboard/clients/${id}/modifier`}>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-1.5" />
              Modifier
            </Button>
          </Link>
          <Link href={`/dashboard/missions/nouvelle?client=${id}`}>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-1.5" />
              Mission
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Coordonnées */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              Coordonnées
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {client.telephone && (
              <a href={`tel:${client.telephone.replace(/\s/g, '')}`} className="flex items-center gap-3 hover:text-blue-600 group/tel">
                <Phone className="w-4 h-4 text-gray-400 group-hover/tel:text-blue-500 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Téléphone</p>
                  <p className="text-sm font-medium text-gray-900 group-hover/tel:text-blue-600">{client.telephone}</p>
                </div>
              </a>
            )}
            {client.email && (
              <a href={`mailto:${client.email}`} className="flex items-center gap-3 hover:text-blue-600 group/mail">
                <Mail className="w-4 h-4 text-gray-400 group-hover/mail:text-blue-500 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm font-medium text-gray-900 group-hover/mail:text-blue-600">{client.email}</p>
                </div>
              </a>
            )}
            {(client.adresse || client.ville) && (
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400">Adresse</p>
                  {client.adresse && <p className="text-sm font-medium text-gray-900">{client.adresse}</p>}
                  <p className="text-sm text-gray-600">{client.code_postal} {client.ville}</p>
                </div>
              </div>
            )}
            {client.notes && (
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                <p className="text-xs font-medium text-amber-700 mb-1">Notes</p>
                <p className="text-sm text-amber-800">{client.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activité */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              Activité
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-gray-900">{clientMissions.length}</p>
                <p className="text-xs text-gray-500 mt-0.5">Mission{clientMissions.length > 1 ? 's' : ''}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-xs text-gray-500 mb-1">Dernière visite</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(client.derniere_visite).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {client.telephone && (
                <a href={`tel:${client.telephone.replace(/\s/g, '')}`}>
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4 mr-1.5" />
                    Appeler
                  </Button>
                </a>
              )}
              {client.email && (
                <a href={`mailto:${client.email}`}>
                  <Button variant="outline" size="sm">
                    <Mail className="w-4 h-4 mr-1.5" />
                    Envoyer un email
                  </Button>
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Missions du client */}
      <Card className="border-gray-200">
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-gray-400" />
            Missions ({clientMissions.length})
          </CardTitle>
          <Link href={`/dashboard/missions/nouvelle?client=${id}`}>
            <Button variant="ghost" size="sm" className="text-xs text-blue-600 h-7 px-2 hover:bg-blue-50">
              <Plus className="w-3 h-3 mr-1" /> Nouvelle mission
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="pt-0">
          {clientMissions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Aucune mission pour ce client</p>
          ) : (
            <div className="space-y-2">
              {clientMissions.map((mission) => {
                const cfg = statutConfig[mission.statut]
                return (
                  <Link key={mission.id} href={`/dashboard/missions/${mission.id}`}>
                    <div className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0`}>
                          {mission.statut === 'termine' ? (
                            <CheckCircle className={`w-4 h-4 ${cfg.text}`} />
                          ) : (
                            <Clock className={`w-4 h-4 ${cfg.text}`} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{mission.titre}</p>
                          <p className="text-xs text-gray-500">{mission.date_prevue} · {mission.responsable}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                          {cfg.label}
                        </span>
                        <span className="text-sm font-semibold text-gray-700">{mission.montant_estime} €</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
