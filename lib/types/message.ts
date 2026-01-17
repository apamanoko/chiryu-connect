import type { Message as DbMessage, Application, User } from '@/lib/db/schema';

/**
 * メッセージ型（データベーススキーマから）
 */
export type Message = DbMessage;

/**
 * メッセージと送信者情報を含む型
 */
export type MessageWithSender = Message & {
  sender: User;
};

/**
 * メッセージと受信者情報を含む型
 */
export type MessageWithReceiver = Message & {
  receiver: User;
};

/**
 * メッセージ、送信者、受信者情報を含む型
 */
export type MessageWithUsers = Message & {
  sender: User;
  receiver: User;
};

/**
 * メッセージと応募情報を含む型
 */
export type MessageWithApplication = Message & {
  application: Application;
};

/**
 * メッセージ送信用の入力型
 */
export type CreateMessageInput = {
  applicationId: string;
  content: string;
};
