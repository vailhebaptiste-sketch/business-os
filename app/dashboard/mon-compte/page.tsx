'use client'

import { useState, useEffect } from 'react'
import { useSettings } from '@/lib/settings-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Camera, Save, Bell, Shield, Crown, Eye, EyeOff, CheckCircle } from 'lucide-react'

const COULEURS = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500']

export default function MonComptePage() {
  const { profile, notifs, updateProfile, updateNotifs } = useSettings()

  const [couleur, setCouleur] = useState(profile.avatarCouleur)
  const [initiales, setInitiales] = useState(profile.avatarInitiales || 'B')
  const [prenom, setPrenom] = useState(profile.prenom)
  const [nom, setNom] = useState(profile.nom)
  const [email, setEmail] = useState(profile.email)
  const [telephone, setTelephone] = useState(profile.telephone)
  const [poste, setPoste] = useState(profile.poste)
  const [showPassword, setShowPassword] = useState(false)

  const [nRappel, setNRappel] = useState(notifs.notif_rappel)
  const [nDevis, setNDevis] = useState(notifs.notif_devis)
  const [nEquipe, setNEquipe] = useState(notifs.notif_equipe)
  const [nMission, setNMission] = useState(notifs.notif_mission)

  const [saved, setSaved] = useState(false)

  // Sync initiales when prenom changes
  function handlePrenomChange(val: string) {
    setPrenom(val)
    setInitiales((val[0]?.toUpperCase() || 'B') + (nom[0]?.toUpperCase() || ''))
  }
  function handleNomChange(val: string) {
    setNom(val)
    setInitiales((prenom[0]?.toUpperCase() || 'B') + (val[0]?.toUpperCase() || ''))
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    updateProfile({
      prenom: prenom.trim(),
      nom: nom.trim(),
      email: email.trim(),
      telephone: telephone.trim(),
      poste: poste.trim(),
      avatarCouleur: couleur,
      avatarInitiales: initiales || 'B',
    })
    updateNotifs({
      notif_rappel: nRappel,
      notif_devis: nDevis,
      notif_equipe: nEquipe,
      notif_mission: nMission,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-5 max-w-2xl">

      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <User className="w-5 h-5 text-gray-500" />
          Mon profil
        </h1>
        <p className="text-sm text-gray-500 mt-1">Personnalisez votre compte et vos préférences</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">

        {/* Avatar personnalisable */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Camera className="w-4 h-4 text-gray-400" />
              Avatar & Identité visuelle
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="flex items-center gap-6">
              {/* Aperçu avatar */}
              <div className={`w-16 h-16 rounded-full ${couleur} flex items-center justify-center text-white font-bold text-xl shrink-0`}>
                {initiales || 'B'}
              </div>
              <div className="space-y-3 flex-1">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-2">Couleur de l&apos;avatar</p>
                  <div className="flex gap-2">
                    {COULEURS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCouleur(c)}
                        className={`w-7 h-7 rounded-full ${c} transition-all ${couleur === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'}`}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Initiales affichées</p>
                  <Input
                    value={initiales}
                    onChange={e => setInitiales(e.target.value.slice(0, 2).toUpperCase())}
                    maxLength={2}
                    className="w-16 text-center bg-white border-gray-200 text-sm font-bold uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Rôle badge */}
            <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-100 rounded-lg">
              <Crown className="w-4 h-4 text-purple-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-purple-800">Administrateur</p>
                <p className="text-xs text-purple-600">Accès complet à toutes les fonctionnalités</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations personnelles */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prenom" className="text-xs font-medium text-gray-600">Prénom</Label>
                <Input
                  id="prenom"
                  value={prenom}
                  onChange={e => handlePrenomChange(e.target.value)}
                  placeholder="Votre prénom"
                  className="mt-1.5 bg-white border-gray-200"
                />
              </div>
              <div>
                <Label htmlFor="nom" className="text-xs font-medium text-gray-600">Nom</Label>
                <Input
                  id="nom"
                  value={nom}
                  onChange={e => handleNomChange(e.target.value)}
                  placeholder="Votre nom"
                  className="mt-1.5 bg-white border-gray-200"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email" className="text-xs font-medium text-gray-600">Adresse email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="mt-1.5 bg-white border-gray-200"
              />
            </div>
            <div>
              <Label htmlFor="telephone" className="text-xs font-medium text-gray-600">Téléphone</Label>
              <Input
                id="telephone"
                type="tel"
                value={telephone}
                onChange={e => setTelephone(e.target.value)}
                placeholder="Votre numéro"
                className="mt-1.5 bg-white border-gray-200"
              />
            </div>
            <div>
              <Label htmlFor="poste" className="text-xs font-medium text-gray-600">Poste / Titre</Label>
              <Input
                id="poste"
                value={poste}
                onChange={e => setPoste(e.target.value)}
                placeholder="ex : Gérant, Directeur, Responsable..."
                className="mt-1.5 bg-white border-gray-200"
              />
            </div>
          </CardContent>
        </Card>

        {/* Préférences */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-400" />
              Préférences de notification
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {[
              { id: 'notif_mission', label: 'Nouvelles missions',        desc: 'Recevoir les alertes à chaque nouvelle mission', value: nMission, set: setNMission },
              { id: 'notif_rappel',  label: 'Rappels de missions',       desc: 'Rappel 30 min avant chaque mission planifiée',  value: nRappel,  set: setNRappel },
              { id: 'notif_devis',   label: 'Suivi des devis',           desc: 'Alerte quand un devis est accepté ou refusé',   value: nDevis,   set: setNDevis },
              { id: 'notif_equipe',  label: 'Activité de l\'équipe',     desc: 'Être informé des actions de l\'équipe',        value: nEquipe,  set: setNEquipe },
            ].map(({ id, label, desc, value, set }) => (
              <label key={id} htmlFor={id} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  id={id}
                  checked={value}
                  onChange={e => set(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </label>
            ))}
          </CardContent>
        </Card>

        {/* Sécurité */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-400" />
              Mot de passe
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <p className="text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              La modification du mot de passe sera disponible après connexion à Supabase.
            </p>
            <div>
              <Label htmlFor="mdp-actuel" className="text-xs font-medium text-gray-600">Mot de passe actuel</Label>
              <Input id="mdp-actuel" type="password" placeholder="••••••••" disabled className="mt-1.5 bg-gray-50 border-gray-200" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mdp-new" className="text-xs font-medium text-gray-600">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input id="mdp-new" type={showPassword ? 'text' : 'password'} placeholder="••••••••" disabled className="mt-1.5 bg-gray-50 border-gray-200 pr-9" />
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-[calc(50%+3px)] text-gray-400">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="mdp-confirm" className="text-xs font-medium text-gray-600">Confirmer</Label>
                <Input id="mdp-confirm" type="password" placeholder="••••••••" disabled className="mt-1.5 bg-gray-50 border-gray-200" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" className={saved ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}>
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
