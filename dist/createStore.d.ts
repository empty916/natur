export interface Listener {
    (): void;
}
export interface State {
    [type: string]: any;
}
export interface States {
    [type: string]: State;
}
export interface Action {
    (...arg: any[]): void | undefined | State | Promise<State> | Promise<undefined>;
}
export interface Actions {
    [type: string]: Action;
}
export interface Maps {
    [p: string]: (state: State) => any;
}
export interface StoreModule {
    state: State;
    actions: Actions;
    maps?: Maps;
}
export interface LazyStoreModules {
    [p: string]: () => Promise<StoreModule>;
}
export interface Modules {
    [p: string]: StoreModule;
}
export declare type ModuleName = keyof Modules | keyof LazyStoreModules;
export declare type Middleware = (params: {
    setState: (m: ModuleName, state: any) => any;
    getState: State;
}) => (next: any) => (p: {
    moduleName: ModuleName;
    actionName: String;
    state: any;
}) => any;
export interface Store {
    createDispatch: (a: string) => Action;
    addModule: (moduleName: ModuleName, storeModule: StoreModule) => void;
    getModule: (moduleName: ModuleName) => any;
    getOriginModule: (moduleName: ModuleName) => StoreModule | {};
    getLazyModule: (moduleName: ModuleName) => () => Promise<StoreModule>;
    setModule: (moduleName: ModuleName, storeModule: StoreModule) => void;
    hasModule: (moduleName: ModuleName) => boolean;
    subscribe: (moduleName: ModuleName, listener: Listener) => () => void;
    getAllModuleName: () => ModuleName[];
}
declare type CreateStore = (modules: Modules, lazyModules: LazyStoreModules, initStates: States, middlewares: Middleware[]) => Store;
declare const createStore: CreateStore;
export declare const getStoreInstance: () => Store;
export default createStore;
