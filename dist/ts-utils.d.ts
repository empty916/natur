import { StoreModule, Maps } from './createStore';
declare type AnyFun = (...args: any) => any;
declare type Fn<T extends Array<any>, S extends any> = (...arg: T) => S;
declare type ActionArg<Action extends AnyFun> = Parameters<Action>;
declare type ActionActualReturnType<Action extends AnyFun> = (ReturnType<Action> extends AnyFun ? ReturnType<ReturnType<Action>> : ReturnType<Action>);
declare type ActionReturnType<Action extends AnyFun, S extends any> = ActionActualReturnType<Action> extends Partial<S> ? S : (ActionActualReturnType<Action> extends Promise<Partial<S>> ? Promise<S> : ActionActualReturnType<Action> extends undefined ? undefined : Promise<undefined>);
export declare type GenActionsType<OAS extends {
    [m: string]: AnyFun;
}, S> = {
    [a in keyof OAS]: Fn<ActionArg<OAS[a]>, ActionReturnType<OAS[a], S>>;
};
declare type ExcludeStateGetterDep<MapItem, StateGetterDep> = MapItem extends StateGetterDep ? (StateGetterDep extends MapItem ? never : MapItem) : MapItem;
declare type MapsFunType<M extends Maps, S extends StoreModule['state']> = {
    [k in keyof M]: M[k] extends Array<any> ? ExcludeStateGetterDep<Extract<M[k][0], AnyFun>, (s: S) => any> : M[k] extends AnyFun ? M[k] : never;
};
declare type MapsFun = {
    [m: string]: AnyFun;
};
declare type MapsReturnType<MF extends MapsFun> = {
    [k in keyof MF]: ReturnType<MF[k]>;
};
/**
 * 生成maps类型
 */
export declare type GenMapsType<M extends Maps, S extends StoreModule['state']> = MapsReturnType<MapsFunType<M, S>>;
declare type StoreModuleWithMaps = {
    state: StoreModule['state'];
    actions: StoreModule['actions'];
    maps: Maps;
};
declare type StoreModuleWithoutMaps = {
    state: StoreModule['state'];
    actions: StoreModule['actions'];
};
export declare type ModuleType<M extends StoreModuleWithMaps | StoreModuleWithoutMaps> = {
    [m in keyof M]: m extends 'state' ? M['state'] : (m extends 'actions' ? GenActionsType<M['actions'], M['state']> : (m extends 'maps' ? (M extends StoreModuleWithMaps ? GenMapsType<M['maps'], M['state']> : undefined) : never));
};
/**
 * 获取promise值的类型
 */
export declare type PickPromiseType<P extends () => Promise<any>> = Parameters<Extract<Parameters<ReturnType<P>['then']>[0], Function>>[0];
export declare type PromiseModuleType<PM extends () => Promise<StoreModuleWithMaps | StoreModuleWithoutMaps>, M extends StoreModuleWithMaps | StoreModuleWithoutMaps = PickPromiseType<PM>> = {
    [m in keyof M]: m extends 'state' ? M['state'] : (m extends 'actions' ? GenActionsType<M['actions'], M['state']> : (m extends 'maps' ? (M extends StoreModuleWithMaps ? GenMapsType<M['maps'], M['state']> : undefined) : never));
};
export declare type GenerateStoreType<MS extends {
    [m: string]: StoreModuleWithMaps | StoreModuleWithoutMaps;
}, PMS extends {
    [m: string]: () => Promise<StoreModuleWithMaps | StoreModuleWithoutMaps>;
}> = {
    [k in keyof MS]: ModuleType<MS[k]>;
} & {
    [k in keyof PMS]: PromiseModuleType<PMS[k]>;
};
export {};
