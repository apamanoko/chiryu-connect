'use server';

import { ensureAuthenticated } from '@/lib/actions/auth';
import { getUserByClerkId } from '@/lib/db/queries/users';
import { getChatRoomsWithUnreadMessages } from '@/lib/db/queries/todos';

/**
 * 未読メッセージ数を取得するServer Action
 */
export async function getUnreadMessageCountAction(): Promise<
  | { success: true; count: number }
  | { success: false; error: string }
> {
  try {
    const clerkUserId = await ensureAuthenticated();

    const user = await getUserByClerkId(clerkUserId);
    if (!user) {
      return {
        success: false,
        error: 'ユーザーが見つかりません',
      };
    }

    const chatRooms = await getChatRoomsWithUnreadMessages(user.id);
    const count = chatRooms.reduce((sum, room) => sum + room.unreadCount, 0);

    return {
      success: true,
      count,
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
      error: '未読メッセージ数の取得に失敗しました',
    };
  }
}