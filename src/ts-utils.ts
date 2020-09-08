export type ModuleEvent<AN extends string = string> = {
	type: 'init' | 'update' | 'remove',
	actionName?: AN,
};

export interface Listener<AN extends string = string> {
	(me: ModuleEvent<AN>): any;
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

export type StoreMap = Array<string | AnyFun> | AnyFun;
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

export type InjectStoreModules = {
	[k: string]: InjectStoreModule
}

export interface LazyStoreModules {
	[p: string]: () => Promise<StoreModule>;
}
export interface Modules {
	[p: string]: StoreModule;
}
export type ActionRecord = {
	moduleName: string, 
	actionName: string, 
	state: ReturnType<Action>
};

export type Next = (record: ActionRecord) => ReturnType<Action>;

export type MiddlewareParams<StoreType extends InjectStoreModules> = {
	setState: Next,
	getState: () => State,
	getMaps: () => InjectMaps | undefined,
	dispatch: <MN extends keyof StoreType, AN extends keyof StoreType[MN]['actions']>(moduleName: MN, actionName: AN, ...arg: Parameters<StoreType[MN]['actions'][AN]>) => ReturnType<StoreType[MN]['actions'][AN]>;
};

export type GlobalResetStatesOption<MN extends string = string> = {
	include?: Array<MN|RegExp>;
	exclude?: Array<MN|RegExp>;
};

export type ModuleName = string;

export type Middleware<StoreType extends {
	[k: string]: InjectStoreModule
}> = (middlewareParams: MiddlewareParams<StoreType>) => (next: Next) => Next;

export interface Store<
	StoreType extends InjectStoreModules,
	AOST extends Modules,
	S extends Partial<{
		[k in keyof StoreType]: Partial<StoreType[k]['state']>
	}> = Partial<{
		[k in keyof StoreType]: Partial<StoreType[k]['state']>
	}>
> {
	getModule: <MN extends keyof StoreType>(moduleName: MN) => StoreType[MN];
	setModule: <MN extends keyof AOST>(moduleName: MN, storeModule: AOST[MN]) => Store<StoreType, AOST>;
	removeModule: (moduleName: ModuleName) => Store<StoreType, AOST>;
	setLazyModule: (moduleName: ModuleName, lazyModule: () => Promise<StoreModule>) => Store<StoreType, AOST>;
	removeLazyModule: (moduleName: ModuleName) => Store<StoreType, AOST>;
	hasModule: (moduleName: ModuleName) => boolean;
	loadModule: <MN extends keyof StoreType>(moduleName: MN) => Promise<StoreType[MN]>;
	getOriginModule: <MN extends keyof AOST>(moduleName: MN) => AOST[MN];
	getLazyModule: (moduleName: ModuleName) => () => Promise<StoreModule>;
	subscribe: <MN extends keyof AOST>(moduleName: MN, listener: Listener<Extract<keyof AOST[MN]['actions'], string>>) => () => void;
	getAllModuleName: () => (keyof StoreType)[];
	destory: () => void;
	dispatch: <MN extends keyof StoreType, AN extends keyof StoreType[MN]['actions']>(moduleName: MN, actionName: AN, ...arg: Parameters<StoreType[MN]['actions'][AN]>) => ReturnType<StoreType[MN]['actions'][AN]>;
	globalSetStates: (s: S) => void;
	globalResetStates: <MN extends keyof StoreType>(option?: GlobalResetStatesOption<Extract<MN, string>>) => void;
	type: StoreType;
}



type Fn<T extends Array<any>, S extends any> = (...arg: T) => S;
type ActionArg<Action extends AnyFun> = Parameters<Action>;

/**
 * 如果action返回值是一个函数，那么返回 返回函数 的返回值
 */
type ActionActualReturnType<Action extends AnyFun> =
	(ReturnType<Action> extends AnyFun ? ReturnType<ReturnType<Action>> : ReturnType<Action>);

/**
 * 将actions的返回值中的Partial<state>替换为state
 */
type ReplacePartialStateToState<ART, S, PS = Partial<S>> = Extract<ART, PS | Promise<PS>> extends never ? ART : 
	Extract<ART, PS | Promise<PS>> extends PS ? (Exclude<ART, PS> | S) :
	Extract<ART, PS | Promise<PS>> extends Promise<PS> ? (Exclude<ART, Promise<PS>> | Promise<S>) :
	Extract<ART, PS | Promise<PS>> extends (Promise<PS> | PS) ? (Exclude<ART, (Promise<PS> | PS)> | Promise<S> | S) : ART;

/**
 * 生成action方法的返回值
 */
type ActionReturnType<Action extends AnyFun, S extends any> = ReplacePartialStateToState<ActionActualReturnType<Action>, S>;

// type actionReturn = {a: number} | 1 | Promise<{a: number}>;
// type actionReturn = undefined | 1 | {a: number};
// type s = {a: number, b: number};
// type ps = Partial<s>;


// type t = ReplacePartialStateToState<actionReturn, s>;

/**
 * 生成actions类型
 */
export type GenActionsType<OAS extends {[m: string]: AnyFun}, S> = {
	[a in keyof OAS]: Fn<ActionArg<OAS[a]>, ActionReturnType<OAS[a], S>>
};

type ExcludeStateGetterDep<MapItem, StateGetterDep> =  MapItem extends StateGetterDep ? (StateGetterDep extends MapItem ? never : MapItem) : MapItem;

type MapsFunType<M extends Maps, S extends StoreModule['state']> = {
	[k in keyof M]: M[k] extends Array<any> ? ExcludeStateGetterDep<Extract<M[k][0], AnyFun>, (s: S) => any> : M[k] extends AnyFun ? M[k] : never;
}

type MapsFun = {
	[m: string]: AnyFun;
}
type MapsReturnType<MF extends MapsFun> = {
	[k in keyof MF]: ReturnType<MF[k]>;
}
/**
 * 生成maps类型
 */
export type GenMapsType<M extends Maps, S extends StoreModule['state']> = MapsReturnType<MapsFunType<M, S>>;

type StoreModuleWithMaps = {
	state: StoreModule['state'];
	actions: StoreModule['actions'];
	maps: Maps;
}
type StoreModuleWithoutMaps = {
	state: StoreModule['state'];
	actions: StoreModule['actions'];
}

/**
 * 生成模块类型
 */
export type ModuleType<M extends StoreModuleWithMaps|StoreModuleWithoutMaps> = {
	[m in keyof M]: m extends 'state' ? M['state'] :
		(m extends 'actions' ? GenActionsType<M['actions'], M['state']> :
			(m extends 'maps' ? (M extends StoreModuleWithMaps ? GenMapsType<M['maps'], M['state']> : undefined) : never));
}

/**
 * 获取promise值的类型
 */
// export type PickPromiseType<P extends () => Promise<any>> = Parameters<Extract<Parameters<ReturnType<P>['then']>[0], Function>>[0];
export type PickPromiseType<P extends () => Promise<any>> = P extends () => Promise<infer V> ? V : never;


/**
 * 生成懒加载模块的类型
 */
export type PromiseModuleType<
	PM extends () => Promise<StoreModuleWithMaps | StoreModuleWithoutMaps>,
	M extends StoreModuleWithMaps | StoreModuleWithoutMaps = PickPromiseType<PM>
> = {
	[m in keyof M]: m extends 'state' ? M['state'] :
		(m extends 'actions' ? GenActionsType<M['actions'], M['state']> :
			(m extends 'maps' ? (M extends StoreModuleWithMaps ? GenMapsType<M['maps'], M['state']> : undefined) : never));
}

/**
 * 生成store类型
 */
export type GenerateStoreType<
	MS extends {
		[m: string]: StoreModuleWithMaps|StoreModuleWithoutMaps
	},
	PMS extends {
		[m: string]: () => Promise<StoreModuleWithMaps|StoreModuleWithoutMaps>
	}
> = {
	[k in keyof MS]: ModuleType<MS[k]>;
} & {
	[k in keyof PMS]: PromiseModuleType<PMS[k]>;
}
