import {Middleware, Action, State} from './createStore';
import {isPromise, isObj, isEqualWithDepthLimit} from './utils'

export const thunkMiddleware: Middleware = ({getState, getMaps}) => next => record => {
	if (typeof record.state === 'function') {
		const setState = (s: State) => next({
			...record,
			state: s,
		});
		return next({
			...record,
			state: record.state(getState, setState, getMaps),
		});
	}
	return next(record);
}

export const promiseMiddleware: Middleware = () => next => record => {
	if (isPromise<ReturnType<Action>>(record.state)) {
		return (record.state as Promise<ReturnType<Action>>)
			.then(ns => next({
				...record,
				state: ns,
			}));
	}
	return next(record);
}

export const filterNonObjectMiddleware: Middleware = () => next => record => {
	if (!isObj<State>(record.state)) {
		return record.state;
	}
	return next(record);
}

export const shallowEqualMiddleware: Middleware = ({getState}) => next => record => {
	const oldState = getState();
	if (isEqualWithDepthLimit(record.state, oldState, 1)) {
		return record.state;
	}
	return next(record);
}

export const fillObjectRestDataMiddleware: Middleware = ({getState}) => next => record => {
	const currentState = getState();
	if (isObj(record.state) && isObj(currentState)) {
		record = {
			...record,
			state: {
				...currentState,
				...record.state,
			},
		};
	}
	return next(record);
};

export const filterUndefinedMiddleware: Middleware = () => next => record => {
	if (record.state === undefined) {
		return undefined;
	}
	return next(record);
};
