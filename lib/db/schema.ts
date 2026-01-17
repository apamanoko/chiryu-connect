import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ============================================
// Users テーブル
// ============================================
export const users = sqliteTable(
  'users',
  {
    id: text('id').primaryKey(), // ClerkのユーザーID
    clerkId: text('clerk_id').notNull(), // ClerkのユーザーID（重複チェック用）
    name: text('name').notNull(), // 表示名（1-50文字）
    bio: text('bio'), // 自己紹介（最大500文字、null可）
    avatarUrl: text('avatar_url'), // プロフィール画像URL
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    clerkIdIdx: uniqueIndex('clerk_id_idx').on(table.clerkId),
  })
);

// ============================================
// Tags テーブル
// ============================================
export const tags = sqliteTable(
  'tags',
  {
    id: text('id').primaryKey(), // UUID
    name: text('name').notNull(), // タグ名（1-50文字）
    color: text('color'), // タグの表示色（HEXカラーコード、例: '#FF5733'）
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    nameIdx: uniqueIndex('tag_name_idx').on(table.name),
  })
);

// ============================================
// Posts テーブル
// ============================================
export const posts = sqliteTable(
  'posts',
  {
    id: text('id').primaryKey(), // UUID
    authorId: text('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }), // 投稿者ID
    title: text('title').notNull(), // 募集タイトル（1-100文字）
    description: text('description').notNull(), // 詳細説明（マークダウン、1-5000文字）
    activityDate: integer('activity_date', { mode: 'timestamp' }).notNull(), // 活動日時（開始時刻）
    activityEndDate: integer('activity_end_date', { mode: 'timestamp' }), // 活動終了日時（nullの場合は1日のみ）
    location: text('location').notNull(), // 活動場所（最大200文字）
    maxParticipants: integer('max_participants').notNull().default(1), // 募集人数（1-100）
    currentParticipants: integer('current_participants').notNull().default(0), // 現在の応募者数（承認済み）
    requiredSkills: text('required_skills'), // 必要なスキル・経験（最大500文字）
    rewardAmount: integer('reward_amount'), // 謝礼金額（円、nullの場合は謝礼なし）
    rewardDescription: text('reward_description'), // 謝礼の説明（最大200文字）
    status: text('status', { mode: 'text' })
      .notNull()
      .default('active'), // 'active' | 'closed' | 'cancelled'
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    authorIdIdx: index('post_author_id_idx').on(table.authorId),
    activityDateIdx: index('post_activity_date_idx').on(table.activityDate),
    statusIdx: index('post_status_idx').on(table.status),
    createdAtIdx: index('post_created_at_idx').on(table.createdAt),
  })
);

// ============================================
// Post Tags テーブル（多対多リレーション）
// ============================================
export const postTags = sqliteTable(
  'post_tags',
  {
    id: text('id').primaryKey(), // UUID
    postId: text('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    tagId: text('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    postIdIdx: index('post_tag_post_id_idx').on(table.postId),
    tagIdIdx: index('post_tag_tag_id_idx').on(table.tagId),
    postTagUniqueIdx: uniqueIndex('post_tag_unique_idx').on(
      table.postId,
      table.tagId
    ),
  })
);

// ============================================
// Applications テーブル
// ============================================
export const applications = sqliteTable(
  'applications',
  {
    id: text('id').primaryKey(), // UUID
    postId: text('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    applicantId: text('applicant_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    status: text('status', { mode: 'text' })
      .notNull()
      .default('pending'), // 'pending' | 'approved' | 'rejected' | 'cancelled'
    message: text('message'), // 応募メッセージ（最大500文字、任意）
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    postIdIdx: index('application_post_id_idx').on(table.postId),
    applicantIdIdx: index('application_applicant_id_idx').on(table.applicantId),
    postApplicantUniqueIdx: uniqueIndex('post_applicant_unique_idx').on(
      table.postId,
      table.applicantId
    ),
  })
);

// ============================================
// Messages テーブル
// ============================================
export const messages = sqliteTable(
  'messages',
  {
    id: text('id').primaryKey(), // UUID
    applicationId: text('application_id')
      .notNull()
      .references(() => applications.id, { onDelete: 'cascade' }),
    senderId: text('sender_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    receiverId: text('receiver_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    content: text('content').notNull(), // メッセージ内容（1-2000文字）
    isRead: integer('is_read', { mode: 'boolean' }).notNull().default(false), // 既読フラグ（Phase 2で使用）
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    applicationIdIdx: index('message_application_id_idx').on(table.applicationId),
    senderIdIdx: index('message_sender_id_idx').on(table.senderId),
    receiverIdIdx: index('message_receiver_id_idx').on(table.receiverId),
    createdAtIdx: index('message_created_at_idx').on(table.createdAt),
  })
);

// ============================================
// 型定義のエクスポート
// ============================================
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

export type PostTag = typeof postTags.$inferSelect;
export type NewPostTag = typeof postTags.$inferInsert;

export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

// ============================================
// Enum型定義
// ============================================
export const PostStatus = {
  ACTIVE: 'active',
  CLOSED: 'closed',
  CANCELLED: 'cancelled',
} as const;

export type PostStatusType = (typeof PostStatus)[keyof typeof PostStatus];

export const ApplicationStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
} as const;

export type ApplicationStatusType =
  (typeof ApplicationStatus)[keyof typeof ApplicationStatus];
