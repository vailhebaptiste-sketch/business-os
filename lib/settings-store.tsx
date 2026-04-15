'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

export type UserProfile = {
  prenom: string
  nom: string
  email: string
  telephone: string
  poste: string
  avatarCouleur: string
  avatarInitiales: string
}

export type CompanySettings = {
  nom_entreprise: string
  siret: string
  adresse: string
  tva_default: number
  validite_devis: number
}

export type NotifPrefs = {
  notif_mission: boolean
  notif_devis: boolean
  notif_rappel: boolean
  notif_equipe: boolean
}

export type Settings = {
  profile: UserProfile
  company: CompanySettings
  notifs: NotifPrefs
}

type SettingsStore = Settings & {
  updateProfile: (data: Partial<UserProfile>) => void
  updateCompany: (data: Partial<CompanySettings>) => void
  updateNotifs: (data: Partial<NotifPrefs>) => void
}

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_PROFILE: UserProfile = {
  prenom: '',
  nom: '',
  email: '',
  telephone: '',
  poste: '',
  avatarCouleur: 'bg-blue-500',
  avatarInitiales: 'B',
}

const DEFAULT_COMPANY: CompanySettings = {
  nom_entreprise: '',
  siret: '',
  adresse: '',
  tva_default: 20,
  validite_devis: 30,
}

const DEFAULT_NOTIFS: NotifPrefs = {
  notif_mission: true,
  notif_devis: true,
  notif_rappel: true,
  notif_equipe: false,
}

const DEFAULT_SETTINGS: Settings = {
  profile: DEFAULT_PROFILE,
  company: DEFAULT_COMPANY,
  notifs: DEFAULT_NOTIFS,
}

// ─── Context ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'business-os-settings'

const SettingsContext = createContext<SettingsStore>({
  ...DEFAULT_SETTINGS,
  updateProfile: () => {},
  updateCompany: () => {},
  updateNotifs: () => {},
})

function loadSettings(): Settings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        profile: { ...DEFAULT_PROFILE, ...parsed.profile },
        company: { ...DEFAULT_COMPANY, ...parsed.company },
        notifs:  { ...DEFAULT_NOTIFS,  ...parsed.notifs  },
      }
    }
  } catch {}
  return DEFAULT_SETTINGS
}

function saveSettings(data: Settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setSettings(loadSettings())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) saveSettings(settings)
  }, [settings, hydrated])

  const updateProfile = useCallback((data: Partial<UserProfile>) => {
    setSettings(prev => ({ ...prev, profile: { ...prev.profile, ...data } }))
  }, [])

  const updateCompany = useCallback((data: Partial<CompanySettings>) => {
    setSettings(prev => ({ ...prev, company: { ...prev.company, ...data } }))
  }, [])

  const updateNotifs = useCallback((data: Partial<NotifPrefs>) => {
    setSettings(prev => ({ ...prev, notifs: { ...prev.notifs, ...data } }))
  }, [])

  return (
    <SettingsContext.Provider value={{
      ...settings,
      updateProfile,
      updateCompany,
      updateNotifs,
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  return useContext(SettingsContext)
}
