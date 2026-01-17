import { ChatRoomList } from '@/components/chat/chat-room-list';
import { Card, CardContent } from '@/components/ui/card';

/**
 * チャットルーム一覧ページ
 */
export default async function ChatPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* ヘッダー */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">チャット</h1>
          </div>

          {/* チャットルーム一覧 */}
          <ChatRoomList />
        </div>
      </div>
    </div>
  );
}
