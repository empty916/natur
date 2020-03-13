import { ModuleName, Store, InjectStoreModule } from './createStore';
import { ModuleDepDec } from './utils';
export declare function useInject(...moduleDec: (ModuleName | ModuleDepDec)[]): InjectStoreModule[];
export declare namespace useInject {
    var setStoreGetter: (storeGetter: () => Store) => void;
}
