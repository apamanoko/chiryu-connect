# Chiryu Connect - 開発クエスト一覧

## 📋 概要

本ドキュメントは、Chiryu Connectの開発を効率的に進めるためのクエスト一覧です。
エラーが起きにくい順序で、依存関係を考慮して設計されています。

**開発原則**
- 下位レイヤー（DB、認証）から上位レイヤー（UI）へ
- 基本的なCRUDから複雑な機能へ
- 各クエストは独立してテスト可能
- 依存関係を明確に表示

---

## 🎯 Phase 1: MVP機能（必須）

### クエスト 0: 環境構築と基盤整備
**依存**: なし  
**優先度**: 🔴 最高

#### 実装内容
- [x] Tursoデータベースのセットアップ
  - [x] Tursoアカウント作成（**要手動作業 - 下記手順参照**）
  - [x] データベース作成（**要手動作業 - 下記手順参照**）
  - [x] 環境変数設定（`TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`）（**要手動作業 - 下記手順参照**）
- [x] Drizzle ORMの設定
  - [x] `drizzle.config.ts` の作成
  - [x] `lib/db/index.ts` でDB接続設定
- [x] Clerk認証の設定
  - [x] Clerkアカウント作成（**要手動作業 - 下記手順参照**）
  - [x] 環境変数設定（`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`）（**要手動作業 - 下記手順参照**）
  - [x] `app/middleware.ts` で認証ミドルウェア設定
  - [x] `app/layout.tsx` にClerkProviderを追加
- [x] プロジェクトの基本設定
  - [x] `tsconfig.json` の確認・調整
  - [x] `next.config.ts` の確認・調整
  - [x] `tailwind.config.ts` の確認・調整（Tailwind CSS v4のためpostcss.config.mjsで設定済み）
  - [x] `.env.local.example` の作成（**要手動作業 - 下記手順参照**）

#### 完了条件
- [x] データベースに接続できる（環境変数設定後）
- [x] Clerk認証が動作する（環境変数設定後）
- [x] 開発サーバーが正常に起動する（動作確認完了）

---

### 📋 クエスト0: 手動作業が必要な項目

以下の項目は外部ツールやサイトへのアクセスが必要なため、**あなた自身で実施してください**。

#### 1. Tursoデータベースのセットアップ

**手順:**

1. **Tursoアカウントの作成**
   - https://turso.tech/ にアクセス
   - 「Sign Up」または「Get Started」をクリック
   - GitHubアカウントまたはメールアドレスでサインアップ

2. **データベースの作成**
   - Tursoダッシュボードにログイン
   - 「Create Database」をクリック
   - データベース名を入力（例: `chiryu-connect`）
   - リージョンを選択（日本に近いリージョン推奨、例: `nrt` (Tokyo)）
   - 「Create」をクリック

3. **認証トークンの取得**
   - Tursoダッシュボードで「Settings」→「Tokens」に移動
   - 「Create Token」をクリック
   - トークン名を入力（例: `chiryu-connect-dev`）
   - 「Create」をクリック
   - **表示されたトークンをコピー**（後で使います）

4. **データベースURLの取得**
   - 作成したデータベースのページに移動
   - 「Connect」タブを開く
   - 「libSQL URL」をコピー（例: `libsql://chiryu-connect-xxxxx.turso.io`）

5. **環境変数の設定**
   - プロジェクトルートに `.env.local` ファイルを作成（存在しない場合）
   - 以下の内容を追加:
     ```
     TURSO_DATABASE_URL=libsql://your-database-name-your-org.turso.io
     TURSO_AUTH_TOKEN=your-auth-token-here
     ```
   - `TURSO_DATABASE_URL` にコピーしたlibSQL URLを貼り付け
   - `TURSO_AUTH_TOKEN` にコピーしたトークンを貼り付け

**参考ドキュメント**: https://docs.turso.tech/

---

#### 2. Clerk認証のセットアップ

**手順:**

1. **Clerkアカウントの作成**
   - https://clerk.com/ にアクセス
   - 「Sign Up」をクリック
   - GitHubアカウントまたはメールアドレスでサインアップ

2. **アプリケーションの作成**
   - Clerkダッシュボードで「Create Application」をクリック
   - アプリケーション名を入力（例: `Chiryu Connect`）
   - 認証方法を選択:
     - Email（必須）
     - Password（必須）
     - その他の方法（Google、GitHub等）は任意
   - 「Create Application」をクリック

3. **API Keysの取得**
   - 作成したアプリケーションのダッシュボードに移動
   - 左サイドバーの「API Keys」をクリック
   - 以下の2つのキーをコピー:
     - **Publishable Key**（`pk_test_...` で始まる）
     - **Secret Key**（`sk_test_...` で始まる）

