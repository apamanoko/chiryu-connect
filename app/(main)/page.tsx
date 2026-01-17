import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/auth';
import { getAllTags } from '@/lib/db/queries/tags';
import { InfinitePostListWrapper } from '@/components/posts/infinite-post-list-wrapper';
import { SearchBar } from '@/components/shared/search-bar';
import { FilterButton } from '@/components/shared/filter-button';
import { Suspense } from 'react';
import { PostListSkeleton } from '@/components/posts/post-list-skeleton';

/**
 * 投稿一覧のスケルトンローダー
 */
function PostListSkeletonLoader() {
  return <PostListSkeleton />;
}

/**
 * ホーム画面（投稿一覧）
 * 認証されていない場合はログイン画面にリダイレクト
 * 認証されているがプロフィール未設定の場合はオンボーディングにリダイレクト
 */
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { auth } = await import('@clerk/nextjs/server');
  const { userId } = await auth();

  // 未認証の場合はログイン画面にリダイレクト
  if (!userId) {
    redirect('/login');
  }

  // 認証済みの場合、ユーザー情報を取得
  const user = await getCurrentUser();

  // ユーザーが存在しない、またはプロフィール未設定の場合はオンボーディングにリダイレクト
  if (!user || (user.name === 'ユーザー' || !user.name)) {
    redirect('/onboarding');
  }

  // 検索パラメータを取得
  const params = await searchParams;
  const keyword = typeof params.q === 'string' ? params.q : undefined;
  const tagIds = typeof params.tags === 'string' ? params.tags.split(',').filter(Boolean) : undefined;
  const location = typeof params.location === 'string' ? params.location : undefined;
  const startDate = typeof params.startDate === 'string' ? new Date(params.startDate) : undefined;
  const endDate = typeof params.endDate === 'string' ? new Date(params.endDate) : undefined;

  // タグ一覧を取得（フィルタモーダル用）
  const tags = await getAllTags();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* ヘッダー */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Chiryu Connect</h1>
            <p className="text-gray-600">知立市のボランティアマッチングプラットフォーム</p>
          </div>

          {/* 検索・フィルタバー */}
          <div className="mb-6 space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <SearchBar />
              </div>
              <FilterButton tags={tags} />
            </div>
          </div>

          {/* 投稿一覧（無限スクロール） */}
          <Suspense fallback={<PostListSkeletonLoader />}>
            <InfinitePostListWrapper
              searchParams={{
                keyword,
                tagIds,
                location,
                startDate,
                endDate,
              }}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
