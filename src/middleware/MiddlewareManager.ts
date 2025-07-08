import { compose } from '../utils';
import {
  MiddlewareBase,
  InterceptorBase,
  MiddlewareActionRecordBase,
  MiddlewareNextBase,
  InterceptorNextBase,
  MiddlewareParamsBase,
  InterceptorParamsBase,
} from '../ts';
import { ErrorHandler } from '../errors/StoreError';

/**
 * 中间件管理器，统一管理所有中间件和拦截器
 */
export class MiddlewareManager {
  private middlewares: MiddlewareBase[] = [];
  private interceptors: InterceptorBase[] = [];
  
  // 缓存组合后的中间件链 - 使用moduleName作为key
  private composedMiddlewareCache: Map<string, MiddlewareNextBase> = new Map();
  private composedInterceptorCache: Map<string, InterceptorNextBase> = new Map();
  
  // 统计信息
  private stats = {
    middlewareCount: 0,
    interceptorCount: 0,
    executionCount: 0,
    errorCount: 0,
  };

  constructor(
    middlewares: MiddlewareBase[] = [],
    interceptors: InterceptorBase[] = []
  ) {
    this.middlewares = [...middlewares];
    this.interceptors = [...interceptors];
    this.updateStats();
  }

  /**
   * 添加中间件
   */
  addMiddleware(middleware: MiddlewareBase): void {
    if (typeof middleware !== 'function') {
      ErrorHandler.createDevWarning('Middleware must be a function');
      return;
    }
    
    this.middlewares.push(middleware);
    this.clearCache();
    this.updateStats();
  }

  /**
   * 添加拦截器
   */
  addInterceptor(interceptor: InterceptorBase): void {
    if (typeof interceptor !== 'function') {
      ErrorHandler.createDevWarning('Interceptor must be a function');
      return;
    }
    
    this.interceptors.push(interceptor);
    this.clearCache();
    this.updateStats();
  }

  /**
   * 移除中间件
   */
  removeMiddleware(middleware: MiddlewareBase): void {
    const index = this.middlewares.indexOf(middleware);
    if (index > -1) {
      this.middlewares.splice(index, 1);
      this.clearCache();
      this.updateStats();
    }
  }

  /**
   * 移除拦截器
   */
  removeInterceptor(interceptor: InterceptorBase): void {
    const index = this.interceptors.indexOf(interceptor);
    if (index > -1) {
      this.interceptors.splice(index, 1);
      this.clearCache();
      this.updateStats();
    }
  }

  /**
   * 获取所有中间件
   */
  getMiddlewares(): MiddlewareBase[] {
    return [...this.middlewares];
  }

  /**
   * 获取所有拦截器
   */
  getInterceptors(): InterceptorBase[] {
    return [...this.interceptors];
  }

  /**
   * 创建带有中间件的setState函数
   */
  createSetStateWithMiddleware(
    moduleName: string,
    params: MiddlewareParamsBase,
    setState: MiddlewareNextBase
  ): MiddlewareNextBase {
    // 检查缓存
    const cached = this.composedMiddlewareCache.get(moduleName);
    if (cached) {
      return cached;
    }

    try {
      if (this.middlewares.length === 0) {
        // 如果没有中间件，直接返回原始setState
        this.composedMiddlewareCache.set(moduleName, setState);
        return setState;
      }

      // 创建中间件链
      const middlewareChain = this.middlewares.map(middleware => {
        try {
          return middleware(params);
        } catch (error) {
          ErrorHandler.handleMiddlewareError(error, moduleName, 'middleware', 'setup');
          // 返回一个透传的中间件
          return (next: MiddlewareNextBase) => next;
        }
      });

      // 组合中间件链
      const composedMiddleware = compose<[MiddlewareNextBase], MiddlewareNextBase>(
        ...middlewareChain
      )(setState);

      // 缓存结果
      this.composedMiddlewareCache.set(moduleName, composedMiddleware);

      return composedMiddleware;
    } catch (error) {
      ErrorHandler.handleMiddlewareError(error, moduleName, 'middleware', 'compose');
      this.stats.errorCount++;

      // 返回原始setState作为fallback
      return setState;
    }
  }

  /**
   * 创建带有拦截器的action执行函数
   */
  createActionWithInterceptors(
    moduleName: string,
    params: InterceptorParamsBase,
    executeAction: InterceptorNextBase
  ): InterceptorNextBase {
    // 检查缓存
    const cached = this.composedInterceptorCache.get(moduleName);
    if (cached) {
      return cached;
    }

    try {
      if (this.interceptors.length === 0) {
        // 如果没有拦截器，直接返回原始执行函数
        this.composedInterceptorCache.set(moduleName, executeAction);
        return executeAction;
      }

      // 创建拦截器链
      const interceptorChain = this.interceptors.map(interceptor => {
        try {
          return interceptor(params);
        } catch (error) {
          ErrorHandler.handleMiddlewareError(error, moduleName, 'interceptor', 'setup');
          // 返回一个透传的拦截器
          return (next: InterceptorNextBase) => next;
        }
      });

      // 组合拦截器链
      const composedInterceptor = compose<[InterceptorNextBase], InterceptorNextBase>(
        ...interceptorChain
      )(executeAction);

      // 缓存结果
      this.composedInterceptorCache.set(moduleName, composedInterceptor);

      return composedInterceptor;
    } catch (error) {
      ErrorHandler.handleMiddlewareError(error, moduleName, 'interceptor', 'compose');
      this.stats.errorCount++;

      // 返回原始执行函数作为fallback
      return executeAction;
    }
  }

