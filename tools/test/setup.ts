import { vi, beforeEach, afterEach } from 'vitest';

// Mock 存储数据
const mockStorage: Record<string, any> = {};

// Mock 系统信息
const mockSystemInfo = {
  platform: 'android',
  system: 'Android 10',
  version: '8.0.0',
  SDKVersion: '2.14.1',
  brand: 'Xiaomi',
  model: 'Mi 10',
  pixelRatio: 3,
  screenWidth: 393,
  screenHeight: 851,
  windowWidth: 393,
  windowHeight: 851,
  statusBarHeight: 44,
  safeArea: {
    left: 0,
    right: 393,
    top: 44,
    bottom: 851,
    width: 393,
    height: 807,
  },
  safeAreaInsets: {
    top: 44,
    left: 0,
    right: 0,
    bottom: 0,
  },
};

// Mock uni 全局对象
const mockUni = {
  // 系统信息相关
  getSystemInfoSync: vi.fn(() => ({ ...mockSystemInfo })),
  getSystemInfo: vi.fn((options: any) => {
    setTimeout(() => options.success?.(mockSystemInfo), 0);
  }),

  // 存储相关 API
  setStorage: vi.fn((options: any) => {
    const { key, data, success, fail: _fail } = options;
    try {
      mockStorage[key] = data;
      setTimeout(() => success?.(), 0);
    } catch (error) {
      setTimeout(() => _fail?.(error), 0);
    }
  }),

  setStorageSync: vi.fn((key: string, data: any) => {
    mockStorage[key] = data;
  }),

  getStorage: vi.fn((options: any) => {
    const { key, success, fail: _fail } = options;
    setTimeout(() => {
      if (key in mockStorage) {
        success?.({ data: mockStorage[key] });
      } else {
        _fail?.({ errMsg: 'getStorage:fail 数据不存在' });
      }
    }, 0);
  }),

  getStorageSync: vi.fn((key: string) => {
    return mockStorage[key] ?? null;
  }),

  removeStorage: vi.fn((options: any) => {
    const { key, success, fail: _fail } = options;
    try {
      delete mockStorage[key];
      setTimeout(() => success?.(), 0);
    } catch (error) {
      setTimeout(() => _fail?.(error), 0);
    }
  }),

  removeStorageSync: vi.fn((key: string) => {
    delete mockStorage[key];
  }),

  clearStorage: vi.fn((options: any = {}) => {
    const { success, fail: _fail } = options;
    try {
      Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
      setTimeout(() => success?.(), 0);
    } catch (error) {
      setTimeout(() => _fail?.(error), 0);
    }
  }),

  clearStorageSync: vi.fn(() => {
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
  }),

  getStorageInfo: vi.fn((options: any) => {
    const keys = Object.keys(mockStorage);
    const result = {
      keys,
      currentSize: keys.length,
      limitSize: 10240,
    };
    setTimeout(() => options.success?.(result), 0);
  }),

  getStorageInfoSync: vi.fn(() => {
    const keys = Object.keys(mockStorage);
    return {
      keys,
      currentSize: keys.length,
      limitSize: 10240,
    };
  }),

  // UI 交互相关 API
  showToast: vi.fn((options: any) => {
    const { complete } = options;
    setTimeout(() => complete?.(), options.duration || 2000);
  }),

  showLoading: vi.fn((_options: any) => {
    // showLoading 没有回调，但需要接收参数
  }),

  hideLoading: vi.fn(() => {
    // hideLoading 没有回调
  }),

  showModal: vi.fn((options: any) => {
    const { success, fail: _fail, showCancel: _showCancel = true } = options;
    setTimeout(() => {
      success?.({
        confirm: true,
        cancel: false,
        content: options.editable ? '测试输入内容' : undefined,
      });
    }, 0);
  }),

  showActionSheet: vi.fn((options: any) => {
    const { success, fail: _fail } = options;
    setTimeout(() => {
      success?.({ tapIndex: 0 });
    }, 0);
  }),

  // 导航相关 API
  navigateTo: vi.fn((options: any) => {
    const { success, fail: _fail } = options;
    setTimeout(() => success?.(), 0);
  }),

  redirectTo: vi.fn((options: any) => {
    const { success, fail: _fail } = options;
    setTimeout(() => success?.(), 0);
  }),

  switchTab: vi.fn((options: any) => {
    const { success, fail: _fail } = options;
    setTimeout(() => success?.(), 0);
  }),

  reLaunch: vi.fn((options: any) => {
    const { success, fail: _fail } = options;
    setTimeout(() => success?.(), 0);
  }),

  navigateBack: vi.fn((options: any = {}) => {
    const { success, fail: _fail } = options;
    setTimeout(() => success?.(), 0);
  }),

  setNavigationBarTitle: vi.fn((options: any) => {
    const { success, fail: _fail } = options;
    setTimeout(() => success?.(), 0);
  }),

  setNavigationBarColor: vi.fn((options: any) => {
    const { success, fail: _fail } = options;
    setTimeout(() => success?.(), 0);
  }),

  // 网络请求相关 API
  request: vi.fn((options: any) => {
    const { success, fail: _fail, url, method = 'GET' } = options;
    setTimeout(() => {
      if (url && url.includes('error')) {
        _fail?.({
          errMsg: 'request:fail 网络请求失败',
          statusCode: 500,
        });
      } else {
        success?.({
          data: {
            success: true,
            message: '模拟请求成功',
            method,
            url,
          },
          statusCode: 200,
          header: {
            'Content-Type': 'application/json',
          },
        });
      }
    }, 100);
  }),

  uploadFile: vi.fn((options: any) => {
    const { success, fail: _fail, filePath } = options;
    setTimeout(() => {
      if (!filePath) {
        _fail?.({
          errMsg: 'uploadFile:fail 文件路径不能为空',
        });
      } else {
        success?.({
          data: JSON.stringify({
            success: true,
            fileId: 'mock-file-id',
            message: '文件上传成功',
          }),
          statusCode: 200,
          header: {
            'Content-Type': 'application/json',
          },
        });
      }
    }, 200);
  }),

  downloadFile: vi.fn((options: any) => {
    const { success, fail: _fail, url } = options;
    setTimeout(() => {
      if (!url) {
        _fail?.({
          errMsg: 'downloadFile:fail 下载地址不能为空',
        });
      } else {
        success?.({
          tempFilePath: '/tmp/mock-downloaded-file.jpg',
          statusCode: 200,
          header: {
            'Content-Type': 'image/jpeg',
          },
        });
      }
    }, 300);
  }),

  // 其他常用 API
  canIUse: vi.fn((api: string) => {
    // 模拟一些常用 API 的支持情况
    const supportedApis = [
      'showToast',
      'showModal',
      'showActionSheet',
      'getStorage',
      'setStorage',
      'request',
      'uploadFile',
      'downloadFile',
      'navigateTo',
      'getSystemInfo',
    ];
    return supportedApis.includes(api);
  }),

  // 剪贴板相关
  setClipboardData: vi.fn((options: any) => {
    const { success } = options;
    setTimeout(() => success?.(), 0);
  }),

  getClipboardData: vi.fn((options: any) => {
    const { success } = options;
    setTimeout(() => success?.({ data: '模拟剪贴板数据' }), 0);
  }),

  // 选择器相关
  chooseImage: vi.fn((options: any) => {
    const { success } = options;
    setTimeout(() => {
      success?.({
        tempFilePaths: ['/tmp/mock-image.jpg'],
        tempFiles: [
          {
            path: '/tmp/mock-image.jpg',
            size: 1024,
          },
        ],
      });
    }, 100);
  }),

  previewImage: vi.fn((options: any) => {
    const { success } = options;
    setTimeout(() => success?.(), 0);
  }),
};

