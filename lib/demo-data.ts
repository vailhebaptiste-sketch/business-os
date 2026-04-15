// Données vides — ajoutez vos propres clients, missions et devis via l'interface.
// Connectez Supabase dans .env.local pour persister les données.

export const clients: {
  id: string
  nom: string
  prenom: string
  telephone: string
  email: string
  adresse: string
  ville: string
  code_postal: string
  notes: string
  missions: number
  derniere_visite: string
}[] = []

export const missions: {
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
}[] = []

export const devis: {
  id: string
  client_id: string
  client_nom: string
  mission_id: string
  mission_titre: string
  numero: string
  statut: 'brouillon' | 'envoye' | 'accepte' | 'refuse' | 'expire'
  lignes: { id: string; description: string; quantite: number; prix_unitaire: number; unite: string; total: number }[]
  total_ht: number
  tva_taux: number
  total_ttc: number
  validite_jours: number
  notes: string
  date_envoi: string | null
  created_at: string
}[] = []
