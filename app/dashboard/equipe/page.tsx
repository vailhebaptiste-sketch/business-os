'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Users, UserPlus, Mail, Shield,
  MoreHorizontal, Crown, User, Trash2, RefreshCw, Copy, CheckCircle, ChevronDown, ChevronUp
} from 'lucide-react'

type Role = 'administrateur' | 'collaborateur'

interface Permissions {
  clients: boolean
  missions: boolean
  devis: boolean
  planning: boolean
  equipe: boolean
  parametres: boolean
  import: boolean
}

interface Membre {
  id: string
  prenom: string
  nom: string
  email: string
  role: Role
  statut: 'actif' | 'invite'
  derniere_connexion?: string
  avatar: string
  permissions: Permissions
}

const ROLES: Record<Role, { label: string; desc: string; color: string; icon: React.ElementType }> = {
  administrateur: { label: 'Administrateur', desc: 'Accès complet — gère l\'équipe, les paramètres et toutes les données', color: 'text-purple-700 bg-purple-100', icon: Crown },
  collaborateur:  { label: 'Collaborateur',  desc: 'Accès limité aux sections autorisées par l\'administrateur',           color: 'text-blue-700 bg-blue-100',   icon: User },
}

const PERM_LABELS: Record<keyof Permissions, string> = {
  clients:    'Clients',
  missions:   'Missions',
  devis:      'Devis',
  planning:   'Planning',
  equipe:     'Équipe',
  parametres: 'Paramètres',
  import:     'Import de données',
}

const DEFAULT_PERMS_ADMIN: Permissions = { clients: true, missions: true, devis: true, planning: true, equipe: true, parametres: true, import: true }
const DEFAULT_PERMS_COLLAB: Permissions = { clients: false, missions: true, devis: false, planning: true, equipe: false, parametres: false, import: false }

// Espace vide par défaut — les membres seront chargés depuis Supabase
const MEMBRES_INITIAUX: Membre[] = []

