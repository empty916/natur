import { Middleware, State } from './createStore';
export declare type ThunkMiddlewareParams<M = any> = {
    getState: () => State;
    setState: (s: State) => State;
    getMaps: () => M;
    dispatch: (moduleNameAndActionName: string, params: any) => any;
};
export declare const thunkMiddleware: Middleware;
export declare const promiseMiddleware: Middleware;
export declare const filterNonObjectMiddleware: Middleware;
export declare const shallowEqualMiddleware: Middleware;
export declare const fillObjectRestDataMiddleware: Middleware;
export declare const filterUndefinedMiddleware: Middleware;
