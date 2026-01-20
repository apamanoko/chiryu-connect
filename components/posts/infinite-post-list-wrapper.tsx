import { searchPostsWithFilters } from '@/lib/db/queries/posts';
import { getTagsByPostIds } from '@/lib/db/queries/tags';
import { getFavoriteStatuses } from '@/lib/db/queries/favorites';
import { getCurrentUser } from '@/lib/actions/auth';
import { InfinitePostList } from './infinite-post-list';
import { PAGINATION } from '@/lib/utils/constants';

interface InfinitePostListWrapperProps {
  searchParams: {
    keyword?: string;
    tagIds?: string[];
    startDate?: Date;
    endDate?: Date;
    location?: string;
  };
}

/**
 * 無限スクロール投稿一覧のラッパー（Server Component）
 * 初期データを取得してClient Componentに渡す
 */
export async function InfinitePostListWrapper({
  searchParams,
}: InfinitePostListWrapperProps) {
  const currentUser = await getCurrentUser();

  // 初期投稿を取得
  const initialPosts = await searchPostsWithFilters(
    {
      keyword: searchParams.keyword,
      tagIds: searchParams.tagIds,
      location: searchParams.location,
      startDate: searchParams.startDate,
      endDate: searchParams.endDate,
    },
    PAGINATION.DEFAULT_LIMIT,
    0,
    'active'
  );

  // 初期投稿のタグを取得
  const postIds = initialPosts.map((post) => post.id);
  const tagsMap = await getTagsByPostIds(postIds);

  // 初期投稿のお気に入り状態を取得（ログインユーザーのみ）
  let favoriteStatusesArray: { postId: string; isFavorite: boolean }[] = [];
  if (currentUser) {
    const favoriteStatusesMap = await getFavoriteStatuses(currentUser.id, postIds);
    favoriteStatusesArray = postIds.map((postId) => ({
      postId,
      isFavorite: favoriteStatusesMap.get(postId) ?? false,
    }));
  }

  return (
    <InfinitePostList
      initialPosts={initialPosts}
      initialTags={tagsMap}
      initialFavoriteStatuses={favoriteStatusesArray}
      searchParams={searchParams}
    />
  );
}
