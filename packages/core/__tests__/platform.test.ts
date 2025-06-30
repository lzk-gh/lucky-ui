import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockUni } from '../../../tools/test/setup';
import {
  getSystemInfo,
  clearSystemInfoCache,
  getPlatform,
  getPlatformInfo,
  getDeviceInfo,
  canIUse,
  isMobile,
  isDesktop,
  isSpecificMiniProgram,
  isNativeApp,
  isWebEnvironment,
  isHybridApp,
} from '../src/utils/platform';

describe('Platform Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearSystemInfoCache();
  });

  describe('getSystemInfo', () => {
    it('应该返回系统信息', () => {
      const info = getSystemInfo();
      expect(info).toBeDefined();
      expect(info.platform).toBe('android');
      expect(info.system).toBe('Android 10');
      expect(mockUni.getSystemInfoSync).toHaveBeenCalled();
    });

    it('应该缓存系统信息', () => {
      getSystemInfo();
      getSystemInfo();
      // 只调用一次，第二次使用缓存
      expect(mockUni.getSystemInfoSync).toHaveBeenCalledTimes(1);
    });

    it('应该能清除缓存', () => {
      getSystemInfo();
      clearSystemInfoCache();
      getSystemInfo();
      // 清除缓存后应该重新调用
      expect(mockUni.getSystemInfoSync).toHaveBeenCalledTimes(2);
    });
  });

  describe('getPlatform', () => {
    it('应该返回当前平台类型', () => {
      const platform = getPlatform();
      expect(typeof platform).toBe('string');
      expect(platform).not.toBe('');
    });
  });

  describe('getPlatformInfo', () => {
    it('应该返回完整的平台信息', () => {
      const info = getPlatformInfo();
      expect(info).toHaveProperty('vue2');
      expect(info).toHaveProperty('vue3');
      expect(info).toHaveProperty('app');
      expect(info).toHaveProperty('web');
      expect(info).toHaveProperty('mp');
      expect(info).toHaveProperty('current');
      expect(typeof info.vue2).toBe('boolean');
      expect(typeof info.vue3).toBe('boolean');
      expect(typeof info.current).toBe('string');
    });
  });

  describe('getDeviceInfo', () => {
    it('应该返回设备信息', () => {
      const deviceInfo = getDeviceInfo();
      expect(deviceInfo).toEqual({
        brand: 'Xiaomi',
        model: 'Mi 10',
        system: 'Android 10',
        platform: 'android',
        version: '8.0.0',
        SDKVersion: '2.14.1',
        pixelRatio: 3,
        screenWidth: 393,
        screenHeight: 851,
        windowWidth: 393,
        windowHeight: 851,
        statusBarHeight: 44,
        safeArea: expect.any(Object),
        safeAreaInsets: expect.any(Object),
      });
    });
  });

  describe('canIUse', () => {
    it('应该检查API是否可用', () => {
      expect(canIUse('showToast')).toBe(true);
      expect(mockUni.canIUse).toHaveBeenCalledWith('showToast');
    });
  });

  describe('平台组合检测', () => {
    it('isMobile应该检测移动端平台', () => {
      const result = isMobile();
      expect(typeof result).toBe('boolean');
    });

    it('isDesktop应该检测桌面端平台', () => {
      const result = isDesktop();
      expect(typeof result).toBe('boolean');
    });

    it('isSpecificMiniProgram应该检测具体小程序', () => {
      const result = isSpecificMiniProgram();
      expect(typeof result).toBe('boolean');
    });

    it('isNativeApp应该检测原生App', () => {
      const result = isNativeApp();
      expect(typeof result).toBe('boolean');
    });

    it('isWebEnvironment应该检测Web环境', () => {
      const result = isWebEnvironment();
      expect(typeof result).toBe('boolean');
    });

    it('isHybridApp应该检测混合App', () => {
      const result = isHybridApp();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('边界情况测试', () => {
    it('应该处理系统信息获取失败', () => {
      mockUni.getSystemInfoSync.mockImplementationOnce(() => {
        throw new Error('System info error');
      });
      clearSystemInfoCache();

      expect(() => getSystemInfo()).toThrow('System info error');
    });
  });
});
