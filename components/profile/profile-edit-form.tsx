'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types/user';
import { updateUserProfileAction } from '@/app/actions/users/update';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MAX_LENGTH } from '@/lib/utils/constants';
import { Pencil } from 'lucide-react';

interface ProfileEditFormProps {
  user: User;
}

/**
 * プロフィール編集フォーム（Client Component）
 */
export function ProfileEditForm({ user }: ProfileEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (name.length > MAX_LENGTH.USER_NAME) {
      setError(`名前は${MAX_LENGTH.USER_NAME}文字以内である必要があります`);
      return;
    }

    if (bio.length > MAX_LENGTH.USER_BIO) {
      setError(`自己紹介は${MAX_LENGTH.USER_BIO}文字以内である必要があります`);
      return;
    }

    startTransition(async () => {
      const result = await updateUserProfileAction({
        name: name.trim(),
        bio: bio.trim() || null,
        avatarUrl: avatarUrl.trim() || null,
      });

      if (result.success) {
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  const handleCancel = () => {
    setOpen(false);
    setName(user.name);
    setBio(user.bio || '');
    setAvatarUrl(user.avatarUrl || '');
    setError(null);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline" size="sm">
        <Pencil className="w-4 h-4 mr-2" />
        編集
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>プロフィールを編集</DialogTitle>
            <DialogDescription>
              プロフィール情報を更新できます
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* アバターURL */}
            <div>
              <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700 mb-2">
                アバターURL（任意）
              </label>
              <Input
                id="avatarUrl"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                disabled={isPending}
              />
              <p className="text-xs text-gray-500 mt-1">
                画像のURLを入力してください（Phase 1では画像アップロードは未対応）
              </p>
            </div>

            {/* 名前 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                名前 <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="名前を入力"
                maxLength={MAX_LENGTH.USER_NAME}
                required
                disabled={isPending}
              />
              <div className="mt-1 flex justify-between text-xs text-gray-500">
                <span>{name.length}/{MAX_LENGTH.USER_NAME}文字</span>
              </div>
            </div>

            {/* 自己紹介 */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                自己紹介（任意）
              </label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="自己紹介を入力してください"
                rows={4}
                maxLength={MAX_LENGTH.USER_BIO}
                disabled={isPending}
              />
              <div className="mt-1 flex justify-between text-xs text-gray-500">
                <span>{bio.length}/{MAX_LENGTH.USER_BIO}文字</span>
              </div>
            </div>

            {/* エラーメッセージ */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isPending}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                disabled={isPending || !name.trim() || name.length > MAX_LENGTH.USER_NAME || bio.length > MAX_LENGTH.USER_BIO}
              >
                {isPending ? '保存中...' : '保存'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
