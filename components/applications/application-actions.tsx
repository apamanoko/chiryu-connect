'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { ApplicationWithPost } from '@/lib/types/application';
import { cancelApplicationAction } from '@/app/actions/applications/cancel';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import Link from 'next/link';
import { X, MessageSquare } from 'lucide-react';

interface ApplicationActionsProps {
  application: ApplicationWithPost;
}

/**
 * 応募アクションボタンコンポーネント（Client Component）
 */
export function ApplicationActions({ application }: ApplicationActionsProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    if (!confirm('応募をキャンセルしますか？')) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await cancelApplicationAction(application.id);

      if (result.success) {
        addToast({
          type: 'success',
          title: '応募をキャンセルしました',
        });
        router.refresh();
      } else {
        setError(result.error);
        addToast({
          type: 'error',
          title: 'キャンセルに失敗しました',
          description: result.error,
        });
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      {error && (
        <span className="text-xs text-red-600">{error}</span>
      )}
      {application.status === 'pending' && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleCancel}
          disabled={isPending}
        >
          <X className="w-4 h-4 mr-1" />
          キャンセル
        </Button>
      )}
      {application.status === 'approved' && (
        <Button
          size="sm"
          variant="default"
          asChild
        >
          <Link href={`/chat/${application.id}`}>
            <MessageSquare className="w-4 h-4 mr-1" />
            チャットを開く
          </Link>
        </Button>
      )}
    </div>
  );
}
