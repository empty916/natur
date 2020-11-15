import { createStore } from '../src';
import { isObj } from '../src/utils';
import {
	promiseMiddleware,
	filterNonObjectMiddleware,
	fillObjectRestDataMiddleware,
	filterUndefinedMiddleware,
	shallowEqualMiddleware, 
	thunkMiddleware,
} from '../src/middlewares'
import {
    count,
    countWithoutMaps,
    name,
    nameWithMaps,
} from './createStore.test';
let store;




describe('filter', () => {
    const initCount = 1;
    
	test('filter base', () => {
        const countInitState = {
            ...count.state,
            count: initCount,
        };
        const countChangedState = {
            ...count.state,
            count: 12345,
        }
        const filter1 = ({getState, setState, getMaps, dispatch}) => next => filterActionRecord => {
            expect(filterActionRecord.actionArgs).toStrictEqual([store.getModule('count').state]);
            expect(getState()).toBe(countInitState);
            expect(getMaps()).toStrictEqual(store.getModule('count').maps);
            setState({
                moduleName: filterActionRecord.moduleName,
                actionName: filterActionRecord.actionName,
                state: countChangedState,
            });
            expect(getState()).toBe(countChangedState);
            expect(getMaps()).toStrictEqual(store.getModule('count').maps);
            return next(filterActionRecord);
        }
		store = createStore({ name, count }, {}, {
			middlewares: [
				thunkMiddleware,
				promiseMiddleware
            ],
            interceptors: [
                filter1,
            ],
			initStates: {
				count: countInitState
			}
		});
        store.dispatch('count', 'updateName', store.getModule('count').state);
    });

    test('one more filter add action arg', () => {
        
        const filter1 = () => next => filterActionRecord => {
            return next({
                ...filterActionRecord,
                actionArgs: [...filterActionRecord.actionArgs, 'filter1'],
            });
        }
        const filter2 = () => next => filterActionRecord => {
            return next({
                ...filterActionRecord,
                actionArgs: [...filterActionRecord.actionArgs, 'filter2'],
            });
        }
		store = createStore({ 
            count: {
                state: 'abc',
                actions: {
                    updateState: (newState, filter1Str, filter2Str) => {
                        expect(filter1Str).toBe('filter1');
                        expect(filter2Str).toBe('filter2');
                        return newState;
                    }
                }
            },
        }, {}, {
            interceptors: [
                filter1,
                filter2,
            ],
		});
        store.dispatch('count', 'updateState', '123');
        expect(store.getModule('count').state).toBe('123');
    });

    test('filter stop run action', () => {
        const filter = () => next => filterActionRecord => {
            if (filterActionRecord.actionName === 'updateState1') {
                return next({
                    ...filterActionRecord,
                    actionArgs: [...filterActionRecord.actionArgs, 'filter2'],
                });
            }
        }
		store = createStore({ 
            count: {
                state: 'abc',
                actions: {
                    updateState1: (newState) => {
                        return newState;
                    },
                    updateState2: (newState) => {
                        return newState;
                    }
                }
            },
        }, {}, {
            interceptors: [
                filter,
            ],
		});
        expect(store.dispatch('count', 'updateState2', '123')).toBe(undefined);
        expect(store.getModule('count').state).toBe('abc');
        store.dispatch('count', 'updateState1', '123');
        expect(store.getModule('count').state).toBe('123');
    });
})