// 设置全局 uni 对象
(global as any).uni = mockUni;

// 模拟 console 方法（如果需要静默）
const originalConsole = { ...console };

// 每个测试前重置
beforeEach(() => {
  // 清空所有 mock 调用记录
  vi.clearAllMocks();

  // 重置存储
  Object.keys(mockStorage).forEach(key => delete mockStorage[key]);

  // 重置系统信息
  mockUni.getSystemInfoSync.mockReturnValue({ ...mockSystemInfo });
});

// 每个测试后清理
afterEach(() => {
  // 恢复 console（如果被模拟过）
  Object.assign(console, originalConsole);
});

// 导出工具函数和对象
export { mockUni, mockStorage, mockSystemInfo };

// 辅助函数：设置存储数据
export function setMockStorageData(key: string, value: any) {
  mockStorage[key] = value;
}

// 辅助函数：获取存储数据
export function getMockStorageData(key: string) {
  return mockStorage[key];
}

// 辅助函数：清空存储数据
export function clearMockStorageData() {
  Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
}

// 辅助函数：模拟系统信息
export function setMockSystemInfo(info: Partial<typeof mockSystemInfo>) {
  Object.assign(mockSystemInfo, info);
  mockUni.getSystemInfoSync.mockReturnValue({ ...mockSystemInfo });
}

