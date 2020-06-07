/**
 * @author empty916
 * @email [empty916@qq.com]
 * @create date 2019-08-09 17:13:03
 * @modify date 2019-08-09 17:13:03
 * @desc [description]
 */
import React from 'react';
import hoistStatics from 'hoist-non-react-statics'
import {
	ModuleName,
	Store,
	getStoreInstance,
	Modules
} from './createStore';
import {isEqualWithDepthLimit, ModuleDepDec, isModuleDepDec, DepDecs, Diff, initDiff} from './utils';
import { InjectStoreModule } from './createStore';

type TReactComponent<P> = React.FC<P> | React.ComponentClass<P>;
type ModuleNames = ModuleName[];

let Loading: TReactComponent<{}> = () => null;
let _getStoreInstance = getStoreInstance;

type Tstate = {
	storeStateChange: {},
	modulesHasLoaded: boolean,
}

type connectReturn<P, SP> = React.ComponentClass<Omit<P, keyof SP> & { forwardedRef?: React.Ref<any> }>

const connect = <P, SP>(
	moduleNames: Array<ModuleName>,
	depDecs: DepDecs,
	WrappedComponent: TReactComponent<P>,
	LoadingComponent?: TReactComponent<any>
): connectReturn<P, SP> => {
	type ConnectProps = P & { forwardedRef: React.Ref<any> };

	class Connect extends React.Component<ConnectProps> {
		private store: Store;
		private integralModulesName: ModuleNames;
		private unLoadedModules: ModuleNames;
		private injectModules: Modules = {};
		private unsubStore: () => void = () => { };
		private LoadingComponent: TReactComponent<{}>;
		private storeModuleDiff: Diff | undefined;
		private destoryCache: Function = () => {};
		state: Tstate = {
			storeStateChange: {},
			modulesHasLoaded: false,
		}
		constructor(props: ConnectProps) {
			super(props);
			// 初始化store, integralModulesName(合法模块名)
			const { store, integralModulesName } = this.init();
			this.store = store;
			this.integralModulesName = integralModulesName;
			const unLoadedModules = integralModulesName.filter(mn => !store.hasModule(mn));
			this.unLoadedModules = unLoadedModules;
			// 初始化模块是否全部加载完成标记
			this.state.modulesHasLoaded = !unLoadedModules.length;
			this.setStoreStateChanged = this.setStoreStateChanged.bind(this);
			this.LoadingComponent = LoadingComponent || Loading;
			this.loadLazyModule();
		}
		setStoreStateChanged(moduleName: ModuleName) {
			if (!depDecs[moduleName]) {
				this.setState({
					storeStateChange: {},
				});
			} else if(this.storeModuleDiff) {
				const hasDepChanged = this.storeModuleDiff[moduleName].some(diff => {
					diff.shouldCheckCache();
					return diff.hasDepChanged();
				});
				if (hasDepChanged) {
					this.setState({
						storeStateChange: {},
					});
				}
			} else {
				this.setState({
					storeStateChange: {},
				});
			}
		}
		initDiff(moduleDepDec: DepDecs = depDecs, store: Store = this.store):void {
			const {diff, destroy} = initDiff(moduleDepDec, store);
			this.storeModuleDiff = diff;
			this.destoryCache = destroy;
		}
		initStoreListner() {
			const {
				store,
				integralModulesName,
				setStoreStateChanged
			} = this;
			const unsubscribes = integralModulesName.map(mn => store.subscribe(mn, () => setStoreStateChanged(mn)));
			this.unsubStore = () => unsubscribes.forEach(fn => fn());
		}
		loadLazyModule() {
			const {
				store,
				unLoadedModules,
			} = this;
			const { modulesHasLoaded } = this.state;
			
			if (!modulesHasLoaded) {
				Promise.all(
					unLoadedModules.map(mn => store.loadModule(mn))
				)
				.then(() => {
					this.initStoreListner();
					this.initDiff();
					this.setState({
						modulesHasLoaded: true,
					})
				})
				.catch(() => {
					this.setState({
						modulesHasLoaded: false,
					})
				});
			} else {
				// 初始化store监听
				this.initStoreListner();
				this.initDiff();
			}
		}
		componentWillUnmount() {
			this.unsubStore();
			this.destoryCache();
			this.unsubStore = () => {};
			this.destoryCache = () => {};
		}
		shouldComponentUpdate(nextProps: ConnectProps, nextState: Tstate) {
			const propsChanged = !isEqualWithDepthLimit(this.props, nextProps, 1);
			const stateChanged = nextState.modulesHasLoaded !== this.state.modulesHasLoaded || nextState.storeStateChange !== this.state.storeStateChange;
			return propsChanged || stateChanged;
		}
		init() {
			const storeContext = _getStoreInstance();
			const store = storeContext;
			if (store === undefined) {
				const errMsg = '\n 请先创建store实例！\n Please create a store instance first.';
				console.error(errMsg);
				throw new Error(errMsg);
			}
			const allModuleNames = store.getAllModuleName();
			// 获取store中存在的模块
			const integralModulesName = moduleNames.filter(mn => {
				const isInclude = allModuleNames.includes(mn);
				if (!isInclude) {
					console.warn(`inject: ${mn} module is not exits!`);
				}
				return isInclude;
			});
			return { store, integralModulesName };
		}
		render() {
			const { forwardedRef, ...props } = this.props;
			let newProps = Object.assign({}, props, {
				ref: forwardedRef,
			}) as any as P;

			if (!this.integralModulesName.length) {
				console.warn(`modules: ${moduleNames.join()} is not exits!`);
				console.warn(`${moduleNames.join()} 模块不存在!`);
				return <WrappedComponent {...newProps} />;
			}
			if (this.state.modulesHasLoaded) {
				const { store, integralModulesName } = this;
				this.injectModules = integralModulesName.reduce((res, mn: ModuleName) => {
					res[mn] = store.getModule(mn);
					return res;
				}, {} as Modules);
			}
			Object.assign(newProps, this.injectModules)

			const render = <WrappedComponent {...newProps} />;
			return this.state.modulesHasLoaded ? render : <this.LoadingComponent />;
		}
	}
	let FinalConnect:any = Connect;
	if (!!React.forwardRef) {
		FinalConnect = React.forwardRef<any, any>(
			function ForwardConnect(props: P, ref) {return <Connect {...props} forwardedRef={ref} />}
		);
	}
	return hoistStatics(FinalConnect, WrappedComponent);
}

function Inject<StoreProp extends {[storeModuleName: string]: InjectStoreModule}>(...moduleDec: Array<string|ModuleDepDec>) {
	const depDecs: DepDecs = {};
	const moduleNames = moduleDec.map(m => {
		if (isModuleDepDec(m)) {
			depDecs[m[0]] = m[1];
			return m[0];
		}
		return m;
	});
	return <P extends StoreProp>(
		WrappedComponent: TReactComponent<P>, 
		LoadingComponent?: TReactComponent<{}>
	) => connect<P, StoreProp>(moduleNames, depDecs, WrappedComponent, LoadingComponent);
}

Inject.setLoadingComponent = (LoadingComponent: TReactComponent<{}>) => Loading = LoadingComponent;
Inject.setStoreGetter = (storeGetter: () => Store) => {
	_getStoreInstance = storeGetter;
}

export default Inject;

