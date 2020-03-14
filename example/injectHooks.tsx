import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { inject, StoreModule, Store } from "../src";
import {useInject} from '../src/hooks';
import initStore from "./initStore";

type props = {
	className: string;
	style: Object;
};
let store: Store;
const App: React.FC<props> = () => {
	// const [count] = useInject(['count', {state: ['name']}]);
	const [count, count2] = useInject(['count', {state: []}], ['count2', {}]);

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
			<br/>
			<br/>
			count2:
			<br/>
			<button onClick={() => count2.actions.inc(count2.state)}>+</button>
			<span>{count2.state.count}</span>
			<button onClick={() => count2.actions.dec(count2.state)}>-</button>
			<br/>
			<input
				type="text"
				value={count2.state.name}
				onChange={e => count2.actions.changeName(e.target.value)}
			/>
			<br/><br/>
		</>
	);
};

store = initStore();

store.getModule('count');
export default <App className="1" style={{}} />;

