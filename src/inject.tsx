/**
 * @author empty916
 * @email [empty916@qq.com]
 * @create date 2019-08-09 17:13:03
 * @modify date 2019-08-09 17:13:03
 * @desc [description]
 */
import React, {
	ComponentType,
	useMemo,
	useRef,
	useState,
	useSyncExternalStore,
} from "react";
import hoistStatics from "hoist-non-react-statics";
import {
	// ModuleName,
	Store,
	Modules,
	InjectStoreModules,
	LazyStoreModules,
	GenerateStoreType,
	ConnectedComponent,
	GetLibraryManagedProps,
	GetProps,
	ModuleDepDec,
} from "./ts-utils";
import { arrayIsEqual, isEqualWithDepthLimit, supportRef } from "./utils";
import {
	isModuleDepDec,
	DepDecs,
	Diff,
	initDiff,
	InitDiffReturnType,
} from "./injectCache";
import { act } from "@testing-library/react";
import { getDepValue } from "./useInject";

type ModuleName = string;
type ModuleNames = ModuleName[];

let Loading: ComponentType<{}> = () => null;

type Tstate = {
	storeStateChange: {};
	modulesHasLoaded: boolean;
};

const getModuleByNames = <T extends InjectStoreModules>(
	ims: T,
	mns: string[]
) => {
	return mns.reduce((res, mn) => {
		// @ts-ignore
		res[mn] = ims[mn];
		return res;
	}, {} as Partial<T>);
};

export type StoreGetter<
	M extends Modules,
	LM extends LazyStoreModules
> = () => Store<M, LM>;

export type ConnectReturn<
	P,
	SP,
	C extends ComponentType<GetProps<C> & P>
> = ConnectedComponent<C, Omit<GetLibraryManagedProps<C>, keyof SP>>;

const connect = <
	P,
	SP,
	M extends Modules,
	LM extends LazyStoreModules,
	C extends ComponentType<GetProps<C> & P>
>(
	moduleNames: Array<ModuleName>,
	depDecs: DepDecs,
	storeGetter: StoreGetter<M, LM>,
	WrappedComponent: C,
	LoadingComponent: ComponentType<any> = Loading
): ConnectReturn<P, SP, C> => {
	type ConnectProps = P & { forwardedRef: React.Ref<any> };

	const FunctionalConnect = ({ forwardedRef, ...props }: ConnectProps) => {
		const store = useMemo(storeGetter, [storeGetter]);
		const [loadErrorModules, setLoadErrorModules] = useState<string[]>([]);
		const [_, notifyModuleHasLoad] = useState({});
		const integralModulesName = moduleNames
			.filter((mn) => store.getAllModuleName().includes(mn))
			.filter((mn) => !loadErrorModules.includes(mn));
		const unLoadedModules = integralModulesName.filter(
			(mn) => !store.hasModule(mn)
		);
		const noDepModuleNames = integralModulesName.filter(
			(mn) => !depDecs[mn]
		);
		const modulesHasLoaded = !unLoadedModules.length;
		let newProps = Object.assign({}, props, {
			ref: supportRef(WrappedComponent) ? forwardedRef : undefined,
		}) as GetLibraryManagedProps<C>;
		const injectModulesRef = useRef<InjectStoreModules>({});
		const loadingModules = useRef<Record<string, boolean>>({});

		const injectModules = useSyncExternalStore(
			(on) => {
				return store.subscribeAll(({ moduleName }) => {
					if (moduleNames.includes(moduleName)) {
						on();
					}
				});
			},
			() => {
				if (!integralModulesName.length) {
					return;
				}
				if (!modulesHasLoaded) {
					unLoadedModules.forEach((mn) => {
						if (loadingModules.current[mn]) {
							return;
						}
						loadingModules.current[mn] = true;
						store
							.loadModule(mn)
							.then(() => notifyModuleHasLoad({}))
							.catch(() =>
								setLoadErrorModules((nv) => [...nv, mn])
							);
					});
					return;
				}
				const nr = integralModulesName.reduce((res, mn: ModuleName) => {
					res[mn] = store.getModule(mn);
					return res;
				}, {} as Modules);
				if (
					injectModulesRef.current &&
					!isEqualWithDepthLimit(
						getModuleByNames(
							injectModulesRef.current,
							noDepModuleNames
						),
						getModuleByNames(nr, noDepModuleNames),
						1
					)
				) {
					injectModulesRef.current = nr;
					return injectModulesRef.current;
				}

				if (!isEqualWithDepthLimit(injectModulesRef.current, nr, 1)) {
					const mns = Object.keys(depDecs);
					if (mns.length) {
						const res = mns.map((mn) => {
							const oldM = injectModulesRef.current[mn];
							const newM = nr[mn];
							if (
								oldM &&
								arrayIsEqual(
									getDepValue(oldM, depDecs[mn] as any),
									getDepValue(newM, depDecs[mn] as any)
								)
							) {
								return true;
							}
							return false;
						});
						if (res.every((i) => i)) {
							return injectModulesRef.current;
						}
					}
					injectModulesRef.current = nr;
				}

				return injectModulesRef.current;
			}
		);

		if (!integralModulesName.length) {
			// @ts-ignore
			return <WrappedComponent {...newProps} />;
		}
		if (modulesHasLoaded === false) {
			return <LoadingComponent />;
		}

		Object.assign(newProps as {}, injectModules);
		// @ts-ignore
		return <WrappedComponent {...newProps} />;
	};

	const Connect = FunctionalConnect;
	let FinalConnect: any = Connect;
	if (!!React.forwardRef) {
		FinalConnect = React.forwardRef<any, P>(function ForwardConnect(
			props: P,
			ref
		) {
			return <Connect {...props} forwardedRef={ref} />;
		});
	}
	return hoistStatics(FinalConnect, WrappedComponent);
};

