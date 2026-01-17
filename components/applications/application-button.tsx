'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ApplicationForm } from './application-form';
import { CheckCircle2 } from 'lucide-react';
import type { Application } from '@/lib/types/application';

interface ApplicationButtonProps {
  postId: string;
  postAuthorId: string;
  currentUserId: string | null;
  existingApplication: Application | null;
  postStatus: 'active' | 'closed' | 'cancelled';
  currentParticipants: number;
  maxParticipants: number;
}

/**
 * 応募ボタンコンポーネント（Client Component）
 */
export function ApplicationButton({
  postId,
  postAuthorId,
  currentUserId,
  existingApplication,
  postStatus,
  currentParticipants,
  maxParticipants,
}: ApplicationButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 未認証の場合は非表示
  if (!currentUserId) {
    return null;
  }

  // 募集者本人の場合は非表示
  if (postAuthorId === currentUserId) {
    return null;
  }

  // 募集終了またはキャンセル済みの場合は非表示
  if (postStatus !== 'active') {
    return null;
  }

  // 満員の場合は非表示
  if (currentParticipants >= maxParticipants) {
    return null;
  }

  // 既に応募済みの場合
  if (existingApplication) {
    if (existingApplication.status === 'pending') {
      return (
        <Button disabled variant="secondary" className="w-full">
          <CheckCircle2 className="w-4 h-4 mr-2" />
          応募済み（承認待ち）
        </Button>
      );
    }
    if (existingApplication.status === 'approved') {
      return (
        <Button disabled variant="secondary" className="w-full">
          <CheckCircle2 className="w-4 h-4 mr-2" />
          応募済み（承認済み）
        </Button>
      );
    }
    if (existingApplication.status === 'rejected') {
      return (
        <Button disabled variant="outline" className="w-full">
          却下済み
        </Button>
      );
    }
    if (existingApplication.status === 'cancelled') {
      // キャンセル済みの場合は再応募可能
      return (
        <>
          <Button onClick={() => setIsDialogOpen(true)} className="w-full">
            応募する
          </Button>
          <ApplicationForm
            postId={postId}
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
          />
        </>
      );
    }
  }

  // 応募可能な場合
  return (
    <>
      <Button onClick={() => setIsDialogOpen(true)} className="w-full">
        応募する
      </Button>
      <ApplicationForm
        postId={postId}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}
