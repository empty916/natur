import MapCache from '../MapCache';
import { isDefaultStoreModule, isStoreModule } from '../utils';
import { CacheManager } from '../cache/CacheManager';
import { ErrorHandler } from '../errors/StoreError';
import {
  Modules,
  LazyStoreModules,
  StoreModule,
  InjectStoreModule,
  InjectMaps,
  Actions,
  Action,
  MiddlewareActionRecordBase,
  MiddlewareNextBase,
  GlobalResetStatesOption,
} from '../ts';
import { GenerateStoreType } from '../ts/utils';

/**
 * 模块管理器，统一管理所有模块
 */
export class ModuleManager<M extends Modules, LM extends LazyStoreModules> {
  private modules: Partial<{
    [k in keyof GenerateStoreType<M, LM>]: StoreModule;
  }> = {};
  
  private lazyModules: LM;
  private initStates: Partial<{
    [k in keyof GenerateStoreType<M, LM>]: GenerateStoreType<M, LM>[k]['state'];
  }>;
  
  // 重置状态数据
  private resetStateData: Partial<{
    [k in keyof GenerateStoreType<M, LM>]: GenerateStoreType<M, LM>[k]['state'];
  }> = {};
  
  // 全局状态缓存
  private globalSetStateCache: Partial<{
    [k in keyof GenerateStoreType<M, LM>]: GenerateStoreType<M, LM>[k]['state'];
  }> = {};
  
  // 所有模块名缓存
  private allModuleNames: string[] | undefined;
  
  // watch模块映射
  private watchModules = new Map<string, any>();

  // 模块设置回调
  private onModuleSetCallback?: (moduleName: string) => void;

  // dispatch回调
  private dispatchCallback?: (moduleName: string, actionName: string, ...args: any[]) => any;

  // 依赖注入
  private cacheManager: CacheManager;
  
  // 统计信息
  private stats = {
    loadedModules: 0,
    lazyModules: 0,
    totalModules: 0,
    stateUpdates: 0,
    errors: 0,
  };

  constructor(
    modules: M,
    lazyModules: LM,
    initStates: Partial<{
      [k in keyof GenerateStoreType<M, LM>]: GenerateStoreType<M, LM>[k]['state'];
    }> = {},
    cacheManager: CacheManager
  ) {
    this.lazyModules = { ...lazyModules };
    this.initStates = { ...initStates };
    this.cacheManager = cacheManager;
    
    // 初始化同步模块
    this.initializeSyncModules(modules);
    this.updateStats();
  }

  /**
   * 初始化同步模块
   */
  private initializeSyncModules(modules: M): void {
    Object.keys(modules).forEach(moduleName => {
      const module = modules[moduleName as keyof M];
      if (module) {
        this.setModuleInternal(moduleName, module as any, false);
      }
    });
  }

  /**
   * 替换模块（处理初始状态）
   */
  private replaceModule(moduleName: string, storeModule: StoreModule): StoreModule {
    // 缓存重置状态
    this.resetStateData[moduleName as keyof GenerateStoreType<M, LM>] = storeModule.state;
    
    // 处理watch
    const { watch, ...restData } = storeModule;
    if (watch) {
      this.watchModules.set(moduleName, watch);
    }
    
    // 处理初始状态
    const initState = this.initStates[moduleName as keyof GenerateStoreType<M, LM>];
    if (initState !== undefined) {
      delete this.initStates[moduleName as keyof GenerateStoreType<M, LM>];
      return {
        ...restData,
        state: initState,
      };
    }
    
    return { ...restData };
  }

  /**
   * 检查模块是否存在
   */
  hasModule(moduleName: string): boolean {
    return !!this.modules[moduleName as keyof GenerateStoreType<M, LM>];
  }

  /**
   * 验证模块是否有效
   */
  public validateModule(moduleName: string): void {
    ErrorHandler.validateModuleExists(moduleName, this.hasModule(moduleName));
  }

  /**
   * 获取模块
   */
  getModule<MN extends keyof GenerateStoreType<M, LM>>(
    moduleName: MN
  ): GenerateStoreType<M, LM>[MN] | undefined {
    if (!this.hasModule(moduleName as string)) {
      return undefined;
    }

    const module = this.modules[moduleName];
    if (!module) {
      return undefined;
    }

    // 使用简单的缓存策略，参考原始实现
    const cacheKey = moduleName as string;
    const cachedModule = this.cacheManager.getModuleCache<GenerateStoreType<M, LM>[MN]>(cacheKey);

    // 检查缓存：状态引用相同
    if (cachedModule && cachedModule.state === module.state) {
      return cachedModule;
    }

    const actionsProxy = this.createActionsProxy(moduleName as string);
    const mapsProxy = this.createMapsProxy(moduleName as string);

    // 创建新的模块代理
    const proxyModule = {
      state: module.state,
      actions: actionsProxy,
      maps: mapsProxy,
    } as GenerateStoreType<M, LM>[MN];

    // 缓存结果
    this.cacheManager.setModuleCache(cacheKey, proxyModule);

    return proxyModule;
  }

