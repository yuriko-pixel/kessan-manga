# 決算劇場

日本株の決算速報を「結局この会社に何が起きたのか」から読める、メディア型のフロントエンドMVPです。

## 作成した画面

- `/` `/today`: 本日の決算一覧、フィルター切替、決算カード
- `/stocks/:code`: 銘柄詳細、評価カード、要約、漫画、数字、原文・資料、PTSカード、お気に入り
- `/ranking`: 注目ランキング、カテゴリ切替
- `/manga`: 注目決算の漫画カード一覧

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

## データ構造

モックデータは `src/data/earnings.ts` に配置しています。型は `src/types.ts` に定義し、銘柄情報、見出し、タグ、評価、決算数値、PTS、漫画パネルをまとめています。

## 起動方法

```bash
npm install
npm run dev
```

本番ビルド確認:

```bash
npm run build
```
