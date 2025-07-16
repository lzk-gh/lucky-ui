/**
 * 防抖函数
 * @param func - 要防抖的函数
 * @param wait - 等待时间，单位为毫秒
 * @param immediate - 是否立即执行
 * @return 返回一个新的函数 - 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null;

  return function (this: void, ...args: Parameters<T>) {
    const context = this;

    if (timeout) clearTimeout(timeout);

    if (immediate && !timeout) {
      func.apply(context, args);
    }

    timeout = setTimeout(() => {
      if (!immediate) {
        func.apply(context, args);
      }
      timeout = null;
    }, wait);
  };
}