4. **環境変数の設定**
   - `.env.local` ファイルに以下を追加:
     ```
     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxx
     CLERK_SECRET_KEY=your_clerk_secret_key_here
     ```
   - コピーしたキーをそれぞれ貼り付け

5. **アプリケーションURLの設定（オプション）**
   - Clerkダッシュボードで「Settings」→「Paths」に移動
   - 開発環境のURLを設定:
     - Sign-in URL: `http://localhost:3000/login`
     - Sign-up URL: `http://localhost:3000/sign-up`
     - After sign-in URL: `http://localhost:3000`
     - After sign-up URL: `http://localhost:3000`

**参考ドキュメント**: https://clerk.com/docs

---

#### 3. .env.local.example ファイルの作成

プロジェクトルートに `.env.local.example` ファイルを作成し、以下の内容を追加してください:

```env
# Turso Database
# Tursoアカウント作成後、データベースのURLと認証トークンを設定してください
# 取得方法: https://docs.turso.tech/
TURSO_DATABASE_URL=libsql://your-database-name-your-org.turso.io
TURSO_AUTH_TOKEN=your-auth-token-here

# Clerk Authentication
# Clerkアカウント作成後、Publishable KeyとSecret Keyを設定してください
# 取得方法: https://clerk.com/docs
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=your_clerk_secret_key_here

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

このファイルは、他の開発者が環境変数の構造を理解するためのテンプレートとして使用されます。

---

#### 4. 動作確認

環境変数を設定した後、以下のコマンドで動作確認を行ってください:

```bash
# 開発サーバーを起動
npm run dev
```

**確認項目:**
- [x] 開発サーバーが正常に起動する（エラーが出ない）
- [x] ブラウザで `http://localhost:3000` にアクセスできる
- [x] コンソールにエラーが表示されない

**トラブルシューティング:**
- 環境変数が正しく設定されているか確認（`.env.local` ファイルの内容）
- `TURSO_DATABASE_URL` と `TURSO_AUTH_TOKEN` が正しいか確認
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` と `CLERK_SECRET_KEY` が正しいか確認
- ターミナルで `npm run dev` を実行した際のエラーメッセージを確認

---

**上記の手動作業が完了したら、クエスト0は完了です。次はクエスト1（データベーススキーマ定義）に進みます。**

---

### クエスト 1: データベーススキーマ定義
**依存**: クエスト 0  
**優先度**: 🔴 最高

#### 実装内容
- [x] `lib/db/schema.ts` の作成
  - [x] `users` テーブル定義
  - [x] `tags` テーブル定義（初期データ含む）
  - [x] `posts` テーブル定義
  - [x] `post_tags` テーブル定義
  - [x] `applications` テーブル定義
  - [x] `messages` テーブル定義
- [x] インデックスの定義
- [x] 型定義のエクスポート
- [x] 初期データのシード（tagsテーブル）
  - [x] `lib/db/seed.ts` の作成
  - [x] 「高齢者支援」「環境美化」「イベント運営」「子育て支援」「災害支援」「その他」のシード関数実装
- [x] マイグレーション実行（**要手動作業 - 下記手順参照**）
  - [x] `npm run db:generate` または `npx drizzle-kit generate`
  - [x] `npm run db:migrate` または `npx drizzle-kit migrate`
  - [x] `npm run db:seed` で初期タグデータを投入

#### 完了条件
- [x] すべてのテーブルがデータベースに作成されている（マイグレーション実行後）
- [x] 初期タグデータが投入されている（シード実行後）
- [x] 型定義が正しくエクスポートされている

---

### 📋 クエスト1: 手動作業が必要な項目

以下の項目はコマンドラインでの実行が必要なため、**あなた自身で実施してください**。

#### マイグレーション実行と初期データの投入

**手順:**

1. **マイグレーションファイルの生成**
   ```bash
   npm run db:generate
   ```
   または
   ```bash
   npx drizzle-kit generate
   ```
   
   **説明:**
   - このコマンドは、`lib/db/schema.ts` の定義を元にマイグレーションファイルを生成します
   - 生成されたファイルは `lib/db/migrations/` ディレクトリに保存されます
   - エラーが出た場合:
     - 環境変数（`TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`）が正しく設定されているか確認
     - `drizzle.config.ts` の設定が正しいか確認

2. **マイグレーションの実行**
   ```bash
   npm run db:migrate
   ```
   または
   ```bash
   npx drizzle-kit migrate
   ```
   
   **説明:**
   - このコマンドは、生成されたマイグレーションファイルをデータベースに適用します
   - すべてのテーブル（users, tags, posts, post_tags, applications, messages）が作成されます
   - エラーが出た場合:
     - Tursoデータベースに接続できるか確認
     - 環境変数が正しく設定されているか確認
     - 既存のテーブルがある場合は、データベースをリセットするか、マイグレーションを確認

3. **初期タグデータの投入**
   
   **注意**: シードスクリプトを実行するには、`tsx` パッケージが必要です。
   まだインストールしていない場合は、以下のコマンドでインストールしてください:
   ```bash
   npm install -D tsx
   ```
   
   その後、シードを実行:
   ```bash
   npm run db:seed
   ```
   
   **説明:**
   - このコマンドは、`lib/db/seed.ts` を実行して初期タグデータを投入します
   - 以下の6つのタグが作成されます:
     - 高齢者支援
     - 環境美化
     - イベント運営
     - 子育て支援
     - 災害支援
     - その他
   - 既にタグが存在する場合は、スキップされます（エラーにはなりません）

4. **動作確認（オプション）**
   
   Drizzle Studioを使用してデータベースの内容を確認できます:
   ```bash
   npm run db:studio
   ```
   
   **説明:**
   - ブラウザで `http://localhost:4983` が自動的に開きます
   - データベースのテーブル構造とデータを視覚的に確認できます
   - タグテーブルに6つのタグが作成されていることを確認してください

