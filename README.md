# Chiryu Connect

愛知県知立市の地域ボランティア促進アプリ

## 概要

Chiryu Connectは、知立市の地域コミュニティにおけるボランティア活動のマッチングを促進するためのWebアプリケーションです。地域住民がボランティア募集を投稿し、参加希望者が応募できるプラットフォームを提供します。

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **言語**: TypeScript
- **認証**: Clerk
- **データベース**: Turso (libSQL)
- **ORM**: Drizzle ORM
- **スタイリング**: Tailwind CSS v4
- **UIコンポーネント**: Shadcn/ui

## 主な機能

- ユーザー認証（ログイン、新規登録、オンボーディング）
- ボランティア募集の投稿・編集・削除
- 募集への応募機能（承認/拒否）
- チャット機能（応募者と募集者のコミュニケーション）
- 検索・フィルタ機能（キーワード、タグ、場所、日付範囲）
- 無限スクロールによる投稿一覧表示
- プロフィール管理

## セットアップ

### 必要な環境変数

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```env
# Clerk認証
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Tursoデータベース
TURSO_DATABASE_URL=your_turso_database_url
TURSO_AUTH_TOKEN=your_turso_auth_token
```

### インストール

```bash
npm install
```

### データベースのセットアップ

```bash
# マイグレーションの生成
npm run db:generate

# マイグレーションの実行
npm run db:migrate

# 初期データの投入
npm run db:seed
```

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 開発

### 型チェック

```bash
npm run type-check
```

### データベーススタジオ

```bash
npm run db:studio
```

## ライセンス

このプロジェクトは個人プロジェクトです。
