import { createStore } from '../src';
import {
	promiseMiddleware, 
	thunkMiddleware,
} from '../src/middlewares'
import {
    count,
    name,
} from './createStore.test';
let store;




describe('interceptor', () => {
    const initCount = 1;
    
	test('interceptor base', () => {
        const countInitState = {
            ...count.state,
            count: initCount,
        };
        const countChangedState = {
            ...count.state,
            count: 12345,
        }
        const interceptor1 = ({getState, setState, getMaps, dispatch}) => next => interceptorActionRecord => {
            expect(interceptorActionRecord.actionArgs).toStrictEqual([store.getModule('count').state]);
            expect(getState()).toBe(countInitState);
            expect(getMaps()).toStrictEqual(store.getModule('count').maps);
            setState({
                moduleName: interceptorActionRecord.moduleName,
                actionName: interceptorActionRecord.actionName,
                state: countChangedState,
            });
            expect(getState()).toBe(countChangedState);
            expect(getMaps()).toStrictEqual(store.getModule('count').maps);
            return next(interceptorActionRecord);
        }
		store = createStore({ name, count }, {}, {
			middlewares: [
				thunkMiddleware,
				promiseMiddleware
            ],
            interceptors: [
                interceptor1,
            ],
			initStates: {
				count: countInitState
			}
		});
        store.dispatch('count', 'updateName', store.getModule('count').state);
    });

    test('one more interceptor add action arg', () => {
        
        const interceptor1 = () => next => interceptorActionRecord => {
            return next({
                ...interceptorActionRecord,
                actionArgs: [...interceptorActionRecord.actionArgs, 'interceptor1'],
            });
        }
        const interceptor2 = () => next => interceptorActionRecord => {
            return next({
                ...interceptorActionRecord,
                actionArgs: [...interceptorActionRecord.actionArgs, 'interceptor2'],
            });
        }
		store = createStore({ 
            count: {
                state: 'abc',
                actions: {
                    updateState: (newState, interceptor1Str, interceptor2Str) => {
                        expect(interceptor1Str).toBe('interceptor1');
                        expect(interceptor2Str).toBe('interceptor2');
                        return newState;
                    }
                }
            },
        }, {}, {
            interceptors: [
                interceptor1,
                interceptor2,
            ],
		});
        store.dispatch('count', 'updateState', '123');
        expect(store.getModule('count').state).toBe('123');
    });

    test('interceptor stop run action', () => {
        const interceptor = () => next => interceptorActionRecord => {
            if (interceptorActionRecord.actionName === 'updateState1') {
                return next({
                    ...interceptorActionRecord,
                    actionArgs: [...interceptorActionRecord.actionArgs, 'interceptor2'],
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
                interceptor,
            ],
		});
        expect(store.dispatch('count', 'updateState2', '123')).toBe(undefined);
        expect(store.getModule('count').state).toBe('abc');
        expect(store.dispatch('count', 'updateState1', '123')).toBe('123');
        expect(store.getModule('count').state).toBe('123');

        expect(store.getModule('count').actions.updateState1('222')).toBe('222');
        
    });


    test('interceptor get origin action function', () => {
        const action = (newState) => {
            return newState;
        };
        const interceptor = () => next => interceptorActionRecord => {
            expect(interceptorActionRecord.actionFunc).toBe(action);
            return next(interceptorActionRecord);
        }
		store = createStore({ 
            count: {
                state: 'abc',
                actions: {
                    updateState: action,
                }
            },
        }, {}, {
            interceptors: [
                interceptor,
            ],
		});
        expect(store.getModule('count').actions.updateState('222')).toBe('222');
        
    });
})