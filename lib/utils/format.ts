import { format, formatDistanceToNow, isToday, isYesterday, isThisYear } from 'date-fns';
import { ja } from 'date-fns/locale';

/**
 * 日付をフォーマット（相対時間表示）
 * 例: "2時間前", "3日前", "2024年1月1日"
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  try {
    // 今日の場合
    if (isToday(dateObj)) {
      return formatDistanceToNow(dateObj, { addSuffix: true, locale: ja });
    }
    
    // 昨日の場合
    if (isYesterday(dateObj)) {
      return '昨日';
    }
    
    // 今年の場合
    if (isThisYear(dateObj)) {
      return format(dateObj, 'M月d日', { locale: ja });
    }
    
    // それ以外
    return format(dateObj, 'yyyy年M月d日', { locale: ja });
  } catch (error) {
    return '日付が無効です';
  }
}

/**
 * 日付と時刻をフォーマット
 * 例: "2024年1月1日 10:00"
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  try {
    return format(dateObj, 'yyyy年M月d日 HH:mm', { locale: ja });
  } catch (error) {
    return '日付が無効です';
  }
}

/**
 * 日付のみをフォーマット
 * 例: "2024年1月1日"
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  try {
    return format(dateObj, 'yyyy年M月d日', { locale: ja });
  } catch (error) {
    return '日付が無効です';
  }
}

/**
 * 日付範囲をフォーマット
 * 例: "2024年1月1日 10:00 - 14:00"
 */
export function formatDateRange(
  startDate: Date | string,
  endDate: Date | string | null | undefined
): string {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  
  if (!endDate) {
    return formatDateTime(start);
  }
  
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  try {
    const startFormatted = format(start, 'yyyy年M月d日 HH:mm', { locale: ja });
    const endFormatted = format(end, 'HH:mm', { locale: ja });
    
    // 同じ日の場合
    if (format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd')) {
      return `${startFormatted} - ${endFormatted}`;
    }
    
    // 異なる日の場合
    const endFormattedFull = format(end, 'yyyy年M月d日 HH:mm', { locale: ja });
    return `${startFormatted} - ${endFormattedFull}`;
  } catch (error) {
    return '日付が無効です';
  }
}

/**
 * 金額をフォーマット
 * 例: "1,000円", "謝礼なし"
 */
export function formatRewardAmount(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || amount === 0) {
    return '謝礼なし';
  }
  
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(amount);
}

/**
 * 人数をフォーマット
 * 例: "3/5人"
 */
export function formatParticipants(current: number, max: number): string {
  return `${current}/${max}人`;
}