// 辅助函数：模拟网络请求响应
export function mockRequestResponse(
  url: string,
  response: any,
  statusCode: number = 200
) {
  mockUni.request.mockImplementationOnce((options: any) => {
    setTimeout(() => {
      if (options.url === url) {
        options.success?.({
          data: response,
          statusCode,
          header: { 'Content-Type': 'application/json' },
        });
      }
    }, 0);
  });
}

// 辅助函数：模拟网络请求失败
export function mockRequestError(url: string, error: any) {
  mockUni.request.mockImplementationOnce((options: any) => {
    setTimeout(() => {
      if (options.url === url) {
        options.fail?.(error);
      }
    }, 0);
  });
}

// 辅助函数：静默 console
export function silenceConsole() {
  console.log = vi.fn();
  console.warn = vi.fn();
  console.error = vi.fn();
  console.info = vi.fn();
}

// 辅助函数：恢复 console
export function restoreConsole() {
  Object.assign(console, originalConsole);
}

// 测试环境常量
export const TEST_CONSTANTS = {
  // 时间相关
  CURRENT_TIME: '2025-06-29 11:03:42',
  CURRENT_USER: 'lzk-gh',
  TIMEZONE: 'UTC',

  // 提示信息
  MESSAGES: {
    SUCCESS: '操作成功',
    FAILED: '操作失败',
    LOADING: '加载中...',
    NETWORK_ERROR: '网络连接失败',
    DATA_NOT_FOUND: '未找到相关数据',
    PERMISSION_DENIED: '没有权限访问',
    INVALID_PARAMS: '参数错误',
    TIMEOUT: '请求超时',
    SERVER_ERROR: '服务器错误',
    UPLOAD_SUCCESS: '上传成功',
    UPLOAD_FAILED: '上传失败',
    DOWNLOAD_SUCCESS: '下载成功',
    DOWNLOAD_FAILED: '下载失败',
  },

  // 平台信息
  PLATFORMS: {
    ANDROID: 'Android',
    IOS: 'iOS',
    WECHAT: '微信小程序',
    ALIPAY: '支付宝小程序',
    BAIDU: '百度小程序',
    TOUTIAO: '抖音小程序',
    QQ: 'QQ小程序',
    WEB: '网页版',
    APP: '原生应用',
  },

  // 设备信息
  DEVICE_BRANDS: {
    XIAOMI: '小米',
    HUAWEI: '华为',
    OPPO: 'OPPO',
    VIVO: 'vivo',
    APPLE: '苹果',
    SAMSUNG: '三星',
    ONEPLUS: '一加',
    REALME: '真我',
  },
};

// 模拟条件编译环境变量（用于测试）
export const mockEnv = {
  VUE2: false,
  VUE3: true,
  'UNI-APP-X': false,
  APP: false,
  'APP-PLUS': false,
  'APP-ANDROID': false,
  'APP-IOS': false,
  'APP-HARMONY': false,
  H5: false,
  WEB: false,
  'MP-WEIXIN': false,
  'MP-ALIPAY': false,
  'MP-BAIDU': false,
  'MP-TOUTIAO': false,
  'MP-QQ': false,
  MP: false,
};

// 设置条件编译环境
export function setMockEnv(env: Partial<typeof mockEnv>) {
  Object.assign(mockEnv, env);
}

// 获取当前时间（用于测试）
export function getCurrentTime(): string {
  return TEST_CONSTANTS.CURRENT_TIME;
}

// 获取当前用户（用于测试）
export function getCurrentUser(): string {
  return TEST_CONSTANTS.CURRENT_USER;
}

// 生成测试用的中文错误信息
export function generateChineseErrorMessage(
  type: keyof typeof TEST_CONSTANTS.MESSAGES
): string {
  return TEST_CONSTANTS.MESSAGES[type] || '未知错误';
}

// 模拟中文设备信息
export function getMockChineseDeviceInfo() {
  return {
    ...mockSystemInfo,
    brandName: TEST_CONSTANTS.DEVICE_BRANDS.XIAOMI,
    systemName: 'Android 10',
    platformName: TEST_CONSTANTS.PLATFORMS.ANDROID,
  };
}
