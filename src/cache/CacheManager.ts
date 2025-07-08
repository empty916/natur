import MapCache from '../MapCache';
import { Actions, InjectMaps, MiddlewareNextBase } from '../ts';

/**
 * 缓存管理器，统一管理所有缓存
 */
export class CacheManager {
  // 模块缓存
  private moduleCache = new Map<string, any>();
  
  // Actions代理缓存
  private actionsCache = new Map<string, Actions>();
  
  // Maps缓存 - 第一层：模块名，第二层：map名
  private mapsCache = new Map<string, Map<string, MapCache>>();
  
  // Maps缓存列表 - 用于快速遍历和清理
  private mapsCacheList = new Map<string, MapCache[]>();
  
  // setState代理缓存
  private setStateCache = new Map<string, MiddlewareNextBase>();

  // dispatch函数缓存
  private dispatchCache = new Map<string, Function>();
  
  // 性能统计
  private stats = {
    hits: 0,
    misses: 0,
    clears: 0,
  };

  /**
   * 获取模块缓存
   */
  getModuleCache<T>(moduleName: string): T | undefined {
    const cached = this.moduleCache.get(moduleName);
    if (cached) {
      this.stats.hits++;
      return cached;
    }
    this.stats.misses++;
    return undefined;
  }

  /**
   * 设置模块缓存
   */
  setModuleCache<T>(moduleName: string, value: T): void {
    this.moduleCache.set(moduleName, value);
  }

  /**
   * 获取Actions缓存
   */
  getActionsCache(moduleName: string): Actions | undefined {
    const cached = this.actionsCache.get(moduleName);
    if (cached) {
      this.stats.hits++;
      return cached;
    }
    this.stats.misses++;
    return undefined;
  }

  /**
   * 设置Actions缓存
   */
  setActionsCache(moduleName: string, actions: Actions): void {
    this.actionsCache.set(moduleName, actions);
  }

  /**
   * 获取Maps缓存
   */
  getMapsCache(moduleName: string): Map<string, MapCache> | undefined {
    return this.mapsCache.get(moduleName);
  }

  /**
   * 设置Maps缓存
   */
  setMapsCache(moduleName: string, mapName: string, mapCache: MapCache): void {
    let moduleMapCache = this.mapsCache.get(moduleName);
    if (!moduleMapCache) {
      moduleMapCache = new Map<string, MapCache>();
      this.mapsCache.set(moduleName, moduleMapCache);
    }
    moduleMapCache.set(mapName, mapCache);

    // 同时更新mapsCacheList
    let cacheList = this.mapsCacheList.get(moduleName);
    if (!cacheList) {
      cacheList = [];
      this.mapsCacheList.set(moduleName, cacheList);
    }
    cacheList.push(mapCache);
  }

  /**
   * 获取Maps缓存列表
   */
  getMapsCacheList(moduleName: string): MapCache[] {
    return this.mapsCacheList.get(moduleName) || [];
  }

  /**
   * 通知Maps缓存需要检查有效性
   */
  invalidateMapsCache(moduleName: string): void {
    const cacheList = this.mapsCacheList.get(moduleName);
    if (cacheList) {
      cacheList.forEach(cache => cache.shouldCheckCache());
    }
  }

  /**
   * 获取setState缓存
   */
  getSetStateCache(moduleName: string): MiddlewareNextBase | undefined {
    const cached = this.setStateCache.get(moduleName);
    if (cached) {
      this.stats.hits++;
      return cached;
    }
    this.stats.misses++;
    return undefined;
  }

  /**
   * 设置setState缓存
   */
  setSetStateCache(moduleName: string, setter: MiddlewareNextBase): void {
    this.setStateCache.set(moduleName, setter);
  }

  /**
   * 获取dispatch缓存
   */
  getDispatchCache(moduleName: string): Function | undefined {
    const cached = this.dispatchCache.get(moduleName);
    if (cached) {
      this.stats.hits++;
      return cached;
    }
    this.stats.misses++;
    return undefined;
  }

  /**
   * 设置dispatch缓存
   */
  setDispatchCache(moduleName: string, dispatch: Function): void {
    this.dispatchCache.set(moduleName, dispatch);
  }

  /**
   * 检查模块缓存是否有效
   */
  isModuleCacheValid(moduleName: string, currentState: any): boolean {
    const cached = this.moduleCache.get(moduleName);
    return cached && cached.state === currentState;
  }

  /**
   * 清除指定模块的所有缓存
   */
  clearModuleCache(moduleName: string): void {
    // 清理Maps缓存
    const mapsCacheList = this.mapsCacheList.get(moduleName);
    if (mapsCacheList) {
      mapsCacheList.forEach(cache => cache.destroy());
    }

    // 清理所有缓存
    this.moduleCache.delete(moduleName);
    this.actionsCache.delete(moduleName);
    this.mapsCache.delete(moduleName);
    this.mapsCacheList.delete(moduleName);
    this.setStateCache.delete(moduleName);
    this.dispatchCache.delete(moduleName);

    this.stats.clears++;
  }

  /**
   * 只清除模块缓存，保留Maps缓存结构
   */
  clearModuleCacheOnly(moduleName: string): void {
    // 只清理模块和Actions缓存，保留Maps缓存
    this.moduleCache.delete(moduleName);
    this.actionsCache.delete(moduleName);
    this.setStateCache.delete(moduleName);
    this.dispatchCache.delete(moduleName);

    this.stats.clears++;
  }

  /**
   * 清除所有缓存
   */
  clearAllCache(): void {
    // 先销毁所有MapCache实例
    this.mapsCacheList.forEach(cacheList => {
      cacheList.forEach(cache => cache.destroy());
    });
    
    // 清理所有缓存
    this.moduleCache.clear();
    this.actionsCache.clear();
    this.mapsCache.clear();
    this.mapsCacheList.clear();
    this.setStateCache.clear();
    this.dispatchCache.clear();
    
    // 重置统计
    this.stats = { hits: 0, misses: 0, clears: 0 };
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    return {
      ...this.stats,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
      totalSize: this.moduleCache.size + this.actionsCache.size + this.mapsCache.size,
    };
  }

  /**
   * 获取缓存大小信息
   */
  getSizeInfo() {
    return {
      moduleCache: this.moduleCache.size,
      actionsCache: this.actionsCache.size,
      mapsCache: this.mapsCache.size,
      mapsCacheList: this.mapsCacheList.size,
      setStateCache: this.setStateCache.size,
      dispatchCache: this.dispatchCache.size,
    };
  }

  /**
   * 优化内存使用 - 清理未使用的缓存
   */
  optimize(activeModules: Set<string>): void {
    // 清理不再活跃的模块缓存
    const allCachedModules = new Set([
      ...Array.from(this.moduleCache.keys()),
      ...Array.from(this.actionsCache.keys()),
      ...Array.from(this.mapsCache.keys()),
      ...Array.from(this.setStateCache.keys()),
      ...Array.from(this.dispatchCache.keys()),
    ]);

    allCachedModules.forEach(moduleName => {
      if (!activeModules.has(moduleName)) {
        this.clearModuleCache(moduleName);
      }
    });
  }

  /**
   * 预热缓存 - 为指定模块预先创建缓存结构
   */
  warmup(moduleName: string): void {
    if (!this.mapsCache.has(moduleName)) {
      this.mapsCache.set(moduleName, new Map());
    }
    if (!this.mapsCacheList.has(moduleName)) {
      this.mapsCacheList.set(moduleName, []);
    }
  }
} 