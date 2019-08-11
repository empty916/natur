/**
 * @author empty916
 * @email [empty916@qq.com]
 * @create date 2019-08-09 17:12:36
 * @modify date 2019-08-09 17:12:36
 * @desc [description]
 */
export interface Listener {
    (): void;
}
export interface State {
    [type: string]: any;
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
export interface Store {
    createDispatch: (a: string) => Action;
    addModule: (moduleName: ModuleName, storeModule: StoreModule) => void;
    getModule: (moduleName: ModuleName) => any;
    getLazyModule: (moduleName: ModuleName) => () => Promise<StoreModule>;
    setModule: (moduleName: ModuleName, storeModule: StoreModule) => void;
    hasModule: (moduleName: ModuleName) => boolean;
    subscribe: (moduleName: ModuleName, listener: Listener) => () => void;
    getAllModuleName: () => ModuleName[];
}
declare type TCreateStore = (modules: Modules, lazyModules: LazyStoreModules) => Store;
declare const createStore: TCreateStore;
export declare const getStoreInstance: () => Store;
export default createStore;
