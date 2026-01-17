'use server';

import { ensureAuthenticated } from '@/lib/actions/auth';
import { getUserByClerkId } from '@/lib/db/queries/users';
import { getPostById } from '@/lib/db/queries/posts';
import {
  getApplicationByPostAndApplicant,
  createApplication,
} from '@/lib/db/queries/applications';
import { validateApplicationMessage } from '@/lib/utils/validation';
import { revalidatePath } from 'next/cache';
import type { CreateApplicationInput } from '@/lib/types/application';
import type { ApplicationWithPostAndApplicant } from '@/lib/types/application';
import { ConflictError, ForbiddenError, NotFoundError } from '@/lib/utils/errors';

/**
 * 応募作成Server Action
 * 重複応募チェック、募集者本人チェックを実装
 */
export async function createApplicationAction(
  input: CreateApplicationInput
): Promise<
  | { success: true; data: ApplicationWithPostAndApplicant }
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
    const post = await getPostById(input.postId);
    if (!post) {
      return {
        success: false,
        error: '投稿が見つかりません',
      };
    }

    // 募集者本人チェック：募集者本人は応募できない
    if (post.authorId === user.id) {
      return {
        success: false,
        error: '自分が投稿した募集には応募できません',
      };
    }

    // 募集ステータスチェック：activeな募集のみ応募可能
    if (post.status !== 'active') {
      return {
        success: false,
        error: 'この募集は応募を受け付けていません',
      };
    }

    // 募集人数チェック：満員の場合は応募不可
    if (post.currentParticipants >= post.maxParticipants) {
      return {
        success: false,
        error: 'この募集は満員です',
      };
    }

    // 重複応募チェック
    const existingApplication = await getApplicationByPostAndApplicant(
      input.postId,
      user.id
    );

    if (existingApplication) {
      // 既に応募済みの場合、ステータスを確認
      if (existingApplication.status === 'pending' || existingApplication.status === 'approved') {
        return {
          success: false,
          error: '既に応募済みです',
        };
      }
      // cancelledまたはrejectedの場合は再応募可能（新規作成）
    }

    // 応募メッセージのバリデーション
    const messageValidation = validateApplicationMessage(input.message);
    if (!messageValidation.success) {
      return {
        success: false,
        error: messageValidation.error,
      };
    }

    // 応募を作成
    const createdApplication = await createApplication(
      user.id,
      input.postId,
      messageValidation.data
    );

    // キャッシュを再検証
    revalidatePath(`/posts/${input.postId}`);
    revalidatePath('/');

    return {
      success: true,
      data: createdApplication,
    };
  } catch (error) {
    if (error instanceof ConflictError || error instanceof ForbiddenError || error instanceof NotFoundError) {
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
      error: '応募の作成に失敗しました',
    };
  }
}
