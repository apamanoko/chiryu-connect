import { getChatRoomsAction } from '@/app/actions/messages/get';
import { getCurrentUser } from '@/lib/actions/auth';
import { ChatRoomCard } from './chat-room-card';
import { EmptyChatRooms } from '@/components/shared/empty-state';

/**
 * チャットルーム一覧コンポーネント（Server Component）
 */
export async function ChatRoomList() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">ログインが必要です</p>
      </div>
    );
  }

  const result = await getChatRoomsAction();

  if (!result.success) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-sm">{result.error}</p>
      </div>
    );
  }

  if (result.data.length === 0) {
    return <EmptyChatRooms />;
  }

  return (
    <div className="space-y-2">
      {result.data.map((room) => (
        <ChatRoomCard key={room.application.id} room={room} currentUserId={currentUser.id} />
      ))}
    </div>
  );
}
