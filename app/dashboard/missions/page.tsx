'use client'

import { useStore } from '@/lib/store'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, AlertTriangle, CheckCircle, Clock, Wrench, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const statutConfig = {
  nouveau:   { label: 'Nouveau',  bg: 'bg-blue-100',   text: 'text-blue-700',   icon: Clock },
  en_cours:  { label: 'En cours', bg: 'bg-orange-100', text: 'text-orange-700', icon: Wrench },
  termine:   { label: 'Terminé',  bg: 'bg-green-100',  text: 'text-green-700',  icon: CheckCircle },
  annule:    { label: 'Annulé',   bg: 'bg-gray-100',   text: 'text-gray-500',   icon: Clock },
}

const filters = [
  { label: 'Toutes',   value: 'toutes' },
  { label: 'Nouveau',  value: 'nouveau' },
  { label: 'En cours', value: 'en_cours' },
  { label: 'Terminé',  value: 'termine' },
]

export default function MissionsPage() {
  const { missions } = useStore()
  const [filtre, setFiltre] = useState('toutes')

  const missionsFiltrees = filtre === 'toutes'
    ? missions
    : missions.filter((m) => m.statut === filtre)

  return (
    <div className="space-y-5">

      {/* Filtres + bouton */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFiltre(f.value)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-all font-medium ${
                filtre === f.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Link href="/dashboard/missions/nouvelle">
          <Button className="bg-blue-600 hover:bg-blue-700 shrink-0">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle mission
          </Button>
        </Link>
      </div>

      {/* Compteur */}
      <p className="text-sm text-gray-500">
        <span className="font-semibold text-gray-900">{missionsFiltrees.length}</span> mission{missionsFiltrees.length > 1 ? 's' : ''}
      </p>

      {/* Liste */}
      <div className="space-y-2">
        {missionsFiltrees.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            {missions.length === 0
              ? <div className="space-y-3">
                  <Wrench className="w-8 h-8 text-gray-200 mx-auto" />
                  <p>Aucune mission pour l&apos;instant</p>
                  <Link href="/dashboard/missions/nouvelle">
                    <Button size="sm" variant="outline" className="text-xs">
                      <Plus className="w-3.5 h-3.5 mr-1" /> Créer ma première mission
                    </Button>
                  </Link>
                </div>
              : 'Aucune mission dans cette catégorie.'}
          </div>
        ) : (
          missionsFiltrees.map((mission) => {
            const cfg = statutConfig[mission.statut]
            const Icon = cfg.icon
            return (
              <Link key={mission.id} href={`/dashboard/missions/${mission.id}`}>
                <Card className="hover:shadow-md transition-all cursor-pointer border-gray-200 hover:border-blue-200 group">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-9 h-9 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                        <Icon className={`w-4 h-4 ${cfg.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-gray-900">{mission.titre}</p>
                              {mission.priorite === 'urgente' && (
                                <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                                  <AlertTriangle className="w-3 h-3" /> Urgent
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5">{mission.client_nom}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {mission.categorie} · {mission.date_prevue} à {mission.heure_prevue} · {mission.responsable}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
                              <Icon className="w-3 h-3" />
                              {cfg.label}
                            </span>
                            <span className="text-sm font-semibold text-gray-700">{mission.montant_estime} €</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors shrink-0 mt-2" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
