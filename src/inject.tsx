/**
 * @author empty916
 * @email [empty916@qq.com]
 * @create date 2019-08-09 17:13:03
 * @modify date 2019-08-09 17:13:03
 * @desc [description]
 */
import React, {
	useRef,
	useState,
	useMemo,
	useEffect,
	useCallback,
	useContext
} from 'react';
import hoistStatics from 'hoist-non-react-statics'
import { StoreModule, ModuleName, Store } from './createStore';
import isEqualWithDepthLimit from './isEqualWithDepthLimit';
import { StoreContext } from './Provider'

type TReactComponent<P, S> = React.FC<P> | React.ComponentClass<P, S>;
type ModuleNames = ModuleName[];


let Loading: TReactComponent<{}, {}> = () => null;

const createLoadModulesPromise = (moduleNames: ModuleNames, store: Store) => moduleNames.map((mn: ModuleName) => store.getLazyModule(mn)());


const connect = <P, S, SP>(
	moduleNames: ModuleNames,
	WrappedComponent: TReactComponent<P, S>,
	LoadingComponent: TReactComponent<any, any> = Loading
): React.FC<Omit<P, keyof SP>> => {
	type NoRefP = Omit<P, 'ref'>;
	const Connect =
		// <FPNoRef extends NoRefP & {forwardedRef: React.Ref<unknown>}>
		({forwardedRef, ...props}: NoRefP & {forwardedRef: React.Ref<any>}) => {
		// (props: P) => {
		let newProps = {
			...props,
			ref: forwardedRef,
		} as any as P;


		const storeContext = useContext(StoreContext);
		const {store, integralModulesName} = useMemo(() => {
			const store = storeContext;
			if (store === undefined) {
				throw new Error('\n 请先创建store实例！\n Please create a store instance first.');
			}
			const allModuleNames = store.getAllModuleName();
			// 获取store中存在的模块
			const integralModulesName = moduleNames.filter(mn => allModuleNames.includes(mn));
			return {store, integralModulesName};
		}, [moduleNames, storeContext]);

		if (!integralModulesName.length) {
			console.warn(`modules: ${moduleNames.join()} is not exits!`);
			console.warn(`${moduleNames.join()} 模块不存在!`);
			return <WrappedComponent {...newProps} />;
		}
		const [stateChanged, setStateChanged] = useState({});
		// 获取moduleNames中是否存在未加载的模块
		const unLoadedModules = integralModulesName.filter(mn => !store.hasModule(mn));
		const [modulesHasLoaded, setModulesHasLoaded] = useState(!unLoadedModules.length);
		const $setStateChanged = useCallback(() => setStateChanged({}), [setStateChanged]);
		// console.log(a);
		useEffect(() => {
			const unsubscribes = integralModulesName.map(mn => store.subscribe(mn, $setStateChanged));
			return () => unsubscribes.forEach(fn => fn());
		}, []);

		useEffect(
			() => {
				// 动态加载moduleName中还未加载的模块
				if (!modulesHasLoaded) {
					const loadModulesPromise = createLoadModulesPromise(unLoadedModules, storeContext);
					Promise.all(loadModulesPromise)
						.then((modules: StoreModule[]) => {
							modules.forEach(({state, actions, maps}, index) =>
								store.addModule(unLoadedModules[index], {state: {...state}, actions, maps})
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
		const injectModules = useMemo(
			() => {
				if (modulesHasLoaded) {
					return integralModulesName.reduce((res, mn: ModuleName) => ({
						...res,
						[mn]: store.getModule(mn),
					}), {});
				}
				return {};
			},
			[modulesHasLoaded, stateChanged]
		);
		newProps = {
			...newProps,
			...injectModules,
		};
		const $props = useRef(props);
		// const $injectModules = useRef(injectModules);
		const stabelProps = useMemo(
			() => {
				/**
				 * why is depth 3?
				 * because the router props will be:
				 * props: {
				 * 		// depth: 1
				 * 		match: {
				 * 			// depth: 2
				 * 			params: { // and this one will be change every times;
				 * 				// depth: 3,
				 * 			},
				 * 		}
				 * }
				 */
				const propsChanged = !isEqualWithDepthLimit($props.current, props, 3);
				if (propsChanged) {
					$props.current = props;
				}
				return $props.current;
			},
			[props]
		)
		//  ref={forwardedRef}
		const render = useMemo(
			() => <WrappedComponent {...newProps} />,
			// [props, injectModules]
			[stabelProps, injectModules]
		);
		// console.log(performance.now() - s);
		return modulesHasLoaded ? render : <LoadingComponent />;
	};
	// const ConnectWithStatics = hoistStatics(Connect as React.FC<P>, WrappedComponent, undefined);
	const MemoConnect = React.memo(Connect);
	MemoConnect.displayName = 'Connect';
	// Pick<P, Exclude<keyof P, 'ref'>>
	const forwardedConnect = React.forwardRef<any, NoRefP>(
		(props: NoRefP, ref) => <Connect {...props} forwardedRef={ref} />
	);

	// forwardedConnect.displayName = 'forwardedConnect';
	// (forwardedConnect as any).WrappedComponent = WrappedComponent;
	return hoistStatics(forwardedConnect as any, WrappedComponent) as React.FC<Omit<P, keyof SP>>;
	// return MemoConnect as React.FC<P>;
}

const Inject = <StoreProp,>(...moduleNames: ModuleName[]) => {
	return <P, C, SP extends StoreProp>(WrappedComponent: TReactComponent<P, C>, LoadingComponent?: TReactComponent<{}, {}>) =>
		connect<P, C, SP>(moduleNames, WrappedComponent, LoadingComponent);
}

Inject.setLoadingComponent = (LoadingComponent: TReactComponent<{}, {}>) => Loading = LoadingComponent;

export default Inject;

