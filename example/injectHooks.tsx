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
		actions.inc(state);
		console.log('state实时获取最新值测试', {...state});
		console.log('maps实时获取最新值测试', {...maps});
	};
	const stateHasNoChange = () => actions.doNothing(state);
	const asyncStateHasNoChange = () => actions.asyncDoNothing(state);
	const decProxy = () => actions.dec(state);
	React.useEffect(() => {
		console.log({...maps});
	});
	React.useEffect(() => {
		console.log('state缓存测试：当state改变时才会打印');
	}, [state]);
	React.useEffect(() => {
		console.log('maps缓存测试：当maps改变时才会打印');
	}, [maps]);
	// React.useEffect(() => {
	// 	console.log('maps缓存测试：当name改变时才会打印');
	// }, [maps.splitName]);
	// React.useEffect(() => {
	// 	console.log('maps缓存测试：name或者count改变时就会打印');
	// }, [maps.combine]);
	// React.useEffect(() => {
	// 	console.log('maps缓存测试：当count改变时才会打印');
	// }, [maps.count]);


	// React.useEffect(() => {
	// 	console.log('maps动态依赖测试: 当count是奇数时，打印name', maps.returnNameWhenCountIsOdd);
	// }, [maps.returnNameWhenCountIsOdd]);


	return (
		<>
			<button onClick={incProxy}>+</button>
			<span>{state.count}</span>
			<button onClick={decProxy}>-</button>
			<br/>
			<br/>
			name:<input type="text" value={state.name} onChange={e => actions.changeName(e.target.value, state)}/>
			<br/>
			<br/>
			<div>maps.isOdd: {maps.isOdd + ''}</div>
			<br/>
			<button onClick={stateHasNoChange}>stateHasNoChange</button>
			<br/>
			<button onClick={asyncStateHasNoChange}>asyncStateHasNoChange</button>
			<br/>
			<button onClick={() => actions.addKey(state)}>add new key</button>
			<br/>
			<button onClick={() => actions.deleteKey(state)}>delete new key</button>
			<br/>
		</>
	);
};

store = initStore()
export default <App className="1" style={{}} />;

