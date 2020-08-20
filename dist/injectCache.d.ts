import MapCache from "./MapCache";
import { Store, InjectStoreModules, Modules } from "./createStore";
declare type Fun<P> = (p: P) => any;
export declare type ModuleDepDec<MN extends string = string, ST extends InjectStoreModules = InjectStoreModules> = [MN, {
    [k in Extract<keyof ST[MN], 'state' | 'maps'>]?: k extends 'state' ? Array<keyof ST[MN]['state'] | Fun<ST[MN]['state']>> : k extends 'maps' ? Array<keyof ST[MN]['maps']> : never;
}];
export declare type DepDecs = {
    [m: string]: ModuleDepDec[1];
};
export declare const isModuleDepDec: (obj: any) => obj is [string, {
    state?: (string | number | symbol | Fun<any>)[] | undefined;
    maps?: (string | number | symbol)[] | undefined;
}];
export declare type Diff = {
    [m: string]: MapCache[];
};
export declare const initDiff: <ST extends InjectStoreModules, AMOT extends Modules>(moduleDepDec: DepDecs, store: Store<ST, AMOT, Partial<{ [k in keyof ST]: Partial<ST[k]["state"]>; }>>) => {
    diff: Diff;
    destroy: Function;
};
export {};
