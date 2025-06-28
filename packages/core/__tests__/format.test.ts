import { describe, it, expect } from 'vitest';
import {
  formatPrice,
  formatFileSize,
  formatTime,
  formatRelativeTime,
} from '../src/utils/format';

describe('Format Utils', () => {
  describe('formatPrice', () => {
    it('格式化价格 - number', () => {
      expect(formatPrice(1234.56)).toBe('¥1,234.56');
      expect(formatPrice(0)).toBe('¥0.00');
      expect(formatPrice(999)).toBe('¥999.00');
    });

    it('格式化价格 - string', () => {
      expect(formatPrice('1234.56')).toBe('¥1,234.56');
      expect(formatPrice('0')).toBe('¥0.00');
      expect(formatPrice('999')).toBe('¥999.00');
    });

    it('格式化价格 - 非数字', () => {
      expect(formatPrice('abc')).toBe('¥0.00');
      expect(formatPrice(NaN)).toBe('¥0.00');
    });

    it('格式化价格 - 单位', () => {
      expect(formatPrice(1234.56, '$')).toBe('$1,234.56');
      expect(formatPrice(1234.56, '€')).toBe('€1,234.56');
    });

    it('格式化价格 - 小数位数', () => {
      expect(formatPrice(1234.5678, '¥', 3)).toBe('¥1,234.568');
      expect(formatPrice(1234.5, '¥', 0)).toBe('¥1,235');
    });
  });

  describe('formatFileSize', () => {
    it('格式化文件大小', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(512)).toBe('512 B');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });
  });

  describe('formatTime', () => {
    it('格式化时间 - Date 对象', () => {
      const date = new Date('2023-10-01T12:34:56Z');
      expect(formatTime(date)).toBe('2023-10-01 20:34:56');
    });

    it('格式化时间 - 时间戳', () => {
      const date = new Date(2023, 9, 1, 20, 34, 56); // 本地时间
      const timestamp = date.getTime();
      expect(formatTime(timestamp)).toBe('2023-10-01 20:34:56');
    });

    it('格式化时间 - ISO 字符串', () => {
      expect(formatTime('2023-10-01T12:34:56Z')).toBe('2023-10-01 20:34:56');
    });

    it('格式化时间 - 自定义格式', () => {
      expect(formatTime(new Date(), 'YYYY-MM-DD')).toMatch(
        /^\d{4}-\d{2}-\d{2}$/
      );
      expect(formatTime(new Date(), 'HH:mm:ss')).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });

    it('格式化时间 - 无效日期', () => {
      expect(formatTime('invalid date')).toBe('');
    });
  });

  describe('formatRelativeTime', () => {
    it('相对时间格式化 - 过去的时间', () => {
      const now = new Date();
      expect(formatRelativeTime(new Date(now.getTime() - 1000 * 60 * 5))).toBe(
        '5分钟前'
      );
      expect(formatRelativeTime(new Date(now.getTime() - 1000 * 60 * 60))).toBe(
        '1小时前'
      );
      expect(
        formatRelativeTime(new Date(now.getTime() - 1000 * 60 * 60 * 24))
      ).toBe('1天前');
    });

    it('相对时间格式化 - 将来的时间', () => {
      const now = new Date();
      expect(formatRelativeTime(new Date(now.getTime() + 1000 * 60 * 5))).toBe(
        '5分钟后'
      );
      expect(formatRelativeTime(new Date(now.getTime() + 1000 * 60 * 60))).toBe(
        '1小时后'
      );
      expect(
        formatRelativeTime(new Date(now.getTime() + 1000 * 60 * 60 * 24))
      ).toBe('1天后');
    });

    it('相对时间格式化 - 无效日期', () => {
      expect(formatRelativeTime('invalid date')).toBe('');
    });
  });
});
