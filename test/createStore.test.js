import { createStore } from '../src';
import { isObj } from '../src/utils';
import { getStoreInstance } from '../src/createStore';
import {
	promiseMiddleware,
	filterNonObjectMiddleware,
	fillObjectRestDataMiddleware,
	filterUndefinedMiddleware,
	shallowEqualMiddleware, 
	thunkMiddleware,
} from '../src/middlewares'

let countMapCallTimes = 0;
let store;
const count = {
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
		_inc: () => (getState, setState, getMaps) => {
			expect(getMaps()).toEqual({
				isOdd: true,
				getSplitNameWhenCountIsOdd: 'count'.split(''),
				a1: 2,
				a2: 3,
			});
			return { ...getState(), count: getState().count + 1 };
		},
		updateName: state => ({ ...state, name: state.name + 1 }),
		asyncInc: state => Promise.resolve({ ...state, count: state.count + 1 }),
		dec: state => ({ ...state, count: state.count - 1 }),
		returnGet: state => state,
		asyncReturnGet: state => Promise.resolve(state),

		throwErrorAction: () => {
			throw new Error('something error');
		},
		asyncThrowErrorAction: () => Promise.reject('async something error'),
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
		isOdd: ['count', count => count % 2 !== 0],
		getSplitNameWhenCountIsOdd: ['count', 'name', (count, name) => {
			countMapCallTimes ++;
			if (count % 2 !== 0) {
				return name && name.split('');
			}
			return count;
		}],
		a1: ['obj[0].t.a', a => a + 1],
		a2: [
			state => state.obj[1].a.a,
			a => a + 1
		],
	}
}
const countWithoutMaps = {
	state: {
		count: 0,
		name: 'count',
	},
	actions: {
		inc: state => ({ ...state, count: state.count + 1 }),
		asyncInc: state => Promise.resolve({ ...state, count: state.count + 1 }),
		dec: state => ({ ...state, count: state.count - 1 }),
	},
}
const name = {
	state: {
		name: 'test',
	},
	actions: {
		updateName: name => ({ name }),
	},
}
const nameWithMaps = {
	state: {
		name: 'test',
	},
	actions: {
		updateName: name => ({ name }),
	},
	maps: {
		splitName: ['name', name => name.split('')],
	}
}

const hasModule = (moduleName) => () => {
	expect(store.hasModule(moduleName)).toBe(true);
}
const hasNotModule = (notExistModuleName) => () => {
	expect(store.hasModule(notExistModuleName)).toBe(false);
}
const getModule = (moduleName, originModule) => () => {
	const targetModule = store.getModule(moduleName);
	expect(targetModule.state).toBe(originModule.state);
	expect(targetModule.state).toEqual(originModule.state);
	expect(targetModule.actions).not.toEqual(originModule.actions);
	expect(Object.keys(targetModule.actions)).toEqual(Object.keys(originModule.actions));
}
const getOriginModule = (moduleName, originModule) => () => {
	const targetModule = store.getOriginModule(moduleName);
	expect(targetModule.state).toBe(originModule.state);
	expect(targetModule.state).toEqual(originModule.state);
	expect(targetModule.actions).toBe(originModule.actions);
	expect(targetModule.maps).toBe(originModule.maps);
}
const getModuleNotExist = (moduleName) => () => {
	expect(() => store.getModule(moduleName)).toThrowError(new RegExp(`module: ${moduleName} is not valid!`));
}
const getModuleWithMaps = (moduleName, originModule) => () => {
	const targetModule = store.getModule(moduleName);
	expect(targetModule.maps).not.toBe(originModule.maps);
	expect(Object.keys(targetModule.maps)).toEqual(Object.keys(originModule.maps));
}
const getModuleWithoutMaps = (moduleName, originModule) => () => {
	const targetModule = store.getModule(moduleName);
	expect(targetModule.maps).toBe(undefined);
}
const getAllModuleName = (expectAllModuleName) => () => {
	const amn = store.getAllModuleName();
	const amn1 = store.getAllModuleName();
	expect(amn).toEqual(expectAllModuleName);
	expect(amn).toBe(amn1);
}

