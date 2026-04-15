'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Building2, Eye, EyeOff, ArrowRight,
  CheckCircle, ShieldCheck, Users, Loader2, AlertCircle,
} from 'lucide-react'
import { signIn, signUp } from '@/lib/supabase/actions'

type Mode = 'connexion' | 'inscription' | 'mot-de-passe'

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('connexion')
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<'admin' | 'collaborateur'>('admin')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await signIn(formData)
      if (result?.error) setError(result.error)
    })
  }

  function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('role', role)
    startTransition(async () => {
      const result = await signUp(formData)
      if (result?.error) setError(result.error)
    })
  }

  function handleResetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSuccess('Si cet email existe, vous recevrez un lien dans quelques minutes.')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Panneau gauche — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg">Business OS</span>
        </div>
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Gérez votre activité,<br />
            <span className="text-blue-200">depuis un seul endroit.</span>
          </h1>
          <p className="text-blue-200 text-lg">
            Clients, missions, devis, planning — tout centralisé pour vous et votre équipe.
          </p>
          <div className="space-y-3">
            {[
              'Accès multi-utilisateurs avec permissions',
              'Données synchronisées en temps réel',
              'Disponible sur mobile, tablette et desktop',
            ].map(f => (
              <div key={f} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-300 shrink-0" />
                <span className="text-blue-100 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-blue-400 text-xs">© 2026 Business OS · Tous droits réservés</p>
      </div>

      {/* Panneau droit — formulaire */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-8">
        <div className="w-full max-w-md space-y-6">

          {/* Logo mobile */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">Business OS</span>
          </div>

          {/* Titre */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'connexion' ? 'Se connecter'
                : mode === 'inscription' ? 'Créer un compte'
                : 'Réinitialiser le mot de passe'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {mode === 'connexion' ? 'Accédez à votre espace de travail'
                : mode === 'inscription' ? 'Commencez gratuitement, sans carte bancaire'
                : 'Un lien vous sera envoyé par email'}
            </p>
          </div>

          {/* Onglets */}
          {mode !== 'mot-de-passe' && (
            <div className="flex bg-gray-100 rounded-xl p-1">
              {(['connexion', 'inscription'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(null); setSuccess(null) }}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    mode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {m === 'connexion' ? 'Me connecter' : 'Créer un compte'}
                </button>
              ))}
            </div>
          )}

          {/* Erreur / succès */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
              <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* ─── Connexion ───────────────────────────────────────────────────── */}
          {mode === 'connexion' && (
            <form className="space-y-4" onSubmit={handleSignIn}>
              <div>
                <Label htmlFor="email" className="text-xs font-medium text-gray-600">Adresse email</Label>
                <Input id="email" name="email" type="email" placeholder="votre@email.com"
                  className="mt-1.5 bg-white border-gray-200" autoComplete="email" required />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label htmlFor="password" className="text-xs font-medium text-gray-600">Mot de passe</Label>
                  <button type="button" onClick={() => setMode('mot-de-passe')}
                    className="text-xs text-blue-600 hover:underline">
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="relative">
                  <Input id="password" name="password"
                    type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                    className="bg-white border-gray-200 pr-10" autoComplete="current-password" required />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={isPending} className="w-full bg-blue-600 hover:bg-blue-700 h-10">
                {isPending
                  ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Connexion...</>
                  : <><ArrowRight className="w-4 h-4 mr-1.5" />Se connecter</>}
              </Button>
            </form>
          )}

          {/* ─── Inscription ─────────────────────────────────────────────────── */}
          {mode === 'inscription' && (
            <form className="space-y-4" onSubmit={handleSignUp}>
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">Vous souhaitez :</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'admin' as const, label: 'Créer un espace', desc: 'Je configure mon équipe', icon: ShieldCheck },
                    { key: 'collaborateur' as const, label: 'Rejoindre une équipe', desc: "J'ai un code d'invitation", icon: Users },
                  ].map(({ key, label, desc, icon: Icon }) => (
                    <button key={key} type="button" onClick={() => setRole(key)}
                      className={`text-left p-3 rounded-xl border-2 transition-all ${
                        role === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon className={`w-3.5 h-3.5 ${role === key ? 'text-blue-600' : 'text-gray-400'}`} />
                        <p className={`text-sm font-semibold ${role === key ? 'text-blue-700' : 'text-gray-700'}`}>{label}</p>
                      </div>
                      <p className="text-xs text-gray-400">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="prenom" className="text-xs font-medium text-gray-600">Prénom *</Label>
                  <Input id="prenom" name="prenom" placeholder="Prénom" className="mt-1.5 bg-white border-gray-200" required />
                </div>
                <div>
                  <Label htmlFor="nom_user" className="text-xs font-medium text-gray-600">Nom *</Label>
                  <Input id="nom_user" name="nom" placeholder="Nom" className="mt-1.5 bg-white border-gray-200" required />
                </div>
              </div>

              <div>
                <Label htmlFor="email-signup" className="text-xs font-medium text-gray-600">Adresse email *</Label>
                <Input id="email-signup" name="email" type="email" placeholder="votre@email.com"
                  className="mt-1.5 bg-white border-gray-200" required />
              </div>

              {role === 'admin' ? (
                <div>
                  <Label htmlFor="nom_entreprise" className="text-xs font-medium text-gray-600">Nom de l&apos;entreprise *</Label>
                  <Input id="nom_entreprise" name="nom_entreprise" placeholder="Votre entreprise"
                    className="mt-1.5 bg-white border-gray-200" required />
                </div>
              ) : (
                <div>
                  <Label htmlFor="code_invitation" className="text-xs font-medium text-gray-600">Code d&apos;invitation *</Label>
                  <Input id="code_invitation" name="code_invitation" placeholder="BOS-XXXX-XXXX"
                    className="mt-1.5 bg-white border-gray-200 uppercase" required />
                  <p className="text-xs text-gray-400 mt-1">Demandez ce code dans Paramètres → Équipe.</p>
                </div>
              )}

              <div>
                <Label htmlFor="new-password" className="text-xs font-medium text-gray-600">Mot de passe *</Label>
                <div className="relative">
                  <Input id="new-password" name="password"
                    type={showPassword ? 'text' : 'password'} placeholder="8 caractères minimum"
                    className="mt-1.5 bg-white border-gray-200 pr-10" minLength={8} required />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={isPending} className="w-full bg-blue-600 hover:bg-blue-700 h-10">
                {isPending
                  ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />Création du compte...</>
                  : <><ArrowRight className="w-4 h-4 mr-1.5" />Créer mon compte</>}
              </Button>

              <p className="text-xs text-gray-400 text-center">
                En créant un compte, vous acceptez nos{' '}
                <span className="text-blue-600 hover:underline cursor-pointer">Conditions d&apos;utilisation</span>
                {' '}et notre{' '}
                <span className="text-blue-600 hover:underline cursor-pointer">Politique de confidentialité</span>.
              </p>
            </form>
          )}

          {/* ─── Mot de passe oublié ──────────────────────────────────────────── */}
          {mode === 'mot-de-passe' && (
            <form className="space-y-4" onSubmit={handleResetPassword}>
              <div>
                <Label htmlFor="email-reset" className="text-xs font-medium text-gray-600">Email de votre compte</Label>
                <Input id="email-reset" type="email" placeholder="votre@email.com"
                  className="mt-1.5 bg-white border-gray-200" required />
              </div>
              <Button type="submit" disabled={isPending} className="w-full bg-blue-600 hover:bg-blue-700 h-10">
                Envoyer le lien de réinitialisation
              </Button>
              <button type="button" onClick={() => setMode('connexion')}
                className="w-full text-sm text-gray-500 hover:text-gray-700">
                ← Retour à la connexion
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}
