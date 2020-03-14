import {
    useState,
    useCallback,
    useEffect,
} from 'react';
import {
    getStoreInstance,
    ModuleName,
    Store,
	InjectStoreModule,
} from './createStore';
import { 
    ModuleDepDec, 
    DepDecs, 
    isModuleDepDec, 
    initDiff
} from './utils';

let _getStoreInstance = getStoreInstance;


export function useInject(...moduleDec: (ModuleName|ModuleDepDec)[]): InjectStoreModule[] {
    const store = _getStoreInstance();
    const [{$depDecs, $moduleNames, diff, destroy}] = useState(() => {
        const depDecs: DepDecs = {};
        const moduleNames = moduleDec.map(m => {
            if (isModuleDepDec(m)) {
                depDecs[m[0]] = m[1];
                return m[0];
            }
            return m;
        });
        if (moduleNames.length === 0) {
            const errMsg = 'useInject: moduleNames param is required!';
            console.error(errMsg);
            throw new Error(errMsg)
        }

        const allModuleNames = store.getAllModuleName();
        // 获取store中不存在的模块
        const invalidModulesNames = moduleNames.filter(mn => !allModuleNames.includes(mn));
        if (!!invalidModulesNames.length) {
            const errMsg = `useInject: ${invalidModulesNames.join()} module is not exits!`;
            console.error(errMsg);
            throw new Error(errMsg);
        }

        const {diff, destroy} = initDiff(depDecs, store);
			// this.storeModuleDiff = diff;
			// this.destoryCache = destroy;
        return {
            $depDecs: depDecs,
            $moduleNames: moduleNames,
            diff, 
            destroy,
        }
    });
    
    const [stateChanged, setStateChanged] = useState({});
    // 获取moduleNames中是否存在未加载的模块
	const unLoadedModules = $moduleNames.filter(mn => !store.hasModule(mn));
	const hasUnloadModules = !!unLoadedModules.length;
    const $setStateChanged = useCallback((moduleName: ModuleName) => {
        if (!$depDecs[moduleName]) {
            setStateChanged({});
        } else if(diff) {
            const hasDepChanged = diff[moduleName].some(diff => {
                diff.shouldCheckCache();
                return diff.hasDepChanged();
            });
            if (hasDepChanged) {
                setStateChanged({});
            }
        } else {
            setStateChanged({});
        }
    }, [setStateChanged]);
    // 初始化store监听
    useEffect(() => {
        const unsubscribes = $moduleNames.map(mn => store.subscribe(mn, () => $setStateChanged(mn)));
        return () => {
            destroy();
            unsubscribes.forEach(fn => fn());
        };
    }, []);

    useEffect(
        () => {
            // 动态加载moduleName中还未加载的模块
            if (hasUnloadModules) {
				Promise.all(
					unLoadedModules.map(mn => store.loadModule(mn))
				)
				.then(() => setStateChanged({}))
				.catch(() => setStateChanged({}));
            }
        },
        [hasUnloadModules]
    );
    // 计算moduleName对应的store、action,放入props中
    if (hasUnloadModules) {
        console.log('store module is loading.');
        return [];
    }
    return $moduleNames.reduce((res, mn: ModuleName) => {
        res.push(store.getModule(mn));
        return res;
    }, [] as InjectStoreModule[]);
}

useInject.setStoreGetter = (storeGetter: () => Store) => {
	_getStoreInstance = storeGetter;
}
