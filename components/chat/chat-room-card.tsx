'use client';

import { useRouter } from 'next/navigation';
import type { MessageWithUsers } from '@/lib/types/message';
import { formatRelativeTime } from '@/lib/utils/format';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';

interface ChatRoomCardProps {
  room: {
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
  };
  currentUserId: string;
}

/**
 * チャットルームカードコンポーネント（Client Component）
 */
export function ChatRoomCard({ room, currentUserId }: ChatRoomCardProps) {
  const router = useRouter();

  // 相手の情報を取得（現在のユーザーが募集者の場合は応募者、応募者の場合は募集者）
  const otherUser =
    room.application.post.author.id === currentUserId
      ? room.application.applicant
      : room.application.post.author;

  const handleClick = () => {
    router.push(`/chat/${room.application.id}`);
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* アバター */}
          <Avatar className="w-12 h-12 flex-shrink-0">
            <AvatarImage src={otherUser.avatarUrl || undefined} alt={otherUser.name} />
            <AvatarFallback>
              {otherUser.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* コンテンツ */}
          <div className="flex-1 min-w-0">
            {/* 投稿タイトル */}
            <p className="text-xs text-gray-600 font-medium mb-1 truncate">
              {room.application.post.title}
            </p>
            
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-gray-900 truncate">{otherUser.name}</h3>
              {room.latestMessage && (
                <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                  {formatRelativeTime(room.latestMessage.createdAt)}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 line-clamp-1 truncate">
                {room.latestMessage
                  ? room.latestMessage.content
                  : 'まだメッセージがありません'}
              </p>
              {room.unreadCount > 0 && (
                <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-0.5 flex-shrink-0 ml-2">
                  {room.unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
