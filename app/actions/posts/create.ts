'use server';

import { ensureAuthenticated } from '@/lib/actions/auth';
import { getUserByClerkId } from '@/lib/db/queries/users';
import { createPost } from '@/lib/db/queries/posts';
import {
  validatePostTitle,
  validatePostDescription,
  validatePostLocation,
  validateMaxParticipants,
  validateRewardAmount,
  validateFutureDate,
  validateDateRange,
} from '@/lib/utils/validation';
import { validateLength } from '@/lib/utils/validation';
import { MAX_LENGTH } from '@/lib/utils/constants';
import { revalidatePath } from 'next/cache';
import type { CreatePostInput } from '@/lib/types/post';
import type { PostWithAuthorAndTags } from '@/lib/types/post';
import { NotFoundError, ValidationError } from '@/lib/utils/errors';

/**
 * 投稿作成Server Action
 */
export async function createPostAction(
  input: CreatePostInput
): Promise<{ success: true; data: PostWithAuthorAndTags } | { success: false; error: string }> {
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

    // バリデーション
    const titleValidation = validatePostTitle(input.title);
    if (!titleValidation.success) {
      return {
        success: false,
        error: titleValidation.error,
      };
    }

    const descriptionValidation = validatePostDescription(input.description);
    if (!descriptionValidation.success) {
      return {
        success: false,
        error: descriptionValidation.error,
      };
    }

    const locationValidation = validatePostLocation(input.location);
    if (!locationValidation.success) {
      return {
        success: false,
        error: locationValidation.error,
      };
    }

    const maxParticipantsValidation = validateMaxParticipants(input.maxParticipants);
    if (!maxParticipantsValidation.success) {
      return {
        success: false,
        error: maxParticipantsValidation.error,
      };
    }

    // 活動日時が未来であることを確認
    const activityDateValidation = validateFutureDate(input.activityDate, '活動日時');
    if (!activityDateValidation.success) {
      return {
        success: false,
        error: activityDateValidation.error,
      };
    }

    // 活動終了日時のバリデーション
    const activityEndDateValidation = validateDateRange(
      input.activityDate,
      input.activityEndDate ?? null,
      '活動終了日時'
    );
    if (!activityEndDateValidation.success) {
      return {
        success: false,
        error: activityEndDateValidation.error,
      };
    }

    // 必要なスキルのバリデーション
    if (input.requiredSkills !== undefined && input.requiredSkills !== null) {
      const requiredSkillsValidation = validateLength(
        input.requiredSkills,
        0,
        MAX_LENGTH.POST_REQUIRED_SKILLS,
        '必要なスキル'
      );
      if (!requiredSkillsValidation.success) {
        return {
          success: false,
          error: requiredSkillsValidation.error,
        };
      }
    }

    // 謝礼金額のバリデーション
    const rewardAmountValidation = validateRewardAmount(input.rewardAmount);
    if (!rewardAmountValidation.success) {
      return {
        success: false,
        error: rewardAmountValidation.error,
      };
    }

    // 謝礼説明のバリデーション
    if (input.rewardDescription !== undefined && input.rewardDescription !== null) {
      const rewardDescriptionValidation = validateLength(
        input.rewardDescription,
        0,
        MAX_LENGTH.POST_REWARD_DESCRIPTION,
        '謝礼説明'
      );
      if (!rewardDescriptionValidation.success) {
        return {
          success: false,
          error: rewardDescriptionValidation.error,
        };
      }
    }

    // 投稿を作成
    const createdPost = await createPost(user.id, {
      title: titleValidation.data,
      description: descriptionValidation.data,
      activityDate: activityDateValidation.data,
      activityEndDate: activityEndDateValidation.data,
      location: locationValidation.data,
      maxParticipants: maxParticipantsValidation.data,
      requiredSkills: input.requiredSkills ?? null,
      rewardAmount: rewardAmountValidation.data,
      rewardDescription: input.rewardDescription ?? null,
      tagIds: input.tagIds || [],
    });

    // キャッシュを再検証
    revalidatePath('/');
    revalidatePath(`/posts/${createdPost.id}`);

    return {
      success: true,
      data: createdPost,
    };
  } catch (error) {
    if (error instanceof ValidationError) {
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
      error: '投稿の作成に失敗しました',
    };
  }
}
