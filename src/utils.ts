/**
 * @author empty916
 * @email [empty916@qq.com]
 * @create date 2019-08-09 17:13:15
 * @modify date 2019-08-09 17:13:15
 * @desc [description]
 */

import { ModuleName, StoreModule } from './createStore'

export const ObjHasSameKeys = (obj1: Object, obj2: Object) => {
	if (!obj1 || !obj2) {
		return false;
	}
	if (Object.keys(obj1).length !== Object.keys(obj2).length) {
		return false;
	}
	for(let key in obj1) {
		if (obj1.hasOwnProperty(key)) {
			if (!obj2.hasOwnProperty(key)) {
				return false;
			}
		}
	}
	return true;
}

type Obj = {[p: string]: any}
type anyFn = (...arg: any[]) => any;
type fnObj = {[p: string]: anyFn};

export const isObj = <T = Obj>(obj: any): obj is T => typeof obj === 'object' && obj !== null && obj.constructor === Object;
export const isFn = (arg: any): arg is anyFn => typeof arg === 'function';
export const isFnObj = (obj: any): obj is fnObj => {
	if (isObj(obj)) {
		return Object.keys(obj).every(key => isFn(obj[key]));
	}
	return false;
}

export const isPromise = <T>(obj: any): obj is Promise<T> => obj && typeof obj.then === 'function'
// export const isVoid = <T>(ar: T | void): ar is void => !ar;
export const isStoreModule = (obj: any): obj is StoreModule => {
	if (!isObj(obj) || !isObj(obj.state) || !isFnObj(obj.actions)) {
		return false;
	}
	if (!!obj.maps && !isFnObj(obj.maps)){
		return false;
	}
	return true;
}

export const ObjChangedKeys = (source: Obj, afterChange: Obj) => {
	if (!isObj(afterChange) || !isObj(source) || source === afterChange) {
		return {
			updatedKeys: [],
			keyHasChanged: false,
		};
	}
	// KEY还在，但是值变化了的
	const updatedKeys = [];
	// KEY是否变动
	let keyHasChanged = false;

	for(let key in source) {
		if (source.hasOwnProperty(key)) {
			if (!afterChange.hasOwnProperty(key)) {
				keyHasChanged = true;
				updatedKeys.push(key);
			}
			if (afterChange.hasOwnProperty(key) && source[key] !== afterChange[key]) {
				updatedKeys.push(key);
			}
		}
	}
	for(let key in afterChange) {
		if (afterChange.hasOwnProperty(key)) {
			if (!source.hasOwnProperty(key)) {
				updatedKeys.push(key);
				keyHasChanged = true;
			}
		}
	}
	return {updatedKeys, keyHasChanged};
}


/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */

export function compose(...funcs: anyFn[]) {
  if (funcs.length === 0) {
    return (arg: any) => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}

const hasOwn = Object.prototype.hasOwnProperty;

function is(x: any, y: any) {
	if (x === y) {
		return x !== 0 || y !== 0 || 1 / x === 1 / y;
	} else {
		return x !== x && y !== y;
	}
}

export function isEqualWithDepthLimit(
	objA: any,
	objB: any,
	depthLimit: number = 3,
	depth: number = 1,
): boolean {
	if (is(objA, objB)) return true;

	if (
		typeof objA !== 'object' ||
		objA === null ||
		typeof objB !== 'object' ||
		objB === null
	) {
		return false;
	}

	const keysA = Object.keys(objA);
	const keysB = Object.keys(objB);

	if (keysA.length !== keysB.length) return false;

	for (let i = 0; i < keysA.length; i++) {
		if (
			!hasOwn.call(objB, keysA[i]) ||
			!is(objA[keysA[i]], objB[keysA[i]])
		) {
			if (
				typeof objA[keysA[i]] === 'object' &&
				typeof objB[keysB[i]] === 'object' &&
				depth < depthLimit
			) {
				return isEqualWithDepthLimit(
					objA[keysA[i]],
					objB[keysB[i]],
					depthLimit,
					depth + 1,
				);
			}
			return false;
		}
	}

	return true;
}



export class Depend {
	id: string;
	moduleName: ModuleName;
	stateName: string;
	watchers: Watcher[] = [];
	watchersMap: {[p: string]: true} = {};
	static targetWatcher: Watcher | undefined = undefined;
	constructor(moduleName: ModuleName, stateName: string) {
		this.moduleName = moduleName;
		this.stateName = stateName;
		this.id = `${moduleName}-${stateName}`;
	}
	addWatcher(watcher: Watcher) {
		if (!this.watchersMap[watcher.id]) {
			this.watchers.push(watcher);
			this.watchersMap[watcher.id] = true;
			watcher.addDepend(this);
		}
	}
	removeWatcher(watcher: Watcher) {
		this.watchers = this.watchers.filter(w => w !== watcher);
		delete this.watchersMap[watcher.id];
	}
	clearWatcher() {
		this.watchers.forEach(w => w.removeDepend(this));
		this.watchersMap = {};
		this.watchers = [];
	}
	notify() {
		this.watchers.forEach(w => w.update());
	}
	destroy() {
		this.clearWatcher();
	}
}

export class Watcher {
	depends: Depend[] = [];
	useCache: boolean = false;
	cache: any;
	moduleName: ModuleName;
	mapName: string;
	dependsMap: {[p: string]: true} = {};
	id: string;
	mapRunner: (...arg: any[]) => any;
	constructor(moduleName: ModuleName, mapName: string, runner: (...arg: any[]) => any) {
		this.moduleName = moduleName;
		this.mapName = mapName;
		this.mapRunner = runner;
		this.id = `${moduleName}-${mapName}`;
	}
	update() {
		this.useCache = false;
	}
	run() {
		Depend.targetWatcher = this;
		this.cache = this.mapRunner();
		Depend.targetWatcher = undefined;
		this.useCache = true;
	}
	addDepend(depend: Depend) {
		if (!this.dependsMap[depend.id]) {
			this.depends.push(depend);
			this.dependsMap[depend.id] = true;
		}
	}
	removeDepend(depend: Depend) {
		this.depends.filter(dep => dep !== depend);
		delete this.dependsMap[depend.id];
	}
	clearDepends() {
		this.depends.forEach(dep => dep.removeWatcher(this));
		this.depends = [];
		this.dependsMap = {};
	}
	destroy() {
		this.clearDepends();
		this.cache = null;
		this.mapRunner = () => {};
	}
}


