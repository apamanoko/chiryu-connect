'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createPostAction } from '@/app/actions/posts/create';
import { updatePostAction } from '@/app/actions/posts/update';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { MAX_LENGTH, NUMERIC_LIMITS } from '@/lib/utils/constants';
import type { Tag } from '@/lib/types/tag';
import { Calendar, Clock, MapPin, Users, Tag as TagIcon, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { DateTimePicker } from '@/components/shared/datetime-picker';

interface PostFormProps {
  tags: Tag[];
  postId?: string;
  initialData?: {
    title: string;
    description: string;
    activityDate: Date | string;
    activityEndDate: Date | string | null;
    location: string;
    maxParticipants: number;
    requiredSkills: string | null;
    rewardAmount: number | null;
    rewardDescription: string | null;
    tagIds: string[];
  };
}

/**
 * 投稿フォームコンポーネント（Client Component）
 * 新規作成と編集の両方に対応
 */
export function PostForm({ tags, postId, initialData }: PostFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isEditMode = !!postId;

  // フォーム状態（初期データがある場合はそれを使用）
  // DateオブジェクトはServer ComponentからClient Componentに渡される際にISO文字列にシリアライズされるため、変換が必要
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [activityDate, setActivityDate] = useState<Date | null>(() => {
    if (!initialData?.activityDate) return null;
    return typeof initialData.activityDate === 'string'
      ? new Date(initialData.activityDate)
      : initialData.activityDate;
  });
  const [activityEndDate, setActivityEndDate] = useState<Date | null>(() => {
    if (!initialData?.activityEndDate) return null;
    return typeof initialData.activityEndDate === 'string'
      ? new Date(initialData.activityEndDate)
      : initialData.activityEndDate;
  });
  const [location, setLocation] = useState(initialData?.location || '');
  const [maxParticipants, setMaxParticipants] = useState(initialData?.maxParticipants || 1);
  const [requiredSkills, setRequiredSkills] = useState(initialData?.requiredSkills || '');
  const [hasReward, setHasReward] = useState(!!initialData?.rewardAmount);
  const [rewardAmount, setRewardAmount] = useState<number | null>(initialData?.rewardAmount || null);
  const [rewardDescription, setRewardDescription] = useState(initialData?.rewardDescription || '');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initialData?.tagIds || []);

  // バリデーション
  const titleError = title.length > MAX_LENGTH.POST_TITLE ? `タイトルは${MAX_LENGTH.POST_TITLE}文字以内である必要があります` : null;
  const descriptionError = description.length > MAX_LENGTH.POST_DESCRIPTION ? `説明は${MAX_LENGTH.POST_DESCRIPTION}文字以内である必要があります` : null;
  const locationError = location.length > MAX_LENGTH.POST_LOCATION ? `活動場所は${MAX_LENGTH.POST_LOCATION}文字以内である必要があります` : null;
  const requiredSkillsError = requiredSkills.length > MAX_LENGTH.POST_REQUIRED_SKILLS ? `必要なスキルは${MAX_LENGTH.POST_REQUIRED_SKILLS}文字以内である必要があります` : null;
  const rewardDescriptionError = rewardDescription.length > MAX_LENGTH.POST_REWARD_DESCRIPTION ? `謝礼説明は${MAX_LENGTH.POST_REWARD_DESCRIPTION}文字以内である必要があります` : null;

  // 編集モードでは過去の日付も有効、新規作成モードでは未来の日付のみ有効
  const isActivityDateValid = activityDate !== null && (
    isEditMode || activityDate > new Date()
  );

  const isFormValid =
    title.trim().length > 0 &&
    title.trim().length <= MAX_LENGTH.POST_TITLE &&
    description.trim().length > 0 &&
    description.trim().length <= MAX_LENGTH.POST_DESCRIPTION &&
    isActivityDateValid &&
    location.trim().length > 0 &&
    location.trim().length <= MAX_LENGTH.POST_LOCATION &&
    maxParticipants >= NUMERIC_LIMITS.POST_MAX_PARTICIPANTS_MIN &&
    maxParticipants <= NUMERIC_LIMITS.POST_MAX_PARTICIPANTS_MAX &&
    (!activityEndDate || activityEndDate > activityDate) &&
    (!hasReward || (rewardAmount !== null && rewardAmount >= NUMERIC_LIMITS.POST_REWARD_AMOUNT_MIN)) &&
    (!requiredSkills || requiredSkills.length <= MAX_LENGTH.POST_REQUIRED_SKILLS) &&
    (!rewardDescription || rewardDescription.length <= MAX_LENGTH.POST_REWARD_DESCRIPTION);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!isFormValid) {
      setError('入力内容を確認してください');
      return;
    }

    startTransition(async () => {
      if (isEditMode && postId) {
        // 編集モード
        const result = await updatePostAction(postId, {
          title: title.trim(),
          description: description.trim(),
          activityDate: activityDate!,
          activityEndDate: activityEndDate || null,
          location: location.trim(),
          maxParticipants,
          requiredSkills: requiredSkills.trim() || null,
          rewardAmount: hasReward ? rewardAmount : null,
          rewardDescription: hasReward && rewardDescription.trim() ? rewardDescription.trim() : null,
          tagIds: selectedTagIds,
        });

        if (result.success) {
          addToast({
            type: 'success',
            title: '投稿を更新しました',
            description: '募集が正常に更新されました。',
          });
          router.push(`/posts/${postId}`);
          router.refresh();
        } else {
          setError(result.error);
          addToast({
            type: 'error',
            title: '投稿の更新に失敗しました',
            description: result.error,
          });
        }
      } else {
        // 新規作成モード
        const result = await createPostAction({
          title: title.trim(),
          description: description.trim(),
          activityDate: activityDate!,
          activityEndDate: activityEndDate || null,
          location: location.trim(),
          maxParticipants,
          requiredSkills: requiredSkills.trim() || null,
          rewardAmount: hasReward ? rewardAmount : null,
          rewardDescription: hasReward && rewardDescription.trim() ? rewardDescription.trim() : null,
          tagIds: selectedTagIds,
        });

        if (result.success) {
          addToast({
            type: 'success',
            title: '投稿を作成しました',
            description: '募集が正常に作成されました。',
          });
          router.push(`/posts/${result.data.id}`);
          router.refresh();
        } else {
          setError(result.error);
          addToast({
            type: 'error',
            title: '投稿の作成に失敗しました',
            description: result.error,
          });
        }
      }
    });
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* タイトル */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          タイトル <span className="text-red-500">*</span>
        </label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="募集タイトルを入力してください"
          required
          maxLength={MAX_LENGTH.POST_TITLE}
          className={titleError ? 'border-red-500' : ''}
        />
        <div className="mt-1 flex justify-between text-xs">
          <span className={titleError ? 'text-red-500' : 'text-gray-500'}>
            {titleError || `${title.length}/${MAX_LENGTH.POST_TITLE}文字`}
          </span>
        </div>
      </div>

      {/* 活動日時 */}
      <div className="space-y-4">
        <DateTimePicker
          value={activityDate}
          onChange={(date) => {
            setActivityDate(date);
            if (date && activityEndDate && activityEndDate <= date) {
              setActivityEndDate(null);
            }
          }}
          label="活動開始日時"
          required
          minDate={isEditMode ? undefined : new Date()}
          error={!isActivityDateValid ? '活動開始日時を正しく選択してください' : undefined}
        />
        <DateTimePicker
          value={activityEndDate}
          onChange={(date) => setActivityEndDate(date)}
          label="活動終了日時（任意）"
          minDate={activityDate || undefined}
          disabled={!activityDate}
          error={
            activityEndDate && activityEndDate <= (activityDate || new Date())
              ? '終了日時は開始日時より後である必要があります'
              : undefined
          }
        />
      </div>

      {/* 活動場所 */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
          活動場所 <span className="text-red-500">*</span>
        </label>
        <Input
          id="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="活動場所を入力してください"
          required
          maxLength={MAX_LENGTH.POST_LOCATION}
          className={locationError ? 'border-red-500' : ''}
        />
        <div className="mt-1 flex justify-between text-xs">
          <span className={locationError ? 'text-red-500' : 'text-gray-500'}>
            {locationError || `${location.length}/${MAX_LENGTH.POST_LOCATION}文字`}
          </span>
        </div>
      </div>

      {/* 募集人数 */}
      <div>
        <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-2">
          募集人数 <span className="text-red-500">*</span>
        </label>
        <Input
          id="maxParticipants"
          type="number"
          value={maxParticipants}
          onChange={(e) => {
            const value = parseInt(e.target.value, 10);
            if (!isNaN(value)) {
              setMaxParticipants(Math.max(NUMERIC_LIMITS.POST_MAX_PARTICIPANTS_MIN, Math.min(NUMERIC_LIMITS.POST_MAX_PARTICIPANTS_MAX, value)));
            }
          }}
          min={NUMERIC_LIMITS.POST_MAX_PARTICIPANTS_MIN}
          max={NUMERIC_LIMITS.POST_MAX_PARTICIPANTS_MAX}
          required
        />
        <p className="mt-1 text-xs text-gray-500">
          {NUMERIC_LIMITS.POST_MAX_PARTICIPANTS_MIN}〜{NUMERIC_LIMITS.POST_MAX_PARTICIPANTS_MAX}人
        </p>
      </div>

      {/* 詳細説明 */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          詳細説明 <span className="text-red-500">*</span>
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="募集の詳細を入力してください"
          required
          rows={8}
          maxLength={MAX_LENGTH.POST_DESCRIPTION}
          className={descriptionError ? 'border-red-500' : ''}
        />
        <div className="mt-1 flex justify-between text-xs">
          <span className={descriptionError ? 'text-red-500' : 'text-gray-500'}>
            {descriptionError || `${description.length}/${MAX_LENGTH.POST_DESCRIPTION}文字`}
          </span>
        </div>
      </div>

      {/* タグ選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          タグ（任意、最大5つ）
        </label>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => {
            const isSelected = selectedTagIds.includes(tag.id);
            return (
              <Badge
                key={tag.id}
                variant={isSelected ? 'default' : 'outline'}
                className="cursor-pointer"
                style={
                  isSelected && tag.color
                    ? {
                        backgroundColor: tag.color,
                        color: 'white',
                      }
                    : undefined
                }
                onClick={() => {
                  if (isSelected || selectedTagIds.length < 5) {
                    toggleTag(tag.id);
                  }
                }}
              >
                {tag.name}
              </Badge>
            );
          })}
        </div>
        <p className="mt-1 text-xs text-gray-500">
          {selectedTagIds.length}/5個選択中
        </p>
      </div>

      {/* 必要なスキル・経験 */}
      <div>
        <label htmlFor="requiredSkills" className="block text-sm font-medium text-gray-700 mb-2">
          必要なスキル・経験（任意）
        </label>
        <Textarea
          id="requiredSkills"
          value={requiredSkills}
          onChange={(e) => setRequiredSkills(e.target.value)}
          placeholder="必要なスキルや経験を入力してください"
          rows={3}
          maxLength={MAX_LENGTH.POST_REQUIRED_SKILLS}
          className={requiredSkillsError ? 'border-red-500' : ''}
        />
        <div className="mt-1 flex justify-between text-xs">
          <span className={requiredSkillsError ? 'text-red-500' : 'text-gray-500'}>
            {requiredSkillsError || `${requiredSkills.length}/${MAX_LENGTH.POST_REQUIRED_SKILLS}文字`}
          </span>
        </div>
      </div>

      {/* 謝礼 */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              謝礼（任意）
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="hasReward"
                  checked={!hasReward}
                  onChange={() => {
                    setHasReward(false);
                    setRewardAmount(null);
                    setRewardDescription('');
                  }}
                />
                <span>なし</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="hasReward"
                  checked={hasReward}
                  onChange={() => setHasReward(true)}
                />
                <span>あり</span>
              </label>
            </div>
          </div>

          {hasReward && (
            <>
              <div>
                <label htmlFor="rewardAmount" className="block text-sm font-medium text-gray-700 mb-2">
                  謝礼金額（円）
                </label>
                <Input
                  id="rewardAmount"
                  type="number"
                  value={rewardAmount || ''}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    setRewardAmount(isNaN(value) ? null : Math.max(0, value));
                  }}
                  min={NUMERIC_LIMITS.POST_REWARD_AMOUNT_MIN}
                  placeholder="0"
                />
              </div>
              <div>
                <label htmlFor="rewardDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  謝礼の説明（任意）
                </label>
                <Input
                  id="rewardDescription"
                  type="text"
                  value={rewardDescription}
                  onChange={(e) => setRewardDescription(e.target.value)}
                  placeholder="謝礼の詳細を入力してください"
                  maxLength={MAX_LENGTH.POST_REWARD_DESCRIPTION}
                  className={rewardDescriptionError ? 'border-red-500' : ''}
                />
                <div className="mt-1 flex justify-between text-xs">
                  <span className={rewardDescriptionError ? 'text-red-500' : 'text-gray-500'}>
                    {rewardDescriptionError || `${rewardDescription.length}/${MAX_LENGTH.POST_REWARD_DESCRIPTION}文字`}
                  </span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* エラーメッセージ */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* 送信ボタン */}
      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={!isFormValid || isPending}
          className="flex-1"
        >
          {isPending ? (isEditMode ? '更新中...' : '投稿中...') : (isEditMode ? '更新する' : '投稿する')}
        </Button>
      </div>
    </form>
  );
}
