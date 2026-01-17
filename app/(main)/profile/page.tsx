import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/auth';
import { ProfileHeader } from '@/components/profile/profile-header';
import { UserPostList } from '@/components/posts/user-post-list';
import { UserApplicationList } from '@/components/applications/user-application-list';
import { ChatRoomList } from '@/components/chat/chat-room-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

/**
 * マイページ
 */
export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* プロフィールヘッダー */}
          <ProfileHeader />

          {/* タブナビゲーション */}
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="posts">投稿した募集</TabsTrigger>
              <TabsTrigger value="applications">応募した募集</TabsTrigger>
              <TabsTrigger value="chat">チャット</TabsTrigger>
            </TabsList>

            {/* 投稿した募集タブ */}
            <TabsContent value="posts" className="space-y-4">
              <UserPostList authorId={user.id} statusFilter="all" />
            </TabsContent>

            {/* 応募した募集タブ */}
            <TabsContent value="applications" className="space-y-4">
              <UserApplicationList applicantId={user.id} statusFilter="all" />
            </TabsContent>

            {/* チャットタブ */}
            <TabsContent value="chat">
              <ChatRoomList />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
