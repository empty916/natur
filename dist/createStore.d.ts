import { GenerateStoreType, PickPromiseType, Modules, LazyStoreModules, Middleware, Store, AllStates, Interceptor } from "./ts-utils";
declare const createStore: <M extends Modules, LM extends LazyStoreModules>(modules?: M, lazyModules?: LM, { initStates, middlewares, interceptors, }?: {
    initStates?: Partial<{ [k in keyof GenerateStoreType<M, LM>]: GenerateStoreType<M, LM>[k]["state"]; }> | undefined;
    middlewares?: Middleware<GenerateStoreType<M, LM>>[] | undefined;
    interceptors?: Interceptor<GenerateStoreType<M, LM>>[] | undefined;
}) => Store<M, LM, GenerateStoreType<M, LM>, M & { [k_1 in keyof LM]: PickPromiseType<LM[k_1]>; }, AllStates<M, LM>>;
export default createStore;
