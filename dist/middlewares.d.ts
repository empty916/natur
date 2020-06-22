import { Middleware } from './createStore';
export declare type ThunkParams<S = any, M = any> = {
    getState: () => S;
    setState: (s: Partial<S>) => S;
    getMaps: () => M;
    dispatch: (moduleNameAndActionName: string, params: any) => any;
};
export declare const thunkMiddleware: Middleware;
export declare const promiseMiddleware: Middleware;
export declare const filterNonObjectMiddleware: Middleware;
export declare const shallowEqualMiddleware: Middleware;
export declare const fillObjectRestDataMiddleware: Middleware;
export declare const filterUndefinedMiddleware: Middleware;
