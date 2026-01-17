import type { MessageWithUsers } from '@/lib/types/message';
import { formatRelativeTime, formatDateTime } from '@/lib/utils/format';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getCurrentUser } from '@/lib/actions/auth';

interface ChatMessageProps {
  message: MessageWithUsers;
  currentUserId: string;
}

/**
 * メッセージバブルコンポーネント（Server Component）
 * LINE風のデザイン
 */
export async function ChatMessage({ message, currentUserId }: ChatMessageProps) {
  const isSent = message.senderId === currentUserId;

  return (
    <div className={`flex gap-2 mb-4 ${isSent ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* 受信メッセージの場合のみアバターを表示 */}
      {!isSent && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage
            src={message.sender.avatarUrl || undefined}
            alt={message.sender.name}
          />
          <AvatarFallback className="text-xs">
            {message.sender.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`flex flex-col ${isSent ? 'items-end' : 'items-start'} max-w-[75%]`}>
        {/* メッセージバブル */}
        <div
          className={`rounded-2xl px-4 py-2 ${
            isSent
              ? 'bg-orange-500 text-white rounded-br-sm'
              : 'bg-gray-200 text-gray-900 rounded-bl-sm'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>

        {/* タイムスタンプ */}
        <span className={`text-xs text-gray-500 mt-1 ${isSent ? 'text-right' : 'text-left'}`}>
          {formatRelativeTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
}
