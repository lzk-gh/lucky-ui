import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from '../src/utils/debounce';

describe('Debounce Utils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('应该延迟执行函数', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn();
    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('多次调用时应该取消之前的调用', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    vi.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('应该正确传递参数', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100);

    debouncedFn('arg1', 'arg2');
    vi.advanceTimersByTime(100);

    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('immediate为true时应该立即执行', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100, true);

    debouncedFn();
    expect(mockFn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('立即执行模式下在等待时间内不应该再次执行', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 100, true);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    expect(mockFn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);
    debouncedFn();
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('应该处理零等待时间', () => {
    const mockFn = vi.fn();
    const debouncedFn = debounce(mockFn, 0);

    debouncedFn();
    vi.advanceTimersByTime(0);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});
