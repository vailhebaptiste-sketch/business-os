export type Client = {
  id: string
  tenant_id: string
  nom: string
  prenom?: string
  telephone: string
  email?: string
  adresse?: string
  ville?: string
  code_postal?: string
  notes?: string
  created_at: string
  updated_at: string
}

export type Intervention = {
  id: string
  tenant_id: string
  client_id: string
  client?: Client
  titre: string
  description?: string
  statut: 'nouveau' | 'en_cours' | 'termine' | 'annule'
  priorite: 'normale' | 'urgente'
  technicien?: string
  date_prevue?: string
  adresse_intervention?: string
  notes_terrain?: string
  created_at: string
  updated_at: string
}

export type DevisLigne = {
  id: string
  description: string
  quantite: number
  prix_unitaire: number
  unite?: string
  total: number
}

export type Devis = {
  id: string
  tenant_id: string
  client_id: string
  intervention_id?: string
  client?: Client
  numero: string
  statut: 'brouillon' | 'envoye' | 'accepte' | 'refuse' | 'expire'
  lignes: DevisLigne[]
  total_ht: number
  tva_taux: number
  total_ttc: number
  validite_jours: number
  notes?: string
  created_at: string
  updated_at: string
}

export type DashboardStats = {
  clients_total: number
  interventions_en_cours: number
  devis_en_attente: number
  chiffre_affaires_mois: number
}
