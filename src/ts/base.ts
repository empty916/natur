export type EventType = "init" | "update" | "remove" | "beforeRemove";

export type AnyFun = (...arg: any) => any;

export type State = any;

export type States = Record<string, any>;

export type StoreMap = Array<string | AnyFun> | AnyFun;

export interface Maps {
	[p: string]: StoreMap;
}

export interface Action {
	(...arg: any[]): any;
}

export interface Actions {
	[type: string]: Action;
}


export type WatchEventBase = {
	type: EventType;
	actionName?: string;
	oldModule: InjectStoreModule | undefined;
	newModule: InjectStoreModule | undefined;
};

export type AllWatchEventBase = {
	type: EventType;
	actionName?: string;
	moduleName: string;
	oldModule: InjectStoreModule | undefined;
	newModule: InjectStoreModule | undefined;
};

export type WatchAPIBase = {
	getState: () => any;
	getMaps: () => Maps | undefined;
	localDispatch: (actionName: string, ...arg: any) => any;
	getStore: () => StoreBase;
}

export interface Watcher {
	(we: WatchEventBase, apis: WatchAPIBase): any;
}


export interface AllWatcher {
	(we: AllWatchEventBase, apis: WatchAPIBase): any;
}

export interface StoreModule {
	state: State;
	actions: Actions;
	maps?: Maps;
	watch?: AllWatcher | WatchObject;
}

export interface InjectStoreModule {
	state: State;
	actions: Actions;
	maps?: any;
}

export interface InjectMaps {
	[p: string]: any;
}

export interface WatchObject {
	[k: string]: Watcher;
}

export interface Modules {
	[p: string]: StoreModule;
}
export type MiddlewareActionRecordBase = {
	moduleName: string;
	actionName: string;
	state: any;
};

export type ModuleName<M, LM> = keyof M | keyof LM;

export type MapsFun = {
	[m: string]: AnyFun;
};

export type InjectStoreModules = {
	[k: string]: InjectStoreModule;
};

export interface LazyStoreModules {
	[p: string]: () => Promise<StoreModule | { default: StoreModule }>;
}

export interface ModuleEventBase {
	type: EventType;
	actionName?: string;
	oldModule: InjectStoreModule | undefined;
	newModule: InjectStoreModule | undefined;
}

export type ListenerAPIBase = {
	getState: () => State;
	getMaps: () => InjectMaps | undefined;
	getStore: () => StoreBase;
	dispatch: (moduleName: string, actionName: string, ...arg: any) => any;
};

export interface ListenerBase {
	(me: ModuleEventBase, apis: ListenerAPIBase): any;
}

export interface AllModuleEventBase<> {
	type: EventType;
	moduleName: string;
	actionName?: string;
	oldModule: undefined | InjectStoreModule;
	newModule: undefined | InjectStoreModule;
}

export interface AllListenerBase<
	M extends Modules = Modules,
	LM extends LazyStoreModules = LazyStoreModules
> {
	(me: AllModuleEventBase, apis: ListenerAPIBase): any;
}

export type GlobalResetStatesOption<MN extends string = string> = {
	include?: Array<MN | RegExp>;
	exclude?: Array<MN | RegExp>;
};

export type MiddlewareParamsBase = {
	setState: (s: State) => any;
	getState: () => State;
	getMaps: () => InjectMaps | undefined;
	getStore: () => StoreBase;
	dispatch: (moduleName: string, actionName: string, ...arg: any) => any;
};

export type InterceptorParamsBase = {
	setState: (s: State) => any;
	getState: () => State;
	getMaps: () => InjectMaps | undefined;
	getStore: () => StoreBase;
	dispatch: (moduleName: string, actionName: string, ...arg: any) => any;
};

export type MiddlewareNextBase = (record: MiddlewareActionRecordBase) => any;

export type MiddlewareBase = (middlewareParams: MiddlewareParamsBase)
    => (next: MiddlewareNextBase)
        => MiddlewareNextBase;

export type InterceptorActionRecordBase = {
	moduleName: string;
	actionName: string;
	actionArgs: any;
	actionFunc: AnyFun;
};

export type InterceptorNextBase = (record: InterceptorActionRecordBase) => any;

export type InterceptorBase = (filterParams: InterceptorParamsBase)
    => (next: InterceptorNextBase)
        => InterceptorNextBase;

export interface StoreBase {
	getModule: (moduleName: string) => InjectStoreModule;
	setModule: (moduleName: string, storeModule: StoreModule) => StoreBase;
	removeModule: (moduleName: string) => StoreBase;
	setLazyModule: (
		moduleName: string,
		lazyModule: () => Promise<StoreModule>
	) => StoreBase;
	removeLazyModule: (moduleName: string) => StoreBase;
	hasModule: (moduleName: string) => boolean;
	loadModule: (moduleName: string) => Promise<InjectStoreModule>;
	getOriginModule: (moduleName: string) => StoreModule;
	getLazyModule: (moduleName: string) => () => Promise<StoreModule>;
	subscribe: (moduleName: string, listener: ListenerBase) => () => void;
	subscribeAll: (listener: AllListenerBase) => () => void;
	getAllModuleName: () => string[];
	destroy: () => void;
	dispatch: (moduleName: string, actionName: string, ...arg: any) => any;
	globalSetStates: (s: States) => void;
	globalResetStates: (option?: GlobalResetStatesOption) => void;
	getAllStates: () => States;
	type: InjectStoreModules;
}
