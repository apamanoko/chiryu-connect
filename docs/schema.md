# Chiryu Connect - データベーススキーマ設計書

## 概要

本ドキュメントでは、Chiryu Connectのデータベーススキーマを定義します。
Turso (libSQL) を使用し、Drizzle ORMで管理します。

## テーブル一覧

1. `users` - ユーザー情報（Clerk連携）
2. `posts` - ボランティア募集投稿
3. `applications` - 応募情報
4. `messages` - チャットメッセージ
5. `tags` - タグマスタ
6. `post_tags` - 投稿とタグの多対多リレーション

## テーブル定義

### 1. users テーブル

Clerkのユーザー情報を補完するテーブル。Clerkの `user.id` を外部キーとして参照。

```typescript
{
  id: string (PK) // ClerkのユーザーID
  clerkId: string (UNIQUE, NOT NULL) // ClerkのユーザーID（重複チェック用）
  name: string (NOT NULL) // 表示名
  bio: string | null // 自己紹介（最大500文字）
  avatarUrl: string | null // プロフィール画像URL
  createdAt: timestamp (NOT NULL, DEFAULT NOW)
  updatedAt: timestamp (NOT NULL, DEFAULT NOW)
}
```

**インデックス**
- `clerkId` にUNIQUEインデックス

**制約**
- `name` は1文字以上50文字以内
- `bio` は500文字以内（null可）

### 2. posts テーブル

ボランティア募集の投稿情報。

```typescript
{
  id: string (PK) // UUID
  authorId: string (FK -> users.id, NOT NULL) // 投稿者ID
  title: string (NOT NULL) // 募集タイトル（最大100文字）
  description: string (NOT NULL) // 詳細説明（マークダウン、最大5000文字）
  activityDate: timestamp (NOT NULL) // 活動日時（開始時刻）
  activityEndDate: timestamp | null // 活動終了日時（nullの場合は1日のみ）
  location: string (NOT NULL) // 活動場所（最大200文字）
  maxParticipants: number (NOT NULL, DEFAULT 1) // 募集人数
  currentParticipants: number (NOT NULL, DEFAULT 0) // 現在の応募者数（承認済み）
  requiredSkills: string | null // 必要なスキル・経験（最大500文字）
  rewardAmount: number | null // 謝礼金額（円、nullの場合は謝礼なし）
  rewardDescription: string | null // 謝礼の説明（最大200文字）
  status: enum (NOT NULL, DEFAULT 'active') // 'active' | 'closed' | 'cancelled'
  createdAt: timestamp (NOT NULL, DEFAULT NOW)
  updatedAt: timestamp (NOT NULL, DEFAULT NOW)
}
```

**インデックス**
- `authorId` にインデックス（投稿者の投稿一覧取得用）
- `activityDate` にインデックス（日付検索用）
- `status` にインデックス（アクティブな投稿のフィルタ用）
- `createdAt` にインデックス（新着順ソート用）

**制約**
- `title` は1文字以上100文字以内
- `description` は1文字以上5000文字以内
- `maxParticipants` は1以上100以下
- `currentParticipants` は0以上 `maxParticipants` 以下
- `rewardAmount` は0以上（null可）
- `activityDate` は未来の日時であること（バリデーションはアプリケーション層で実装）

**enum定義**
```typescript
type PostStatus = 'active' | 'closed' | 'cancelled'
```

### 3. applications テーブル

ユーザーが募集に応募した情報。

```typescript
{
  id: string (PK) // UUID
  postId: string (FK -> posts.id, NOT NULL) // 募集ID
  applicantId: string (FK -> users.id, NOT NULL) // 応募者ID
  status: enum (NOT NULL, DEFAULT 'pending') // 'pending' | 'approved' | 'rejected' | 'cancelled'
  message: string | null // 応募メッセージ（最大500文字、任意）
  createdAt: timestamp (NOT NULL, DEFAULT NOW)
  updatedAt: timestamp (NOT NULL, DEFAULT NOW)
}
```

**インデックス**
- `postId` にインデックス（募集の応募者一覧取得用）
- `applicantId` にインデックス（ユーザーの応募一覧取得用）
- `(postId, applicantId)` にUNIQUE複合インデックス（1ユーザーは1募集に1回のみ応募可能）

**制約**
- `message` は500文字以内（null可）
- 同じ `postId` と `applicantId` の組み合わせは1つのみ（UNIQUE制約）

**enum定義**
```typescript
type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'
```

### 4. messages テーブル

チャットメッセージ（マッチング成立後のみ）。

