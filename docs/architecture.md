# Chiryu Connect - アーキテクチャ設計書

## 概要

本ドキュメントでは、Chiryu Connectのアーキテクチャ設計とフォルダ構成の方針を定義します。
Server ActionsとUIの分離を重視し、将来の拡張性（決済、評価、AIレコメンド）を考慮した設計とします。

**重要**: 本アーキテクチャは `docs/nextjs-best-practices.md` で定義されたNext.js App Routerのベストプラクティスに準拠しています。

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **スタイリング**: Tailwind CSS v4
- **UIコンポーネント**: Shadcn/ui
- **バックエンド**: Server Actions（API Routesなし）
- **データベース**: Turso (libSQL)
- **ORM**: Drizzle ORM
- **認証**: Clerk
- **型チェック**: TypeScript

## アーキテクチャ原則

### 1. Server ActionsとUIの分離

- **ビジネスロジック**: Server Actionsに集約
- **UIコンポーネント**: 表示とユーザーインタラクションのみ
- **データフェッチ**: Server Componentsで直接実行、またはServer Actions経由

### 2. レイヤー分離

```
┌─────────────────────────────────────┐
│         UI Layer (Components)       │
│  - Presentational Components        │
│  - Client Components (必要時のみ)    │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Action Layer (Server Actions)   │
│  - Business Logic                   │
│  - Validation                       │
│  - Authorization                   │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Data Layer (Drizzle ORM)       │
│  - Database Queries                 │
│  - Schema Definition                │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Database (Turso/libSQL)        │
└─────────────────────────────────────┘
```

### 3. 型安全性の徹底

- Drizzle ORMの型推論を最大限活用
- Server Actionsの入力/出力に型を明示
- 共通の型定義は `lib/types` に集約

### 4. 将来の拡張性

- 決済機能: `lib/payment` に分離
- 評価システム: `lib/rating` に分離
- AIレコメンド: `lib/ai` に分離
- 各機能は独立したモジュールとして実装

## フォルダ構成

