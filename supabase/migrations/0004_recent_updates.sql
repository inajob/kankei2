-- 最近更新された Node 一覧用: updated_at カラムと自動更新トリガー
-- ノード自体の編集に加え、エッジの追加/削除時も両端ノードの updated_at を更新する
-- （「最近触れたノード」を正確に反映するため）

-- ============ nodes.updated_at ============
alter table public.nodes
  add column if not exists updated_at timestamptz not null default now();

-- ノード行が UPDATE されたら updated_at を自動更新
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists nodes_set_updated_at on public.nodes;
create trigger nodes_set_updated_at
  before update on public.nodes
  for each row execute function public.set_updated_at();

-- エッジの追加/削除で両端ノードを「更新済み」にする
create or replace function public.touch_edge_nodes()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    update public.nodes set updated_at = now() where id in (new.from_id, new.to_id);
  elsif tg_op = 'DELETE' then
    update public.nodes set updated_at = now() where id in (old.from_id, old.to_id);
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists edges_touch_nodes on public.edges;
create trigger edges_touch_nodes
  after insert or delete on public.edges
  for each row execute function public.touch_edge_nodes();
