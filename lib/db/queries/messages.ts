import { db } from '../index';
import { messages, applications, users, posts } from '../schema';
import { eq, and, or, desc, inArray } from 'drizzle-orm';
import type { Message, NewMessage } from '../schema';
import type {
  MessageWithSender,
  MessageWithReceiver,
  MessageWithUsers,
  MessageWithApplication,
} from '@/lib/types/message';
import { PAGINATION } from '@/lib/utils/constants';

/**
 * チャット履歴取得（Application ID指定）
 */
export async function getMessagesByApplicationId(
  applicationId: string,
  limit: number = PAGINATION.DEFAULT_LIMIT,
  offset: number = 0
): Promise<MessageWithUsers[]> {
  const limitValue = Math.min(limit, PAGINATION.MAX_LIMIT);

  // メッセージを取得
  const messagesResult = await db
    .select()
    .from(messages)
    .where(eq(messages.applicationId, applicationId))
    .orderBy(desc(messages.createdAt))
    .limit(limitValue)
    .offset(offset);

  // ユーザーIDを収集
  const userIds = new Set<string>();
  messagesResult.forEach((msg) => {
    userIds.add(msg.senderId);
    userIds.add(msg.receiverId);
  });

  // ユーザー情報を一括取得
  const userIdsArray = Array.from(userIds);
  if (userIdsArray.length === 0) {
    return [];
  }

  const usersResult = await db
    .select()
    .from(users)
    .where(inArray(users.id, userIdsArray));

  const usersMap = new Map(usersResult.map((user) => [user.id, user]));

  // メッセージとユーザー情報を結合
  return messagesResult.map((msg) => ({
    ...msg,
    sender: usersMap.get(msg.senderId)!,
    receiver: usersMap.get(msg.receiverId)!,
  }));
}

/**
 * メッセージを作成
 */
export async function createMessage(
  applicationId: string,
  senderId: string,
  receiverId: string,
  content: string
): Promise<MessageWithUsers> {
  // UUIDを生成
  const messageId = crypto.randomUUID();

  const newMessage: NewMessage = {
    id: messageId,
    applicationId,
    senderId,
    receiverId,
    content,
    createdAt: new Date(),
  };

  const [createdMessage] = await db.insert(messages).values(newMessage).returning();

  // 送信者と受信者の情報を取得
  const [sender, receiver] = await Promise.all([
    db.select().from(users).where(eq(users.id, senderId)).limit(1),
    db.select().from(users).where(eq(users.id, receiverId)).limit(1),
  ]);

  if (!sender[0] || !receiver[0]) {
    throw new Error('ユーザーが見つかりません');
  }

  return {
    ...createdMessage,
    sender: sender[0],
    receiver: receiver[0],
  };
}

/**
 * ユーザーのチャットルーム一覧取得
 * 承認済みの応募（Application）ごとに最新メッセージを取得
 */
export async function getChatRoomsByUserId(userId: string): Promise<
  Array<{
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
    unreadCount: number; // Phase 2で実装
  }>
> {
  // ユーザーが関与する承認済みの応募を取得
  // まず応募を取得
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

  // 各応募の投稿者と応募者の情報を取得
  const chatRooms = await Promise.all(
    applicationsResult.map(async (row) => {
      // 投稿者と応募者の情報を取得
      const [postAuthor, applicant] = await Promise.all([
        db.select().from(users).where(eq(users.id, row.post.authorId)).limit(1),
        db.select().from(users).where(eq(users.id, row.application.applicantId)).limit(1),
      ]);

      if (!postAuthor[0] || !applicant[0]) {
        return null;
      }

      // 最新メッセージを取得
      const latestMessageResult = await db
        .select()
        .from(messages)
        .where(eq(messages.applicationId, row.application.id))
        .orderBy(desc(messages.createdAt))
        .limit(1);

      let latestMessage: MessageWithUsers | null = null;
      if (latestMessageResult[0]) {
        const [sender, receiver] = await Promise.all([
          db.select().from(users).where(eq(users.id, latestMessageResult[0].senderId)).limit(1),
          db.select().from(users).where(eq(users.id, latestMessageResult[0].receiverId)).limit(1),
        ]);

        if (sender[0] && receiver[0]) {
          latestMessage = {
            ...latestMessageResult[0],
            sender: sender[0],
            receiver: receiver[0],
          };
        }
      }

      return {
        application: {
          id: row.application.id,
          post: {
            id: row.post.id,
            title: row.post.title,
            author: {
              id: postAuthor[0].id,
              name: postAuthor[0].name,
              avatarUrl: postAuthor[0].avatarUrl,
            },
          },
          applicant: {
            id: applicant[0].id,
            name: applicant[0].name,
            avatarUrl: applicant[0].avatarUrl,
          },
        },
        latestMessage,
        unreadCount: 0, // Phase 2で実装
      };
    })
  );

  // nullを除外
  return chatRooms.filter((room): room is NonNullable<typeof room> => room !== null);
}
