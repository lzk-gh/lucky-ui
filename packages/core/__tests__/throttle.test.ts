import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { throttle } from '../src/utils/throttle';

describe('Throttle Utils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('应该立即执行第一次调用', () => {
    const mockFn = vi.fn();
    const throttledFn = throttle(mockFn, 100);

    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('应该在等待时间内限制函数执行', () => {
    const mockFn = vi.fn();
    const throttledFn = throttle(mockFn, 100);

    throttledFn();
    throttledFn();
    throttledFn();

    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('应该在等待时间结束后执行最后一次调用', () => {
    const mockFn = vi.fn();
    const throttledFn = throttle(mockFn, 100);

    throttledFn();
    throttledFn();
    throttledFn();

    expect(mockFn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('应该正确传递参数', () => {
    const mockFn = vi.fn();
    const throttledFn = throttle(mockFn, 100);

    throttledFn('arg1', 'arg2');
    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');

    throttledFn('arg3', 'arg4');
    vi.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenLastCalledWith('arg3', 'arg4');
  });

  it('leading为false时不应该立即执行', () => {
    const mockFn = vi.fn();
    const throttledFn = throttle(mockFn, 100, false);

    throttledFn();
    expect(mockFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('trailing为false时不应该在结束时执行', () => {
    const mockFn = vi.fn();
    const throttledFn = throttle(mockFn, 100, true, false);

    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(1);

    throttledFn();
    throttledFn();
    vi.advanceTimersByTime(100);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('leading和trailing都为false时不应该执行', () => {
    const mockFn = vi.fn();
    const throttledFn = throttle(mockFn, 100, false, false);

    throttledFn();
    throttledFn();
    vi.advanceTimersByTime(100);
    expect(mockFn).not.toHaveBeenCalled();
  });

  it('应该处理零等待时间', () => {
    const mockFn = vi.fn();
    const throttledFn = throttle(mockFn, 0);

    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(0);
    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('应该在多个时间窗口内正确工作', () => {
    const mockFn = vi.fn();
    const throttledFn = throttle(mockFn, 100);

    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(50);
    throttledFn();

    expect(mockFn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(50);
    expect(mockFn).toHaveBeenCalledTimes(2);

    vi.advanceTimersByTime(50);
    throttledFn();

    expect(mockFn).toHaveBeenCalledTimes(2);

    vi.advanceTimersByTime(50);
    expect(mockFn).toHaveBeenCalledTimes(3);
  });
});
