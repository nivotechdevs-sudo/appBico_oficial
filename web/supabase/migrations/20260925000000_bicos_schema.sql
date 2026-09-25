-- Bicos — esquema sugerido para o Supabase (Postgres). Espelha src/types/supabase.ts; os conversores
-- linha <-> modelo do app estão em src/services/supabaseMappers.ts. Nada disso é usado pelo app ainda:
-- ele continua no modo mock até as variáveis VITE_SUPABASE_* existirem (ver docs/SUPABASE.md).
--
-- Aplicar: `supabase db push` (Supabase CLI, com o projeto ligado) ou colar no SQL Editor do painel.

-- ---------------------------------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------------------------------

create type public.app_role as enum ('trabalhador', 'recrutador');
create type public.dias_semana as enum ('semana', 'fimdesemana', 'qualquer');
create type public.application_status as enum (
  'enviada', 'em_analise', 'pre_selecionado', 'contratado', 'concluida', 'avaliada', 'nao_selecionado'
);
create type public.media_type as enum ('image', 'video');
create type public.review_direction as enum ('para_construtora', 'para_trabalhador');
create type public.notification_kind as enum (
  'pre_selecionado', 'bico_urgente', 'avaliar_diaria', 'candidatura_em_analise',
  'novos_candidatos', 'bico_fechado', 'avaliar_trabalhador'
);
create type public.boost_plan as enum ('24h', '3d', 'whats');

-- ---------------------------------------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------------------------------------

-- Construtoras (Company). Os ids de texto ("meridiano") são os dos dados de demonstração.
create table public.companies (
  id text primary key default gen_random_uuid()::text,
  owner_id uuid unique references auth.users (id) on delete set null,
  name text not null,
  cnpj text unique,
  tipo_obra text,
  location text not null,
  whatsapp text not null,
  rating numeric(2, 1) not null default 0 check (rating between 0 and 5),
  review_count integer not null default 0 check (review_count >= 0),
  verified boolean not null default false,
  verified_since text,
  since_label text,
  respond_time text,
  paid_count integer check (paid_count >= 0),
  -- Hoje ficam só no estado de tela 'company-profile' (não persistidos pelo mock).
  logo_url text,
  cover_url text,
  created_at timestamptz not null default now()
);

-- Trabalhadores (Worker). `role` é o ofício ("Pedreiro"), não o lado da conta (profiles.role).
create table public.workers (
  id text primary key default gen_random_uuid()::text,
  user_id uuid unique references auth.users (id) on delete set null,
  name text not null,
  initials text not null,
  role text not null,
  region text not null,
  -- Demo: a distância já formatada ("3,2 km"); com dados reais ela vem da localização de quem vê.
  distance text not null default '',
  rating numeric(2, 1) not null default 0 check (rating between 0 and 5),
  jobs_done integer not null default 0 check (jobs_done >= 0),
  novo boolean not null default false,
  verified boolean not null default false,
  specialties text[] not null default '{}',
  facts text[] not null default '{}',
  cpf text unique,
  -- Hoje fica só no estado de tela 'worker-profile-photo' (não persistido pelo mock).
  photo_url text,
  created_at timestamptz not null default now()
);

-- Uma linha por usuário do Supabase Auth: o lado do marketplace e o trabalhador/construtora da conta
-- (no mock: CURRENT_WORKER_ID / CURRENT_COMPANY_ID e services/store.ts → role).
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null,
  worker_id text unique references public.workers (id) on delete set null,
  company_id text unique references public.companies (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint profiles_one_side check (
    (role = 'trabalhador' and company_id is null) or (role = 'recrutador' and worker_id is null)
  )
);

-- Vagas (Job). O código "BC-1234" continua sendo o id; vagas novas numeram a partir de BC-6000.
create sequence public.job_code_seq start 6000;

