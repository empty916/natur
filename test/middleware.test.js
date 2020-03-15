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

let store;
const count = {
	state: {
		count: 0,
		name: 'count',
		obj: [1]
	},
	actions: {
		inc: state => ({ ...state, count: state.count + 1 }),
		thunkInc: () => ({getState, setState, getMaps, dispatch}) => {
            dispatch('inc', getState());
            dispatch('count2/inc');

            return setState({ ...getState(), count: getState().count + 1 });
		},
		updateName: () => ({ name: 'tom' }),
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
        isOdd: ['count', count => count % 2 !== 0],
	}
}

const count2 = {
    state: 0, 
    actions: {
        inc: () => ({getState}) => getState() + 1,
    }
}
describe('actions', () => {
	beforeEach(() => {
        let recordCache = null;
        // store = createStore({ count }, {}, {}, [
        //     thunkMiddleware,
        //     promiseMiddleware,
        //     fillObjectRestDataMiddleware,
        //     shallowEqualMiddleware,
        //     filterNonObjectMiddleware,
        //     filterUndefinedMiddleware,
        // ]);
	});
	test('thunkMiddleware', () => {
        store = createStore({ count, count2 }, {}, {}, [
            thunkMiddleware,
            filterUndefinedMiddleware,
        ]);
        const countModule = store.getModule('count');
        
		expect(countModule.maps.isOdd).toBe(false);
        expect(countModule.actions.thunkInc().count).toBe(countModule.state.count + 2);
        const count2Module = store.getModule('count2');
        
		expect(count2Module.state).toBe(1);
    });
    test('promiseMiddleware', () => {
        store = createStore({ count }, {}, {}, [
            promiseMiddleware,
        ]);
        let countModule = store.getModule('count');
        return countModule.actions.asyncInc(countModule.state)
            .then(state => {
                expect(state.count).toBe(countModule.state.count + 1);
            })
    });
    test('fillObjectRestDataMiddleware', () => {
        store = createStore({ count }, {}, {}, [
            fillObjectRestDataMiddleware,
        ]);
        let countModule = store.getModule('count');
		expect(countModule.actions.updateName().name).toBe('tom');
		expect(countModule.actions.updateName().count).toBe(0);
    });
    test('shallowEqualMiddleware', () => {
        store = createStore({ count }, {}, {}, [
            shallowEqualMiddleware,
        ]);
        let countModule = store.getModule('count');
        countModule.actions.returnGet({...countModule.state})
        let newCountModule = store.getModule('count');
		expect(newCountModule.state).toBe(countModule.state);
    });
    test('filterNonObjectMiddleware', () => {
        store = createStore({ count }, {}, {}, [
            filterNonObjectMiddleware,
        ]);
        let countModule = store.getModule('count');
        expect(countModule.actions.returnGet(null)).toBe(null);
        let newCountModule = store.getModule('count');
		expect(newCountModule.state).toBe(countModule.state);
    });
    test('filterUndefinedMiddleware', () => {
        store = createStore({ count }, {}, {}, [
            filterUndefinedMiddleware,
        ]);
        let countModule = store.getModule('count');
        expect(countModule.actions.returnGet(undefined)).toBe(undefined);
        let newCountModule = store.getModule('count');
		expect(newCountModule.state).toBe(countModule.state);
    });
});
