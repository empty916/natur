import { GenerateStoreType, PickPromiseType, Modules, LazyStoreModules, Middleware, Store } from "./ts-utils";
declare const createStore: <M extends Modules, LM extends LazyStoreModules>(modules?: M, lazyModules?: LM, initStates?: Partial<{ [k in keyof GenerateStoreType<M, LM>]: GenerateStoreType<M, LM>[k]["state"]; }>, middlewares?: Middleware<GenerateStoreType<M, LM>>[]) => Store<GenerateStoreType<M, LM>, M & { [k_1 in keyof LM]: PickPromiseType<LM[k_1]>; }, Partial<{ [k_2 in keyof GenerateStoreType<M, LM>]: Partial<GenerateStoreType<M, LM>[k_2]["state"]>; }>>;
export default createStore;
