import { CacheManager } from '../cache/CacheManager';
import { ModuleManager } from '../modules/ModuleManager';
import { ListenerManager } from '../listeners/ListenerManager';
import { MiddlewareManager } from '../middleware/MiddlewareManager';
import { ErrorHandler } from '../errors/StoreError';
import { isDefaultStoreModule, isStoreModule } from '../utils';
import {
  Modules,
  LazyStoreModules,
  StoreModule,
  InjectStoreModule,
  ListenerBase,
  AllListenerBase,
  MiddlewareBase,
  InterceptorBase,
  MiddlewareActionRecordBase,
  ModuleEventBase,
  GlobalResetStatesOption,
  StoreBase,
} from '../ts';
import { GenerateStoreType, Store } from '../ts/utils';

/**
 * 核心Store类，整合所有管理器
 */
export class StoreCore<M extends Modules, LM extends LazyStoreModules> {
  private cacheManager: CacheManager;
  private moduleManager: ModuleManager<M, LM>;
  private listenerManager: ListenerManager;
  private middlewareManager: MiddlewareManager;

  private isInitialized = false;
  private externalStore: any; // 保存外部Store引用



  // 类型定义
  type!: GenerateStoreType<M, LM>;

  constructor(
    modules: M,
    lazyModules: LM,
    options: {
      initStates?: Partial<{
        [k in keyof GenerateStoreType<M, LM>]: GenerateStoreType<M, LM>[k]['state'];
      }>;
      middlewares?: MiddlewareBase[];
      interceptors?: InterceptorBase[];
    } = {}
  ) {
    const { initStates = {}, middlewares = [], interceptors = [] } = options;
    
    // 初始化管理器
    this.cacheManager = new CacheManager();
    this.listenerManager = new ListenerManager();
    this.middlewareManager = new MiddlewareManager(middlewares, interceptors);
    this.moduleManager = new ModuleManager(modules, lazyModules, initStates, this.cacheManager);

    // 设置模块设置回调，处理globalSetStateCache
    this.moduleManager.setOnModuleSetCallback((moduleName: string) => {
      this.handleModuleSet(moduleName);
    });

    // 设置dispatch回调，让ModuleManager的actions代理能够调用Store的dispatch
    this.moduleManager.setDispatchCallback((moduleName: string, actionName: string, ...args: any[]) => {
      return this.internalDispatch(moduleName as any, actionName as any, ...args);
    });

    // 初始化Store
    this.init();
  }

  /**
   * 设置外部Store引用
   */
  setExternalStore(store: any): void {
    this.externalStore = store;
  }

  /**
   * 处理模块设置，应用缓存的全局状态
   */
  private handleModuleSet(moduleName: string): void {
    // 处理缓存的全局状态
    if (this.isInitialized) {
      const cachedStates = this.moduleManager.getGlobalSetStateCache();
      if (moduleName in cachedStates) {
        const state = cachedStates[moduleName as keyof typeof cachedStates];
        this.moduleManager.clearGlobalSetStateCache(moduleName);
        this.globalSetStates({ [moduleName]: state } as any);
      }
    }
  }

  /**
   * 初始化Store
   */
  private init(): void {
    this.isInitialized = true;
    this.listenerManager.setInitialized(true);
    
    // 通知所有同步模块的初始化事件
    const moduleNames = this.moduleManager.getAllModuleNames().filter(name => 
      this.moduleManager.hasModule(name)
    );
    
    moduleNames.forEach(moduleName => {
      this.runListeners(moduleName, {
        type: 'init',
        actionName: undefined,
        oldModule: undefined,
        newModule: this.getModule(moduleName),
      });
    });
  }

  /**
   * 获取模块
   */
  getModule<MN extends keyof GenerateStoreType<M, LM>>(
    moduleName: MN
  ): GenerateStoreType<M, LM>[MN] | undefined {
    return this.moduleManager.getModule(moduleName);
  }

  /**
   * 获取原始模块
   */
  getOriginModule(moduleName: string): StoreModule | undefined {
    return this.moduleManager.getOriginModule(moduleName);
  }

