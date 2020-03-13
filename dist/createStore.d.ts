export interface Listener {
    (): void;
}
export declare type State = any;
export interface States {
    [type: string]: State;
}
declare type PartialState = Partial<State>;
declare type PartialStates = {
    [type: string]: PartialState;
};
export interface Action {
    (...arg: any[]): any;
}
export interface Actions {
    [type: string]: Action;
}
declare type StoreMap = Array<string | Function>;
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
    maps?: {
        [m: string]: any;
    };
}
export interface LazyStoreModules {
    [p: string]: () => Promise<StoreModule>;
}
export interface Modules {
    [p: string]: StoreModule;
}
declare type Next = (record: Record) => ReturnType<Action>;
declare type Record = {
    moduleName: ModuleName;
    actionName: String;
    state: ReturnType<Action>;
};
declare type MiddlewareParams = {
    setState: Next;
    getState: () => State;
    getMaps: () => InjectMaps | undefined;
};
export declare type ModuleName = keyof Modules | keyof LazyStoreModules;
export declare type Middleware = (middlewareParams: MiddlewareParams) => (next: Next) => Next;
export interface Store {
    getModule: (moduleName: ModuleName) => InjectStoreModule;
    setModule: (moduleName: ModuleName, storeModule: StoreModule) => Store;
    removeModule: (moduleName: ModuleName) => Store;
    hasModule: (moduleName: ModuleName) => boolean;
    loadModule: (moduleName: ModuleName) => Promise<InjectStoreModule>;
    getOriginModule: (moduleName: ModuleName) => StoreModule | {};
    getLazyModule: (moduleName: ModuleName) => () => Promise<StoreModule>;
    subscribe: (moduleName: ModuleName, listener: Listener) => () => void;
    getAllModuleName: () => ModuleName[];
    destory: () => void;
    dispatch: (action: string, ...arg: any) => ReturnType<Action>;
}
declare type CreateStore = (modules?: Modules, lazyModules?: LazyStoreModules, initStates?: PartialStates, middlewares?: Middleware[]) => Store;
declare const createStore: CreateStore;
export declare const getStoreInstance: () => Store;
export default createStore;
