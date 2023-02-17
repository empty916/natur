import {
	Actions,
	AllWatchEventBase,
	EventType,
	Maps,
	State,
	StoreBase,
	StoreModule,
	WatchAPIBase,
	InjectStoreModule,
    InjectMaps,
    AnyFun,
    Modules,
    LazyStoreModules,
    InjectStoreModules,
} from "./base";
import {
	ActionReturnType,
	GenerateStoreType,
	GenMapsType,
	ModuleType,
    Store,
} from "./utils";

export type WatchEventMap<
	M extends StoreModule = StoreModule,
	IM = ModuleType<M>
> = {
	[k in EventType]: {
		type: k;
		actionName: k extends "init" | "remove"
			? undefined
			: keyof M["actions"] | "globalSetStates" | "globalResetStates";
		oldModule: k extends "init" ? undefined : IM;
		newModule: k extends "remove" ? undefined : IM;
	};
};

export interface AllWatchEventValue<
	K extends EventType,
	IM extends InjectStoreModule
> extends AllWatchEventBase {
	type: K;
	moduleName: string;
	actionName: K extends "init" | "remove" | "beforeRemove"
		? undefined
		:
				| Extract<keyof IM["actions"], string>
				| "globalSetStates"
				| "globalResetStates";
	oldModule: K extends "init" ? undefined : IM;
	newModule: K extends "remove" ? undefined : IM;
}

export type AllWatchEventMap<
	M extends StoreModule = StoreModule,
	IM extends InjectStoreModule = Omit<ModuleType<M>, 'watch'>
> = {
	[K in EventType]: AllWatchEventValue<K, IM>;
};

export interface WatchAPI<
	S extends State = State,
	M extends Maps = Maps,
	A extends Actions = Actions
> extends WatchAPIBase {
	getState: () => S;
	getMaps: () => GenMapsType<M, S>;
	getStore: () => StoreBase;
	localDispatch: <AN extends keyof A>(
		actionName: AN,
		...arg: Parameters<A[AN]>
	) => ActionReturnType<A[AN], S>;
}

export type AllWatchAPI = WatchAPI;

export type WatchEvent<M extends StoreModule = StoreModule> =
	WatchEventMap<M>[EventType];

export type AllWatchEvent<M extends StoreModule = StoreModule> =
	AllWatchEventMap<M>[EventType];


export type MiddlewareParamsAPI<
    M extends Modules = Modules,
    LM extends LazyStoreModules = LazyStoreModules,
    ST extends InjectStoreModules = GenerateStoreType<M, LM>,
> = {
    setState: <MN extends keyof ST>(s: Partial<ST[MN]['state']>) => any;
    getState: <MN extends keyof ST>() => ST[MN]['state'];
    getMaps: <MN extends keyof ST>() => ST[MN]['maps'];
    getStore: () => Store<M, LM>;
    dispatch: Store<M, LM>['dispatch'];
};

export type MiddlewareActionRecordAPIMap<
    M extends Modules = Modules,
    LM extends LazyStoreModules = LazyStoreModules,
    ST extends InjectStoreModules = GenerateStoreType<M, LM>,
> = {
	[K in keyof ST]: {
        moduleName: K;
        actionName: keyof ST[K]['actions'];
        state: ST[K]['state'];
    }
};

export type MiddlewareActionRecordAPI<
    M extends Modules = Modules,
    LM extends LazyStoreModules = LazyStoreModules,
    ST extends InjectStoreModules = GenerateStoreType<M, LM>,
> = MiddlewareActionRecordAPIMap<M, LM, ST>[keyof ST];

export type MiddlewareNextAPI<
    M extends Modules = Modules,
    LM extends LazyStoreModules = LazyStoreModules,
    ST extends InjectStoreModules = GenerateStoreType<M, LM>,
> = (record: MiddlewareActionRecordAPI<M, LM, ST>) => any;

export type Middleware<
    M extends Modules = Modules,
    LM extends LazyStoreModules = LazyStoreModules,
> = (middlewareParams: MiddlewareParamsAPI<M, LM>)
    => (next: MiddlewareNextAPI)
        => MiddlewareNextAPI


export type InterceptorActionRecordAPI = {
    moduleName: string;
    actionName: string;
    actionArgs: any;
    actionFunc: AnyFun;
};

export type InterceptorParamsAPI = {
    setState: (s: State) => any;
    getState: () => State;
    getMaps: () => InjectMaps | undefined;
    getStore: () => StoreBase;
    dispatch: (moduleName: string, actionName: string, ...arg: any) => any;
};

export type InterceptorNextAPI = (record: InterceptorActionRecordAPI) => any;

export type Interceptor = (filterParams: InterceptorParamsAPI)
    => (next: InterceptorNextAPI)
        => InterceptorNextAPI;
    