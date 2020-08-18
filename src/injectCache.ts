import MapCache from "./MapCache";
import { Store, InjectStoreModules, Modules } from "./createStore";

type Fun<P> = (p: P) => any;

export type ModuleDepDec<MN extends string = string, ST extends InjectStoreModules = InjectStoreModules> = [MN, {
	state?: Array<keyof ST[MN]['state']|Fun<ST[MN]['state']>>;
	maps?: Array<keyof ST[MN]['maps']>;
}]

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

export const initDiff = <ST extends InjectStoreModules, AMOT extends Modules>(moduleDepDec: DepDecs, store: Store<ST, AMOT>):{
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