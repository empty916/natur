/**
 * @author empty916
 * @email [empty916@qq.com]
 * @create date 2019-08-09 17:13:15
 * @modify date 2019-08-09 17:13:15
 * @desc [description]
 */
import { StoreModule, State } from './createStore';
export declare const ObjHasSameKeys: (obj1: Object, obj2: Object) => boolean;
declare type Obj = {
    [p: string]: any;
};
declare type anyFn = (...arg: any[]) => any;
declare type fnObj = {
    [p: string]: anyFn;
};
export declare const isObj: <T = Obj>(obj: any) => obj is T;
export declare const isFn: (arg: any) => arg is anyFn;
export declare const isFnObj: (obj: any) => obj is fnObj;
export declare const isPromise: <T>(obj: any) => obj is Promise<T>;
export declare const isStoreModule: (obj: any) => obj is StoreModule;
export declare const ObjChangedKeys: (source: Obj, afterChange: Obj) => {
    updatedKeys: string[];
    keyHasChanged: boolean;
};
/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */
export declare function compose(...funcs: anyFn[]): anyFn;
export declare function isEqualWithDepthLimit(objA: any, objB: any, depthLimit?: number, depth?: number): boolean;
/**
 *
 * @param obj State
 * @param keyPath 'a.b[0].c'
 */
export declare const getValueFromObjByKeyPath: (obj: State, keyPath: string) => any;
export declare const arrayIsEqual: (arr1: any[], arr2: any[]) => boolean;
export {};
