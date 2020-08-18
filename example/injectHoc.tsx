import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { inject, InjectStoreModule } from "../src";
// import { inject, InjectStoreModule } from "../dist/rns";
import initStore from "./initStore";
import { InjectCountStore } from "./count";

type storeProps = { count?: InjectCountStore; name?: InjectStoreModule };
type otherProps = {
	className: string;
	style: Object;
};

let renderStart = 0;

const _App: React.FC<otherProps & storeProps> = ({ count }) => {
	const { state, actions, maps } = count;
	return (
		<div>
			count:
			<button onClick={actions.inc}>+</button>
			<span>{state.count}</span>
			<button onClick={actions.dec}>-</button>
			<br />
			<br />
			deeep count:
			<button onClick={actions.incDeeep}>+</button>
			<span>{state.deeep.deep.count}</span>
			<button onClick={actions.decDeeep}>+</button>
			<br />
			<br />
			name:
			<input
				type="text"
				value={state.name}
				onChange={(e) => actions.changeName(e.target.value)}
			/>
			<br />
			<br />
			<div>maps.isOdd: {maps.isOdd + ""}</div>
			<div>maps.deeepCountIsOdd: {maps.deeepCountIsOdd + ""}</div>
			<div>maps.splitName: {maps.splitName.join(",")}</div>
			<br />
		</div>
	);
};

const createLoading = (bgcolor: string) => () => (
	<div style={{ width: "100vw", height: "100vh", backgroundColor: bgcolor }}>
		loading...
	</div>
);

const App = inject<storeProps>(["count", { maps: ["firstChar"] }])(
	_App,
	createLoading("green")
);
inject.setLoadingComponent(createLoading("red"));

const store = initStore();

console.log(store.getModule("count"));
const { actions } = store.getModule("count");

store.loadModule("lazyCount").then((lazyModule) => {
	lazyModule.actions.decDeeep();

});


store.subscribe('lazyCount', me => {
	if (me.actionName === 'dec') {

	}
});

store.globalSetStates({
	count2: {
		count: 1,
	}
});

(window as any).countActions = actions;

export default <App className="1" style={{}} />;
