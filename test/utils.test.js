import {
	isEqualWithDepthLimit,
	ObjHasSameKeys,
	compose,
	isStoreModule,
	isFn,
	isFnObj,
	isObj,
} from '../src/utils'


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


describe('utils', () => {
	test('is obj', () => {
		function Person() {};

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
		expect(isEqualWithDepthLimit({}, [], 1)).toBe(true);
		expect(isEqualWithDepthLimit(null, [], 1)).toBe(false);
		expect(isEqualWithDepthLimit(null, {}, 1)).toBe(false);
		expect(isEqualWithDepthLimit(null, undefined, 1)).toBe(false);
		expect(isEqualWithDepthLimit(null, '', 1)).toBe(false);


	})
	test('obj has same key', () => {
		expect(ObjHasSameKeys(a, a1)).toBe(true);
		expect(ObjHasSameKeys(a1, a2)).toBe(true);
		expect(ObjHasSameKeys(a3, a4)).toBe(true);
		expect(ObjHasSameKeys(a3, a1)).toBe(true);
		expect(ObjHasSameKeys(a4, a1)).toBe(true);
		expect(ObjHasSameKeys({1: 2}, {2: 1})).toBe(false);
		expect(ObjHasSameKeys({}, {2: 1})).toBe(false);
		expect(ObjHasSameKeys({1: 2}, {})).toBe(false);
		expect(ObjHasSameKeys([], {})).toBe(true);
		expect(ObjHasSameKeys(null, {})).toBe(false);
		expect(ObjHasSameKeys(null, undefined)).toBe(false);
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
		expect(isFnObj({a: new Date()})).toBe(false);

	})
	test('is store module', () => {
		const cm = (maps = () => {}, actions = () => {}) => ({
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
			maps: {a2s: ({a}) => `${a}`},
		}

		expect(isStoreModule(m1)).toBe(false);
		expect(isStoreModule(m2)).toBe(true);
		expect(isStoreModule(m3)).toBe(true);
		expect(isStoreModule(cm(1, 2))).toBe(false);
		expect(isStoreModule(cm(() => {}, 2))).toBe(false);
		expect(isStoreModule(cm(1, () => {}))).toBe(false);
		expect(isStoreModule(cm(() => {}, () => {}))).toBe(true);
	})

	test('compose', () => {
		const add1 = a => a + 1;
		const add2 = a => a + 2;
		expect(compose(add1)).toBe(add1);
		expect(compose(add1, add2)(1)).toBe(4);
	})
})

