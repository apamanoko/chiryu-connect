'use server';

import { ensureAuthenticated } from '@/lib/actions/auth';
import { getUserByClerkId } from '@/lib/db/queries/users';
import { setTyping, clearTyping, getTypingUsers } from '@/lib/db/queries/typing';
import { getApplicationById } from '@/lib/db/queries/applications';

/**
 * 入力中状態を設定するServer Action
 */
export async function setTypingAction(applicationId: string): Promise<
  | { success: true }
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

    // 応募を取得して認可チェック
    const application = await getApplicationById(applicationId);
    if (!application) {
      return {
        success: false,
        error: '応募が見つかりません',
      };
    }

    // 認可チェック：応募に関与しているユーザーのみ
    const isPostAuthor = application.post.authorId === user.id;
    const isApplicant = application.applicant.id === user.id;

    if (!isPostAuthor && !isApplicant) {
      return {
        success: false,
        error: 'この応募に関与していないため、入力中状態を設定できません',
      };
    }

    // 入力中状態を設定
    setTyping(applicationId, user.id);

    return {
      success: true,
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
      error: '入力中状態の設定に失敗しました',
    };
  }
}

/**
 * 入力中状態を解除するServer Action
 */
export async function clearTypingAction(applicationId: string): Promise<
  | { success: true }
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

    // 入力中状態を解除
    clearTyping(applicationId, user.id);

    return {
      success: true,
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
      error: '入力中状態の解除に失敗しました',
    };
  }
}

/**
 * 入力中ユーザーを取得するServer Action
 */
export async function getTypingUsersAction(applicationId: string): Promise<
  | { success: true; data: string[] }
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

    // 応募を取得して認可チェック
    const application = await getApplicationById(applicationId);
    if (!application) {
      return {
        success: false,
        error: '応募が見つかりません',
      };
    }

    // 認可チェック：応募に関与しているユーザーのみ
    const isPostAuthor = application.post.authorId === user.id;
    const isApplicant = application.applicant.id === user.id;

    if (!isPostAuthor && !isApplicant) {
      return {
        success: false,
        error: 'この応募に関与していないため、入力中状態を取得できません',
      };
    }

    // 入力中ユーザーを取得
    const typingUsers = getTypingUsers(applicationId, user.id);

    return {
      success: true,
      data: typingUsers,
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
      error: '入力中状態の取得に失敗しました',
    };
  }
}
