'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createMessageAction } from '@/app/actions/messages/create';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { Send } from 'lucide-react';
import { MAX_LENGTH } from '@/lib/utils/constants';

interface ChatInputProps {
  applicationId: string;
}

/**
 * メッセージ入力コンポーネント（Client Component）
 */
export function ChatInput({ applicationId }: ChatInputProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!content.trim()) {
      return;
    }

    if (content.length > MAX_LENGTH.MESSAGE_CONTENT) {
      setError(`メッセージは${MAX_LENGTH.MESSAGE_CONTENT}文字以内である必要があります`);
      return;
    }

    startTransition(async () => {
      const result = await createMessageAction({
        applicationId,
        content: content.trim(),
      });

      if (result.success) {
        setContent('');
        // メッセージ送信成功を通知（リアルタイム更新のため）
        window.dispatchEvent(new CustomEvent('chat:message-sent'));
        // ページリロードは不要（リアルタイム更新で対応）
      } else {
        setError(result.error);
        addToast({
          type: 'error',
          title: 'メッセージの送信に失敗しました',
          description: result.error,
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="border-t bg-white p-4">
      {error && (
        <div className="mb-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}
      <div className="flex gap-2 items-end">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="メッセージを入力..."
          rows={1}
          maxLength={MAX_LENGTH.MESSAGE_CONTENT}
          className="resize-none min-h-[44px] max-h-32"
          disabled={isPending}
        />
        <Button
          type="submit"
          size="icon"
          disabled={isPending || !content.trim() || content.length > MAX_LENGTH.MESSAGE_CONTENT}
          className="flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}
