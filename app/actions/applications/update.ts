'use server';

import { ensureAuthenticated } from '@/lib/actions/auth';
import { getUserByClerkId } from '@/lib/db/queries/users';
import { getPostById, updatePost } from '@/lib/db/queries/posts';
import {
  getApplicationById,
  updateApplicationStatus,
  getApplicationsByPostId,
} from '@/lib/db/queries/applications';
import { revalidatePath } from 'next/cache';
import type { UpdateApplicationStatusInput } from '@/lib/types/application';
import type { ApplicationWithPostAndApplicant } from '@/lib/types/application';
import { ForbiddenError, NotFoundError } from '@/lib/utils/errors';

/**
 * 応募ステータス更新Server Action（承認/却下）
 * 募集人数チェック、募集ステータス更新（満員時）を実装
 */
export async function updateApplicationStatusAction(
  applicationId: string,
  input: UpdateApplicationStatusInput
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

    // 応募を取得
    const application = await getApplicationById(applicationId);
    if (!application) {
      return {
        success: false,
        error: '応募が見つかりません',
      };
    }

    // 認可チェック：募集者のみ更新可能
    if (application.post.authorId !== user.id) {
      return {
        success: false,
        error: 'この応募を更新する権限がありません',
      };
    }

    // 投稿を取得（最新の状態を確認）
    const post = await getPostById(application.postId);
    if (!post) {
      return {
        success: false,
        error: '投稿が見つかりません',
      };
    }

    // 承認の場合、募集人数チェック
    if (input.status === 'approved') {
      // 既に承認済みの場合はスキップ
      if (application.status === 'approved') {
        return {
          success: false,
          error: '既に承認済みです',
        };
      }

      // 満員チェック
      if (post.currentParticipants >= post.maxParticipants) {
        return {
          success: false,
          error: '募集人数が満員のため承認できません',
        };
      }

      // 応募ステータスを更新
      const updatedApplication = await updateApplicationStatus(applicationId, 'approved');

      // 投稿の現在の応募者数を更新（承認済み応募者の数を再計算）
      const allApplications = await getApplicationsByPostId(post.id, 1000, 0);
      const approvedCount = allApplications.filter((app) => app.status === 'approved').length;
      
      await updatePost(post.id, {
        currentParticipants: approvedCount,
      });

      // 満員になった場合は募集ステータスを'closed'に更新
      if (approvedCount >= post.maxParticipants) {
        await updatePost(post.id, {
          status: 'closed',
        });
      }

      // キャッシュを再検証
      revalidatePath(`/posts/${post.id}`);
      revalidatePath('/');

      return {
        success: true,
        data: updatedApplication,
      };
    }

    // 却下の場合
    if (input.status === 'rejected') {
      // 既に却下済みの場合はスキップ
      if (application.status === 'rejected') {
        return {
          success: false,
          error: '既に却下済みです',
        };
      }

      // 承認済みの場合は却下できない（キャンセルする必要がある）
      if (application.status === 'approved') {
        return {
          success: false,
          error: '承認済みの応募は却下できません。キャンセルしてください',
        };
      }

      // 応募ステータスを更新
      const updatedApplication = await updateApplicationStatus(applicationId, 'rejected');

      // キャッシュを再検証
      revalidatePath(`/posts/${post.id}`);
      revalidatePath('/');

      return {
        success: true,
        data: updatedApplication,
      };
    }

    return {
      success: false,
      error: '無効なステータスです',
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
      error: '応募ステータスの更新に失敗しました',
    };
  }
}
