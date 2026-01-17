import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/actions/auth';
import { getApplicationById } from '@/lib/db/queries/applications';
import { getMessagesByApplicationId } from '@/lib/db/queries/messages';
import { ChatMessageWrapper } from '@/components/chat/chat-message-wrapper';
import { ChatInput } from '@/components/chat/chat-input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface ChatDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * チャット詳細ページ
 */
export default async function ChatDetailPage({ params }: ChatDetailPageProps) {
  const { id } = await params;

  // 現在のユーザーを取得
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    notFound();
  }

  // 応募を取得
  const application = await getApplicationById(id);
  if (!application) {
    notFound();
  }

  // 認可チェック：応募に関与しているユーザーのみアクセス可能
  const isPostAuthor = application.post.authorId === currentUser.id;
  const isApplicant = application.applicant.id === currentUser.id;

  if (!isPostAuthor && !isApplicant) {
    notFound();
  }

  // 相手の情報を取得
  const otherUser = isPostAuthor ? application.applicant : application.post.author;

  // メッセージを取得（最新から取得、表示時は逆順にする）
  const messages = await getMessagesByApplicationId(id, 100, 0);
  const sortedMessages = [...messages].reverse(); // 古い順に表示

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex flex-col pb-20">
      {/* ヘッダー */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/chat">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <Avatar className="w-10 h-10">
              <AvatarImage src={otherUser.avatarUrl || undefined} alt={otherUser.name} />
              <AvatarFallback>
                {otherUser.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600 font-medium mb-0.5 truncate">
                {application.post.title}
              </p>
              <h2 className="font-semibold text-gray-900 truncate">{otherUser.name}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* メッセージエリア */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            {sortedMessages.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <p>まだメッセージがありません</p>
                <p className="text-sm mt-2">メッセージを送信して会話を始めましょう</p>
              </div>
            ) : (
              <div className="space-y-1">
                {sortedMessages.map((message) => (
                  <ChatMessageWrapper
                    key={message.id}
                    message={message}
                    currentUserId={currentUser.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 入力エリア */}
      <div className="bg-white border-t">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <ChatInput applicationId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}
