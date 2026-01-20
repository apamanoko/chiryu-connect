'use client';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface TypingIndicatorProps {
  userName: string;
  avatarUrl?: string | null;
}

/**
 * 「入力中...」表示コンポーネント（Snapchat風）
 */
export function TypingIndicator({ userName, avatarUrl }: TypingIndicatorProps) {
  return (
    <div className="flex items-start gap-2 mb-1">
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarImage src={avatarUrl || undefined} alt={userName} />
        <AvatarFallback className="text-xs">
          {userName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-2 max-w-xs">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-sm text-gray-600">入力中...</span>
      </div>
    </div>
  );
}
