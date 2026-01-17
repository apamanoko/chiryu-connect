'use client';

import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

interface PostCardClientProps {
  postId: string;
  children: ReactNode;
}

/**
 * 募集カードのクライアントコンポーネント
 * クリック時のナビゲーション処理を担当
 */
export function PostCardClient({ postId, children }: PostCardClientProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/posts/${postId}`);
  };

  return (
    <div onClick={handleClick} role="button" tabIndex={0} onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    }}>
      {children}
    </div>
  );
}
