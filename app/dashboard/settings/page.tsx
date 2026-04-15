'use client'

import { useState } from 'react'
import { useSettings } from '@/lib/settings-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings, User, Building2, Bell, Shield, Save, CheckCircle } from 'lucide-react'

export default function SettingsPage() {
  const { profile, company, notifs, updateProfile, updateCompany, updateNotifs } = useSettings()
  const [saved, setSaved] = useState(false)
  const [pwdError, setPwdError] = useState('')

  // Local form state (mirrors store, committed on save)
  const [pPrenom, setPPrenom] = useState(profile.prenom)
  const [pNom, setPNom] = useState(profile.nom)
  const [pEmail, setPEmail] = useState(profile.email)
  const [pTel, setPTel] = useState(profile.telephone)

  const [cNom, setCNom] = useState(company.nom_entreprise)
  const [cSiret, setCSiret] = useState(company.siret)
  const [cAdresse, setCAdresse] = useState(company.adresse)
  const [cTva, setCTva] = useState(String(company.tva_default))
  const [cValidite, setCValidite] = useState(String(company.validite_devis))

  const [nMission, setNMission] = useState(notifs.notif_mission)
  const [nDevis, setNDevis] = useState(notifs.notif_devis)
  const [nRappel, setNRappel] = useState(notifs.notif_rappel)
  const [nEquipe, setNEquipe] = useState(notifs.notif_equipe)

  const [mdpActuel, setMdpActuel] = useState('')
  const [mdpNew, setMdpNew] = useState('')
  const [mdpConfirm, setMdpConfirm] = useState('')

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setPwdError('')

    // Validate password if filled
    if (mdpNew || mdpConfirm) {
      if (!mdpActuel) { setPwdError('Entrez votre mot de passe actuel.'); return }
      if (mdpNew.length < 8) { setPwdError('Le nouveau mot de passe doit contenir au moins 8 caractères.'); return }
      if (mdpNew !== mdpConfirm) { setPwdError('Les mots de passe ne correspondent pas.'); return }
    }

    // Persist to settings store (localStorage)
    updateProfile({
      prenom: pPrenom.trim(),
      nom: pNom.trim(),
      email: pEmail.trim(),
      telephone: pTel.trim(),
      avatarInitiales: (pPrenom[0] || 'B').toUpperCase() + (pNom[0] || '').toUpperCase(),
    })

    updateCompany({
      nom_entreprise: cNom.trim(),
      siret: cSiret.trim(),
      adresse: cAdresse.trim(),
      tva_default: parseFloat(cTva) || 20,
      validite_devis: parseInt(cValidite) || 30,
    })

    updateNotifs({
      notif_mission: nMission,
      notif_devis: nDevis,
      notif_rappel: nRappel,
      notif_equipe: nEquipe,
    })

    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-5 max-w-2xl">

      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-500" />
          Paramètres
        </h1>
        <p className="text-sm text-gray-500 mt-1">Configurez votre espace de travail</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">

        {/* Profil */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              Profil utilisateur
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prenom" className="text-xs font-medium text-gray-600">Prénom</Label>
                <Input id="prenom" value={pPrenom} onChange={e => setPPrenom(e.target.value)} className="mt-1.5 bg-white border-gray-200" />
              </div>
              <div>
                <Label htmlFor="nom" className="text-xs font-medium text-gray-600">Nom</Label>
                <Input id="nom" value={pNom} onChange={e => setPNom(e.target.value)} placeholder="Votre nom" className="mt-1.5 bg-white border-gray-200" />
              </div>
            </div>
            <div>
              <Label htmlFor="email" className="text-xs font-medium text-gray-600">Adresse email</Label>
              <Input id="email" type="email" value={pEmail} onChange={e => setPEmail(e.target.value)} placeholder="votre@email.com" className="mt-1.5 bg-white border-gray-200" />
            </div>
            <div>
              <Label htmlFor="telephone" className="text-xs font-medium text-gray-600">Téléphone</Label>
              <Input id="telephone" type="tel" value={pTel} onChange={e => setPTel(e.target.value)} placeholder="Votre numéro" className="mt-1.5 bg-white border-gray-200" />
            </div>
          </CardContent>
        </Card>

        {/* Entreprise */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-400" />
              Informations entreprise
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div>
              <Label htmlFor="nom_entreprise" className="text-xs font-medium text-gray-600">Nom de l&apos;entreprise</Label>
              <Input id="nom_entreprise" value={cNom} onChange={e => setCNom(e.target.value)} placeholder="Nom de votre entreprise" className="mt-1.5 bg-white border-gray-200" />
            </div>
            <div>
              <Label htmlFor="siret" className="text-xs font-medium text-gray-600">SIRET</Label>
              <Input id="siret" value={cSiret} onChange={e => setCSiret(e.target.value)} placeholder="Numéro SIRET (14 chiffres)" className="mt-1.5 bg-white border-gray-200" />
            </div>
            <div>
              <Label htmlFor="adresse_pro" className="text-xs font-medium text-gray-600">Adresse professionnelle</Label>
              <Input id="adresse_pro" value={cAdresse} onChange={e => setCAdresse(e.target.value)} placeholder="Adresse de votre entreprise" className="mt-1.5 bg-white border-gray-200" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tva_default" className="text-xs font-medium text-gray-600">TVA par défaut (%)</Label>
                <select
                  id="tva_default"
                  value={cTva}
                  onChange={e => setCTva(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="20">20 % — taux normal</option>
                  <option value="10">10 % — taux intermédiaire</option>
                  <option value="5.5">5,5 % — taux réduit</option>
                  <option value="0">0 % — exonéré</option>
                </select>
              </div>
              <div>
                <Label htmlFor="validite_devis" className="text-xs font-medium text-gray-600">Validité devis (jours)</Label>
                <Input id="validite_devis" type="number" value={cValidite} onChange={e => setCValidite(e.target.value)} min="1" className="mt-1.5 bg-white border-gray-200" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-400" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {[
              { id: 'notif_mission', label: 'Nouvelle mission assignée',     desc: 'Recevoir une alerte à chaque nouvelle mission',      value: nMission, set: setNMission },
              { id: 'notif_devis',   label: 'Devis accepté ou refusé',       desc: 'Être notifié du changement de statut d\'un devis',   value: nDevis,   set: setNDevis },
              { id: 'notif_rappel',  label: 'Rappel mission du jour',         desc: 'Rappel quotidien des missions prévues',             value: nRappel,  set: setNRappel },
              { id: 'notif_equipe',  label: 'Activité de l\'équipe',         desc: 'Être informé des actions des membres',              value: nEquipe,  set: setNEquipe },
            ].map(({ id, label, desc, value, set }) => (
              <label key={id} htmlFor={id} className="flex items-start gap-3 cursor-pointer group">
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
              <Label htmlFor="mdp_actuel" className="text-xs font-medium text-gray-600">Mot de passe actuel</Label>
              <Input id="mdp_actuel" type="password" placeholder="••••••••" value={mdpActuel} onChange={e => setMdpActuel(e.target.value)} className="mt-1.5 bg-white border-gray-200" disabled />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mdp_new" className="text-xs font-medium text-gray-600">Nouveau mot de passe</Label>
                <Input id="mdp_new" type="password" placeholder="••••••••" value={mdpNew} onChange={e => setMdpNew(e.target.value)} className="mt-1.5 bg-white border-gray-200" disabled />
              </div>
              <div>
                <Label htmlFor="mdp_confirm" className="text-xs font-medium text-gray-600">Confirmer le mot de passe</Label>
                <Input id="mdp_confirm" type="password" placeholder="••••••••" value={mdpConfirm} onChange={e => setMdpConfirm(e.target.value)} className="mt-1.5 bg-white border-gray-200" disabled />
              </div>
            </div>
            {pwdError && <p className="text-sm text-red-600">{pwdError}</p>}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" className={saved ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}>
            {saved
              ? <><CheckCircle className="w-4 h-4 mr-1.5" /> Enregistré</>
              : <><Save className="w-4 h-4 mr-1.5" /> Enregistrer les modifications</>
            }
          </Button>
        </div>
      </form>
    </div>
  )
}