  /**
   * 检查模块是否存在
   */
  hasModule(moduleName: string): boolean {
    return this.moduleManager.hasModule(moduleName);
  }

  /**
   * 设置模块
   */
  setModule(moduleName: string, storeModule: StoreModule): this {
    const oldModule = this.hasModule(moduleName) ? this.getModule(moduleName) : undefined;

    // 清理该模块的中间件缓存
    this.clearMiddlewareCache(moduleName);

    // 设置模块
    this.moduleManager.setModule(moduleName, storeModule);

    // 运行监听器
    this.runListeners(moduleName, {
      type: 'init',
      actionName: undefined,
      oldModule,
      newModule: this.getModule(moduleName),
    });

    return this;
  }

  /**
   * 移除模块
   */
  removeModule(moduleName: string): this {
    const oldModule = this.getModule(moduleName);

    // 运行beforeRemove监听器
    this.runListeners(moduleName, {
      type: 'beforeRemove',
      actionName: undefined,
      oldModule,
      newModule: oldModule,
    });

    // 清理该模块的中间件缓存
    this.clearMiddlewareCache(moduleName);

    // 移除模块
    this.moduleManager.removeModule(moduleName);

    // 运行remove监听器
    this.runListeners(moduleName, {
      type: 'remove',
      actionName: undefined,
      oldModule,
      newModule: undefined,
    });

    // 清除监听器（在运行remove监听器之后）
    this.listenerManager.clearModuleListeners(moduleName);

    return this;
  }

  /**
   * 获取懒加载模块
   */
  getLazyModule(moduleName: string): (() => Promise<StoreModule>) | undefined {
    return this.moduleManager.getLazyModule(moduleName) as any;
  }

  /**
   * 加载懒加载模块
   */
  async loadModule(moduleName: string): Promise<InjectStoreModule | undefined> {
    // 如果已经加载，直接返回
    if (this.hasModule(moduleName)) {
      return this.getModule(moduleName as any);
    }

    const lazyModule = this.moduleManager.getLazyModule(moduleName);
    if (!lazyModule) {
      return undefined;
    }

    // 加载模块（不捕获错误，让错误传播）
    const loadedModule = await lazyModule();

    if (!loadedModule) {
      return undefined;
    }

    // 处理默认导出
    let storeModule: StoreModule;
    if (isDefaultStoreModule(loadedModule)) {
      storeModule = loadedModule.default;
    } else if (isStoreModule(loadedModule)) {
      storeModule = loadedModule;
    } else {
      return undefined;
    }

    // 通过Store层的setModule来设置模块，这样会触发监听器
    this.setModule(moduleName, storeModule);

    return this.getModule(moduleName as any);
  }

  /**
   * 设置懒加载模块
   */
  setLazyModule(
    moduleName: string,
    lazyModule: () => Promise<StoreModule>
  ): this {
    this.moduleManager.setLazyModule(moduleName, lazyModule);
    return this;
  }

  /**
   * 移除懒加载模块
   */
  removeLazyModule(moduleName: string): this {
    this.moduleManager.removeLazyModule(moduleName);
    return this;
  }

  /**
   * 添加模块监听器
   */
  subscribe(moduleName: string, listener: ListenerBase): () => void {
    return this.listenerManager.subscribe(moduleName, listener);
  }

  /**
   * 添加全局监听器
   */
  subscribeAll(listener: AllListenerBase): () => void {
    return this.listenerManager.subscribeAll(listener);
  }

  /**
   * 获取所有模块名
   */
  getAllModuleName(): string[] {
    return this.moduleManager.getAllModuleNames();
  }


  /**
   * 执行dispatch的核心逻辑
   * 参考原始createDispatch设计，使用CacheManager缓存最终执行函数
   */
  private executeDispatch<
    MN extends keyof GenerateStoreType<M, LM>,
    AN extends keyof GenerateStoreType<M, LM>[MN]['actions']
  >(
    moduleName: MN,
    actionName: AN,
    ...args: any[]
  ): any {
    const moduleNameStr = moduleName as string;

    // 使用CacheManager的专门dispatch缓存
    let cachedDispatch = this.cacheManager.getDispatchCache(moduleNameStr);
    if (!cachedDispatch) {
      cachedDispatch = this.createModuleDispatch(moduleNameStr);
      this.cacheManager.setDispatchCache(moduleNameStr, cachedDispatch);
    }

    return cachedDispatch(actionName as string, ...args);
  }

