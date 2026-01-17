# Next.js App Router ベストプラクティス

## 概要

本ドキュメントは、Chiryu ConnectプロジェクトでNext.js 16 App Routerを使用する際のベストプラクティスを定義します。
すべての開発はこのドキュメントに準拠して実装してください。

---

## 1. Server Components をデフォルトとする

### 原則

- **デフォルトでServer Componentsを使用**: 非対話的なUI（テキスト、レイアウト、画像のみなど）は可能な限りServer Componentにする
- **Client Componentsは最小限**: インタラクションが必要な部分（フォーム、チャット、モーダル、ブラウザAPI等）のみ `'use client'` を使用
- **全体構造はServer Component基準**: ページ全体をServer Componentとし、必要な部分だけClient Componentとして分離

### 実装例

```typescript
// ✅ Good: Server Component（デフォルト）
// components/posts/post-card.tsx
import { Post } from '@/lib/types/post';

export function PostCard({ post }: { post: Post }) {
  return (
    <Card>
      <h2>{post.title}</h2>
      <p>{post.description}</p>
    </Card>
  );
}

// ✅ Good: インタラクションが必要な部分のみClient Component
// components/posts/post-card-client.tsx
'use client';

import { useRouter } from 'next/navigation';

export function PostCardClient({ post }: { post: Post }) {
  const router = useRouter();
  
  const handleClick = () => {
    router.push(`/posts/${post.id}`);
  };
  
  return <Card onClick={handleClick}>...</Card>;
}

// ❌ Bad: 不要なClient Component
'use client';

export function PostCard({ post }: { post: Post }) {
  // インタラクションがないのにClient Component
  return <Card>{post.title}</Card>;
}
```

### 判断基準

**Server Componentを使用する場合:**
- データフェッチが必要
- データベースに直接アクセス
- バックエンドAPIを呼び出し
- 機密情報（APIキー、トークン等）を使用
- 大きな依存関係をクライアントバンドルに追加したくない

**Client Componentを使用する場合:**
- `useState`, `useEffect`, `useReducer` などのフックが必要
- ブラウザAPI（`localStorage`, `window`等）を使用
- イベントリスナー（`onClick`, `onChange`等）が必要
- サードパーティライブラリ（`react-hook-form`, `framer-motion`等）を使用

---

## 2. フォルダ構造とRoute Groups

### 原則

- **機能ドメインで整理**: `app/` 以下を機能ドメイン（投稿、認証、応募、チャット等）で分割
- **Route Groupsを活用**: URLに含めたくないが論理的にグループ化したい機能は `(auth)`, `(main)` などのRoute Groupsを使用
- **Colocation**: 各ルートドメイン内に `_components/`, `_hooks/` などを配置し、機能に密に関わるロジックはその中で完結
- **Privateフォルダ**: ルーティング対象外の補助モジュールは `_` プレフィックスを使用

### フォルダ構造例

```
app/
├── (auth)/                    # Route Group（URLに含まれない）
│   ├── login/
│   │   └── page.tsx
│   ├── sign-up/
│   │   └── page.tsx
│   └── layout.tsx             # 認証画面用レイアウト
├── (main)/                    # Route Group（URLに含まれない）
│   ├── page.tsx               # ホーム（/）
│   ├── posts/
│   │   ├── [id]/
│   │   │   ├── page.tsx       # /posts/[id]
│   │   │   └── _components/  # Private（ルーティング対象外）
│   │   │       └── post-detail.tsx
│   │   └── new/
│   │       └── page.tsx       # /posts/new
│   └── layout.tsx             # メインアプリ用レイアウト
├── actions/                   # Server Actions（ルーティング対象外）
│   ├── posts/
│   └── applications/
└── layout.tsx                 # ルートレイアウト
```

### 命名規則

- **Route Groups**: `(group-name)` 形式（括弧で囲む）
- **Privateフォルダ**: `_folder-name` 形式（アンダースコアで始める）
- **動的ルート**: `[param]` 形式
- **キャッチオール**: `[...slug]` 形式

---

## 3. Layout と Template の設計

### 原則

- **ルートレイアウト**: `app/layout.tsx` で `<html>`, `<body>` を定義し、サイト共通のナビゲーション・テーマ・グローバルプロバイダーを配置
- **ネストされたレイアウト**: 機能ごと/セクションごとに `layout.tsx` をネストし、URLを変えずにレイアウト差を吸収
- **Template**: ページ遷移時に再マウントが必要な場合のみ `template.tsx` を使用（通常は `layout.tsx` で十分）

### 実装例

```typescript
// app/layout.tsx（ルートレイアウト）
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}

// app/(main)/layout.tsx（メインアプリ用レイアウト）
import { Header } from '@/components/shared/header';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  );
}
```

### Layout vs Template

- **Layout**: ページ遷移時に状態を保持（デフォルト）
- **Template**: ページ遷移時に再マウント（アニメーション等で必要）

---

## 4. データフェッチング戦略

### 原則

