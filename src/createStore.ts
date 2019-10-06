/**
 * @author empty916
 * @email [empty916@qq.com]
 * @create date 2019-08-09 17:12:36
 * @modify date 2019-08-09 17:12:36
 * @desc [description]
 */
import compose from './compose';
import {ObjHasSameKeys, ObjChangedKeys} from './utils';

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
	(...arg: any[]): void | undefined | State | Promise<State> | Promise<undefined>;
}
export interface Actions {
	[type: string]: Action;
};

type StoreMap = (state: State) => any;
export interface Maps {
	[p: string]: StoreMap;
};
export interface StoreModule {
	state: State;
	actions: Actions;
	maps?: Maps;
}
export interface LazyStoreModules {
	[p: string]: () => Promise<StoreModule>;
}
export interface Modules {
	[p: string]: StoreModule;
}

const isPromise = (obj: any) => obj && typeof obj.then === 'function';
export type ModuleName = keyof Modules | keyof LazyStoreModules;
export type Middleware = (params: {setState: (m: ModuleName, state: any) => any, getState: State}) => (next: any) => (p: {moduleName: ModuleName, actionName: String, state: any}) => any;
export interface Store {
	createDispatch: (a: string) => Action;
	addModule: (moduleName: ModuleName, storeModule: StoreModule) => Store;
	getModule: (moduleName: ModuleName) => StoreModule;
	setModule: (moduleName: ModuleName, storeModule: StoreModule) => Store;
	removeModule: (moduleName: ModuleName) => Store;
	hasModule: (moduleName: ModuleName) => boolean;
	getOriginModule: (moduleName: ModuleName) => StoreModule | {};
	getLazyModule: (moduleName: ModuleName) => () => Promise<StoreModule>;
	subscribe: (moduleName: ModuleName, listener: Listener) => () => void;
	getAllModuleName: () => ModuleName[];
}
type MapResultCache = {
	name: string;
	useCache: boolean;
	cache: any;
	dependencies: {[p: string]: boolean};
	clear: () => void;
}
type CreateStore = (
	modules?: Modules,
	lazyModules?: LazyStoreModules,
	initStates?: States,
	middlewares?: Middleware[],
	isLazy?: boolean,
) => Store;

let currentStoreInstance: Store;

const isObj = (obj: any) => !(typeof obj !== 'object' || Array.isArray(obj) || obj === null);
const isStoreModule = (obj: any) => {
	if (!isObj(obj) || !isObj(obj.state) || !isObj(obj.actions)) {
		return false;
	}
	if (!!obj.maps && !isObj(obj.maps)){
		return false;
	}
	return true;
}

