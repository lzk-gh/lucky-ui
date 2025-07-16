/**
 * 节流函数
 * @param func 要节流的函数
 * @param wait 等待时间（毫秒）
 * @param leading 是否在开始时立即执行（可选，默认为 true）
 * @param trailing 是否在结束时执行（可选，默认为 true）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  leading: boolean = true,
  trailing: boolean = true
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null;
  let lastArgs: Parameters<T> | null;
  let lastContext: any;

  const later = () => {
    if (trailing && lastArgs) {
      func.apply(lastContext, lastArgs);
      lastArgs = null;
      lastContext = null;
      timeout = setTimeout(later, wait);
    } else {
      timeout = null;
    }
  };

  return function (this: any, ...args: Parameters<T>): void {
    const context = this;

    if (!timeout && leading) {
      func.apply(context, args);
      timeout = setTimeout(later, wait);
    } else {
      lastArgs = args;
      lastContext = context;

      if (!timeout) {
        timeout = setTimeout(later, wait);
      }
    }
  };
}
