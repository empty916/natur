import { GenerateStoreType, Modules, LazyStoreModules, Middleware, Store } from "./ts-utils";
declare const createStore: <M extends Modules, LM extends LazyStoreModules>(modules?: M, lazyModules?: LM, initStates?: Partial<{ [k in keyof GenerateStoreType<M, LM>]: GenerateStoreType<M, LM>[k]["state"]; }>, middlewares?: Middleware<GenerateStoreType<M, LM>>[]) => Store<M, LM>;
export default createStore;
