'use server';

import { ensureAuthenticated } from '@/lib/actions/auth';
import { getUserByClerkId } from '@/lib/db/queries/users';
import {
  getChatRoomsWithUnreadMessages,
  getPostsWithPendingApplications,
} from '@/lib/db/queries/todos';

/**
 * やることリストを取得するServer Action
 */
export async function getTodosAction(): Promise<
  | {
      success: true;
      data: {
        unreadMessages: Array<{
          applicationId: string;
          postTitle: string;
          otherUserName: string;
          otherUserAvatarUrl: string | null;
          unreadCount: number;
          latestUnreadMessage: {
            content: string;
            createdAt: Date;
          } | null;
        }>;
        pendingApplications: Array<{
          post: {
            id: string;
            title: string;
            author: { id: string; name: string; avatarUrl: string | null };
          };
          pendingApplications: Array<{
            id: string;
            applicant: { id: string; name: string; avatarUrl: string | null };
            message: string | null;
            createdAt: Date;
          }>;
        }>;
      };
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

    // 未読メッセージがあるチャットルームを取得
    const unreadMessages = await getChatRoomsWithUnreadMessages(user.id);

    // 承認待ちの応募がある投稿を取得
    const postsWithPending = await getPostsWithPendingApplications(user.id);

    // レスポンス形式に変換
    const pendingApplications = postsWithPending.map((item) => ({
      post: {
        id: item.post.id,
        title: item.post.title,
        author: {
          id: item.post.author.id,
          name: item.post.author.name,
          avatarUrl: item.post.author.avatarUrl,
        },
      },
      pendingApplications: item.pendingApplications.map((app) => ({
        id: app.id,
        applicant: {
          id: app.applicant.id,
          name: app.applicant.name,
          avatarUrl: app.applicant.avatarUrl,
        },
        message: app.message,
        createdAt: app.createdAt,
      })),
    }));

    return {
      success: true,
      data: {
        unreadMessages,
        pendingApplications,
      },
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
      error: 'やることリストの取得に失敗しました',
    };
  }
}
