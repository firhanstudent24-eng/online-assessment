create extension if not exists pgcrypto;

create table if not exists public.questions (
 id uuid primary key default gen_random_uuid(),
 prompt text not null,
 type text not null check (type in ('multiple_choice','essay')),
 options jsonb not null default '[]'::jsonb,
 position integer not null default 1,
 active boolean not null default true,
 required boolean not null default true,
 created_at timestamptz not null default now()
);

create table if not exists public.submissions (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 answers jsonb not null default '{}'::jsonb,
 submitted_at timestamptz not null default now()
);

create table if not exists public.settings (
 id integer primary key check (id=1),
 title text not null default 'Online Assessment',
 description text not null default 'Silakan isi identitas dan kerjakan seluruh pertanyaan dengan teliti.'
);
insert into public.settings(id) values(1) on conflict(id) do nothing;

-- Semua akses tabel melalui server dengan service-role key.
-- Jangan pernah menaruh SUPABASE_SERVICE_ROLE_KEY di kode browser.
alter table public.questions enable row level security;
alter table public.submissions enable row level security;
alter table public.settings enable row level security;
