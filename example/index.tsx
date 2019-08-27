import React, {useCallback} from 'react';
import ReactDOM from 'react-dom';
// import {inject} from 'rns'
import {inject} from '../src/index'
import {StoreModule} from '../src/createStore'
import initStore from './initStore.js';

type AppProps = {count?: StoreModule, name?: StoreModule};

const App: React.FC<AppProps> = (props: AppProps) => {
	if (!props.count) {
		return <>23333</>;
	}
	const {state, actions, maps} = props.count;
    return (
        <>
            <button onClick={() => actions.inc(state)}>+</button>
            <span>{state.count}</span>
            <button onClick={() => actions.dec(state)}>-</button>
        </>
    )
}

const a = inject('count', 'name');
const IApp = a(App);

initStore();

ReactDOM.render(
    <IApp />,
    document.querySelector('#app')
);