  /**
   * 为指定模块创建dispatch函数（参考原始createDispatch设计）
   */
  private createModuleDispatch(moduleName: string) {
    let middlewareParams = {
      setState: (record: MiddlewareActionRecordBase) => this.setState(record),
      getState: () => this.moduleManager.getOriginModule(moduleName)?.state,
      getMaps: () => this.moduleManager.getModule(moduleName)?.maps,
      getStore: () => this.externalStore || this,
      dispatch: (mn: string, an: string, ...args: any[]) => this.dispatch(mn as any, an as any, ...args),
    };

    const setStateWithMiddleware = this.middlewareManager.createSetStateWithMiddleware(
      moduleName,
      middlewareParams,
      (record: MiddlewareActionRecordBase) => this.setState(record)
    );

    const runActionWithInterceptors = this.middlewareManager.createActionWithInterceptors(
      moduleName,
      middlewareParams,
      (filterRecord: any) => {
        const result = this.moduleManager.dispatch(
          filterRecord.moduleName,
          filterRecord.actionName,
          ...filterRecord.actionArgs
        );

        return setStateWithMiddleware({
          moduleName: filterRecord.moduleName,
          actionName: filterRecord.actionName,
          state: result,
        });
      }
    );

    // 返回最终的dispatch函数
    return (actionName: string, ...args: any[]) => {
      const module = this.moduleManager.getOriginModule(moduleName);
      if (!module?.actions?.[actionName]) {
        return undefined;
      }

      return runActionWithInterceptors({
        moduleName,
        actionName,
        actionArgs: args,
        actionFunc: module.actions[actionName],
      });
    };
  }

  /**
   * 内部dispatch，用于actions代理，会进行严格验证并抛出错误
   */
  private internalDispatch<
    MN extends keyof GenerateStoreType<M, LM>,
    AN extends keyof GenerateStoreType<M, LM>[MN]['actions']
  >(
    moduleName: MN,
    actionName: AN,
    ...args: any[]
  ): any {
    // 验证模块存在，如果不存在则抛出错误
    this.moduleManager.validateModule(moduleName as string);

    return this.executeDispatch(moduleName, actionName, ...args);
  }

  /**
   * 执行dispatch
   */
  dispatch<
    MN extends keyof GenerateStoreType<M, LM>,
    AN extends keyof GenerateStoreType<M, LM>[MN]['actions']
  >(
    moduleName: MN,
    actionName: AN,
    ...args: any[]
  ): any {
    if (!this.hasModule(moduleName as string)) {
      return undefined as any;
    }

    return this.executeDispatch(moduleName, actionName, ...args);
  }

  /**
   * 全局设置状态
   */
  globalSetStates(
    states: Partial<{
      [k in keyof GenerateStoreType<M, LM>]: GenerateStoreType<M, LM>[k]['state'];
    }>
  ): void {
    this.moduleManager.globalSetStates(states, (moduleName: string) => {
      return this.createSetStateWithMiddleware(moduleName);
    });
  }

  /**
   * 全局重置状态
   */
  globalResetStates(options: GlobalResetStatesOption = {}): void {
    this.moduleManager.globalResetStates(options, (moduleName: string) => {
      return this.createSetStateWithMiddleware(moduleName);
    });
  }

  /**
   * 获取所有状态
   */
  getAllStates(): Partial<{
    [k in keyof GenerateStoreType<M, LM>]: GenerateStoreType<M, LM>[k]['state'];
  }> {
    return this.moduleManager.getAllStates();
  }

  /**
   * 销毁Store
   */
  destroy(): void {
    this.isInitialized = false;
    this.listenerManager.setInitialized(false);
    
    // 清理所有管理器
    this.moduleManager.destroy();
    this.listenerManager.clearAllListeners();
    this.middlewareManager.clearAll();
    this.cacheManager.clearAllCache();
  }

