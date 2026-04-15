'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// ─── Connexion ────────────────────────────────────────────────────────────────

export async function signIn(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Email ou mot de passe incorrect.' }
  }

  redirect('/dashboard')
}

// ─── Inscription ──────────────────────────────────────────────────────────────

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const prenom = formData.get('prenom') as string
  const nom = formData.get('nom') as string
  const nomEntreprise = formData.get('nom_entreprise') as string
  const role = formData.get('role') as 'admin' | 'collaborateur'
  const codeInvitation = formData.get('code_invitation') as string

  // Validation basique
  if (!email || !password || !prenom || !nom) {
    return { error: 'Tous les champs obligatoires doivent être remplis.' }
  }
  if (password.length < 8) {
    return { error: 'Le mot de passe doit contenir au moins 8 caractères.' }
  }

  // 1. Créer le compte Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || ''}/auth/callback`,
    },
  })

  if (authError || !authData.user) {
    if (authError?.message?.includes('already registered')) {
      return { error: 'Cet email est déjà utilisé. Connectez-vous à la place.' }
    }
    return { error: 'Erreur lors de la création du compte. Réessayez.' }
  }

  const userId = authData.user.id
  let organisationId: string | null = null

  if (role === 'admin') {
    // 2a. Créer une nouvelle organisation
    const { data: org, error: orgError } = await supabase
      .from('organisations')
      .insert({ nom: nomEntreprise || `${prenom} ${nom}` })
      .select('id')
      .single()

    if (orgError || !org) {
      return { error: 'Erreur lors de la création de votre espace.' }
    }

    organisationId = org.id

    // Initialiser le compteur de devis
    await supabase.from('devis_counters').insert({ organisation_id: organisationId, counter: 0 })

  } else {
    // 2b. Rejoindre une organisation via code d'invitation
    const { data: invite, error: inviteError } = await supabase
      .from('invitations')
      .select('organisation_id')
      .eq('code', codeInvitation?.toUpperCase())
      .eq('active', true)
      .single()

    if (inviteError || !invite) {
      return { error: 'Code d\'invitation invalide ou expiré.' }
    }

    organisationId = invite.organisation_id
  }

  // 3. Créer le profil utilisateur
  const { error: profileError } = await supabase.from('profiles').insert({
    id: userId,
    organisation_id: organisationId,
    prenom,
    nom,
    role: role === 'admin' ? 'admin' : 'collaborateur',
  })

  if (profileError) {
    return { error: 'Erreur lors de la configuration du profil.' }
  }

  redirect('/dashboard')
}

// ─── Déconnexion ──────────────────────────────────────────────────────────────

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
