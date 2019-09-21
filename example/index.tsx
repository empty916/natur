import React from "react";
import ReactDOM from "react-dom";
import { inject, StoreModule } from "../src";
import { useInject } from "../src/hooks";
import initStore from "./initStore.js";

type storeProps = { count?: StoreModule; name?: StoreModule };
type otherProps = {
	className: string;
	style: Object;
};

const App: React.FC<otherProps> = () => {
	const [{ state, actions, maps }] = useInject('count');
	return (
		<>
			<button onClick={() => actions.inc(state)}>+</button>
			<span>{state.count}</span>
			<button onClick={() => actions.dec(state)}>-</button>
		</>
	);
};

initStore()
const app = <App className="1" style={{}} />;


ReactDOM.render(app, document.querySelector("#app"));