  /**
   * 获取原始模块
   */
  getOriginModule(moduleName: string): StoreModule | undefined {
    return this.modules[moduleName as keyof GenerateStoreType<M, LM>];
  }

  /**
   * 创建Actions代理
   */
  private createActionsProxy(moduleName: string): Actions {
    // 检查缓存
    const cached = this.cacheManager.getActionsCache(moduleName);
    if (cached) {
      return cached;
    }

    const module = this.modules[moduleName as keyof GenerateStoreType<M, LM>];
    if (!module?.actions) {
      const emptyActions = {} as Actions;
      this.cacheManager.setActionsCache(moduleName, emptyActions);
      return emptyActions;
    }

    const actionsProxy = { ...module.actions };
    
    // 为每个action创建代理（使用dispatch回调）
    Object.keys(actionsProxy).forEach(actionName => {
      const originalAction = actionsProxy[actionName];
      if (typeof originalAction === 'function') {
        actionsProxy[actionName] = (...args: any[]) => {
          if (this.dispatchCallback) {
            return this.dispatchCallback(moduleName, actionName, ...args);
          }
          // 如果没有dispatch回调，直接调用原始action（这不应该发生）
          return originalAction(...args);
        };
      }
    });

    // 缓存结果
    this.cacheManager.setActionsCache(moduleName, actionsProxy);
    
    return actionsProxy;
  }



  /**
   * 创建Maps代理，使用MapCache进行缓存优化
   */
  private createMapsProxy(moduleName: string): InjectMaps | undefined {
    const module = this.modules[moduleName as keyof GenerateStoreType<M, LM>];
    if (!module?.maps) {
      return undefined;
    }

    const maps = module.maps;
    const proxyMaps: { [p: string]: any } = {};

    // 确保模块有Maps缓存结构
    this.cacheManager.warmup(moduleName);
    const moduleMapCache = this.cacheManager.getMapsCache(moduleName);

    for (const key in maps) {
      if (maps.hasOwnProperty(key)) {
        // 检查是否已有缓存
        let mapCache = moduleMapCache?.get(key);
        if (!mapCache) {
          // 创建新的MapCache
          const targetMap = maps[key];
          let mapCacheParams: (string | Function)[] = [];

          if (Array.isArray(targetMap)) {
            mapCacheParams = targetMap;
          } else if (typeof targetMap === 'function') {
            if (targetMap.length === 0) {
              // 无参数函数
              mapCacheParams = [() => undefined, targetMap];
            } else {
              // 有参数函数，传入整个state
              mapCacheParams = [() => module.state, targetMap];
            }
          } else {
            // 其他类型，直接返回值
            proxyMaps[key] = targetMap;
            continue;
          }

          mapCache = new MapCache(
            () => module.state,
            mapCacheParams as Array<string | Function>
          );
          this.cacheManager.setMapsCache(moduleName, key, mapCache);
        }

        proxyMaps[key] = mapCache.getValue();
      }
    }

    return proxyMaps;
  }

  /**
   * 为模块创建dispatch函数
   */
  private createDispatchForModule(moduleName: string): Action {
    return (actionName: string, ...args: any[]) => {
      this.validateModule(moduleName);
      const module = this.modules[moduleName as keyof GenerateStoreType<M, LM>];
      
      if (!module?.actions?.[actionName]) {
        ErrorHandler.validateActionExists(moduleName, actionName, false);
        return;
      }
      
      try {
        // 直接调用原始action，不经过中间件
        // 中间件处理在Store层的dispatch中处理
        // action函数只接收用户传入的参数，不需要state参数
        const result = module.actions[actionName](...args);
        return result;
      } catch (error) {
        ErrorHandler.handleAsyncError(error, moduleName, actionName);
        throw error;
      }
    };
  }

  /**
   * 添加dispatch函数，供Store调用
   */
  dispatch(moduleName: string, actionName: string, ...args: any[]): any {
    return this.createDispatchForModule(moduleName)(actionName, ...args);
  }

  /**
   * 设置模块状态
   */
  setState(record: MiddlewareActionRecordBase): any {
    const { moduleName, state: newState } = record;
    
    const module = this.modules[moduleName as keyof GenerateStoreType<M, LM>];
    if (!module) {
      ErrorHandler.validateModuleExists(moduleName, false);
      return;
    }

    // 检查状态是否真的改变了
    if (module.state === newState) {
      return newState;
    }

    // 更新状态
    module.state = newState;
    this.stats.stateUpdates++;

    // 通知Maps缓存需要检查有效性，而不是销毁缓存
    this.cacheManager.invalidateMapsCache(moduleName);

    // 清除模块缓存（但保留Maps缓存结构）
    this.cacheManager.clearModuleCacheOnly(moduleName);

    return newState;
  }

