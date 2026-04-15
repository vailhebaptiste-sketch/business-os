# Connecter Supabase (base de données + auth)

> Une seule fois, 10 minutes. Après ça, l'app a une vraie base de données, une vraie auth, et les données sont synchronisées sur tous les appareils.

---

## Étape 1 — Créer un compte Supabase (gratuit)

1. Va sur https://supabase.com
2. Clique **Start your project** → **Sign up with GitHub** (ou email)
3. Une fois connecté, clique **New project**
4. Remplis :
   - **Name** : `business-os`
   - **Database Password** : génère un mot de passe fort (note-le quelque part)
   - **Region** : `West EU (Ireland)` (le plus proche de la France)
5. Clique **Create new project** — attends ~2 minutes que ça se configure

---

## Étape 2 — Récupérer les clés API

Dans ton projet Supabase :

1. Clique **Project Settings** (icône engrenage en bas à gauche)
2. Clique **API**
3. Copie :
   - **Project URL** → commence par `https://xxxx.supabase.co`
   - **anon / public key** → longue chaîne commençant par `eyJ...`

---

## Étape 3 — Mettre les clés dans l'app

Ouvre le fichier `~/business-os/.env.local` et remplace :

```
NEXT_PUBLIC_SUPABASE_URL=COLLE_TON_PROJECT_URL_ICI
NEXT_PUBLIC_SUPABASE_ANON_KEY=COLLE_TON_ANON_KEY_ICI
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Exemple :
```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Étape 4 — Créer les tables (schéma SQL)

Dans Supabase :

1. Clique **SQL Editor** (icône dans la barre gauche)
2. Clique **New query**
3. Ouvre le fichier `~/business-os/supabase/schema.sql`
4. Copie TOUT le contenu et colle-le dans l'éditeur SQL
5. Clique **Run** (ou Ctrl+Entrée)

Tu dois voir "Success. No rows returned." → c'est bon, toutes les tables sont créées.

---

## Étape 5 — Relancer l'app

```bash
cd ~/business-os
npm run dev
```

Va sur http://localhost:3000 → tu seras redirigé vers la page de connexion.

Crée un compte → **Créer un espace** → remplis ton nom d'entreprise → tu arrives sur le dashboard.

---

## Vérification que tout fonctionne

Dans Supabase → **Table Editor**, tu dois voir :
- `organisations` : 1 ligne (ton entreprise)
- `profiles` : 1 ligne (ton compte)
- `devis_counters` : 1 ligne

Si les tables sont là mais vides → OK, c'est normal, tu n'as pas encore ajouté de données.

---

## Pour déployer sur internet (Vercel)

Quand tu veux mettre l'app en ligne pour de vrais clients :

1. Va sur https://vercel.com → importe le dossier `business-os`
2. Dans les **Environment Variables** de Vercel, ajoute les mêmes clés que `.env.local`
3. Change `NEXT_PUBLIC_APP_URL` par l'URL Vercel (ex: `https://business-os.vercel.app`)
4. Dans Supabase → **Authentication → URL Configuration** → ajoute l'URL Vercel dans **Redirect URLs**

---

## Récapitulatif des fichiers créés/modifiés

| Fichier | Rôle |
|---------|------|
| `middleware.ts` | Protège le dashboard — redirige vers /login si non connecté |
| `app/auth/callback/route.ts` | Gère les confirmations email Supabase |
| `lib/supabase/actions.ts` | Fonctions connexion / inscription / déconnexion |
| `lib/supabase/client.ts` | Client Supabase côté navigateur |
| `lib/supabase/server.ts` | Client Supabase côté serveur |
| `lib/store.tsx` | Store mis à jour — sync automatique avec Supabase |
| `app/login/page.tsx` | Vraie page de connexion (plus de fausse auth) |
| `supabase/schema.sql` | Schéma complet à exécuter dans Supabase |
| `public/manifest.json` | PWA — app installable sur téléphone et desktop |
| `public/icons/icon-*.png` | Icônes de l'app installée |
