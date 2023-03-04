import { MiddlewareBase } from './ts/base';
import {Middleware, Action, State, Maps, GenMapsType} from './ts';
import {isPromise, isObj, isEqualWithDepthLimit} from './utils'

/**
 * S state的类型
 * M maps的类型
 */
export type ThunkParams<S = any, M extends Maps = any> = {
	getState: () => S;
	setState: (s: Partial<S>) => S;
	getMaps: () => GenMapsType<M, S>;
	/**
	 * please use localDispatch instead
	 * @deprecated
	 * @param moduleNameAndActionName
	 * @param params
	 */
	dispatch: (moduleNameAndActionName: string, ...params: any) => any;
	localDispatch: (actionName: string, ...params: any) => any;
}

export const thunkMiddleware: MiddlewareBase = ({getState, getMaps, dispatch}) => next => record => {
	if (typeof record.state === 'function') {
		const setState = (s: State) => next({
			...record,
			state: s,
		});
		const _dispatch = (action: string, ...arg: any[]) => {
			if (/^\w+\/\w+$/.test(action)) {
				const moduleName = action.split('/')[0];
				const actionName = action.split('/').slice(1).join('/');
				return dispatch(moduleName, actionName, ...arg);
			}
			return dispatch(record.moduleName, action, ...arg);
		}
		const localDispatch = (action: string, ...arg: any[]) => {
			return dispatch(record.moduleName, action, ...arg);
		}
		return next({
			...record,
			state: record.state({getState, setState, getMaps, dispatch: _dispatch, localDispatch}),
		});
	}
	return next(record);
}

export const promiseMiddleware: MiddlewareBase = () => next => record => {
	if (isPromise<ReturnType<Action>>(record.state)) {
		return (record.state as Promise<ReturnType<Action>>)
			.then(ns => next({
				...record,
				state: ns,
			}));
	}
	return next(record);
}

export const filterNonObjectMiddleware: MiddlewareBase = () => next => record => {
	if (!isObj<State>(record.state)) {
		return record.state;
	}
	return next(record);
}

export const shallowEqualMiddleware: MiddlewareBase = ({getState}) => next => record => {
	const oldState = getState();
	if (isEqualWithDepthLimit(record.state, oldState, 1)) {
		return record.state;
	}
	return next(record);
}

export const fillObjectRestDataMiddleware: MiddlewareBase = ({getState}) => next => record => {
	const currentState = getState();
	if (isObj(record.state) && isObj(currentState)) {
		record = Object.assign({}, record, {
			state: Object.assign({}, currentState, record.state)
		});
	}
	return next(record);
};

export const filterUndefinedMiddleware: MiddlewareBase = () => next => record => {
	if (record.state === undefined) {
		return undefined;
	}
	return next(record);
};
