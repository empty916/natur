/**
 * @author empty916
 * @email [empty916@qq.com]
 * @create date 2019-08-09 17:12:36
 * @modify date 2019-08-09 17:12:36
 * @desc [description]
 */


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

export interface Store {
	createDispatch: (a: string) => Action;
	addModule: (moduleName: ModuleName, storeModule: StoreModule) => void;
	getModule: (moduleName: ModuleName) => any;
	getOriginModule: (moduleName: ModuleName) => StoreModule | {};
	getLazyModule: (moduleName: ModuleName) => () => Promise<StoreModule>;
	setModule: (moduleName: ModuleName, storeModule: StoreModule) => void;
	setStates: (states: States) => void;
	hasModule: (moduleName: ModuleName) => boolean;
	subscribe: (moduleName: ModuleName, listener: Listener) => () => void;
	getAllModuleName: () => ModuleName[];
}

type TCreateStore = (modules: Modules, lazyModules: LazyStoreModules) => Store;


const createStore: TCreateStore = (modules: Modules = {}, lazyModules: LazyStoreModules = {}) => {
	let currentModules = modules;
	let currentLazyModules = lazyModules;
	let listeners: {[p: string]: Listener[]} = {};
	let currentAsyncModuleStates: States = {};
	const replaceState = (moduleName: ModuleName, storeModule: StoreModule) => {
		if (!!currentAsyncModuleStates[moduleName]) {
			storeModule = {
				...storeModule,
				state: currentAsyncModuleStates[moduleName],
			};
			delete currentAsyncModuleStates[moduleName];
		}
		return storeModule;
	}
	const setState = (moduleName: ModuleName, newState: any) => currentModules[moduleName].state = newState;
	// 添加module
	const addModule = (moduleName: ModuleName, storeModule: StoreModule) => {
		if(!!currentModules[moduleName]) {
			console.log(new Error('action module has exist!'));
			return;
		}
		currentModules = {
			...currentModules,
			[moduleName]: replaceState(moduleName, storeModule),
		};
		runListeners(moduleName);
	}
	const createActionsProxy = (moduleName: ModuleName) => {
		let actionsProxy = {...currentModules[moduleName].actions};
		const dispatch = createDispatch(moduleName);
		Object.keys(actionsProxy).forEach(key => actionsProxy[key] = (...data: any[]) => dispatch(key, ...data))
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
		}, {} as {[p: string]: unknown});
		return resultMaps;
	}
	// 获取module
	const getModule = (moduleName: ModuleName) => {
		if (!currentModules[moduleName]) {
			console.log(new Error(`module: ${moduleName} is not exist`));
			return {};
		}
		const proxyModule = {
			...currentModules[moduleName]
		};
		proxyModule.actions = createActionsProxy(moduleName);
		(proxyModule.maps as { [p: string]: unknown }) = proxyModule.maps ? runMaps(proxyModule.maps, proxyModule.state) : {};
		return proxyModule;
	}
	// 获取原本的module
	const getOriginModule = (moduleName: ModuleName) => {
		if (!currentModules[moduleName]) {
			console.log(new Error(`module: ${moduleName} is not exist`));
			return {};
		}
		return currentModules[moduleName];
	}
	const getLazyModule = (moduleName: ModuleName) => (currentLazyModules[moduleName] as () => Promise<StoreModule>) || (() => Promise.resolve({actions: {}, state: {}}));
	const getAllModuleName = () => [...new Set([...Object.keys(currentModules), ...Object.keys(currentLazyModules)])]
	// 修改module
	const setModule = (moduleName: ModuleName, storeModule: StoreModule) => {
		if (currentModules[moduleName] !== storeModule) {
			currentModules = {
				...currentModules,
				[moduleName]: replaceState(moduleName, storeModule),
			};
			runListeners(moduleName);
		};
	}
	const setStates = (states: States) => {
		const syncModuleNames = Object.keys(currentModules);
		const validSyncModuleNames = Object.keys(states).filter(s => syncModuleNames.includes(s));
		validSyncModuleNames.forEach(moduleName => {
			currentModules[moduleName].state = { ...states[moduleName] };
		});
		validSyncModuleNames.forEach(runListeners);

		const invalidSyncModuleNames = Object.keys(states).filter(moduleName => !syncModuleNames.includes(moduleName));
		const asyncModuleNames = Object.keys(currentLazyModules);
		const validAsyncModuleNames = invalidSyncModuleNames.filter(ismn => asyncModuleNames.includes(ismn));

		currentAsyncModuleStates = validAsyncModuleNames.reduce((asyncModuleStates, asyncModuleName) => ({
			...asyncModuleStates,
			[asyncModuleName]: states[asyncModuleName],
		}), {});
	};
	// 查看module是否存在
	const hasModule = (moduleName: ModuleName) => !!currentModules[moduleName];
	const runListeners = (moduleName: ModuleName) => Array.isArray(listeners[moduleName]) && listeners[moduleName].forEach(listener => listener());

	const createDispatch = (moduleName: ModuleName): Action => {
		if (!hasModule(moduleName)) {
			console.log(new Error('module is not exist!'));
			return () => {};
		}

		return (type: string, ...data: any[]) => {
			let newState: State | undefined;

			const moduleIsInvalid = !hasModule(moduleName);
			const moduleActionIsInvalid = !currentModules[moduleName].actions[type];
			if (moduleIsInvalid || moduleActionIsInvalid) {
				return;
			}
			newState = currentModules[moduleName].actions[type](...data) || undefined;

			const actionHasNoReturn = newState === undefined;
			const stateIsNotChanged = newState === currentModules[moduleName].state;
			if (actionHasNoReturn || stateIsNotChanged) {
				return newState;
			}

			if(isPromise(newState)) {
				return (newState as Promise<State>).then((ns: State) => {
					const asyncActionHasReturn = ns !== undefined;
					const asyncActionDidChangeState = ns !== currentModules[moduleName].state;
					if (asyncActionHasReturn && asyncActionDidChangeState) {
						setState(moduleName, ns);
						runListeners(moduleName);
					}
					return Promise.resolve(ns);
				});
			} else {
				setState(moduleName, newState);
				runListeners(moduleName);
				return newState;
			}
		};
	};
	const subscribe = (moduleName: ModuleName, listener: Listener) => {
		if (!listeners[moduleName]) {
			listeners[moduleName] = [];
		}
		listeners[moduleName].push(listener);
		return () => listeners[moduleName] = listeners[moduleName].filter((lis: Listener) => listener !== lis);;
	};

	return {
		createDispatch,
		addModule,
		getAllModuleName,
		getModule,
		getOriginModule,
		getLazyModule,
		setModule,
		setStates,
		hasModule,
		subscribe,
	};
};

export default createStore;
