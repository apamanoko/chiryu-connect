import { getApplicationsByApplicantId } from '@/lib/db/queries/applications';
import { getTagsByPostIds } from '@/lib/db/queries/tags';
import { PostCard } from '@/components/posts/post-card';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ApplicationActions } from './application-actions';
import type { ApplicationStatusType } from '@/lib/db/schema';

interface UserApplicationListProps {
  applicantId: string;
  statusFilter?: ApplicationStatusType | 'all';
}

/**
 * ユーザーの応募一覧コンポーネント（Server Component）
 */
export async function UserApplicationList({ applicantId, statusFilter = 'all' }: UserApplicationListProps) {
  // 応募を取得
  const applications = await getApplicationsByApplicantId(applicantId, 100, 0);

  // ステータスフィルタを適用
  const filteredApplications = statusFilter === 'all'
    ? applications
    : applications.filter((app) => app.status === statusFilter);

  if (filteredApplications.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-600">
            {statusFilter === 'all' ? '応募はまだありません' : '該当する応募がありません'}
          </p>
        </CardContent>
      </Card>
    );
  }

  // 投稿を取得（PostCard用）
  const posts = filteredApplications.map((app) => app.post);
  const postIds = posts.map((post) => post.id);
  const tagsByPostId = await getTagsByPostIds(postIds);

  return (
    <div className="space-y-4">
      {filteredApplications.map((application) => {
        const post = application.post;
        const tags = tagsByPostId.get(post.id) || [];

        return (
          <div key={application.id} className="space-y-2">
            <PostCard post={post} tags={tags} />
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">応募ステータス:</span>
                <Badge
                  variant={
                    application.status === 'approved'
                      ? 'default'
                      : application.status === 'pending'
                      ? 'secondary'
                      : application.status === 'rejected'
                      ? 'destructive'
                      : 'outline'
                  }
                  className={
                    application.status === 'approved' ? 'bg-green-500' : undefined
                  }
                >
                  {application.status === 'pending' && '承認待ち'}
                  {application.status === 'approved' && '承認済み'}
                  {application.status === 'rejected' && '却下'}
                  {application.status === 'cancelled' && 'キャンセル済み'}
                </Badge>
              </div>
              <ApplicationActions application={application} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
