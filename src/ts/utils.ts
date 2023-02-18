import { NonReactStatics } from "hoist-non-react-statics";
import { ClassAttributes, ComponentClass, ComponentType } from "react";
import {
	StoreModule,
	Maps,
	LazyStoreModules,
	Modules,
	InjectStoreModules,
	States,
	ModuleName,
	State,
	InjectMaps,
	InjectStoreModule,
	EventType,
	GlobalResetStatesOption,
	StoreBase,
	ListenerBase,
	ListenerAPIBase,
	AllListenerBase,
	AnyFun,
	MapsFun,
	GlobalAction,
} from "./base";

/**
 * 获取promise值的类型
 */
export type PickPromiseType<P extends () => Promise<any>> =
	P extends () => Promise<infer V> ? V : never;

type StoreModuleWithMaps = {
	state: StoreModule["state"];
	actions: StoreModule["actions"];
	maps: Maps;
};
type StoreModuleWithoutMaps = {
	state: StoreModule["state"];
	actions: StoreModule["actions"];
};

/**
 * 生成模块类型
 */
export type ModuleType<M extends StoreModule> = {
	[m in keyof M]: 
		m extends "state" ? M["state"] : m extends "actions"
				? GenActionsType<M["actions"], M["state"]> 
				: m extends "maps"
					? M extends StoreModuleWithMaps
						? GenMapsType<M["maps"], M["state"]>
						: undefined
					: m extends 'watch' ? never : never;
};

/**
 * 生成懒加载模块的类型
 */
export type PromiseModuleType<
	PM extends () => Promise<StoreModuleWithMaps | StoreModuleWithoutMaps>,
	M extends StoreModuleWithMaps | StoreModuleWithoutMaps = PickPromiseType<PM>
> = {
	[m in keyof M]: m extends "state"
		? M["state"]
		: m extends "actions"
		? GenActionsType<M["actions"], M["state"]>
		: m extends "maps"
		? M extends StoreModuleWithMaps
			? GenMapsType<M["maps"], M["state"]>
			: undefined
		: never;
};

/**
 * 生成StoreType
 * key是模块和懒加载模块的名字
 * value是模块和懒加载模块对应的{state, actions, maps}对象
 */
export type GenerateStoreType<
	MS extends Modules,
	_LM extends LazyStoreModules,
	PMS extends Modules = PickLazyStoreModules<_LM>
> = {
	[k in keyof MS]: ModuleType<MS[k]>;
} & {
	[k in keyof PMS]: ModuleType<PMS[k]>;
};

export type AllStates<
	M extends Modules,
	_LM extends LazyStoreModules,
	LM extends Modules = PickLazyStoreModules<_LM>
> = {
	[KM in keyof M]: M[KM]["state"];
} & {
	[KM in keyof LM]?: LM[KM]["state"];
};

/**
 * 删除了default的懒加载类型
 */
export interface PickedLazyStoreModules {
	[p: string]: () => Promise<StoreModule>;
}

/**
 * 将懒加载类型计算为于同步类型相同的类型
 */
export type PickLazyStoreModules<LMS extends LazyStoreModules> = {
	[p in keyof LMS]: LMS[p] extends () => Promise<infer V>
		? V extends StoreModule
			? Omit<V, "default">
			: V extends { default: StoreModule }
			? V["default"]
			: never
		: never;
};

/**
 * 如果action返回值是一个函数，那么返回 返回函数 的返回值
 */
type ActionActualReturnType<Action extends AnyFun> =
	ReturnType<Action> extends AnyFun
		? ReturnType<ReturnType<Action>>
		: ReturnType<Action>;

/**
 * 将actions的返回值中的Partial<state>替换为state
 */
type ReplacePartialStateToState<ART, S, PS = Partial<S>> = Extract<
	ART,
	PS | Promise<PS>
> extends never
	? ART
	: Extract<ART, PS | Promise<PS>> extends PS
	? Exclude<ART, PS> | S
	: Extract<ART, PS | Promise<PS>> extends Promise<PS>
	? Exclude<ART, Promise<PS>> | Promise<S>
	: Extract<ART, PS | Promise<PS>> extends Promise<PS> | PS
	? Exclude<ART, Promise<PS> | PS> | Promise<S> | S
	: ART;

/**
 * 生成action方法的返回值
 */
export type ActionReturnType<
	Action extends AnyFun,
	S extends any
> = ReplacePartialStateToState<ActionActualReturnType<Action>, S>;

type Fn<T extends Array<any>, S extends any> = (...arg: T) => S;
type ActionArg<Action extends AnyFun> = Parameters<Action>;

