'use server';

import { ensureAuthenticated } from '@/lib/actions/auth';
import { getUserByClerkId } from '@/lib/db/queries/users';
import { getPostById, deletePost } from '@/lib/db/queries/posts';
import { revalidatePath } from 'next/cache';
import type { Post } from '@/lib/types/post';
import { ForbiddenError, NotFoundError } from '@/lib/utils/errors';

/**
 * 投稿削除Server Action（論理削除）
 * 認可チェック：投稿者のみ削除可能
 */
export async function deletePostAction(
  postId: string
): Promise<{ success: true; data: Post } | { success: false; error: string }> {
  try {
    // 認証チェック
    const clerkUserId = await ensureAuthenticated();

    // ユーザーを取得
    const user = await getUserByClerkId(clerkUserId);
    if (!user) {
      return {
        success: false,
        error: 'ユーザーが見つかりません',
      };
    }

    // 既存の投稿を取得
    const existingPost = await getPostById(postId);
    if (!existingPost) {
      return {
        success: false,
        error: '投稿が見つかりません',
      };
    }

    // 認可チェック：投稿者のみ削除可能
    if (existingPost.authorId !== user.id) {
      return {
        success: false,
        error: 'この投稿を削除する権限がありません',
      };
    }

    // 投稿を削除（論理削除：statusを'cancelled'に変更）
    const deletedPost = await deletePost(postId);

    // キャッシュを再検証
    revalidatePath('/');
    revalidatePath(`/posts/${postId}`);

    return {
      success: true,
      data: deletedPost,
    };
  } catch (error) {
    if (error instanceof ForbiddenError || error instanceof NotFoundError) {
      return {
        success: false,
        error: error.message,
      };
    }
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: '投稿の削除に失敗しました',
    };
  }
}