**トラブルシューティング:**

- **マイグレーションエラー**
  - 環境変数が正しく設定されているか確認（`.env.local` ファイル）
  - Tursoデータベースに接続できるか確認
  - `drizzle.config.ts` の設定を確認

- **シードエラー**
  - `tsx` パッケージがインストールされているか確認
  - データベースに接続できるか確認
  - タグテーブルが作成されているか確認（マイグレーションが完了しているか）

- **型エラー**
  - `npm run type-check` で型チェックを実行
  - `lib/db/schema.ts` の構文エラーがないか確認

**完了確認:**

以下のコマンドで型チェックを実行し、エラーがないことを確認してください:
```bash
npm run type-check
```

すべてのコマンドが正常に完了したら、クエスト1は完了です。

---

### クエスト 2: 共通ユーティリティと型定義
**依存**: クエスト 1  
**優先度**: 🟠 高

#### 実装内容
- [x] `lib/types/` ディレクトリの作成
  - [x] `lib/types/user.ts` - User型、UserWithProfile型、UpdateUserProfileInput型
  - [x] `lib/types/post.ts` - Post型、PostWithAuthor型、PostWithTags型、PostWithAuthorAndTags型、CreatePostInput型、UpdatePostInput型
  - [x] `lib/types/application.ts` - Application型、ApplicationWithPost型、ApplicationWithApplicant型、ApplicationWithPostAndApplicant型、CreateApplicationInput型、UpdateApplicationStatusInput型
  - [x] `lib/types/message.ts` - Message型、MessageWithSender型、MessageWithReceiver型、MessageWithUsers型、MessageWithApplication型、CreateMessageInput型
  - [x] `lib/types/tag.ts` - Tag型
- [x] `lib/utils/` ディレクトリの作成
  - [x] `lib/utils/format.ts` - 日付フォーマット、金額フォーマット関数
  - [x] `lib/utils/validation.ts` - バリデーション関数（文字数チェック等）
  - [x] `lib/utils/constants.ts` - 定数定義（MAX_LENGTH等）
- [x] `lib/utils/errors.ts` - エラークラス定義（AppError、UnauthorizedError、ForbiddenError、NotFoundError、ValidationError、ConflictError）

#### 完了条件
- [x] すべての型定義が正しくエクスポートされている
- [x] ユーティリティ関数が動作する
- [x] 型チェックが通る

---

### クエスト 3: 認証ヘルパーとユーザー管理基盤
**依存**: クエスト 2  
**優先度**: 🟠 高

#### 実装内容
- [x] `lib/actions/auth.ts` の作成
  - [x] `getCurrentUser()` - 現在のユーザー取得
  - [x] `ensureAuthenticated()` - 認証チェックヘルパー
  - [x] `createOrUpdateUser()` - ユーザー作成/更新（Clerk連携）
- [x] `app/actions/users/update.ts` の作成
  - [x] `updateUserProfileAction()` - プロフィール更新Server Action
- [x] `lib/db/queries/users.ts` の作成
  - [x] `getUserById()` - ユーザー取得
  - [x] `getUserByClerkId()` - Clerk IDでユーザー取得
  - [x] `createUser()` - ユーザー作成
  - [x] `updateUser()` - ユーザー更新

