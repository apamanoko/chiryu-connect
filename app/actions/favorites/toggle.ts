'use server';

import { ensureAuthenticated } from '@/lib/actions/auth';
import { getUserByClerkId } from '@/lib/db/queries/users';
import { addFavorite, removeFavorite, isFavorite } from '@/lib/db/queries/favorites';
import { getPostById } from '@/lib/db/queries/posts';
import { revalidatePath } from 'next/cache';

/**
 * お気に入りの追加/削除を切り替えるServer Action
 */
export async function toggleFavoriteAction(
  postId: string
): Promise<
  | { success: true; isFavorite: boolean }
  | { success: false; error: string }
> {
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

    // 投稿を取得
    const post = await getPostById(postId);
    if (!post) {
      return {
        success: false,
        error: '投稿が見つかりません',
      };
    }

    // 現在のお気に入り状態を確認
    const currentlyFavorite = await isFavorite(user.id, postId);

    if (currentlyFavorite) {
      // お気に入りを削除
      await removeFavorite(user.id, postId);
    } else {
      // お気に入りを追加
      await addFavorite(user.id, postId);
    }

    // キャッシュを再検証
    revalidatePath(`/posts/${postId}`);
    revalidatePath('/profile');

    return {
      success: true,
      isFavorite: !currentlyFavorite,
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
      error: 'お気に入りの更新に失敗しました',
    };
  }
}
