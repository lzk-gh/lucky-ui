import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  Request,
  createRequest,
  request,
  HTTP_STATUS,
  isSuccessStatus,
  isRedirectStatus,
  isClientErrorStatus,
  isServerErrorStatus,
  transformResponse,
  transformRequest,
  type RequestResponse,
  type UploadResponse,
  type DownloadResponse,
} from '../src/utils/request';

// 模拟 (Mock) uni-app 的全局 API
const mockUniRequest = vi.fn();
const mockUniShowLoading = vi.fn();
const mockUniHideLoading = vi.fn();
const mockUniUploadFile = vi.fn();
const mockUniDownloadFile = vi.fn();

// 模拟请求任务 (RequestTask)
const createMockRequestTask = () => ({
  abort: vi.fn(),
  onProgressUpdate: vi.fn(),
  onHeadersReceived: vi.fn(),
  offProgressUpdate: vi.fn(),
  offHeadersReceived: vi.fn(),
});

// 将模拟的 API 挂载到全局对象上
global.uni = {
  request: mockUniRequest,
  showLoading: mockUniShowLoading,
  hideLoading: mockUniHideLoading,
  uploadFile: mockUniUploadFile,
  downloadFile: mockUniDownloadFile,
} as any;

// 开始定义测试套件
describe('Request Utils', () => {
  // 在每个测试用例开始前执行的钩子函数
  beforeEach(() => {
    vi.clearAllMocks(); // 清除所有模拟函数的调用记录
    vi.useFakeTimers(); // 对所有测试默认使用模拟计时器，控制时间
  });

  // 在每个测试用例结束后执行的钩子函数
  afterEach(() => {
    vi.useRealTimers();
  });

  // 测试组：Request 类的基础功能
  describe('Request类 - 基础功能', () => {
    it('创建请求实例', () => {
      const req = new Request();
      expect(req).toBeInstanceOf(Request);
      expect(req.defaults.timeout).toBe(60000);
      expect(req.defaults.dataType).toBe('json');
      expect(req.defaults.responseType).toBe('text');
      expect(req.defaults.retry).toBe(0);
      expect(req.defaults.loading).toBe(false);
      expect(req.defaults.loadingText).toBe('加载中...');
    });

    it('创建带配置的请求实例', () => {
      const config = {
        baseURL: 'https://api.example.com',
        timeout: 5000,
        header: {
          Authorization: 'Bearer token',
          'Custom-Header': 'custom-value',
        },
        loading: true,
        loadingText: '请稍候...',
        retry: 3,
        retryDelay: 500,
      };

      const req = new Request(config);
      expect(req.defaults.baseURL).toBe('https://api.example.com');
      expect(req.defaults.timeout).toBe(5000);
      expect(req.defaults.header?.['Authorization']).toBe('Bearer token');
      expect(req.defaults.header?.['Custom-Header']).toBe('custom-value');
      expect(req.defaults.header?.['Content-Type']).toBe('application/json');
      expect(req.defaults.loading).toBe(true);
      expect(req.defaults.loadingText).toBe('请稍候...');
      expect(req.defaults.retry).toBe(3);
      expect(req.defaults.retryDelay).toBe(500);
    });

    it('默认配置合并', () => {
      const req = new Request({
        baseURL: 'https://api.example.com',
        header: { Authorization: 'Bearer token' },
      });

      expect(req.defaults.header).toEqual({
        'Content-Type': 'application/json',
        Authorization: 'Bearer token',
      });
    });
  });

  // 测试组：Request 类的 HTTP 方法
  describe('Request类 - HTTP方法', () => {
    beforeEach(() => {
      mockUniRequest.mockImplementation(({ success }) => {
        const mockTask = createMockRequestTask();
        setTimeout(() => {
          success({
            data: { message: 'success' },
            statusCode: 200,
            header: {},
            cookies: [],
            profile: {},
          });
        }, 0);
        return mockTask;
      });
    });

    it('GET请求', async () => {
      const promise = request.get<{ message: string }>('/users/1');
      await vi.runAllTimersAsync();
      const response = await promise;

      expect(response.data).toEqual({ message: 'success' });
      expect(response.statusCode).toBe(200);
      expect(mockUniRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/users/1',
        })
      );
    });

    it('POST请求', async () => {
      const postData = { name: 'John', email: 'john@example.com' };

      mockUniRequest.mockImplementation(({ success }) => {
        const mockTask = createMockRequestTask();
        setTimeout(() => {
          success({
            data: { id: 1, ...postData },
            statusCode: 201,
            header: {},
            cookies: [],
            profile: {},
          });
        }, 0);
        return mockTask;
      });

      const promise = request.post('/users', postData);
      await vi.runAllTimersAsync();
      const response = await promise;

      expect(response.data).toEqual({ id: 1, ...postData });
      expect(response.statusCode).toBe(201);
      expect(mockUniRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: '/users',
          data: postData,
        })
      );
    });

    it('PUT请求', async () => {
      const putData = { name: 'Jane', email: 'jane@example.com' };
      const promise = request.put('/users/1', putData);
      await vi.runAllTimersAsync();
      await promise;

      expect(mockUniRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'PUT',
          url: '/users/1',
          data: putData,
        })
      );
    });

    it('DELETE请求', async () => {
      const promise = request.delete('/users/1');
      await vi.runAllTimersAsync();
      await promise;

      expect(mockUniRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'DELETE',
          url: '/users/1',
        })
      );
    });

    it('HEAD请求', async () => {
      const promise = request.head('/users/1');
      await vi.runAllTimersAsync();
      await promise;

      expect(mockUniRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'HEAD',
          url: '/users/1',
        })
      );
    });

    it('OPTIONS请求', async () => {
      const promise = request.options('/users/1');
      await vi.runAllTimersAsync();
      await promise;

      expect(mockUniRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'OPTIONS',
          url: '/users/1',
        })
      );
    });
  });

  // 测试组：Request 类的 URL 处理
  describe('Request类 - URL处理', () => {
    beforeEach(() => {
      mockUniRequest.mockImplementation(({ success }) => {
        const mockTask = createMockRequestTask();
        setTimeout(() => {
          success({
            data: { message: 'success' },
            statusCode: 200,
            header: {},
          });
        }, 0);
        return mockTask;
      });
    });

    it('处理baseURL - 相对路径', async () => {
      const req = new Request({ baseURL: 'https://api.example.com' });
      const promise = req.get('/users');
      await vi.runAllTimersAsync();
      await promise;

      expect(mockUniRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://api.example.com/users',
        })
      );
    });

    it('处理baseURL - 绝对路径', async () => {
      const req = new Request({ baseURL: 'https://api.example.com' });
      const promise = req.get('https://other-api.com/users');
      await vi.runAllTimersAsync();
      await promise;

      expect(mockUniRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://other-api.com/users',
        })
      );
    });

    it('处理baseURL - 末尾斜杠', async () => {
      const req = new Request({ baseURL: 'https://api.example.com/' });
      const promise = req.get('/users');
      await vi.runAllTimersAsync();
      await promise;

      expect(mockUniRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://api.example.com/users',
        })
      );
    });
  });

  // 测试组：Request 类的加载状态
  describe('Request类 - 加载状态', () => {
    beforeEach(() => {
      mockUniRequest.mockImplementation(({ success }) => {
        const mockTask = createMockRequestTask();
        setTimeout(() => {
          success({
            data: { message: 'success' },
            statusCode: 200,
          });
        }, 100);
        return mockTask;
      });
    });

    it('显示和隐藏加载提示', async () => {
      const req = new Request({ loading: true });
      const promise = req.get('/users');

      // 【关键修正】在断言前，快进所有计时器和微任务，确保异步的 showLoading 已被调用
      await vi.advanceTimersByTimeAsync(0);

      // 断言 showLoading 被立即调用
      expect(mockUniShowLoading).toHaveBeenCalledWith({
        title: '加载中...',
        mask: true,
      });

      // 快进时间，让请求完成
      await vi.runAllTimersAsync();
      await promise;

      // 验证 hideLoading 在请求结束后被调用
      expect(mockUniHideLoading).toHaveBeenCalled();
    });

    it('自定义加载提示文本', async () => {
      const req = new Request({ loading: true, loadingText: '数据加载中...' });
      const promise = req.get('/users');

      // 【关键修正】等待微任务执行
      await vi.advanceTimersByTimeAsync(0);

      // 断言 showLoading 被立即调用
      expect(mockUniShowLoading).toHaveBeenCalledWith({
        title: '数据加载中...',
        mask: true,
      });

      await vi.runAllTimersAsync();
      await promise;

      expect(mockUniHideLoading).toHaveBeenCalled();
    });

    it('多个请求时加载状态管理', async () => {
      const req = new Request({ loading: true });

      const promise1 = req.get('/users');
      const promise2 = req.get('/posts');

      // 等待微任务执行
      await vi.advanceTimersByTimeAsync(0);

      // 断言 showLoading 只被调用一次
      expect(mockUniShowLoading).toHaveBeenCalledTimes(1);

      // 快进时间，让所有请求都完成
      await vi.runAllTimersAsync();
      await Promise.all([promise1, promise2]);

      // hideLoading 应该只在最后一个请求完成后被调用一次
      expect(mockUniHideLoading).toHaveBeenCalledTimes(1);
    });
  });

  // 测试组：Request 类的错误处理
  describe('Request类 - 错误处理', () => {
    it('处理请求失败', async () => {
      mockUniRequest.mockImplementation(({ fail }) => {
        const mockTask = createMockRequestTask();
        setTimeout(() => {
          fail({
            errMsg: '网络错误',
            statusCode: 500,
            data: { error: 'Internal Server Error' },
          });
        }, 0);
        return mockTask;
      });

      const promise = request.get('/users');
      await vi.runAllTimersAsync();

      await expect(promise).rejects.toEqual({
        errMsg: '网络错误',
        statusCode: 500,
        data: { error: 'Internal Server Error' },
        config: expect.any(Object),
      });
    });

    it('处理超时错误', async () => {
      mockUniRequest.mockImplementation(({ fail }) => {
        const mockTask = createMockRequestTask();
        setTimeout(() => {
          fail({
            errMsg: 'request:fail timeout',
          });
        }, 0);
        return mockTask;
      });

      const promise = request.get('/users');
      await vi.runAllTimersAsync();

      await expect(promise).rejects.toEqual(
        expect.objectContaining({
          errMsg: 'request:fail timeout',
        })
      );
    });
  });

  // 测试组：Request 类的重试机制
  describe('Request类 - 重试机制', () => {
    it('请求重试成功', async () => {
      const req = new Request({ retry: 2, retryDelay: 100 });
      let callCount = 0;

      mockUniRequest.mockImplementation(({ success, fail }) => {
        const mockTask = createMockRequestTask();
        callCount++;
        if (callCount <= 2) {
          setTimeout(() => fail({ errMsg: '网络错误', statusCode: 500 }), 0);
        } else {
          setTimeout(
            () => success({ data: { message: 'success' }, statusCode: 200 }),
            0
          );
        }
        return mockTask;
      });

      const promise = req.get('/users');
      await vi.runAllTimersAsync();
      const response = await promise;

      expect(callCount).toBe(3);
      expect(response.data.message).toBe('success');
    });

    it('请求重试失败', async () => {
      const req = new Request({ retry: 2, retryDelay: 100 });
      let callCount = 0;

      mockUniRequest.mockImplementation(({ fail }) => {
        const mockTask = createMockRequestTask();
        callCount++;
        setTimeout(() => fail({ errMsg: '网络错误', statusCode: 500 }), 0);
        return mockTask;
      });

      const promise = req.get('/users');
      await vi.runAllTimersAsync();

      await expect(promise).rejects.toEqual(
        expect.objectContaining({
          errMsg: '网络错误',
          statusCode: 500,
        })
      );
      expect(callCount).toBe(3);
    });
  });

  // 测试组：Request 类的拦截器
  describe('Request类 - 拦截器', () => {
    beforeEach(() => {
      mockUniRequest.mockImplementation(({ success }) => {
        const mockTask = createMockRequestTask();
        setTimeout(() => {
          success({
            data: { message: 'success' },
            statusCode: 200,
            header: {},
            cookies: [],
            profile: {},
          });
        }, 0);
        return mockTask;
      });
    });

    it('请求拦截器', async () => {
      const req = new Request();

      req.interceptors.request.use(config => {
        config.header = {
          ...config.header,
          Authorization: 'Bearer test-token',
          'X-Custom-Header': 'custom-value',
        };
        return config;
      });

      const promise = req.get('/users');
      await vi.runAllTimersAsync();
      await promise;

      expect(mockUniRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          header: expect.objectContaining({
            Authorization: 'Bearer test-token',
            'X-Custom-Header': 'custom-value',
          }),
        })
      );
    });

    it('异步请求拦截器', async () => {
      const req = new Request();

      req.interceptors.request.use(async config => {
        await new Promise(resolve => setTimeout(resolve, 50));
        config.header = {
          ...config.header,
          Authorization: 'Bearer async-token',
        };
        return config;
      });

      const promise = req.get('/users');
      await vi.runAllTimersAsync();
      await promise;

      expect(mockUniRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          header: expect.objectContaining({
            Authorization: 'Bearer async-token',
          }),
        })
      );
    });

    it('响应拦截器', async () => {
      const req = new Request();

      req.interceptors.response.use(response => {
        response.data = {
          ...response.data,
          intercepted: true,
          timestamp: Date.now(),
        };
        return response;
      });

      const promise = req.get('/users');
      await vi.runAllTimersAsync();
      const response = await promise;

      expect(response.data.intercepted).toBe(true);
      expect(response.data.timestamp).toBeTypeOf('number');
      expect(response.data.message).toBe('success');
    });

    it('错误拦截器', async () => {
      const req = new Request();

      req.interceptors.response.use(
        response => response,
        error => {
          throw {
            ...error,
            errMsg: '自定义错误信息',
            handled: true,
          };
        }
      );

      mockUniRequest.mockImplementation(({ fail }) => {
        const mockTask = createMockRequestTask();
        setTimeout(() => {
          fail({
            errMsg: '网络错误',
            statusCode: 500,
          });
        }, 0);
        return mockTask;
      });

      const promise = req.get('/users');
      await vi.runAllTimersAsync();

      await expect(promise).rejects.toEqual(
        expect.objectContaining({
          errMsg: '自定义错误信息',
          handled: true,
          statusCode: 500,
        })
      );
    });

    it('多个拦截器执行顺序', async () => {
      const req = new Request();
      const executionOrder: string[] = [];

      req.interceptors.request.use(config => {
        executionOrder.push('request1');
        return config;
      });

      req.interceptors.request.use(config => {
        executionOrder.push('request2');
        return config;
      });

      req.interceptors.response.use(response => {
        executionOrder.push('response1');
        return response;
      });

      req.interceptors.response.use(response => {
        executionOrder.push('response2');
        return response;
      });

      const promise = req.get('/users');
      await vi.runAllTimersAsync();
      await promise;

      expect(executionOrder).toEqual([
        'request2',
        'request1',
        'response1',
        'response2',
      ]);
    });

    it('移除拦截器', async () => {
      const req = new Request();

      const interceptorId = req.interceptors.request.use(config => {
        config.header = {
          ...config.header,
          'Should-Not-Exist': 'true',
        };
        return config;
      });

      req.interceptors.request.eject(interceptorId);

      const promise = req.get('/users');
      await vi.runAllTimersAsync();
      await promise;

      const callArgs = mockUniRequest.mock.calls[0][0];
      expect(callArgs.header).not.toHaveProperty('Should-Not-Exist');
    });
  });

  // 测试组：Request 类的任务管理
  describe('Request类 - 任务管理', () => {
    it('取消单个请求', async () => {
      const req = new Request();
      const mockTask = createMockRequestTask();

      mockUniRequest.mockImplementation(() => mockTask);

      req.get('/users', { requestId: 'test-request' });

      // 等待微任务队列执行，确保任务已被添加到管理器中
      await vi.runAllTimersAsync();

      req.cancel('test-request');

      expect(mockTask.abort).toHaveBeenCalled();
    });

    it('取消所有请求', async () => {
      const req = new Request();
      const mockTask1 = createMockRequestTask();
      const mockTask2 = createMockRequestTask();

      let callCount = 0;
      mockUniRequest.mockImplementation(() => {
        callCount++;
        return callCount === 1 ? mockTask1 : mockTask2;
      });

      req.get('/users', { requestId: 'request1' });
      req.get('/posts', { requestId: 'request2' });

      // 等待微任务队列执行，确保两个任务都已添加
      await vi.runAllTimersAsync();

      req.cancelAll();

      expect(mockTask1.abort).toHaveBeenCalled();
      expect(mockTask2.abort).toHaveBeenCalled();
    });
  });

  // 测试组：Request 类的文件上传下载
  describe('Request类 - 文件上传下载', () => {
    it('上传文件', async () => {
      const mockUploadResponse: UploadResponse = {
        data: 'upload success',
        statusCode: 200,
        header: {},
      };

      mockUniUploadFile.mockImplementation(({ success }) => {
        setTimeout(() => success(mockUploadResponse), 0);
        return createMockRequestTask();
      });

      const promise = request.upload({
        url: '/upload',
        filePath: 'temp://test.jpg',
        name: 'file',
        formData: { userId: '123' },
      });
      await vi.runAllTimersAsync();
      const response = await promise;

      expect(response.data).toBe('upload success');
      expect(response.statusCode).toBe(200);
      expect(mockUniUploadFile).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/upload',
          filePath: 'temp://test.jpg',
          name: 'file',
          formData: { userId: '123' },
        })
      );
    });

    it('上传文件失败', async () => {
      mockUniUploadFile.mockImplementation(({ fail }) => {
        setTimeout(() => fail({ errMsg: '上传失败' }), 0);
        return createMockRequestTask();
      });

      const promise = request.upload({
        url: '/upload',
        filePath: 'temp://test.jpg',
        name: 'file',
      });
      await vi.runAllTimersAsync();

      await expect(promise).rejects.toEqual({ errMsg: '上传失败' });
    });

    it('下载文件', async () => {
      const mockDownloadResponse: DownloadResponse = {
        tempFilePath: 'temp://downloaded.jpg',
        statusCode: 200,
        profile: {},
      };

      mockUniDownloadFile.mockImplementation(({ success }) => {
        setTimeout(() => success(mockDownloadResponse), 0);
        return createMockRequestTask();
      });

      const promise = request.download({ url: '/download/test.jpg' });
      await vi.runAllTimersAsync();
      const response = await promise;

      expect(response.tempFilePath).toBe('temp://downloaded.jpg');
      expect(response.statusCode).toBe(200);
      expect(mockUniDownloadFile).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/download/test.jpg',
        })
      );
    });

    it('下载文件失败', async () => {
      mockUniDownloadFile.mockImplementation(({ fail }) => {
        setTimeout(() => fail({ errMsg: '下载失败' }), 0);
        return createMockRequestTask();
      });

      const promise = request.download({ url: '/download/test.jpg' });
      await vi.runAllTimersAsync();

      await expect(promise).rejects.toEqual({ errMsg: '下载失败' });
    });
  });

  // 测试组：createRequest 工厂函数
  describe('createRequest工厂函数', () => {
    it('创建请求实例', () => {
      const req = createRequest();
      expect(req).toBeInstanceOf(Request);
    });

    it('创建带配置的请求实例', () => {
      const req = createRequest({ baseURL: 'https://api.example.com' });
      expect(req.defaults.baseURL).toBe('https://api.example.com');
    });
  });

  // 测试组：HTTP 状态码工具
  describe('HTTP状态码工具', () => {
    it('HTTP_STATUS常量', () => {
      expect(HTTP_STATUS.OK).toBe(200);
      expect(HTTP_STATUS.NOT_FOUND).toBe(404);
      expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
    });

    it('isSuccessStatus', () => {
      expect(isSuccessStatus(200)).toBe(true);
      expect(isSuccessStatus(299)).toBe(true);
      expect(isSuccessStatus(300)).toBe(false);
    });

    it('isRedirectStatus', () => {
      expect(isRedirectStatus(300)).toBe(true);
      expect(isRedirectStatus(399)).toBe(true);
      expect(isRedirectStatus(200)).toBe(false);
    });

    it('isClientErrorStatus', () => {
      expect(isClientErrorStatus(400)).toBe(true);
      expect(isClientErrorStatus(499)).toBe(true);
      expect(isClientErrorStatus(500)).toBe(false);
    });

    it('isServerErrorStatus', () => {
      expect(isServerErrorStatus(500)).toBe(true);
      expect(isServerErrorStatus(599)).toBe(true);
      expect(isServerErrorStatus(400)).toBe(false);
    });
  });

  // 测试组：数据转换工具
  describe('数据转换工具', () => {
    describe('transformResponse', () => {
      it('JSON响应转换', () => {
        const response: RequestResponse = {
          data: '{"name":"test","age":18}',
          statusCode: 200,
          header: {},
        };
        const result = transformResponse.json(response);
        expect(result).toEqual({ name: 'test', age: 18 });
      });

      it('JSON响应转换 - 非字符串数据', () => {
        const response: RequestResponse = {
          data: { name: 'test', age: 18 },
          statusCode: 200,
          header: {},
        };
        const result = transformResponse.json(response);
        expect(result).toEqual({ name: 'test', age: 18 });
      });

      it('JSON响应转换 - 无效JSON', () => {
        const response: RequestResponse = {
          data: 'invalid json',
          statusCode: 200,
          header: {},
        };
        const result = transformResponse.json(response);
        expect(result).toBe('invalid json');
      });

      it('文本响应转换', () => {
        const response: RequestResponse = {
          data: { name: 'test' },
          statusCode: 200,
          header: {},
        };
        const result = transformResponse.text(response);
        expect(result).toBe('[object Object]');
      });

      it('ArrayBuffer响应转换', () => {
        const buffer = new ArrayBuffer(10);
        const response: RequestResponse = {
          data: buffer,
          statusCode: 200,
          header: {},
        };
        const result = transformResponse.arrayBuffer(response);
        expect(result).toBe(buffer);
      });
    });

    describe('transformRequest', () => {
      it('JSON数据转换', () => {
        const data = { name: 'test', age: 18 };
        const result = transformRequest.json(data);
        expect(result).toBe('{"name":"test","age":18}');
      });

      it('表单数据转换', () => {
        const data = { name: 'test', age: 18 };
        const result = transformRequest.formData(data);
        expect(result).toBe('name=test&age=18');
      });

      it('查询字符串转换', () => {
        const data = { name: 'test', age: 18 };
        const result = transformRequest.queryString(data);
        expect(result).toBe('name=test&age=18');
      });
    });
  });

  // 测试组：边界情况和错误处理
  describe('边界情况和错误处理', () => {
    it('处理空响应', async () => {
      mockUniRequest.mockImplementation(({ success }) => {
        const mockTask = createMockRequestTask();
        setTimeout(() => {
          success({
            data: null,
            statusCode: 204,
            header: {},
            cookies: [],
            profile: {},
          });
        }, 0);
        return mockTask;
      });

      const promise = request.get('/empty');
      await vi.runAllTimersAsync();
      const response = await promise;

      expect(response.data).toBeNull();
      expect(response.statusCode).toBe(204);
    });

    it('处理并发请求', async () => {
      let requestCount = 0;
      mockUniRequest.mockImplementation(({ success }) => {
        requestCount++;
        const currentId = requestCount;
        const mockTask = createMockRequestTask();
        setTimeout(() => {
          success({
            data: { message: 'success', requestId: currentId },
            statusCode: 200,
          });
        }, 0);
        return mockTask;
      });

      const promises = Array.from({ length: 5 }, (_, i) =>
        request.get(`/users/${i}`)
      );

      await vi.runAllTimersAsync();
      const responses = await Promise.all(promises);

      expect(responses).toHaveLength(5);
      responses.forEach((response, index) => {
        expect(response.statusCode).toBe(200);
        expect(response.data.requestId).toBe(index + 1);
      });
    });
  });
});
