import { db } from '../index';
import { favorites, posts, users } from '../schema';
import { eq, and, desc, inArray } from 'drizzle-orm';
import type { Favorite, NewFavorite } from '../schema';
import type { PostWithAuthor } from '@/lib/types/post';
import { PAGINATION } from '@/lib/utils/constants';

/**
 * ユーザーのお気に入り一覧を取得
 */
export async function getFavoritesByUserId(
  userId: string,
  limit: number = PAGINATION.DEFAULT_LIMIT,
  offset: number = 0
): Promise<PostWithAuthor[]> {
  const limitValue = Math.min(limit, PAGINATION.MAX_LIMIT);

  // お気に入りと投稿を結合して取得
  const favoritesResult = await db
    .select({
      post: posts,
      author: users,
    })
    .from(favorites)
    .innerJoin(posts, eq(favorites.postId, posts.id))
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(eq(favorites.userId, userId))
    .orderBy(desc(favorites.createdAt))
    .limit(limitValue)
    .offset(offset);

  return favoritesResult.map((row) => ({
    ...row.post,
    author: row.author,
  }));
}

/**
 * お気に入りを追加
 */
export async function addFavorite(userId: string, postId: string): Promise<Favorite> {
  const newFavorite: NewFavorite = {
    id: crypto.randomUUID(),
    userId,
    postId,
    createdAt: new Date(),
  };

  const result = await db.insert(favorites).values(newFavorite).returning();
  return result[0];
}

/**
 * お気に入りを削除
 */
export async function removeFavorite(userId: string, postId: string): Promise<boolean> {
  const result = await db
    .delete(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.postId, postId)))
    .returning();

  return result.length > 0;
}

/**
 * お気に入りかどうかをチェック
 */
export async function isFavorite(userId: string, postId: string): Promise<boolean> {
  const result = await db
    .select()
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.postId, postId)))
    .limit(1);

  return result.length > 0;
}

/**
 * 複数の投稿がお気に入りかどうかをチェック
 */
export async function getFavoriteStatuses(
  userId: string,
  postIds: string[]
): Promise<Map<string, boolean>> {
  if (postIds.length === 0) {
    return new Map();
  }

  const result = await db
    .select()
    .from(favorites)
    .where(and(eq(favorites.userId, userId), inArray(favorites.postId, postIds)));

  const favoriteMap = new Map<string, boolean>();
  postIds.forEach((postId) => {
    favoriteMap.set(postId, false);
  });
  result.forEach((fav) => {
    favoriteMap.set(fav.postId, true);
  });

  return favoriteMap;
}