  /**
   * 设置模块设置回调
   */
  setOnModuleSetCallback(callback: (moduleName: string) => void): void {
    this.onModuleSetCallback = callback;
  }

  /**
   * 设置dispatch回调
   */
  setDispatchCallback(callback: (moduleName: string, actionName: string, ...args: any[]) => any): void {
    this.dispatchCallback = callback;
  }

  /**
   * 设置模块
   */
  setModule(moduleName: string, storeModule: StoreModule): void {
    this.setModuleInternal(moduleName, storeModule, true);

    // 通知回调
    if (this.onModuleSetCallback) {
      this.onModuleSetCallback(moduleName);
    }
  }

  /**
   * 内部设置模块方法
   */
  private setModuleInternal(
    moduleName: string,
    storeModule: StoreModule,
    clearCache: boolean
  ): void {
    // 验证模块
    ErrorHandler.validateStoreModule(moduleName, storeModule);
    
    const isModuleExist = this.hasModule(moduleName);
    
    // 设置模块
    this.modules[moduleName as keyof GenerateStoreType<M, LM>] = 
      this.replaceModule(moduleName, storeModule);
    
    // 清理缓存
    if (clearCache && isModuleExist) {
      this.cacheManager.clearModuleCache(moduleName);
    }
    
    // 重置模块名缓存
    this.allModuleNames = undefined;
    
    // 初始化缓存结构
    this.cacheManager.warmup(moduleName);
    
    this.updateStats();
  }

  /**
   * 移除模块
   */
  removeModule(moduleName: string): void {
    if (!this.hasModule(moduleName)) {
      ErrorHandler.createDevWarning(`Module ${moduleName} does not exist`, moduleName);
      return;
    }

    // 删除模块
    delete this.modules[moduleName as keyof GenerateStoreType<M, LM>];
    delete this.lazyModules[moduleName as keyof LM];
    
    // 清理缓存
    this.cacheManager.clearModuleCache(moduleName);
    this.watchModules.delete(moduleName);
    
    // 重置模块名缓存
    this.allModuleNames = undefined;
    
    this.updateStats();
  }

  /**
   * 获取懒加载模块
   */
  getLazyModule(moduleName: string): (() => Promise<StoreModule | { default: StoreModule }>) | undefined {
    return this.lazyModules[moduleName as keyof LM];
  }

  /**
   * 加载懒加载模块
   */
  async loadModule(moduleName: string): Promise<InjectStoreModule | undefined> {
    // 如果已经加载，直接返回
    if (this.hasModule(moduleName)) {
      return this.getModule(moduleName as keyof GenerateStoreType<M, LM>);
    }

    const lazyModule = this.getLazyModule(moduleName);
    if (!lazyModule) {
      ErrorHandler.createDevWarning(`Lazy module ${moduleName} does not exist`, moduleName);
      return undefined;
    }

    // 不捕获错误，让错误传播到调用者（与原始代码行为一致）
    const loadedModule = await lazyModule();

    if (!loadedModule) {
      ErrorHandler.createDevWarning(`Lazy module ${moduleName} returned undefined`, moduleName);
      return undefined;
    }

    // 处理默认导出
    if (isDefaultStoreModule(loadedModule)) {
      this.setModule(moduleName, loadedModule.default);
    } else if (isStoreModule(loadedModule)) {
      this.setModule(moduleName, loadedModule);
    } else {
      ErrorHandler.validateStoreModule(moduleName, loadedModule);
      return undefined;
    }

    return this.getModule(moduleName as keyof GenerateStoreType<M, LM>);
  }

  /**
   * 设置懒加载模块
   */
  setLazyModule(moduleName: string, lazyModule: () => Promise<StoreModule | { default: StoreModule }>): void {
    ErrorHandler.validateLazyModule(moduleName, lazyModule);
    
    this.lazyModules[moduleName as keyof LM] = lazyModule as any;
    this.allModuleNames = undefined;
    this.updateStats();
  }

  /**
   * 移除懒加载模块
   */
  removeLazyModule(moduleName: string): void {
    delete this.lazyModules[moduleName as keyof LM];
    this.allModuleNames = undefined;
    this.updateStats();
  }

