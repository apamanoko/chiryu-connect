import type { Post as DbPost, User, Tag } from '@/lib/db/schema';
import type { PostStatusType } from '@/lib/db/schema';

/**
 * 投稿型（データベーススキーマから）
 */
export type Post = DbPost;

/**
 * 投稿者情報を含む投稿型
 */
export type PostWithAuthor = Post & {
  author: User;
};

/**
 * タグ情報を含む投稿型
 */
export type PostWithTags = Post & {
  tags: Tag[];
};

/**
 * 投稿者とタグ情報を含む投稿型
 */
export type PostWithAuthorAndTags = Post & {
  author: User;
  tags: Tag[];
};

/**
 * 投稿作成用の入力型
 */
export type CreatePostInput = {
  title: string;
  description: string;
  activityDate: Date;
  activityEndDate?: Date | null;
  location: string;
  maxParticipants: number;
  requiredSkills?: string | null;
  rewardAmount?: number | null;
  rewardDescription?: string | null;
  tagIds: string[]; // タグIDの配列
};

/**
 * 投稿更新用の入力型
 */
export type UpdatePostInput = {
  title?: string;
  description?: string;
  activityDate?: Date;
  activityEndDate?: Date | null;
  location?: string;
  maxParticipants?: number;
  currentParticipants?: number;
  requiredSkills?: string | null;
  rewardAmount?: number | null;
  rewardDescription?: string | null;
  status?: PostStatusType;
  tagIds?: string[];
};
