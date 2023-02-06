import { NonReactStatics } from "hoist-non-react-statics";
import { ClassAttributes, ComponentClass, ComponentType, FunctionComponent } from "react";

export interface ModuleEvent<
	M extends Modules = Modules,
	LM extends LazyStoreModules = LazyStoreModules,
	ST extends InjectStoreModules = GenerateStoreType<M, LM>,
	MN extends keyof ST = keyof ST,
> {
	type: 'init' | 'update' | 'remove';
	actionName?: ActionName<M, LM> | undefined | 'globalSetStates' | 'globalResetStates';
	oldModule: undefined | ST[MN];
	newModule: undefined | ST[MN];
};

export interface AllModuleEvent<
	M extends Modules = Modules,
	LM extends LazyStoreModules = LazyStoreModules,
	ST extends InjectStoreModules = GenerateStoreType<M, LM>,
	MN extends keyof ST = keyof ST,
	MANS = {
		[k in MN]: keyof ST[k]['actions']
	}
> {
	type: 'init' | 'update' | 'remove';
	moduleName: Extract<keyof ST, string>;
	actionName?: Extract<MANS[keyof MANS], string> | undefined | 'globalSetStates' | 'globalResetStates';
	oldModule: undefined | InjectStoreModule;
	newModule: undefined | InjectStoreModule;
};

export type ActionName<
	M extends Modules = Modules,
	LM extends LazyStoreModules = LazyStoreModules,
	ST extends InjectStoreModules = GenerateStoreType<M, LM>,
	MN extends keyof ST = keyof ST,
> = Extract<keyof ST[MN]['actions'], string>

export interface Listener<
	M extends Modules = Modules,
	LM extends LazyStoreModules = LazyStoreModules,
	ST extends InjectStoreModules = GenerateStoreType<M, LM>,
	MN extends keyof ST = keyof ST,
> {
	(me: ModuleEvent<M, LM, ST, MN>, apis: ListenerAPI<M, LM>): any;
}

export interface AllListener<
	M extends Modules = Modules,
	LM extends LazyStoreModules = LazyStoreModules,
> {
	(me: AllModuleEvent<M, LM>, apis: ListenerAPI<M, LM>): any;
}

export interface Watcher<
	M extends Modules = Modules,
	LM extends LazyStoreModules = LazyStoreModules,
	ST extends InjectStoreModules = GenerateStoreType<M, LM>,
	MN extends keyof ST = keyof ST,
	> {
	(me: ModuleEvent<M, LM, ST, MN>, apis: WatchAPI<M, LM>): any;
}

export interface AllWatcher<
	M extends Modules = Modules,
	LM extends LazyStoreModules = LazyStoreModules,
> {
	(me: AllModuleEvent<M, LM>, apis: WatchAPI<M, LM>): any;
}


export type State = any;

export type AnyFun = (...arg: any) => any;


// Infers prop type from component C
export type GetProps<C> = C extends ComponentType<infer P>
  ? C extends ComponentClass<P>
    ? ClassAttributes<InstanceType<C>> & P
    : P
  : never


export type GetLibraryManagedProps<C> = JSX.LibraryManagedAttributes<
  C,
  GetProps<C>
>;

// Applies LibraryManagedAttributes (proper handling of defaultProps
// and propTypes), as well as defines WrappedComponent.
export type ConnectedComponent<
  C extends ComponentType<any>,
  P
> = ComponentType<P & {
	/*** if React version is too lower
	 * and React dose not support React.forwardRef feature
	 * you can use forwardedRef instead of
	 */
    forwardedRef?: GetLibraryManagedProps<C>['ref'];
  }> & NonReactStatics<C>;


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