create table public.jobs (
  id text primary key default ('BC-' || nextval('public.job_code_seq')),
  company_id text not null references public.companies (id) on delete cascade,
  role text not null,
  pay integer check (pay is null or pay >= 0), -- R$ por diária; null = "A combinar"
  location text not null,
  address text not null,
  distance text not null default '',
  date_label text, -- "Hoje", "Sex, 25 set"; null = "Data a combinar"
  hours text, -- "7h–17h"; null = "Horário a combinar"
  duration text not null, -- "3 diárias"
  dias public.dias_semana,
  urgent boolean not null default false,
  boosted boolean not null default false,
  photos text[],
  slots integer not null default 1 check (slots >= 1),
  closed boolean not null default false,
  sem_contratacao boolean not null default false,
  city text, -- null = "São Paulo, SP"
  description text not null,
  requirements text[] not null default '{}',
  created_at timestamptz not null default now(),
  deleted_at timestamptz -- excluída pela construtora (Database.deletedJobIds no mock)
);
create index jobs_company_id_idx on public.jobs (company_id);
create index jobs_mural_idx on public.jobs (city) where deleted_at is null and not closed;

-- Candidaturas (Application): uma por trabalhador e vaga.
create table public.applications (
  id text primary key default gen_random_uuid()::text,
  job_id text not null references public.jobs (id) on delete cascade,
  worker_id text not null references public.workers (id) on delete cascade,
  status public.application_status not null default 'enviada',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_id, worker_id)
);
create index applications_worker_id_idx on public.applications (worker_id);

-- Vagas salvas de cada trabalhador (Database.savedJobIds), na ordem em que foram salvas.
create table public.saved_jobs (
  worker_id text not null references public.workers (id) on delete cascade,
  job_id text not null references public.jobs (id) on delete cascade,
  saved_at timestamptz not null default now(),
  primary key (worker_id, job_id)
);

-- Avaliações nos dois sentidos (Company.reviews e Worker.reviews), na ordem de inserção.
create table public.reviews (
  id bigint generated by default as identity primary key,
  direction public.review_direction not null,
  company_id text references public.companies (id) on delete cascade,
  worker_id text references public.workers (id) on delete cascade,
  job_id text references public.jobs (id) on delete set null,
  author_label text not null, -- como aparece: "Caio N. · pedreiro" ou "Construtora Meridiano"
  value smallint not null check (value between 1 and 5),
  text text not null default '',
  date_label text not null, -- "30 jul"
  created_at timestamptz not null default now(),
  constraint reviews_subject check (
    (direction = 'para_construtora' and company_id is not null)
    or (direction = 'para_trabalhador' and worker_id is not null)
  )
);
create index reviews_company_id_idx on public.reviews (company_id);
create index reviews_worker_id_idx on public.reviews (worker_id);

-- Portfólio do trabalhador (WorkerPost).
create table public.worker_posts (
  id text primary key default gen_random_uuid()::text,
  worker_id text not null references public.workers (id) on delete cascade,
  media_url text,
  media_type public.media_type not null default 'image',
  caption text not null default '',
  posted_on date not null default current_date,
  created_at timestamptz not null default now()
);
create index worker_posts_worker_id_idx on public.worker_posts (worker_id);

