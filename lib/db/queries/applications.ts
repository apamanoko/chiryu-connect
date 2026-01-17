import { db } from '../index';
import { applications, posts, users } from '../schema';
import { eq, and, desc, inArray } from 'drizzle-orm';
import type { Application, NewApplication } from '../schema';
import type {
  ApplicationWithPost,
  ApplicationWithApplicant,
  ApplicationWithPostAndApplicant,
} from '@/lib/types/application';
import type { PostWithAuthor } from '@/lib/types/post';
import { PAGINATION } from '@/lib/utils/constants';

/**
 * IDで応募を取得
 */
export async function getApplicationById(
  id: string
): Promise<ApplicationWithPostAndApplicant | null> {
  const result = await db
    .select({
      application: applications,
      post: posts,
      applicant: users,
    })
    .from(applications)
    .innerJoin(posts, eq(applications.postId, posts.id))
    .innerJoin(users, eq(applications.applicantId, users.id))
    .where(eq(applications.id, id))
    .limit(1);

  if (!result[0]) {
    return null;
  }

  // 投稿者の情報を取得
  const postAuthor = await db
    .select()
    .from(users)
    .where(eq(users.id, result[0].post.authorId))
    .limit(1);

  if (!postAuthor[0]) {
    return null;
  }

  return {
    ...result[0].application,
    post: {
      ...result[0].post,
      author: postAuthor[0],
    },
    applicant: result[0].applicant,
  };
}

/**
 * 募集の応募一覧取得
 */
export async function getApplicationsByPostId(
  postId: string,
  limit: number = PAGINATION.DEFAULT_LIMIT,
  offset: number = 0
): Promise<ApplicationWithApplicant[]> {
  const limitValue = Math.min(limit, PAGINATION.MAX_LIMIT);

  const result = await db
    .select({
      application: applications,
      applicant: users,
    })
    .from(applications)
    .innerJoin(users, eq(applications.applicantId, users.id))
    .where(eq(applications.postId, postId))
    .orderBy(desc(applications.createdAt))
    .limit(limitValue)
    .offset(offset);

  return result.map((row) => ({
    ...row.application,
    applicant: row.applicant,
  }));
}

/**
 * ユーザーの応募一覧取得
 */
export async function getApplicationsByApplicantId(
  applicantId: string,
  limit: number = PAGINATION.DEFAULT_LIMIT,
  offset: number = 0
): Promise<Array<Application & { post: PostWithAuthor }>> {
  const limitValue = Math.min(limit, PAGINATION.MAX_LIMIT);

  const result = await db
    .select({
      application: applications,
      post: posts,
    })
    .from(applications)
    .innerJoin(posts, eq(applications.postId, posts.id))
    .where(eq(applications.applicantId, applicantId))
    .orderBy(desc(applications.createdAt))
    .limit(limitValue)
    .offset(offset);

  // 投稿者の情報を取得
  const authorIds = [...new Set(result.map((row) => row.post.authorId))];
  
  if (authorIds.length === 0) {
    return [];
  }

  const authors = await db
    .select()
    .from(users)
    .where(inArray(users.id, authorIds));

  const authorsMap = new Map(authors.map((author) => [author.id, author]));

  return result.map((row) => ({
    ...row.application,
    post: {
      ...row.post,
      author: authorsMap.get(row.post.authorId)!,
    },
  }));
}

/**
 * 応募を作成
 */
export async function createApplication(
  applicantId: string,
  postId: string,
  message: string | null
): Promise<ApplicationWithPostAndApplicant> {
  // UUIDを生成
  const applicationId = crypto.randomUUID();

  const newApplication: NewApplication = {
    id: applicationId,
    postId,
    applicantId,
    status: 'pending',
    message: message || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const [createdApplication] = await db
    .insert(applications)
    .values(newApplication)
    .returning();

  // 作成した応募を取得（postとapplicantを含む）
  const applicationWithDetails = await getApplicationById(createdApplication.id);
  if (!applicationWithDetails) {
    throw new Error('応募の作成に失敗しました');
  }

  return applicationWithDetails;
}

/**
 * 応募ステータスを更新
 */
export async function updateApplicationStatus(
  id: string,
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
): Promise<ApplicationWithPostAndApplicant> {
  const result = await db
    .update(applications)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(applications.id, id))
    .returning();

  if (!result[0]) {
    throw new Error('応募が見つかりません');
  }

  // 更新した応募を取得（postとapplicantを含む）
  const applicationWithDetails = await getApplicationById(id);
  if (!applicationWithDetails) {
    throw new Error('応募の取得に失敗しました');
  }

  return applicationWithDetails;
}

/**
 * 応募をキャンセル（ステータスを'cancelled'に変更）
 */
export async function cancelApplication(id: string): Promise<Application> {
  const result = await db
    .update(applications)
    .set({
      status: 'cancelled',
      updatedAt: new Date(),
    })
    .where(eq(applications.id, id))
    .returning();

  if (!result[0]) {
    throw new Error('応募が見つかりません');
  }

  return result[0];
}

/**
 * 投稿IDと応募者IDで応募を取得（重複チェック用）
 */
export async function getApplicationByPostAndApplicant(
  postId: string,
  applicantId: string
): Promise<Application | null> {
  const result = await db
    .select()
    .from(applications)
    .where(and(eq(applications.postId, postId), eq(applications.applicantId, applicantId)))
    .limit(1);

  return result[0] ?? null;
}
