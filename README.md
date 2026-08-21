# 決算劇場

日本株の決算速報を「結局この会社に何が起きたのか」から読める、メディア型のフロントエンドMVPです。

## 作成した画面

- `/` `/today`: 本日の決算一覧、フィルター切替、決算カード
- `/stocks/:code`: 銘柄詳細、評価カード、要約、漫画、数字、原文・資料、PTSカード、お気に入り
- `/ranking`: 注目ランキング、カテゴリ切替
- `/manga`: 注目決算の漫画カード一覧
- `/admin`: ChatGPTで生成した投稿JSONを貼り付けてSupabaseへ登録する管理画面

## 主なコンポーネント

- `AppHeader`
- `Sidebar`
- `EarningsFeed`
- `EarningsCard`
- `EarningsTags`
- `RatingBadge`
- `EarningsDetail`
- `EarningsSummary`
- `MangaPanels`
- `FinancialTable`
- `PtsCard`
- `EmptyState`

## データ取得

決算データは Supabase の `earnings_feed` ビューから取得します。ローカルのサンプルデータへのフォールバックはありません。

`.env.local` に以下を設定してください。

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-or-publishable-key
```

管理画面と登録APIを使う場合は、サーバー側の環境変数も設定してください。`SUPABASE_SERVICE_ROLE_KEY` はブラウザbundleへ渡さず、Vercel Functionsなどのサーバー実行環境だけに置きます。

```bash
ADMIN_USERNAME=your-admin-name
ADMIN_PASSWORD=your-admin-password
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

登録先テーブルは `earnings_posts` です。

```text
id uuid primary key
ticker text
company_name text
title text
summary jsonb
short_summary text
continuation jsonb nullable
conclusion text
source_url text nullable
published_at date
created_at timestamptz
```

型は `src/types.ts` に定義し、銘柄情報、見出し、タグ、評価、決算数値、PTS、漫画パネルをまとめています。DB カラムは `company_name` / `attention_score` などの snake_case と、既存画面に近い camelCase のどちらも読み取れるようにしています。

## 起動方法

```bash
npm install
npm run dev
```

本番ビルド確認:

```bash
npm run build
```
