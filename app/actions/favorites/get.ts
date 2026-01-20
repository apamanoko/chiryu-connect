'use server';

import { ensureAuthenticated } from '@/lib/actions/auth';
import { getUserByClerkId } from '@/lib/db/queries/users';
import { getFavoritesByUserId } from '@/lib/db/queries/favorites';
import type { PostWithAuthor } from '@/lib/types/post';
import { PAGINATION } from '@/lib/utils/constants';

/**
 * お気に入り一覧を取得するServer Action
 */
export async function getFavoritesAction(
  limit: number = PAGINATION.DEFAULT_LIMIT,
  offset: number = 0
): Promise<
  | { success: true; data: PostWithAuthor[] }
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

    // お気に入り一覧を取得
    const favorites = await getFavoritesByUserId(user.id, limit, offset);

    return {
      success: true,
      data: favorites,
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
      error: 'お気に入り一覧の取得に失敗しました',
    };
  }
}
