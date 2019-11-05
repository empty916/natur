/**
 * @author empty916
 * @email [empty916@qq.com]
 * @create date 2019-08-09 17:12:57
 * @modify date 2019-08-09 17:12:57
 * @desc [description]
 */
import MapCache from './MapCache';
export { default as createStore, Listener, State, States, Action, Actions, Maps, InjectMaps, StoreModule, InjectStoreModule, LazyStoreModules, Modules, Store, Middleware, } from "./createStore";
export { default as inject } from "./inject";
export { useInject } from "./hooks";
export declare const setMapDepParser: typeof MapCache.setMapDepParser;
export declare const resetMapDepParser: typeof MapCache.resetMapDepParser;