#### 完了条件
- [x] 認証ヘルパーが動作する
- [x] ユーザー情報の取得・更新ができる
- [x] Server Actionで認証チェックが機能する

---

### クエスト 4: 認証UI（ログイン・新規登録）
**依存**: クエスト 3  
**優先度**: 🟠 高

#### 実装内容
- [x] `app/(auth)/login/page.tsx` の作成
  - [x] ClerkのSignInコンポーネント統合
  - [x] ログイン後のリダイレクト処理
- [x] `app/(auth)/sign-up/page.tsx` の作成
  - [x] ClerkのSignUpコンポーネント統合
  - [x] 登録後のリダイレクト処理
- [x] `app/(auth)/layout.tsx` の作成
  - [x] 認証画面用のレイアウト
- [x] 初回ログイン時のプロフィール設定
  - [x] `app/(auth)/onboarding/page.tsx` の作成
  - [x] 名前・自己紹介・アバター設定フォーム
  - [x] プロフィール設定後のリダイレクト

#### 完了条件
- [x] ログイン・新規登録が動作する
- [x] 初回ログイン時にプロフィール設定画面が表示される
- [x] 認証状態が正しく管理される

---

### クエスト 5: 投稿機能の基盤（CRUD）
**依存**: クエスト 3  
**優先度**: 🟠 高

#### 実装内容
- [x] `lib/db/queries/posts.ts` の作成
  - [x] `getPosts()` - 投稿一覧取得（ページネーション対応）
  - [x] `getPostById()` - 投稿詳細取得
  - [x] `getPostsByAuthorId()` - 投稿者の投稿一覧取得
  - [x] `createPost()` - 投稿作成
  - [x] `updatePost()` - 投稿更新
  - [x] `deletePost()` - 投稿削除（論理削除）
- [x] `app/actions/posts/create.ts` の作成
  - [x] `createPostAction()` - 投稿作成Server Action
  - [x] バリデーション実装
  - [x] 認証チェック
- [x] `app/actions/posts/update.ts` の作成
  - [x] `updatePostAction()` - 投稿更新Server Action
  - [x] 認可チェック（投稿者のみ更新可能）
- [x] `app/actions/posts/delete.ts` の作成
  - [x] `deletePostAction()` - 投稿削除Server Action
  - [x] 認可チェック（投稿者のみ削除可能）
- [x] `app/actions/posts/get.ts` の作成
  - [x] `getPostAction()` - 投稿取得Server Action
  - [x] `getPostsAction()` - 投稿一覧取得Server Action
  - [x] `getPostsByAuthorIdAction()` - 投稿者の投稿一覧取得Server Action

#### 完了条件
- [x] 投稿のCRUD操作がすべて動作する
- [x] バリデーションが正しく機能する
- [x] 認証・認可チェックが機能する

---

### クエスト 6: タグ機能の実装
**依存**: クエスト 1  
**優先度**: 🟡 中

#### 実装内容
- [x] `lib/db/queries/tags.ts` の作成
  - [x] `getAllTags()` - 全タグ取得
  - [x] `getTagsByPostId()` - 投稿のタグ取得
  - [x] `getTagsByPostIds()` - 複数の投稿のタグを一括取得
  - [x] `createPostTag()` - 投稿とタグの紐付け（1つのタグ）
  - [x] `createPostTags()` - 投稿とタグの紐付け（複数のタグ）
  - [x] `deletePostTag()` - 投稿とタグの紐付け削除（1つのタグ）
  - [x] `deletePostTags()` - 投稿とタグの紐付け削除（投稿のすべてのタグ）
  - [x] `getTagById()` - タグIDでタグを取得
  - [x] `getTagByName()` - タグ名でタグを取得
- [x] `app/actions/tags/get.ts` の作成
  - [x] `getAllTagsAction()` - タグ一覧取得Server Action
  - [x] `getTagsByPostIdAction()` - 投稿のタグ取得Server Action

#### 完了条件
- [x] タグの取得ができる
- [x] 投稿とタグの紐付けができる

---

### クエスト 7: 投稿一覧画面（ホーム）
**依存**: クエスト 5, クエスト 6  
**優先度**: 🟠 高

#### 実装内容
- [x] `components/posts/post-card.tsx` の作成
  - [x] 募集カードコンポーネント（Server Component）
  - [x] タイトル、募集者、日時、場所、人数、タグの表示
- [x] `components/posts/post-card-client.tsx` の作成
  - [x] クリック時のナビゲーション処理（Client Component）
- [x] `components/posts/post-list.tsx` の作成
  - [x] 投稿一覧コンポーネント（Server Component）
  - [x] タグの一括取得