/**
 * 生成actions类型
 */
export type GenActionsType<OAS extends { [m: string]: AnyFun }, S> = {
	[a in keyof OAS]: Fn<ActionArg<OAS[a]>, ActionReturnType<OAS[a], S>>;
};

type ExcludeStateGetterDep<MapItem, StateGetterDep> =
	MapItem extends StateGetterDep
		? StateGetterDep extends MapItem
			? never
			: MapItem
		: MapItem;

type MapsFunType<M extends Maps, S extends StoreModule["state"]> = {
	[k in keyof M]: M[k] extends Array<any>
		? ExcludeStateGetterDep<Extract<M[k][0], AnyFun>, (s: S) => any>
		: M[k] extends AnyFun
		? M[k]
		: never;
};

type MapsReturnType<MF extends MapsFun> = {
	[k in keyof MF]: ReturnType<MF[k]>;
};

/**
 * 生成maps类型
 */
export type GenMapsType<
	M extends Maps,
	S extends StoreModule["state"]
> = MapsReturnType<MapsFunType<M, S>>;

// Infers prop type from component C
export type GetProps<C> = C extends ComponentType<infer P>
	? C extends ComponentClass<P>
		? ClassAttributes<InstanceType<C>> & P
		: P
	: never;

export type GetLibraryManagedProps<C> = JSX.LibraryManagedAttributes<
	C,
	GetProps<C>
>;

// Applies LibraryManagedAttributes (proper handling of defaultProps
// and propTypes), as well as defines WrappedComponent.
export type ConnectedComponent<C extends ComponentType<any>, P> = ComponentType<
	P & {
		/*** if React version is too lower
		 * and React dose not support React.forwardRef feature
		 * you can use forwardedRef instead of
		 */
		forwardedRef?: GetLibraryManagedProps<C>["ref"];
	}
> &
	NonReactStatics<C>;

export type Fun<P> = (p: P) => any;

export type ModuleDepDec<
	ST extends InjectStoreModules = InjectStoreModules,
	MN extends keyof ST = string
> = [
	MN,
	{
		[k in Extract<keyof ST[MN], "state" | "maps">]?: k extends "state"
			? Array<keyof ST[MN]["state"] | Fun<ST[MN]["state"]>>
			: k extends "maps"
			? Array<keyof ST[MN]["maps"]>
			: never;
	}
];

export type AllModuleEventMap<
	M extends Modules = Modules,
	LM extends LazyStoreModules = LazyStoreModules,
	ST extends InjectStoreModules = GenerateStoreType<M, LM>,
	MN extends keyof ST = keyof ST,
	MANS = {
		[k in MN]: keyof ST[k]["actions"];
	}
> = {
	[k in EventType]: {
		type: k;
		moduleName: Extract<MN, string>;
		actionName: k extends "init" | "remove" | 'beforeRemove'
			? undefined
			: Extract<MANS[keyof MANS], string> | GlobalAction;
		oldModule: k extends "init" ? undefined : ST[MN];
		newModule: k extends "remove" ? undefined : ST[MN];
	};
};

export type AllModuleEvent<
	M extends Modules = Modules,
	LM extends LazyStoreModules = LazyStoreModules,
	ST extends InjectStoreModules = GenerateStoreType<M, LM>,
	MN extends keyof ST = keyof ST
> = AllModuleEventMap<M, LM, ST, MN>[EventType];

export type ActionName<
	M extends Modules = Modules,
	LM extends LazyStoreModules = LazyStoreModules,
	ST extends InjectStoreModules = GenerateStoreType<M, LM>,
	MN extends keyof ST = keyof ST
> = Extract<keyof ST[MN]["actions"], string>;


export interface AllListenerAPI<
	M extends Modules = Modules,
	LM extends LazyStoreModules = LazyStoreModules,
	ST extends InjectStoreModules = GenerateStoreType<M, LM>,
> extends ListenerAPIBase {
	getState: <MN extends keyof ST>() => ST[MN]['state'];
	getMaps: <MN extends keyof ST>() => ST[MN]['maps'];
	getStore: () => Store<M, LM>;
	dispatch: <
		MN extends keyof ST,
		AN extends keyof ST[MN]["actions"]
	>(
		moduleName: MN,
		actionName: AN,
		...arg: Parameters<ST[MN]["actions"][AN]>
	) => ReturnType<ST[MN]["actions"][AN]>;
}


export type AllListener<
	M extends Modules = Modules,
	LM extends LazyStoreModules = LazyStoreModules
