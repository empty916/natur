import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { inject, StoreModule } from "../src";
import initStore from "./initStore.js";

type storeProps = { count?: StoreModule; name?: StoreModule };
type otherProps = {
	className: string;
	style: Object;
};

const _App: React.FC<otherProps & storeProps> = ({count, name}) => {
	const { state, actions } = count;
	const incProxy = () => actions.inc(state);
	const decProxy = () => actions.dec(state);
	return (
		<div>
			<button onClick={incProxy}>+</button>
			<span>{state.count}</span>
			<button onClick={decProxy}>-</button>
		</div>
	);
};

const createLoading = (bgcolor: string) => () => <div style={{width: '100vw', height: '100vh', backgroundColor: bgcolor}}>loading...</div>;

const App = inject<storeProps>('count', 'name')(
	_App,
	createLoading('green')
);
inject.setLoadingComponent(createLoading('red'));

const store = initStore();
const {actions} = store.getModule('count');
(window as any).countActions = actions;

export default <App className="1" style={{}} />;
