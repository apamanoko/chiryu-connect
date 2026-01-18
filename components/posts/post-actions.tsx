'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deletePostAction } from '@/app/actions/posts/delete';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { Edit, Trash2, X } from 'lucide-react';

interface PostActionsProps {
  postId: string;
  postStatus: 'active' | 'closed' | 'cancelled';
}

/**
 * 投稿の編集・取消アクションコンポーネント（Client Component）
 * 投稿者のみ表示
 */
export function PostActions({ postId, postStatus }: PostActionsProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    startTransition(async () => {
      const result = await deletePostAction(postId);

      if (result.success) {
        addToast({
          type: 'success',
          title: '募集を取消しました',
        });
        setIsDeleteDialogOpen(false);
        router.push('/');
        router.refresh();
      } else {
        addToast({
          type: 'error',
          title: '取消に失敗しました',
          description: result.error,
        });
      }
    });
  };

  const handleEdit = () => {
    router.push(`/posts/${postId}/edit`);
  };

  // 既に取消済みの場合は取消ボタンを無効化
  const isCancelled = postStatus === 'cancelled';

  return (
    <div className="flex gap-2">
      <Button
        variant="default"
        onClick={handleEdit}
        disabled={isPending || isCancelled}
        className="flex-1"
      >
        <Edit className="w-4 h-4 mr-2" />
        編集
      </Button>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="destructive"
            disabled={isPending || isCancelled}
            className="flex-1"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            取消
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>募集を取消しますか？</DialogTitle>
            <DialogDescription>
              この募集を取消すると、応募者に通知され、新しい応募を受け付けなくなります。
              この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isPending}
            >
              <X className="w-4 h-4 mr-2" />
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isPending ? '取消中...' : '取消する'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
