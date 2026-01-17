'use server';

import { ensureAuthenticated } from '@/lib/actions/auth';
import { getUserByClerkId } from '@/lib/db/queries/users';
import { getPostById, updatePost } from '@/lib/db/queries/posts';
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
import type { UpdatePostInput } from '@/lib/types/post';
import type { PostWithAuthorAndTags } from '@/lib/types/post';
import { ForbiddenError, NotFoundError } from '@/lib/utils/errors';

/**
 * 投稿更新Server Action
 * 認可チェック：投稿者のみ更新可能
 */
export async function updatePostAction(
  postId: string,
  input: UpdatePostInput
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

    // 既存の投稿を取得
    const existingPost = await getPostById(postId);
    if (!existingPost) {
      return {
        success: false,
        error: '投稿が見つかりません',
      };
    }

    // 認可チェック：投稿者のみ更新可能
    if (existingPost.authorId !== user.id) {
      return {
        success: false,
        error: 'この投稿を更新する権限がありません',
      };
    }

    // バリデーション（値が指定されている場合のみ）
    const updateData: UpdatePostInput = {};

    if (input.title !== undefined) {
      const titleValidation = validatePostTitle(input.title);
      if (!titleValidation.success) {
        return {
          success: false,
          error: titleValidation.error,
        };
      }
      updateData.title = titleValidation.data;
    }

    if (input.description !== undefined) {
      const descriptionValidation = validatePostDescription(input.description);
      if (!descriptionValidation.success) {
        return {
          success: false,
          error: descriptionValidation.error,
        };
      }
      updateData.description = descriptionValidation.data;
    }

    if (input.location !== undefined) {
      const locationValidation = validatePostLocation(input.location);
      if (!locationValidation.success) {
        return {
          success: false,
          error: locationValidation.error,
        };
      }
      updateData.location = locationValidation.data;
    }

    if (input.maxParticipants !== undefined) {
      const maxParticipantsValidation = validateMaxParticipants(input.maxParticipants);
      if (!maxParticipantsValidation.success) {
        return {
          success: false,
          error: maxParticipantsValidation.error,
        };
      }
      updateData.maxParticipants = maxParticipantsValidation.data;
    }

    if (input.activityDate !== undefined) {
      const activityDateValidation = validateFutureDate(input.activityDate, '活動日時');
      if (!activityDateValidation.success) {
        return {
          success: false,
          error: activityDateValidation.error,
        };
      }
      updateData.activityDate = activityDateValidation.data;

      // 活動終了日時も更新する場合は、開始日時との整合性を確認
      if (input.activityEndDate !== undefined) {
        const activityEndDateValidation = validateDateRange(
          activityDateValidation.data,
          input.activityEndDate ?? null,
          '活動終了日時'
        );
        if (!activityEndDateValidation.success) {
          return {
            success: false,
            error: activityEndDateValidation.error,
          };
        }
        updateData.activityEndDate = activityEndDateValidation.data;
      }
    } else if (input.activityEndDate !== undefined) {
      // 活動日時が更新されない場合、既存の活動日時を使用
      const activityEndDateValidation = validateDateRange(
        existingPost.activityDate,
        input.activityEndDate ?? null,
        '活動終了日時'
      );
      if (!activityEndDateValidation.success) {
        return {
          success: false,
          error: activityEndDateValidation.error,
        };
      }
      updateData.activityEndDate = activityEndDateValidation.data;
    }

    if (input.requiredSkills !== undefined) {
      if (input.requiredSkills !== null) {
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
      updateData.requiredSkills = input.requiredSkills;
    }

    if (input.rewardAmount !== undefined) {
      const rewardAmountValidation = validateRewardAmount(input.rewardAmount);
      if (!rewardAmountValidation.success) {
        return {
          success: false,
          error: rewardAmountValidation.error,
        };
      }
      updateData.rewardAmount = rewardAmountValidation.data;
    }

    if (input.rewardDescription !== undefined) {
      if (input.rewardDescription !== null) {
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
      updateData.rewardDescription = input.rewardDescription;
    }

    if (input.status !== undefined) {
      updateData.status = input.status;
    }

    if (input.currentParticipants !== undefined) {
      updateData.currentParticipants = input.currentParticipants;
    }

    if (input.tagIds !== undefined) {
      updateData.tagIds = input.tagIds;
    }

    // 投稿を更新
    const updatedPost = await updatePost(postId, updateData);

    // キャッシュを再検証
    revalidatePath('/');
    revalidatePath(`/posts/${postId}`);

    return {
      success: true,
      data: updatedPost,
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
      error: '投稿の更新に失敗しました',
    };
  }
}
