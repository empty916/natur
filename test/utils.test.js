import { isEqualWithDepthLimit, ObjHasSameKeys } from '../src/utils'


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
})
