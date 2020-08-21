import { GenerateStoreType } from './ts-utils';
export declare type ModuleEvent<AN extends string = string> = {
    type: 'init' | 'update' | 'remove';
    actionName?: AN;
};
export interface Listener<AN extends string = string> {
    (me: ModuleEvent<AN>): any;
}
export declare type State = any;
declare type AnyFun = (...arg: any) => any;
export interface States {
    [type: string]: State;
}
export interface Action {
    (...arg: any[]): any;
}
export interface Actions {
    [type: string]: Action;
}
declare type StoreMap = Array<string | AnyFun> | AnyFun;
export interface Maps {
    [p: string]: StoreMap;
}
export interface InjectMaps {
    [p: string]: any;
}
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
export interface LazyStoreModules {
    [p: string]: () => Promise<StoreModule>;
}
export interface Modules {
    [p: string]: StoreModule;
}
export declare type InjectStoreModules = {
    [k: string]: InjectStoreModule;
};
declare type ActionRecord = {
    moduleName: string;
    actionName: string;
    state: ReturnType<Action>;
};
declare type Next = (record: ActionRecord) => ReturnType<Action>;
export declare type MiddlewareParams<StoreType extends InjectStoreModules> = {
    setState: Next;
    getState: () => State;
    getMaps: () => InjectMaps | undefined;
    dispatch: <MN extends keyof StoreType, AN extends keyof StoreType[MN]['actions']>(moduleName: MN, actionName: AN, ...arg: Parameters<StoreType[MN]['actions'][AN]>) => ReturnType<StoreType[MN]['actions'][AN]>;
};
declare type globalResetStatesOption<MN extends string = string> = {
    include?: Array<MN | RegExp>;
    exclude?: Array<MN | RegExp>;
};
export declare type ModuleName = string;
export declare type Middleware<StoreType extends {
    [k: string]: InjectStoreModule;
}> = (middlewareParams: MiddlewareParams<StoreType>) => (next: Next) => Next;
export interface Store<StoreType extends InjectStoreModules, AOST extends Modules, S extends Partial<{
    [k in keyof StoreType]: Partial<StoreType[k]['state']>;
}> = Partial<{
    [k in keyof StoreType]: Partial<StoreType[k]['state']>;
}>> {
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
    globalResetStates: <MN extends keyof StoreType>(option?: globalResetStatesOption<Extract<MN, string>>) => void;
    type: StoreType;
}
declare const createStore: <M extends Modules, LM extends LazyStoreModules>(modules?: M, lazyModules?: LM, initStates?: Partial<{ [k in keyof GenerateStoreType<M, LM>]: GenerateStoreType<M, LM>[k]["state"]; }>, middlewares?: Middleware<GenerateStoreType<M, LM>>[]) => Store<GenerateStoreType<M, LM>, M & { [k in keyof LM]: Parameters<Extract<Parameters<ReturnType<LM[k]>["then"]>[0], Function>>[0]; }, Partial<{ [k in keyof GenerateStoreType<M, LM>]: Partial<GenerateStoreType<M, LM>[k]["state"]>; }>>;
export default createStore;
