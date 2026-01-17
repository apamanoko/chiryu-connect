import type { PostWithAuthorAndTags } from '@/lib/types/post';
import { formatDateRange, formatRewardAmount, formatParticipants } from '@/lib/utils/format';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin, Users, DollarSign, Tag as TagIcon } from 'lucide-react';

interface PostDetailProps {
  post: PostWithAuthorAndTags;
}

/**
 * 募集詳細表示コンポーネント（Server Component）
 */
export function PostDetail({ post }: PostDetailProps) {
  return (
    <div className="space-y-6">
      {/* タイトル */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
        
        {/* タグ */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="text-sm"
                style={{
                  backgroundColor: tag.color ? `${tag.color}20` : undefined,
                  color: tag.color || undefined,
                }}
              >
                <TagIcon className="w-3 h-3 mr-1" />
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* 募集者情報カード */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={post.author.avatarUrl || undefined} alt={post.author.name} />
              <AvatarFallback className="text-xl">
                {post.author.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 mb-1">
                {post.author.name}
              </h3>
              {post.author.bio && (
                <p className="text-sm text-gray-600 line-clamp-3">{post.author.bio}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 活動詳細セクション */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">活動詳細</h2>
          
          {/* 活動日時 */}
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-600 mb-1">活動日時</p>
              <p className="text-base text-gray-900">
                {formatDateRange(post.activityDate, post.activityEndDate)}
              </p>
            </div>
          </div>

          {/* 活動場所 */}
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-600 mb-1">活動場所</p>
              <p className="text-base text-gray-900">{post.location}</p>
            </div>
          </div>

          {/* 募集人数 */}
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-600 mb-1">募集人数</p>
              <p className="text-base text-gray-900">
                {formatParticipants(post.currentParticipants, post.maxParticipants)}
              </p>
            </div>
          </div>

          {/* 謝礼 */}
          <div className="flex items-start gap-3">
            <DollarSign className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-600 mb-1">謝礼</p>
              <p className="text-base text-gray-900">
                {formatRewardAmount(post.rewardAmount)}
              </p>
              {post.rewardDescription && (
                <p className="text-sm text-gray-600 mt-1">{post.rewardDescription}</p>
              )}
            </div>
          </div>

          {/* 必要なスキル */}
          {post.requiredSkills && (
            <div className="flex items-start gap-3">
              <TagIcon className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600 mb-1">必要なスキル・経験</p>
                <p className="text-base text-gray-900">{post.requiredSkills}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 説明文 */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">詳細説明</h2>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{post.description}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
