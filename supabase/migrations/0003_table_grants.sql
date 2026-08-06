-- テーブルレベル権限の付与（既存プロジェクトへの適用用）
-- 0001 適用後に 42501 permission denied が発生する場合は、このファイルを適用してください。
-- 0001 をまだ適用していない新規プロジェクトは 0001 に GRANT が含まれるため不要。

grant select, insert, update, delete on public.nodes to authenticated;
grant select, insert, update, delete on public.edges to authenticated;
