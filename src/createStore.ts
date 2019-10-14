/**
 * @author empty916
 * @email [empty916@qq.com]
 * @create date 2019-08-09 17:12:36
 * @modify date 2019-08-09 17:12:36
 * @desc [description]
 */
import {
	ObjChangedKeys,
	Depend,
	Watcher,
	compose,
	isPromise,
	isVoid,
	isStoreModule,
} from './utils';

export interface Listener {
	(): void;
}
export interface State {
	[type: string]: any,
};
export interface States {
	[type: string]: State,
};
export interface Action {
	(...arg: any[]): State | Promise<State> | void | Promise<void>;
}

export interface Actions {
	[type: string]: Action;
};

type StoreMap = (state: State) => any;
export interface Maps {
	[p: string]: StoreMap;
};
export interface InjectMaps {
	[p: string]: ReturnType<StoreMap>;
};
export interface StoreModule {
	state: State;
	actions: Actions;
	maps?: Maps;
}
export interface InjectStoreModule {
	state: State;
	actions: Actions;
	maps?: ReturnType<StoreMap>;
}
export interface LazyStoreModules {
	[p: string]: () => Promise<StoreModule>;
}
export interface Modules {
	[p: string]: StoreModule;
}

type Next = (record: Record) => ReturnType<Action>;
type Record = {moduleName: ModuleName, actionName: String, state: ReturnType<Action>};
type MiddlewareParams = {setState: Next, getState: () => State};

export type ModuleName = keyof Modules | keyof LazyStoreModules;
export type Middleware = (middlewareParams: MiddlewareParams) => (next: Next) => Next;

export interface Store {
	// createDispatch: (a: string) => Action;
	addModule: (moduleName: ModuleName, storeModule: StoreModule) => Store;
	getModule: (moduleName: ModuleName) => InjectStoreModule;
	setModule: (moduleName: ModuleName, storeModule: StoreModule) => Store;
	removeModule: (moduleName: ModuleName) => Store;
	hasModule: (moduleName: ModuleName) => boolean;
	getOriginModule: (moduleName: ModuleName) => StoreModule | {};
	getLazyModule: (moduleName: ModuleName) => () => Promise<StoreModule>;
	subscribe: (moduleName: ModuleName, listener: Listener) => () => void;
	getAllModuleName: () => ModuleName[];
}

type CreateStore = (
	modules?: Modules,
	lazyModules?: LazyStoreModules,
	initStates?: States,
	middlewares?: Middleware[],
) => Store;

let currentStoreInstance: Store;