const updateCountState = () => {
	let countModule = store.getModule('count');

	// count = 0, name='count', isOdd = false, getSplitNameWhenCountIsOdd = 'count'.split('');
	// mapCallTime: 1,
	expect(countModule.state.count).toBe(0);
	expect(countModule.maps.isOdd).toBe(false);
	expect(countModule.maps.getSplitNameWhenCountIsOdd).toBe(countModule.state.count);

	// count = 1, name='count', isOdd = true, getSplitNameWhenCountIsOdd = 'count'.split('');
	countModule.actions.inc(countModule.state);
	countModule = store.getModule('count');
	expect(countModule.state.count).toBe(1);
	expect(countModule.maps.isOdd).toBe(true);
	expect(countModule.maps.getSplitNameWhenCountIsOdd).toEqual(countModule.state.name.split(''));


	// count = 1, name='count1', isOdd = true, getSplitNameWhenCountIsOdd = 'count1'.split(''),
	countModule.actions.updateName(countModule.state);
	countModule = store.getModule('count');
	expect(countModule.maps.getSplitNameWhenCountIsOdd).toEqual('count1'.split(''));

	// count = 0; isOdd = false, getSplitNameWhenCountIsOdd = 0;
	countModule.actions.dec(countModule.state);
	countModule = store.getModule('count');
	expect(countModule.state.count).toBe(0);
	expect(countModule.maps.isOdd).toBe(false);
	expect(countModule.maps.getSplitNameWhenCountIsOdd).toBe(0);

	return countModule.actions.asyncInc(countModule.state)
		.then(state => {
			countModule = store.getModule('count');
			expect(countModule.state).toBe(state);
			expect(countModule.state.count).toBe(1);
			expect(countModule.maps.isOdd).toBe(true);
		});
}
const countMapsCache = () => {
	countMapCallTimes = 0;
	let countModule = store.getModule('count');

	expect(countModule.maps.a1).toBe(2)
	expect(countModule.maps.a2).toBe(3)
	countModule.actions.addA1(countModule.state);
	countModule = store.getModule('count');
	expect(countModule.maps.a1).toBe(6)
	countModule.actions.addA2(countModule.state);
	countModule = store.getModule('count');
	expect(countModule.maps.a2).toBe(11)


	// count: 0, isOdd: false
	countModule.maps.getSplitNameWhenCountIsOdd;
	countModule.maps.getSplitNameWhenCountIsOdd;
	expect(countMapCallTimes).toBe(1);

	// name: 'count1'
	countModule.actions.updateName(countModule.state);
	countModule = store.getModule('count');
	countModule.maps.getSplitNameWhenCountIsOdd
	countModule.maps.getSplitNameWhenCountIsOdd
	countModule.maps.getSplitNameWhenCountIsOdd
	expect(countMapCallTimes).toBe(2);

	// name: 'count11'
	countModule.actions.updateName(countModule.state);
	countModule = store.getModule('count');
	countModule.maps.getSplitNameWhenCountIsOdd
	expect(countMapCallTimes).toBe(3);

	// count: 1, isOdd: true
	countModule.actions.inc(countModule.state);
	countModule = store.getModule('count');
	countModule.maps.getSplitNameWhenCountIsOdd
	countModule.maps.getSplitNameWhenCountIsOdd
	countModule.maps.getSplitNameWhenCountIsOdd
	countModule.maps.getSplitNameWhenCountIsOdd
	countModule.maps.getSplitNameWhenCountIsOdd
	countModule.maps.getSplitNameWhenCountIsOdd
	expect(countMapCallTimes).toBe(4);

	// name: 'count111'
	countModule.actions.updateName(countModule.state);
	countModule = store.getModule('count');
	countModule.maps.getSplitNameWhenCountIsOdd
	expect(countMapCallTimes).toBe(5);

	// name: 'count1111'
	countModule.actions.updateName(countModule.state);
	countModule = store.getModule('count');
	countModule.maps.getSplitNameWhenCountIsOdd
	expect(countMapCallTimes).toBe(6);

}

