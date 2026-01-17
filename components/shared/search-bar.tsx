'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

/**
 * 検索バーコンポーネント（Client Component）
 */
export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [keyword, setKeyword] = useState(searchParams.get('q') || '');

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (keyword.trim()) {
        params.set('q', keyword.trim());
      } else {
        params.delete('q');
      }
      // ページをリセット
      params.delete('page');
      router.push(`/?${params.toString()}`);
    });
  };

  const handleClear = () => {
    setKeyword('');
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('q');
      params.delete('page');
      router.push(`/?${params.toString()}`);
    });
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="キーワードで検索..."
          className="pl-10 pr-10"
          disabled={isPending}
        />
        {keyword && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 min-h-[44px] min-w-[44px]"
            onClick={handleClear}
            disabled={isPending}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </form>
  );
}
