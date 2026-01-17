import { getApplicationsByPostId } from '@/lib/db/queries/applications';
import type { ApplicationWithApplicant } from '@/lib/types/application';
import { ApplicationCard } from './application-card';
import { EmptyApplications } from '@/components/shared/empty-state';

interface ApplicationListProps {
  postId: string;
  currentUserId: string;
  isPostAuthor: boolean;
}

/**
 * 応募者一覧コンポーネント（Server Component）
 */
export async function ApplicationList({ postId, currentUserId, isPostAuthor }: ApplicationListProps) {
  const applications = await getApplicationsByPostId(postId);

  if (applications.length === 0) {
    return <EmptyApplications />;
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <ApplicationCard
          key={application.id}
          application={application}
          currentUserId={currentUserId}
          isPostAuthor={isPostAuthor}
        />
      ))}
    </div>
  );
}