describe('init', () => {
	beforeEach(() => {
		store = createStore(
			{ count, countWithoutMaps },
			{},{},
			[promiseMiddleware, filterNonObjectMiddleware, shallowEqualMiddleware]
		);
	});
	test('createStore with illegal module', () => {
		expect(() => store = createStore({ count: {
			state: {a: 1},
			actions: {a: 1},
			maps: {a: 1}
		} })).toThrow();

		expect(() => store = createStore({ count: {
			state: {a: 1},
			actions: {a: 1},
		}})).toThrow();

		expect(() => store = createStore({ count: {
			state: {a: 1},
			actions: {a: () => {}},
		}})).not.toThrow();

		expect(() => store = createStore({ count: {
			state: [1],
			actions: {a: () => {}},
		}})).not.toThrow();

		expect(() => store = createStore({ count: {
			state: () => {},
			actions: {a: () => {}},
		}})).not.toThrow();

		expect(() => store = createStore({ count: {
			state: new Date(),
			actions: {a: () => {}},
		}})).not.toThrow();

		expect(() => store = createStore({ count: {
			state: {a: 1},
			actions: {a: () => {}},
			maps: {a: () => {}}
		}})).toThrow();

		expect(() => store = createStore({ count: {
			state: {},
			actions: {},
			maps: {}
		}})).not.toThrow();
	})
	test('createStore', () => {
		expect(Object.keys(store)).toEqual([
			'getAllModuleName',
			'getModule',
			'removeModule',
			'getOriginModule',
			'getLazyModule',
			'loadModule',
			'setModule',
			'hasModule',
			'subscribe',
			'destory',
			'dispatch',
		]);
		expect(getStoreInstance()).toBe(store);
	});
	test('hasModule', hasModule('count'));
	test('run actions', updateCountState);
	test('maps cache', countMapsCache);

	test('get module', getModule('count', count));
	test('get origin module', getOriginModule('count', count));

	test('hasNotModule', hasNotModule('name'));
	test('get module not exist', getModuleNotExist('name'));
	test('get moduleWithoutMaps', getModuleWithoutMaps('countWithoutMaps', countWithoutMaps));
	test('get moduleWithMaps', getModuleWithMaps('count', count));
	test('getAllModuleName', getAllModuleName(['count', 'countWithoutMaps']))

});

describe('setModule', () => {
	beforeEach(() => {
		store = createStore({ name }, {}, {}, [
			promiseMiddleware,
			filterNonObjectMiddleware,
			shallowEqualMiddleware
		]);
		store.setModule('count', name);
		store.setModule('nameWithMaps', nameWithMaps);
		store.setModule('count', count);
	});
	test('run actions', updateCountState);
	test('maps cache', countMapsCache);
	test('set illegal module', () => {
		expect(() => store.setModule('name1', {})).toThrow();
		expect(() => store.setModule('name1', {
			state: {a:1},
			actions: {a:1},
			maps: {a:1}
		})).toThrow();
		expect(() => store.setModule('name1', {
			state: {a:1},
			actions: {a:() => {}},
			maps: {a:1}
		})).toThrow();

		expect(() => store.setModule('name1', {
			state: [{a:1}],
			actions: {a:() => {}},
			maps: {a:() => {}}
		})).toThrow();

		expect(() => store.setModule('name1', {
			state: () => {},
			actions: {a:() => {}},
			maps: {a:() => {}}
		})).toThrow();

		expect(() => store.setModule('name1', {
			state: {a:1},
			actions: {a:() => {}},
			maps: {a:[() => {}]}
		})).not.toThrow();

		expect(() => store.setModule('name11', {
			state: {},
			actions: {},
			maps: {}
		})).not.toThrow();

		expect(store.getModule('name11').state).toEqual({});
		expect(store.getModule('name11').actions).toEqual({});
		expect(store.getModule('name11').maps).toEqual({});
	})
	test('set module', () => {
		expect(store.setModule('name1', name)).toBe(store);
		expect(() => store.setModule('name11', {})).toThrow();
		expect(store.hasModule('name11')).toBe(false);
	});
	test('set module repeat', () => {
		const nameModule = store.getModule('name');
		expect(() => store.setModule('name', name)).not.toThrow();
		const name2Module = store.getModule('name');
		expect(nameModule).not.toBe(name2Module);
	});
	test('hasModule', hasModule('count'));
	test('hasNotModule', () => {
		hasNotModule('name1')()
		store.setModule('name1', name);
		hasModule('name1')()
	});
	test('get module', getModule('name', name));
	test('get origin module', getOriginModule('count', count));
	test('get module not exist', getModuleNotExist('name1'));
	test('get moduleWithoutMaps', getModuleWithoutMaps('name', name));
	test('get moduleWithMaps', getModuleWithMaps('nameWithMaps', nameWithMaps));
	test('getAllModuleName', getAllModuleName(['name', 'count', 'nameWithMaps']))
});

