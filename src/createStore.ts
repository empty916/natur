/**
 * @author empty916
 * @email [empty916@qq.com]
 * @create date 2019-08-09 17:12:36
 * @modify date 2019-08-09 17:12:36
 * @desc [description]
 */
import {
	// ObjChangedKeys,
	compose,
	isStoreModule,
} from './utils';

// import {
// 	promiseMiddleware,
// 	filterNonObjectMiddleware,
// 	shallowEqualMiddleware
// } from './middlewares'
import MapCache from './MapCache'

export interface Listener {
	(): void;
}

export type State = any;

export interface States {
	[type: string]: State,
};

type PartialState = Partial<State>;
type PartialStates = {
	[type: string]: PartialState,
}

export interface Action {
	(...arg: any[]): any;
}

export interface Actions {
	[type: string]: Action;
};

type StoreMap = Array<string | Function>;
export interface Maps {
	[p: string]: StoreMap;
};
export interface InjectMaps {
	[p: string]: any;
};
export interface StoreModule {
	state: State;
	actions: Actions;
	maps?: Maps;
}
export interface InjectStoreModule {
	state: State;
	actions: Actions;
	maps?: any;
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
	getModule: (moduleName: ModuleName) => InjectStoreModule;
	setModule: (moduleName: ModuleName, storeModule: StoreModule) => Store;
	removeModule: (moduleName: ModuleName) => Store;
	hasModule: (moduleName: ModuleName) => boolean;
	getOriginModule: (moduleName: ModuleName) => StoreModule | {};
	getLazyModule: (moduleName: ModuleName) => () => Promise<StoreModule>;
	subscribe: (moduleName: ModuleName, listener: Listener) => () => void;
	getAllModuleName: () => ModuleName[];
	destory: () => void;
}

type CreateStore = (
	modules?: Modules,
	lazyModules?: LazyStoreModules,
	initStates?: PartialStates,
	middlewares?: Middleware[],
) => Store;

let currentStoreInstance: Store;

const createStore: CreateStore = (
	modules: Modules = {},
	lazyModules: LazyStoreModules = {},
	initStates: PartialStates = {},
	middlewares: Middleware[] = [],
) => {
	let currentInitStates = {...initStates};
	let currentModules: Modules = {};
	let currentLazyModules = lazyModules;
	let listeners: {[p: string]: Listener[]} = {};
	let allModuleNames: string[] | undefined;
	let currentMiddlewares = [...middlewares];
	const actionsProxyCache: {[p: string]: Actions} = {};

	const mapsCache: {[p: string]: {[p: string]: MapCache}} = {};
	const mapsCacheList: {[p: string]: MapCache[] } = {};

	const replaceModule = (moduleName: ModuleName, storeModule: StoreModule) => {
		let res;
		if (!!currentInitStates[moduleName]) {
			res = {
				...storeModule,
				state: currentInitStates[moduleName],
			};
			delete currentInitStates[moduleName];
		} else {
			res = {...storeModule};
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

	const clearMapsProxyCache = (moduleName: ModuleName) => {
		delete mapsCache[moduleName];
		mapsCacheList[moduleName].forEach(i => i.destroy())
		delete mapsCacheList[moduleName];
	};
	const mapsCacheShouldCheckForValid = (moduleName: ModuleName) => {
		mapsCacheList[moduleName].forEach(i => i.shouldCheckCache());
	};
	const clearAllCache = (moduleName: ModuleName) => {
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
	const setState = (moduleName: ModuleName, newState: any) => {
		const stateHasNoChange = currentModules[moduleName].state === newState;
		if (stateHasNoChange) {
			return newState;
		}
		currentModules[moduleName].state = newState;
		mapsCacheShouldCheckForValid(moduleName);
		runListeners(moduleName);
		return currentModules[moduleName].state;
	}

	// 修改module
	const setModule = (moduleName: ModuleName, storeModule: StoreModule) => {
		if (!isStoreModule(storeModule)) {
			throw new Error('storeModule is illegal!');
		}
		const isModuleExist = hasModule(moduleName)
		currentModules = {
			...currentModules,
			[moduleName]: replaceModule(moduleName, storeModule),
		};
		if(isModuleExist) {
			clearAllCache(moduleName);
		} else {
			allModuleNames = undefined;
		}
		if (!mapsCache[moduleName]) {
			mapsCache[moduleName] = {};
			mapsCacheList[moduleName] = [];
		}
		runListeners(moduleName);
		return currentStoreInstance;
	}
	const destoryModule = (moduleName: ModuleName) => {
		delete currentModules[moduleName];
		delete currentLazyModules[moduleName];
		allModuleNames = undefined;
		clearAllCache(moduleName);
	}
	const removeModule = (moduleName: ModuleName) => {
		destoryModule(moduleName);
		runListeners(moduleName);
		return currentStoreInstance;
	};
	const createMapsProxy = (moduleName: ModuleName): InjectMaps | undefined => {
		const {maps} = currentModules[moduleName];
		if (maps === undefined) {
			return undefined;
		}
		let proxyMaps: {[p: string]: any} = {};
		for(let key in maps) {
			if (maps.hasOwnProperty(key)) {
				if (mapsCache[moduleName][key] === undefined) {
					mapsCache[moduleName][key] = new MapCache(
						() => currentModules[moduleName].state,
						maps[key],
					);
					mapsCacheList[moduleName].push(mapsCache[moduleName][key]);
				}
				const targetWatcher = mapsCache[moduleName][key];
				proxyMaps[key] = targetWatcher.getValue();
			}
		}
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

		const proxyModule: InjectStoreModule = {
			state: currentModules[moduleName].state,
			actions: createActionsProxy(moduleName),
			maps: createMapsProxy(moduleName),
		};
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
	const createDispatch = (moduleName: ModuleName): Action => {
		checkModuleIsValid(moduleName);
		const setStateProxy: Next = ({state}: Record) => setState(moduleName, state);
		const middlewareParams = {
			setState: setStateProxy,
			getState: () => currentModules[moduleName].state,
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
	const destory = () => {
		Object.keys(currentModules).forEach(destoryModule);
		currentInitStates = {};
		currentLazyModules = {};
		listeners = {};
		allModuleNames = undefined;
		currentMiddlewares = [];
	}
	const init = () => {
		if (!!currentStoreInstance) {
			currentStoreInstance.destory();
		}
		Object.keys(modules).forEach((moduleName: ModuleName) => {
			setModule(moduleName, modules[moduleName]);
		});
	};

	init();

	currentStoreInstance = {
		getAllModuleName,
		getModule,
		removeModule,
		getOriginModule,
		getLazyModule,
		setModule,
		hasModule,
		subscribe,
		destory,
	};
	return currentStoreInstance;
};
export const getStoreInstance = () => currentStoreInstance;
export default createStore;
