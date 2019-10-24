import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { inject, StoreModule, Store } from "../src";
import { useInject } from "../src/hooks";
import initStore from "./initStore";

type props = {
	className: string;
	style: Object;
};
let store: Store;
const App: React.FC<props> = () => {
	const [storeModuleNames, setStoreModuleNames] = useState(['count', 'name']);
	const [count, name] = useInject(...storeModuleNames);

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
				value={name.state.name}
				onChange={e => name.actions.changeName({name: e.target.value})}
			/>
			<br/><br/>
			<button onClick={() => setStoreModuleNames(['count', 'name'])}>count, name</button>
			<button onClick={() => setStoreModuleNames(['count', 'name1'])}>count, name1</button>
			<button onClick={() => setStoreModuleNames(['count1', 'name'])}>count1, name</button>
			<button onClick={() => setStoreModuleNames(['count1', 'name1'])}>count1, name1</button>
		</>
	);
};

store = initStore()
export default <App className="1" style={{}} />;

