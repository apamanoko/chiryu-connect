'use server';

import { ensureAuthenticated } from '@/lib/actions/auth';
import { getUserByClerkId } from '@/lib/db/queries/users';
import { markMessageAsRead, markMessagesAsRead } from '@/lib/db/queries/messages';
import { revalidatePath } from 'next/cache';
import type { MessageWithUsers } from '@/lib/types/message';

/**
 * メッセージを既読にするServer Action
 */
export async function markMessageAsReadAction(
  messageId: string
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

    // メッセージを既読にする
    const updatedMessage = await markMessageAsRead(messageId, user.id);

    if (!updatedMessage) {
      return {
        success: false,
        error: 'メッセージが見つからないか、既読にできません',
      };
    }

    // キャッシュを再検証
    revalidatePath(`/chat/${updatedMessage.applicationId}`);
    revalidatePath('/chat');

    return {
      success: true,
      data: updatedMessage,
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
      error: 'メッセージの既読状態の更新に失敗しました',
    };
  }
}

/**
 * 複数のメッセージを一括で既読にするServer Action
 */
export async function markMessagesAsReadAction(
  messageIds: string[]
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

    // メッセージを一括で既読にする
    const updatedMessages = await markMessagesAsRead(messageIds, user.id);

    if (updatedMessages.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    // キャッシュを再検証（最初のメッセージのapplicationIdを使用）
    const firstMessage = updatedMessages[0];
    revalidatePath(`/chat/${firstMessage.applicationId}`);
    revalidatePath('/chat');

    return {
      success: true,
      data: updatedMessages,
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
      error: 'メッセージの既読状態の更新に失敗しました',
    };
  }
}
