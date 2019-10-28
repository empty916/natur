import { MapCache } from '../src/utils'


describe('map catch', () => {
	let count = {};
	let mapsCatche = {};
	let proxyState;
	let mapCallCount = 0;
	beforeEach(() => {
		count = {
			state: {
				count: 0,
				name: 'count',
				obj: [{
					t: {
						a: 1,
					}
				}, {
					a: {
						a: 2
					},
				}]
			},
			actions: {
				inc: state => ({ ...state, count: state.count + 1 }),
				updateName: state => ({ ...state, name: state.name + 1 }),
				dec: state => ({ ...state, count: state.count - 1 }),
				addA1: state => ({
					...state,
					obj: [{
						t: {
							a: 5,
						}
					}, {
						a: {
							a: 2
						},
					}]
				}),
				addA2: state => ({
					...state,
					obj: [{
						t: {
							a: 2,
						}
					}, {
						a: {
							a: 10
						},
					}]
				})
			},
			maps: {
				isOdd: ['count', count => {
					mapCallCount ++;
					return count % 2 !== 0;
				}],
				getSplitNameWhenCountIsOdd: ['count', 'name', (count, name) => {
					mapCallCount ++;
					if (count % 2 !== 0) {
						return name;
					}
					return count;
				}],
				a1: ['obj[0].t.a', a => {
					mapCallCount ++;
					return a + 1
				}],
				a2: [
					state => state.obj[1].a.a,
					a => {
						mapCallCount ++;
						return a + 1
					}
				],
			}
		}
		proxyState = {};
		for(let key in count.state) {
			if (count.state.hasOwnProperty(key)) {
				Object.defineProperty(proxyState, key, {
					enumerable: true,
					configurable: true,
					get() {
						if (MapCache.runningMap) {
							MapCache.runningMap.addDependKey(key);
						}
						return count.state[key];
					}
				});
			}
		}
		Object.keys(count.maps).forEach(mapKey => {
			mapsCatche[mapKey] = new MapCache(
				() => proxyState,
				count.maps[mapKey],
			)
		})
	})
	const shouldCheckMapsDep = () => {
		for(let i in mapsCatche) {
			mapsCatche[i].shouldCheckCache();
		}
	};
	const inc = () => {
		count.state.count = count.state.count + 1;
		shouldCheckMapsDep();
	}
	const dec = () => {
		count.state.count = count.state.count - 1;
		shouldCheckMapsDep();
	}
	const updateName = (name) => {
		count.state.name = name;
		shouldCheckMapsDep();
	}
	const setA1 = a1 => {
		count.state.obj[0].t.a = a1;
		shouldCheckMapsDep();
	}
	const setA2 = a2 => {
		count.state.obj[1].a.a = a2;
		shouldCheckMapsDep();
	}
	test('map catch get value is correct', () => {
		expect(mapsCatche.isOdd.getValue()).toBe(false);
		expect(mapsCatche.getSplitNameWhenCountIsOdd.getValue()).toBe(0);

		inc();
		expect(mapsCatche.isOdd.getValue()).toBe(true);
		expect(mapsCatche.getSplitNameWhenCountIsOdd.getValue()).toBe('count');
		expect(mapsCatche.a1.getValue()).toBe(2);
		expect(mapsCatche.a2.getValue()).toBe(3);

		setA1(5);
		expect(mapsCatche.a1.getValue()).toBe(6);
		expect(mapsCatche.a2.getValue()).toBe(3);


		setA2(10);
		expect(mapsCatche.a1.getValue()).toBe(6);
		expect(mapsCatche.a2.getValue()).toBe(11);

	});

	test('map cache call count', () => {
		mapCallCount = 0;
		expect(mapsCatche.isOdd.getValue()).toBe(false);
		dec();inc();
		expect(mapsCatche.isOdd.getValue()).toBe(false);
		expect(mapsCatche.isOdd.getValue()).toBe(false);
		expect(mapCallCount).toBe(1);

		mapCallCount = 0;

		expect(mapsCatche.getSplitNameWhenCountIsOdd.getValue()).toBe(0);
		expect(mapsCatche.getSplitNameWhenCountIsOdd.getValue()).toBe(0);
		expect(mapsCatche.getSplitNameWhenCountIsOdd.getValue()).toBe(0);
		expect(mapCallCount).toBe(1);

		inc();
		expect(mapsCatche.getSplitNameWhenCountIsOdd.getValue()).toBe('count');
		expect(mapCallCount).toBe(2);
		expect(mapsCatche.getSplitNameWhenCountIsOdd.getValue()).toBe('count');
		expect(mapCallCount).toBe(2);

		updateName('count1');
		expect(mapsCatche.getSplitNameWhenCountIsOdd.getValue()).toBe('count1');
		expect(mapCallCount).toBe(3);

		inc();
		expect(mapsCatche.getSplitNameWhenCountIsOdd.getValue()).toBe(2);
		expect(mapCallCount).toBe(4);
	})
})
