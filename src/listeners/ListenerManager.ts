import {
  ListenerBase,
  AllListenerBase,
  AllWatcherBase,
  WatchObjectBase,
  ModuleEventBase,
  ListenerAPIBase,
  WatchAPIBase,
} from '../ts';
import { ErrorHandler } from '../errors/StoreError';

/**
 * 监听器管理器，统一管理所有监听器
 */
export class ListenerManager {
  // 模块特定的监听器
  private listeners: Map<string, ListenerBase[]> = new Map();
  
  // 全局监听器
  private allListeners: AllListenerBase[] = [];
  
  // 监听器对象 - 用于watch功能
  private watchModule: Map<string, AllWatcherBase | WatchObjectBase | undefined> = new Map();
  
  // 是否已初始化
  private isInitialized = false;
  
  // 监听器统计
  private stats = {
    moduleListeners: 0,
    allListeners: 0,
    watchModules: 0,
    totalEvents: 0,
  };

  /**
   * 设置初始化状态
   */
  setInitialized(initialized: boolean): void {
    this.isInitialized = initialized;
  }

  /**
   * 添加模块监听器
   */
  subscribe(moduleName: string, listener: ListenerBase): () => void {
    // 验证参数
    if (typeof listener !== 'function') {
      ErrorHandler.createDevWarning('Listener must be a function', moduleName);
      return () => {};
    }

    // 获取或创建监听器数组
    let moduleListeners = this.listeners.get(moduleName);
    if (!moduleListeners) {
      moduleListeners = [];
      this.listeners.set(moduleName, moduleListeners);
    }

    // 添加监听器
    moduleListeners.push(listener);
    this.updateStats();

    // 返回取消订阅函数
    return () => {
      const listeners = this.listeners.get(moduleName);
      if (listeners) {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
          
          // 如果监听器数组为空，删除该模块的监听器映射
          if (listeners.length === 0) {
            this.listeners.delete(moduleName);
          }
          
          this.updateStats();
        }
      }
    };
  }

  /**
   * 添加全局监听器
   */
  subscribeAll(listener: AllListenerBase): () => void {
    // 验证参数
    if (typeof listener !== 'function') {
      ErrorHandler.createDevWarning('Global listener must be a function');
      return () => {};
    }

    this.allListeners.push(listener);
    this.updateStats();

    // 返回取消订阅函数
    return () => {
      const index = this.allListeners.indexOf(listener);
      if (index > -1) {
        this.allListeners.splice(index, 1);
        this.updateStats();
      }
    };
  }

  /**
   * 设置模块的watch
   */
  setModuleWatch(moduleName: string, watch: AllWatcherBase | WatchObjectBase | undefined): void {
    if (watch && typeof watch !== 'function' && typeof watch !== 'object') {
      ErrorHandler.createDevWarning('Watch must be a function or object', moduleName);
      return;
    }

    this.watchModule.set(moduleName, watch);
    this.updateStats();
  }

  /**
   * 获取模块的watch
   */
  getModuleWatch(moduleName: string): AllWatcherBase | WatchObjectBase | undefined {
    return this.watchModule.get(moduleName);
  }

  /**
   * 移除模块的watch
   */
  removeModuleWatch(moduleName: string): void {
    this.watchModule.delete(moduleName);
    this.updateStats();
  }

  /**
   * 运行监听器
   */
  runListeners(
    moduleName: string,
    event: ModuleEventBase,
    listenerAPI: ListenerAPIBase,
    createWatchAPI: (watcherModuleName: string) => WatchAPIBase
  ): void {
    // 如果未初始化，不运行监听器
    if (!this.isInitialized) {
      return;
    }

    this.stats.totalEvents++;

    try {
      // 运行模块特定的监听器
      this.runModuleListeners(moduleName, event, listenerAPI);
      
      // 运行全局监听器
      this.runAllListeners(moduleName, event, listenerAPI);
      
      // 运行watch监听器
      this.runWatchListeners(moduleName, event, createWatchAPI);
      
    } catch (error) {
      ErrorHandler.handleAsyncError(error, moduleName, event.actionName || 'listener');
    }
  }

  /**
   * 运行模块特定的监听器
   */
  private runModuleListeners(
    moduleName: string,
    event: ModuleEventBase,
    listenerAPI: ListenerAPIBase
  ): void {
    const moduleListeners = this.listeners.get(moduleName);
    if (!moduleListeners || moduleListeners.length === 0) {
      return;
    }

    // 使用副本避免在回调中修改监听器数组时出现问题
    const listenersCopy = [...moduleListeners];
    
    listenersCopy.forEach(listener => {
      try {
        listener(event, listenerAPI);
      } catch (error) {
        ErrorHandler.handleAsyncError(error, moduleName, event.actionName || 'moduleListener');
      }
    });
  }

  /**
   * 运行全局监听器
   */
  private runAllListeners(
    moduleName: string,
    event: ModuleEventBase,
    listenerAPI: ListenerAPIBase
  ): void {
    if (this.allListeners.length === 0) {
      return;
    }

    const allEvent = {
      ...event,
      moduleName,
    };

    // 使用副本避免在回调中修改监听器数组时出现问题
    const listenersCopy = [...this.allListeners];
    
    listenersCopy.forEach(listener => {
      try {
        listener(allEvent, listenerAPI);
      } catch (error) {
        ErrorHandler.handleAsyncError(error, moduleName, event.actionName || 'allListener');
      }
    });
  }

  /**
   * 运行watch监听器
   */
  private runWatchListeners(
    moduleName: string,
    event: ModuleEventBase,
    createWatchAPI: (watcherModuleName: string) => WatchAPIBase
  ): void {
    const watchEntries = Array.from(this.watchModule.entries());
    
    watchEntries.forEach(([watcherModuleName, target]) => {
      if (!target) return;

      const watcherAPI = createWatchAPI(watcherModuleName);

      try {
        if (typeof target === 'function') {
          // 全局watch函数
          target(
            {
              ...event,
              moduleName,
            },
            watcherAPI as any
          );
        } else if (typeof target === 'object' && target[moduleName]) {
          // 特定模块的watch
          if (typeof target[moduleName] === 'function') {
            target[moduleName](event, watcherAPI as any);
          }
        }
      } catch (error) {
        ErrorHandler.handleAsyncError(error, watcherModuleName, event.actionName || 'watch');
      }
    });
  }

  /**
   * 清理模块相关的所有监听器
   */
  clearModuleListeners(moduleName: string): void {
    this.listeners.delete(moduleName);
    this.watchModule.delete(moduleName);
    this.updateStats();
  }

  /**
   * 清理所有监听器
   */
  clearAllListeners(): void {
    this.listeners.clear();
    this.allListeners.length = 0;
    this.watchModule.clear();
    this.updateStats();
  }

  /**
   * 更新统计信息
   */
  private updateStats(): void {
    this.stats.moduleListeners = Array.from(this.listeners.values())
      .reduce((total, listeners) => total + listeners.length, 0);
    this.stats.allListeners = this.allListeners.length;
    this.stats.watchModules = this.watchModule.size;
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * 获取所有监听器信息
   */
  getListenersInfo() {
    return {
      moduleListeners: Object.fromEntries(
        Array.from(this.listeners.entries()).map(([moduleName, listeners]) => [
          moduleName,
          listeners.length,
        ])
      ),
      allListeners: this.allListeners.length,
      watchModules: Array.from(this.watchModule.keys()),
    };
  }

  /**
   * 检查是否有监听器
   */
  hasListeners(moduleName?: string): boolean {
    if (moduleName) {
      return (this.listeners.get(moduleName)?.length || 0) > 0;
    }
    return this.listeners.size > 0 || this.allListeners.length > 0;
  }

  /**
   * 暂停所有监听器
   */
  pause(): void {
    this.isInitialized = false;
  }

  /**
   * 恢复所有监听器
   */
  resume(): void {
    this.isInitialized = true;
  }
} 