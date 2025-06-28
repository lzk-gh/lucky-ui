/// <reference types="vitest/globals" />

import type { MockedFunction } from 'vitest';

declare global {
  // UniApp 全局 API 类型定义
  interface UniAPI {
    // 界面相关
    showToast: MockedFunction<
      (options: {
        title: string;
        icon?: 'success' | 'error' | 'loading' | 'none';
        duration?: number;
        mask?: boolean;
      }) => Promise<void>
    >;

    showModal: MockedFunction<
      (options: {
        title?: string;
        content?: string;
        showCancel?: boolean;
        cancelText?: string;
        confirmText?: string;
      }) => Promise<{ confirm: boolean; cancel: boolean }>
    >;

    showActionSheet: MockedFunction<
      (options: {
        itemList: string[];
        itemColor?: string;
      }) => Promise<{ tapIndex: number }>
    >;

    showLoading: MockedFunction<
      (options?: { title?: string; mask?: boolean }) => void
    >;
    hideLoading: MockedFunction<() => void>;

    // 导航相关
    navigateTo: MockedFunction<
      (options: {
        url: string;
        animationType?: string;
        animationDuration?: number;
      }) => Promise<void>
    >;
    redirectTo: MockedFunction<(options: { url: string }) => Promise<void>>;
    switchTab: MockedFunction<(options: { url: string }) => Promise<void>>;
    reLaunch: MockedFunction<(options: { url: string }) => Promise<void>>;
    navigateBack: MockedFunction<
      (options?: { delta?: number }) => Promise<void>
    >;

    // 系统信息
    getSystemInfo: MockedFunction<
      () => Promise<{
        platform: string;
        system: string;
        model: string;
        screenWidth: number;
        screenHeight: number;
        windowWidth: number;
        windowHeight: number;
        pixelRatio: number;
        statusBarHeight: number;
        safeArea: {
          top: number;
          bottom: number;
          left: number;
          right: number;
          width: number;
          height: number;
        };
      }>
    >;

    // 存储相关
    setStorage: MockedFunction<
      (options: { key: string; data: any }) => Promise<void>
    >;
    getStorage: MockedFunction<
      (options: { key: string }) => Promise<{ data: any }>
    >;
    removeStorage: MockedFunction<(options: { key: string }) => Promise<void>>;
    clearStorage: MockedFunction<() => Promise<void>>;
    setStorageSync: MockedFunction<(key: string, data: any) => void>;
    getStorageSync: MockedFunction<(key: string) => any>;
    removeStorageSync: MockedFunction<(key: string) => void>;
    clearStorageSync: MockedFunction<() => void>;

    // 网络相关
    request: MockedFunction<
      (options: {
        url: string;
        method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
        data?: any;
        header?: Record<string, string>;
      }) => Promise<{
        data: any;
        statusCode: number;
        header: Record<string, string>;
      }>
    >;

    // 图片相关
    chooseImage: MockedFunction<
      (options?: {
        count?: number;
        sizeType?: string[];
        sourceType?: string[];
      }) => Promise<{ tempFilePaths: string[]; tempFiles: any[] }>
    >;

    previewImage: MockedFunction<
      (options: { urls: string[]; current?: string | number }) => Promise<void>
    >;

    // 选择器查询
    createSelectorQuery: MockedFunction<
      () => {
        select: (selector: string) => {
          boundingClientRect: (
            callback?: (rect: {
              width: number;
              height: number;
              top: number;
              left: number;
              right: number;
              bottom: number;
            }) => void
          ) => {
            exec: (callback: (rects: any[]) => void) => void;
          };
        };
        selectAll: (selector: string) => any;
        selectViewport: () => any;
        in: (component: any) => any;
      }
    >;

    // 其他常用 API
    [key: string]: any;
  }

  var uni: UniAPI;

  // getApp 函数类型
  var getApp: MockedFunction<
    () => {
      globalData: Record<string, any>;
      onLaunch?: (options: any) => void;
      onShow?: (options: any) => void;
      onHide?: () => void;
      onError?: (error: string) => void;
      [key: string]: any;
    }
  >;

  // getCurrentPages 函数类型
  var getCurrentPages: MockedFunction<
    () => Array<{
      route: string;
      options: Record<string, any>;
      $getAppWebview?: () => any;
      $page?: any;
      [key: string]: any;
    }>
  >;

  // 浏览器 API Mock
  var ResizeObserver: {
    new (callback: ResizeObserverCallback): ResizeObserver;
  };

  var IntersectionObserver: {
    new (
      callback: IntersectionObserverCallback,
      options?: IntersectionObserverInit
    ): IntersectionObserver;
  };
}

export {};
