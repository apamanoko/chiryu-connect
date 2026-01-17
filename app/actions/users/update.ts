'use server';

import { ensureAuthenticated } from '@/lib/actions/auth';
import { getUserByClerkId, updateUser } from '@/lib/db/queries/users';
import { validateUserName, validateUserBio } from '@/lib/utils/validation';
import { revalidatePath } from 'next/cache';
import type { UpdateUserProfileInput } from '@/lib/types/user';
import type { User } from '@/lib/types/user';

/**
 * プロフィール更新Server Action
 */
export async function updateUserProfileAction(
  input: UpdateUserProfileInput
): Promise<{ success: true; data: User } | { success: false; error: string }> {
  try {
    // 認証チェック
    const clerkUserId = await ensureAuthenticated();

    // 既存ユーザーを取得
    const existingUser = await getUserByClerkId(clerkUserId);
    if (!existingUser) {
      return {
        success: false,
        error: 'ユーザーが見つかりません',
      };
    }

    // バリデーション
    const updateData: UpdateUserProfileInput = {};

    if (input.name !== undefined) {
      const nameValidation = validateUserName(input.name);
      if (!nameValidation.success) {
        return {
          success: false,
          error: nameValidation.error,
        };
      }
      updateData.name = nameValidation.data;
    }

    if (input.bio !== undefined) {
      const bioValidation = validateUserBio(input.bio);
      if (!bioValidation.success) {
        return {
          success: false,
          error: bioValidation.error,
        };
      }
      updateData.bio = bioValidation.data;
    }

    if (input.avatarUrl !== undefined) {
      updateData.avatarUrl = input.avatarUrl;
    }

    // ユーザー情報を更新
    const updatedUser = await updateUser(existingUser.id, updateData);

    // キャッシュを再検証
    revalidatePath('/profile');
    revalidatePath(`/profile/${updatedUser.id}`);

    return {
      success: true,
      data: updatedUser,
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
      error: 'プロフィールの更新に失敗しました',
    };
  }
}
