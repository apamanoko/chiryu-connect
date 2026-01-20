'use server';

import { ensureAuthenticated } from '@/lib/actions/auth';
import { getUserByClerkId } from '@/lib/db/queries/users';
import { getApplicationById } from '@/lib/db/queries/applications';
import { createMessage } from '@/lib/db/queries/messages';
import { validateMessageContent } from '@/lib/utils/validation';
import type { CreateMessageInput } from '@/lib/types/message';
import type { MessageWithUsers } from '@/lib/types/message';
import { ForbiddenError, NotFoundError } from '@/lib/utils/errors';

/**
 * メッセージ送信Server Action
 * マッチングチェック（承認済みのみ送信可能）、送信者・受信者チェックを実装
 */
export async function createMessageAction(
  input: CreateMessageInput
): Promise<{ success: true; data: MessageWithUsers } | { success: false; error: string }> {
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
    const application = await getApplicationById(input.applicationId);
    if (!application) {
      return {
        success: false,
        error: '応募が見つかりません',
      };
    }

    // マッチングチェック：承認済みのみ送信可能
    if (application.status !== 'approved') {
      return {
        success: false,
        error: '承認済みの応募のみメッセージを送信できます',
      };
    }

    // 送信者・受信者チェック：応募に関与しているユーザーのみ送信可能
    const isPostAuthor = application.post.authorId === user.id;
    const isApplicant = application.applicant.id === user.id;

    if (!isPostAuthor && !isApplicant) {
      return {
        success: false,
        error: 'この応募に関与していないため、メッセージを送信できません',
      };
    }

    // 受信者を決定（送信者が募集者の場合は応募者、応募者の場合は募集者）
    const receiverId = isPostAuthor ? application.applicant.id : application.post.author.id;

    // メッセージ内容のバリデーション
    const contentValidation = validateMessageContent(input.content);
    if (!contentValidation.success) {
      return {
        success: false,
        error: contentValidation.error,
      };
    }

    // メッセージを作成
    const createdMessage = await createMessage(
      input.applicationId,
      user.id,
      receiverId,
      contentValidation.data
    );

    return {
      success: true,
      data: createdMessage,
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
      error: 'メッセージの送信に失敗しました',
    };
  }
}
