import { auth, currentUser } from '@clerk/nextjs/server';
import { getUserByClerkId, createUser, updateUser } from '@/lib/db/queries/users';
import type { User } from '@/lib/types/user';
import { UnauthorizedError, NotFoundError } from '@/lib/utils/errors';
import { validateUserName, validateUserBio } from '@/lib/utils/validation';

/**
 * 現在のユーザーを取得（Server Components用）
 * Clerkの認証情報からusersテーブルのユーザー情報を取得
 */
export async function getCurrentUser(): Promise<User | null> {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  const user = await getUserByClerkId(userId);
  return user;
}

/**
 * 認証チェックヘルパー
 * 認証されていない場合はエラーを投げる
 */
export async function ensureAuthenticated(): Promise<string> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new UnauthorizedError('認証が必要です');
  }

  return userId;
}

/**
 * ユーザーを作成または更新（Clerk連携）
 * Clerkのユーザー情報を元にusersテーブルにユーザーを作成または更新
 */
export async function createOrUpdateUser(clerkUserId: string): Promise<User> {
  // Clerkからユーザー情報を取得
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    throw new NotFoundError('Clerkユーザーが見つかりません');
  }

  // 既存のユーザーを確認
  const existingUser = await getUserByClerkId(clerkUserId);

  // ユーザー名のバリデーション
  const name = clerkUser.firstName && clerkUser.lastName
    ? `${clerkUser.firstName} ${clerkUser.lastName}`
    : clerkUser.firstName || clerkUser.lastName || clerkUser.username || 'ユーザー';
  
  const nameValidation = validateUserName(name);
  if (!nameValidation.success) {
    throw new Error(nameValidation.error);
  }

  if (existingUser) {
    // 既存ユーザーの更新
    const updateData: {
      name?: string;
      avatarUrl?: string | null;
    } = {
      name: nameValidation.data,
    };

    // アバターURLを更新（Clerkから取得）
    if (clerkUser.imageUrl) {
      updateData.avatarUrl = clerkUser.imageUrl;
    }

    return await updateUser(existingUser.id, updateData);
  } else {
    // 新規ユーザーの作成
    return await createUser({
      id: clerkUser.id,
      clerkId: clerkUserId,
      name: nameValidation.data,
      bio: null,
      avatarUrl: clerkUser.imageUrl ?? null,
    });
  }
}
