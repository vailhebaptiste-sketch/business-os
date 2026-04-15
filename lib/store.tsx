'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

export type Client = {
  id: string
  prenom: string
  nom: string
  telephone: string
  email: string
  adresse: string
  ville: string
  code_postal: string
  notes: string
  derniere_visite: string
  created_at: string
}

export type Mission = {
  id: string
  client_id: string
  client_nom: string
  titre: string
  description: string
  statut: 'nouveau' | 'en_cours' | 'termine' | 'annule'
  priorite: 'normale' | 'urgente'
  categorie: string
  responsable: string
  date_prevue: string
  heure_prevue: string
  adresse: string
  duree_estimee: string
  montant_estime: number
  notes: string
  created_at: string
}

export type FactureLigne = {
  id: string
  description: string
  quantite: number
  unite: string
  prix_unitaire: number
  total: number
}

export type Facture = {
  id: string
  client_id: string
  client_nom: string
  devis_id: string | null
  devis_numero: string | null
  numero: string
  statut: 'brouillon' | 'envoyee' | 'payee' | 'annulee'
  lignes: FactureLigne[]
  total_ht: number
  tva_taux: number
  total_ttc: number
  date_echeance: string
  date_paiement: string | null
  notes: string
  created_at: string
}

export type DevisLigne = {
  id: string
  description: string
  quantite: number
  unite: string
  prix_unitaire: number
  total: number
}

export type Devis = {
  id: string
  client_id: string
  client_nom: string
  mission_id: string
  mission_titre: string
  numero: string
  statut: 'brouillon' | 'envoye' | 'accepte' | 'refuse' | 'expire'
  lignes: DevisLigne[]
  total_ht: number
  tva_taux: number
  total_ttc: number
  validite_jours: number
  notes: string
  date_envoi: string | null
  created_at: string
}

// ─── Store type ───────────────────────────────────────────────────────────────

type StoreData = {
  clients: Client[]
  missions: Mission[]
  devis: Devis[]
  factures: Facture[]
  devisCounter: number
  factureCounter: number
}