- [x] `components/posts/post-list-skeleton.tsx` の作成
  - [x] スケルトンローダー
- [x] `app/(main)/page.tsx` の作成
  - [x] ホーム画面（投稿一覧）
  - [x] データフェッチ（Server Component）
  - [x] Suspenseによるローディング状態の管理

#### 完了条件
- [x] 投稿一覧が表示される
- [x] カードクリックで詳細画面に遷移する
- [x] モバイルで見やすいレイアウトになっている

---

### クエスト 8: 投稿詳細画面
**依存**: クエスト 7  
**優先度**: 🟠 高

#### 実装内容
- [x] `components/posts/post-detail.tsx` の作成
  - [x] 募集詳細表示コンポーネント（Server Component）
  - [x] すべての詳細情報の表示
  - [x] 募集者プロフィールカード
- [x] `app/(main)/posts/[id]/page.tsx` の作成
  - [x] 投稿詳細ページ
  - [x] データフェッチ
  - [x] エラーハンドリング（404等）
- [x] `app/(main)/posts/[id]/not-found.tsx` の作成
  - [x] 404エラーページ

#### 完了条件
- [x] 投稿詳細が正しく表示される
- [x] 募集者情報が表示される
- [x] タグが表示される

---

### クエスト 9: 投稿作成画面
**依存**: クエスト 8  
**優先度**: 🟠 高

#### 実装内容
- [x] `components/posts/post-form.tsx` の作成
  - [x] 投稿フォームコンポーネント（Client Component）
  - [x] すべての入力フィールド
  - [x] バリデーション（リアルタイム）
  - [x] タグ選択UI（最大5つ）
- [x] `app/(main)/posts/new/page.tsx` の作成
  - [x] 投稿作成ページ
  - [x] フォームの統合
  - [x] Server Action呼び出し
  - [x] 成功時のリダイレクト

#### 完了条件
- [x] 投稿フォームが動作する
- [x] バリデーションが機能する
- [x] 投稿作成後に詳細画面にリダイレクトされる

---

### クエスト 10: 応募機能の基盤
**依存**: クエスト 5  
**優先度**: 🟠 高

#### 実装内容
- [x] `lib/db/queries/applications.ts` の作成
  - [x] `getApplicationById()` - 応募取得
  - [x] `getApplicationsByPostId()` - 募集の応募一覧取得
  - [x] `getApplicationsByApplicantId()` - ユーザーの応募一覧取得
  - [x] `createApplication()` - 応募作成
  - [x] `updateApplicationStatus()` - 応募ステータス更新
  - [x] `cancelApplication()` - 応募キャンセル
  - [x] `getApplicationByPostAndApplicant()` - 重複チェック用
- [x] `app/actions/applications/create.ts` の作成
  - [x] `createApplicationAction()` - 応募作成Server Action
  - [x] 重複応募チェック
  - [x] 募集者本人チェック
  - [x] 募集ステータスチェック（activeのみ応募可能）
  - [x] 募集人数チェック（満員チェック）
- [x] `app/actions/applications/update.ts` の作成
  - [x] `updateApplicationStatusAction()` - 応募ステータス更新（承認/却下）
  - [x] 募集人数チェック
  - [x] 募集ステータス更新（満員時）
  - [x] 承認済みチェック（承認済みは却下不可）
- [x] `app/actions/applications/cancel.ts` の作成
  - [x] `cancelApplicationAction()` - 応募キャンセルServer Action
  - [x] 承認済みチェック（承認済みはキャンセル不可、応募者の場合）
  - [x] 募集者による承認済み応募のキャンセル時の人数調整

#### 完了条件
- [x] 応募の作成・更新・キャンセルが動作する
- [x] ビジネスロジック（重複チェック、人数チェック等）が機能する

---

### クエスト 11: 応募UI（応募ボタン・応募者一覧）
**依存**: クエスト 10, クエスト 8  
**優先度**: 🟠 高

#### 実装内容
- [x] `components/applications/application-form.tsx` の作成
  - [x] 応募確認ダイアログ（Client Component）
  - [x] 応募メッセージ入力
- [x] `components/applications/application-list.tsx` の作成
  - [x] 応募者一覧コンポーネント（Server Component）
  - [x] 応募者カード
  - [x] 承認/却下ボタン（募集者のみ表示）
- [x] `components/applications/application-card.tsx` の作成
  - [x] 応募者カードコンポーネント（Client Component）
  - [x] ステータスバッジ表示
  - [x] 承認/却下ボタン
- [x] `components/applications/application-button.tsx` の作成
  - [x] 応募ボタンコンポーネント（Client Component）
  - [x] 応募ステータスに応じた表示