describe('removeModule', () => {
	beforeEach(() => {
		store = createStore(
			{ count, name }, {}, {},
			[promiseMiddleware, filterNonObjectMiddleware, shallowEqualMiddleware]
		);
		store.setModule('nameWithMaps', nameWithMaps);
		store.removeModule('count');
	});
	test('module destory', () => {
		store.setModule('count', count);
		countMapsCache();
		store.removeModule('count', count);
	})
	test('hasModule', hasModule('name'));
	test('get module', getModule('name', name));
	test('hasNotModule', hasNotModule('count'));
	test('get module not exist', getModuleNotExist('count'));
	test('getAllModuleName', getAllModuleName(['name', 'nameWithMaps']))
});

describe('setModule then removeModule', () => {
	beforeEach(() => {
		store = createStore({ name }, {}, {}, [promiseMiddleware, filterNonObjectMiddleware, shallowEqualMiddleware]);
		store.setModule('count', count);
		store.setModule('nameWithMaps', nameWithMaps);
		store.removeModule('nameWithMaps');
	});
	test('run actions', updateCountState);
	test('maps cache', countMapsCache);

	test('hasModule', hasModule('name'));
	test('get module', getModule('name', name));
	test('hasNotModule', hasNotModule('nameWithMaps'));
	test('get module not exist', getModuleNotExist('nameWithMaps'));
	test('getAllModuleName', getAllModuleName(['name', 'count']))
});

describe('removeModule then setModule', () => {
	beforeEach(() => {
		store = createStore({ count }, {}, {},
			[promiseMiddleware, filterNonObjectMiddleware, shallowEqualMiddleware]
		);
		store.removeModule('count');
		store.setModule('count', count);
		store.setModule('name', name);
		store.setModule('nameWithMaps', nameWithMaps);
	});
	test('run actions', updateCountState);
	test('maps cache', countMapsCache);
	test('set module', () => {
		expect(store.setModule('name1', name)).toBe(store);
	});

	test('set module repeat', () => {
		const nameModule = store.getModule('name');
		expect(() => store.setModule('name', name)).not.toThrow();
		const name2Module = store.getModule('name');
		expect(nameModule).not.toBe(name2Module);
	});
	test('hasModule', hasModule('count'));
	test('hasNotModule', () => {
		hasNotModule('name1')()
		store.setModule('name1', name);
		hasModule('name1')()
	});
	test('get module', getModule('name', name));
	test('get module not exist', getModuleNotExist('name1'));
	test('get moduleWithoutMaps', getModuleWithoutMaps('name', name));
	test('get moduleWithMaps', getModuleWithMaps('nameWithMaps', nameWithMaps));
	test('getAllModuleName', getAllModuleName(['count', 'name', 'nameWithMaps']))
});

