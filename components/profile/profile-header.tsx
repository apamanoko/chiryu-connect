import { getCurrentUser } from '@/lib/actions/auth';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ProfileEditForm } from './profile-edit-form';
import { LogoutButton } from './logout-button';

/**
 * プロフィールヘッダーコンポーネント（Server Component）
 */
export async function ProfileHeader() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-start gap-6">
        {/* アバター */}
        <Avatar className="w-24 h-24 flex-shrink-0">
          <AvatarImage src={user.avatarUrl || undefined} alt={user.name} />
          <AvatarFallback className="text-2xl">
            {user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* プロフィール情報 */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{user.name}</h1>
          {user.bio && (
            <p className="text-gray-600 line-clamp-3 mb-4">{user.bio}</p>
          )}
          {!user.bio && (
            <p className="text-gray-400 text-sm mb-4">自己紹介がまだ設定されていません</p>
          )}
        </div>

        {/* 編集ボタン */}
        <div className="flex flex-col gap-2 items-end">
          <ProfileEditForm user={user} />
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
