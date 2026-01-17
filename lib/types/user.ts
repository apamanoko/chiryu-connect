import type { User as DbUser } from '@/lib/db/schema';

/**
 * ユーザー型（データベーススキーマから）
 */
export type User = DbUser;

/**
 * プロフィール情報を含むユーザー型
 */
export type UserWithProfile = User & {
  // 将来的に評価スコアなどを追加する場合に使用
  // rating?: number;
  // reviewCount?: number;
};

/**
 * ユーザープロフィール更新用の入力型
 */
export type UpdateUserProfileInput = {
  name?: string;
  bio?: string | null;
  avatarUrl?: string | null;
};