-- Notificações de cada usuário (services/notifications.ts).
create table public.notifications (
  id bigint generated by default as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  kind public.notification_kind not null,
  title text not null,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index notifications_unread_idx on public.notifications (user_id) where read_at is null;

-- Impulsionamentos pagos ("Impulsionar vaga"). Hoje o mock só liga jobs.boosted/urgent.
create table public.job_boosts (
  id bigint generated by default as identity primary key,
  job_id text not null references public.jobs (id) on delete cascade,
  plan public.boost_plan not null,
  price_cents integer not null check (price_cents >= 0),
  created_at timestamptz not null default now(),
  ends_at timestamptz not null
);

-- ---------------------------------------------------------------------------------------------------
-- updated_at automático
-- ---------------------------------------------------------------------------------------------------

create function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger applications_touch_updated_at before update on public.applications
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------------------------------
-- Row Level Security (sugestão inicial — revise antes de ir para produção)
-- ---------------------------------------------------------------------------------------------------

-- O trabalhador / a construtora de quem está logado.
create function public.my_worker_id() returns text
language sql stable security definer set search_path = public as $$
  select worker_id from public.profiles where id = auth.uid()
$$;

create function public.my_company_id() returns text
language sql stable security definer set search_path = public as $$
  select company_id from public.profiles where id = auth.uid()
$$;

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.workers enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.saved_jobs enable row level security;
alter table public.reviews enable row level security;
alter table public.worker_posts enable row level security;
alter table public.notifications enable row level security;
alter table public.job_boosts enable row level security;

-- Perfil: cada um lê e mantém o seu.
create policy "perfil próprio: ler" on public.profiles for select to authenticated using (id = auth.uid());
create policy "perfil próprio: criar" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "perfil próprio: editar" on public.profiles for update to authenticated using (id = auth.uid());

-- Construtoras e trabalhadores: vitrine pública para quem está logado; cada um edita o seu.
create policy "construtoras: ler" on public.companies for select to authenticated using (true);
create policy "construtora própria: editar" on public.companies for update to authenticated
  using (id = public.my_company_id());
create policy "trabalhadores: ler" on public.workers for select to authenticated using (true);
create policy "trabalhador próprio: editar" on public.workers for update to authenticated
  using (id = public.my_worker_id());

-- Vagas: todas as não excluídas para quem está logado; a construtora publica, edita e exclui as suas.
create policy "vagas: ler" on public.jobs for select to authenticated
  using (deleted_at is null or company_id = public.my_company_id());
create policy "vagas: publicar" on public.jobs for insert to authenticated
  with check (company_id = public.my_company_id());
create policy "vagas: editar as suas" on public.jobs for update to authenticated
  using (company_id = public.my_company_id());

-- Candidaturas: o trabalhador vê e envia as suas; a construtora vê e decide as das suas vagas.
create policy "candidaturas: ler" on public.applications for select to authenticated using (
  worker_id = public.my_worker_id()
  or job_id in (select id from public.jobs where company_id = public.my_company_id())
);
create policy "candidaturas: enviar" on public.applications for insert to authenticated
  with check (worker_id = public.my_worker_id());
create policy "candidaturas: decidir ou avaliar" on public.applications for update to authenticated using (
  worker_id = public.my_worker_id()
  or job_id in (select id from public.jobs where company_id = public.my_company_id())
);
create policy "candidaturas: cancelar" on public.applications for delete to authenticated
  using (worker_id = public.my_worker_id());

-- Vagas salvas: só as do próprio trabalhador.
create policy "salvas: tudo nas suas" on public.saved_jobs for all to authenticated
  using (worker_id = public.my_worker_id()) with check (worker_id = public.my_worker_id());

-- Avaliações: leitura para quem está logado; escrita por quem participou do bico.
create policy "avaliações: ler" on public.reviews for select to authenticated using (true);
create policy "avaliações: escrever" on public.reviews for insert to authenticated with check (
  (direction = 'para_construtora' and worker_id = public.my_worker_id())
  or (direction = 'para_trabalhador' and company_id = public.my_company_id())
);

-- Portfólio: leitura para quem está logado; o trabalhador publica e apaga os seus.
create policy "posts: ler" on public.worker_posts for select to authenticated using (true);
create policy "posts: publicar" on public.worker_posts for insert to authenticated
  with check (worker_id = public.my_worker_id());
create policy "posts: apagar os seus" on public.worker_posts for delete to authenticated
  using (worker_id = public.my_worker_id());

-- Notificações: cada usuário lê e marca como lidas as suas (quem cria é o servidor).
create policy "notificações: ler as suas" on public.notifications for select to authenticated
  using (user_id = auth.uid());
create policy "notificações: marcar como lidas" on public.notifications for update to authenticated
  using (user_id = auth.uid());

-- Impulsionamentos: a construtora vê os das suas vagas; quem cria é o servidor, após o pagamento.
create policy "impulsionamentos: ler os seus" on public.job_boosts for select to authenticated
  using (job_id in (select id from public.jobs where company_id = public.my_company_id()));
