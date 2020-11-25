import { GenerateStoreType, PickPromiseType, Modules, LazyStoreModules, Middleware, Store, AllStates, Interceptor, PickLazyStoreModules } from "./ts-utils";
/**
 *
 * @param modules 同步模块, 你的store模块
 * @param lazyModules 懒加载模块， 必填，如果没有可以传{}, 如果不填，那么ts的类型推断会有问题
 * @param param2 选项配置，详情见文档
 */
declare const createStore: <M extends Modules, LM extends LazyStoreModules>(modules: M | undefined, lazyModules: LM, { initStates, middlewares, interceptors, }?: {
    initStates?: Partial<{ [k in keyof GenerateStoreType<M, PickLazyStoreModules<LM>>]: GenerateStoreType<M, PickLazyStoreModules<LM>>[k]["state"]; }> | undefined;
    middlewares?: Middleware<GenerateStoreType<M, PickLazyStoreModules<LM>>>[] | undefined;
    interceptors?: Interceptor<GenerateStoreType<M, PickLazyStoreModules<LM>>>[] | undefined;
}) => Store<M, LM, PickLazyStoreModules<LM>, GenerateStoreType<M, PickLazyStoreModules<LM>>, M & { [k_1 in keyof PickLazyStoreModules<LM>]: PickPromiseType<PickLazyStoreModules<LM>[k_1]>; }, AllStates<M, PickLazyStoreModules<LM>, PickLazyStoreModules<PickLazyStoreModules<LM>>>>;
export default createStore;
