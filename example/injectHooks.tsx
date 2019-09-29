import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { inject, StoreModule, Store } from "../src";
import { useInject } from "../src/hooks";
import initStore from "./initStore.js";

type props = {
	className: string;
	style: Object;
};
let store: Store;
const App: React.FC<props> = () => {
	const [{ state, actions, maps }] = useInject('count');
	const [name] = useInject('name');
	const incProxy = () => actions.inc(state);
	const decProxy = () => actions.dec(state);
	React.useEffect(() => {
		store.getModule('count');
	}, [])
	return (
		<>
			<button onClick={incProxy}>+</button>
			<span>{state.count}</span>
			<button onClick={decProxy}>-</button>
		</>
	);
};

store = initStore()
export default <App className="1" style={{}} />;

