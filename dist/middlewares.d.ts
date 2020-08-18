import { Middleware } from './createStore';
export declare type ThunkParams<S = any, M = any> = {
    getState: () => S;
    setState: (s: Partial<S>) => S;
    getMaps: () => M;
    dispatch: (moduleNameAndActionName: string, ...params: any[]) => any;
};
export declare const thunkMiddleware: Middleware<any>;
export declare const promiseMiddleware: Middleware<any>;
export declare const filterNonObjectMiddleware: Middleware<any>;
export declare const shallowEqualMiddleware: Middleware<any>;
export declare const fillObjectRestDataMiddleware: Middleware<any>;
export declare const filterUndefinedMiddleware: Middleware<any>;