  /**
   * 执行中间件链
   */
  executeMiddleware(
    params: MiddlewareParamsBase,
    setState: MiddlewareNextBase,
    record: MiddlewareActionRecordBase
  ): any {
    this.stats.executionCount++;

    const composedMiddleware = this.createSetStateWithMiddleware(record.moduleName, params, setState);

    try {
      return composedMiddleware(record);
    } catch (error) {
      ErrorHandler.handleMiddlewareError(
        error,
        record.moduleName,
        record.actionName,
        'execution'
      );
      this.stats.errorCount++;

      // 直接调用原始setState作为fallback
      return setState(record);
    }
  }

  /**
   * 执行拦截器链
   */
  executeInterceptors(
    params: InterceptorParamsBase,
    executeAction: InterceptorNextBase,
    record: any
  ): any {
    this.stats.executionCount++;

    const composedInterceptor = this.createActionWithInterceptors(record.moduleName || 'unknown', params, executeAction);

    try {
      return composedInterceptor(record);
    } catch (error) {
      ErrorHandler.handleMiddlewareError(
        error,
        record.moduleName || 'unknown',
        record.actionName || 'unknown',
        'interceptor'
      );
      this.stats.errorCount++;

      // 直接调用原始执行函数作为fallback
      return executeAction(record);
    }
  }

  /**
   * 清理所有缓存
   */
  clearCache(): void {
    this.composedMiddlewareCache.clear();
    this.composedInterceptorCache.clear();
  }

  /**
   * 清理所有中间件和拦截器
   */
  clearAll(): void {
    this.middlewares.length = 0;
    this.interceptors.length = 0;
    this.clearCache();
    this.updateStats();
  }

  /**
   * 更新统计信息
   */
  private updateStats(): void {
    this.stats.middlewareCount = this.middlewares.length;
    this.stats.interceptorCount = this.interceptors.length;
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      ...this.stats,
      totalCount: this.stats.middlewareCount + this.stats.interceptorCount,
      errorRate: this.stats.executionCount > 0 
        ? this.stats.errorCount / this.stats.executionCount 
        : 0,
    };
  }

  /**
   * 获取详细信息
   */
  getInfo() {
    return {
      middlewares: this.middlewares.length,
      interceptors: this.interceptors.length,
      stats: this.getStats(),
      hasMiddlewares: this.middlewares.length > 0,
      hasInterceptors: this.interceptors.length > 0,
    };
  }

  /**
   * 检查是否有中间件
   */
  hasMiddlewares(): boolean {
    return this.middlewares.length > 0;
  }

  /**
   * 检查是否有拦截器
   */
  hasInterceptors(): boolean {
    return this.interceptors.length > 0;
  }

  /**
   * 创建一个安全的中间件执行器
   */
  createSafeMiddlewareExecutor(
    params: MiddlewareParamsBase,
    setState: MiddlewareNextBase
  ): MiddlewareNextBase {
    return (record: MiddlewareActionRecordBase) => {
      const composedMiddleware = this.createSetStateWithMiddleware(record.moduleName, params, setState);

      return ErrorHandler.safeExecute(
        () => composedMiddleware(record),
        (error) => {
          ErrorHandler.handleMiddlewareError(
            error,
            record.moduleName,
            record.actionName,
            'safe-execution'
          );
          return setState(record);
        },
        {
          moduleName: record.moduleName,
          actionName: record.actionName,
        }
      );
    };
  }

  /**
   * 创建一个安全的拦截器执行器
   */
  createSafeInterceptorExecutor(
    params: InterceptorParamsBase,
    executeAction: InterceptorNextBase
  ): InterceptorNextBase {
    return (record: any) => {
      const composedInterceptor = this.createActionWithInterceptors(record.moduleName || 'unknown', params, executeAction);

      return ErrorHandler.safeExecute(
        () => composedInterceptor(record),
        (error) => {
          ErrorHandler.handleMiddlewareError(
            error,
            record.moduleName || 'unknown',
            record.actionName || 'unknown',
            'safe-interceptor'
          );
          return executeAction(record);
        },
        {
          moduleName: record.moduleName,
          actionName: record.actionName,
        }
      );
    };
  }
} 