```
chiryu-connect/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 認証関連（Route Group、URLに含まれない）
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── sign-up/
│   │   │   └── page.tsx
│   │   ├── onboarding/
│   │   │   └── page.tsx          # 初回ログイン時のプロフィール設定
│   │   ├── layout.tsx            # 認証画面用レイアウト
│   │   ├── loading.tsx           # 認証画面用ローディング
│   │   └── error.tsx            # 認証画面用エラー
│   ├── (main)/                   # メインアプリ（Route Group、URLに含まれない）
│   │   ├── page.tsx              # ホーム（募集一覧、/）
│   │   ├── loading.tsx           # ホーム用ローディング
│   │   ├── error.tsx             # ホーム用エラー
│   │   ├── posts/
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx      # 募集詳細（/posts/[id]）
│   │   │   │   ├── loading.tsx   # 詳細用ローディング
│   │   │   │   ├── error.tsx     # 詳細用エラー
│   │   │   │   ├── not-found.tsx # 404ページ
│   │   │   │   └── _components/  # Private（ルーティング対象外）
│   │   │   │       └── post-detail-content.tsx
│   │   │   └── new/
│   │   │       ├── page.tsx      # 投稿作成（/posts/new）
│   │   │       └── loading.tsx
│   │   ├── chat/
│   │   │   ├── page.tsx          # チャットルーム一覧（/chat）
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx      # チャット詳細（/chat/[id]）
│   │   │   │   └── loading.tsx
│   │   │   └── loading.tsx
│   │   ├── profile/
│   │   │   ├── page.tsx          # マイページ（/profile）
│   │   │   └── loading.tsx
│   │   └── layout.tsx            # メインアプリ用レイアウト
│   ├── actions/                  # Server Actions
│   │   ├── posts/
│   │   │   ├── create.ts         # 投稿作成
│   │   │   ├── update.ts         # 投稿更新
│   │   │   ├── delete.ts         # 投稿削除
│   │   │   └── get.ts            # 投稿取得
│   │   ├── applications/
│   │   │   ├── create.ts         # 応募作成
│   │   │   ├── update.ts         # 応募更新（承認/却下）
│   │   │   └── cancel.ts         # 応募キャンセル
│   │   ├── messages/
│   │   │   ├── create.ts         # メッセージ送信
│   │   │   └── get.ts            # メッセージ取得
│   │   └── users/
│   │       └── update.ts         # プロフィール更新
│   ├── api/                      # API Routes（将来の外部連携用）
│   │   └── webhooks/             # Webhook（Stripe等）
│   ├── globals.css               # グローバルスタイル
│   ├── layout.tsx                # ルートレイアウト
│   └── middleware.ts             # 認証ミドルウェア
├── components/                    # Reactコンポーネント
│   ├── ui/                       # Shadcn/uiコンポーネント
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── posts/                    # 投稿関連コンポーネント
│   │   ├── post-card.tsx         # 募集カード
│   │   ├── post-detail.tsx       # 募集詳細表示
│   │   ├── post-form.tsx         # 投稿フォーム
│   │   └── post-list.tsx         # 募集一覧
│   ├── applications/             # 応募関連コンポーネント
│   │   ├── application-card.tsx
│   │   └── application-form.tsx
│   ├── chat/                     # チャット関連コンポーネント
│   │   ├── chat-room-list.tsx
│   │   ├── chat-message.tsx      # メッセージバブル
│   │   └── chat-input.tsx
│   ├── profile/                  # プロフィール関連コンポーネント
│   │   ├── profile-header.tsx
│   │   └── profile-edit-form.tsx
│   └── shared/                   # 共通コンポーネント
│       ├── header.tsx
│       ├── search-bar.tsx
│       ├── filter-modal.tsx
│       └── loading.tsx
├── lib/                          # ユーティリティ・ビジネスロジック
│   ├── db/                       # データベース関連
│   │   ├── schema.ts             # Drizzleスキーマ定義
│   │   ├── index.ts              # DB接続
│   │   └── migrations/           # マイグレーションファイル
│   ├── actions/                  # Server Actionsのヘルパー
│   │   ├── auth.ts               # 認証チェック
│   │   └── validation.ts        # バリデーション
│   ├── types/                    # 型定義
│   │   ├── post.ts
│   │   ├── application.ts
│   │   ├── message.ts
│   │   └── user.ts
│   ├── utils/                    # ユーティリティ関数
│   │   ├── format.ts             # 日付・金額フォーマット
│   │   ├── validation.ts         # バリデーション関数
│   │   └── constants.ts          # 定数
│   ├── payment/                  # 決済機能（Phase 2）
│   │   ├── stripe.ts
│   │   └── types.ts
│   ├── rating/                   # 評価システム（Phase 2）
│   │   ├── calculate.ts
│   │   └── types.ts
│   └── ai/                       # AIレコメンド（Phase 2）
│       ├── recommend.ts
│       └── types.ts
├── public/                       # 静的ファイル
│   ├── images/
│   └── icons/
├── .env.local                    # 環境変数（.gitignore）
├── .cursorrules                  # 開発ルール
├── drizzle.config.ts             # Drizzle設定
├── next.config.ts                # Next.js設定
├── package.json
├── tsconfig.json
└── tailwind.config.ts            # Tailwind設定
```

## 各レイヤーの詳細設計

### 1. UI Layer (Components)

#### 原則
- **Server Componentsをデフォルト**: データフェッチが必要な場合はServer Component
- **Client Componentsは最小限**: インタラクションが必要な場合のみ `'use client'`
- **コンポーネントの責務**: 表示とユーザーインタラクションのみ

#### コンポーネント構造例

```typescript
// components/posts/post-card.tsx (Server Component)
import { Post } from '@/lib/types/post';
import { PostCardClient } from './post-card-client';

export function PostCard({ post }: { post: Post }) {
  // データ整形などの軽量処理
  return <PostCardClient post={post} />;
}

// components/posts/post-card-client.tsx (Client Component)
'use client';

export function PostCardClient({ post }: { post: Post }) {
  // インタラクション処理
  const handleClick = () => {
    router.push(`/posts/${post.id}`);
  };
  
  return (
    <Card onClick={handleClick}>
      {/* UI */}
    </Card>
  );
}
```

### 2. Action Layer (Server Actions)

#### 原則
- **1ファイル1アクション**: 各Server Actionは独立したファイル
- **認証チェック**: すべてのServer Actionで認証状態を確認
- **バリデーション**: 入力データのバリデーションを実装
- **エラーハンドリング**: 適切なエラーメッセージを返す

#### Server Actionの構造例

