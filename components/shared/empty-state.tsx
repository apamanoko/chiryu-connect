import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

/**
 * 空状態コンポーネント（統一されたデザイン）
 */
export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          {Icon && (
            <div className="rounded-full bg-orange-100 p-4">
              <Icon className="h-8 w-8 text-orange-600" />
            </div>
          )}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {description && (
              <p className="text-sm text-gray-600 max-w-sm">{description}</p>
            )}
          </div>
          {action && <div className="mt-4">{action}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 投稿がない場合の空状態
 */
export function EmptyPosts() {
  return (
    <EmptyState
      title="募集はまだありません"
      description="新しいボランティア募集が投稿されると、ここに表示されます。"
    />
  );
}

/**
 * 応募がない場合の空状態
 */
export function EmptyApplications() {
  return (
    <EmptyState
      title="応募はまだありません"
      description="この募集への応募があると、ここに表示されます。"
    />
  );
}

/**
 * チャットがない場合の空状態
 */
export function EmptyChatRooms() {
  return (
    <EmptyState
      title="チャットルームはまだありません"
      description="承認された応募があると、チャットルームが作成されます。"
    />
  );
}

/**
 * メッセージがない場合の空状態
 */
export function EmptyMessages() {
  return (
    <EmptyState
      title="メッセージはまだありません"
      description="メッセージを送信すると、ここに表示されます。"
    />
  );
}
