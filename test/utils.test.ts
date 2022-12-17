import {
	isEqualWithDepthLimit,
	// ObjHasSameKeys,
	compose,
	isStoreModule,
	isFn,
	isFnObj,
	isObj,
	getValueFromObjByKeyPath,
	
} from '../src/utils'

import { createInject, createStore } from "../src";
import {
	promiseMiddleware,
	filterNonObjectMiddleware,
	fillObjectRestDataMiddleware,
	shallowEqualMiddleware
} from '../src/middlewares'

import {isModuleDepDec} from '../src/injectCache';

const a = {
	a: 1,
	b: {
		a: 1,
		b: 2,
	},
}
const a1 = {
	a: 1,
	b: {
		a: 1,
		b: 2,
	},
}
const a2 = {
	a: 1,
	b: 2,
}
const a3 = {
	a: 1,
	b: 2,
}
const a4 = {
	a: 1,
	b: 3,
}
const name = {
	state: {
		text: 'name',
		count: 0,
	},
	actions: {
		updateText: (text: string) => ({text}),
		inc: (count: number) => ({count: count + 1}),
	},
	maps: {
		textSplit: ['text', (text: string) => text.split('').join(',')],
		firstChar: ['text', (text: string) => text[0]],
	}
}
const lazyName = {
	state: {
		text: 'name',
	},
	actions: {
		updateText: (text: string) => ({text}),
	},
	maps: {
		textSplit: ['text', (text: string) => text.split('').join(',')],
	}
}

export const store = createStore(
	{name},
	{
		lazyName: () => new Promise<typeof lazyName>(res => {
			setTimeout(() => {
				res(lazyName);
			}, 500);
		}),
		lazyLoadError: () => Promise.reject(lazyName),
	},
	{
		middlewares: [
			promiseMiddleware, 
			filterNonObjectMiddleware, 
			fillObjectRestDataMiddleware,
			shallowEqualMiddleware,
		]
	}
);