type Store = StoreData & {
  loading: boolean
  organisationId: string | null
  // Clients
  addClient: (data: Omit<Client, 'id' | 'created_at' | 'derniere_visite'>) => Client
  updateClient: (id: string, data: Partial<Client>) => void
  deleteClient: (id: string) => void
  // Missions
  addMission: (data: Omit<Mission, 'id' | 'created_at' | 'statut'>) => Mission
  updateMission: (id: string, data: Partial<Mission>) => void
  deleteMission: (id: string) => void
  // Devis
  addDevis: (data: Omit<Devis, 'id' | 'created_at' | 'numero'>) => Devis
  updateDevis: (id: string, data: Partial<Devis>) => void
  deleteDevis: (id: string) => void
  // Factures
  addFacture: (data: Omit<Facture, 'id' | 'created_at' | 'numero'>) => Facture
  updateFacture: (id: string, data: Partial<Facture>) => void
  deleteFacture: (id: string) => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

const StoreContext = createContext<Store>({
  clients: [], missions: [], devis: [], factures: [],
  devisCounter: 0, factureCounter: 0,
  loading: true, organisationId: null,
  addClient: () => ({} as Client),
  updateClient: () => {},
  deleteClient: () => {},
  addMission: () => ({} as Mission),
  updateMission: () => {},
  deleteMission: () => {},
  addDevis: () => ({} as Devis),
  updateDevis: () => {},
  deleteDevis: () => {},
  addFacture: () => ({} as Facture),
  updateFacture: () => {},
  deleteFacture: () => {},
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function nowISO() { return new Date().toISOString() }

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<StoreData>({ clients: [], missions: [], devis: [], factures: [], devisCounter: 0, factureCounter: 0 })
  const [loading, setLoading] = useState(true)
  const [organisationId, setOrganisationId] = useState<string | null>(null)
  const orgIdRef = useRef<string | null>(null)
  const devisCounterRef = useRef(0)
  const factureCounterRef = useRef(0)

  // Keep refs in sync with state for use in callbacks
  useEffect(() => { orgIdRef.current = organisationId }, [organisationId])
  useEffect(() => { devisCounterRef.current = data.devisCounter }, [data.devisCounter])
  useEffect(() => { factureCounterRef.current = data.factureCounter }, [data.factureCounter])

  // ── Chargement initial ────────────────────────────────────────────────────

  useEffect(() => {
    const supabase = createClient()

    // Mode local sans Supabase — on charge depuis localStorage ou on reste vide
    if (!supabase) {
      setLoading(false)
      return
    }

    const loadData = async () => {
      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      // Récupérer le profil et l'organisation
      const { data: profile } = await supabase
        .from('profiles')
        .select('organisation_id')
        .eq('id', user.id)
        .single()

      if (!profile?.organisation_id) {
        setLoading(false)
        return
      }

      const orgId = profile.organisation_id
      setOrganisationId(orgId)
      orgIdRef.current = orgId

      // Charger toutes les données en parallèle
      const [clientsRes, missionsRes, devisRes, facturesRes, devisCounterRes, factureCounterRes] = await Promise.all([
        supabase.from('clients').select('*').eq('organisation_id', orgId).order('created_at'),
        supabase.from('missions').select('*').eq('organisation_id', orgId).order('created_at'),
        supabase.from('devis').select('*').eq('organisation_id', orgId).order('created_at'),
        supabase.from('factures').select('*').eq('organisation_id', orgId).order('created_at'),
        supabase.from('devis_counters').select('counter').eq('organisation_id', orgId).single(),
        supabase.from('facture_counters').select('counter').eq('organisation_id', orgId).single(),
      ])

      setData({
        clients: (clientsRes.data || []) as Client[],
        missions: (missionsRes.data || []) as Mission[],
        devis: (devisRes.data || []).map(d => ({ ...d, lignes: d.lignes || [] })) as Devis[],
        factures: (facturesRes.data || []).map(f => ({ ...f, lignes: f.lignes || [] })) as Facture[],
        devisCounter: devisCounterRes.data?.counter || 0,
        factureCounter: factureCounterRes.data?.counter || 0,
      })

      setLoading(false)
    }

    loadData()

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setData({ clients: [], missions: [], devis: [], factures: [], devisCounter: 0, factureCounter: 0 })
        setOrganisationId(null)
        orgIdRef.current = null
      } else if (event === 'SIGNED_IN') {
        loadData()
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // ── Sync Supabase (fire-and-forget) ──────────────────────────────────────

  const syncInsert = useCallback((table: string, row: Record<string, unknown>) => {
    if (!orgIdRef.current) return
    const supabase = createClient()
    if (!supabase) return
    supabase.from(table).insert({ ...row, organisation_id: orgIdRef.current })
      .then(({ error }) => { if (error) console.error(`[sync] insert ${table}:`, error) })
  }, [])

  const syncUpdate = useCallback((table: string, id: string, patch: Record<string, unknown>) => {
    if (!orgIdRef.current) return
    const supabase = createClient()
    if (!supabase) return
    supabase.from(table).update(patch).eq('id', id).eq('organisation_id', orgIdRef.current)
      .then(({ error }) => { if (error) console.error(`[sync] update ${table}:`, error) })
  }, [])

  const syncDelete = useCallback((table: string, id: string) => {
    if (!orgIdRef.current) return
    const supabase = createClient()
    if (!supabase) return
    supabase.from(table).delete().eq('id', id).eq('organisation_id', orgIdRef.current)
      .then(({ error }) => { if (error) console.error(`[sync] delete ${table}:`, error) })
  }, [])

  // ── Clients ───────────────────────────────────────────────────────────────

  const addClient = useCallback((raw: Omit<Client, 'id' | 'created_at' | 'derniere_visite'>): Client => {
    const client: Client = { ...raw, id: uid(), derniere_visite: todayISO(), created_at: nowISO() }
    setData(prev => ({ ...prev, clients: [...prev.clients, client] }))
    syncInsert('clients', client as unknown as Record<string, unknown>)
    return client
  }, [syncInsert])

  const updateClient = useCallback((id: string, patch: Partial<Client>) => {
    setData(prev => ({ ...prev, clients: prev.clients.map(c => c.id === id ? { ...c, ...patch } : c) }))
    syncUpdate('clients', id, patch as Record<string, unknown>)
  }, [syncUpdate])

  const deleteClient = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      clients: prev.clients.filter(c => c.id !== id),
      missions: prev.missions.filter(m => m.client_id !== id),
      devis: prev.devis.filter(d => d.client_id !== id),
    }))
    syncDelete('clients', id)
  }, [syncDelete])

  // ── Missions ──────────────────────────────────────────────────────────────

  const addMission = useCallback((raw: Omit<Mission, 'id' | 'created_at' | 'statut'>): Mission => {
    const mission: Mission = { ...raw, id: uid(), statut: 'nouveau', created_at: nowISO() }
    setData(prev => ({
      ...prev,
      missions: [...prev.missions, mission],
      clients: prev.clients.map(c => c.id === raw.client_id ? { ...c, derniere_visite: todayISO() } : c),
    }))
    syncInsert('missions', mission as unknown as Record<string, unknown>)
    return mission
  }, [syncInsert])

  const updateMission = useCallback((id: string, patch: Partial<Mission>) => {
    setData(prev => ({ ...prev, missions: prev.missions.map(m => m.id === id ? { ...m, ...patch } : m) }))
    syncUpdate('missions', id, patch as Record<string, unknown>)
  }, [syncUpdate])

  const deleteMission = useCallback((id: string) => {
    setData(prev => ({ ...prev, missions: prev.missions.filter(m => m.id !== id) }))
    syncDelete('missions', id)
  }, [syncDelete])

  // ── Devis ─────────────────────────────────────────────────────────────────

  const addDevis = useCallback((raw: Omit<Devis, 'id' | 'created_at' | 'numero'>): Devis => {
    const counter = devisCounterRef.current + 1
    const year = new Date().getFullYear()
    const devisItem: Devis = {
      ...raw,
      id: uid(),
      numero: `DEV-${year}-${String(counter).padStart(3, '0')}`,
      created_at: nowISO(),
    }
    setData(prev => ({ ...prev, devis: [...prev.devis, devisItem], devisCounter: counter }))
    devisCounterRef.current = counter
    syncInsert('devis', { ...devisItem, lignes: JSON.stringify(devisItem.lignes) } as unknown as Record<string, unknown>)
    // Mettre à jour le compteur en base
    if (orgIdRef.current) {
      const supabase = createClient()
      if (supabase) {
        supabase.from('devis_counters').upsert({ organisation_id: orgIdRef.current, counter })
          .then(({ error }) => { if (error) console.error('[sync] devis_counters:', error) })
      }
    }
    return devisItem
  }, [syncInsert])

  const updateDevis = useCallback((id: string, patch: Partial<Devis>) => {
    setData(prev => ({ ...prev, devis: prev.devis.map(d => d.id === id ? { ...d, ...patch } : d) }))
    const dbPatch = patch.lignes !== undefined
      ? { ...patch, lignes: JSON.stringify(patch.lignes) }
      : patch
    syncUpdate('devis', id, dbPatch as Record<string, unknown>)
  }, [syncUpdate])

  const deleteDevis = useCallback((id: string) => {
    setData(prev => ({ ...prev, devis: prev.devis.filter(d => d.id !== id) }))
    syncDelete('devis', id)
  }, [syncDelete])

  // ── Factures ──────────────────────────────────────────────────────────────

  const addFacture = useCallback((raw: Omit<Facture, 'id' | 'created_at' | 'numero'>): Facture => {
    const counter = factureCounterRef.current + 1
    const year = new Date().getFullYear()
    const facture: Facture = {
      ...raw,
      id: uid(),
      numero: `FAC-${year}-${String(counter).padStart(3, '0')}`,
      created_at: nowISO(),
    }
    setData(prev => ({ ...prev, factures: [...prev.factures, facture], factureCounter: counter }))
    factureCounterRef.current = counter
    syncInsert('factures', { ...facture, lignes: JSON.stringify(facture.lignes) } as unknown as Record<string, unknown>)
    if (orgIdRef.current) {
      const supabase = createClient()
      if (supabase) {
        supabase.from('facture_counters').upsert({ organisation_id: orgIdRef.current, counter })
          .then(({ error }) => { if (error) console.error('[sync] facture_counters:', error) })
      }
    }
    return facture
  }, [syncInsert])

  const updateFacture = useCallback((id: string, patch: Partial<Facture>) => {
    setData(prev => ({ ...prev, factures: prev.factures.map(f => f.id === id ? { ...f, ...patch } : f) }))
    const dbPatch = patch.lignes !== undefined
      ? { ...patch, lignes: JSON.stringify(patch.lignes) }
      : patch
    syncUpdate('factures', id, dbPatch as Record<string, unknown>)
  }, [syncUpdate])

  const deleteFacture = useCallback((id: string) => {
    setData(prev => ({ ...prev, factures: prev.factures.filter(f => f.id !== id) }))
    syncDelete('factures', id)
  }, [syncDelete])

  return (
    <StoreContext.Provider value={{
      ...data,
      loading,
      organisationId,
      addClient, updateClient, deleteClient,
      addMission, updateMission, deleteMission,
      addDevis, updateDevis, deleteDevis,
      addFacture, updateFacture, deleteFacture,
    }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  return useContext(StoreContext)
}
