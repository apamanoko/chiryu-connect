'use client';

import { useState, useTransition } from 'react';
import { toggleFavoriteAction } from '@/app/actions/favorites/toggle';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';

interface FavoriteButtonProps {
  postId: string;
  initialIsFavorite: boolean;
}

/**
 * お気に入りボタンコンポーネント（Client Component）
 */
export function FavoriteButton({ postId, initialIsFavorite }: FavoriteButtonProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    // 親要素（カード全体など）のクリックを発火させない
    e.stopPropagation();
    startTransition(async () => {
      const result = await toggleFavoriteAction(postId);

      if (result.success) {
        setIsFavorite(result.isFavorite);
        router.refresh();
        addToast({
          type: result.isFavorite ? 'success' : 'info',
          title: result.isFavorite ? 'お気に入りに追加しました' : 'お気に入りを解除しました',
        });
      } else {
        addToast({
          type: 'error',
          title: 'エラー',
          description: result.error,
        });
      }
    });
  };

  return (
    <Button
      variant={isFavorite ? 'default' : 'outline'}
      size="sm"
      onClick={handleToggle}
      disabled={isPending}
      className="flex items-center gap-2"
    >
      <Heart
        className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`}
      />
      {isFavorite ? 'お気に入り済み' : 'お気に入り'}
    </Button>
  );
}
