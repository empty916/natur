import React from 'react';
import ReactDOM from 'react-dom';
// import {inject} from 'rns'
import {inject, Provider, StoreModule} from '../src'
// import {inject, Provider} from '../src/index'
// import {StoreModule} from '../src/createStore'
import initStore from './initStore.js';

type storeProps = {count: StoreModule, name: StoreModule};
type otherProps = {
	className: string,
	style: Object,
}

const App: React.FC<storeProps & otherProps> = (props) => {
	const {state, actions, maps} = props.count;
    return (
        <>
            <button onClick={() => actions.inc(state)}>+</button>
            <span>{state.count}</span>
            <button onClick={() => actions.dec(state)}>-</button>
        </>
    )
}

const IApp = inject<storeProps>('count', 'name')(App);

const app = (
	<Provider store={initStore()}>
		<IApp className='1' style={{}} />
	</Provider>
);
ReactDOM.render(
    app,
    document.querySelector('#app')
);
