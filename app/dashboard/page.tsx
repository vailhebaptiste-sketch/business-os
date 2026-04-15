'use client'

import { useStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Users, Wrench, FileText, TrendingUp,
  Clock, AlertCircle, ArrowRight, Plus, AlertTriangle
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { clients, missions, devis } = useStore()

  const missionsActives = missions.filter(m => m.statut === 'en_cours' || m.statut === 'nouveau')
  const devisEnAttente = devis.filter(d => d.statut === 'envoye')
  const caEstime = missions.filter(m => m.statut === 'termine').reduce((s, m) => s + m.montant_estime, 0)
  const isEmpty = clients.length === 0 && missions.length === 0 && devis.length === 0

  const stats = [
    { title: 'Clients', value: String(clients.length), sub: clients.length === 0 ? 'Aucun client pour l\'instant' : `${clients.length} fiche${clients.length > 1 ? 's' : ''}`, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', href: '/dashboard/clients' },
    { title: 'Missions actives', value: String(missionsActives.length), sub: missionsActives.length === 0 ? 'Aucune mission en cours' : `${missionsActives.filter(m => m.priorite === 'urgente').length} urgente(s)`, icon: Wrench, color: 'text-orange-600', bg: 'bg-orange-50', href: '/dashboard/missions' },
    { title: 'Devis en attente', value: String(devisEnAttente.length), sub: devisEnAttente.length === 0 ? 'Aucun devis envoyé' : 'En attente de réponse', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50', href: '/dashboard/devis' },
    { title: 'CA ce mois', value: caEstime === 0 ? '0 €' : `${caEstime.toLocaleString('fr-FR')} €`, sub: 'Missions terminées ce mois', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', href: '/dashboard/devis' },
  ]

  return (
    <div className="space-y-6">

      {/* Bandeau bienvenue */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-5 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Bienvenue sur Business OS 👋</h2>
            <p className="text-blue-100 text-sm mt-1">
              {isEmpty
                ? 'Commencez par ajouter votre premier client.'
                : `${clients.length} client${clients.length > 1 ? 's' : ''} · ${missionsActives.length} mission${missionsActives.length > 1 ? 's' : ''} active${missionsActives.length > 1 ? 's' : ''}`}
            </p>
          </div>
          <Link href="/dashboard/missions/nouvelle" className="self-start sm:self-auto">
            <Button variant="secondary" size="sm" className="bg-white text-blue-700 hover:bg-blue-50 font-medium">
              <Plus className="w-4 h-4 mr-1.5" />
              Nouvelle mission
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="hover:shadow-md transition-all cursor-pointer border-gray-200 hover:border-blue-200">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1.5">{stat.value}</p>
                      <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
                    </div>
                    <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center shrink-0`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Missions récentes */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              Missions récentes
            </CardTitle>
            <Link href="/dashboard/missions">
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 h-7 px-2 hover:bg-blue-50">
                Voir tout <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {missions.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <Wrench className="w-8 h-8 text-gray-200 mx-auto" />
                <p className="text-sm text-gray-400">Aucune mission pour l&apos;instant</p>
                <Link href="/dashboard/missions/nouvelle">
                  <Button size="sm" variant="outline" className="text-xs">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Créer une mission
                  </Button>
                </Link>
              </div>
            ) : (
              [...missions].reverse().slice(0, 3).map((mission) => (
                <Link key={mission.id} href={`/dashboard/missions/${mission.id}`}>
                  <div className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{mission.titre}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{mission.client_nom} · {mission.date_prevue} à {mission.heure_prevue}</p>
                    </div>
                    <div className="flex items-center gap-1.5 ml-3 shrink-0">
                      {mission.priorite === 'urgente' && (
                        <span className="flex items-center gap-0.5 text-xs text-red-600 font-medium">
                          <AlertTriangle className="w-3 h-3" />
                        </span>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {mission.statut === 'en_cours' ? 'En cours' : mission.statut === 'nouveau' ? 'Nouveau' : mission.statut === 'termine' ? 'Terminé' : 'Annulé'}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Actions rapides */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3 space-y-0">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-gray-400" />
              Actions rapides
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {[
              { href: '/dashboard/clients/nouveau', icon: Users, iconBg: 'bg-blue-100', iconColor: 'text-blue-600', arrowHover: 'group-hover:text-blue-500', borderHover: 'hover:border-blue-300 hover:bg-blue-50', title: 'Ajouter un client', sub: 'Créer une fiche client' },
              { href: '/dashboard/missions/nouvelle', icon: Wrench, iconBg: 'bg-orange-100', iconColor: 'text-orange-600', arrowHover: 'group-hover:text-orange-500', borderHover: 'hover:border-orange-300 hover:bg-orange-50', title: 'Créer une mission', sub: 'Urgence ou planifiée' },
              { href: '/dashboard/devis/nouveau', icon: FileText, iconBg: 'bg-purple-100', iconColor: 'text-purple-600', arrowHover: 'group-hover:text-purple-500', borderHover: 'hover:border-purple-300 hover:bg-purple-50', title: 'Nouveau devis', sub: 'Générer et envoyer' },
            ].map((action) => {
              const Icon = action.icon
              return (
                <Link key={action.href} href={action.href}>
                  <div className={`flex items-center justify-between p-3 border border-dashed border-gray-200 ${action.borderHover} rounded-lg transition-all cursor-pointer group`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${action.iconBg} rounded-lg flex items-center justify-center shrink-0`}>
                        <Icon className={`w-4 h-4 ${action.iconColor}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{action.title}</p>
                        <p className="text-xs text-gray-400">{action.sub}</p>
                      </div>
                    </div>
                    <ArrowRight className={`w-4 h-4 text-gray-300 ${action.arrowHover} transition-colors shrink-0`} />
                  </div>
                </Link>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
