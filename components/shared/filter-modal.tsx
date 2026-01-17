'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { Tag } from '@/lib/types/tag';
import { X, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface FilterModalProps {
  tags: Tag[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * フィルタモーダルコンポーネント（Client Component）
 */
export function FilterModal({ tags, open, onOpenChange }: FilterModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // URLパラメータから現在のフィルタ状態を取得
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    searchParams.get('tags')?.split(',').filter(Boolean) || []
  );
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [startDate, setStartDate] = useState(
    searchParams.get('startDate') || ''
  );
  const [endDate, setEndDate] = useState(
    searchParams.get('endDate') || ''
  );

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleApply = () => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      // タグフィルタ
      if (selectedTagIds.length > 0) {
        params.set('tags', selectedTagIds.join(','));
      } else {
        params.delete('tags');
      }

      // 地域フィルタ
      if (location.trim()) {
        params.set('location', location.trim());
      } else {
        params.delete('location');
      }

      // 日付範囲フィルタ
      if (startDate) {
        params.set('startDate', startDate);
      } else {
        params.delete('startDate');
      }

      if (endDate) {
        params.set('endDate', endDate);
      } else {
        params.delete('endDate');
      }

      // ページをリセット
      params.delete('page');
      
      router.push(`/?${params.toString()}`);
      onOpenChange(false);
    });
  };

  const handleClear = () => {
    setSelectedTagIds([]);
    setLocation('');
    setStartDate('');
    setEndDate('');
    
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('tags');
      params.delete('location');
      params.delete('startDate');
      params.delete('endDate');
      params.delete('page');
      router.push(`/?${params.toString()}`);
      onOpenChange(false);
    });
  };

  const hasActiveFilters =
    selectedTagIds.length > 0 || location.trim() || startDate || endDate;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>フィルタ</DialogTitle>
            <DialogDescription>
              条件を指定して募集を絞り込みます
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* タグフィルタ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                タグ
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={selectedTagIds.includes(tag.id) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => handleTagToggle(tag.id)}
                    style={{
                      backgroundColor: selectedTagIds.includes(tag.id)
                        ? tag.color || undefined
                        : undefined,
                      color: selectedTagIds.includes(tag.id) ? 'white' : undefined,
                    }}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 地域フィルタ */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                地域
              </label>
              <Input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="例: 知立市"
                disabled={isPending}
              />
            </div>

            {/* 日付範囲フィルタ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                活動日時
              </label>
              <div className="space-y-2">
                <div>
                  <label htmlFor="startDate" className="block text-xs text-gray-600 mb-1">
                    開始日
                  </label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={isPending}
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-xs text-gray-600 mb-1">
                    終了日
                  </label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={isPending}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              disabled={isPending || !hasActiveFilters}
              className="w-full sm:w-auto"
            >
              クリア
            </Button>
            <Button
              type="button"
              onClick={handleApply}
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              適用
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
