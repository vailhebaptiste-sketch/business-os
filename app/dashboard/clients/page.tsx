'use client'

import { useStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserPlus, Phone, Mail, MapPin, ChevronRight, Users } from 'lucide-react'
import Link from 'next/link'

export default function ClientsPage() {
  const { clients, missions } = useStore()

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          {clients.length === 0
            ? 'Aucun client pour l\'instant'
            : <><span className="font-semibold text-gray-900">{clients.length}</span> client{clients.length > 1 ? 's' : ''}</>
          }
        </p>
        <Link href="/dashboard/clients/nouveau">
          <Button className="bg-blue-600 hover:bg-blue-700 shrink-0">
            <UserPlus className="w-4 h-4 mr-2" />
            Nouveau client
          </Button>
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
            <Users className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <p className="text-base font-semibold text-gray-700">Aucun client pour l&apos;instant</p>
            <p className="text-sm text-gray-400 mt-1">Ajoutez votre premier client pour commencer à gérer vos missions.</p>
          </div>
          <Link href="/dashboard/clients/nouveau">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Ajouter mon premier client
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {clients.map((client) => {
            const nbMissions = missions.filter(m => m.client_id === client.id).length
            return (
              <Link key={client.id} href={`/dashboard/clients/${client.id}`}>
                <Card className="hover:shadow-md transition-all cursor-pointer border-gray-200 hover:border-blue-200 group">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {client.prenom[0]}{client.nom[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{client.prenom} {client.nom}</p>
                          <Badge variant="secondary" className="text-xs">
                            {nbMissions} mission{nbMissions > 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 flex-wrap">
                          {client.telephone && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Phone className="w-3 h-3" /> {client.telephone}
                            </span>
                          )}
                          {client.email && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Mail className="w-3 h-3" /> {client.email}
                            </span>
                          )}
                          {client.ville && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <MapPin className="w-3 h-3" /> {client.ville}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0 hidden sm:block">
                        <p className="text-xs text-gray-400">Dernière visite</p>
                        <p className="text-xs font-medium text-gray-600 mt-0.5">
                          {new Date(client.derniere_visite).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
