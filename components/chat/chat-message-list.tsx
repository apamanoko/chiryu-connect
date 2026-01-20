'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getMessagesAction } from '@/app/actions/messages/get';
import { getTypingUsersAction } from '@/app/actions/messages/typing';
import { ChatMessageWrapper } from './chat-message-wrapper';
import { TypingIndicator } from './typing-indicator';
import type { MessageWithUsers } from '@/lib/types/message';

interface ChatMessageListProps {
  applicationId: string;
  currentUserId: string;
  initialMessages: MessageWithUsers[];
  otherUserId: string;
  otherUserName: string;
  otherUserAvatarUrl?: string | null;
}

/**
 * チャットメッセージリストコンポーネント（Client Component）
 * リアルタイム更新機能付き
 */
export function ChatMessageList({
  applicationId,
  currentUserId,
  initialMessages,
  otherUserId,
  otherUserName,
  otherUserAvatarUrl,
}: ChatMessageListProps) {
  const [messages, setMessages] = useState<MessageWithUsers[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const typingPollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageIdRef = useRef<string | null>(
    initialMessages.length > 0 ? initialMessages[initialMessages.length - 1].id : null
  );
  const shouldAutoScrollRef = useRef(true);

  // スクロール位置をチェック（最下部に近い場合は自動スクロール）
  const checkShouldAutoScroll = useCallback(() => {
    // 親のスクロールコンテナを取得
    const parentContainer = document.getElementById('messages-container');
    if (!parentContainer) return false;
    const threshold = 100; // 100px以内なら最下部とみなす
    return parentContainer.scrollHeight - parentContainer.scrollTop - parentContainer.clientHeight < threshold;
  }, []);

  // メッセージを取得して更新
  const fetchMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getMessagesAction(applicationId, 100, 0);

      if (result.success) {
        // 古い順にソート（表示用）
        const sortedMessages = [...result.data].reverse();

        // 新しいメッセージがあるかチェック
        const lastMessage = sortedMessages[sortedMessages.length - 1];
        const hasNewMessage = lastMessage && lastMessage.id !== lastMessageIdRef.current;

        if (hasNewMessage) {
          setMessages(sortedMessages);
          lastMessageIdRef.current = lastMessage.id;

          // ユーザーが最下部にいる場合のみ自動スクロール
          shouldAutoScrollRef.current = checkShouldAutoScroll();
          if (shouldAutoScrollRef.current) {
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }
        } else {
          // メッセージ数が変わった場合も更新（削除された場合など）
          setMessages((prevMessages) => {
            if (prevMessages.length !== sortedMessages.length) {
              return sortedMessages;
            }
            // メッセージIDのセットを作成して差分を検出
            const prevMessageIds = new Set(prevMessages.map((m) => m.id));
            const newMessageIds = new Set(sortedMessages.map((m) => m.id));

            // セットのサイズが異なる、または新しいIDがある場合は更新
            if (prevMessageIds.size !== newMessageIds.size) {
              return sortedMessages;
            }
            const hasNewIds = Array.from(newMessageIds).some((id) => !prevMessageIds.has(id));
            if (hasNewIds) {
              return sortedMessages;
            }
            return prevMessages;
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [applicationId, checkShouldAutoScroll]);

  // 入力中状態を取得
  const fetchTypingStatus = useCallback(async () => {
    try {
      const result = await getTypingUsersAction(applicationId);
      if (result.success) {
        setIsOtherUserTyping(result.data.includes(otherUserId));
      }
    } catch (error) {
      console.error('Failed to fetch typing status:', error);
    }
  }, [applicationId, otherUserId]);

  // ポーリングを開始
  useEffect(() => {
    // 初回レンダリング時は少し待ってから開始
    const initialTimeout = setTimeout(() => {
      // 3秒間隔でメッセージをポーリング
      pollingIntervalRef.current = setInterval(() => {
        fetchMessages();
      }, 3000);

      // 1秒間隔で入力中状態をポーリング（より頻繁にチェック）
      typingPollingIntervalRef.current = setInterval(() => {
        fetchTypingStatus();
      }, 1000);
    }, 1000);

    return () => {
      clearTimeout(initialTimeout);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (typingPollingIntervalRef.current) {
        clearInterval(typingPollingIntervalRef.current);
      }
    };
  }, [fetchMessages, fetchTypingStatus]);

  // ページが表示されている間のみポーリング（タブが非アクティブの時は停止）
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // タブが非アクティブの時はポーリングを停止
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        if (typingPollingIntervalRef.current) {
          clearInterval(typingPollingIntervalRef.current);
          typingPollingIntervalRef.current = null;
        }
      } else {
        // タブがアクティブになったら即座に取得してからポーリング再開
        fetchMessages();
        fetchTypingStatus();
        if (!pollingIntervalRef.current) {
          pollingIntervalRef.current = setInterval(() => {
            fetchMessages();
          }, 3000);
        }
        if (!typingPollingIntervalRef.current) {
          typingPollingIntervalRef.current = setInterval(() => {
            fetchTypingStatus();
          }, 1000);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchMessages, fetchTypingStatus]);

  // メッセージ送信成功時に即座に取得
  useEffect(() => {
    const handleMessageSentEvent = () => {
      // 送信時は常に自動スクロール
      shouldAutoScrollRef.current = true;
      fetchMessages();
    };

    window.addEventListener('chat:message-sent', handleMessageSentEvent);

    return () => {
      window.removeEventListener('chat:message-sent', handleMessageSentEvent);
    };
  }, [fetchMessages]);

  // スクロール位置を監視
  useEffect(() => {
    const parentContainer = document.getElementById('messages-container');
    if (!parentContainer) return;

    const handleScroll = () => {
      shouldAutoScrollRef.current = checkShouldAutoScroll();
    };

    parentContainer.addEventListener('scroll', handleScroll);

    return () => {
      parentContainer.removeEventListener('scroll', handleScroll);
    };
  }, [checkShouldAutoScroll]);

  // 初期スクロール位置を最下部に
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, []);

  return (
    <>
      {messages.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <p>まだメッセージがありません</p>
          <p className="text-sm mt-2">メッセージを送信して会話を始めましょう</p>
        </div>
      ) : (
        <div className="space-y-1">
          {messages.map((message) => (
            <ChatMessageWrapper
              key={message.id}
              message={message}
              currentUserId={currentUserId}
            />
          ))}
          {/* 入力中表示 */}
          {isOtherUserTyping && (
            <TypingIndicator
              userName={otherUserName}
              avatarUrl={otherUserAvatarUrl}
            />
          )}
          <div ref={messagesEndRef} />
        </div>
      )}
    </>
  );
}