> = (me: AllModuleEvent<M, LM>, apis: AllListenerAPI<M, LM>) => any;


export type ModuleEventMap<
	M extends Modules = Modules,
	LM extends LazyStoreModules = LazyStoreModules,
	ST extends InjectStoreModules = GenerateStoreType<M, LM>,
	MN extends keyof ST = keyof ST
> = {
	[k in EventType]: {
		type: k;
		actionName: k extends "init" | "remove" | 'beforeRemove'
			? undefined
			: Extract<keyof ST[MN]['actions'], string> | GlobalAction;
		oldModule: k extends "init" ? undefined : ST[MN];
		newModule: k extends "remove" ? undefined : ST[MN];
	};
};

export type ModuleEvent<
	M extends Modules = Modules,
	LM extends LazyStoreModules = LazyStoreModules,
	ST extends InjectStoreModules = GenerateStoreType<M, LM>,
	MN extends keyof ST = keyof ST
> = ModuleEventMap<M, LM, ST, MN>[EventType]

export interface ListenerAPI<
	M extends Modules = Modules,
	LM extends LazyStoreModules = LazyStoreModules,
	ST extends InjectStoreModules = GenerateStoreType<M, LM>,
	MN extends keyof ST = keyof ST,
> extends ListenerAPIBase {
	getState: () => ST[MN]['state'];
	getMaps: () => ST[MN]['maps'];
	getStore: () => Store<M, LM>;
	dispatch: <
		MN extends keyof ST,
		AN extends keyof ST[MN]["actions"]
	>(
		moduleName: MN,
		actionName: AN,
		...arg: Parameters<ST[MN]["actions"][AN]>
	) => ReturnType<ST[MN]["actions"][AN]>;
}

export type Listener<
	M extends Modules = Modules,
	LM extends LazyStoreModules = LazyStoreModules,
	ST extends InjectStoreModules = GenerateStoreType<M, LM>,
	MN extends keyof ST = keyof ST,
> = (me: ModuleEvent<M, LM, ST, MN>, apis: ListenerAPI<M, LM, ST, MN>) => any;

/**
 * 生成store类型
 */
export interface Store<
	M extends Modules,
	LM extends LazyStoreModules,
	StoreType extends InjectStoreModules = GenerateStoreType<M, LM>,
	AOST extends Modules = M & {
		[k in keyof LM]: PickLazyStoreModules<LM>[k];
	},
	S extends Partial<States> = AllStates<M, LM>
> extends StoreBase {
	getModule: <MN extends keyof StoreType>(moduleName: MN) => StoreType[MN];
	setModule: <MN extends string, V extends StoreModule>(
		moduleName: MN,
		storeModule: V
	) => Store<Omit<M, MN> & Record<MN, V>, LM>;
	removeModule: (moduleName: ModuleName<M, LM>) => Store<M, LM>;
	setLazyModule: <MN extends string, V extends StoreModule>(
		moduleName: MN,
		lazyModule: () => Promise<V>
	) => Store<M, Omit<LM, MN> & Record<MN, () => Promise<V>>>;
	removeLazyModule: (moduleName: ModuleName<M, LM>) => Store<M, LM>;
	hasModule: (moduleName: ModuleName<M, LM>) => boolean;
	loadModule: <MN extends keyof LM>(
		moduleName: MN
	) => Promise<PickLazyStoreModules<LM>[MN]>;
	getOriginModule: <MN extends keyof AOST>(moduleName: MN) => AOST[MN];
	getLazyModule: (
		moduleName: ModuleName<{}, LM>
	) => () => Promise<StoreModule>;
	subscribe: <MN extends keyof AOST>(
		moduleName: MN,
		listener: Listener<M, LM, StoreType, Extract<MN, string>>
	) => () => void;
	subscribeAll: (listener: AllListener<M, LM>) => () => void;
	getAllModuleName: () => Extract<keyof StoreType, string>[];
	destroy: () => void;
	dispatch: <
		MN extends keyof StoreType,
		AN extends keyof StoreType[MN]["actions"]
	>(
		moduleName: MN,
		actionName: AN,
		...arg: Parameters<StoreType[MN]["actions"][AN]>
	) => ReturnType<StoreType[MN]["actions"][AN]>;
	globalSetStates: <D extends States = Partial<S>>(s: D) => void;
	globalResetStates: <MN extends keyof StoreType>(
		option?: GlobalResetStatesOption<Extract<MN, string>>
	) => void;
	getAllStates: () => AllStates<M, LM>;
	type: StoreType;
}