- [x] 投稿詳細画面への統合
  - [x] 応募ボタンの追加
  - [x] 応募者一覧の追加（募集者のみ表示）
  - [x] 応募ステータスの表示

#### 完了条件
- [x] 応募ボタンが動作する
- [x] 応募確認ダイアログが表示される
- [x] 応募者一覧が表示される（募集者）
- [x] 承認/却下が動作する

---

### クエスト 12: チャット機能の基盤
**依存**: クエスト 10  
**優先度**: 🟡 中

#### 実装内容
- [x] `lib/db/queries/messages.ts` の作成
  - [x] `getMessagesByApplicationId()` - チャット履歴取得
  - [x] `createMessage()` - メッセージ作成
  - [x] `getChatRoomsByUserId()` - ユーザーのチャットルーム一覧取得
- [x] `app/actions/messages/create.ts` の作成
  - [x] `createMessageAction()` - メッセージ送信Server Action
  - [x] マッチングチェック（承認済みのみ送信可能）
  - [x] 送信者・受信者チェック
- [x] `app/actions/messages/get.ts` の作成
  - [x] `getMessagesAction()` - メッセージ取得Server Action
  - [x] `getChatRoomsAction()` - チャットルーム一覧取得Server Action

#### 完了条件
- [x] メッセージの送信・取得が動作する
- [x] チャットルーム一覧の取得が動作する
- [x] マッチングチェックが機能する

---

### クエスト 13: チャットUI
**依存**: クエスト 12  
**優先度**: 🟡 中

#### 実装内容
- [x] `components/chat/chat-message.tsx` の作成
  - [x] メッセージバブルコンポーネント
  - [x] 送信/受信の表示分岐
  - [x] タイムスタンプ表示
- [x] `components/chat/chat-input.tsx` の作成
  - [x] メッセージ入力コンポーネント（Client Component）
  - [x] 送信ボタン
- [x] `components/chat/chat-room-list.tsx` の作成
  - [x] チャットルーム一覧コンポーネント（Server Component）
  - [x] ルームカード
- [x] `components/chat/chat-room-card.tsx` の作成
  - [x] チャットルームカードコンポーネント（Client Component）
- [x] `app/(main)/chat/page.tsx` の作成
  - [x] チャットルーム一覧ページ
- [x] `app/(main)/chat/[id]/page.tsx` の作成
  - [x] チャット詳細ページ
  - [x] メッセージ一覧表示
  - [x] メッセージ送信機能

#### 完了条件
- [x] チャットルーム一覧が表示される
- [x] チャット詳細が表示される
- [x] メッセージの送信が動作する
- [x] LINE風のUIになっている

---

### クエスト 14: マイページ
**依存**: クエスト 11, クエスト 13  
**優先度**: 🟠 高

#### 実装内容
- [x] `components/profile/profile-header.tsx` の作成
  - [x] プロフィールヘッダーコンポーネント（Server Component）
  - [x] アバター、名前、自己紹介の表示
  - [x] 編集ボタン
- [x] `components/profile/profile-edit-form.tsx` の作成
  - [x] プロフィール編集フォーム（Client Component）
  - [x] モーダルまたはページ
- [x] `components/posts/user-post-list.tsx` の作成
  - [x] ユーザーの投稿一覧コンポーネント
  - [x] ステータスフィルタ
- [x] `components/applications/user-application-list.tsx` の作成
  - [x] ユーザーの応募一覧コンポーネント
  - [x] ステータスフィルタ
- [x] `components/applications/application-actions.tsx` の作成
  - [x] 応募アクションボタンコンポーネント（Client Component）
  - [x] キャンセルボタン、チャットを開くボタン
- [x] `components/ui/tabs.tsx` の作成
  - [x] タブコンポーネント（shadcn/ui）
- [x] `app/(main)/profile/page.tsx` の作成
  - [x] マイページ
  - [x] タブナビゲーション（投稿/応募/チャット）
  - [x] 各タブのコンテンツ表示

#### 完了条件
- [x] マイページが表示される
- [x] プロフィール編集が動作する
- [x] 投稿履歴・応募履歴が表示される
- [x] チャット一覧が表示される

---

### クエスト 15: 検索・フィルタ機能
**依存**: クエスト 7  
**優先度**: 🟡 中

#### 実装内容
- [x] `components/shared/search-bar.tsx` の作成
  - [x] 検索バーコンポーネント（Client Component）
- [x] `components/shared/filter-modal.tsx` の作成
  - [x] フィルタモーダルコンポーネント（Client Component）
  - [x] タグフィルタ
  - [x] 地域フィルタ
  - [x] 日付範囲フィルタ
