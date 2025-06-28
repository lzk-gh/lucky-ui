/**
 * 格式化价格
 */
export function formatPrice(
  price: number | string,
  currency: string = '¥',
  decimals: number = 2
): string {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) {
    return `${currency}0.00`;
  }

  return `${currency}${num.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * 格式化时间
 */
export function formatTime(
  time: string | number | Date,
  format: string = 'YYYY-MM-DD HH:mm:ss'
): string {
  const date = new Date(time);
  if (isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 相对时间格式化
 */
export function formatRelativeTime(time: string | number | Date): string {
  const date = new Date(time);
  const now = new Date();

  if (isNaN(date.getTime())) return '';

  const diff = now.getTime() - date.getTime();
  const absDiff = Math.abs(diff);
  const isInPast = diff > 0;

  const minute = 60 * 1000;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;

  if (absDiff < minute) return '刚刚';
  if (absDiff < hour)
    return `${Math.floor(absDiff / minute)}分钟${isInPast ? '前' : '后'}`;
  if (absDiff < day)
    return `${Math.floor(absDiff / hour)}小时${isInPast ? '前' : '后'}`;
  if (absDiff < week)
    return `${Math.floor(absDiff / day)}天${isInPast ? '前' : '后'}`;
  if (absDiff < month)
    return `${Math.floor(absDiff / week)}周${isInPast ? '前' : '后'}`;
  if (absDiff < year)
    return `${Math.floor(absDiff / month)}个月${isInPast ? '前' : '后'}`;
  return `${Math.floor(absDiff / year)}年${isInPast ? '前' : '后'}`;
}