export default function EquipePage() {
  const [membres, setMembres] = useState<Membre[]>(MEMBRES_INITIAUX)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<Role>('collaborateur')
  const [inviteSent, setInviteSent] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [openPermId, setOpenPermId] = useState<string | null>(null)
  const [codeCopied, setCodeCopied] = useState(false)
  const [resentIds, setResentIds] = useState<Set<string>>(new Set())

  // Code généré une fois et persisté en localStorage
  const [CODE_INVITATION] = useState<string>(() => {
    if (typeof window === 'undefined') return 'BOS-XXXX-XXXX'
    const stored = localStorage.getItem('business-os-invite-code')
    if (stored) return stored
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    const rand = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    const code = `BOS-${rand(4)}-${rand(4)}`
    localStorage.setItem('business-os-invite-code', code)
    return code
  })

  function changeRole(id: string, role: Role) {
    setMembres(m => m.map(x => x.id === id
      ? { ...x, role, permissions: role === 'administrateur' ? { ...DEFAULT_PERMS_ADMIN } : { ...DEFAULT_PERMS_COLLAB } }
      : x
    ))
    setOpenMenuId(null)
  }

  function togglePerm(id: string, perm: keyof Permissions) {
    setMembres(m => m.map(x => x.id === id
      ? { ...x, permissions: { ...x.permissions, [perm]: !x.permissions[perm] } }
      : x
    ))
  }

  function removeMembre(id: string) {
    setMembres(m => m.filter(x => x.id !== id))
    setOpenMenuId(null)
  }

  function sendInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail) return
    const perms = inviteRole === 'administrateur' ? { ...DEFAULT_PERMS_ADMIN } : { ...DEFAULT_PERMS_COLLAB }
    const nouv: Membre = {
      id: Date.now().toString(),
      prenom: inviteEmail.split('@')[0],
      nom: '',
      email: inviteEmail,
      role: inviteRole,
      statut: 'invite',
      avatar: inviteEmail[0].toUpperCase(),
      permissions: perms,
    }
    setMembres(m => [...m, nouv])
    setInviteSent(true)
    setInviteEmail('')
    setTimeout(() => { setInviteSent(false); setShowInviteForm(false) }, 2500)
  }

  function copyCode() {
    navigator.clipboard.writeText(CODE_INVITATION).catch(() => {})
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  function resendInvite(id: string) {
    setResentIds(prev => new Set(prev).add(id))
    setTimeout(() => setResentIds(prev => { const s = new Set(prev); s.delete(id); return s }), 2500)
  }

  const actifs  = membres.filter(m => m.statut === 'actif')
  const invites = membres.filter(m => m.statut === 'invite')

  return (
    <div className="space-y-5 max-w-3xl">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-500" />
            Équipe
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {actifs.length} membre{actifs.length > 1 ? 's' : ''} actif{actifs.length > 1 ? 's' : ''} · {invites.length} invitation{invites.length > 1 ? 's' : ''} en attente
          </p>
        </div>
        <Button onClick={() => setShowInviteForm(v => !v)} className="bg-blue-600 hover:bg-blue-700 shrink-0">
          <UserPlus className="w-4 h-4 mr-1.5" />
          Inviter un membre
        </Button>
      </div>

      {/* Formulaire invitation */}
      {showInviteForm && !inviteSent && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-blue-800 flex items-center gap-2">
              <Mail className="w-4 h-4" /> Inviter par email
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={sendInvite} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="invite-email" className="text-xs font-medium text-gray-600">Adresse email</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    placeholder="collaborateur@email.com"
                    className="mt-1.5 bg-white border-gray-200"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="invite-role" className="text-xs font-medium text-gray-600">Rôle de départ</Label>
                  <select
                    id="invite-role"
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value as Role)}
                    className="mt-1.5 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="collaborateur">Collaborateur</option>
                    <option value="administrateur">Administrateur</option>
                  </select>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Vous pourrez ajuster les permissions individuelles après l&apos;invitation.
              </p>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowInviteForm(false)}>Annuler</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  <Mail className="w-4 h-4 mr-1.5" /> Envoyer l&apos;invitation
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {inviteSent && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
          <p className="text-sm font-medium text-green-800">Invitation envoyée avec succès.</p>
        </div>
      )}

      {/* Code d'invitation rapide */}
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Code d&apos;invitation de l&apos;espace</p>
              <p className="text-xs text-gray-500">Partagez ce code pour que vos collaborateurs puissent rejoindre directement lors de leur inscription.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <code className="text-sm font-mono font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                {CODE_INVITATION}
              </code>
              <button onClick={copyCode} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
                {codeCopied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des membres actifs */}
      {actifs.length === 0 && invites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
            <Users className="w-7 h-7 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">Aucun membre pour l&apos;instant</p>
            <p className="text-xs text-gray-400 mt-1">Invitez vos collaborateurs pour commencer à partager votre espace.</p>
          </div>
          <Button onClick={() => setShowInviteForm(true)} className="bg-blue-600 hover:bg-blue-700" size="sm">
            <UserPlus className="w-4 h-4 mr-1.5" /> Inviter un membre
          </Button>
        </div>
      ) : (
        <>
          {actifs.length > 0 && (
            <Card className="border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  Membres actifs ({actifs.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {actifs.map(m => {
                  const roleInfo = ROLES[m.role]
                  const RoleIcon = roleInfo.icon
                  const isAdmin = m.role === 'administrateur'
                  const permOpen = openPermId === m.id

                  return (
                    <div key={m.id} className="border border-gray-100 rounded-xl overflow-hidden">
                      {/* Ligne membre */}
                      <div className="flex items-center gap-3 p-3 bg-gray-50">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {m.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900">{m.prenom} {m.nom}</p>
                          </div>
                          <p className="text-xs text-gray-500">{m.email} {m.derniere_connexion && `· ${m.derniere_connexion}`}</p>
                        </div>
                        <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${roleInfo.color}`}>
                          <RoleIcon className="w-3 h-3" />
                          {roleInfo.label}
                        </span>

                        {/* Bouton permissions */}
                        {!isAdmin && (
                          <button
                            onClick={() => setOpenPermId(permOpen ? null : m.id)}
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors shrink-0"
                          >
                            <Shield className="w-3.5 h-3.5" />
                            Accès
                            {permOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        )}

                        {/* Menu actions */}
                        <div className="relative shrink-0">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === m.id ? null : m.id)}
                            className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors text-gray-400"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          {openMenuId === m.id && (
                            <div className="absolute right-0 top-8 z-10 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-1 text-sm">
                              <p className="px-3 py-1.5 text-xs text-gray-400 font-medium uppercase tracking-wide">Changer le rôle</p>
                              {(Object.entries(ROLES) as [Role, typeof ROLES[Role]][])
                                .filter(([r]) => r !== m.role)
                                .map(([key, { label }]) => (
                                  <button key={key} onClick={() => changeRole(m.id, key)} className="w-full text-left px-3 py-2 hover:bg-gray-50 text-gray-700">
                                    Passer en {label}
                                  </button>
                                ))}
                              <div className="border-t border-gray-100 mt-1 pt-1">
                                <button onClick={() => removeMembre(m.id)} className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2">
                                  <Trash2 className="w-3.5 h-3.5" /> Retirer de l&apos;équipe
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Panneau permissions par personne (collaborateurs seulement) */}
                      {!isAdmin && permOpen && (
                        <div className="p-4 border-t border-gray-100 bg-white">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                            Accès de {m.prenom}
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {(Object.entries(PERM_LABELS) as [keyof Permissions, string][]).map(([key, label]) => {
                              const enabled = m.permissions[key]
                              return (
                                <button
                                  key={key}
                                  onClick={() => togglePerm(m.id, key)}
                                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all text-left ${
                                    enabled
                                      ? 'border-blue-200 bg-blue-50 text-blue-700'
                                      : 'border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300'
                                  }`}
                                >
                                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                    enabled ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                                  }`}>
                                    {enabled && <CheckCircle className="w-2.5 h-2.5 text-white" />}
                                  </div>
                                  {label}
                                </button>
                              )
                            })}
                          </div>
                          <p className="text-xs text-gray-400 mt-2.5">Les modifications sont enregistrées immédiatement.</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}

          {/* Invitations en attente */}
          {invites.length > 0 && (
            <Card className="border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  Invitations en attente ({invites.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {invites.map(m => (
                  <div key={m.id} className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                    <div className="w-9 h-9 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 font-bold text-xs shrink-0">
                      {m.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{m.email}</p>
                      <p className="text-xs text-amber-600">Invitation envoyée · en attente de confirmation</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${ROLES[m.role].color}`}>
                      {ROLES[m.role].label}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => resendInvite(m.id)}
                        className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-500 transition-colors"
                        title="Renvoyer l'invitation"
                      >
                        {resentIds.has(m.id)
                          ? <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                          : <RefreshCw className="w-3.5 h-3.5" />
                        }
                      </button>
                      <button onClick={() => removeMembre(m.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
