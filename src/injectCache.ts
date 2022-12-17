import MapCache from "./MapCache";
import { Store, InjectStoreModules, Modules, LazyStoreModules, ModuleDepDec } from "./ts-utils";

export type DepDecs = {
	[m: string]: ModuleDepDec[1];
}

export const isModuleDepDec = (obj: any): obj is ModuleDepDec => {
	if (Array.isArray(obj) && obj.length === 2) {
		if (typeof obj[0] !== 'string') {
			return false;
		}
		if (obj[1].state && !Array.isArray(obj[1].state)) {
			return false;
		}
		if (obj[1].maps && !Array.isArray(obj[1].maps)) {
			return false;
		}
		return true;
	}
	return false;
}

export type Diff = {
    [m: string]: MapCache[];
};

export const initDiff = <M extends Modules, LM extends LazyStoreModules>(moduleDepDec: DepDecs, store: Store<M, LM>):{
	diff: Diff,
	destroy: Function,
} => {
	let diff: Diff = {};
	for(let moduleName in moduleDepDec) {
		if(moduleDepDec.hasOwnProperty(moduleName)) {
			diff[moduleName] = [];
			if (moduleDepDec[moduleName].state) {
				const stateCache = new MapCache(
					() => store.getModule(moduleName).state,
					[...moduleDepDec[moduleName].state as Array<string|Function>, () => {}],
				);
				stateCache.hasDepChanged();
				diff[moduleName].push(stateCache);
			}
			if (moduleDepDec[moduleName].maps) {
				const mapsCache = new MapCache(
					() => store.getModule(moduleName).maps,
					[...moduleDepDec[moduleName].maps as Array<string>, () => {}],
				);
				mapsCache.hasDepChanged();
				diff[moduleName].push(mapsCache);
			}
		}
	}

	const destroy = () => {
		for(let moduleName in diff) {
			diff[moduleName].forEach(cache => cache.destroy());
			diff[moduleName] = [];
		}
		diff = {};
	}
	return {
		diff,
		destroy,
	}
}

export type InitDiffReturnType = {
	diff: Diff;
	destroy: Function;
}