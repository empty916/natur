import React, {
	useRef,
	useState,
	useMemo,
	useEffect,
	useCallback,
} from 'react';
import hoistStatics from 'hoist-non-react-statics'
import { StoreModule, getStoreInstance } from './createStore';
import isEqualWithDepthLimit from './isEqualWithDepthLimit';

let Loading: React.FC | React.ComponentClass = () => null;
type TReactComponent = React.FC | React.ComponentClass;

const createLoadModulesPromise = (moduleNames: string[]) => moduleNames.map((mn: string) => getStoreInstance().getLazyModule(mn)());

const connect = (
	moduleNames: string[],
	WrappedComponent: React.ComponentClass | React.FC,
	LoadingComponent: TReactComponent = Loading
): React.FC => {
	const store = getStoreInstance();
	if (store === undefined) {
		throw new Error('\n 请先创建store实例！\n Please create a store instance first.');
	}
	const allModuleNames = store.getAllModuleName();
	// 获取store中存在的模块
	const integralModulesName = moduleNames.filter(mn => allModuleNames.includes(mn));

	if (!integralModulesName.length) {
		console.warn(`modules: ${moduleNames.join()} is not exits!`);
		console.warn(`${moduleNames.join()} 模块不存在!`);
		return WrappedComponent as React.FC<any>;
	}

	let Connect: React.FC<any> = ({forwardedRef, ...props}: any) => {
		// const s = performance.now();
		let newProps = {...props};
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
					const loadModulesPromise = createLoadModulesPromise(unLoadedModules);
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
					return integralModulesName.reduce((res, mn: string) => ({
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
		// const stabelInjectModules = useMemo(
		// 	() => {
		// 		const injectModulesChanged = !isEqualWithDepthLimit($injectModules.current, injectModules, 2);
		// 		if (injectModulesChanged) {
		// 			$injectModules.current = injectModules;
		// 		}
		// 		return $injectModules.current
		// 	},
		// 	[injectModules]
		// )
		const render = useMemo(
			() => <WrappedComponent {...newProps} ref={forwardedRef} />,
			// [props, injectModules]
			[stabelProps, injectModules]
		);
		// console.log(performance.now() - s);
		return modulesHasLoaded ? render : <LoadingComponent />;
	};
	Connect = React.memo(Connect);
	Connect.displayName = 'Connect';
	const forwardedConnect = React.forwardRef((props, ref) => <Connect {...props} forwardedRef={ref} />);

	forwardedConnect.displayName = 'forwardedConnect';
	// (forwardedConnect as any).WrappedComponent = WrappedComponent;
	return hoistStatics(forwardedConnect, WrappedComponent) as React.FC;
}

const Inject = (...moduleNames: string[]) => {
	return (WrappedComponent: TReactComponent, LoadingComponent?: TReactComponent) =>
		connect(moduleNames, WrappedComponent, LoadingComponent);
}

Inject.setLoadingComponent = (LoadingComponent: TReactComponent) => Loading = LoadingComponent;

export default Inject;