describe('lazyModule', () => {
	const lazyModule = () => Promise.resolve(count);
	const lazyModuleWithoutMaps = () => Promise.resolve(countWithoutMaps);
	beforeEach(() => {
		store = createStore({ count, name }, {
			lazyModule,
			lazyModuleWithoutMaps,
		});
	});
	test('hasModule', hasModule('name'));
	test('get module', getModule('name', name));
	test('get lazy module', () => {
		expect(store.getLazyModule('lazyModule')).toBe(lazyModule);
		expect(() => store.getLazyModule('lazyModule111')).toThrow();
		expect(store.getLazyModule('lazyModuleWithoutMaps')).toBe(lazyModuleWithoutMaps);
	});
	test('hasNotModule', hasNotModule('lazyModule'));
	test('get module not exist', getModuleNotExist('lazyModule'));
	test('getAllModuleName', getAllModuleName(['count', 'name', 'lazyModule', 'lazyModuleWithoutMaps']))
});

describe('subscribe', () => {
	beforeEach(() => {
		store = createStore(
			{ count }, {}, {},
			[promiseMiddleware, filterNonObjectMiddleware, shallowEqualMiddleware]
		);
	});

	test('subscribe listener', done => {
		let countModule = store.getModule('count');
		const oldCount = countModule.state.count;
		const unsub = store.subscribe('count', () => {
			countModule = store.getModule('count');
			expect(Object.keys(countModule.state)).toEqual(['count', 'name', 'obj']);
			expect(countModule.state.count).toBe(oldCount + 1);
			expect(countModule.maps.isOdd).toBe(true);
			done();
		});
		countModule.actions.inc(countModule.state);
	});
	test('subscribe unsuscribe', () => {
		let countModule = store.getModule('count');
		let callTimes = 0;
		const unsub = store.subscribe('count', () => {
			callTimes ++;
		});
		countModule.actions.inc(countModule.state);
		countModule = store.getModule('count');
		countModule.actions.inc(countModule.state);
		countModule = store.getModule('count');
		unsub();
		countModule.actions.inc(countModule.state);
		expect(callTimes).toBe(2);
	});
	test('subscribe async actions unsuscribe', () => {
		let countModule = store.getModule('count');
		let callTimes = 0;
		const unsub = store.subscribe('count', () => callTimes ++);
		countModule.actions.inc(countModule.state);
		countModule = store.getModule('count');
		return countModule.actions.asyncInc(countModule.state)
			.then(() => {
				expect(callTimes).toBe(2);
			})
	});
});

