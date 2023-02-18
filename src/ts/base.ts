export type EventType = "init" | "update" | "beforeRemove" | "remove";

export type GlobalAction = 'globalSetStates' | 'globalResetStates';

export interface AnyFun {
	(...arg: any): any;
	[k: string]: any;
};

export type State = any;

export type States = Record<string, any>;

export type StoreMap = Array<string | AnyFun> | AnyFun;

export interface Maps {
	[p: string]: StoreMap;
}

export interface Action extends AnyFun {};

export type Actions = Record<string, Action>;

export type WatchEventBase = {
	type: EventType;
	actionName: string | undefined;
	oldModule: InjectStoreModule | undefined;
	newModule: InjectStoreModule | undefined;
};

export type AllWatchEventBase = {
	type: EventType;
	actionName: string | undefined;
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

export interface WatcherBase {
	(we: any, apis: any): any;
}

export interface AllWatcherBase {
	(we: any, apis: any): any;
}

export interface StoreModule {
	state: State;
	actions: Actions;
	maps?: Maps;
	watch?: AllWatcherBase | WatchObjectBase;
}

export interface InjectStoreModule {
	state: State;
	actions: Actions;
	maps?: any;
}

export interface InjectMaps {
	[p: string]: any;
}

export interface WatchObjectBase {
	[k: string]: WatcherBase;
}

export interface Modules {
	[p: string]: StoreModule;
}

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
	actionName: string | undefined;
	oldModule: InjectStoreModule | undefined;
	newModule: InjectStoreModule | undefined;
}

export interface ListenerAPIBase {
	getState: () => State;
	getMaps: () => InjectMaps | undefined;
	getStore: () => StoreBase;
	dispatch: (moduleName: string, actionName: string, ...arg: any) => any;
};

export interface ListenerBase {
	(me: ModuleEventBase, apis: ListenerAPIBase): any;
}

export interface AllModuleEventBase {
	type: EventType;
	moduleName: string;
	actionName: string | undefined;
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

export type MiddlewareActionRecordBase = {
	/**
	 * can not use string,
	 * because MiddlewareActionRecordAPI's moduleName is string Enum,
	 * string can not apply to string Enum.
	 * same as actionName.
	 */
	moduleName: any;
	actionName: any;
	state: any;
};

export type MiddlewareParamsBase = {
	setState: (s: MiddlewareActionRecordBase) => any;
	getState: () => State;
	getMaps: () => any;
	getStore: () => any;
	dispatch: (...arg: any) => any;
};

export type InterceptorParamsBase = {
	setState: (s: MiddlewareActionRecordBase) => any;
	getState: () => State;
	getMaps: () => any;
	getStore: () => any;
	dispatch: (...arg: any) => any;
};

export type MiddlewareNextBase = (record: MiddlewareActionRecordBase) => any;

export type MiddlewareBase = (middlewareParams: MiddlewareParamsBase)
    => (next: MiddlewareNextBase)
        => MiddlewareNextBase;

export type InterceptorActionRecordBase = {
	/**
	 * can not use string,
	 * because InterceptorActionRecordAPI's moduleName is string Enum
	 * string can not apply to string Enum
	 */
	moduleName: any;
	actionName: string;
	actionArgs: any;
	actionFunc: AnyFun;
};

export type InterceptorNextBase = (record: InterceptorActionRecordBase) => any;

export type InterceptorBase = (interceptorParams: InterceptorParamsBase)
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
	dispatch: (...arg: any) => any;
	globalSetStates: (s: States) => void;
	globalResetStates: (option?: GlobalResetStatesOption) => void;
	getAllStates: () => States;
	type: InjectStoreModules;
}
