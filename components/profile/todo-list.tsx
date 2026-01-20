import { getTodosAction } from '@/app/actions/todos/get';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { MessageSquare, UserCheck, CheckCircle2 } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/format';
import { EmptyState } from '@/components/shared/empty-state';

/**
 * やることリストコンポーネント（Server Component）
 */
export async function TodoList() {
  const result = await getTodosAction();

  if (!result.success) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {result.error}
      </div>
    );
  }

  const { unreadMessages, pendingApplications } = result.data;

  // 両方空の場合
  if (unreadMessages.length === 0 && pendingApplications.length === 0) {
    return (
      <EmptyState
        title="やることはありません"
        description="すべて完了しています！"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* 未読メッセージ */}
      {unreadMessages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              メッセージ返信が必要
              <span className="ml-auto text-sm font-normal text-gray-500">
                {unreadMessages.length}件
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unreadMessages.map((room) => (
                <Link
                  key={room.applicationId}
                  href={`/chat/${room.applicationId}`}
                  className="block"
                >
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarImage
                        src={room.otherUserAvatarUrl || undefined}
                        alt={room.otherUserName}
                      />
                      <AvatarFallback>
                        {room.otherUserName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900 truncate">
                          {room.otherUserName}
                        </p>
                        <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {room.unreadCount}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 truncate mb-1">
                        {room.postTitle}
                      </p>
                      {room.latestUnreadMessage && (
                        <p className="text-sm text-gray-500 truncate">
                          {room.latestUnreadMessage.content}
                        </p>
                      )}
                      {room.latestUnreadMessage && (
                        <p className="text-xs text-gray-400 mt-1">
                          {formatRelativeTime(room.latestUnreadMessage.createdAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 承認待ちの応募 */}
      {pendingApplications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              応募者承認が必要
              <span className="ml-auto text-sm font-normal text-gray-500">
                {pendingApplications.reduce(
                  (sum, item) => sum + item.pendingApplications.length,
                  0
                )}
                件
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingApplications.map((item) => (
                <div key={item.post.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                  <Link
                    href={`/posts/${item.post.id}`}
                    className="block mb-3 hover:underline"
                  >
                    <h3 className="font-medium text-gray-900">{item.post.title}</h3>
                  </Link>
                  <div className="space-y-2">
                    {item.pendingApplications.map((app) => (
                      <div
                        key={app.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
                      >
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarImage
                            src={app.applicant.avatarUrl || undefined}
                            alt={app.applicant.name}
                          />
                          <AvatarFallback className="text-xs">
                            {app.applicant.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {app.applicant.name}
                          </p>
                          {app.message && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {app.message}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {formatRelativeTime(app.createdAt)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          asChild
                          className="flex-shrink-0"
                        >
                          <Link href={`/posts/${item.post.id}`}>承認する</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
