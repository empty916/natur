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

import {GenerateStoreType, PickPromiseType} from './ts-utils';

import MapCache from './MapCache'


export type ModuleEvent = {
	type: 'init' | 'update' | 'remove',
	actionName?: string,
};

export interface Listener {
	(me: ModuleEvent): any;
}

export type State = any;

type AnyFun = (...arg: any) => any;

export interface States {
	[type: string]: State,
};

export interface Action {
	(...arg: any[]): any;
}

export interface Actions {
	[type: string]: Action;
};

type StoreMap = Array<string | AnyFun>;
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

type Next<MN extends any = ModuleName> = (record: Record<MN>) => ReturnType<Action>;
type Record<MN extends any = ModuleName> = {moduleName: MN, actionName: string, state: ReturnType<Action>};
export type MiddlewareParams = {
	setState: Next,
	getState: () => State,
	getMaps: () => InjectMaps | undefined,
	dispatch: (action: string, ...arg: any[]) => ReturnType<Action>;
};

type globalResetStatesOption = {
	include?: Array<string|RegExp>;
	exclude?: Array<string|RegExp>;
};

export type ModuleName = string;
export type Middleware = (middlewareParams: MiddlewareParams) => (next: Next) => Next;

export interface Store<
	StoreType extends {
		[k: string]: InjectStoreModule
	},
	AOST extends {
		[k: string]: StoreModule
	},
	S extends Partial<{
		[k in keyof StoreType]: StoreType[k]['state']
	}> = Partial<{
		[k in keyof StoreType]: StoreType[k]['state']
	}>
> {
	getModule: <MN extends keyof StoreType>(moduleName: MN) => StoreType[MN];
	setModule: <MN extends keyof AOST>(moduleName: MN, storeModule: AOST[MN]) => Store<StoreType, AOST>;
	removeModule: (moduleName: ModuleName) => Store<StoreType, AOST>;
	setLazyModule: (moduleName: ModuleName, lazyModule: () => Promise<StoreModule>) => Store<StoreType, AOST>;
	removeLazyModule: (moduleName: ModuleName) => Store<StoreType, AOST>;
	hasModule: (moduleName: ModuleName) => boolean;
	loadModule: (moduleName: ModuleName) => Promise<InjectStoreModule>;
	getOriginModule: (moduleName: ModuleName) => StoreModule | {};
	getLazyModule: (moduleName: ModuleName) => () => Promise<StoreModule>;
	subscribe: (moduleName: ModuleName, listener: Listener) => () => void;
	getAllModuleName: () => ModuleName[];
	destory: () => void;
	dispatch: (action: string, ...arg: any) => ReturnType<Action>;
	globalSetStates: (s: S) => void;
	globalResetStates: (option?: globalResetStatesOption) => void;
	type: StoreType;
}

// type CreateStore = <
// 	M extends Modules,
// 	LM extends LazyStoreModules,
// 	StoreType extends GenerateStoreType<M, LM> = GenerateStoreType<M, LM>,
// 	S extends Partial<{
// 		[k in keyof StoreType]: StoreType[k]['state']
// 	}> = Partial<{
// 		[k in keyof StoreType]: StoreType[k]['state']
// 	}>
// >(
// 	modules?: M,
// 	lazyModules?: LM,
// 	initStates?: {
// 		[k in keyof GenerateStoreType<M, LM>]: GenerateStoreType<M, LM>['state']
// 	},
// 	middlewares?: Middleware[],
// ) => Store;

let currentStoreInstance: unknown;

const createStore = <
	M extends Modules,
	LM extends LazyStoreModules,
