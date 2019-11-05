import { State } from './createStore'
import { getValueFromObjByKeyPath, arrayIsEqual } from './utils'

type MapDepParser = (s: State, p: any) => any;

export default class MapCache {
	private type: 'function' | 'array' = 'function';
	private map: Function;
	private mapDepends: Array<Function> = [];
	private depCache: Array<any> = [];
	private getState: () => State;

	private dependKeys: {[key: string]: true} = {};

	private shouldCheckDependsCache: boolean = true;
	private hasComparedDep: boolean = false;
	private firstRun: boolean = true;
	private value: any;

	static runningMap: MapCache | undefined;
	static getValueFromState: MapDepParser = getValueFromObjByKeyPath;

	constructor(
		getState: () => State,
		map: Array<string | Function> | Function
	) {
		this.getState = getState;
		if (typeof map === 'function') {
			this.type = 'function';
			this.map = map;
		} else {
			this.type = 'array';
			const copyMap = map.slice();
			this.map = copyMap.pop() as Function;
			copyMap.forEach(item => this.mapDepends.push(this.createGetDepByKeyPath(item)));
		}
	}
	static resetMapDepParser() {
		MapCache.getValueFromState = getValueFromObjByKeyPath;
	}
	static setMapDepParser(parser: MapDepParser) {
		MapCache.getValueFromState = parser;
	}
	createGetDepByKeyPath(keyPath: string | Function) {
		if (typeof keyPath === 'string') {
			return (s: State) => MapCache.getValueFromState(s, keyPath);
		}
		return keyPath;
	}
	shouldCheckCache() {
		this.shouldCheckDependsCache = true;
		this.hasComparedDep = false;
	}
	addDependKey(key: string) {
		if (!this.dependKeys[key] && this.type === 'function') {
			this.dependKeys[key] = true;
			this.mapDepends.push(this.createGetDepByKeyPath(key));
		}
	}
	getDepsValue() {
		return this.mapDepends.map(dep => dep(this.getState()));
	}
	hasDepChanged() {
		if (this.shouldCheckDependsCache && !this.hasComparedDep) {
			const newDepCache = this.getDepsValue();
			let depHasChanged = !arrayIsEqual(this.depCache, newDepCache);
			// 首次运行map，还没有缓存，只有在type是函数的情况下存在。
			if (this.firstRun) {
				depHasChanged =  true;
			}
			if (depHasChanged) {
				this.depCache = newDepCache;
			}
			this.shouldCheckDependsCache = false;
			this.hasComparedDep = true;
			return depHasChanged;
		}
		return false;
	}
	getValue() {
		if (this.hasDepChanged()) {
			if (this.type === 'function') {
				MapCache.runningMap = this;
				this.value = this.map(this.getState());
				MapCache.runningMap = undefined;
				if(this.firstRun) {
					this.depCache = this.getDepsValue();
				}
			} else {
				this.value = this.map(...this.depCache);
			}
		}
		if (this.firstRun) {
			this.firstRun = false;
		}
		return this.value;
	}

	destroy() {
		this.map = () => {};
		this.mapDepends = [];
		this.depCache = [];
		this.getState = () => ({});
		this.dependKeys = {};
	}
}
