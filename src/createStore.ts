/**
 * @author empty916
 * @email [empty916@qq.com]
 * @create date 2019-08-09 17:12:36
 * @modify date 2019-08-09 17:12:36
 * @desc [description]
 */
import compose from './compose';

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

export interface Maps {
	[p: string]: (state: State) => any;
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
	addModule: (moduleName: ModuleName, storeModule: StoreModule) => void;
	getModule: (moduleName: ModuleName) => any;
	getOriginModule: (moduleName: ModuleName) => StoreModule | {};
	getLazyModule: (moduleName: ModuleName) => () => Promise<StoreModule>;
	setModule: (moduleName: ModuleName, storeModule: StoreModule) => void;
	hasModule: (moduleName: ModuleName) => boolean;
	subscribe: (moduleName: ModuleName, listener: Listener) => () => void;
	getAllModuleName: () => ModuleName[];
}

type CreateStore = (modules: Modules, lazyModules?: LazyStoreModules, initStates?: States, middlewares?: Middleware[]) => Store;

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
) => {
	const currentInitStates = {...initStates};
	let currentModules: Modules = {};
	let currentLazyModules = lazyModules;
	let listeners: {[p: string]: Listener[]} = {};
	const currentMiddlewares = middlewares;
	const proxyActionsCache: {[p: string]: Actions} = {};
	const modulesCache: Modules = {};
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
				state: currentInitStates[moduleName],
			};
			delete currentInitStates[moduleName];
		}
		return res;
	};
	const clearProxyActionsCache = (moduleName: ModuleName) => delete proxyActionsCache[moduleName];
	const clearModulesCache = (moduleName: ModuleName) => delete modulesCache[moduleName];
	const clearAllCache = (moduleName: ModuleName) => {
		clearModulesCache(moduleName);
		clearProxyActionsCache(moduleName);
	}
	const runListeners = (moduleName: ModuleName) => Array.isArray(listeners[moduleName]) && listeners[moduleName].forEach(listener => listener());
	const setState = (moduleName: ModuleName, newState: any) => {
		const actionHasNoReturn = newState === undefined;
		const stateIsNotChanged = newState === currentModules[moduleName].state;
		if (actionHasNoReturn || stateIsNotChanged) {
			return newState;
		}
		if(isPromise(newState)) {
			return (newState as Promise<State>).then((ns: State) => {
				const asyncActionHasReturn = ns !== undefined;
				const asyncStateIsChanged = ns !== currentModules[moduleName].state;
				if (asyncActionHasReturn && asyncStateIsChanged) {
					currentModules[moduleName].state = ns;
					clearModulesCache(moduleName);
					runListeners(moduleName);
				}
				return Promise.resolve(ns);
			});
		} else {
			currentModules[moduleName].state = newState;
			clearModulesCache(moduleName);
			runListeners(moduleName);
			return newState;
		}
	};
	// 添加module
	const addModule = (moduleName: ModuleName, storeModule: StoreModule) => {
		if(!!currentModules[moduleName]) {
			console.error(new Error(`addModule: ${moduleName} already exists!`));
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
		clearAllCache(moduleName);
		runListeners(moduleName);
		return currentStoreInstance;
	}
	const createActionsProxy = (moduleName: ModuleName) => {
		if (!!proxyActionsCache[moduleName]) {
			return proxyActionsCache[moduleName];
		}
		let actionsProxy = {...currentModules[moduleName].actions};
		const dispatch = createDispatch(moduleName);
		Object.keys(actionsProxy).forEach(key => actionsProxy[key] = (...data: any[]) => dispatch(key, ...data))
		proxyActionsCache[moduleName] = actionsProxy;
		return actionsProxy;
	};
	const runMaps = (maps: Maps, state: any) => {
		if (!maps) {
			return {};
		}
		const mapsKeys = Object.keys(maps);
		if (!mapsKeys.length) {
			return {};
		}
		const resultMaps = mapsKeys.reduce((rm, key) => {
			rm[key] = typeof maps[key] === 'function' ? maps[key](state) : maps[key];
			return rm;
		}, {} as {[p: string]: any});
		return resultMaps;
	}
	// 获取module
	const getModule = (moduleName: ModuleName) => {
		if (!currentModules[moduleName]) {
			console.log(new Error(`getModule: ${moduleName} is not exist`));
			return {};
		}
		if (!!modulesCache[moduleName]) {
			return modulesCache[moduleName];
		}
		const proxyModule = {
			...currentModules[moduleName]
		};
		proxyModule.actions = createActionsProxy(moduleName);
		proxyModule.maps = currentModules[moduleName].maps ? runMaps(currentModules[moduleName].maps as Maps, currentModules[moduleName].state) : undefined;
		modulesCache[moduleName] = proxyModule;
		return proxyModule;
	}

	// 获取原本的module
	const getOriginModule = (moduleName: ModuleName) => {
		if (!currentModules[moduleName]) {
			console.log(new Error(`getOriginModule: ${moduleName} is not exist`));
			return {};
		}
		return currentModules[moduleName];
	}
	const getLazyModule = (moduleName: ModuleName) => {
		if (!!currentLazyModules[moduleName]) {
			return currentLazyModules[moduleName];
		}
		throw new Error(`getLazyModule: ${moduleName} is not exist`);
	};
	const getAllModuleName = () => [...new Set([...Object.keys(currentModules), ...Object.keys(currentLazyModules)])]
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
	// 查看module是否存在
	const hasModule = (moduleName: ModuleName) => !!currentModules[moduleName];

	const createDispatch = (moduleName: ModuleName): Action => {
		if (!hasModule(moduleName)) {
			throw new Error(`createDispatch: ${moduleName} is not exist!`);
		}
		const setStateProxy = ({state}: any) => setState(moduleName, state);
		const middlewareParams = {
			setState: setStateProxy,
			getState: () => currentModules[moduleName].state,
		}
		const chain = currentMiddlewares.map(middleware => middleware(middlewareParams))
		const setStateProxyWithMiddleware = compose(...chain)(setStateProxy);

		return (type: string, ...data: any[]) => {
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