const createStore: CreateStore = (
	modules: Modules = {},
	lazyModules: LazyStoreModules = {},
	initStates: States = {},
	middlewares: Middleware[] = [],
	isLazy: boolean = true,
) => {
	const currentInitStates = {...initStates};
	let currentModules: Modules = {};
	let currentLazyModules = lazyModules;
	let listeners: {[p: string]: Listener[]} = {};
	let allModuleNames: string[] | undefined;
	const currentMiddlewares = middlewares;
	const actionsProxyCache: {[p: string]: Actions} = {};
	const stateProxyCache: States = {};
	const mapsProxyCache: {[p: string]: Maps} = {};

	const mapsProxyResultCatch: {[p: string]: {[p: string]: MapResultCache}} = {};
	const stateChangedListeners: {[p: string]: {[p: string]: string[]}} = {};

	const modulesCache: Modules = {};
	const keysOfModuleStateChangedRecords: {[p: string]: boolean} = {};
	let runningMap: MapResultCache | undefined = undefined;
	const replaceModule = (storeModule: StoreModule, moduleName: ModuleName) => {
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
	const clearStateProxyCache = (moduleName: ModuleName) => delete stateProxyCache[moduleName];
	const clearMapsProxyCache = (moduleName: ModuleName) => {
		delete mapsProxyCache[moduleName];
		delete mapsProxyResultCatch[moduleName];
	};
	const clearMapsResultCache = (moduleName: ModuleName, changedStateNames?: string[]) => {
		const targetMapsResultCache = mapsProxyResultCatch[moduleName];
		if (!!changedStateNames) {
			changedStateNames.forEach(stateName => {
				if (stateChangedListeners[moduleName] && stateChangedListeners[moduleName][stateName]) {
					const mapNamesWhichDependStateChange = stateChangedListeners[moduleName][stateName];
					mapNamesWhichDependStateChange.forEach(mapName => {
						if(targetMapsResultCache && targetMapsResultCache[mapName]) {
							targetMapsResultCache[mapName].clear()
						}
					});
				}
			});
		} else {
			for(let key in targetMapsResultCache) {
				targetMapsResultCache[key].clear();
			}
		}
	};
	const clearModulesCache = (moduleName: ModuleName) => delete modulesCache[moduleName];
	const clearAllCache = (moduleName: ModuleName) => {
		clearModulesCache(moduleName);
		clearStateProxyCache(moduleName);
		clearMapsProxyCache(moduleName);
		clearMapsResultCache(moduleName);
		clearActionsProxyCache(moduleName);
	}
	const getAllModuleName = () => {
		if(!allModuleNames) {
			allModuleNames = [...new Set([...Object.keys(currentModules), ...Object.keys(currentLazyModules)])]
		}
		return allModuleNames;
	}
	const runListeners = (moduleName: ModuleName) => Array.isArray(listeners[moduleName]) && listeners[moduleName].forEach(listener => listener());
	const _setState = (moduleName: ModuleName, newState: State) => {
		const changedStateKeys = ObjChangedKeys(currentModules[moduleName].state, newState);
		if(!keysOfModuleStateChangedRecords[moduleName]) {
			keysOfModuleStateChangedRecords[moduleName] = changedStateKeys.keyHasChanged;
		}
		currentModules[moduleName].state = newState;
		clearModulesCache(moduleName);
		clearMapsResultCache(moduleName, isLazy ? changedStateKeys.updatedKeys : undefined);
		runListeners(moduleName);
	}
	const setState = (moduleName: ModuleName, newState: any) => {
		const actionHasNoReturn = newState === undefined;
		const stateIsNotChanged = newState === stateProxyCache[moduleName];
		if (actionHasNoReturn || stateIsNotChanged) {
			return newState;
		}
		if(isPromise(newState)) {
			return (newState as Promise<State>).then((ns: State) => {
				const asyncActionHasReturn = ns !== undefined;
				const asyncStateIsChanged = ns !== stateProxyCache[moduleName];
				if (asyncActionHasReturn && asyncStateIsChanged) {
					_setState(moduleName, ns);
				}
				return Promise.resolve(stateProxyCache[moduleName]);
			});
		} else {
			_setState(moduleName, newState);
			return stateProxyCache[moduleName];
		}
	};
	// 添加module
	const addModule = (moduleName: ModuleName, storeModule: StoreModule) => {
		if(!!currentModules[moduleName]) {
			console.warn(new Error(`addModule: ${moduleName} already exists!`));
			return currentStoreInstance;
		}
		if (!isStoreModule(storeModule)) {
			console.error(new Error('addModule: storeModule is illegal!'));
			return currentStoreInstance;
		}
		currentModules = {
			...currentModules,
			[moduleName]: replaceModule(storeModule, moduleName),
		};
		allModuleNames = undefined;
		clearAllCache(moduleName);
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
		// const stateKeysHasNotChange = ObjHasSameKeys(state, stateProxyCache[moduleName]);
		const stateKeysHasNotChange = keyHasChanged === undefined ? true : !keyHasChanged;
		if (!!stateProxyCache[moduleName] && stateKeysHasNotChange) {
			keysOfModuleStateChangedRecords[moduleName] = false;
			return stateProxyCache[moduleName];
		}
		let proxyState = {};
		for(let key in state) {
			if (state.hasOwnProperty(key)) {
				Object.defineProperty(proxyState, key, {
					enumerable: true,
					configurable: true,
					get() {
						if (isLazy && runningMap && !runningMap.dependencies[key]) {
							if(!stateChangedListeners[moduleName]) {
								stateChangedListeners[moduleName] = {};
							}
							if (!stateChangedListeners[moduleName][key]) {
								stateChangedListeners[moduleName][key] = [];
							}
							stateChangedListeners[moduleName][key].push(runningMap.name);
							runningMap.dependencies[key] = true;
						}
						return currentModules[moduleName].state[key];
					}
				});
			}
		}
		stateProxyCache[moduleName] = proxyState;
		return proxyState;
	}

	const createMapsProxy = (moduleName: ModuleName): Maps | undefined => {
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
						if (mapsProxyResultCatch[moduleName][key] === undefined) {
							mapsProxyResultCatch[moduleName][key] = {
								name: key,
								useCache: false,
								cache: null,
								dependencies: {},
								clear: () => {
									mapsProxyResultCatch[moduleName][key].useCache = false;
								}
							};
						}
						const targetMapCache = mapsProxyResultCatch[moduleName][key];
						if (targetMapCache.useCache) {
							return targetMapCache.cache;
						}
						// 清除旧的依赖
						for(let stateName in targetMapCache.dependencies) {
							const targetStateListeners = stateChangedListeners[moduleName][stateName];
							if (targetStateListeners.includes(key)) {
								stateChangedListeners[moduleName][stateName] = targetStateListeners.filter(mapName => mapName !== key);
							}
						}
						targetMapCache.dependencies = {};
						// 重新收集依赖
						runningMap = targetMapCache;
						targetMapCache.cache = (currentModules[moduleName].maps as Maps)[key](stateProxyCache[moduleName]);
						runningMap = undefined;

						targetMapCache.useCache = true;
						return targetMapCache.cache;
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
		if (!mapsProxyResultCatch[moduleName]) {
			mapsProxyResultCatch[moduleName] = {};
		}
		if (!!modulesCache[moduleName]) {
			return modulesCache[moduleName];
		}
		const proxyModule: StoreModule = {} as StoreModule;
		proxyModule.state = createStateProxy(moduleName);
		proxyModule.actions = createActionsProxy(moduleName);
		proxyModule.maps = createMapsProxy(moduleName);
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
			console.error(new Error('setModule: storeModule is illegal!'));
			return currentStoreInstance;
		}
		currentModules = {
			...currentModules,
			[moduleName]: replaceModule(storeModule, moduleName),
		};
		clearAllCache(moduleName);
		runListeners(moduleName);
		return currentStoreInstance;
	}
	const createDispatch = (moduleName: ModuleName): Action => {
		checkModuleIsValid(moduleName);
		const setStateProxy = ({state}: any) => setState(moduleName, state);
		const middlewareParams = {
			setState: setStateProxy,
			getState: () => stateProxyCache[moduleName],
		}
		const chain = currentMiddlewares.map(middleware => middleware(middlewareParams))
		const setStateProxyWithMiddleware = compose(...chain)(setStateProxy);

		return (type: string, ...data: any[]) => {
			checkModuleIsValid(moduleName);
			let newState: State | undefined;
			const targetModule = currentModules[moduleName];
			newState = targetModule.actions[type](...data) as any;
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
		createDispatch,
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
