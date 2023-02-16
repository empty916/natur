import { Actions, EventType, Maps, State, StoreModule } from "./base";
import { ActionReturnType, GenMapsType, ModuleType, Store } from "./utils";

export type WatchEventMap<
	M extends StoreModule = StoreModule,
	IM = ModuleType<M>
> = {
	[k in EventType]: {
		type: k;
		actionName: k extends "init" | "remove"
			? undefined
			: keyof M["actions"] | "globalSetStates" | "globalResetStates";
		oldModule: k extends "init" ? undefined : IM;
		newModule: k extends "remove" ? undefined : IM;
	};
};


export type AllWatchEventMap<
	M extends StoreModule = StoreModule,
	IM = ModuleType<M>
> = {
	[k in EventType]: {
		type: k;
		moduleName: string;
		actionName: k extends "init" | "remove"
			? undefined
			: Extract<keyof M["actions"], string> | "globalSetStates" | "globalResetStates";
		oldModule: k extends "init" ? undefined : IM;
		newModule: k extends "remove" ? undefined : IM;
	};
};


export type WatchAPI<
	S extends State = State,
	M extends Maps = Maps,
	A extends Actions = Actions
> = {
	getState: () => S;
	getMaps: () => GenMapsType<M, S>;
	getStore: () => Store<any, any>;
	localDispatch: <AN extends keyof A>(
		actionName: AN,
		...arg: Parameters<A[AN]>
	) => ActionReturnType<A[AN], S>;
};


export type WatchEvent<M extends StoreModule = StoreModule> =
	WatchEventMap<M>[EventType];

export type AllWatchEvent<M extends StoreModule = StoreModule> =
	AllWatchEventMap<M>[EventType];

