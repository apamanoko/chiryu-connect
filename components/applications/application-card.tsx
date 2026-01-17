'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { ApplicationWithApplicant } from '@/lib/types/application';
import { updateApplicationStatusAction } from '@/app/actions/applications/update';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { formatRelativeTime } from '@/lib/utils/format';
import { Check, X } from 'lucide-react';

interface ApplicationCardProps {
  application: ApplicationWithApplicant;
  currentUserId: string;
  isPostAuthor: boolean;
}

/**
 * 応募者カードコンポーネント（Client Component）
 * 承認/却下ボタン（募集者のみ表示）
 */
export function ApplicationCard({ application, currentUserId, isPostAuthor }: ApplicationCardProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    setIsPending(true);
    setError(null);

    const result = await updateApplicationStatusAction(application.id, {
      status: 'approved',
    });

    if (result.success) {
      addToast({
        type: 'success',
        title: '応募を承認しました',
      });
      router.refresh();
    } else {
      setError(result.error);
      addToast({
        type: 'error',
        title: '承認に失敗しました',
        description: result.error,
      });
    }

    setIsPending(false);
  };

  const handleReject = async () => {
    setIsPending(true);
    setError(null);

    const result = await updateApplicationStatusAction(application.id, {
      status: 'rejected',
    });

    if (result.success) {
      addToast({
        type: 'success',
        title: '応募を却下しました',
      });
      router.refresh();
    } else {
      setError(result.error);
      addToast({
        type: 'error',
        title: '却下に失敗しました',
        description: result.error,
      });
    }

    setIsPending(false);
  };

  const getStatusBadge = () => {
    switch (application.status) {
      case 'pending':
        return <Badge variant="secondary">承認待ち</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-500">承認済み</Badge>;
      case 'rejected':
        return <Badge variant="destructive">却下</Badge>;
      case 'cancelled':
        return <Badge variant="outline">キャンセル済み</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* アバター */}
          <Avatar className="w-12 h-12">
            <AvatarImage
              src={application.applicant.avatarUrl || undefined}
              alt={application.applicant.name}
            />
            <AvatarFallback>
              {application.applicant.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* コンテンツ */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">{application.applicant.name}</h4>
                <p className="text-xs text-gray-500">
                  {formatRelativeTime(application.createdAt)}
                </p>
              </div>
              {getStatusBadge()}
            </div>

            {/* 応募メッセージ */}
            {application.message && (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{application.message}</p>
            )}

            {/* エラーメッセージ */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-xs">
                {error}
              </div>
            )}

            {/* アクションボタン（募集者のみ、承認待ちの場合のみ表示） */}
            {isPostAuthor && application.status === 'pending' && (
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleApprove}
                  disabled={isPending}
                  className="flex-1"
                >
                  <Check className="w-4 h-4 mr-1" />
                  承認
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReject}
                  disabled={isPending}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-1" />
                  却下
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