- [x] `components/shared/filter-button.tsx` の作成
  - [x] フィルタボタンコンポーネント（Client Component）
  - [x] アクティブフィルタ数の表示
- [x] `lib/db/queries/posts.ts` に検索機能追加
  - [x] `searchPosts()` - キーワード検索
  - [x] `filterPostsByTags()` - タグフィルタ
  - [x] `filterPostsByDateRange()` - 日付範囲フィルタ
  - [x] `searchPostsWithFilters()` - 複合検索
- [x] `app/actions/posts/search.ts` の作成
  - [x] `searchPostsAction()` - 検索Server Action
- [x] ホーム画面への統合
  - [x] 検索バーの追加
  - [x] フィルタモーダルの追加
  - [x] URLパラメータでの検索状態管理

#### 完了条件
- [x] キーワード検索が動作する
- [x] タグフィルタが動作する
- [x] 日付範囲フィルタが動作する
- [x] 検索結果が正しく表示される

---

### クエスト 16: 無限スクロール実装
**依存**: クエスト 15  
**優先度**: 🟡 中

#### 実装内容
- [x] React QueryまたはSWRの導入（検討）
  - [x] ネイティブのIntersection Observer APIを使用（外部ライブラリ不要）
- [x] `components/posts/infinite-post-list.tsx` の作成
  - [x] 無限スクロール対応の投稿一覧（Client Component）
  - [x] ローディング状態の表示
  - [x] Intersection Observer APIによるスクロール検知
- [x] `components/posts/infinite-post-list-wrapper.tsx` の作成
  - [x] 初期データ取得用のラッパー（Server Component）
- [x] `app/actions/posts/search.ts` にページネーション対応
  - [x] OFFSETベースのページネーション
  - [x] タグ情報も含めて返す
- [x] ホーム画面への統合
  - [x] 無限スクロール投稿一覧への置き換え

#### 完了条件
- [x] 無限スクロールが動作する
- [x] パフォーマンスが良好（モバイルでもスムーズ）
- [x] ローディング状態が適切に表示される

---

### クエスト 17: エラーハンドリングとUI改善
**依存**: すべてのクエスト  
**優先度**: 🟡 中

#### 実装内容
- [x] エラーバウンダリーの実装
  - [x] `app/error.tsx` の作成
  - [x] `app/global-error.tsx` の作成
- [x] ローディング状態の統一
  - [x] `components/shared/loading.tsx` の作成
  - [x] スケルトンローディングの実装（既存のPostListSkeletonを使用）
- [x] トースト通知の実装
  - [x] `components/ui/toast.tsx` の作成（カスタム実装）
  - [x] 成功・エラー・情報の通知
  - [x] 主要なフォームコンポーネントへの統合
    - [x] 投稿作成フォーム
    - [x] 応募フォーム
    - [x] チャット入力
    - [x] 応募アクション（承認/却下/キャンセル）
- [x] 空状態の実装
  - [x] `components/shared/empty-state.tsx` の作成
  - [x] 投稿がない場合の表示（`EmptyPosts`）
  - [x] 応募がない場合の表示（`EmptyApplications`）
  - [x] チャットがない場合の表示（`EmptyChatRooms`）

#### 完了条件
- [x] エラーが適切にハンドリングされる
- [x] ローディング状態が統一されている
- [x] トースト通知が動作する
- [x] 空状態が適切に表示される

---

### クエスト 18: レスポンシブデザインの最適化
**依存**: すべてのクエスト  
**優先度**: 🟡 中

#### 実装内容
- [x] モバイル（375px）での表示確認
  - [x] コードベースの確認完了
  - [x] **手動確認が必要**: 実機またはブラウザの開発者ツールで375px幅での表示を確認
- [x] タッチターゲットのサイズ確認（44x44px以上）
  - [x] ボタンコンポーネントに`min-h-[44px] min-w-[44px]`を追加
  - [x] アイコンボタンのサイズを調整
  - [x] 検索バーのクリアボタンを調整
- [x] フォントサイズの最適化（最小16px）
  - [x] 入力フィールドを16pxに設定（iOS Safariの自動ズーム防止）
  - [x] タブレット以上で14pxに設定（メディアクエリ）
  - [x] 補助テキスト（text-xs）は装飾的な要素のため12pxのまま
- [x] スクロールの最適化
  - [x] `scroll-behavior: smooth`を追加
  - [x] フォントレンダリングの最適化
- [x] 画像の最適化（Next.js Imageコンポーネント）
  - [x] 現在はRadix UIのAvatarを使用（外部URLのためNext.js Imageは不要）
  - [x] 将来の拡張に向けたドキュメント作成
