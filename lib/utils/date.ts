import { format, formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';

export function formatDateTW(date: Date | string): string {
  return format(new Date(date), 'yyyy/MM/dd HH:mm', { locale: zhTW });
}

export function formatRelative(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: zhTW });
}