const createStore: CreateStore = (
	modules: Modules = {},
	lazyModules: LazyStoreModules = {},
	initStates: States = {},
	middlewares: Middleware[] = [],
) => {
	const currentInitStates = {...initStates};
	let currentModules: Modules = {};
	let currentLazyModules = lazyModules;
	let listeners: {[p: string]: Listener[]} = {};
	let allModuleNames: string[] | undefined;
	const currentMiddlewares = middlewares;
	const actionsProxyCache: {[p: string]: Actions} = {};
	const stateProxyCache: States = {};
	const mapsProxyCache: {[p: string]: InjectMaps} = {};

	const mapsWatcher: {[p: string]: {[p: string]: Watcher}} = {};
	const stateDepends: {[p: string]: {[p: string]: Depend}} = {};

	const modulesCache: Modules = {};
	const keysOfModuleStateChangedRecords: {[p: string]: boolean} = {};
	const replaceModule = (moduleName: ModuleName, storeModule: StoreModule) => {
		let res = {
			...storeModule,
			state: {
				...storeModule.state,
			}
		};
		if (!!currentInitStates[moduleName]) {
			res = {
				...storeModule,
				state: {
					...storeModule.state,
					...currentInitStates[moduleName],
				},
			};
			delete currentInitStates[moduleName];
		}
		return res;
	};

	// 查看module是否存在
	const hasModule = (moduleName: ModuleName) => !!currentModules[moduleName];

	const checkModuleIsValid = (moduleName: ModuleName) => {
		if (!hasModule(moduleName)) {
			throw new Error(`module: ${moduleName} is not valid!`);
		}
	}
	const clearActionsProxyCache = (moduleName: ModuleName) => delete actionsProxyCache[moduleName];
	const clearStateOrMapProxyCache = (
		stateOrMapProxyCache: States | typeof mapsProxyCache,
		stateDependsOrMapsWatcher: typeof stateDepends | typeof mapsWatcher
	) => (moduleName: ModuleName) => {
		delete stateOrMapProxyCache[moduleName];
		for(let key in stateDependsOrMapsWatcher[moduleName]) {
			stateDependsOrMapsWatcher[moduleName][key].destroy();
			delete stateDependsOrMapsWatcher[moduleName][key];
		}
		delete stateDependsOrMapsWatcher[moduleName];
	}
	const clearStateProxyCache = clearStateOrMapProxyCache(stateProxyCache, stateDepends);
	const clearMapsProxyCache = clearStateOrMapProxyCache(mapsProxyCache, mapsWatcher);
	const clearMapsWatcherCache = (moduleName: ModuleName, changedStateNames: string[]) => {
		changedStateNames.forEach(stateName => {
			if (stateDepends[moduleName][stateName]) {
				stateDepends[moduleName][stateName].notify();
			}
		});
	};
	const clearModulesCache = (moduleName: ModuleName) => delete modulesCache[moduleName];
	const clearAllCache = (moduleName: ModuleName) => {
		clearModulesCache(moduleName);
		clearStateProxyCache(moduleName);
		// clearMapsWatcherCache(moduleName);
		clearMapsProxyCache(moduleName);
		clearActionsProxyCache(moduleName);
	}
	const getAllModuleName = () => {
		if(!allModuleNames) {
			allModuleNames = [...new Set([...Object.keys(currentModules), ...Object.keys(currentLazyModules)])]
		}
		return allModuleNames;
	}
	const runListeners = (moduleName: ModuleName) => Array.isArray(listeners[moduleName]) && listeners[moduleName].forEach(listener => listener());
	const _setState = (moduleName: ModuleName, newState: State | void) => {
		const stateIsNotChanged = newState === stateProxyCache[moduleName];
		if (isVoid<State>(newState) || stateIsNotChanged) {
			return newState;
		}
		const changedStateKeys = ObjChangedKeys(currentModules[moduleName].state, newState);
		if(!keysOfModuleStateChangedRecords[moduleName]) {
			keysOfModuleStateChangedRecords[moduleName] = changedStateKeys.keyHasChanged;
		}
		if (changedStateKeys.updatedKeys.length === 0) {
			return stateProxyCache[moduleName];
		}
		currentModules[moduleName].state = newState;
		if (changedStateKeys.keyHasChanged) {
			clearModulesCache(moduleName);
			createStateProxy(moduleName);
		}
		clearMapsWatcherCache(moduleName, changedStateKeys.updatedKeys);
		runListeners(moduleName);
		return stateProxyCache[moduleName];
	}
	const setState = (moduleName: ModuleName, newState: ReturnType<Action>): ReturnType<Action> => {
		if(isPromise<ReturnType<Action>>(newState)) {
			return (newState as Promise<ReturnType<Action>>).then(ns => Promise.resolve(_setState(moduleName, ns)));
		}
		return _setState(moduleName, newState);
	};
	// 添加module
	const addModule = (moduleName: ModuleName, storeModule: StoreModule) => {
		if(!!currentModules[moduleName]) {
			throw new Error(`addModule: ${moduleName} already exists!`);
		}
		if (!isStoreModule(storeModule)) {
			throw new Error('addModule: storeModule is illegal!');
		}
		currentModules = {
			...currentModules,
			[moduleName]: replaceModule(moduleName, storeModule),
		};
		allModuleNames = undefined;
		// clearAllCache(moduleName);
		if (!mapsWatcher[moduleName]) {
			mapsWatcher[moduleName] = {};
		}
		if(!stateDepends[moduleName]) {
			stateDepends[moduleName] = {};
		}
		runListeners(moduleName);
		return currentStoreInstance;
	}
	const removeModule = (moduleName: ModuleName) => {
		delete currentModules[moduleName];
		delete currentLazyModules[moduleName];
		allModuleNames = undefined;
		clearAllCache(moduleName);
		runListeners(moduleName);
		return currentStoreInstance;
	};
	const createStateProxy = (moduleName: ModuleName): State => {
		const {state} = currentModules[moduleName];
		const keyHasChanged = keysOfModuleStateChangedRecords[moduleName];
		const stateKeysHasNotChange = keyHasChanged === undefined ? true : !keyHasChanged;
		if (!!stateProxyCache[moduleName] && stateKeysHasNotChange) {
			return stateProxyCache[moduleName];
		}
		let proxyState = {};
		for(let key in state) {
			if (state.hasOwnProperty(key)) {
				Object.defineProperty(proxyState, key, {
					enumerable: true,
					configurable: true,
					get() {
						if (Depend.targetWatcher) {
							if (!stateDepends[moduleName][key]) {
								stateDepends[moduleName][key] = new Depend(moduleName, key);
							}
							stateDepends[moduleName][key].addWatcher(Depend.targetWatcher);
						}
						return currentModules[moduleName].state[key];
					}
				});
			}
		}
		stateProxyCache[moduleName] = proxyState;
		keysOfModuleStateChangedRecords[moduleName] = false;
		return proxyState;
	}

	const createMapsProxy = (moduleName: ModuleName): InjectMaps | undefined => {
		const {maps} = currentModules[moduleName];
		if (maps === undefined) {
			return undefined;
		}
		if (!!mapsProxyCache[moduleName]) {
			return mapsProxyCache[moduleName];
		}
		let proxyMaps = {};
		for(let key in maps) {
			if (maps.hasOwnProperty(key)) {
				Object.defineProperty(proxyMaps, key, {
					enumerable: true,
					configurable: true,
					get() {
						if (mapsWatcher[moduleName][key] === undefined) {
							mapsWatcher[moduleName][key] = new Watcher(
								moduleName,
								key,
								() => (currentModules[moduleName].maps as Maps)[key](stateProxyCache[moduleName])
							);
						}
						const targetWatcher = mapsWatcher[moduleName][key];
						if (targetWatcher.useCache) {
							return targetWatcher.cache;
						}
						// 清除旧的依赖
						targetWatcher.clearDepends();
						// 重新收集依赖
						targetWatcher.run();
						return targetWatcher.cache;
					}
				});
			}
		}
		mapsProxyCache[moduleName] = proxyMaps;
		return proxyMaps;
	}
	const createActionsProxy = (moduleName: ModuleName) => {
		if (!!actionsProxyCache[moduleName]) {
			return actionsProxyCache[moduleName];
		}
		let actionsProxy = {...currentModules[moduleName].actions};
		const dispatch = createDispatch(moduleName);
		Object.keys(actionsProxy).forEach(key => actionsProxy[key] = (...data: any[]) => dispatch(key, ...data))
		actionsProxyCache[moduleName] = actionsProxy;
		return actionsProxy;
	};
	// 获取module
	const getModule = (moduleName: ModuleName) => {
		checkModuleIsValid(moduleName);

		if (!!modulesCache[moduleName]) {
			return modulesCache[moduleName];
		}
		const proxyModule: InjectStoreModule = {
			state: createStateProxy(moduleName),
			actions: createActionsProxy(moduleName),
			maps: createMapsProxy(moduleName),
		};
		modulesCache[moduleName] = proxyModule;
		return proxyModule;
	}

	// 获取原本的module
	const getOriginModule = (moduleName: ModuleName) => {
		checkModuleIsValid(moduleName);
		return currentModules[moduleName];
	}
	const getLazyModule = (moduleName: ModuleName) => {
		if (!!currentLazyModules[moduleName]) {
			return currentLazyModules[moduleName];
		}
		throw new Error(`getLazyModule: ${moduleName} is not exist`);
	};
	// 修改module
	const setModule = (moduleName: ModuleName, storeModule: StoreModule) => {
		if (!isStoreModule(storeModule)) {
			throw new Error('setModule: storeModule is illegal!');
		}
		currentModules = {
			...currentModules,
			[moduleName]: replaceModule(moduleName, storeModule),
		};
		clearAllCache(moduleName);
		runListeners(moduleName);
		return currentStoreInstance;
	}
	const createDispatch = (moduleName: ModuleName): Action => {
		checkModuleIsValid(moduleName);
		const setStateProxy: Next = ({state}: Record) => setState(moduleName, state);
		const middlewareParams = {
			setState: setStateProxy,
			getState: () => stateProxyCache[moduleName],
		}
		const chain = currentMiddlewares.map((middleware: Middleware) => middleware(middlewareParams))
		const setStateProxyWithMiddleware = (compose(...chain) as ReturnType<Middleware>)(setStateProxy);

		return (type: string, ...data: any[]) => {
			checkModuleIsValid(moduleName);
			let newState: ReturnType<Action>;
			const targetModule = currentModules[moduleName];
			newState = targetModule.actions[type](...data);
			return setStateProxyWithMiddleware({
				moduleName,
				actionName: type,
				state: newState,
			});
		};
	};
	const subscribe = (moduleName: ModuleName, listener: Listener) => {
		if (!listeners[moduleName]) {
			listeners[moduleName] = [];
		}
		listeners[moduleName].push(listener);
		return () => listeners[moduleName] = listeners[moduleName].filter((lis: Listener) => listener !== lis);;
	};
	const init = () => {
		Object.keys(modules).forEach((moduleName: ModuleName) => {
			addModule(moduleName, modules[moduleName]);
		});
	};
	init();

	currentStoreInstance = {
		// createDispatch,
		addModule,
		getAllModuleName,
		getModule,
		removeModule,
		getOriginModule,
		getLazyModule,
		setModule,
		hasModule,
		subscribe,
	};
	return currentStoreInstance;
};
export const getStoreInstance = () => currentStoreInstance;
export default createStore;
