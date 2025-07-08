/**
 * @author empty916
 * @email [empty916@qq.com]
 * @create date 2019-08-09 17:12:36
 * @modify date 2019-08-09 17:12:36
 * @desc [description]
 */
import { StoreCore } from "./core/Store";
import { GenerateStoreType } from "./ts/utils";
import {
	LazyStoreModules,
	MiddlewareBase,
	InterceptorBase,
	Modules,
	Store,
	StoreModule,
	ListenerBase,
	AllListenerBase,
	GlobalResetStatesOption,
} from "./ts";

/**
 *
 * @param modules 同步模块, 你的store模块
 * @param lazyModules 懒加载模块， 必填，如果没有可以传{}, 如果不填，那么ts的类型推断会有问题
 * @param options 选项配置，详情见文档
 */
const createStore = <M extends Modules, LM extends LazyStoreModules>(
	modules: M = {} as M,
	lazyModules: LM,
	options: {
		initStates?: Partial<{
			[k in keyof GenerateStoreType<M, LM>]: GenerateStoreType<
				M,
				LM
			>[k]["state"];
		}>;
		middlewares?: MiddlewareBase[];
		interceptors?: InterceptorBase[];
	} = {}
) => {
	// 创建核心Store实例
	const storeCore = new StoreCore(modules, lazyModules, options);

	// 创建符合原API的Store对象，使用类型断言来处理复杂的泛型类型
	const store = {
		getAllModuleName: () => storeCore.getAllModuleName(),
		getModule: (moduleName: any) => storeCore.getModule(moduleName),
		getOriginModule: (moduleName: any) => storeCore.getOriginModule(moduleName as string),
		getLazyModule: (moduleName: any) => storeCore.getLazyModule(moduleName as string),
		loadModule: (moduleName: any) => storeCore.loadModule(moduleName as string),
		setModule: (moduleName: any, storeModule: StoreModule) => {
			storeCore.setModule(moduleName as string, storeModule);
			return store;
		},
		removeModule: (moduleName: any) => {
			storeCore.removeModule(moduleName as string);
			return store;
		},
		hasModule: (moduleName: any) => storeCore.hasModule(moduleName as string),
		setLazyModule: (moduleName: any, lazyModule: any) => {
			storeCore.setLazyModule(moduleName as string, lazyModule);
			return store;
		},
		removeLazyModule: (moduleName: any) => {
			storeCore.removeLazyModule(moduleName as string);
			return store;
		},
		subscribe: (moduleName: any, listener: ListenerBase) =>
			storeCore.subscribe(moduleName as string, listener),
		subscribeAll: (listener: AllListenerBase) => storeCore.subscribeAll(listener),
		destroy: () => storeCore.destroy(),
		dispatch: (moduleName: any, actionName: any, ...args: any[]) =>
			storeCore.dispatch(moduleName, actionName, ...args),
		globalSetStates: (states: any) => storeCore.globalSetStates(states),
		globalResetStates: (options: GlobalResetStatesOption = {}) => storeCore.globalResetStates(options),
		getAllStates: () => storeCore.getAllStates(),
		type: null as any as GenerateStoreType<M, LM>,
	} as unknown as Store<M, LM>;

	// 设置外部Store引用，确保getStore()返回正确的对象
	storeCore.setExternalStore(store);

	return store;
};

export default createStore;
