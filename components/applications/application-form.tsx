'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createApplicationAction } from '@/app/actions/applications/create';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { MAX_LENGTH } from '@/lib/utils/constants';

interface ApplicationFormProps {
  postId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * 応募確認ダイアログ（Client Component）
 */
export function ApplicationForm({ postId, open, onOpenChange }: ApplicationFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (message.length > MAX_LENGTH.APPLICATION_MESSAGE) {
      setError(`応募メッセージは${MAX_LENGTH.APPLICATION_MESSAGE}文字以内である必要があります`);
      return;
    }

    startTransition(async () => {
      const result = await createApplicationAction({
        postId,
        message: message.trim() || null,
      });

      if (result.success) {
        addToast({
          type: 'success',
          title: '応募しました',
          description: '応募が正常に送信されました。',
        });
        onOpenChange(false);
        setMessage('');
        router.refresh();
      } else {
        setError(result.error);
        addToast({
          type: 'error',
          title: '応募に失敗しました',
          description: result.error,
        });
      }
    });
  };

  const handleCancel = () => {
    onOpenChange(false);
    setMessage('');
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>応募を確認</DialogTitle>
          <DialogDescription>
            この募集に応募しますか？
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 応募メッセージ */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              応募メッセージ（任意）
            </label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="募集者へのメッセージを入力してください"
              rows={4}
              maxLength={MAX_LENGTH.APPLICATION_MESSAGE}
            />
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>{message.length}/{MAX_LENGTH.APPLICATION_MESSAGE}文字</span>
            </div>
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isPending}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={isPending || message.length > MAX_LENGTH.APPLICATION_MESSAGE}
            >
              {isPending ? '応募中...' : '応募する'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
