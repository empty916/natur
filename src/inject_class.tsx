/**
 * @author empty916
 * @email [empty916@qq.com]
 * @create date 2019-08-09 17:13:03
 * @modify date 2019-08-09 17:13:03
 * @desc [description]
 */
import React from 'react';
import hoistStatics from 'hoist-non-react-statics'
import { StoreModule, ModuleName, Store, getStoreInstance, Modules } from './createStore';
import isEqualWithDepthLimit from './isEqualWithDepthLimit';

type TReactComponent<P, S> = React.FC<P> | React.ComponentClass<P, S>;
type ModuleNames = ModuleName[];

let Loading: TReactComponent<{}, {}> = () => null;

const createLoadModulesPromise = (moduleNames: ModuleNames, store: Store) => moduleNames.map((mn: ModuleName) => store.getLazyModule(mn)());

type Tstate = {
	storeStateChange: {},
	modulesHasLoaded: boolean,
}
type connectReturn<P, S, SP> = React.ComponentClass<Omit<P, keyof SP> & { forwardedRef?: React.Ref<any> }, S>
const connect = <P, S, SP>(
	moduleNames: ModuleNames,
	WrappedComponent: TReactComponent<P, S>,
	LoadingComponent: TReactComponent<any, any> = Loading
): connectReturn<P, S, SP> => {
	// return WrappedComponent as any;
	type ConnectProps = P & { forwardedRef: React.Ref<any> };

	class Connect extends React.Component<ConnectProps, any> {
		private store: Store;
		private integralModulesName: ModuleNames;
		private unLoadedModules: ModuleNames;
		private injectModules: Modules = {};
		private unsubStore: () => void = () => { };
		state: Tstate = {
			storeStateChange: {},
			modulesHasLoaded: false,
		}
		constructor(props: ConnectProps, state: S) {
			super(props, state);
			// 初始化store, integralModulesName(合法模块名)
			const { store, integralModulesName } = this.init();
			this.store = store;
			this.integralModulesName = integralModulesName;
			// // 初始化模块是否全部加载完成标记
			const unLoadedModules = integralModulesName.filter(mn => !store.hasModule(mn));
			this.unLoadedModules = unLoadedModules;
			this.state.modulesHasLoaded = !unLoadedModules.length;
			this.setStoreStateChanged = this.setStoreStateChanged.bind(this);
		}
		setStoreStateChanged() {
			this.setState({
				storeStateChange: {},
			});
		}
		componentDidMount() {
			const {
				store,
				integralModulesName,
				unLoadedModules,
				setStoreStateChanged
			} = this;
			const { modulesHasLoaded } = this.state;
			// 初始化store监听
			const unsubscribes = integralModulesName.map(mn => store.subscribe(mn, setStoreStateChanged));
			this.unsubStore = () => unsubscribes.forEach(fn => fn());

			if (!modulesHasLoaded) {
				const loadModulesPromise = createLoadModulesPromise(unLoadedModules, store);
				Promise.all(loadModulesPromise)
					.then((modules: StoreModule[]) => {
						modules.forEach(({ state, actions, maps }, index) =>
							store.addModule(unLoadedModules[index], { state: { ...state }, actions, maps })
						);
						this.setState({
							modulesHasLoaded: true,
						})
					})
					.catch((e: Error) => {
						this.setState({
							modulesHasLoaded: false,
						})
					});
			}
		}
		componentWillUnmount() {
			this.unsubStore();
			this.unsubStore = () => { };
		}
		shouldComponentUpdate(nextProps: ConnectProps, nextState: Tstate) {
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
			const propsChanged = !isEqualWithDepthLimit(this.props, nextProps, 3);
			const stateChanged = nextState.modulesHasLoaded !== this.state.modulesHasLoaded || nextState.storeStateChange !== this.state.storeStateChange;
			return propsChanged || stateChanged;
		}
		init() {
			const storeContext = getStoreInstance();
			const store = storeContext;
			if (store === undefined) {
				throw new Error('\n 请先创建store实例！\n Please create a store instance first.');
			}
			const allModuleNames = store.getAllModuleName();
			// 获取store中存在的模块
			const integralModulesName = moduleNames.filter(mn => allModuleNames.includes(mn));
			return { store, integralModulesName };
		}
		render() {
			const { forwardedRef, ...props } = this.props;
			let newProps = {
				...props,
				ref: forwardedRef,
			} as any as P;

			if (!this.integralModulesName.length) {
				console.warn(`modules: ${moduleNames.join()} is not exits!`);
				console.warn(`${moduleNames.join()} 模块不存在!`);
				return <WrappedComponent {...newProps} />;
			}
			if (this.state.modulesHasLoaded) {
				const { store, integralModulesName } = this;
				this.injectModules = integralModulesName.reduce((res, mn: ModuleName) => ({
					...res,
					[mn]: store.getModule(mn),
				}), {});
			}
			newProps = {
				...newProps,
				...this.injectModules,
			};
			const render = <WrappedComponent {...newProps} />;
			return this.state.modulesHasLoaded ? render : <LoadingComponent />;
		}
	}
	let FinalConnect = Connect;
	if (!!React.forwardRef) {
		FinalConnect = React.forwardRef<any, P>(
			function ForwardConnect(props: P, ref) {return <Connect {...props} forwardedRef={ref} />}
		) as any;
	}
	return hoistStatics(FinalConnect as any, WrappedComponent) as React.ComponentClass<Omit<P, keyof SP>, S>;
}

const Inject = <StoreProp,>(...moduleNames: ModuleName[]) => {
	return <P, C, SP extends StoreProp>(WrappedComponent: TReactComponent<P, C>, LoadingComponent?: TReactComponent<{}, {}>) =>
		connect<P, C, SP>(moduleNames, WrappedComponent, LoadingComponent);
}

Inject.setLoadingComponent = (LoadingComponent: TReactComponent<{}, {}>) => Loading = LoadingComponent;

export default Inject;

