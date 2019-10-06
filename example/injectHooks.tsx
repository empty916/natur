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
	const incProxy = () => {
		const newState = actions.inc(state);
		// console.log('after inc state', {...state});
		console.log('after inc maps isOdd', maps.isOdd);
		// console.log('after inc maps', maps.splitName);
	};
	const stateHasNoChange = () => actions.doNothing(state);
	const asyncStateHasNoChange = () => actions.asyncDoNothing(state);
	const decProxy = () => actions.dec(state);
	// React.useEffect(() => {
	// 	console.log('updated');
	// })
	// React.useEffect(() => {
	// 	console.log('state has changed');
	// }, [state])
	// React.useEffect(() => {
	// 	console.log('maps has changed');
	// }, [maps])

	// React.useEffect(() => {
	// 	console.log('maps.isOdd has changed');
	// }, [maps.isOdd]);
	// React.useEffect(() => {
	// 	console.log('maps.splitName has changed');
	// }, [maps.splitName]);
	// React.useEffect(() => {
	// 	console.log('maps.combine has changed');
	// }, [maps.combine]);

	return (
		<>
			<button onClick={incProxy}>+</button>
			<span>{state.count}</span>
			<button onClick={decProxy}>-</button>
			<input type="text" value={state.name} onChange={e => actions.changeName(e.target.value, state)}/>
			<br/>
			<button onClick={stateHasNoChange}>stateHasNoChange</button>
			<button onClick={asyncStateHasNoChange}>asyncStateHasNoChange</button>
		</>
	);
};

store = initStore()
export default <App className="1" style={{}} />;

