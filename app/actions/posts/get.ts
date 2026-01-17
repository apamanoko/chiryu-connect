'use server';

import { getPostById, getPosts, getPostsByAuthorId } from '@/lib/db/queries/posts';
import type { PostWithAuthor, PostWithAuthorAndTags } from '@/lib/types/post';
import { PAGINATION } from '@/lib/utils/constants';

/**
 * 投稿取得Server Action（ID指定）
 */
export async function getPostAction(
  postId: string
): Promise<{ success: true; data: PostWithAuthorAndTags } | { success: false; error: string }> {
  try {
    const post = await getPostById(postId);
    if (!post) {
      return {
        success: false,
        error: '投稿が見つかりません',
      };
    }

    return {
      success: true,
      data: post,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: '投稿の取得に失敗しました',
    };
  }
}

/**
 * 投稿一覧取得Server Action
 */
export async function getPostsAction(
  limit: number = PAGINATION.DEFAULT_LIMIT,
  offset: number = 0,
  status: 'active' | 'closed' | 'cancelled' | 'all' = 'active'
): Promise<{ success: true; data: PostWithAuthor[] } | { success: false; error: string }> {
  try {
    const posts = await getPosts(limit, offset, status);
    return {
      success: true,
      data: posts,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: '投稿一覧の取得に失敗しました',
    };
  }
}

/**
 * 投稿者の投稿一覧取得Server Action
 */
export async function getPostsByAuthorIdAction(
  authorId: string,
  limit: number = PAGINATION.DEFAULT_LIMIT,
  offset: number = 0
): Promise<{ success: true; data: PostWithAuthor[] } | { success: false; error: string }> {
  try {
    const posts = await getPostsByAuthorId(authorId, limit, offset);
    return {
      success: true,
      data: posts,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: '投稿一覧の取得に失敗しました',
    };
  }
}
