import React, {useEffect} from "react";
import ReactDOM from "react-dom";
import {inject, InjectStoreModule} from "../src";
// import { inject, InjectStoreModule } from "../dist/rns";
import initStore from "./initStore";

type storeProps = { count?: InjectStoreModule; name?: InjectStoreModule };
type otherProps = {
	className: string;
	style: Object;
};

let renderStart = 0;

const _App: React.FC<otherProps & storeProps> = ({count, name}) => {
	const {state, actions, maps} = count as InjectStoreModule;
	const incProxy = () => {
		renderStart = performance.now();
		actions.inc(state)
	};
	const decProxy = () => {
		renderStart = performance.now();
		actions.dec(state)
	};
	useEffect(() => {
		console.log(performance.now() - renderStart);
		renderStart = 0;
	})
	return (
		<div>
			count:
			<button onClick={incProxy}>+</button>
			<span>{state.count}</span>
			<button onClick={decProxy}>-</button>
			<br/>
			<br/>

			deep count:
			<button onClick={() => {
				const start = performance.now();
				renderStart = start;
				actions.incDeep(state);
				// console.log(performance.now() - start);
			}}>+</button>
			<span>{state.deeep.deep.count2}</span>
			<br/>
			<br/>

			deeep count:
			<button onClick={() => {
				const start = performance.now();
				renderStart = start;
				actions.incDeeep(state)
				// actions.decDeeep(state)
				// console.log(performance.now() - start);
			}}>+</button>
			<span>{state.deeep.deep.count}</span>
			<br/>
			<br/>

			name:<input type="text" value={state.name} onChange={e => {
			renderStart = performance.now();
			actions.changeName(e.target.value, state);
		}}/>
			<br/>
			<br/>
			<div>maps.isOdd: {maps.isOdd + ''}</div>
			<div>maps.deepCountIsOdd: {maps.deepCountIsOdd + ''}</div>
			<div>maps.deeepCountIsOdd: {maps.deeepCountIsOdd + ''}</div>
			<br/>
		</div>
	);
};

const createLoading = (bgcolor: string) => () => <div
	style={{width: '100vw', height: '100vh', backgroundColor: bgcolor}}>loading...</div>;

const App = inject<storeProps>('count', 'name')(
	_App,
	createLoading('green')
);
inject.setLoadingComponent(createLoading('red'));

const store = initStore();
const {actions} = store.getModule('count');
(window as any).countActions = actions;

export default <App className="1" style={{}}/>;
