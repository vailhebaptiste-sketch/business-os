# Business OS — Suivi du projet
> Dernière mise à jour : 15 avril 2026

---

## Vue d'ensemble

Business OS est une application web de gestion d'activité pour artisans et indépendants.
Stack : Next.js 16.2.3 · React · Tailwind CSS v4 · TypeScript · localStorage

---

## Ce qui est terminé ✅

### Navigation & Layout
- Sidebar desktop avec logo, navigation principale, section paramètres en bas
- Bottom navigation mobile (5 onglets fixes en bas de l'écran)
- Hamburger + drawer slide-in pour mobile
- Header avec recherche desktop, recherche plein écran mobile, notifications, avatar + menu
- Titre de page dynamique selon la route

### Dashboard
- Bandeau de bienvenue avec compteurs dynamiques
- 4 cartes de stats (clients, missions actives, devis en attente, CA estimé)
- Liste des 3 missions les plus récentes avec statut et badge urgence
- Section actions rapides (nouveau client, nouvelle mission, nouveau devis)

### Module Clients
- Liste avec avatar initiales, téléphone, email, ville, nombre de missions
- Fiche détail : coordonnées, activité, liste des missions liées
- Formulaire création client (prénom, nom, téléphone, email, adresse complète, notes)
- Formulaire modification client
- Suppression avec confirmation en 2 clics

### Module Missions
- Liste des missions avec priorité, statut, date, montant
- Fiche détail : infos mission, client & lieu, actions liées
- Transitions de statut : Nouveau → En cours → Terminé / Annulé / Réouvrir
- Formulaire création : titre, description, catégorie, priorité, client, adresse, date/heure, durée, montant, responsable, notes
- Formulaire modification complet
- Suppression avec confirmation

### Module Devis
- Liste avec numéro auto-généré, statut, montant TTC
- Fiche détail avec tableau des prestations, totaux HT/TVA/TTC
- Transitions de statut : Brouillon → Envoyé → Accepté / Refusé / Expiré
- Formulaire création : client, mission liée, lignes de prestation (qté/unité/prix), TVA, validité, notes
- Formulaire modification (brouillon uniquement)
- Suppression avec confirmation

### Planning
- Vue calendrier hebdomadaire style Outlook (desktop) — semaine 5j ou 7j
- Événements positionnés par heure avec hauteur proportionnelle à la durée
- Ligne "maintenant" rouge sur le jour courant
- Mini-calendrier picker avec navigation mois/année/décennie
- Vue liste par jour (mobile) avec sélecteur de dates horizontal glissant
- Indicateur de missions sur les jours du sélecteur

### Équipe
- Affichage des membres avec rôle, statut, dernière connexion
- Bouton "Renvoyer l'invitation" avec feedback visuel (checkmark 2,5s)
- Code d'invitation persistant en localStorage (format BOS-XXXX-XXXX)

### Paramètres
- Informations entreprise (nom, SIRET, adresse, téléphone, email)
- Personnalisation du profil utilisateur (prénom, poste, initiales avatar, couleur avatar)

### Mon compte
- Formulaire de modification du profil avec prévisualisation de l'avatar en temps réel

### Import de données
- Interface d'import CSV/JSON pour clients et missions

### Responsivité mobile complète
- Toutes les pages adaptées téléphone et tablette
- Formulaires : colonnes doubles → colonnes simples sur petits écrans
- Lignes de devis : layout adapté mobile
- Pages détail : boutons d'action wrappés sur mobile
- Bottom nav pour navigation rapide sur mobile

---

## Architecture technique

```
business-os/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx           — Dashboard principal
│   │   ├── layout.tsx         — Layout avec sidebar + header
│   │   ├── clients/           — CRUD clients
│   │   ├── missions/          — CRUD missions + planning
│   │   ├── devis/             — CRUD devis
│   │   ├── planning/          — Vue calendrier/liste
│   │   ├── equipe/            — Gestion équipe
│   │   ├── settings/          — Paramètres entreprise
│   │   ├── mon-compte/        — Profil utilisateur
│   │   └── import/            — Import de données
│   └── login/                 — Page de connexion
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx        — Sidebar desktop + drawer mobile + bottom nav
│   │   └── header.tsx         — Header + recherche + notifications
│   └── ui/                    — Composants shadcn/ui
├── lib/
│   ├── store.tsx              — Store global (React Context + localStorage)
│   ├── settings-store.tsx     — Store paramètres
│   └── utils.ts
└── types/                     — Types TypeScript
```

### Persistance des données
Toutes les données sont stockées en **localStorage** du navigateur :
- `business-os-clients` — liste des clients
- `business-os-missions` — liste des missions
- `business-os-devis` — liste des devis
- `business-os-settings` — paramètres entreprise
- `business-os-invite-code` — code d'invitation équipe

---

## Ce qui reste à faire 🔲

### Priorité haute
- [ ] Authentification réelle (login/logout avec session persistante)
- [ ] Base de données distante (PostgreSQL/Supabase) pour remplacer localStorage
- [ ] Synchronisation multi-appareils (les données actuelles sont locales au navigateur)

### Priorité moyenne
- [ ] Génération PDF des devis (envoi par email)
- [ ] Notifications push (missions du jour)
- [ ] Filtres et tri sur les listes (clients, missions, devis)
- [ ] Export des données (CSV, PDF)
- [ ] Statistiques avancées (CA par mois, taux d'acceptation des devis)

### Priorité basse
- [ ] Mode sombre
- [ ] Application mobile native (React Native ou PWA)
- [ ] Intégration calendrier externe (Google Calendar)
- [ ] Facturation (module séparé des devis)
- [ ] Gestion des stocks / matériel

---

## Comment lancer le projet

```bash
# Installer les dépendances
cd ~/business-os
npm install

# Démarrer en développement
npm run dev
# → Accessible sur http://localhost:3000

# Exposer sur le réseau local (même WiFi)
# L'IP s'affiche au démarrage : http://192.168.X.X:3000

# Exposer publiquement (5G / internet)
./start-tunnel.command
# → Affiche une URL https://xxxx.trycloudflare.com
```

---

## Bugs connus

| Bug | Statut | Note |
|-----|--------|------|
| lightningcss binary ARM Mac | ✅ Résolu | next.config.ts serverExternalPackages |
| Tunnel sandbox instable | ⚠️ Partiel | Utiliser start-tunnel.command sur le Mac |
| Données vides sur nouveau navigateur | 🔲 À traiter | Normal (localStorage vide) |
