import {
    useState,
    useCallback,
    useEffect,
} from 'react';
import {
    getStoreInstance,
    ModuleName,
    Store,
	StoreModule,
	InjectStoreModule,
} from './createStore';
import { arrayIsEqual } from './utils';

const createLoadModulesPromise = (moduleNames: ModuleName[], store: Store) => moduleNames.map((mn: ModuleName) => store.getLazyModule(mn)());
let _getStoreInstance = getStoreInstance;

export function useInject(...moduleNames: ModuleName[]): InjectStoreModule[] {
	if (moduleNames.length === 0) {
		const errMsg = 'useInject: moduleNames param is required!';
		console.error(errMsg);
		throw new Error(errMsg)
	}
	const [$moduleNames, setModuleNames] = useState(moduleNames);
	if (!arrayIsEqual(moduleNames, $moduleNames)) {
		setModuleNames(moduleNames);
	}
    const store = _getStoreInstance();
    const allModuleNames = store.getAllModuleName();
    // 获取store中不存在的模块
    const invalidModulesNames = $moduleNames.filter(mn => !allModuleNames.includes(mn));
    if (!!invalidModulesNames.length) {
		const errMsg = `useInject: ${invalidModulesNames.join()} module is not exits!`;
		console.error(errMsg);
		throw new Error(errMsg);
    }
    const [stateChanged, setStateChanged] = useState({});
    // 获取moduleNames中是否存在未加载的模块
	const unLoadedModules = $moduleNames.filter(mn => !store.hasModule(mn));
	const hasUnloadModules = !!unLoadedModules.length;
    const $setStateChanged = useCallback(() => setStateChanged({}), [setStateChanged]);
    // 初始化store监听
    useEffect(() => {
        const unsubscribes = $moduleNames.map(mn => store.subscribe(mn, $setStateChanged));
        return () => unsubscribes.forEach(fn => fn());
    }, [$moduleNames]);

    useEffect(
        () => {
            // 动态加载moduleName中还未加载的模块
            if (hasUnloadModules) {
                const loadModulesPromise = createLoadModulesPromise(unLoadedModules, store);
                Promise.all(loadModulesPromise)
                    .then((modules: StoreModule[]) => {
                        modules.forEach((storeModule, index) =>
                            store.setModule(unLoadedModules[index], storeModule)
                        );
                        setStateChanged({});
                    })
                    .catch((e: Error) => {
                        setStateChanged({});
                    });
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