export interface WatchObject {
	[k: string]: Watcher;
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

export type InjectStoreModules = {
	[k: string]: InjectStoreModule
}

export interface LazyStoreModules {
	[p: string]: () => Promise<StoreModule|{default: StoreModule}>;
}

export interface Modules {
	[p: string]: StoreModule;
}
export type MiddlewareActionRecord = {
	moduleName: string,
	actionName: string,
	state: ReturnType<Action>
};


export type MiddlewareNext = (record: MiddlewareActionRecord) => ReturnType<Action>;

export type ListenerAPI<
	M extends Modules = Modules,
	LM extends LazyStoreModules = LazyStoreModules,
	StoreType extends GenerateStoreType<M, LM> = GenerateStoreType<M, LM>
	> = {
	getState: () => State,
	getMaps: () => InjectMaps | undefined,
	getStore: () => Store<M, LM>,
	dispatch: <MN extends keyof StoreType, AN extends keyof StoreType[MN]['actions']>(moduleName: MN, actionName: AN, ...arg: Parameters<StoreType[MN]['actions'][AN]>) => ReturnType<StoreType[MN]['actions'][AN]>;
};

export type WatchAPI<
	M extends Modules = Modules,
	LM extends LazyStoreModules = LazyStoreModules,
	StoreType extends GenerateStoreType<M, LM> = GenerateStoreType<M, LM>
> = {
	getState: () => State,
	getMaps: () => InjectMaps | undefined,
	getStore: () => Store<M, LM>,
	localDispatch: <MN extends keyof StoreType, AN extends keyof StoreType[MN]['actions']>(actionName: AN, ...arg: Parameters<StoreType[MN]['actions'][AN]>) => ReturnType<StoreType[MN]['actions'][AN]>;
};

export type MiddlewareParams<
	M extends Modules = Modules,
	LM extends LazyStoreModules = LazyStoreModules,
	StoreType extends GenerateStoreType<M, LM> = GenerateStoreType<M, LM>
> = {
	setState: MiddlewareNext,
	getState: () => State,
	getMaps: () => InjectMaps | undefined,
	getStore: () => Store<M, LM>,
	dispatch: <MN extends keyof StoreType, AN extends keyof StoreType[MN]['actions']>(moduleName: MN, actionName: AN, ...arg: Parameters<StoreType[MN]['actions'][AN]>) => ReturnType<StoreType[MN]['actions'][AN]>;
};

export type InterceptorParams<
	M extends Modules = Modules,
	LM extends LazyStoreModules = LazyStoreModules,
	StoreType extends GenerateStoreType<M, LM> = GenerateStoreType<M, LM>
> = {
	setState: MiddlewareNext,
	getState: () => State,
	getMaps: () => InjectMaps | undefined,
	getStore: () => Store<M, LM>,
	dispatch: <MN extends keyof StoreType, AN extends keyof StoreType[MN]['actions']>(moduleName: MN, actionName: AN, ...arg: Parameters<StoreType[MN]['actions'][AN]>) => ReturnType<StoreType[MN]['actions'][AN]>;
};

export type GlobalResetStatesOption<MN extends string = string> = {
	include?: Array<MN|RegExp>;
	exclude?: Array<MN|RegExp>;
};

export type ModuleName<M, LM> = keyof M | keyof LM;

export type Middleware<
	M extends Modules = Modules,
	LM extends LazyStoreModules = LazyStoreModules,
> = (middlewareParams: MiddlewareParams<M, LM>) => (next: MiddlewareNext) => MiddlewareNext;


export type InterceptorActionRecord = {
	moduleName: string,
	actionName: string,
	actionArgs: Parameters<Action>;
	actionFunc: AnyFun;
};

export type InterceptorNext = (record: InterceptorActionRecord) => ReturnType<Action>;

export type Interceptor<
	M extends Modules = Modules,
	LM extends LazyStoreModules = LazyStoreModules
> = (filterParams: InterceptorParams<M, LM>) => (next: InterceptorNext) => InterceptorNext;


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
 * 删除了default的懒加载类型
 */
export interface PickedLazyStoreModules {
	[p: string]: () => Promise<StoreModule>;
}

/**
 * 将懒加载类型计算为于同步类型相同的类型
 */
export type PickLazyStoreModules<LMS extends LazyStoreModules> =  {
	[p in keyof LMS]: LMS[p] extends () => Promise<infer V> ?
		V extends StoreModule ?
			Omit<V, 'default'> : V extends {default: StoreModule} ?
				V['default'] : never : never;
};

/**
 * 生成模块类型
 */
export type ModuleType<M extends StoreModule> = {
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


type SMW = StoreModuleWithMaps | StoreModuleWithoutMaps;

/**
 * 生成StoreType
 * key是模块和懒加载模块的名字
 * value是模块和懒加载模块对应的{state, actions, maps}对象
 */
export type GenerateStoreType<
	MS extends Modules,
	_LM extends LazyStoreModules,
	PMS extends Modules = PickLazyStoreModules<_LM>
	// MS extends {
	// 	[m: string]: SMW
	// },
	// PMS extends {
	// 	[m: string]: () => Promise<SMW|{default: SMW}>
	// }
> = {
	[k in keyof MS]: ModuleType<MS[k]>;
} & {
	[k in keyof PMS]: ModuleType<PMS[k]>;
}


export type AllStates<
	M extends Modules,
	_LM extends LazyStoreModules,
	LM extends Modules = PickLazyStoreModules<_LM>
> = {
	[KM in keyof M]: M[KM]['state'];
} & {
	[KM in keyof LM]?: LM[KM]['state'];
};


/**
 * 生成store类型
 */
export interface Store<
	M extends Modules,
	LM extends LazyStoreModules,
	// LM extends Modules = PickLazyStoreModules<_LM>, // PickLazyStoreModules<LM>
	StoreType extends InjectStoreModules = GenerateStoreType<M, LM>,
	AOST extends Modules = (M &
	{
		[k in keyof LM]: PickLazyStoreModules<LM>[k];
	}),
	S = AllStates<M, LM>
> {
	getModule: <MN extends keyof StoreType>(moduleName: MN) => StoreType[MN];
	setModule: <MN extends keyof AOST>(moduleName: MN, storeModule: AOST[MN]) => Store<M, LM>;
	removeModule: (moduleName: ModuleName<M, LM>) => Store<M, LM>;
	setLazyModule: (moduleName: ModuleName<M, LM>, lazyModule: () => Promise<StoreModule>) => Store<M, LM>;
	removeLazyModule: (moduleName: ModuleName<M, LM>) => Store<M, LM>;
	hasModule: (moduleName: ModuleName<M, LM>) => boolean;
	loadModule: <MN extends keyof LM>(moduleName: MN) => Promise<PickLazyStoreModules<LM>[MN]>;
	getOriginModule: <MN extends keyof AOST>(moduleName: MN) => AOST[MN];
	getLazyModule: (moduleName: ModuleName<{}, LM>) => () => Promise<StoreModule>;
	subscribe: <MN extends keyof AOST>(moduleName: MN, listener: Listener<M, LM, StoreType, Extract<MN, string>>) => () => void;
	subscribeAll: (listener: AllListener<M, LM>) => () => void;
	getAllModuleName: () => (keyof StoreType)[];
	destroy: () => void;
	dispatch: <MN extends keyof StoreType, AN extends keyof StoreType[MN]['actions']>(moduleName: MN, actionName: AN, ...arg: Parameters<StoreType[MN]['actions'][AN]>) => ReturnType<StoreType[MN]['actions'][AN]>;
	globalSetStates: (s: Partial<S>) => void;
	globalResetStates: <MN extends keyof StoreType>(option?: GlobalResetStatesOption<Extract<MN, string>>) => void;
	getAllStates: () => AllStates<M, LM>;
	type: StoreType;
}


export type Fun<P> = (p: P) => any;


export type ModuleDepDec<ST extends InjectStoreModules = InjectStoreModules, MN extends keyof ST = string> = [MN, {
	[k in Extract<keyof ST[MN], 'state'|'maps'>]?:
		k extends 'state' ? Array<keyof ST[MN]['state']|Fun<ST[MN]['state']>> :
			k extends 'maps' ? Array<keyof ST[MN]['maps']> : never;
}];
