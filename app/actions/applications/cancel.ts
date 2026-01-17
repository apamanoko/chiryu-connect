'use server';

import { ensureAuthenticated } from '@/lib/actions/auth';
import { getUserByClerkId } from '@/lib/db/queries/users';
import { getPostById, updatePost } from '@/lib/db/queries/posts';
import { getApplicationById, cancelApplication } from '@/lib/db/queries/applications';
import { revalidatePath } from 'next/cache';
import type { Application } from '@/lib/types/application';
import { ForbiddenError, NotFoundError } from '@/lib/utils/errors';

/**
 * 応募キャンセルServer Action
 * 承認済みチェック（承認済みはキャンセル不可）を実装
 */
export async function cancelApplicationAction(
  applicationId: string
): Promise<{ success: true; data: Application } | { success: false; error: string }> {
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

    // 認可チェック：応募者本人または募集者のみキャンセル可能
    const isApplicant = application.applicant.id === user.id;
    const isPostAuthor = application.post.authorId === user.id;

    if (!isApplicant && !isPostAuthor) {
      return {
        success: false,
        error: 'この応募をキャンセルする権限がありません',
      };
    }

    // 承認済みチェック：承認済みはキャンセル不可（応募者の場合）
    if (isApplicant && application.status === 'approved') {
      return {
        success: false,
        error: '承認済みの応募はキャンセルできません',
      };
    }

    // 既にキャンセル済みの場合はスキップ
    if (application.status === 'cancelled') {
      return {
        success: false,
        error: '既にキャンセル済みです',
      };
    }

    // 承認済みの応募をキャンセルする場合（募集者の場合）、現在の応募者数を減らす
    if (application.status === 'approved') {
      const post = await getPostById(application.postId);
      if (post) {
        const newCurrentParticipants = Math.max(0, post.currentParticipants - 1);
        await updatePost(post.id, {
          currentParticipants: newCurrentParticipants,
        });

        // 満員から空きが出た場合は募集ステータスを'active'に戻す
        if (post.status === 'closed' && newCurrentParticipants < post.maxParticipants) {
          await updatePost(post.id, {
            status: 'active',
          });
        }
      }
    }

    // 応募をキャンセル
    const cancelledApplication = await cancelApplication(applicationId);

    // キャッシュを再検証
    revalidatePath(`/posts/${application.postId}`);
    revalidatePath('/');

    return {
      success: true,
      data: cancelledApplication,
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
      error: '応募のキャンセルに失敗しました',
    };
  }
}
