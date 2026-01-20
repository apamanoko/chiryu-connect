'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { searchPostsAction } from '@/app/actions/posts/search';
import { PostCard } from './post-card';
import { PostListSkeleton } from './post-list-skeleton';
import { EmptyPosts } from '@/components/shared/empty-state';
import type { PostWithAuthor } from '@/lib/types/post';
import type { Tag } from '@/lib/types/tag';
import { PAGINATION } from '@/lib/utils/constants';

interface InfinitePostListProps {
  initialPosts: PostWithAuthor[];
  initialTags: Map<string, Tag[]>;
  initialFavoriteStatuses: { postId: string; isFavorite: boolean }[];
  searchParams: {
    keyword?: string;
    tagIds?: string[];
    startDate?: Date;
    endDate?: Date;
    location?: string;
  };
}

/**
 * 無限スクロール対応の投稿一覧コンポーネント（Client Component）
 */
export function InfinitePostList({
  initialPosts,
  initialTags,
  initialFavoriteStatuses,
  searchParams,
}: InfinitePostListProps) {
  const [posts, setPosts] = useState<PostWithAuthor[]>(initialPosts);
  const [tagsMap, setTagsMap] = useState<Map<string, Tag[]>>(initialTags);
  const [favoriteStatuses, setFavoriteStatuses] = useState<Map<string, boolean>>(
    () => {
      const map = new Map<string, boolean>();
      initialFavoriteStatuses.forEach(({ postId, isFavorite }) => {
        map.set(postId, isFavorite);
      });
      return map;
    }
  );
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPosts.length >= PAGINATION.DEFAULT_LIMIT);
  const [error, setError] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(initialPosts.length);

  // 検索パラメータが変更されたときに投稿をリセット
  // searchParamsの文字列表現で比較（オブジェクトの参照比較を避ける）
  const searchParamsKey = useMemo(() => JSON.stringify(searchParams), [searchParams]);
  
  useEffect(() => {
    setPosts(initialPosts);
    setTagsMap(initialTags);
    setFavoriteStatuses(() => {
      const map = new Map<string, boolean>();
      initialFavoriteStatuses.forEach(({ postId, isFavorite }) => {
        map.set(postId, isFavorite);
      });
      return map;
    });
    offsetRef.current = initialPosts.length;
    setHasMore(initialPosts.length >= PAGINATION.DEFAULT_LIMIT);
    setError(null);
  }, [initialPosts, initialTags, searchParamsKey]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await searchPostsAction({
        ...searchParams,
        limit: PAGINATION.DEFAULT_LIMIT,
        offset: offsetRef.current,
        status: 'active',
      });

      if (result.success) {
        const { posts: newPosts, tags: newTagsArray } = result.data;
        
        if (newPosts.length === 0) {
          setHasMore(false);
        } else {
          setPosts((prev) => [...prev, ...newPosts]);
          // タグマップを更新（配列からMapに変換）
          setTagsMap((prev) => {
            const updated = new Map(prev);
            newTagsArray.forEach(({ postId, tags }) => {
              updated.set(postId, tags);
            });
            return updated;
          });
          // 追加分のお気に入り状態は、クライアント側では初期状態不明なのでfalseで初期化
          setFavoriteStatuses((prev) => {
            const updated = new Map(prev);
            newPosts.forEach((post) => {
              if (!updated.has(post.id)) {
                updated.set(post.id, false);
              }
            });
            return updated;
          });
          offsetRef.current += newPosts.length;
          setHasMore(newPosts.length >= PAGINATION.DEFAULT_LIMIT);
        }
      } else {
        setError(result.error);
        setHasMore(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '投稿の読み込みに失敗しました');
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, hasMore, searchParamsKey]);

  // Intersection Observerでスクロール検知
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, loadMore, searchParamsKey]);

  if (posts.length === 0 && !isLoading) {
    return <EmptyPosts />;
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => {
          const tags = tagsMap.get(post.id) || [];
          const isFavorite = favoriteStatuses.get(post.id) ?? false;
          return (
            <PostCard
              key={post.id}
              post={post}
              tags={tags}
              initialIsFavorite={isFavorite}
            />
          );
        })}
      </div>

      {/* ローディングターゲット */}
      {hasMore && (
        <div ref={observerTarget} className="mt-8">
          {isLoading && <PostListSkeleton />}
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div className="mt-4 text-center">
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={loadMore}
            className="mt-2 text-sm text-orange-600 hover:text-orange-700 underline"
          >
            再試行
          </button>
        </div>
      )}

      {/* すべて読み込み完了 */}
      {!hasMore && posts.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">すべての募集を表示しました</p>
        </div>
      )}
    </>
  );
}
