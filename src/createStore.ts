
type anyFn = (...arg: any[]) => any;

type TActions = {
	[type: string]: anyFn,
};
type TMaps = {
	[p: string]: (state: any) => unknown;
};
export interface StoreModule {
	state: any;
	actions: TActions;
	maps?: TMaps;
}
export interface LazyStoreModules {
	[p: string]: () => Promise<StoreModule>;
}
type Modules = {
	[p: string]: StoreModule;
}

const isPromise = (obj: any) => obj && typeof obj.then === 'function';

export interface Store {
	createDispatch: (a: string) => (type: string, data: any) => void | Promise<any>;
	addModule: (moduleName: string, module: StoreModule) => void;
	getModule: (moduleName: string) => any;
	getLazyModule: (moduleName: string) => () => Promise<StoreModule>;
	setModule: (moduleName: string, module: StoreModule) => void;
	hasModule: (moduleName: string) => boolean;
	subscribe: (moduleName: string, listener: anyFn) => () => void;
	getAllModuleName: () => string[];
}

type TCreateStore = (modules: Modules, lazyModules: LazyStoreModules) => Store;

let currentStoreInstance: Store;

const createStore: TCreateStore = (modules: Modules = {}, lazyModules: LazyStoreModules = {}) => {
	let currentModules = modules;
	let currentLazyModules = lazyModules;
	let listeners: {[p: string]: anyFn[]} = {};
	const setState = (moduleName: string, newState: any) => currentModules[moduleName].state = newState;
	// 添加module
	const addModule = (moduleName: string, module: StoreModule) => {
		if(!!currentModules[moduleName]) {
			console.log(new Error('action module has exist!'));
			return;
		}
		currentModules = {
			...currentModules,
			[moduleName]: module,
		};
		runListeners(moduleName);
	}
	const createActionsProxy = (moduleName: string) => {
		let actionsProxy = {...currentModules[moduleName].actions};
		const dispatch = createDispatch(moduleName);
		Object.keys(actionsProxy).forEach(key => actionsProxy[key] = (...data: any[]) => dispatch(key, ...data))
		return actionsProxy;
	};
	const runMaps = (maps: TMaps, state: any) => {
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
	const getModule = (moduleName: string) => {
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
	const getLazyModule = (moduleName: string) => (currentLazyModules[moduleName] as () => Promise<StoreModule>) || (() => Promise.resolve({actions: {}, state: {}}));
	const getAllModuleName = () => [...new Set([...Object.keys(currentModules), ...Object.keys(currentLazyModules)])]
	// 修改module
	const setModule = (moduleName: string, module: StoreModule) => {
		if (currentModules[moduleName] !== module) {
			currentModules = {
				...currentModules,
				[moduleName]: module,
			};
			runListeners(moduleName);
		};
	}
	// 查看module是否存在
	const hasModule = (moduleName: string) => !!currentModules[moduleName];
	const runListeners = (moduleName: string) => Array.isArray(listeners[moduleName]) && listeners[moduleName].forEach(listener => listener());

	const createDispatch = (moduleName: string) => {
		if (!hasModule(moduleName)) {
			console.log(new Error('module is not exist!'));
			return () => {};
		}

		return (type: string, ...data: any[]) => {
			let stateFrag;
			if (!!currentModules[moduleName] && !!currentModules[moduleName].actions[type]) {
				stateFrag = currentModules[moduleName].actions[type](...data);
			} else {
				return;
			}
			if(isPromise(stateFrag)) {
				return stateFrag.then((ns: any) => {
					if (ns === currentModules[moduleName].state || ns === undefined) {
						return Promise.resolve();
					}
					setState(moduleName, ns);
					runListeners(moduleName);
					return Promise.resolve();
				});
			} else if (stateFrag === currentModules[moduleName].state || stateFrag === undefined) {
				return;
			} else {
				setState(moduleName, stateFrag);
				runListeners(moduleName);
			}
		};
	};
	const subscribe = (moduleName: string, listener: anyFn) => {
		moduleName = moduleName;
		if (!listeners[moduleName]) {
			listeners[moduleName] = [];
		}
		listeners[moduleName].push(listener);
		return () => listeners[moduleName] = listeners[moduleName].filter((lis: anyFn) => listener !== lis);;
	};

	currentStoreInstance = {
		createDispatch,
		addModule,
		getAllModuleName,
		getModule,
		getLazyModule,
		setModule,
		hasModule,
		subscribe,
	};
	return currentStoreInstance;
};
export const getStoreInstance = () => currentStoreInstance;
export default createStore;
