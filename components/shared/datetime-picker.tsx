'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateTimePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  label: string;
  required?: boolean;
  minDate?: Date;
  disabled?: boolean;
  error?: string;
}

/**
 * Googleカレンダー風の日時選択コンポーネント
 * カレンダーで日付を選択し、時間をドロップダウンで選択
 */
export function DateTimePicker({
  value,
  onChange,
  label,
  required = false,
  minDate,
  disabled = false,
  error,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(value);
  const [selectedHour, setSelectedHour] = useState<number>(value ? value.getHours() : 9);
  const [selectedMinute, setSelectedMinute] = useState<number>(value ? value.getMinutes() : 0);

  // 値が変更されたときに内部状態を更新
  useEffect(() => {
    if (value) {
      setSelectedDate(value);
      setSelectedHour(value.getHours());
      setSelectedMinute(value.getMinutes());
    } else {
      setSelectedDate(null);
      setSelectedHour(9);
      setSelectedMinute(0);
    }
  }, [value]);

  // 時間オプションを生成（0-23時、0-59分、15分刻み）
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 4 }, (_, i) => i * 15); // 0, 15, 30, 45分

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // 既存の時間を保持して新しい日付を設定
      const newDate = new Date(date);
      newDate.setHours(selectedHour, selectedMinute, 0, 0);
      setSelectedDate(newDate);
    } else {
      setSelectedDate(null);
    }
  };

  const handleHourChange = (hour: number) => {
    setSelectedHour(hour);
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setHours(hour, selectedMinute, 0, 0);
      setSelectedDate(newDate);
    }
  };

  const handleMinuteChange = (minute: number) => {
    setSelectedMinute(minute);
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setHours(selectedHour, minute, 0, 0);
      setSelectedDate(newDate);
    }
  };

  const handleConfirm = () => {
    if (selectedDate) {
      onChange(selectedDate);
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setSelectedDate(null);
    setSelectedHour(9);
    setSelectedMinute(0);
    onChange(null);
  };

  // 表示用のフォーマット（日本語ロケール）
  const displayValue = value
    ? format(value, 'yyyy年M月d日(E) HH:mm', { locale: ja })
    : '';

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              'w-full justify-start text-left font-normal min-h-[44px]',
              !value && 'text-muted-foreground',
              error && 'border-red-500'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayValue || '日時を選択してください'}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] p-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle>{label}</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6 space-y-6">
            {/* カレンダー */}
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate || undefined}
                onSelect={handleDateSelect}
                disabled={(date) => {
                  if (minDate) {
                    const minDateOnly = new Date(minDate);
                    minDateOnly.setHours(0, 0, 0, 0);
                    const dateOnly = new Date(date);
                    dateOnly.setHours(0, 0, 0, 0);
                    return dateOnly < minDateOnly;
                  }
                  return false;
                }}
                className="rounded-md border"
              />
            </div>

            {/* 時間選択 */}
            {selectedDate && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Clock className="h-4 w-4" />
                  <span>時間を選択</span>
                </div>
                <div className="flex items-center gap-3">
                  {/* 時 */}
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">時</label>
                    <select
                      value={selectedHour}
                      onChange={(e) => handleHourChange(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      {hours.map((hour) => (
                        <option key={hour} value={hour}>
                          {String(hour).padStart(2, '0')}時
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 分 */}
                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">分</label>
                    <select
                      value={selectedMinute}
                      onChange={(e) => handleMinuteChange(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      {minutes.map((minute) => (
                        <option key={minute} value={minute}>
                          {String(minute).padStart(2, '0')}分
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* アクションボタン */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                className="flex-1"
              >
                クリア
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={!selectedDate}
                className="flex-1"
              >
                確定
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
