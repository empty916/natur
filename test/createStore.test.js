import { createStore } from '../src';
import { getStoreInstance } from '../src/createStore';

let countMapCallTimes = 0;
let store;
const count = {
	state: {
		count: 0,
		name: 'count',
	},
	actions: {
		inc: state => ({ ...state, count: state.count + 1 }),
		updateName: state => ({ ...state, name: state.name + 1 }),
		asyncInc: state => Promise.resolve({ ...state, count: state.count + 1 }),
		dec: state => ({ ...state, count: state.count - 1 }),
		returnGet: state => state,
		asyncReturnGet: state => Promise.resolve(state),

		throwErrorAction: () => {
			throw new Error('something error');
		},
		asyncThrowErrorAction: () => Promise.reject('async something error'),
	},
	maps: {
		isOdd: state => state.count % 2 !== 0,
		getSplitNameWhenCountIsOdd: state => {
			countMapCallTimes ++;
			if (state.count % 2 !== 0) {
				return state.name.split('');
			}
			return state.count;
		}
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
		splitName: state => state.name.split(''),
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
	expect(targetModule.state).not.toBe(originModule.state);
	expect(targetModule.state).toEqual(originModule.state);
	expect(targetModule.actions).not.toEqual(originModule.actions);
	expect(Object.keys(targetModule.actions)).toEqual(Object.keys(originModule.actions));
}
const getOriginModule = (moduleName, originModule) => () => {
	const targetModule = store.getOriginModule(moduleName);
	expect(targetModule.state).not.toBe(originModule.state);
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
	const countModule = store.getModule('count');

	// count = 0, name='count', isOdd = false, getSplitNameWhenCountIsOdd = 'count'.split('');
	// mapCallTime: 1,
	expect(countModule.state.count).toBe(0);
	expect(countModule.maps.isOdd).toBe(false);
	expect(countModule.maps.getSplitNameWhenCountIsOdd).toBe(countModule.state.count);

	// count = 1, name='count', isOdd = true, getSplitNameWhenCountIsOdd = 'count'.split('');
	countModule.actions.inc(countModule.state);
	expect(countModule.state.count).toBe(1);
	expect(countModule.maps.isOdd).toBe(true);
	expect(countModule.maps.getSplitNameWhenCountIsOdd).toEqual(countModule.state.name.split(''));


	// count = 1, name='count1', isOdd = true, getSplitNameWhenCountIsOdd = 'count1'.split(''),
	countModule.actions.updateName(countModule.state);
	expect(countModule.maps.getSplitNameWhenCountIsOdd).toEqual('count1'.split(''));

	// count = 0; isOdd = false, getSplitNameWhenCountIsOdd = 0;
	countModule.actions.dec(countModule.state);
	expect(countModule.state.count).toBe(0);
	expect(countModule.maps.isOdd).toBe(false);
	expect(countModule.maps.getSplitNameWhenCountIsOdd).toBe(0);

	return countModule.actions.asyncInc(countModule.state)
		.then(state => {
			expect(countModule.state).toBe(state);
			expect(countModule.state.count).toBe(1);
			expect(countModule.maps.isOdd).toBe(true);
		});
}
const countMapsCache = () => {
	countMapCallTimes = 0;
	const countModule = store.getModule('count');
	// count: 0, isOdd: false
	countModule.maps.getSplitNameWhenCountIsOdd;
	expect(countMapCallTimes).toBe(1);

	// name: 'count1'
	countModule.actions.updateName(countModule.state);
	countModule.maps.getSplitNameWhenCountIsOdd
	expect(countMapCallTimes).toBe(1);

	// name: 'count11'
	countModule.actions.updateName(countModule.state);
	countModule.maps.getSplitNameWhenCountIsOdd
	expect(countMapCallTimes).toBe(1);

	// count: 1, isOdd: true
	countModule.actions.inc(countModule.state);
	countModule.maps.getSplitNameWhenCountIsOdd
	expect(countMapCallTimes).toBe(2);

	// name: 'count111'
	countModule.actions.updateName(countModule.state);
	countModule.maps.getSplitNameWhenCountIsOdd
	expect(countMapCallTimes).toBe(3);

	// name: 'count1111'
	countModule.actions.updateName(countModule.state);
	countModule.maps.getSplitNameWhenCountIsOdd
	expect(countMapCallTimes).toBe(4);

}

describe('init', () => {
	beforeEach(() => {
		store = createStore({ count, countWithoutMaps });
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
			state: {a: 1},
			actions: {a: () => {}},
			maps: {a: () => {}}
		}})).not.toThrow();
	})
	test('createStore', () => {
		expect(Object.keys(store)).toEqual([
			'addModule',
			'getAllModuleName',
			'getModule',
			'removeModule',
			'getOriginModule',
			'getLazyModule',
			'setModule',
			'hasModule',
			'subscribe',
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

describe('addModule', () => {
	beforeEach(() => {
		store = createStore({ count });
		store.addModule('name', name);
		store.addModule('nameWithMaps', nameWithMaps);
	});
	test('add illegal module', () => {
		expect(() => store.addModule('name1', {
			state: {a:1},
			actions: {a:1},
			maps: {a:1}
		})).toThrow('addModule: storeModule is illegal!');
		expect(() => store.addModule('name1', {
			state: {a:1},
			actions: {a:() => {}},
			maps: {a:1}
		})).toThrow('addModule: storeModule is illegal!');

		expect(() => store.addModule('name1', {
			state: {a:1},
			actions: {a:() => {}},
			maps: {a:() => {}}
		})).not.toThrow();

	})
	test('run actions', updateCountState);
	test('maps cache', countMapsCache);
	test('add module', () => {
		expect(store.addModule('name1', name)).toBe(store);
		expect(() => store.addModule('name11', {})).toThrow();
		expect(store.hasModule('name11')).toBe(false);
	});
	test('add module repeat', () => {
		const nameModule = store.getModule('name');
		expect(() => store.addModule('name', name)).toThrow();
		const name2Module = store.getModule('name');
		expect(nameModule).toBe(name2Module);
	});
	test('hasModule', hasModule('count'));
	test('hasNotModule', () => {
		hasNotModule('name1')()
		store.addModule('name1', name);
		hasModule('name1')()
	});
	test('get module', getModule('name', name));
	test('get origin module', getOriginModule('count', count));
	test('get module not exist', getModuleNotExist('name1'));
	test('get moduleWithoutMaps', getModuleWithoutMaps('name', name));
	test('get moduleWithMaps', getModuleWithMaps('nameWithMaps', nameWithMaps));
	test('getAllModuleName', getAllModuleName(['count', 'name', 'nameWithMaps']))
});

describe('removeModule', () => {
	beforeEach(() => {
		store = createStore({ count, name });
		store.addModule('nameWithMaps', nameWithMaps);
		store.removeModule('count');
	});
	test('module destory', () => {
		store.addModule('count', count);
		countMapsCache();
		store.removeModule('count', count);
	})
	test('hasModule', hasModule('name'));
	test('get module', getModule('name', name));
	test('hasNotModule', hasNotModule('count'));
	test('get module not exist', getModuleNotExist('count'));
	test('getAllModuleName', getAllModuleName(['name', 'nameWithMaps']))
});

describe('addModule then removeModule', () => {
	beforeEach(() => {
		store = createStore({ name });
		store.addModule('count', count);
		store.addModule('nameWithMaps', nameWithMaps);
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

describe('removeModule then addModule', () => {
	beforeEach(() => {
		store = createStore({ count });
		store.removeModule('count');
		store.addModule('count', count);
		store.addModule('name', name);
		store.addModule('nameWithMaps', nameWithMaps);
	});
	test('run actions', updateCountState);
	test('maps cache', countMapsCache);
	test('add module', () => {
		expect(store.addModule('name1', name)).toBe(store);
	});

	test('add module repeat', () => {
		const nameModule = store.getModule('name');
		expect(() => store.addModule('name', name)).toThrow();
		const name2Module = store.getModule('name');
		expect(nameModule).toBe(name2Module);
	});
	test('hasModule', hasModule('count'));
	test('hasNotModule', () => {
		hasNotModule('name1')()
		store.addModule('name1', name);
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

describe('setModule', () => {
	beforeEach(() => {
		store = createStore({ name });
		store.addModule('count', name);
		store.addModule('nameWithMaps', nameWithMaps);
		store.setModule('count', count);
	});
	test('run actions', updateCountState);
	test('maps cache', countMapsCache);
	test('set illegal module', () => {
		expect(() => store.setModule('name1', {})).toThrow();
		expect(() => store.addModule('name1', {
			state: {a:1},
			actions: {a:1},
			maps: {a:1}
		})).toThrow('addModule: storeModule is illegal!');
		expect(() => store.addModule('name1', {
			state: {a:1},
			actions: {a:() => {}},
			maps: {a:1}
		})).toThrow('addModule: storeModule is illegal!');

		expect(() => store.addModule('name1', {
			state: {a:1},
			actions: {a:() => {}},
			maps: {a:() => {}}
		})).not.toThrow();

	})
	test('add module', () => {
		expect(store.addModule('name1', name)).toBe(store);
	});
	test('add module repeat', () => {
		const nameModule = store.getModule('name');
		expect(() => store.addModule('name', name)).toThrow();
		const name2Module = store.getModule('name');
		expect(nameModule).toBe(name2Module);
	});
	test('hasModule', hasModule('count'));
	test('hasNotModule', () => {
		hasNotModule('name1')()
		store.addModule('name1', name);
		hasModule('name1')()
	});
	test('get module', getModule('name', name));
	test('get origin module', getOriginModule('count', count));
	test('get module not exist', getModuleNotExist('name1'));
	test('get moduleWithoutMaps', getModuleWithoutMaps('name', name));
	test('get moduleWithMaps', getModuleWithMaps('nameWithMaps', nameWithMaps));
	test('getAllModuleName', getAllModuleName(['name', 'count', 'nameWithMaps']))
});

describe('subscribe', () => {
	beforeEach(() => {
		store = createStore({ count });
	});
	test('subscribe listener', done => {
		const countModule = store.getModule('count');
		const oldCount = countModule.state.count;
		const unsub = store.subscribe('count', () => {
			expect(countModule.state.count).toBe(oldCount + 1);
			expect(countModule.maps.isOdd).toBe(true);
			done();
		});
		countModule.actions.inc(countModule.state);
	});
	test('subscribe unsuscribe', () => {
		const countModule = store.getModule('count');
		let callTimes = 0;
		const unsub = store.subscribe('count', () => callTimes ++);
		countModule.actions.inc(countModule.state);
		countModule.actions.inc(countModule.state);
		unsub();
		countModule.actions.inc(countModule.state);
		expect(callTimes).toBe(2);
	});
	test('subscribe async actions unsuscribe', () => {
		const countModule = store.getModule('count');
		let callTimes = 0;
		const unsub = store.subscribe('count', () => callTimes ++);
		countModule.actions.inc(countModule.state);
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
				count: 1,
			}
		}, [
			({getState}) => next => record => {
				expect(getState()).toBe(store.getModule('count').state);
				recordCache = {...record};
				return next(recordCache)
			},
			() => next => record => {
				expect(record).toBe(recordCache);
				return next(record)
			}
		]);
		// store.removeModule('count');
		// store.addModule('count', count);
	});
	test('return false value', () => {
		const countModule = store.getModule('count');
		expect(countModule.state.count).toBe(1);
		expect(countModule.actions.returnGet(0)).toBe(0);
		expect(countModule.actions.returnGet('')).toBe('');
		expect(countModule.actions.returnGet(false)).toBe(false);
		expect(countModule.actions.returnGet(null)).toBe(null);
		expect(countModule.actions.returnGet(undefined)).toBe(undefined);

		expect(countModule.actions.asyncReturnGet(0)).resolves.toBe(0);
		expect(countModule.actions.asyncReturnGet('')).resolves.toBe('');
		expect(countModule.actions.asyncReturnGet(false)).resolves.toBe(false);
		expect(countModule.actions.asyncReturnGet(null)).resolves.toBe(null);
		expect(countModule.actions.asyncReturnGet(undefined)).resolves.toBe(undefined);
	})

	test('return strange', () => {
		const countModule = store.getModule('count');

		expect(countModule.actions.returnGet(1)).toBe(countModule.state);
		expect(countModule.actions.returnGet('null')).toBe(countModule.state);
		expect(countModule.actions.returnGet([1,2,3])).toEqual({0:1,1:2,2:3});
		expect(countModule.actions.returnGet({})).toEqual({});

	});
	test('return normal', () => {
		const countModule = store.getModule('count');
		expect(countModule.actions.returnGet(countModule.state)).toBe(countModule.state);
		expect(countModule.actions.returnGet({...countModule.state})).toBe(countModule.state);
		expect(countModule.actions.returnGet({...countModule.state, newKey: 1})).not.toBe(countModule.state);
		expect(countModule.actions.asyncReturnGet(countModule.state)).resolves.toBe(countModule.state);
		expect(countModule.actions.asyncReturnGet({...countModule.state})).resolves.toBe(countModule.state);
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
});
