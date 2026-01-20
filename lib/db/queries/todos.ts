import { db } from '../index';
import { messages, applications, posts, users } from '../schema';
import { eq, and, or, desc } from 'drizzle-orm';
import type { PostWithAuthor } from '@/lib/types/post';
import type { ApplicationWithApplicant } from '@/lib/types/application';

/**
 * やることリスト用：未読メッセージがあるチャットルームを取得
 */
export async function getChatRoomsWithUnreadMessages(
  userId: string
): Promise<
  Array<{
    applicationId: string;
    postTitle: string;
    otherUserName: string;
    otherUserAvatarUrl: string | null;
    unreadCount: number;
    latestUnreadMessage: {
      content: string;
      createdAt: Date;
    } | null;
  }>
> {
  // ユーザーが関与する承認済みの応募を取得
  const applicationsResult = await db
    .select({
      application: applications,
      post: posts,
    })
    .from(applications)
    .innerJoin(posts, eq(applications.postId, posts.id))
    .where(
      and(
        eq(applications.status, 'approved'),
        or(
          eq(posts.authorId, userId),
          eq(applications.applicantId, userId)
        )
      )
    );

  const chatRooms = await Promise.all(
    applicationsResult.map(async (row) => {
      // 相手の情報を取得
      const otherUserId =
        row.post.authorId === userId
          ? row.application.applicantId
          : row.post.authorId;

      const [otherUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, otherUserId))
        .limit(1);

      if (!otherUser) {
        return null;
      }

      // 未読メッセージを取得（受信者が自分で、未読のもの）
      const unreadMessages = await db
        .select()
        .from(messages)
        .where(
          and(
            eq(messages.applicationId, row.application.id),
            eq(messages.receiverId, userId),
            eq(messages.isRead, false)
          )
        )
        .orderBy(desc(messages.createdAt));

      if (unreadMessages.length === 0) {
        return null;
      }

      return {
        applicationId: row.application.id,
        postTitle: row.post.title,
        otherUserName: otherUser.name,
        otherUserAvatarUrl: otherUser.avatarUrl,
        unreadCount: unreadMessages.length,
        latestUnreadMessage: unreadMessages[0]
          ? {
              content: unreadMessages[0].content,
              createdAt: unreadMessages[0].createdAt,
            }
          : null,
      };
    })
  );

  // nullを除外して返す
  return chatRooms.filter((room): room is NonNullable<typeof room> => room !== null);
}

/**
 * やることリスト用：承認待ちの応募がある投稿を取得
 */
export async function getPostsWithPendingApplications(
  userId: string
): Promise<
  Array<{
    post: PostWithAuthor;
    pendingApplications: ApplicationWithApplicant[];
  }>
> {
  // ユーザーが投稿した投稿で、承認待ちの応募があるものを取得
  const postsResult = await db
    .select()
    .from(posts)
    .where(eq(posts.authorId, userId));

  const postsWithPending = await Promise.all(
    postsResult.map(async (post) => {
      // 承認待ちの応募を取得
      const pendingApplicationsResult = await db
        .select({
          application: applications,
          applicant: users,
        })
        .from(applications)
        .innerJoin(users, eq(applications.applicantId, users.id))
        .where(
          and(
            eq(applications.postId, post.id),
            eq(applications.status, 'pending')
          )
        )
        .orderBy(desc(applications.createdAt));

      if (pendingApplicationsResult.length === 0) {
        return null;
      }

      // 投稿者の情報を取得
      const [author] = await db
        .select()
        .from(users)
        .where(eq(users.id, post.authorId))
        .limit(1);

      if (!author) {
        return null;
      }

      const pendingApplications: ApplicationWithApplicant[] =
        pendingApplicationsResult.map((row) => ({
          ...row.application,
          applicant: row.applicant,
        }));

      return {
        post: {
          ...post,
          author,
        },
        pendingApplications,
      };
    })
  );

  // nullを除外して返す
  return postsWithPending.filter(
    (item): item is NonNullable<typeof item> => item !== null
  );
}
