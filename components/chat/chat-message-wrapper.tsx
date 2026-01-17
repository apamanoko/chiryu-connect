'use client';

import { useEffect, useRef } from 'react';
import { markMessagesAsReadAction } from '@/app/actions/messages/update';
import type { MessageWithUsers } from '@/lib/types/message';
import { ChatMessage } from './chat-message';

interface ChatMessageWrapperProps {
  message: MessageWithUsers;
  currentUserId: string;
}

/**
 * メッセージラッパーコンポーネント（Client Component）
 * Intersection Observerを使用してメッセージが表示されたときに既読状態を更新
 */
export function ChatMessageWrapper({
  message,
  currentUserId,
}: ChatMessageWrapperProps) {
  const messageRef = useRef<HTMLDivElement>(null);
  const hasMarkedAsRead = useRef(false);

  useEffect(() => {
    // 送信メッセージの場合は既読処理をしない
    if (message.senderId === currentUserId) {
      return;
    }

    // 既に既読の場合は処理をしない
    if (message.isRead || hasMarkedAsRead.current) {
      return;
    }

    // Intersection Observerでメッセージが表示されたかを監視
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasMarkedAsRead.current) {
            hasMarkedAsRead.current = true;
            // 既読状態を更新
            markMessagesAsReadAction([message.id]).catch((error) => {
              console.error('Failed to mark message as read:', error);
            });
          }
        });
      },
      {
        threshold: 0.5, // メッセージの50%が表示されたら既読にする
      }
    );

    const currentElement = messageRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [message.id, message.senderId, message.isRead, currentUserId]);

  return (
    <div ref={messageRef}>
      <ChatMessage message={message} currentUserId={currentUserId} />
    </div>
  );
}
