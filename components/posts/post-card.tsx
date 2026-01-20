import type { PostWithAuthor } from '@/lib/types/post';
import type { Tag } from '@/lib/types/tag';
import { formatDateTime, formatRelativeTime, formatParticipants } from '@/lib/utils/format';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Calendar, MapPin, Users, Clock, Heart } from 'lucide-react';
import { PostCardClient } from './post-card-client';
import { FavoriteButton } from '@/components/posts/favorite-button';

interface PostCardProps {
  post: PostWithAuthor;
  tags: Tag[];
  initialIsFavorite?: boolean;
}

/**
 * 募集カードコンポーネント（Server Component）
 */
export function PostCard({ post, tags, initialIsFavorite = false }: PostCardProps) {
  // 最大3つのタグを表示、それ以上は「+N」で表示
  const displayTags = tags.slice(0, 3);
  const remainingTagsCount = tags.length - 3;

  return (
    <PostCardClient postId={post.id}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer relative">
        <div className="p-4 space-y-3">
          {/* タイトル + お気に入りボタン */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
              {post.title}
            </h3>
            {/* お気に入りボタン（小さめアイコン表示） */}
            <div className="flex-shrink-0">
              <FavoriteButton postId={post.id} initialIsFavorite={initialIsFavorite} />
            </div>
          </div>

          {/* タグ */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {displayTags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="text-xs"
                  style={{
                    backgroundColor: tag.color ? `${tag.color}20` : undefined,
                    color: tag.color || undefined,
                  }}
                >
                  {tag.name}
                </Badge>
              ))}
              {remainingTagsCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  +{remainingTagsCount}
                </Badge>
              )}
            </div>
          )}

          {/* 募集者情報 */}
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={post.author.avatarUrl || undefined} alt={post.author.name} />
              <AvatarFallback className="text-xs">
                {post.author.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-600">{post.author.name}</span>
          </div>

          {/* 活動日時 */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{formatDateTime(post.activityDate)}</span>
          </div>

          {/* 活動場所 */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span className="line-clamp-1">{post.location}</span>
          </div>

          {/* 募集人数 */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{formatParticipants(post.currentParticipants, post.maxParticipants)}</span>
          </div>

          {/* 投稿日時（相対時間） */}
          <div className="flex items-center gap-2 text-sm text-gray-500 pt-2 border-t">
            <Clock className="w-4 h-4" />
            <span>{formatRelativeTime(post.createdAt)}</span>
          </div>
        </div>
      </Card>
    </PostCardClient>
  );
}
