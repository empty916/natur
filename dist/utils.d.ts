/**
 * @author empty916
 * @email [empty916@qq.com]
 * @create date 2019-08-09 17:13:15
 * @modify date 2019-08-09 17:13:15
 * @desc [description]
 */
import { ModuleName } from './createStore';
export declare const ObjHasSameKeys: (obj1: Object, obj2: Object) => boolean;
declare type Obj = {
    [p: string]: any;
};
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
declare type anyFn = (...arg: any[]) => any;
export declare function compose(...funcs: anyFn[]): anyFn;
export declare function isEqualWithDepthLimit(objA: any, objB: any, depthLimit?: number, depth?: number): boolean;
export declare class Depend {
    id: string;
    moduleName: ModuleName;
    stateName: string;
    watchers: Watcher[];
    watchersMap: {
        [p: string]: true;
    };
    static targetWatcher: Watcher | undefined;
    constructor(moduleName: ModuleName, stateName: string);
    addWatcher(watcher: Watcher): void;
    removeWatcher(watcher: Watcher): void;
    clearWatcher(): void;
    notify(): void;
    destroy(): void;
}
export declare class Watcher {
    depends: Depend[];
    useCache: boolean;
    cache: any;
    moduleName: ModuleName;
    mapName: string;
    dependsMap: {
        [p: string]: true;
    };
    id: string;
    mapRunner: (...arg: any[]) => any;
    constructor(moduleName: ModuleName, mapName: string, runner: (...arg: any[]) => any);
    update(): void;
    run(): void;
    addDepend(depend: Depend): void;
    removeDepend(depend: Depend): void;
    clearDepends(): void;
    destroy(): void;
}
export {};
