'use server';

import { ensureAuthenticated } from '@/lib/actions/auth';
import { getUserByClerkId } from '@/lib/db/queries/users';
import { getMessagesByApplicationId, getChatRoomsByUserId } from '@/lib/db/queries/messages';
import { getApplicationById } from '@/lib/db/queries/applications';
import type { MessageWithUsers } from '@/lib/types/message';
import { ForbiddenError } from '@/lib/utils/errors';
import { PAGINATION } from '@/lib/utils/constants';

/**
 * メッセージ取得Server Action
 */
export async function getMessagesAction(
  applicationId: string,
  limit: number = PAGINATION.DEFAULT_LIMIT,
  offset: number = 0
): Promise<{ success: true; data: MessageWithUsers[] } | { success: false; error: string }> {
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

    // 応募を取得して認可チェック
    const application = await getApplicationById(applicationId);
    if (!application) {
      return {
        success: false,
        error: '応募が見つかりません',
      };
    }

    // 認可チェック：応募に関与しているユーザーのみ取得可能
    const isPostAuthor = application.post.authorId === user.id;
    const isApplicant = application.applicant.id === user.id;

    if (!isPostAuthor && !isApplicant) {
      return {
        success: false,
        error: 'この応募に関与していないため、メッセージを取得できません',
      };
    }

    // メッセージを取得
    const messages = await getMessagesByApplicationId(applicationId, limit, offset);

    return {
      success: true,
      data: messages,
    };
  } catch (error) {
    if (error instanceof ForbiddenError) {
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
      error: 'メッセージの取得に失敗しました',
    };
  }
}

/**
 * チャットルーム一覧取得Server Action
 */
export async function getChatRoomsAction(): Promise<
  | {
      success: true;
      data: Array<{
        application: {
          id: string;
          post: {
            id: string;
            title: string;
            author: { id: string; name: string; avatarUrl: string | null };
          };
          applicant: { id: string; name: string; avatarUrl: string | null };
        };
        latestMessage: MessageWithUsers | null;
        unreadCount: number;
      }>;
    }
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

    // チャットルーム一覧を取得
    const chatRooms = await getChatRoomsByUserId(user.id);

    return {
      success: true,
      data: chatRooms,
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
      error: 'チャットルーム一覧の取得に失敗しました',
    };
  }
}