export type ConnectFun<
	ST extends InjectStoreModules,
	MNS extends Extract<keyof ST, string>,
	P = Pick<ST, MNS>
> = {
	<C extends ComponentType<GetProps<C> & P>>(
		WC: C,
		LC?: ComponentType<{}>
	): ConnectedComponent<C, Omit<GetLibraryManagedProps<C>, MNS>>;
	type: Pick<ST, MNS>;
};

const createInject = <
	M extends Modules,
	LM extends LazyStoreModules,
	ST extends InjectStoreModules = GenerateStoreType<M, LM>
>({
	storeGetter,
	loadingComponent = Loading,
}: {
	storeGetter: StoreGetter<M, LM>;
	loadingComponent?: ComponentType<{}>;
}) => {
	function Inject<MNS extends Extract<keyof ST, string>>(
		...moduleDec: [MNS | ModuleDepDec<ST, MNS>]
	): ConnectFun<ST, MNS>;
	function Inject<
		MNS1 extends Extract<keyof ST, string>,
		MNS2 extends Extract<keyof ST, string>
	>(
		...moduleDec: [
			MNS1 | ModuleDepDec<ST, MNS1>,
			MNS2 | ModuleDepDec<ST, MNS2>
		]
	): ConnectFun<ST, MNS1 | MNS2>;
	function Inject<
		MNS1 extends Extract<keyof ST, string>,
		MNS2 extends Extract<keyof ST, string>,
		MNS3 extends Extract<keyof ST, string>
	>(
		...moduleDec: [
			MNS1 | ModuleDepDec<ST, MNS1>,
			MNS2 | ModuleDepDec<ST, MNS2>,
			MNS3 | ModuleDepDec<ST, MNS3>
		]
	): ConnectFun<ST, MNS1 | MNS2 | MNS3>;
	function Inject<
		MNS1 extends Extract<keyof ST, string>,
		MNS2 extends Extract<keyof ST, string>,
		MNS3 extends Extract<keyof ST, string>,
		MNS4 extends Extract<keyof ST, string>
	>(
		...moduleDec: [
			MNS1 | ModuleDepDec<ST, MNS1>,
			MNS2 | ModuleDepDec<ST, MNS2>,
			MNS3 | ModuleDepDec<ST, MNS3>,
			MNS4 | ModuleDepDec<ST, MNS4>
		]
	): ConnectFun<ST, MNS1 | MNS2 | MNS3 | MNS4>;
	function Inject<
		MNS1 extends Extract<keyof ST, string>,
		MNS2 extends Extract<keyof ST, string>,
		MNS3 extends Extract<keyof ST, string>,
		MNS4 extends Extract<keyof ST, string>,
		MNS5 extends Extract<keyof ST, string>
	>(
		...moduleDec: [
			MNS1 | ModuleDepDec<ST, MNS1>,
			MNS2 | ModuleDepDec<ST, MNS2>,
			MNS3 | ModuleDepDec<ST, MNS3>,
			MNS4 | ModuleDepDec<ST, MNS4>,
			MNS5 | ModuleDepDec<ST, MNS5>
		]
	): ConnectFun<ST, MNS1 | MNS2 | MNS3 | MNS4 | MNS5>;
	function Inject<
		MNS1 extends Extract<keyof ST, string>,
		MNS2 extends Extract<keyof ST, string>,
		MNS3 extends Extract<keyof ST, string>,
		MNS4 extends Extract<keyof ST, string>,
		MNS5 extends Extract<keyof ST, string>,
		MNS6 extends Extract<keyof ST, string>
	>(
		...moduleDec: [
			MNS1 | ModuleDepDec<ST, MNS1>,
			MNS2 | ModuleDepDec<ST, MNS2>,
			MNS3 | ModuleDepDec<ST, MNS3>,
			MNS4 | ModuleDepDec<ST, MNS4>,
			MNS5 | ModuleDepDec<ST, MNS5>,
			MNS6 | ModuleDepDec<ST, MNS6>
		]
	): ConnectFun<ST, MNS1 | MNS2 | MNS3 | MNS4 | MNS5 | MNS6>;
	function Inject<
		MNS1 extends Extract<keyof ST, string>,
		MNS2 extends Extract<keyof ST, string>,
		MNS3 extends Extract<keyof ST, string>,
		MNS4 extends Extract<keyof ST, string>,
		MNS5 extends Extract<keyof ST, string>,
		MNS6 extends Extract<keyof ST, string>,
		MNS7 extends Extract<keyof ST, string>
	>(
		...moduleDec: [
			MNS1 | ModuleDepDec<ST, MNS1>,
			MNS2 | ModuleDepDec<ST, MNS2>,
			MNS3 | ModuleDepDec<ST, MNS3>,
			MNS4 | ModuleDepDec<ST, MNS4>,
			MNS5 | ModuleDepDec<ST, MNS5>,
			MNS6 | ModuleDepDec<ST, MNS6>,
			MNS7 | ModuleDepDec<ST, MNS7>
		]
	): ConnectFun<ST, MNS1 | MNS2 | MNS3 | MNS4 | MNS5 | MNS6 | MNS7>;
	function Inject<
		MNS1 extends Extract<keyof ST, string>,
		MNS2 extends Extract<keyof ST, string>,
		MNS3 extends Extract<keyof ST, string>,
		MNS4 extends Extract<keyof ST, string>,
		MNS5 extends Extract<keyof ST, string>,
		MNS6 extends Extract<keyof ST, string>,
		MNS7 extends Extract<keyof ST, string>,
		MNS8 extends Extract<keyof ST, string>
	>(
		...moduleDec: [
			MNS1 | ModuleDepDec<ST, MNS1>,
			MNS2 | ModuleDepDec<ST, MNS2>,
			MNS3 | ModuleDepDec<ST, MNS3>,
			MNS4 | ModuleDepDec<ST, MNS4>,
			MNS5 | ModuleDepDec<ST, MNS5>,
			MNS6 | ModuleDepDec<ST, MNS6>,
			MNS7 | ModuleDepDec<ST, MNS7>,
			MNS8 | ModuleDepDec<ST, MNS8>
		]
	): ConnectFun<ST, MNS1 | MNS2 | MNS3 | MNS4 | MNS5 | MNS6 | MNS7 | MNS8>;
	function Inject<
		MNS1 extends Extract<keyof ST, string>,
		MNS2 extends Extract<keyof ST, string>,
		MNS3 extends Extract<keyof ST, string>,
		MNS4 extends Extract<keyof ST, string>,
		MNS5 extends Extract<keyof ST, string>,
		MNS6 extends Extract<keyof ST, string>,
		MNS7 extends Extract<keyof ST, string>,
		MNS8 extends Extract<keyof ST, string>,
		MNS9 extends Extract<keyof ST, string>
	>(
		...moduleDec: [
			MNS1 | ModuleDepDec<ST, MNS1>,
			MNS2 | ModuleDepDec<ST, MNS2>,
			MNS3 | ModuleDepDec<ST, MNS3>,
			MNS4 | ModuleDepDec<ST, MNS4>,
			MNS5 | ModuleDepDec<ST, MNS5>,
			MNS6 | ModuleDepDec<ST, MNS6>,
			MNS7 | ModuleDepDec<ST, MNS7>,
			MNS8 | ModuleDepDec<ST, MNS8>,
			MNS9 | ModuleDepDec<ST, MNS9>
		]
	): ConnectFun<
		ST,
		MNS1 | MNS2 | MNS3 | MNS4 | MNS5 | MNS6 | MNS7 | MNS8 | MNS9
	>;
	function Inject<
		MNS1 extends Extract<keyof ST, string>,
		MNS2 extends Extract<keyof ST, string>,
		MNS3 extends Extract<keyof ST, string>,
		MNS4 extends Extract<keyof ST, string>,
		MNS5 extends Extract<keyof ST, string>,
		MNS6 extends Extract<keyof ST, string>,
		MNS7 extends Extract<keyof ST, string>,
		MNS8 extends Extract<keyof ST, string>,
		MNS9 extends Extract<keyof ST, string>,
		MNS10 extends Extract<keyof ST, string>
	>(
		...moduleDec: [
			MNS1 | ModuleDepDec<ST, MNS1>,
			MNS2 | ModuleDepDec<ST, MNS2>,
			MNS3 | ModuleDepDec<ST, MNS3>,
			MNS4 | ModuleDepDec<ST, MNS4>,
			MNS5 | ModuleDepDec<ST, MNS5>,
			MNS6 | ModuleDepDec<ST, MNS6>,
			MNS7 | ModuleDepDec<ST, MNS7>,
			MNS8 | ModuleDepDec<ST, MNS8>,
			MNS9 | ModuleDepDec<ST, MNS9>,
			...Array<MNS10 | ModuleDepDec<ST, MNS10>>
		]
	): ConnectFun<
		ST,
		MNS1 | MNS2 | MNS3 | MNS4 | MNS5 | MNS6 | MNS7 | MNS8 | MNS9 | MNS10
	>;
	function Inject<MNS extends Extract<keyof ST, string>>(
		...moduleDec: Array<MNS | ModuleDepDec<ST, MNS>>
	) {
		const depDecs: DepDecs = {};
		const moduleNames = moduleDec.map((m) => {
			if (isModuleDepDec(m)) {
				depDecs[m[0]] = m[1];
				return m[0];
			}
			return m as string;
		});
		function connectHOC<
			P extends Pick<ST, MNS>,
			C extends ComponentType<GetProps<C> & P>
		>(
			WrappedComponent: C,
			LoadingComponent: ComponentType<{}> = loadingComponent
		) {
			return connect<P, Pick<ST, MNS>, M, LM, C>(
				moduleNames,
				depDecs,
				storeGetter,
				WrappedComponent,
				LoadingComponent
			);
		}

		const type = null as any as Pick<ST, MNS>;
		connectHOC.type = type;
		return connectHOC;
	}

	Inject.setLoadingComponent = (LoadingComponent: ComponentType<{}>) =>
		(Loading = LoadingComponent);
	return Inject;
};

export default createInject;
