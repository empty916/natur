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
    MiddlewareActionRecordBase,
    GlobalAction
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
			: keyof M["actions"] | GlobalAction;
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
				| GlobalAction;
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

export type SetStateAPI<
    M extends Modules = Modules,
    LM extends LazyStoreModules = LazyStoreModules,
    ST extends InjectStoreModules = GenerateStoreType<M, LM>,
    MN extends keyof ST = keyof ST,
> = {
    moduleName: Extract<MN, string>;
    actionName: Extract<keyof ST[MN]['actions'], string>;
    state: ST[MN]['state'];
}

export type MiddlewareParamsAPI<
    M extends Modules = Modules,
    LM extends LazyStoreModules = LazyStoreModules,
    ST extends InjectStoreModules = GenerateStoreType<M, LM>,
> = {
    setState: <MN extends keyof ST>(s: SetStateAPI<M, LM, ST, MN>) => any;
    getState: <MN extends keyof ST>() => ST[MN]['state'];
    getMaps: <MN extends keyof ST>() => ST[MN]['maps'];
    getStore: () => Store<M, LM> extends StoreBase ? Store<M, LM> : StoreBase;
    dispatch: Store<M, LM>['dispatch'];
};

export type MiddlewareActionRecordAPIMap<
    M extends Modules = Modules,
    LM extends LazyStoreModules = LazyStoreModules,
    ST extends InjectStoreModules = GenerateStoreType<M, LM>,
> = {
	[K in keyof ST]: {
        // moduleName: string;
        // actionName: string;
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
    => (next: MiddlewareNextAPI<M, LM>)
        => MiddlewareNextAPI<M, LM>


export type InterceptorActionRecordAPI<
    M extends Modules = Modules,
    LM extends LazyStoreModules = LazyStoreModules,
    ST extends InjectStoreModules = GenerateStoreType<M, LM>,
> = {
    moduleName: keyof ST;
    actionName: string;
    actionArgs: any;
    actionFunc: AnyFun;
};

export type InterceptorParamsAPI<
    M extends Modules = Modules,
    LM extends LazyStoreModules = LazyStoreModules,
    ST extends InjectStoreModules = GenerateStoreType<M, LM>,
    S = Store<M, LM> extends StoreBase ? Store<M, LM> : StoreBase,
    SD = S extends StoreBase ? S['dispatch'] : StoreBase['dispatch'],
> = {
    setState: <MN extends keyof ST>(s: SetStateAPI<M, LM, ST, MN>) => any;
    getState: <MN extends keyof ST>() => ST[MN]['state'];
    getMaps: <MN extends keyof ST>() => ST[MN]['maps'];
    getStore: () => S;
    dispatch: SD;
};

export type InterceptorNextAPI<
    M extends Modules = Modules,
    LM extends LazyStoreModules = LazyStoreModules,
    ST extends InjectStoreModules = GenerateStoreType<M, LM>,
> = (record: InterceptorActionRecordAPI<M, LM, ST>) => any;

export type Interceptor<
    M extends Modules = Modules,
    LM extends LazyStoreModules = LazyStoreModules,
> = (interceptorParams: InterceptorParamsAPI<M, LM>)
    => (next: InterceptorNextAPI<M, LM>)
        => InterceptorNextAPI<M, LM>;
    
