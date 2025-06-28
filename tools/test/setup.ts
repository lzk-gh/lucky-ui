import { vi } from 'vitest';
import './types.d';

// Mock UniApp 全局 API
globalThis.uni = {
  // 界面相关
  showToast: vi.fn().mockResolvedValue(undefined),
  showModal: vi.fn().mockResolvedValue({ confirm: true, cancel: false }),
  showActionSheet: vi.fn().mockResolvedValue({ tapIndex: 0 }),
  showLoading: vi.fn(),
  hideLoading: vi.fn(),

  // 导航相关
  navigateTo: vi.fn().mockResolvedValue(undefined),
  redirectTo: vi.fn().mockResolvedValue(undefined),
  switchTab: vi.fn().mockResolvedValue(undefined),
  reLaunch: vi.fn().mockResolvedValue(undefined),
  navigateBack: vi.fn().mockResolvedValue(undefined),

  // 系统信息
  getSystemInfo: vi.fn().mockResolvedValue({
    platform: 'devtools',
    system: 'iOS 16.0',
    model: 'iPhone 14',
    screenWidth: 390,
    screenHeight: 844,
    windowWidth: 390,
    windowHeight: 844,
    pixelRatio: 3,
    statusBarHeight: 47,
    safeArea: {
      top: 47,
      bottom: 810,
      left: 0,
      right: 390,
      width: 390,
      height: 763,
    },
  }),

  // 存储相关
  setStorage: vi.fn().mockResolvedValue(undefined),
  getStorage: vi.fn().mockResolvedValue({ data: null }),
  removeStorage: vi.fn().mockResolvedValue(undefined),
  clearStorage: vi.fn().mockResolvedValue(undefined),
  setStorageSync: vi.fn(),
  getStorageSync: vi.fn().mockReturnValue(null),
  removeStorageSync: vi.fn(),
  clearStorageSync: vi.fn(),

  // 网络相关
  request: vi.fn().mockResolvedValue({
    data: {},
    statusCode: 200,
    header: {},
  }),

  // 图片相关
  chooseImage: vi.fn().mockResolvedValue({
    tempFilePaths: ['/mock/image1.jpg'],
    tempFiles: [{ path: '/mock/image1.jpg', size: 1024 }],
  }),
  previewImage: vi.fn().mockResolvedValue(undefined),

  // 选择器查询
  createSelectorQuery: vi.fn(() => ({
    select: vi.fn(() => ({
      boundingClientRect: vi.fn((callback?: Function) => ({
        exec: vi.fn((execCallback: Function) => {
          const mockRect = {
            width: 100,
            height: 50,
            top: 0,
            left: 0,
            right: 100,
            bottom: 50,
          };
          if (callback) callback(mockRect);
          execCallback([mockRect]);
        }),
      })),
    })),
    selectAll: vi.fn(),
    selectViewport: vi.fn(),
    in: vi.fn(),
  })),
};

// Mock getApp
globalThis.getApp = vi.fn(() => ({
  globalData: {
    userInfo: null,
    theme: 'light',
  },
  onLaunch: vi.fn(),
  onShow: vi.fn(),
  onHide: vi.fn(),
  onError: vi.fn(),
}));

// Mock getCurrentPages
globalThis.getCurrentPages = vi.fn(() => [
  {
    route: 'pages/index/index',
    options: {},
    $getAppWebview: vi.fn(),
    $page: {},
  },
]);

// Mock DOM API
Object.defineProperty(document.documentElement.style, 'setProperty', {
  value: vi.fn(),
  writable: true,
});

Object.defineProperty(document.documentElement.style, 'getPropertyValue', {
  value: vi.fn().mockReturnValue(''),
  writable: true,
});

Object.defineProperty(document.documentElement.style, 'removeProperty', {
  value: vi.fn(),
  writable: true,
});

// Mock ResizeObserver
globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
globalThis.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: '0px',
  thresholds: [0],
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock requestAnimationFrame
globalThis.requestAnimationFrame = vi.fn(callback => {
  setTimeout(callback, 16);
  return 1;
});

globalThis.cancelAnimationFrame = vi.fn();

// Mock scroll behavior
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
});

// Mock performance
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
  },
  writable: true,
});