  /**
   * 全局设置状态
   */
  globalSetStates(
    states: Partial<{
      [k in keyof GenerateStoreType<M, LM>]: GenerateStoreType<M, LM>[k]['state'];
    }>,
    setStateWithMiddleware: (moduleName: string) => MiddlewareNextBase
  ): void {
    Object.keys(states).forEach(moduleName => {
      const state = states[moduleName as keyof GenerateStoreType<M, LM>];
      
      if (this.hasModule(moduleName)) {
        const setter = setStateWithMiddleware(moduleName);
        setter({
          moduleName,
          actionName: 'globalSetStates',
          state,
        });
      } else {
        // 缓存懒加载模块的状态
        this.globalSetStateCache[moduleName as keyof GenerateStoreType<M, LM>] = state;
      }
    });
  }

  /**
   * 全局重置状态
   */
  globalResetStates(
    options: GlobalResetStatesOption = {},
    setStateWithMiddleware: (moduleName: string) => MiddlewareNextBase
  ): void {
    const { include, exclude } = options;
    
    let shouldResetModules = Object.keys(this.resetStateData).filter(moduleName => 
      this.hasModule(moduleName)
    );

    // 处理排除列表
    if (exclude) {
      const stringExclude = exclude.filter(ex => typeof ex === 'string') as string[];
      const regExpExclude = exclude.filter(ex => typeof ex !== 'string') as RegExp[];
      
      shouldResetModules = shouldResetModules.filter(moduleName => {
        return (
          stringExclude.indexOf(moduleName) === -1 &&
          !regExpExclude.some(reg => reg.test(moduleName))
        );
      });
    }

    // 处理包含列表
    if (include) {
      const stringInclude = include.filter(ex => typeof ex === 'string') as string[];
      const regExpInclude = include.filter(ex => typeof ex !== 'string') as RegExp[];
      
      shouldResetModules = shouldResetModules.filter(moduleName => {
        return (
          stringInclude.indexOf(moduleName) > -1 ||
          regExpInclude.some(reg => reg.test(moduleName))
        );
      });
    }

    // 重置状态
    shouldResetModules.forEach(moduleName => {
      const setter = setStateWithMiddleware(moduleName);
      setter({
        moduleName,
        actionName: 'globalResetStates',
        state: this.resetStateData[moduleName as keyof GenerateStoreType<M, LM>],
      });
    });
  }

  /**
   * 获取缓存的全局状态
   */
  getGlobalSetStateCache() {
    return { ...this.globalSetStateCache };
  }

  /**
   * 清理全局状态缓存
   */
  clearGlobalSetStateCache(moduleName: string): void {
    delete this.globalSetStateCache[moduleName as keyof GenerateStoreType<M, LM>];
  }

  /**
   * 获取所有模块名
   */
  getAllModuleNames(): string[] {
    if (!this.allModuleNames) {
      this.allModuleNames = Object.keys({
        ...this.modules,
        ...this.lazyModules,
      });
    }
    return this.allModuleNames;
  }

  /**
   * 获取所有状态
   */
  getAllStates(): Partial<{
    [k in keyof GenerateStoreType<M, LM>]: GenerateStoreType<M, LM>[k]['state'];
  }> {
    const states: any = {};
    
    Object.keys(this.modules).forEach(moduleName => {
      const module = this.modules[moduleName as keyof GenerateStoreType<M, LM>];
      if (module) {
        states[moduleName] = module.state;
      }
    });
    
    return states;
  }

  /**
   * 获取模块的watch
   */
  getModuleWatch(moduleName: string): any {
    return this.watchModules.get(moduleName);
  }

  /**
   * 获取所有watch模块
   */
  getAllWatchModules(): Map<string, any> {
    return new Map(this.watchModules);
  }

  /**
   * 销毁所有模块
   */
  destroy(): void {
    // 清理所有模块
    Object.keys(this.modules).forEach(moduleName => {
      this.cacheManager.clearModuleCache(moduleName);
    });
    
    // 清理数据
    this.modules = {};
    this.lazyModules = {} as LM;
    this.resetStateData = {};
    this.globalSetStateCache = {};
    this.watchModules.clear();
    this.allModuleNames = undefined;
    
    this.updateStats();
  }

  /**
   * 更新统计信息
   */
  private updateStats(): void {
    this.stats.loadedModules = Object.keys(this.modules).length;
    this.stats.lazyModules = Object.keys(this.lazyModules).length;
    this.stats.totalModules = this.stats.loadedModules + this.stats.lazyModules;
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      ...this.stats,
      watchModules: this.watchModules.size,
      cacheStats: this.cacheManager.getStats(),
    };
  }

  /**
   * 获取模块信息
   */
  getModuleInfo() {
    return {
      loaded: Object.keys(this.modules),
      lazy: Object.keys(this.lazyModules),
      watch: Array.from(this.watchModules.keys()),
      stats: this.getStats(),
    };
  }
} 