# デプロイガイド

## 概要

Chiryu Connectアプリを無料でデプロイして一般公開する方法を説明します。

## 推奨プラットフォーム: Vercel

Next.js 16 App Routerを使用しているため、**Vercel**が最も適しています。

### Vercelを選ぶ理由

- ✅ Next.jsの開発元が提供するプラットフォーム
- ✅ 無料プランで十分な機能を提供
- ✅ 自動デプロイ（GitHub連携）
- ✅ 環境変数の簡単な管理
- ✅ カスタムドメイン対応（無料）
- ✅ HTTPS自動設定
- ✅ グローバルCDN

## デプロイ手順

### 1. Vercelアカウントの作成

1. [Vercel](https://vercel.com)にアクセス
2. 「Sign Up」をクリック
3. GitHubアカウントでログイン（推奨）

### 2. プロジェクトのインポート

1. Vercelダッシュボードで「Add New...」→「Project」をクリック
2. GitHubリポジトリ（`apamanoko/chiryu-connect`）を選択
3. 「Import」をクリック

### 3. プロジェクト設定

Vercelが自動的に以下を検出します：
- **Framework Preset**: Next.js
- **Root Directory**: `./`（プロジェクトルート）
- **Build Command**: `npm run build`（自動検出）
- **Output Directory**: `.next`（自動検出）

**変更不要**でそのまま「Deploy」をクリックできます。

### 4. 環境変数の設定

デプロイ前に、以下の環境変数をVercelに設定する必要があります。

#### 4.1 環境変数の追加方法

1. プロジェクト設定画面で「Settings」→「Environment Variables」に移動
2. 以下の環境変数を追加：

```env
# Clerk認証
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=your_clerk_secret_key_here

# Tursoデータベース
TURSO_DATABASE_URL=libsql://your-database-name-your-org.turso.io
TURSO_AUTH_TOKEN=your-auth-token-here

# Next.js
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

#### 4.2 環境変数の取得方法

**Clerk認証キー:**
1. [Clerk Dashboard](https://dashboard.clerk.com)にログイン
2. プロジェクトを選択
3. 「API Keys」から以下を取得：
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Publishable Key
   - `CLERK_SECRET_KEY`: Secret Key

**Tursoデータベース:**
1. [Turso Dashboard](https://turso.tech)にログイン
2. データベースを選択
3. 「Connect」から以下を取得：
   - `TURSO_DATABASE_URL`: Database URL
   - `TURSO_AUTH_TOKEN`: Auth Token

**NEXT_PUBLIC_APP_URL:**
- デプロイ後にVercelが自動生成するURLを使用
- 例: `https://chiryu-connect.vercel.app`

#### 4.3 環境ごとの設定

Vercelでは、環境ごとに環境変数を設定できます：
- **Production**: 本番環境
- **Preview**: プルリクエストごとのプレビュー環境
- **Development**: 開発環境

すべての環境に同じ環境変数を設定することを推奨します。

### 5. Clerkの設定更新

デプロイ後、ClerkダッシュボードでアプリケーションURLを更新する必要があります。

1. [Clerk Dashboard](https://dashboard.clerk.com)にログイン
2. プロジェクトを選択
3. 「Settings」→「Paths」に移動
4. 以下のURLを設定：
   - **Sign-in URL**: `https://your-app-name.vercel.app/login`
   - **Sign-up URL**: `https://your-app-name.vercel.app/sign-up`
   - **After sign-in URL**: `https://your-app-name.vercel.app`
   - **After sign-up URL**: `https://your-app-name.vercel.app/onboarding`

### 6. デプロイの実行

1. 環境変数を設定後、「Deploy」をクリック
2. ビルドが開始されます（通常1-3分）
3. デプロイが完了すると、URLが表示されます

### 7. デプロイ後の確認

1. デプロイされたURLにアクセス
2. ログイン・新規登録が正常に動作するか確認
3. データベース接続が正常か確認
4. 各機能（投稿、応募、チャットなど）が正常に動作するか確認

## 自動デプロイの設定

Vercelは、GitHubリポジトリと連携することで自動デプロイを設定できます。

### 自動デプロイの動作

- **mainブランチへのプッシュ**: 本番環境に自動デプロイ
- **プルリクエスト**: プレビュー環境に自動デプロイ
- **ビルドエラー**: 自動的に通知

### 設定方法

1. Vercelダッシュボードで「Settings」→「Git」に移動
2. 「Production Branch」を`main`に設定（デフォルト）
3. 「Automatic deployments」を有効化（デフォルトで有効）

## カスタムドメインの設定（オプション）

無料プランでもカスタムドメインを設定できます。

1. Vercelダッシュボードで「Settings」→「Domains」に移動
2. ドメイン名を入力（例: `chiryu-connect.com`）
3. Vercelが提供するDNS設定をドメイン提供者に設定
4. DNS設定が反映されるまで数時間かかる場合があります

## トラブルシューティング

### ビルドエラー

**エラー**: `TURSO_DATABASE_URL is not set`
- **解決**: 環境変数が正しく設定されているか確認

**エラー**: `CLERK_SECRET_KEY is not set`
- **解決**: Clerkの環境変数が正しく設定されているか確認

### ランタイムエラー

**エラー**: データベース接続エラー
- **解決**: TursoのURLとトークンが正しいか確認
- **解決**: Tursoのデータベースがアクティブか確認

**エラー**: 認証エラー
- **解決**: Clerkの環境変数が正しいか確認
- **解決**: ClerkのアプリケーションURLが正しく設定されているか確認

### パフォーマンス

- Vercelの無料プランでは、**Hobbyプラン**が提供されます
- 月間100GBの帯域幅、無制限のリクエスト
- 十分なパフォーマンスを提供します

## その他のデプロイオプション

### Netlify

- 無料プランあり
- Next.js対応
- GitHub連携可能

### Railway

- 無料プランあり（クレジット制）
- データベースもRailwayで管理可能

### Render

- 無料プランあり
- 自動スリープ機能あり（無料プラン）

## セキュリティチェックリスト

デプロイ前に以下を確認してください：

- [x] 環境変数に実際のシークレットキーが含まれていないか
- [x] `.env.local`がGitにコミットされていないか
- [x] Clerkの本番環境キーを使用しているか（テストキーではなく）
- [x] Tursoの本番環境データベースを使用しているか
- [x] HTTPSが有効になっているか（Vercelは自動で有効）

## 参考リンク

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/app/building-your-application/deploying)
- [Clerk Deployment Guide](https://clerk.com/docs/deployments/overview)
- [Turso Documentation](https://docs.turso.tech)
