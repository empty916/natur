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
	const incProxy = () => {
		actions.inc(state);
		// console.log('state实时获取最新值测试', {...state});
		// console.log('maps实时获取最新值测试', {...maps});
	};
	const decProxy = () => actions.dec(state);
	const stateHasNoChange = () => actions.doNothing(state);
	const asyncStateHasNoChange = () => actions.asyncDoNothing(state);
	// React.useEffect(() => {
	// 	console.log({...maps});
	// });
	// React.useEffect(() => {
	// 	console.log('state缓存测试：当state改变时才会打印');
	// }, [state]);
	// React.useEffect(() => {
	// 	console.log('maps缓存测试：当maps改变时才会打印');
	// }, [maps]);
	// React.useEffect(() => {
	// 	console.log('maps缓存测试：当name改变时才会打印');
	// }, [maps.splitName]);
	// React.useEffect(() => {
	// 	console.log('maps缓存测试：当state中有值改变时就会打印');
	// }, [maps.combine]);
	// React.useEffect(() => {
	// 	console.log('maps缓存测试：当count改变时才会打印');
	// }, [maps.count]);


	// React.useEffect(() => {
	// 	console.log('maps动态依赖测试: 当count是奇数时，才会打印name', maps.returnNameWhenCountIsOdd);
	// }, [maps.returnNameWhenCountIsOdd]);
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
			<button onClick={stateHasNoChange}>stateHasNoChange</button>
			<br/>
			<button onClick={asyncStateHasNoChange}>asyncStateHasNoChange</button>
			<br/>
			<button onClick={() => actions.addKey(state)}>add new key</button>
			<br/>
			<button onClick={() => actions.deleteKey(state)}>delete new key</button>
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