- [] パフォーマンステスト（Lighthouse）
  - [ ] **手動確認が必要**: Lighthouseでパフォーマンススコアを確認（目標: 90以上）

#### 完了条件
- [x] モバイルで快適に使用できる（コード実装完了、手動確認が必要）
- [ ] パフォーマンススコアが良好（Lighthouse 90以上）（手動確認が必要）
- [x] すべての画面がレスポンシブ対応（コード実装完了）

---

### クエスト 19: テストとバグ修正
**依存**: すべてのクエスト  
**優先度**: 🟠 高

#### 実装内容
- [x] 手動テストチェックリストの作成
  - [x] `docs/manual-test-checklist.md` の作成
  - [x] 認証フローのテスト項目
  - [x] 投稿CRUDのテスト項目
  - [x] 応募フローのテスト項目
  - [x] チャット機能のテスト項目
  - [x] マイページのテスト項目
  - [x] 検索・フィルタ機能のテスト項目
  - [x] エラーハンドリングのテスト項目
  - [x] レスポンシブデザインのテスト項目
  - [x] パフォーマンスのテスト項目
- [x] セキュリティチェックリストの作成
  - [x] `docs/security-checklist.md` の作成
  - [x] 認証・認可のチェック
  - [x] 入力バリデーションのチェック
  - [x] SQLインジェクション対策の確認
  - [x] XSS対策の確認
  - [x] CSRF対策の確認
- [x] エッジケースとバグ修正ドキュメントの作成
  - [x] `docs/edge-cases-and-bugs.md` の作成
  - [x] 確認済みのエッジケースの記録
  - [x] 潜在的なバグの記録
  - [x] 修正済みのバグの記録
- [ ] **手動テストの実行**
  - [ ] `docs/manual-test-checklist.md` に従って手動テストを実行
  - [ ] 発見したバグを修正
- [ ] **セキュリティチェックの実行**
  - [ ] `docs/security-checklist.md` に従ってセキュリティチェックを実行
  - [ ] 発見した問題を修正

#### 完了条件
- [x] テストチェックリストが作成されている
- [x] セキュリティチェックリストが作成されている
- [x] エッジケースとバグ修正ドキュメントが作成されている
- [ ] 主要な機能がすべて動作する（手動テスト実行後）
- [ ] 既知のバグがない（手動テスト実行後）
- [ ] セキュリティ上の問題がない（セキュリティチェック実行後）

---

## 🚀 Phase 2: 拡張機能（将来実装）

### クエスト 20: 決済機能（Stripe統合）
**依存**: クエスト 19  
**優先度**: 🔵 低

#### 実装内容
- [ ] Stripeアカウント設定
- [ ] `lib/payment/stripe.ts` の作成
- [ ] `app/api/webhooks/stripe/route.ts` の作成
- [ ] 決済フローの実装
- [ ] 決済履歴の管理

---

### クエスト 21: 評価システム
**依存**: クエスト 19  
**優先度**: 🔵 低

#### 実装内容
- [ ] 評価テーブルの追加
- [ ] 評価作成機能
- [ ] 評価表示機能
- [ ] 評価スコア計算

---

### クエスト 22: AIレコメンド
**依存**: クエスト 19  
**優先度**: 🔵 低

#### 実装内容
- [ ] OpenAI API統合
- [ ] レコメンドロジックの実装
- [ ] パーソナライズされた一覧表示

---

## 📊 進捗管理

### 完了済み
- [ ] クエスト 0
- [ ] クエスト 1
- [ ] クエスト 2
- [ ] クエスト 3
- [ ] クエスト 4
- [ ] クエスト 5
- [ ] クエスト 6
- [ ] クエスト 7
- [ ] クエスト 8
- [ ] クエスト 9
- [ ] クエスト 10
- [ ] クエスト 11
- [ ] クエスト 12
- [ ] クエスト 13
- [ ] クエスト 14
- [ ] クエスト 15
- [ ] クエスト 16
- [ ] クエスト 17
- [ ] クエスト 18
- [ ] クエスト 19

### 進行中
- なし

### 未着手
- すべてのクエスト

---

## 📝 開発メモ

### 注意事項
- 各クエストは独立してテスト可能な状態を目指す
- 依存関係を確認してから実装を開始する
- 型安全性を常に意識する
- モバイルファーストで実装する

### トラブルシューティング
- データベース接続エラー: 環境変数を確認
- 認証エラー: Clerkの設定を確認
- 型エラー: `lib/types` の型定義を確認

---

**最終更新**: 2024年（作成日）
