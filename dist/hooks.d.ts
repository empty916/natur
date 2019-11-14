import { ModuleName, Store, InjectStoreModule } from './createStore';
export declare function useInject(...moduleNames: ModuleName[]): InjectStoreModule[];
export declare namespace useInject {
    var setStoreGetter: (storeGetter: () => Store) => void;
}
