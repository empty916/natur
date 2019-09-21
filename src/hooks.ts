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
} from './createStore';

const createLoadModulesPromise = (moduleNames: ModuleName[], store: Store) => moduleNames.map((mn: ModuleName) => store.getLazyModule(mn)());

export function useInject(...moduleNames: ModuleName[]): StoreModule[] {
    if (moduleNames.length === 0) {
        return [];
    }
    const store = getStoreInstance();
    const allModuleNames = store.getAllModuleName();
    // 获取store中不存在的模块
    const invalidModulesNames = moduleNames.filter(mn => !allModuleNames.includes(mn));
    if (!!invalidModulesNames.length) {
        console.error(`useInject: ${invalidModulesNames.join()} module is not exits!`);
        return [];
    }
    const [stateChanged, setStateChanged] = useState({});
    // 获取moduleNames中是否存在未加载的模块
    const unLoadedModules = moduleNames.filter(mn => !store.hasModule(mn));
    const [modulesHasLoaded, setModulesHasLoaded] = useState(!unLoadedModules.length);
    const $setStateChanged = useCallback(() => setStateChanged({}), [setStateChanged]);

    // 初始化store监听
    useEffect(() => {
        const unsubscribes = moduleNames.map(mn => store.subscribe(mn, $setStateChanged));
        return () => unsubscribes.forEach(fn => fn());
    }, []);

    useEffect(
        () => {
            // 动态加载moduleName中还未加载的模块
            if (!modulesHasLoaded) {
                const loadModulesPromise = createLoadModulesPromise(unLoadedModules, store);
                Promise.all(loadModulesPromise)
                    .then((modules: StoreModule[]) => {
                        modules.forEach((storeModule, index) =>
                            store.addModule(unLoadedModules[index], storeModule)
                        );
                        setModulesHasLoaded(true);
                    })
                    .catch((e: Error) => {
                        setModulesHasLoaded(false);
                    });
            }
        },
        []
    );
    // 计算moduleName对应的store、action,放入props中
    if (!modulesHasLoaded) {
        console.log('store module is loading.');
        return [];
    }
    return moduleNames.reduce((res, mn: ModuleName) => {
        res.push(store.getModule(mn));
        return res;
    }, [] as StoreModule[]);
}