describe('actions', () => {
	beforeEach(() => {
		let recordCache = null;
		store = createStore({ name, count }, {}, {
			count: {
				...count.state,
				count: 1,
			}
		}, [
			thunkMiddleware,
			({getState}) => next => record => {
				expect(getState()).toBe(store.getModule('count').state);
				recordCache = {...record};
				return next(recordCache)
			},
			() => next => record => {
				expect(record).toBe(recordCache);
				return next(record)
			},
			promiseMiddleware,
			shallowEqualMiddleware,
			filterNonObjectMiddleware,
			filterUndefinedMiddleware
		]);
	});
	test('dispatch', () => {
		const countModule = store.getModule('count');
		expect(store.dispatch('count/inc', countModule.state).count).toBe(countModule.state.count+1);
		expect(() => store.dispatch('inc', countModule.state).count).toThrowError();
	});
	test('return no change state', () => {
		let recordCache = null;
		store = createStore({ name, count }, {}, {
			count: {
				...count.state,
				count: 1,
			}
		}, [
			thunkMiddleware,
			({getState}) => next => record => {
				expect(getState()).toBe(store.getModule('count').state);
				recordCache = {...record};
				return next(recordCache)
			},
			() => next => record => {
				expect(record).toBe(recordCache);
				// if (!isObj(record.state)) return record.state;
				return next(record)
			},
			promiseMiddleware,
			filterNonObjectMiddleware,
		]);
		let countModule = store.getModule('count');
		expect(countModule.actions.returnGet(countModule.state)).toBe(countModule.state);
		expect(store.dispatch('count/returnGet', countModule.state)).toBe(countModule.state);
	});
	test('return function', () => {
		let countModule = store.getModule('count');
		expect(countModule.actions._inc().count).toBe(countModule.state.count + 1);
	});
	test('return invalid type', () => {
		const countModule = store.getModule('count');

		expect(countModule.actions.returnGet(0)).toBe(0);
		expect(countModule.actions.returnGet('')).toBe('');
		expect(countModule.actions.returnGet(false)).toBe(false);
		expect(countModule.actions.returnGet(null)).toBe(null);
		expect(countModule.actions.returnGet(undefined)).toBe(undefined);

		function Person() {};
		const now = new Date();
		const p = new Person();
		expect(countModule.actions.returnGet(now)).toBe(now);
		expect(countModule.actions.returnGet(p)).toBe(p);
		expect(countModule.actions.returnGet(1)).toBe(1);
		expect(countModule.actions.returnGet('null')).toBe('null');
		expect(countModule.actions.returnGet([1,2,3])).toEqual([1,2,3]);

		const {asyncReturnGet} = countModule.actions;

		return Promise.all([
			asyncReturnGet(0),
			asyncReturnGet(''),
			asyncReturnGet(false),
			asyncReturnGet(null),
			asyncReturnGet(undefined),
			asyncReturnGet(1),
			asyncReturnGet('null'),
			asyncReturnGet([1,2,3]),
		]).then(res => {
			expect(res[0]).toBe(0);
			expect(res[1]).toBe('');
			expect(res[2]).toBe(false);
			expect(res[3]).toBe(null);
			expect(res[4]).toBe(undefined);
			expect(res[5]).toBe(1);
			expect(res[6]).toBe('null');
			expect(res[7]).toEqual([1,2,3]);
		});
	});
	test('return normal', () => {
		let countModule = store.getModule('count');

		expect(countModule.state.count).toBe(1);
		expect(countModule.state.name).toBe('count');

		expect(countModule.actions.returnGet(countModule.state)).toBe(countModule.state);
		expect(countModule.actions.returnGet({...countModule.state})).not.toBe(countModule.state);
		expect(countModule.actions.returnGet({...countModule.state, newKey: 1})).not.toBe(countModule.state);

		const {asyncReturnGet} = countModule.actions;
		return Promise.all([
			asyncReturnGet(countModule.state),
			asyncReturnGet({...countModule.state}),
		])
		.then(res => {
			expect(res[0]).toStrictEqual(countModule.state);
			expect(res[1]).toStrictEqual(countModule.state);
		})
	});
	test('return keys changed', () => {
		const countModule = store.getModule('count');
		const newKeyState = {...countModule.state, newKey: 1};
		const deleteKeyState = { ...countModule.state };
		delete deleteKeyState.name;

		expect(countModule.actions.returnGet(newKeyState).newKey).toBe(1);
		expect(countModule.actions.returnGet(newKeyState)).not.toBe(countModule.state);
		const {state} = store.getModule('count');
		expect(countModule.actions.returnGet(newKeyState)).toBe(state);
		return countModule.actions.asyncReturnGet(deleteKeyState)
			.then((deletedNameState) => {
				expect(deletedNameState.name).toBe(undefined);
				expect(countModule.actions.asyncReturnGet(deleteKeyState)).resolves.toBe(deletedNameState);
			});
	});
	test('throw error', () => {
		const countModule = store.getModule('count');
		expect(countModule.actions.throwErrorAction).toThrow();
		expect(countModule.actions.asyncThrowErrorAction()).rejects.toMatch('async something error');
	});

	test('unlimit state type', () => {
		store = createStore({
			unlimit: {
				state: [1],
				actions: {
					changeState: a => a,
				},
				maps: {
					firstAdd1: ['0', f => f + 1]
				}
			}
		});

		let unlimit = store.getModule('unlimit');
		expect(unlimit.maps.firstAdd1).toBe(2)
		expect(unlimit.state).toStrictEqual([1])
		unlimit.actions.changeState([2])

		unlimit = store.getModule('unlimit');
		expect(unlimit.state).toStrictEqual([2])
		expect(unlimit.maps.firstAdd1).toBe(3);

		unlimit = store.getModule('unlimit');
		const ns = new Map();
		ns.set('a', 10);
		unlimit.actions.changeState(ns)
		unlimit = store.getModule('unlimit');
		expect(unlimit.state).toBe(ns)
		expect(unlimit.maps.firstAdd1).toBe(NaN);
	})
});