>(
	modules: M = {} as any,
	lazyModules: LM = {} as any,
	initStates: Partial<{
		[k in keyof GenerateStoreType<M, LM>]: GenerateStoreType<M, LM>[k]['state']
	}> = {},
	middlewares: Middleware[] = [],
) => {
	type AM = (M & {
		[k in keyof LM]: PickPromiseType<LM[k]>;
	});
	type StoreType = GenerateStoreType<M, LM>;
	type AS = Partial<{
		[k in keyof StoreType]: StoreType[k]['state']
	}>;
	type PS = Partial<{
		[k in keyof StoreType]: StoreType[k]['state']
	}>;
	let currentInitStates = {...initStates};
	let resetStateData: Partial<PS> = {};
	let currentModules: Partial<{
		[k in keyof StoreType]: StoreModule
	}> = {};
	let currentLazyModules = {...lazyModules};
	let listeners: {[p: string]: Listener[]} = {};
	let allModuleNames: string[] | undefined;
	let currentMiddlewares = [...middlewares];
	
	const setStateProxyWithMiddlewareCache: {[p: string]: Next} = {};
	const actionsProxyCache: {
		[p: string]: Actions
	} = {};
	const mapsCache: {[p: string]: {[p: string]: MapCache}} = {};
	const mapsCacheList: {[p: string]: MapCache[] } = {};

	const replaceModule = <MN extends keyof AM>(
		moduleName: MN,
		storeModule: AM[MN]
	) => {
		let res;
		// 缓存每个模块的初始化状态，供globalResetStates使用
		resetStateData[moduleName as keyof StoreType] = storeModule.state;
		if (!!currentInitStates[moduleName as keyof StoreType]) {
			res = {
				...storeModule,
				state: currentInitStates[moduleName as keyof StoreType],
			};
			delete currentInitStates[moduleName as keyof StoreType];
		} else {
			res = {...storeModule};
		}
		return res;
	};

	// 查看module是否存在
	const hasModule = (moduleName: keyof StoreType) => !!currentModules[moduleName as string];

	const checkModuleIsValid = (moduleName: keyof StoreType) => {
		if (!hasModule(moduleName)) {
			const errMsg = `module: ${moduleName} is not valid!`;
			console.error(errMsg);
			throw new Error(errMsg);
		}
	}
	const clearActionsProxyCache = (moduleName: string) => delete actionsProxyCache[moduleName];

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
			allModuleNames = Object.keys({...currentModules, ...currentLazyModules});
		}
		return allModuleNames;
	}
	const runListeners = (moduleName: ModuleName, me: ModuleEvent) => Array.isArray(listeners[moduleName]) && listeners[moduleName].forEach(listener => listener(me));
	const setState = ({moduleName, state: newState, actionName}: Record<keyof StoreType>) => {
		const stateHasNoChange = currentModules[moduleName]!.state === newState;
		if (stateHasNoChange) {
			return newState;
		}
		currentModules[moduleName]!.state = newState;
		mapsCacheShouldCheckForValid(moduleName as string);
		runListeners(moduleName as string, {
			type: 'update',
			actionName,
		});
		return currentModules[moduleName]!.state;
	}

	const globalSetStates = (states: PS) => {
		Object.keys(states).forEach((moduleName: string) => {
			if (hasModule(moduleName)) {
				if (!setStateProxyWithMiddlewareCache[moduleName]) {
					createDispatch(moduleName);
				}
				setStateProxyWithMiddlewareCache[moduleName]({
					moduleName, 
					actionName: 'globalSetStates',
					state: states[moduleName],
				});
			} else {
				currentInitStates[moduleName as keyof StoreType] = states[moduleName];
			}
		});
	}
	const globalResetStates = ({include, exclude}: globalResetStatesOption = {}) => {
		let shouldResetModuleNames: string[] = Object.keys(resetStateData).filter(hasModule);
		if (exclude) {
			const stringExclude = exclude.filter(ex => typeof ex === 'string') as string[];
			const regExpExclude = exclude.filter(ex => typeof ex !== 'string') as RegExp[];
			// 过滤不需要重制状态的模块
			shouldResetModuleNames = shouldResetModuleNames.filter(mn => {
				return (stringExclude.indexOf(mn) === -1) && !regExpExclude.some(reg => reg.test(mn));
			});
		}
		if (include) {
			const stringInclude = include.filter(ex => typeof ex === 'string') as string[];
			const regExpInclude = include.filter(ex => typeof ex !== 'string') as RegExp[];
			// 如果存在include配置，则只重制include配置中的模块
			shouldResetModuleNames = shouldResetModuleNames.filter(mn => {
				return (stringInclude.indexOf(mn) > -1) || regExpInclude.some(reg => reg.test(mn));
			});
		}
		shouldResetModuleNames.forEach(mn => {
			if (!setStateProxyWithMiddlewareCache[mn]) {
				createDispatch(mn);
			}
			setStateProxyWithMiddlewareCache[mn]({
				moduleName: mn,
				actionName: 'globalResetStates',
				state: resetStateData[mn],
			});
		});
	}

	// 修改module
	const setModule = <MN extends keyof AM>(moduleName: MN, storeModule: AM[MN]) => {
		if (!isStoreModule(storeModule)) {
			const errMsg = `setModule: storeModule ${moduleName} is illegal!`;
			console.error(errMsg);
			throw new Error(errMsg);
		}
		const isModuleExist = hasModule(moduleName as keyof StoreType)
		currentModules = {
			...currentModules,
			[moduleName]: replaceModule(moduleName, storeModule),
		};
		if(isModuleExist) {
			clearAllCache(moduleName as string);
		} else {
			allModuleNames = undefined;
		}
		if (!mapsCache[moduleName as string]) {
			mapsCache[moduleName as string] = {};
			mapsCacheList[moduleName as string] = [];
		}
		runListeners(moduleName as string, {type: 'init'});
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
		runListeners(moduleName, {type: 'remove'});
		return currentStoreInstance;
	};
	const setLazyModule = (moduleName: keyof LM, lazyModule: () => Promise<StoreModule>) => {
		allModuleNames = undefined;
		currentLazyModules[moduleName] = lazyModule as any;
		return currentStoreInstance;
	}
	const removeLazyModule = (moduleName: ModuleName) => {
		allModuleNames = undefined;
		delete currentLazyModules[moduleName];
		return currentStoreInstance;
	}

	const createMapsProxy = (moduleName: ModuleName): InjectMaps | undefined => {
		const {maps} = currentModules[moduleName]!;
		if (maps === undefined) {
			return undefined;
		}
		let proxyMaps: {[p: string]: any} = {};
		for(let key in maps) {
			if (maps.hasOwnProperty(key)) {
				if (mapsCache[moduleName][key] === undefined) {
					mapsCache[moduleName][key] = new MapCache(
						() => currentModules[moduleName]!.state,
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
		let actionsProxy = {...currentModules[moduleName]!.actions};
		const dispatch = createDispatch(moduleName);
		Object.keys(actionsProxy).forEach(key => actionsProxy[key] = (...data: any[]) => dispatch(key, ...data))
		actionsProxyCache[moduleName] = actionsProxy;
		return actionsProxy;
	};
	// 获取module
	const getModule = <MN extends keyof StoreType>(moduleName: MN) => {
		checkModuleIsValid(moduleName);
		const proxyModule: StoreType[MN] = {
			state: currentModules[moduleName]!.state,
			actions: createActionsProxy(moduleName as string),
			maps: createMapsProxy(moduleName as string),
		} as any;
		return proxyModule;
	};
	/**
	 * 
	 * @param action count/inc
	 */
	const dispatch = (action: string, ...arg: any[]): ReturnType<Action> => {
		if(!(/\//.test(action))) {
			console.warn(`dispatch: ${action} is invalid!`);
			throw new Error(`dispatch: ${action} is invalid!`);
		}
		const slashIndex = action.indexOf('/');
		const moduleName = action.substr(0, slashIndex);
		const actionName = action.substr(slashIndex + 1);
		checkModuleIsValid(moduleName);
		const moduleProxyActions = createActionsProxy(moduleName);
		if (!(actionName in moduleProxyActions)) {
			console.warn(`dispatch: ${action} is invalid!`);
			throw new Error(`dispatch: ${action} is invalid!`);
		};
		return moduleProxyActions[actionName](...arg);
	}
	// 获取原本的module
	const getOriginModule = (moduleName: ModuleName) => {
		checkModuleIsValid(moduleName);
		return currentModules[moduleName];
	};
	const getLazyModule = (moduleName: ModuleName) => {
		if (!!currentLazyModules[moduleName]) {
			return currentLazyModules[moduleName];
		}
		const errMsg = `getLazyModule: ${moduleName} is not exist`;
		console.error(errMsg);
		throw new Error(errMsg);
	};
	const loadModule = (moduleName: ModuleName): Promise<InjectStoreModule> => {
		if (hasModule(moduleName)) {
			return Promise.resolve(getModule(moduleName));
		}
		return getLazyModule(moduleName)()
			.then((loadedModule: StoreModule) => {
				setModule(moduleName, loadedModule as AM[ModuleName]);
				return getModule(moduleName);
			});
	};
	const createDispatch = (moduleName: ModuleName): Action => {
		checkModuleIsValid(moduleName);
		const middlewareParams = {
			setState,
			getState: () => currentModules[moduleName]!.state,
			getMaps: () => createMapsProxy(moduleName),
			dispatch,
		};
		const chain = currentMiddlewares.map((middleware: Middleware) => middleware(middlewareParams));
		const setStateProxyWithMiddleware = (compose(...chain) as ReturnType<Middleware>)(setState);
		setStateProxyWithMiddlewareCache[moduleName] = setStateProxyWithMiddleware;
		return (type: string, ...data: any[]) => {
			checkModuleIsValid(moduleName);
			let newState: ReturnType<Action>;
			const targetModule = currentModules[moduleName]!;
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
		return () => {
			if (Array.isArray(listeners[moduleName])) {
				listeners[moduleName] = listeners[moduleName].filter((lis: Listener) => listener !== lis)
			}
		};
	};
	const destory = () => {
		Object.keys(currentModules).forEach(destoryModule);
		currentInitStates = {};
		currentLazyModules = {} as any;
		listeners = {};
		allModuleNames = undefined;
		currentMiddlewares = [];
	}
	const init = () => {
		if (!!currentStoreInstance) {
			(currentStoreInstance as Store<StoreType, AM>).destory();
		}
		Object.keys(modules).forEach((moduleName) => {
			setModule(moduleName, modules[moduleName as keyof M] as any);
		});
	};

	init();

	currentStoreInstance = {
		getAllModuleName,
		getModule,
		getOriginModule,
		getLazyModule,
		loadModule,
		setModule,
		removeModule,
		hasModule,
		setLazyModule,
		removeLazyModule,
		subscribe,
		destory,
		dispatch,
		globalSetStates,
		globalResetStates,
		type: null as any as StoreType,
	} as Store<StoreType, AM>;
	return currentStoreInstance;
};
export const getStoreInstance = () => currentStoreInstance;
export default createStore;
