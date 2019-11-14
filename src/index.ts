/**
 * @author empty916
 * @email [empty916@qq.com]
 * @create date 2019-08-09 17:12:57
 * @modify date 2019-08-09 17:12:57
 * @desc [description]
 */
import MapCache from './MapCache'
import { Store } from './createStore'
import { default as inject } from "./inject";
import { useInject } from "./hooks";
export {
	default as createStore,
	Listener,
	State,
	States,
	Action,
	Actions,
	Maps,
	InjectMaps,
	StoreModule,
	InjectStoreModule,
	LazyStoreModules,
	Modules,
	Store,
	Middleware,
} from "./createStore";

export const setMapDepParser = MapCache.setMapDepParser;
export const resetMapDepParser = MapCache.resetMapDepParser;
export {
	inject,
	useInject,
}
export const setInjectStoreGetter = (sg: () => Store) => {
	useInject.setStoreGetter(sg);
	inject.setStoreGetter(sg);
}
