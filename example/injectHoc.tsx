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

const _App: React.FC<otherProps & storeProps> = ({count}) => {
	const {state, actions, maps} = count as InjectStoreModule;
	return (
		<div>
			count:
			<button onClick={actions.inc}>+</button>
			<span>{state.count}</span>
			<button onClick={actions.dec}>-</button>
			<br/>
			<br/>
			deeep count:
			<button onClick={actions.incDeeep}>+</button>
			<span>{state.deeep.deep.count}</span>
			<button onClick={actions.decDeeep}>+</button>
			<br/>
			<br/>

			name:<input type="text" value={state.name} onChange={e => actions.changeName(e.target.value)}/>
			<br/>
			<br/>
			<div>maps.isOdd: {maps.isOdd + ''}</div>
			<div>maps.deeepCountIsOdd: {maps.deeepCountIsOdd + ''}</div>
			<div>maps.splitName: {maps.splitName.join(',')}</div>
			<br/>
		</div>
	);
};

const createLoading = (bgcolor: string) => () => <div
	style={{width: '100vw', height: '100vh', backgroundColor: bgcolor}}>loading...</div>;

const App = inject<storeProps>(['count', {state: ['count', s => s.deeep.deep.count]}])(
	_App,
	createLoading('green')
);
inject.setLoadingComponent(createLoading('red'));

const store = initStore();
const {actions} = store.getModule('count');
(window as any).countActions = actions;

export default <App className="1" style={{}}/>;