- **Server Componentsで直接フェッチ**: ページ/レイアウト内で必要なデータはそのレベルで取得
- **Suspenseを活用**: `loading.tsx` と組み合わせてローディング状態を明示
- **並列フェッチ**: 複数のデータフェッチは並列実行（`Promise.all`）
- **型安全性**: TypeScriptでレスポンス型をしっかり定義

### 実装例

```typescript
// ✅ Good: Server Componentで直接フェッチ
// app/(main)/posts/[id]/page.tsx
import { getPostById } from '@/lib/db/queries/posts';
import { Suspense } from 'react';
import { PostDetail } from '@/components/posts/post-detail';
import { PostDetailSkeleton } from '@/components/posts/post-detail-skeleton';

export default async function PostPage({
  params,
}: {
  params: { id: string };
}) {
  const post = await getPostById(params.id);
  
  if (!post) {
    notFound();
  }
  
  return (
    <Suspense fallback={<PostDetailSkeleton />}>
      <PostDetail post={post} />
    </Suspense>
  );
}

// ✅ Good: 並列フェッチ
export default async function HomePage() {
  const [posts, tags] = await Promise.all([
    getPosts(20, 0),
    getAllTags(),
  ]);
  
  return <HomeContent posts={posts} tags={tags} />;
}
```

### Server Actions経由のフェッチ

インタラクションが必要な場合（フォーム送信、ボタンクリック等）はServer Actionsを使用:

```typescript
// app/actions/posts/create.ts
'use server';

export async function createPostAction(input: CreatePostInput) {
  // 認証チェック、バリデーション、DB操作
  // ...
}
```

---

## 5. キャッシングと再検証（Revalidation）

### 原則

- **適切なキャッシュ戦略**: データの性質に応じてキャッシュを設定
- **再検証の活用**: `revalidatePath`, `revalidateTag` で必要に応じてキャッシュを無効化
- **動的レンダリング**: ユーザーごとに異なるコンテンツは動的レンダリング

### キャッシュ戦略

```typescript
// 1. 時間ベースの再検証（60秒ごと）
export const revalidate = 60;

// 2. タグベースの再検証
import { unstable_cache } from 'next/cache';

const getCachedPosts = unstable_cache(
  async () => getPosts(),
  ['posts'],
  { tags: ['posts'], revalidate: 3600 }
);

// 3. Server Actions後の再検証
import { revalidatePath } from 'next/cache';

export async function createPostAction(input: CreatePostInput) {
  // DB操作
  await createPost(input);
  
  // キャッシュを無効化
  revalidatePath('/');
  revalidatePath('/posts');
}
```

### データの性質による分類

| データの性質 | キャッシュ戦略 | 例 |
|------------|--------------|-----|
| 頻繁に更新される | キャッシュしない（`cache: 'no-store'`） | 応募ステータス、チャットメッセージ |
| 中程度の更新頻度 | 短い再検証時間（`revalidate: 60`） | 募集一覧 |
| ほとんど更新されない | 長い再検証時間（`revalidate: 3600`） | タグマスタ、設定情報 |

---

## 6. Suspense と Streaming

### 原則

- **Suspense境界を適切に設定**: ローディング状態を細かく制御
- **`loading.tsx` を活用**: ページ/レイアウトごとにローディングUIを定義
- **ストリーミング**: データが準備できた部分から順次表示

### 実装例

```typescript
// app/(main)/posts/[id]/loading.tsx
export default function Loading() {
  return <PostDetailSkeleton />;
}

// app/(main)/posts/[id]/page.tsx
import { Suspense } from 'react';

export default async function PostPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<PostDetailSkeleton />}>
      <PostDetailContent id={params.id} />
    </Suspense>
  );
}

async function PostDetailContent({ id }: { id: string }) {
  const post = await getPostById(id);
  return <PostDetail post={post} />;
}
```

---

## 7. エラーハンドリング

### 原則

- **`error.tsx` を活用**: ページ/レイアウトごとにエラーUIを定義
- **`notFound()` を使用**: 404エラーは `notFound()` 関数を使用
- **統一されたエラーハンドリング**: Server Actionsでエラーを適切に処理

### 実装例

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
      <button onClick={reset}>再試行</button>
    </div>
  );
}

// app/(main)/posts/[id]/page.tsx
import { notFound } from 'next/navigation';

export default async function PostPage({ params }: { params: { id: string } }) {
  const post = await getPostById(params.id);
  
  if (!post) {
    notFound(); // 404ページを表示
  }
  
  return <PostDetail post={post} />;
}

// app/(main)/posts/[id]/not-found.tsx
export default function NotFound() {
  return <div>投稿が見つかりません</div>;
}
```

---

## 8. メタデータ管理

### 原則

- **`metadata` オブジェクトで定義**: 静的メタデータは `metadata` オブジェクトで定義
- **動的メタデータ**: `generateMetadata` 関数で動的に生成
- **SEO最適化**: 適切なタイトル、説明、OGP画像を設定

### 実装例

```typescript
// 静的メタデータ
export const metadata = {
  title: 'Chiryu Connect',
  description: '知立市のボランティアマッチングプラットフォーム',
};

