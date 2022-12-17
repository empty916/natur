import { useRef, useState, useSyncExternalStore } from "react";
import MapCache from "./MapCache";
import { Modules, LazyStoreModules, Store, Fun, ModuleDepDec, StoreModule, InjectStoreModule } from "./ts-utils";
import { arrayIsEqual } from './utils';

export function getDepValue<
    D extends {
        state?: Array<string | Fun<any>>;
        maps?: string[];
    },
>(sm: InjectStoreModule, dep: D) {
    let stateDepGetter: Array<Fun<any>> = [];
    let mapsDepGetter: Array<Fun<any>> = [];
    let res: any[] = [];
    if (dep.state) {
        stateDepGetter = dep.state.map(keyPath => {
            if (typeof keyPath !== 'function') {
                return (s: any) => {
                    return MapCache.getValueFromState(s, keyPath);
                };
            }
            return keyPath;
        });
        res.push(...stateDepGetter.map(i => i(sm.state)));
    }
    if (dep.maps) {
        mapsDepGetter = dep.maps.map(keyPath => {
            if (typeof keyPath !== 'function') {
                return (s: any) => {
                    return MapCache.getValueFromState(s, keyPath);
                };
            }
            return keyPath;
        });
        res.push(...mapsDepGetter.map(i => i(sm.maps)));
    }
    return res;
}

export const createUseInject = <M extends Modules, LM extends LazyStoreModules>(
	storeInsGetter: () => Store<M, LM>
) => {
	type ST = Store<M, LM>["type"];
	const storeIns = storeInsGetter();
	/**
	 * natur hooks函数
	 */
	return function useInject<
		K extends keyof ST,
		D extends ModuleDepDec<ST, K>[1],
        R = K extends keyof M ? [ST[K], false, undefined] : [ST[K] | undefined, boolean, undefined | Error]
	>(moduleName: K, dep?: D): R {
		const stateRef = useRef<ST[K]>();
        const [loading, setLoading] = useState<Partial<Record<K, boolean>>>({});
        const [error, setError] = useState<Partial<Record<K, Error>>>({});

		const res = useSyncExternalStore(storeIns.subscribeAll, () => {
            if (storeIns.hasModule(moduleName)) {
                if (loading[moduleName]) {
                    setLoading(nl => ({
                        ...nl,
                        [moduleName]: false,
                    }));
                }
                const m = storeIns.getModule(moduleName);
                if (m.state !== stateRef.current?.state) {
                    if (stateRef.current && dep &&
                        arrayIsEqual(
                            getDepValue(stateRef.current, dep),
                            getDepValue(m, dep),
                        )
                    ) {
                        return stateRef.current;
                    }
                    stateRef.current = m;
                }
                return stateRef.current;
            } else {
                if (!loading[moduleName]) {
                    setLoading(nl => ({
                        ...nl,
                        [moduleName]: true,
                    }));
                }
                storeIns.loadModule(moduleName as keyof LM)
                    .then(() => {
                        setLoading(nl => ({
                            ...nl,
                            [moduleName]: false,
                        }));
                    })
                    .catch(err => setError(e => ({
                        ...e,
                        [moduleName]: err,
                    })));
                return undefined;
            }
		});
        return [res, !!loading[moduleName], error[moduleName]] as R;
	};
};
