# Kankei (関係)

ご近所・日常生活向けのグラフ型ナレッジメモアプリ。

Node（ノード）+ Edge（エッジ）のシンプルなグラフ構造で、人間関係・お出かけ先・日用品・日付予定などを横断して管理できます。

## 技術スタック

- Svelte 5 + Vite (TypeScript, SPA)
- Tailwind CSS
- Supabase (Auth: メール/パスワード + Google OAuth / DB + RLS)

## セットアップ

```bash
npm install
cp .env.example .env   # VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY を設定
npm run dev
```

Supabase 側で `supabase/migrations/` 配下の SQL を順に適用してください。

## デプロイ (GitHub Pages)

`main` ブランチへの push で自動デプロイされます（`.github/workflows/deploy.yml`）。

1. GitHub → Settings → Pages → Source を **GitHub Actions** に設定
2. Settings → Secrets and variables → Actions に `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` / `VITE_SITE_URL` を追加
3. `VITE_SITE_URL`（公開URL）を Supabase の Site URL / Redirect URLs に登録

## 開発

```bash
npm run dev       # 開発サーバー
npm run check     # 型チェック
npm run build     # 本番ビルド
```
