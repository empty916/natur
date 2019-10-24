import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { inject, InjectStoreModule } from "../src";
import initStore from "./initStore.js";

type storeProps = { count?: InjectStoreModule; name?: InjectStoreModule };
type otherProps = {
	className: string;
	style: Object;
};

const _App: React.FC<otherProps & storeProps> = ({count, name}) => {
	const { state, actions, maps } = count;
	const incProxy = () => actions.inc(state);
	const decProxy = () => actions.dec(state);

	return (
		<div>
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
