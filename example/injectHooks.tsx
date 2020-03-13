import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { inject, StoreModule, Store, useInject } from "../src";
import initStore from "./initStore";

type props = {
	className: string;
	style: Object;
};
let store: Store;
const App: React.FC<props> = () => {
	// const [count] = useInject(['count', {state: ['name']}]);
	const [count] = useInject(['count', {state: []}]);

	const {state,actions,maps} = count;
	const incProxy = () => actions.inc(state)
	const decProxy = () => actions.dec(state);
	return (
		<>
			<button onClick={incProxy}>+</button>
			<span>{state.count}</span>
			<button onClick={decProxy}>-</button>
			<br/>
			<input
				type="text"
				value={count.state.name}
				onChange={e => count.actions.changeName(e.target.value)}
			/>
			<br/><br/>
			{/* <button onClick={() => setStoreModuleNames(['count'])}>count</button>
			<button onClick={() => setStoreModuleNames(['count'])}>count</button> */}
		</>
	);
};

store = initStore();

store.getModule('count');
export default <App className="1" style={{}} />;

