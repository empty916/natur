import { useContext } from "react";
import { NaturContext } from "./context";
import { Modules, LazyStoreModules, Store } from "./ts-utils";

export const createUseStore = <M extends Modules, LM extends LazyStoreModules>(
	storeInsGetter: () => Store<M, LM>
)  => {
    return function () {
        const store = useContext(NaturContext) as (Store<M, LM> | undefined);
        return store || storeInsGetter();
    }
}

