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

	const mapsWatcher: {[p: string]: {[p: string]: Watcher}} = {};
	const stateDepends: {[p: string]: {[p: string]: Depend}} = {};

	const modulesCache: Modules = {};
	const keysOfModuleStateChangedRecords: {[p: string]: boolean} = {};
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
	const clearStateProxyCache = (moduleName: ModuleName) => {
		delete stateProxyCache[moduleName];
		for(let key in stateDepends[moduleName]) {
			stateDepends[moduleName][key].destroy();
			delete stateDepends[moduleName][key];
		}
		delete stateDepends[moduleName];
	};
	const clearMapsProxyCache = (moduleName: ModuleName) => {
		delete mapsProxyCache[moduleName];
		for(let key in mapsWatcher[moduleName]) {
			mapsWatcher[moduleName][key].destroy();
			delete mapsWatcher[moduleName][key];
		}
		delete mapsWatcher[moduleName];
	};
	const clearMapsWatcherCache = (moduleName: ModuleName, changedStateNames?: string[]) => {
		const targetMapsWatcher = mapsWatcher[moduleName];
		if (!!changedStateNames) {
			changedStateNames.forEach(stateName => {
				if (stateDepends[moduleName][stateName]) {
					stateDepends[moduleName][stateName].notify();
				}
			});
		} else {
			for(let key in targetMapsWatcher) {
				targetMapsWatcher[key].update();
			}
		}
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
	const _setState = (moduleName: ModuleName, newState: State) => {
		const changedStateKeys = ObjChangedKeys(currentModules[moduleName].state, newState);
		if(!keysOfModuleStateChangedRecords[moduleName]) {
			keysOfModuleStateChangedRecords[moduleName] = changedStateKeys.keyHasChanged;
		}
		currentModules[moduleName].state = newState;
		clearModulesCache(moduleName);
		clearMapsWatcherCache(moduleName, isLazy ? changedStateKeys.updatedKeys : undefined);
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
		// const stateKeysHasNotChange = ObjHasSameKeys(state, stateProxyCache[moduleName]);
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
						if (isLazy && Depend.targetWatcher) {
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
