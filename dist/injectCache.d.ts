import MapCache from "./MapCache";
import { Store, InjectStoreModules, Modules, LazyStoreModules } from "./ts-utils";
declare type Fun<P> = (p: P) => any;
export declare type ModuleDepDec<MN extends string = string, ST extends InjectStoreModules = InjectStoreModules> = [
    MN,
    {
        [k in Extract<keyof ST[MN], 'state' | 'maps'>]?: k extends 'state' ? Array<keyof ST[MN]['state'] | Fun<ST[MN]['state']>> : k extends 'maps' ? Array<keyof ST[MN]['maps']> : never;
    }
];
export declare type DepDecs = {
    [m: string]: ModuleDepDec[1];
};
export declare const isModuleDepDec: (obj: any) => obj is ModuleDepDec<string, InjectStoreModules>;
export declare type Diff = {
    [m: string]: MapCache[];
};
export declare const initDiff: <M extends Modules, LM extends LazyStoreModules>(moduleDepDec: DepDecs, store: Store<M, LM, import("./ts-utils").GenerateStoreType<M, LM>, M & { [k in keyof LM]: import("./ts-utils").PickPromiseType<LM[k]>; }, import("./ts-utils").AllStates<M, LM>>) => {
    diff: Diff;
    destroy: Function;
};
export {};