// 動的メタデータ
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const post = await getPostById(params.id);
  
  return {
    title: post?.title ?? '投稿が見つかりません',
    description: post?.description ?? '',
    openGraph: {
      images: [post?.imageUrl ?? ''],
    },
  };
}
```

---

## 9. Server Actions のベストプラクティス

### 原則

- **1ファイル1アクション**: 各Server Actionは独立したファイルに配置
- **認証チェック**: すべてのServer Actionで認証状態を確認
- **バリデーション**: 入力データのバリデーションを実装
- **エラーハンドリング**: 適切なエラーメッセージを返す
- **再検証**: データ変更後は `revalidatePath` でキャッシュを無効化

### 実装例

```typescript
// app/actions/posts/create.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { createPost } from '@/lib/db/queries/posts';
import { validatePostInput } from '@/lib/utils/validation';

export async function createPostAction(input: CreatePostInput) {
  // 1. 認証チェック
  const { userId } = await auth();
  if (!userId) {
    return { success: false, error: '認証が必要です' };
  }

  // 2. バリデーション
  const validation = validatePostInput(input);
  if (!validation.success) {
    return { success: false, error: validation.error.message };
  }

  // 3. ビジネスロジック
  try {
    const post = await createPost({
      ...validation.data,
      authorId: userId,
    });

    // 4. キャッシュ再検証
    revalidatePath('/');
    revalidatePath('/posts');

    return { success: true, data: post };
  } catch (error) {
    return { success: false, error: '投稿の作成に失敗しました' };
  }
}
```

### フォームとの統合

```typescript
// components/posts/post-form.tsx
'use client';

import { createPostAction } from '@/app/actions/posts/create';
import { useRouter } from 'next/navigation';

export function PostForm() {
  const router = useRouter();
  
  async function handleSubmit(formData: FormData) {
    const result = await createPostAction({
      title: formData.get('title') as string,
      // ...
    });
    
    if (result.success) {
      router.push(`/posts/${result.data.id}`);
    } else {
      // エラー処理
    }
  }
  
  return <form action={handleSubmit}>...</form>;
}
```

---

## 10. 型安全性の徹底

### 原則

- **TypeScriptを徹底**: すべてのコードで型を明示
- **Drizzle ORMの型推論**: データベーススキーマから型を自動推論
- **型定義の一元管理**: 共通の型定義は `lib/types` に集約
- **`any` の禁止**: `unknown` を使用し、適切に型ガード

### 実装例

```typescript
// lib/types/post.ts
import { posts, users, tags } from '@/lib/db/schema';
import { InferSelectModel } from 'drizzle-orm';

export type Post = InferSelectModel<typeof posts>;
export type User = InferSelectModel<typeof users>;

export type PostWithAuthor = Post & {
  author: User;
  tags: Tag[];
};

// Server Actionの型定義
export type CreatePostInput = {
  title: string;
  description: string;
  activityDate: Date;
  // ...
};

export type CreatePostResult = 
  | { success: true; data: Post }
  | { success: false; error: string };
```

---

## 11. パフォーマンス最適化

### 原則

- **画像最適化**: Next.js `Image` コンポーネントを使用
- **コード分割**: 動的インポートでバンドルサイズを削減
- **フォント最適化**: `next/font` でフォントを最適化
- **バンドル分析**: 定期的にバンドルサイズを確認

### 実装例

```typescript
// 画像最適化
import Image from 'next/image';

<Image
  src={post.imageUrl}
  alt={post.title}
  width={400}
  height={225}
  loading="lazy"
  placeholder="blur"
/>

// 動的インポート
import dynamic from 'next/dynamic';

const PostForm = dynamic(() => import('@/components/posts/post-form'), {
  loading: () => <PostFormSkeleton />,
  ssr: false, // 必要に応じて
});
```

---

## 12. セキュリティ

### 原則

- **認証チェック**: すべてのServer Actionで認証を確認
- **認可チェック**: リソースへのアクセス権を確認
- **入力サニタイズ**: ユーザー入力は適切にサニタイズ
- **環境変数**: 機密情報は環境変数で管理

### 実装例

```typescript
// 認証チェック
const { userId } = await auth();
if (!userId) {
  throw new Error('Unauthorized');
}

// 認可チェック
const post = await getPostById(postId);
if (post.authorId !== userId) {
  throw new Error('Forbidden');
}

// 環境変数の型定義
// lib/env.ts
export const env = {
  TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL!,
  TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN!,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY!,
} as const;
```

---

## 13. 開発ワークフロー

### 原則

- **型チェック**: 開発中は常に型チェックを実行
- **リント**: ESLintでコード品質を維持
- **フォーマット**: Prettierでコードフォーマットを統一
- **コミット前チェック**: 型チェックとリントを実行

### 推奨スクリプト

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

---

## まとめ

本ベストプラクティスに準拠することで、以下のメリットが得られます:

1. **パフォーマンス**: Server Componentsによりバンドルサイズを削減
2. **開発効率**: 明確な構造により開発が容易
3. **保守性**: 一貫したパターンにより保守が容易
4. **型安全性**: TypeScriptによる型安全性の確保
5. **セキュリティ**: 適切な認証・認可の実装

すべての開発はこのベストプラクティスに準拠してください。