```typescript
// app/actions/posts/create.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { posts } from '@/lib/db/schema';
import { validatePostInput } from '@/lib/utils/validation';
import { revalidatePath } from 'next/cache';

export async function createPostAction(input: CreatePostInput) {
  // 1. 認証チェック
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  // 2. バリデーション
  const validated = validatePostInput(input);
  if (!validated.success) {
    throw new Error(validated.error.message);
  }

  // 3. ビジネスロジック
  const post = await db.insert(posts).values({
    authorId: userId,
    ...validated.data,
  }).returning();

  // 4. キャッシュ再検証
  revalidatePath('/');

  return { success: true, data: post[0] };
}
```

#### Server Actionsの命名規則

- ファイル名: 動詞（`create.ts`, `update.ts`, `delete.ts`）
- 関数名: `{動詞}{Entity}Action`（例: `createPostAction`）
- 型定義: `{動詞}{Entity}Input`（例: `CreatePostInput`）

### 3. Data Layer (Drizzle ORM)

#### 原則
- **スキーマ定義**: `lib/db/schema.ts` に一元管理
- **型推論**: Drizzleの型推論を最大限活用
- **クエリビルダー**: 複雑なクエリは関数として分離

#### クエリ関数の例

```typescript
// lib/db/queries/posts.ts
import { db } from '../index';
import { posts, users, postTags, tags } from '../schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export async function getPostsWithAuthor(limit: number, offset: number) {
  return await db
    .select({
      post: posts,
      author: users,
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.status, 'active'))
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);
}
```

### 4. 型定義

#### 原則
- **共通型**: `lib/types` に集約
- **Drizzle型の拡張**: 必要に応じて型を拡張

#### 型定義の例

```typescript
// lib/types/post.ts
import { posts, users, tags } from '@/lib/db/schema';
import { InferSelectModel } from 'drizzle-orm';

export type Post = InferSelectModel<typeof posts>;
export type User = InferSelectModel<typeof users>;
export type Tag = InferSelectModel<typeof tags>;

export type PostWithAuthor = Post & {
  author: User;
  tags: Tag[];
};

export type CreatePostInput = {
  title: string;
  description: string;
  activityDate: Date;
  // ...
};
```

## 認証フロー

### Clerk統合

```typescript
// app/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/login',
  '/sign-up',
  '/',
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

// lib/actions/auth.ts
import { auth } from '@clerk/nextjs/server';

export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) return null;
  
  // usersテーブルからユーザー情報を取得
  // ...
}
```

## データフェッチ戦略

### Server Componentsでの直接フェッチ

```typescript
// app/(main)/page.tsx
import { Suspense } from 'react';
import { getPostsWithAuthor } from '@/lib/db/queries/posts';
import { PostList } from '@/components/posts/post-list';
import { PostListSkeleton } from '@/components/posts/post-list-skeleton';

export default async function HomePage() {
  // データフェッチ（Server Component）
  const posts = await getPostsWithAuthor(20, 0);
  
  return (
    <Suspense fallback={<PostListSkeleton />}>
      <PostList posts={posts} />
    </Suspense>
  );
}
```

### 並列フェッチの活用

```typescript
// 複数のデータを並列で取得
export default async function HomePage() {
  const [posts, tags] = await Promise.all([
    getPostsWithAuthor(20, 0),
    getAllTags(),
  ]);
  
  return <HomeContent posts={posts} tags={tags} />;
}
```

### Server Actions経由のフェッチ（インタラクション時）

```typescript
// app/(main)/posts/new/page.tsx
'use client';

import { createPostAction } from '@/app/actions/posts/create';

export function PostForm() {
  const handleSubmit = async (data: FormData) => {
    await createPostAction(data);
    router.push('/');
  };
  
  // ...
}
```

## キャッシュ戦略

### Next.js 16のキャッシュ機能を活用

```typescript
// 1. 時間ベースの再検証（ページレベル）
export const revalidate = 60; // 60秒ごとに再検証

// 2. タグベースの再検証（クエリ関数）
import { unstable_cache } from 'next/cache';

const getCachedPosts = unstable_cache(
  async () => getPostsWithAuthor(20, 0),
  ['posts'],
  { tags: ['posts'], revalidate: 3600 }
);

// 3. Server Actions後の再検証
import { revalidatePath, revalidateTag } from 'next/cache';

export async function createPostAction(input: CreatePostInput) {
  // DB操作
  await createPost(input);
  
  // キャッシュを無効化
  revalidatePath('/');
  revalidatePath('/posts');
  revalidateTag('posts');
}
```

### データの性質によるキャッシュ戦略

