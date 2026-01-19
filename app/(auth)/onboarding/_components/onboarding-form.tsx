'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { updateUserProfileAction } from '@/app/actions/users/update';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MAX_LENGTH } from '@/lib/utils/constants';
import { AvatarCropDialog } from '@/components/profile/avatar-crop-dialog';

export function OnboardingForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cropImageUrlRef = useRef<string | null>(null);

  // トリミング用URLのクリーンアップ
  useEffect(() => {
    return () => {
      if (cropImageUrlRef.current) {
        URL.revokeObjectURL(cropImageUrlRef.current);
      }
    };
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      if (cropImageUrlRef.current) {
        URL.revokeObjectURL(cropImageUrlRef.current);
        cropImageUrlRef.current = null;
      }
      setCropImageUrl(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('画像ファイルを選択してください');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('画像サイズは2MB以下にしてください');
      return;
    }

    // 以前のトリミング用URLをクリーンアップ
    if (cropImageUrlRef.current) {
      URL.revokeObjectURL(cropImageUrlRef.current);
    }

    const objectUrl = URL.createObjectURL(file);
    cropImageUrlRef.current = objectUrl;
    setCropImageUrl(objectUrl);
    setIsCropOpen(true);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await updateUserProfileAction({
        name,
        bio: bio || null,
        // avatarUrlはすでにトリミング済み（data URL）または空文字
        avatarUrl: avatarUrl || null,
      });

      if (result.success) {
        router.push('/');
        router.refresh();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('プロフィールの設定に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* トリミングダイアログ */}
      <AvatarCropDialog
        open={isCropOpen}
        imageSrc={cropImageUrl}
        onClose={() => {
          setIsCropOpen(false);
        }}
        onCropped={(croppedDataUrl) => {
          // トリミング結果をプレビュー＆保存用URLとして保持
          setAvatarUrl(croppedDataUrl);
          setPreviewUrl(croppedDataUrl);
          setIsCropOpen(false);
          if (cropImageUrlRef.current) {
            URL.revokeObjectURL(cropImageUrlRef.current);
            cropImageUrlRef.current = null;
          }
          setCropImageUrl(null);
        }}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* アバター設定 */}
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="w-24 h-24">
            <AvatarImage src={previewUrl || avatarUrl || undefined} alt={name || 'ユーザー'} />
            <AvatarFallback className="text-2xl">
              {name ? name.charAt(0).toUpperCase() : '?'}
            </AvatarFallback>
          </Avatar>
          <div className="w-full">
            <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-2">
              プロフィール画像（任意）
            </label>
            <Input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="w-full"
            />
            <p className="mt-1 text-xs text-gray-500">
              画像を選択すると、トリミング画面が表示されます（最大2MB）
            </p>
          </div>
        </div>

        {/* 名前 */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            名前 <span className="text-red-500">*</span>
          </label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="山田 太郎"
            required
            maxLength={MAX_LENGTH.USER_NAME}
            className="w-full"
          />
          <p className="mt-1 text-xs text-gray-500">
            {name.length}/{MAX_LENGTH.USER_NAME}文字
          </p>
        </div>

        {/* 自己紹介 */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
            自己紹介 <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="自己紹介を入力してください..."
            rows={4}
            maxLength={MAX_LENGTH.USER_BIO}
            required
            className="w-full resize-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            {bio.length}/{MAX_LENGTH.USER_BIO}文字
          </p>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* 送信ボタン */}
        <Button
          type="submit"
          disabled={!name.trim() || !bio.trim() || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? '設定中...' : 'プロフィールを設定'}
        </Button>
      </form>
    </>
  );
}
