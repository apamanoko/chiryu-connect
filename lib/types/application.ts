import type { Application as DbApplication, Post, User } from '@/lib/db/schema';
import type { ApplicationStatusType } from '@/lib/db/schema';
import type { PostWithAuthor } from '@/lib/types/post';

/**
 * 応募型（データベーススキーマから）
 */
export type Application = DbApplication;

/**
 * 応募情報と投稿情報を含む型
 */
export type ApplicationWithPost = Application & {
  post: Post;
};

/**
 * 応募情報と応募者情報を含む型
 */
export type ApplicationWithApplicant = Application & {
  applicant: User;
};

/**
 * 応募情報、投稿情報（投稿者情報含む）、応募者情報を含む型
 */
export type ApplicationWithPostAndApplicant = Application & {
  post: PostWithAuthor;
  applicant: User;
};

/**
 * 応募作成用の入力型
 */
export type CreateApplicationInput = {
  postId: string;
  message?: string | null;
};

/**
 * 応募ステータス更新用の入力型
 */
export type UpdateApplicationStatusInput = {
  status: ApplicationStatusType;
};
