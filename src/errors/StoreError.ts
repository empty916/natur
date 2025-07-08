/**
 * 自定义Store错误类
 */
export class StoreError extends Error {
  constructor(
    message: string,
    public code: string,
    public moduleName?: string,
    public actionName?: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'StoreError';
    
    // 保持错误堆栈信息
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StoreError);
    }
  }
}

/**
 * 错误处理工具类
 */
export class ErrorHandler {
  /**
   * 验证模块是否存在
   */
  static validateModuleExists(moduleName: string, exists: boolean): void {
    if (!exists) {
      throw new StoreError(
        `module: ${moduleName} is not valid!`,
        'MODULE_NOT_FOUND',
        moduleName
      );
    }
  }

  /**
   * 验证Action是否存在
   */
  static validateActionExists(
    moduleName: string,
    actionName: string,
    exists: boolean
  ): void {
    if (!exists) {
      throw new StoreError(
        `Action '${actionName}' does not exist in module '${moduleName}'`,
        'ACTION_NOT_FOUND',
        moduleName,
        actionName
      );
    }
  }

  /**
   * 验证StoreModule结构
   */
  static validateStoreModule(moduleName: string, storeModule: any): void {
    if (!storeModule || typeof storeModule !== 'object') {
      throw new StoreError(
        `Invalid store module definition for '${moduleName}'`,
        'INVALID_MODULE_DEFINITION',
        moduleName
      );
    }

    if (storeModule.state === undefined) {
      throw new StoreError(
        `Module '${moduleName}' must have a state property`,
        'MISSING_STATE',
        moduleName
      );
    }

    if (!storeModule.actions || typeof storeModule.actions !== 'object') {
      throw new StoreError(
        `Module '${moduleName}' must have an actions property`,
        'MISSING_ACTIONS',
        moduleName
      );
    }

    // 验证actions中的每个函数
    Object.keys(storeModule.actions).forEach(actionName => {
      if (typeof storeModule.actions[actionName] !== 'function') {
        throw new StoreError(
          `Action '${actionName}' in module '${moduleName}' must be a function`,
          'INVALID_ACTION_TYPE',
          moduleName,
          actionName
        );
      }
    });

    // 验证maps（如果存在）
    if (storeModule.maps) {
      if (typeof storeModule.maps !== 'object') {
        throw new StoreError(
          `Maps in module '${moduleName}' must be an object`,
          'INVALID_MAPS_TYPE',
          moduleName
        );
      }

      Object.keys(storeModule.maps).forEach(mapName => {
        const mapValue = storeModule.maps[mapName];
        if (!Array.isArray(mapValue) && typeof mapValue !== 'function') {
          throw new StoreError(
            `Map '${mapName}' in module '${moduleName}' must be an array or function`,
            'INVALID_MAP_TYPE',
            moduleName,
            mapName
          );
        }
      });
    }
  }

  /**
   * 验证懒加载模块
   */
  static validateLazyModule(moduleName: string, lazyModule: any): void {
    if (typeof lazyModule !== 'function') {
      throw new StoreError(
        `Lazy module '${moduleName}' must be a function that returns a Promise`,
        'INVALID_LAZY_MODULE',
        moduleName
      );
    }
  }

  /**
   * 处理异步错误
   */
  static handleAsyncError(
    error: any,
    moduleName: string,
    actionName: string
  ): void {
    const storeError = new StoreError(
      `Async error in ${moduleName}.${actionName}: ${error.message || error}`,
      'ASYNC_ACTION_ERROR',
      moduleName,
      actionName,
      error instanceof Error ? error : new Error(String(error))
    );

    // 只在开发环境且不在测试环境中输出错误日志
    if (process.env.NODE_ENV === 'development' && !process.env.JEST_WORKER_ID) {
      console.error('Store Async Error:', storeError);
    }
    
    // 可以添加错误上报逻辑
    // this.reportError(storeError);
  }

  /**
   * 处理中间件错误
   */
  static handleMiddlewareError(
    error: any,
    moduleName: string,
    actionName: string,
    middlewareName?: string
  ): void {
    const storeError = new StoreError(
      `Middleware error in ${moduleName}.${actionName}${middlewareName ? ` (${middlewareName})` : ''}: ${error.message || error}`,
      'MIDDLEWARE_ERROR',
      moduleName,
      actionName,
      error instanceof Error ? error : new Error(String(error))
    );

    console.error('Store Middleware Error:', storeError);
  }

  /**
   * 创建开发环境警告
   */
  static createDevWarning(message: string, moduleName?: string): void {
    if (process.env.NODE_ENV === 'development' && !process.env.JEST_WORKER_ID) {
      console.warn(`[Store Warning]${moduleName ? ` [${moduleName}]` : ''}: ${message}`);
    }
  }

  /**
   * 安全地执行函数，捕获错误
   */
  static safeExecute<T>(
    fn: () => T,
    errorHandler?: (error: any) => T,
    context?: { moduleName?: string; actionName?: string }
  ): T {
    try {
      return fn();
    } catch (error) {
      if (errorHandler) {
        return errorHandler(error);
      }
      
      if (context) {
        this.handleAsyncError(error, context.moduleName || 'unknown', context.actionName || 'unknown');
      }
      
      throw error;
    }
  }
}

/**
 * 错误代码常量
 */
export const ERROR_CODES = {
  MODULE_NOT_FOUND: 'MODULE_NOT_FOUND',
  ACTION_NOT_FOUND: 'ACTION_NOT_FOUND',
  INVALID_MODULE_DEFINITION: 'INVALID_MODULE_DEFINITION',
  INVALID_LAZY_MODULE: 'INVALID_LAZY_MODULE',
  MISSING_STATE: 'MISSING_STATE',
  MISSING_ACTIONS: 'MISSING_ACTIONS',
  INVALID_ACTION_TYPE: 'INVALID_ACTION_TYPE',
  ASYNC_ACTION_ERROR: 'ASYNC_ACTION_ERROR',
  MIDDLEWARE_ERROR: 'MIDDLEWARE_ERROR',
  STORE_DESTROYED: 'STORE_DESTROYED',
  INVALID_LISTENER: 'INVALID_LISTENER',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES]; 