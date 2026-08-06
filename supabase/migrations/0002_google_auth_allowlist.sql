-- Google OAuth 対応 + 許可ユーザー限定
-- 事前に Supabase Dashboard → Authentication → Providers で Google を有効化し、
-- Google Cloud の OAuth クライアントにリダイレクト URL を登録してください。

-- ============ 許可ユーザー管理 ============
-- このテーブルに email を追加されたユーザーのみ利用可能。
-- RLS ポリシーを置かないことで、所有者ロール（SQL Editor）だけが編集できる。
create table if not exists public.allowed_users (
  email      text primary key,
  created_at timestamptz not null default now()
);

alter table public.allowed_users enable row level security;

-- 現在のログインユーザーが許可リストに含まれるかを判定する関数
-- security definer により RLS の影響を受けずに読み取る
create or replace function public.is_allowed()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.allowed_users
    where email = lower(auth.jwt() ->> 'email')
  );
$$;

revoke all on function public.is_allowed() from public;
grant execute on function public.is_allowed() to authenticated;

-- ============ 既存 RLS ポリシーを許可ユーザー限定に更新 ============
drop policy if exists "nodes_select_own" on public.nodes;
drop policy if exists "nodes_insert_own" on public.nodes;
drop policy if exists "nodes_update_own" on public.nodes;
drop policy if exists "nodes_delete_own" on public.nodes;

create policy "nodes_select_own" on public.nodes
  for select using (auth.uid() = user_id and public.is_allowed());
create policy "nodes_insert_own" on public.nodes
  for insert with check (auth.uid() = user_id and public.is_allowed());
create policy "nodes_update_own" on public.nodes
  for update using (auth.uid() = user_id and public.is_allowed())
  with check (auth.uid() = user_id and public.is_allowed());
create policy "nodes_delete_own" on public.nodes
  for delete using (auth.uid() = user_id and public.is_allowed());

drop policy if exists "edges_select_own" on public.edges;
drop policy if exists "edges_insert_own" on public.edges;
drop policy if exists "edges_update_own" on public.edges;
drop policy if exists "edges_delete_own" on public.edges;

create policy "edges_select_own" on public.edges
  for select using (auth.uid() = user_id and public.is_allowed());
create policy "edges_insert_own" on public.edges
  for insert with check (auth.uid() = user_id and public.is_allowed());
create policy "edges_update_own" on public.edges
  for update using (auth.uid() = user_id and public.is_allowed())
  with check (auth.uid() = user_id and public.is_allowed());
create policy "edges_delete_own" on public.edges
  for delete using (auth.uid() = user_id and public.is_allowed());