```typescript
{
  id: string (PK) // UUID
  applicationId: string (FK -> applications.id, NOT NULL) // 応募ID（チャットルーム識別用）
  senderId: string (FK -> users.id, NOT NULL) // 送信者ID
  receiverId: string (FK -> users.id, NOT NULL) // 受信者ID
  content: string (NOT NULL) // メッセージ内容（最大2000文字）
  isRead: boolean (NOT NULL, DEFAULT false) // 既読フラグ（Phase 2で使用）
  createdAt: timestamp (NOT NULL, DEFAULT NOW)
}
```

**インデックス**
- `applicationId` にインデックス（チャット履歴取得用）
- `senderId` にインデックス（送信メッセージ取得用）
- `receiverId` にインデックス（受信メッセージ取得用）
- `createdAt` にインデックス（時系列ソート用）

**制約**
- `content` は1文字以上2000文字以内
- `senderId` と `receiverId` は異なる必要がある（バリデーションはアプリケーション層で実装）
- `applicationId` のステータスが `approved` の場合のみメッセージ送信可能（バリデーションはアプリケーション層で実装）

### 5. tags テーブル

タグマスタ（募集の分類用）。

```typescript
{
  id: string (PK) // UUID
  name: string (UNIQUE, NOT NULL) // タグ名（最大50文字）
  color: string | null // タグの表示色（HEXカラーコード、例: '#FF5733'）
  createdAt: timestamp (NOT NULL, DEFAULT NOW)
}
```

**インデックス**
- `name` にUNIQUEインデックス

**制約**
- `name` は1文字以上50文字以内
- 初期データとして以下のタグを用意:
  - 「高齢者支援」
  - 「環境美化」
  - 「イベント運営」
  - 「子育て支援」
  - 「災害支援」
  - 「その他」

### 6. post_tags テーブル

投稿とタグの多対多リレーション。

```typescript
{
  id: string (PK) // UUID
  postId: string (FK -> posts.id, NOT NULL) // 投稿ID
  tagId: string (FK -> tags.id, NOT NULL) // タグID
  createdAt: timestamp (NOT NULL, DEFAULT NOW)
}
```

**インデックス**
- `postId` にインデックス（投稿のタグ一覧取得用）
- `tagId` にインデックス（タグの投稿一覧取得用）
- `(postId, tagId)` にUNIQUE複合インデックス（同じタグの重複を防止）

**制約**
- 同じ `postId` と `tagId` の組み合わせは1つのみ（UNIQUE制約）

## リレーション図

```
users (1) ──< (N) posts
  │                    │
  │                    │
  │                    └──< (N) post_tags >── (N) tags
  │
  ├──< (N) applications >── (N) posts
  │
  └──< (N) messages (sender)
       └──> (N) messages (receiver)
            │
            └── (N) applications
```

## Drizzle ORMスキーマ定義例

```typescript
// lib/db/schema.ts の構造（参考）

import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  clerkId: text('clerk_id').notNull().unique(),
  name: text('name').notNull(),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  clerkIdIdx: index('clerk_id_idx').on(table.clerkId),
}));

// ... 他のテーブル定義も同様に
```

## データ整合性ルール

### 1. ユーザー削除時の動作
- ユーザーが削除された場合（Clerk側で削除）:
  - `users` テーブルのレコードは論理削除（`deletedAt` カラムを追加、Phase 2で実装）
  - または、投稿・応募・メッセージは保持し、ユーザー名を「退会ユーザー」と表示

### 2. 募集削除時の動作
- 募集が削除された場合:
  - `status` を `'cancelled'` に変更（物理削除はしない）
  - 関連する `applications` は保持（履歴として）
  - 関連する `messages` は保持（チャット履歴として）

### 3. 応募承認時の動作
- 応募が承認された場合:
  - `applications.status` を `'approved'` に更新
  - `posts.currentParticipants` をインクリメント
  - `currentParticipants` が `maxParticipants` に達した場合、`posts.status` を `'closed'` に更新

### 4. 応募キャンセル時の動作
- 応募がキャンセルされた場合（承認前のみ可能）:
  - `applications.status` を `'cancelled'` に更新
  - 承認済みの場合はキャンセル不可

## パフォーマンス考慮事項

1. **インデックス戦略**
   - 頻繁に検索されるカラム（`authorId`, `activityDate`, `status`）にインデックスを設定
   - 複合クエリ（`postId` + `applicantId`）には複合インデックスを設定

2. **クエリ最適化**
   - 一覧取得時は必要なカラムのみ選択（SELECT * を避ける）
   - JOINは必要最小限に
   - 無限スクロールでは `LIMIT` と `OFFSET` を使用（将来的にカーソルベースのページネーションに移行を検討）

3. **データ量の見積もり**
   - 初期ユーザー数: 100人
   - 月間投稿数: 20件
   - 1投稿あたりの応募数: 平均3件
   - 1マッチングあたりのメッセージ数: 平均10件
   - 1年後の想定データ量: 約1,000件の投稿、3,000件の応募、30,000件のメッセージ