| データの性質 | キャッシュ戦略 | 例 |
|------------|--------------|-----|
| 頻繁に更新される | `cache: 'no-store'` | 応募ステータス、チャットメッセージ |
| 中程度の更新頻度 | `revalidate: 60` | 募集一覧 |
| ほとんど更新されない | `revalidate: 3600` | タグマスタ |

## エラーハンドリング

### Next.js App Routerのエラーハンドリング

```typescript
// app/(main)/posts/[id]/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>エラーが発生しました</h2>
      <p>{error.message}</p>
      <button onClick={reset}>再試行</button>
    </div>
  );
}

// app/(main)/posts/[id]/not-found.tsx
export default function NotFound() {
  return <div>投稿が見つかりません</div>;
}

// app/(main)/posts/[id]/page.tsx
import { notFound } from 'next/navigation';

export default async function PostPage({ params }: { params: { id: string } }) {
  const post = await getPostById(params.id);
  
  if (!post) {
    notFound(); // not-found.tsx を表示
  }
  
  return <PostDetail post={post} />;
}
```

### Server Actionsでのエラーハンドリング

```typescript
// lib/utils/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
  }
}

// Server Actionsでの使用
export async function createPostAction(input: CreatePostInput) {
  try {
    // ...
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: '予期しないエラーが発生しました' };
  }
}
```

## 将来の拡張性

### 決済機能（Phase 2）

```
lib/payment/
├── stripe.ts          # Stripe統合
├── webhook.ts         # Webhook処理
└── types.ts           # 決済関連の型定義

app/api/webhooks/
└── stripe/
    └── route.ts       # Stripe Webhookエンドポイント
```

### 評価システム（Phase 2）

```
lib/rating/
├── calculate.ts       # 評価スコア計算
├── create.ts          # 評価作成
└── types.ts           # 評価関連の型定義

app/actions/ratings/
├── create.ts
└── get.ts
```

### AIレコメンド（Phase 2）

```
lib/ai/
├── recommend.ts       # レコメンドロジック
├── openai.ts          # OpenAI API統合
└── types.ts           # AI関連の型定義

app/actions/recommendations/
└── get.ts
```

## パフォーマンス最適化

### 1. 画像最適化

```typescript
import Image from 'next/image';

<Image
  src={post.imageUrl}
  alt={post.title}
  width={400}
  height={225}
  loading="lazy"
/>
```

### 2. コード分割

```typescript
// 動的インポート
const PostForm = dynamic(() => import('@/components/posts/post-form'));
```

### 3. 無限スクロール

```typescript
// クライアントコンポーネントで実装
'use client';

import { useInfiniteQuery } from '@tanstack/react-query'; // 将来実装
```

## セキュリティ

### 1. 認証チェック

すべてのServer Actionで認証を確認:

```typescript
const { userId } = await auth();
if (!userId) throw new Error('Unauthorized');
```

### 2. 認可チェック

リソースへのアクセス権を確認:

```typescript
const post = await getPost(postId);
if (post.authorId !== userId) {
  throw new Error('Forbidden');
}
```

### 3. 入力サニタイズ

Drizzle ORMが自動的にSQLインジェクションを防止。
XSS対策はReactのデフォルトエスケープを活用。

## 開発ワークフロー

### 1. データベースマイグレーション

```bash
# スキーマ変更後
npx drizzle-kit generate
npx drizzle-kit migrate
```

### 2. 型チェック

```bash
npm run type-check  # 将来追加
```

### 3. リント

```bash
npm run lint
```

## まとめ

本アーキテクチャは以下の原則に基づいています:

1. **分離**: UI、ビジネスロジック、データアクセスの明確な分離
2. **型安全性**: TypeScriptとDrizzle ORMによる型推論の活用
3. **拡張性**: 将来の機能追加を容易にするモジュール設計
4. **パフォーマンス**: Next.js 16の機能を最大限活用
5. **セキュリティ**: 認証・認可の徹底
6. **ベストプラクティス準拠**: `docs/nextjs-best-practices.md` に定義されたベストプラクティスに準拠

この設計により、保守性が高く、拡張しやすいアプリケーションを構築できます。

**参考ドキュメント**:
- [Next.js App Router ベストプラクティス](./nextjs-best-practices.md)
- [プロダクト要件定義書](./prd.md)
- [データベーススキーマ設計書](./schema.md)
- [UXフロー設計書](./ux_flow.md)
