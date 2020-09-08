import React from "react";
import { createInject } from "../src";
import initStore from "./initStore";

type otherProps = {
	className: string;
	style: Object;
};

const store = initStore();

const inject = createInject({storeGetter: () => store});

const injectStore = inject([
	"count", {
		// maps: ['deeepCountIsOdd', 'firstChar'],
		maps: ['deeepCountIsOdd'],
		// state: ['count', s => s.count + s.deeep.deep.count],
		state: ['deeep'],
	}
], 'count2');

const _App: React.FC<otherProps & typeof injectStore.type> = ({ count }) => {
	const { state, actions, maps } = count;
	// const a = actions.multiReturnTypeAction()
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

const App = injectStore(
	_App,
	createLoading("green")
);

inject.setLoadingComponent(createLoading("red"));

const { actions } = store.getModule("count");


(window as any).countActions = actions;

export default <App className="1" style={{}} />;
