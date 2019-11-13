/**
 * @author empty916
 * @email [empty916@qq.com]
 * @create date 2019-08-09 17:12:57
 * @modify date 2019-08-09 17:12:57
 * @desc [description]
 */
import MapCache from './MapCache';
import { Store } from './createStore';
import { default as inject } from "./inject";
import { useInject } from "./hooks";
export { default as createStore, Listener, State, States, Action, Actions, Maps, InjectMaps, StoreModule, InjectStoreModule, LazyStoreModules, Modules, Store, Middleware, } from "./createStore";
export declare const setMapDepParser: typeof MapCache.setMapDepParser;
export declare const resetMapDepParser: typeof MapCache.resetMapDepParser;
export { inject, useInject, };
export declare const setInjectStoreGetter: (sg: () => Store) => void;
