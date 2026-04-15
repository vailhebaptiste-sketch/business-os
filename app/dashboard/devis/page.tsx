'use client'

import { useStore } from '@/lib/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FileText, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const statutConfig = {
  brouillon: { label: 'Brouillon', bg: 'bg-gray-100', text: 'text-gray-600' },
  envoye:    { label: 'Envoyé',    bg: 'bg-blue-100',  text: 'text-blue-700' },
  accepte:   { label: 'Accepté',   bg: 'bg-green-100', text: 'text-green-700' },
  refuse:    { label: 'Refusé',    bg: 'bg-red-100',   text: 'text-red-700' },
  expire:    { label: 'Expiré',    bg: 'bg-gray-100',  text: 'text-gray-500' },
}

export default function DevisPage() {
  const { devis } = useStore()

  const enAttente = devis.filter(d => d.statut === 'envoye').length
  const acceptes  = devis.filter(d => d.statut === 'accepte').length

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex gap-3 text-sm text-gray-500">
          <span className="font-semibold text-gray-900">{devis.length} devis</span>
          {enAttente > 0 && <span>· {enAttente} en attente de réponse</span>}
          {acceptes  > 0 && <span>· {acceptes} accepté(s)</span>}
        </div>
        <Link href="/dashboard/devis/nouveau">
          <Button className="bg-blue-600 hover:bg-blue-700 shrink-0">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau devis
          </Button>
        </Link>
      </div>

      {devis.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center">
            <FileText className="w-7 h-7 text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">Aucun devis pour l&apos;instant</p>
            <p className="text-xs text-gray-400 mt-1">Créez votre premier devis et envoyez-le directement à votre client.</p>
          </div>
          <Link href="/dashboard/devis/nouveau">
            <Button className="bg-blue-600 hover:bg-blue-700" size="sm">
              <Plus className="w-4 h-4 mr-1.5" /> Créer mon premier devis
            </Button>
          </Link>
        </div>
      )}

      <div className="space-y-2">
        {devis.map((d) => {
          const cfg = statutConfig[d.statut]
          return (
            <Link key={d.id} href={`/dashboard/devis/${d.id}`}>
              <Card className="hover:shadow-md transition-all cursor-pointer border-gray-200 hover:border-blue-200 group">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 text-sm">{d.numero}</p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {d.client_nom} · {d.mission_titre}
                        {d.date_envoi && ` · Envoyé le ${new Date(d.date_envoi).toLocaleDateString('fr-FR')}`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-gray-900">{d.total_ttc.toLocaleString('fr-FR')} €</p>
                      <p className="text-xs text-gray-400">TTC</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

    </div>
  )
}