describe('utils', () => {
	test('is obj', () => {
		class Person {};

		expect(isObj({})).toBe(true);
		expect(isObj({a: 1})).toBe(true);
		expect(isObj({1: 1})).toBe(true);

		expect(isObj(undefined)).toBe(false);
		expect(isObj(null)).toBe(false);
		expect(isObj([])).toBe(false);
		expect(isObj(function() {})).toBe(false);
		expect(isObj(() => {})).toBe(false);
		expect(isObj(new Person())).toBe(false);
	})
	test('is equal with depth limit', () => {
		expect(isEqualWithDepthLimit(a, a1, 1)).toBe(false);
		expect(isEqualWithDepthLimit(a2, a3, 1)).toBe(true);
		expect(isEqualWithDepthLimit(a4, a3, 1)).toBe(false);
		expect(isEqualWithDepthLimit(a, a1, 2)).toBe(true);
		expect(isEqualWithDepthLimit(a, a, 1)).toBe(true);


		expect(isEqualWithDepthLimit([], {}, 1)).toBe(true);
		expect(isEqualWithDepthLimit([1,2,3], [1,2,3], 1)).toBe(true);
		expect(isEqualWithDepthLimit({}, [], 1)).toBe(true);
		expect(isEqualWithDepthLimit(null, [], 1)).toBe(false);
		expect(isEqualWithDepthLimit(null, {}, 1)).toBe(false);
		expect(isEqualWithDepthLimit(null, undefined, 1)).toBe(false);
		expect(isEqualWithDepthLimit(null, '', 1)).toBe(false);

		const d1 = {
			demo: {
				state: { text: 'name', count: 0 },
				maps: { textSplit: 'n,a,m,e', firstChar: 'n' }
			},
			demo1: {
				state: {},
				maps: {}
			},
		}
		const d2 = {
			demo: {
				state: d1.demo.state,
				maps: d1.demo.maps
			},
			demo1: {
				state: d1.demo1.state,
				maps: d1.demo1.maps
			},
		}

		const name1 = store.getModule('name');
		const name1_1 = store.getModule('name');
		store.dispatch('name', 'updateText', 'name2');
		const name2 = store.getModule('name');

		expect(isEqualWithDepthLimit(d1, d2, 2)).toBe(true);
		
		expect(isEqualWithDepthLimit(name1, name1_1, 2)).toBe(true);
		expect(isEqualWithDepthLimit(name1, name1_1, 3)).toBe(true);
		expect(isEqualWithDepthLimit(name1, name2, 2)).toBe(false);
		expect(isEqualWithDepthLimit(name1, name2, 3)).toBe(false);
	})
	
	test('is fn', () => {
		expect(isFn(new Function())).toBe(true);
		expect(isFn(() => {})).toBe(true);
		expect(isFn(null)).toBe(false);
		expect(isFn(undefined)).toBe(false);
		expect(isFn(1)).toBe(false);
		expect(isFn('1')).toBe(false);
		expect(isFn([])).toBe(false);
		expect(isFn({})).toBe(false);
		expect(isFn(new Date())).toBe(false);
	})
	test('is fn obj', () => {

		const obj1 = {
			a: () => {},
			b: () => {},
		}
		expect(isFnObj(obj1)).toBe(true);
		expect(isFnObj({a: null})).toBe(false);
		expect(isFnObj({a: undefined})).toBe(false);
		expect(isFnObj({a: 1})).toBe(false);
		expect(isFnObj({a: '1'})).toBe(false);
		expect(isFnObj({a: []})).toBe(false);
		expect(isFnObj({a: {}})).toBe(false);
		expect(isFnObj(1)).toBe(false);
		expect(isFnObj({a: new Date()})).toBe(false);

	})
	test('is store module', () => {
		const cm = (maps: any = [() => {}], actions: any = () => {}) => ({
			state: {a: 1},
			actions: {a: actions},
			maps: {a: maps},
		})
		const m1 = {
			state: {a: 1},
			actions: {ca: () => ({a: 2})},
			maps: 1,
		}
		const m2 = {
			state: {a: 1},
			actions: {ca: () => ({a: 2})},
			maps: undefined,
		}
		const m3 = {
			state: {a: 1},
			actions: {ca: () => ({a: 2})},
			maps: {a2s: [({a}: {a: number}) => `${a}`]},
		}

		expect(isStoreModule(m1)).toBe(false);
		expect(isStoreModule(m2)).toBe(true);
		expect(isStoreModule(m3)).toBe(true);
		expect(isStoreModule(cm(1, 2))).toBe(false);
		expect(isStoreModule(cm(() => {}, 2))).toBe(false);
		expect(isStoreModule(cm(1, () => {}))).toBe(false);
		expect(isStoreModule(cm([() => {}], () => {}))).toBe(true);
		expect(isStoreModule(cm(['a', 'b', () => {}], () => {}))).toBe(true);
	})

	test('compose', () => {
		const add1 = (a: number) => a + 1;
		const add2 = (a: number) => a + 2;
		expect(compose(add1)).toBe(add1);
		expect(compose(add1, add2)(1)).toBe(4);
	})

	test('getValueFromObjByKeyPath', () => {
		const obj = {
			a: 1,
			b: {
				b1: 2
			},
			c: {
				c1: {
					c11: 3,
				}
			},
			d: {
				d1: [{
					d11: 4
				}]
			},
		}
		expect(getValueFromObjByKeyPath(obj, 'a')).toBe(1);
		expect(getValueFromObjByKeyPath(obj, 'b.b1')).toBe(2);
		expect(getValueFromObjByKeyPath(obj, 'c.c1.c11')).toBe(3);
		expect(getValueFromObjByKeyPath(obj, 'd.d1[0].d11')).toBe(4);
		expect(getValueFromObjByKeyPath(obj, 'd.d1[1].d11')).toBe(undefined);

	})

	test('isModuleDepDec', () => {
		expect(isModuleDepDec([])).toBe(false);
		expect(isModuleDepDec({})).toBe(false);
		expect(isModuleDepDec(1)).toBe(false);
		expect(isModuleDepDec('1')).toBe(false);
		expect(isModuleDepDec(null)).toBe(false);
		expect(isModuleDepDec(undefined)).toBe(false);



		expect(isModuleDepDec([1, 2])).toBe(false);
		expect(isModuleDepDec(['11', 2])).toBe(true);
		expect(isModuleDepDec(['11', {
			state: 1
		}])).toBe(false);
		expect(isModuleDepDec(['11', {
			maps: 1
		}])).toBe(false);

		expect(isModuleDepDec(['11', {
			state: [],
		}])).toBe(true);
		expect(isModuleDepDec(['11', {
			maps: [],
		}])).toBe(true);
		expect(isModuleDepDec(['11', {
			maps: [],
			state: [],
		}])).toBe(true);
	})
})

