import type { AllWatchAPI, AllWatchEvent, Maps, State, StoreModule, WatchAPI, WatchEvent } from './ts';
import { ThunkParams } from './middlewares';

export class NaturFactory {
	/**
	 * build a actions creator
	 * @param state state of module
	 * @param maps maps of module(optional)
	 * @returns return a actions creator
	 */
	static actionsCreator<S extends State, M extends Maps = Maps>(state: S, maps?: M) {
		function createActions<
			A extends Record<
				string,
				| ((...args: any[]) => (p: ThunkParams<S, M extends Maps ? M : Maps>) => Partial<S> | void | Promise<Partial<S> | void>)
				| ((...args: any[]) => Partial<S> | void | Promise<Partial<S> | void>)
			>,
		>(actions: A) {
			return actions;
		}
		return createActions;
	}
	/**
	 * build a map creator
	 * @param state state of module
	 * @returns return a map creator
	 */
	static mapCreator<S extends State>(state: S) {
		function createMap<MD1 extends (s: S) => any>(m: MD1): MD1;
		function createMap<MD1 extends (s: S) => any, F extends (p1: ReturnType<MD1>) => any>(...m: [MD1, F]): F;
		function createMap<
			MD1 extends (s: S) => any,
			MD2 extends (s: S) => any,
			F extends (p1: ReturnType<MD1>, p2: ReturnType<MD2>) => any,
		>(...m: [MD1, MD2, F]): F;
		function createMap<
			MD1 extends (s: S) => any,
			MD2 extends (s: S) => any,
			MD3 extends (s: S) => any,
			F extends (p1: ReturnType<MD1>, p2: ReturnType<MD2>, p3: ReturnType<MD3>) => any,
		>(...m: [MD1, MD2, MD3, F]): F;
		function createMap<
			MD1 extends (s: S) => any,
			MD2 extends (s: S) => any,
			MD3 extends (s: S) => any,
			MD4 extends (s: S) => any,
			F extends (p1: ReturnType<MD1>, p2: ReturnType<MD2>, p3: ReturnType<MD3>, p4: ReturnType<MD4>) => any,
		>(...m: [MD1, MD2, MD3, MD4, F]): F;
		function createMap<
			MD1 extends (s: S) => any,
			MD2 extends (s: S) => any,
			MD3 extends (s: S) => any,
			MD4 extends (s: S) => any,
			MD5 extends (s: S) => any,
			F extends (
				p1: ReturnType<MD1>,
				p2: ReturnType<MD2>,
				p3: ReturnType<MD3>,
				p4: ReturnType<MD4>,
				p5: ReturnType<MD5>,
			) => any,
		>(...m: [MD1, MD2, MD3, MD4, MD5, F]): F;
		function createMap<
			MD1 extends (s: S) => any,
			MD2 extends (s: S) => any,
			MD3 extends (s: S) => any,
			MD4 extends (s: S) => any,
			MD5 extends (s: S) => any,
			MD6 extends (s: S) => any,
			F extends (
				p1: ReturnType<MD1>,
				p2: ReturnType<MD2>,
				p3: ReturnType<MD3>,
				p4: ReturnType<MD4>,
				p5: ReturnType<MD5>,
				p6: ReturnType<MD6>,
			) => any,
		>(...m: [MD1, MD2, MD3, MD4, MD5, MD6, F]): F;
		function createMap<
			MD1 extends (s: S) => any,
			MD2 extends (s: S) => any,
			MD3 extends (s: S) => any,
			MD4 extends (s: S) => any,
			MD5 extends (s: S) => any,
			MD6 extends (s: S) => any,
			MD7 extends (s: S) => any,
			F extends (
				p1: ReturnType<MD1>,
				p2: ReturnType<MD2>,
				p3: ReturnType<MD3>,
				p4: ReturnType<MD4>,
				p5: ReturnType<MD5>,
				p6: ReturnType<MD6>,
				p7: ReturnType<MD7>,
			) => any,
		>(...m: [MD1, MD2, MD3, MD4, MD5, MD6, MD7, F]): F;
		function createMap<
			MD1 extends (s: S) => any,
			MD2 extends (s: S) => any,
			MD3 extends (s: S) => any,
			MD4 extends (s: S) => any,
			MD5 extends (s: S) => any,
			MD6 extends (s: S) => any,
			MD7 extends (s: S) => any,
			MD8 extends (s: S) => any,
			F extends (
				p1: ReturnType<MD1>,
				p2: ReturnType<MD2>,
				p3: ReturnType<MD3>,
				p4: ReturnType<MD4>,
				p5: ReturnType<MD5>,
				p6: ReturnType<MD6>,
				p7: ReturnType<MD7>,
				p8: ReturnType<MD8>,
			) => any,
		>(...m: [MD1, MD2, MD3, MD4, MD5, MD6, MD7, MD8, F]): F;
		function createMap<
			MD1 extends (s: S) => any,
			MD2 extends (s: S) => any,
			MD3 extends (s: S) => any,
			MD4 extends (s: S) => any,
			MD5 extends (s: S) => any,
			MD6 extends (s: S) => any,
			MD7 extends (s: S) => any,
			MD8 extends (s: S) => any,
			MD9 extends (s: S) => any,
			F extends (
				p1: ReturnType<MD1>,
				p2: ReturnType<MD2>,
				p3: ReturnType<MD3>,
				p4: ReturnType<MD4>,
				p5: ReturnType<MD5>,
				p6: ReturnType<MD6>,
				p7: ReturnType<MD7>,
				p8: ReturnType<MD8>,
				p9: ReturnType<MD8>,
			) => any,
		>(...m: [MD1, MD2, MD3, MD4, MD5, MD6, MD7, MD8, MD9, F]): F;
		function createMap<
			MD1 extends (s: S) => any,
			MD2 extends (s: S) => any,
			MD3 extends (s: S) => any,
			MD4 extends (s: S) => any,
			MD5 extends (s: S) => any,
			MD6 extends (s: S) => any,
			MD7 extends (s: S) => any,
			MD8 extends (s: S) => any,
			MD9 extends (s: S) => any,
			MD10 extends (s: S) => any,
			F extends (
				p1: ReturnType<MD1>,
				p2: ReturnType<MD2>,
				p3: ReturnType<MD3>,
				p4: ReturnType<MD4>,
				p5: ReturnType<MD5>,
				p6: ReturnType<MD6>,
				p7: ReturnType<MD7>,
				p8: ReturnType<MD8>,
				p9: ReturnType<MD8>,
			) => any,
		>(...m: [MD1, MD2, MD3, MD4, MD5, MD6, MD7, MD8, MD9, MD10, F]): F;
		function createMap<
			MD1 extends (s: S) => any,
			MD2 extends (s: S) => any,
			MD3 extends (s: S) => any,
			MD4 extends (s: S) => any,
			MD5 extends (s: S) => any,
			MD6 extends (s: S) => any,
			MD7 extends (s: S) => any,
			MD8 extends (s: S) => any,
			MD9 extends (s: S) => any,
			MD10 extends (s: S) => any,
			MD11 extends (s: S) => any,
			F extends (
				p1: ReturnType<MD1>,
				p2: ReturnType<MD2>,
				p3: ReturnType<MD3>,
				p4: ReturnType<MD4>,
				p5: ReturnType<MD5>,
				p6: ReturnType<MD6>,
				p7: ReturnType<MD7>,
				p8: ReturnType<MD8>,
				p9: ReturnType<MD8>,
			) => any,
		>(...m: [MD1, MD2, MD3, MD4, MD5, MD6, MD7, MD8, MD9, MD10, MD11, F]): F;
		function createMap(...m: any[]) {
			return m;
		}
		return createMap;
	}
	/**
	 *
	 * @param m natur module you want watch
	 * @param state state of current module
	 * @param maps maps of current module
	 * @returns
	 */
	static watchCreator<SM extends StoreModule = StoreModule, S extends State = State, M extends Maps = Maps>(
		m?: SM,
		state?: S,
		maps?: M,
	) {
		function createWatch<
			W extends
				| Record<string, (event: WatchEvent<SM>, api: WatchAPI<S, M>) => any>
				| ((event: AllWatchEvent, api: AllWatchAPI) => any),
		>(w: W) {
			return w;
		}
		return createWatch;
	}
	/**
	 * create a watch object of a natur module
	 * @param w
	 * @returns
	 */
	static createWatch<
		W extends
			| Record<string, (event: WatchEvent<any>, api: WatchAPI<any, any>) => any>
			| ((event: AllWatchEvent, api: AllWatchAPI) => any),
	>(w: W) {
		return w;
	}
}
