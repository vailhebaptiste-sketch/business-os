-- ============================================================
-- Business OS — Schéma de base de données Supabase
-- À exécuter une seule fois dans l'éditeur SQL de Supabase
-- Dashboard → SQL Editor → New Query → Coller → Run
-- ============================================================

-- ─── Organisations ───────────────────────────────────────────

create table if not exists public.organisations (
  id            uuid primary key default gen_random_uuid(),
  nom           text not null,
  siret         text,
  adresse       text,
  ville         text,
  code_postal   text,
  telephone     text,
  email         text,
  logo_url      text,
  created_at    timestamptz default now()
);

-- ─── Profils utilisateurs ────────────────────────────────────
-- (liés à auth.users via l'id)

create table if not exists public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  organisation_id   uuid references public.organisations(id) on delete cascade,
  prenom            text,
  nom               text,
  poste             text,
  role              text check (role in ('admin', 'collaborateur')) default 'collaborateur',
  avatar_initiales  text,
  avatar_couleur    text default '#3B82F6',
  created_at        timestamptz default now()
);

-- ─── Invitations équipe ───────────────────────────────────────

create table if not exists public.invitations (
  id                uuid primary key default gen_random_uuid(),
  organisation_id   uuid references public.organisations(id) on delete cascade,
  code              text not null unique,
  active            boolean default true,
  created_at        timestamptz default now()
);

-- ─── Clients ─────────────────────────────────────────────────

create table if not exists public.clients (
  id                uuid primary key default gen_random_uuid(),
  organisation_id   uuid references public.organisations(id) on delete cascade not null,
  prenom            text not null,
  nom               text not null,
  telephone         text,
  email             text,
  adresse           text,
  ville             text,
  code_postal       text,
  notes             text,
  derniere_visite   date,
  created_at        timestamptz default now()
);

-- ─── Missions ────────────────────────────────────────────────

create table if not exists public.missions (
  id                uuid primary key default gen_random_uuid(),
  organisation_id   uuid references public.organisations(id) on delete cascade not null,
  client_id         uuid references public.clients(id) on delete set null,
  client_nom        text,
  titre             text not null,
  description       text,
  statut            text check (statut in ('nouveau', 'en_cours', 'termine', 'annule')) default 'nouveau',
  priorite          text check (priorite in ('normale', 'urgente')) default 'normale',
  categorie         text,
  responsable       text,
  date_prevue       date,
  heure_prevue      time,
  adresse           text,
  duree_estimee     text,
  montant_estime    numeric default 0,
  notes             text,
  created_at        timestamptz default now()
);

-- ─── Devis ───────────────────────────────────────────────────

create table if not exists public.devis (
  id                uuid primary key default gen_random_uuid(),
  organisation_id   uuid references public.organisations(id) on delete cascade not null,
  client_id         uuid references public.clients(id) on delete set null,
  client_nom        text,
  mission_id        uuid references public.missions(id) on delete set null,
  mission_titre     text,
  numero            text not null,
  statut            text check (statut in ('brouillon', 'envoye', 'accepte', 'refuse', 'expire')) default 'brouillon',
  lignes            jsonb default '[]',
  total_ht          numeric default 0,
  tva_taux          numeric default 20,
  total_ttc         numeric default 0,
  validite_jours    integer default 30,
  notes             text,
  date_envoi        timestamptz,
  created_at        timestamptz default now()
);

-- ─── Compteur devis par organisation ─────────────────────────

create table if not exists public.devis_counters (
  organisation_id   uuid primary key references public.organisations(id) on delete cascade,
  counter           integer default 0
);

-- ─── Factures ────────────────────────────────────────────────

create table if not exists public.factures (
  id                uuid primary key default gen_random_uuid(),
  organisation_id   uuid references public.organisations(id) on delete cascade not null,
  client_id         uuid references public.clients(id) on delete set null,
  client_nom        text,
  devis_id          uuid references public.devis(id) on delete set null,
  numero            text not null,
  statut            text check (statut in ('brouillon', 'envoyee', 'payee', 'annulee')) default 'brouillon',
  lignes            jsonb default '[]',
  total_ht          numeric default 0,
  tva_taux          numeric default 20,
  total_ttc         numeric default 0,
  date_echeance     date,
  date_paiement     date,
  notes             text,
  created_at        timestamptz default now()
);

-- ─── Compteur factures par organisation ──────────────────────

create table if not exists public.facture_counters (
  organisation_id   uuid primary key references public.organisations(id) on delete cascade,
  counter           integer default 0
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Chaque utilisateur ne voit que les données de son organisation
-- ============================================================

alter table public.organisations      enable row level security;
alter table public.profiles           enable row level security;
alter table public.invitations        enable row level security;
alter table public.clients            enable row level security;
alter table public.missions           enable row level security;
alter table public.devis              enable row level security;
alter table public.devis_counters     enable row level security;
alter table public.factures           enable row level security;
alter table public.facture_counters   enable row level security;

-- Helper : retourne l'organisation_id de l'utilisateur connecté
create or replace function public.my_org_id()
returns uuid language sql security definer stable
as $$ select organisation_id from public.profiles where id = auth.uid() $$;

-- Organisations
create policy "org_select" on public.organisations for select using (id = public.my_org_id());
create policy "org_update" on public.organisations for update using (id = public.my_org_id());

-- Profils
create policy "profiles_select" on public.profiles for select using (auth.uid() = id or organisation_id = public.my_org_id());
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- Invitations
create policy "invitations_select" on public.invitations for select using (organisation_id = public.my_org_id());
create policy "invitations_insert" on public.invitations for insert with check (organisation_id = public.my_org_id());
create policy "invitations_update" on public.invitations for update using (organisation_id = public.my_org_id());

-- Clients
create policy "clients_all" on public.clients for all using (organisation_id = public.my_org_id());

-- Missions
create policy "missions_all" on public.missions for all using (organisation_id = public.my_org_id());

-- Devis
create policy "devis_all" on public.devis for all using (organisation_id = public.my_org_id());
create policy "devis_counters_all" on public.devis_counters for all using (organisation_id = public.my_org_id());

-- Factures
create policy "factures_all" on public.factures for all using (organisation_id = public.my_org_id());
create policy "facture_counters_all" on public.facture_counters for all using (organisation_id = public.my_org_id());

-- ============================================================
-- Permettre l'insert d'organisations lors de l'inscription
-- (l'utilisateur n'a pas encore de profil à ce moment-là)
-- ============================================================

create policy "org_insert_anon" on public.organisations for insert with check (true);
create policy "invitations_read_anon" on public.invitations for select using (active = true);
