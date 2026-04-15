'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save, User } from 'lucide-react'
import Link from 'next/link'

export default function NouveauClientPage() {
  const router = useRouter()
  const { addClient } = useStore()

  const [form, setForm] = useState({
    prenom: '',
    nom: '',
    telephone: '',
    email: '',
    adresse: '',
    code_postal: '',
    ville: '',
    notes: '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.prenom.trim()) { setError('Le prénom est requis.'); return }
    if (!form.nom.trim()) { setError('Le nom est requis.'); return }
    if (!form.telephone.trim()) { setError('Le téléphone est requis.'); return }
    setSaving(true)
    const client = addClient({
      prenom: form.prenom.trim(),
      nom: form.nom.trim(),
      telephone: form.telephone.trim(),
      email: form.email.trim(),
      adresse: form.adresse.trim(),
      code_postal: form.code_postal.trim(),
      ville: form.ville.trim(),
      notes: form.notes.trim(),
    })
    router.push(`/dashboard/clients/${client.id}`)
  }

  return (
    <div className="space-y-5 max-w-2xl">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/clients">
          <Button variant="outline" size="sm" className="shrink-0">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Nouveau client</h1>
          <p className="text-sm text-gray-500 mt-0.5">Créer une nouvelle fiche client</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prenom" className="text-xs font-medium text-gray-600">Prénom *</Label>
                <Input
                  id="prenom"
                  placeholder="Prénom du client"
                  className="mt-1.5 bg-white border-gray-200"
                  value={form.prenom}
                  onChange={e => set('prenom', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="nom" className="text-xs font-medium text-gray-600">Nom *</Label>
                <Input
                  id="nom"
                  placeholder="Nom de famille"
                  className="mt-1.5 bg-white border-gray-200"
                  value={form.nom}
                  onChange={e => set('nom', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="telephone" className="text-xs font-medium text-gray-600">Téléphone *</Label>
              <Input
                id="telephone"
                placeholder="Numéro de téléphone"
                type="tel"
                className="mt-1.5 bg-white border-gray-200"
                value={form.telephone}
                onChange={e => set('telephone', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-xs font-medium text-gray-600">Email</Label>
              <Input
                id="email"
                placeholder="Adresse email"
                type="email"
                className="mt-1.5 bg-white border-gray-200"
                value={form.email}
                onChange={e => set('email', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Adresse</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div>
              <Label htmlFor="adresse" className="text-xs font-medium text-gray-600">Rue</Label>
              <Input
                id="adresse"
                placeholder="Rue et numéro"
                className="mt-1.5 bg-white border-gray-200"
                value={form.adresse}
                onChange={e => set('adresse', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code_postal" className="text-xs font-medium text-gray-600">Code postal</Label>
                <Input
                  id="code_postal"
                  placeholder="Code postal"
                  className="mt-1.5 bg-white border-gray-200"
                  value={form.code_postal}
                  onChange={e => set('code_postal', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="ville" className="text-xs font-medium text-gray-600">Ville</Label>
                <Input
                  id="ville"
                  placeholder="Ville"
                  className="mt-1.5 bg-white border-gray-200"
                  value={form.ville}
                  onChange={e => set('ville', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes" className="text-xs font-medium text-gray-600">Notes</Label>
              <textarea
                id="notes"
                rows={3}
                placeholder="Informations utiles à noter sur ce client"
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
          <Link href="/dashboard/clients">
            <Button variant="outline" type="button">Annuler</Button>
          </Link>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={saving}>
            <Save className="w-4 h-4 mr-1.5" />
            Créer le client
          </Button>
        </div>
      </form>
    </div>
  )
}