  /**
   * 创建带有中间件的setState函数
   */
  private createSetStateWithMiddleware(moduleName: string) {
    const middlewareParams = {
      setState: (record: MiddlewareActionRecordBase) => this.setState(record),
      getState: () => this.moduleManager.getOriginModule(moduleName)?.state,
      getMaps: () => this.moduleManager.getModule(moduleName)?.maps,
      getStore: () => this.externalStore || this,
      dispatch: (mn: string, an: string, ...args: any[]) => this.dispatch(mn as any, an as any, ...args),
    };

    return this.middlewareManager.createSetStateWithMiddleware(
      moduleName,
      middlewareParams,
      (record: MiddlewareActionRecordBase) => this.setState(record)
    );
  }

  /**
   * 设置状态
   */
  private setState(record: MiddlewareActionRecordBase): any {
    const { moduleName, actionName } = record;
    
    const oldModule = this.moduleManager.getModule(moduleName);
    const newState = this.moduleManager.setState(record);
    const newModule = this.moduleManager.getModule(moduleName);
    
    // 运行监听器
    this.runListeners(moduleName, {
      type: 'update',
      actionName,
      oldModule,
      newModule,
    });
    
    return newState;
  }

  /**
   * 运行监听器
   */
  private runListeners(moduleName: string, event: ModuleEventBase): void {
    const listenerAPI = {
      getState: () => this.moduleManager.getOriginModule(moduleName)?.state,
      getMaps: () => this.moduleManager.getModule(moduleName)?.maps,
      getStore: () => this.externalStore || this,
      dispatch: (mn: string, an: string, ...args: any[]) => 
        this.dispatch(mn as any, an as any, ...args),
    };

    const createWatchAPI = (watcherModuleName: string) => ({
      getState: () => this.moduleManager.getOriginModule(watcherModuleName)?.state,
      getMaps: () => this.moduleManager.getModule(watcherModuleName)?.maps,
      getStore: () => this.externalStore || this,
      localDispatch: (actionName: string, ...args: any[]) => 
        this.dispatch(watcherModuleName as any, actionName as any, ...args),
    });

    this.listenerManager.runListeners(moduleName, event, listenerAPI, createWatchAPI);
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      cache: this.cacheManager.getStats(),
      modules: this.moduleManager.getStats(),
      listeners: this.listenerManager.getStats(),
      middleware: this.middlewareManager.getStats(),
      isInitialized: this.isInitialized,
    };
  }

  /**
   * 获取详细信息
   */
  getInfo() {
    return {
      modules: this.moduleManager.getModuleInfo(),
      listeners: this.listenerManager.getListenersInfo(),
      middleware: this.middlewareManager.getInfo(),
      cache: this.cacheManager.getSizeInfo(),
      stats: this.getStats(),
    };
  }

  /**
   * 优化性能
   */
  optimize(): void {
    const activeModules = new Set(this.moduleManager.getAllModuleNames().filter(name =>
      this.hasModule(name)
    ));

    this.cacheManager.optimize(activeModules);
  }

  /**
   * 添加中间件
   */
  addMiddleware(middleware: MiddlewareBase): void {
    this.middlewareManager.addMiddleware(middleware);
    // 清理缓存，因为中间件链发生了变化
    this.clearMiddlewareCache();
  }

  /**
   * 添加拦截器
   */
  addInterceptor(interceptor: InterceptorBase): void {
    this.middlewareManager.addInterceptor(interceptor);
    // 清理缓存，因为拦截器链发生了变化
    this.clearMiddlewareCache();
  }

  /**
   * 清理模块级别的中间件缓存
   * 当中间件/拦截器发生变化或模块被移除时调用
   */
  private clearMiddlewareCache(moduleName?: string): void {
    if (moduleName) {
      // 清理特定模块的dispatch缓存和middlewareParams缓存
      this.cacheManager.clearModuleCache(moduleName);
      this.cacheManager.clearModuleCache(`middlewareParams_${moduleName}`);
      // 清理MiddlewareManager中的WeakMap缓存
      this.middlewareManager.clearCache();
    } else {
      // 清理所有dispatch缓存
      this.cacheManager.clearAllCache();
      this.middlewareManager.clearCache();
    }
  }
}