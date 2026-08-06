-- kankei2: Node / Edge schema and RLS policies
-- Supabase SQL editor or `supabase db push` で適用してください。

-- ============ nodes ============
create table if not exists public.nodes (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  name          text not null,
  type          text not null default 'entity' check (type in ('entity', 'date_day', 'date_month', 'time')),
  context_note  text,
  created_at    timestamptz not null default now()
);

create index if not exists idx_nodes_name on public.nodes (lower(name));
create index if not exists idx_nodes_user on public.nodes (user_id);
create index if not exists idx_nodes_type on public.nodes (type);

-- ============ edges ============
create table if not exists public.edges (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  from_id     uuid not null references public.nodes (id) on delete cascade,
  to_id       uuid not null references public.nodes (id) on delete cascade,
  is_same_as  boolean not null default false,
  note        text,
  created_at  timestamptz not null default now(),
  check (from_id <> to_id)
);

create index if not exists idx_edges_from on public.edges (from_id);
create index if not exists idx_edges_to on public.edges (to_id);
create index if not exists idx_edges_user on public.edges (user_id);
create index if not exists idx_edges_same_as on public.edges (is_same_as);

-- 重複エッジ防止（SameAs は複数あっても意味がないため一律で一意に保つ）
create unique index if not exists idx_edges_unique
  on public.edges (user_id, from_id, to_id);

-- ============ RLS ============
alter table public.nodes enable row level security;
alter table public.edges enable row level security;

-- ============ テーブル権限（RLS の前提） ============
-- RLS ポリシーは行単位の制御であり、テーブルレベルでは
-- authenticated ロールへの明示的な GRANT が必要
grant select, insert, update, delete on public.nodes to authenticated;
grant select, insert, update, delete on public.edges to authenticated;

create policy "nodes_select_own" on public.nodes
  for select using (auth.uid() = user_id);
create policy "nodes_insert_own" on public.nodes
  for insert with check (auth.uid() = user_id);
create policy "nodes_update_own" on public.nodes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "nodes_delete_own" on public.nodes
  for delete using (auth.uid() = user_id);

create policy "edges_select_own" on public.edges
  for select using (auth.uid() = user_id);
create policy "edges_insert_own" on public.edges
  for insert with check (auth.uid() = user_id);
create policy "edges_update_own" on public.edges
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "edges_delete_own" on public.edges
  for delete using (auth.uid() = user_id);
