'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FilterModal } from './filter-modal';
import { Badge } from '@/components/ui/badge';
import { Filter } from 'lucide-react';
import type { Tag } from '@/lib/types/tag';

interface FilterButtonProps {
  tags: Tag[];
}

/**
 * フィルタボタンコンポーネント（Client Component）
 */
export function FilterButton({ tags }: FilterButtonProps) {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();

  // アクティブなフィルタの数をカウント
  const activeFilterCount = [
    searchParams.get('tags'),
    searchParams.get('location'),
    searchParams.get('startDate'),
    searchParams.get('endDate'),
  ].filter(Boolean).length;

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="relative"
      >
        <Filter className="w-4 h-4 mr-2" />
        フィルタ
        {activeFilterCount > 0 && (
          <Badge
            variant="default"
            className="ml-2 bg-orange-500 text-white"
          >
            {activeFilterCount}
          </Badge>
        )}
      </Button>
      <FilterModal
        tags={tags}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
