import React, {useCallback} from 'react';
import ReactDOM from 'react-dom';
import inject from '../src/inject'
import {StoreModule} from '../src/createStore'
import './initStore';

const Name = inject('name')(({name: {state}}) => state.name);

const App = (props) => {
	const {count: {state, actions, maps}} = props;
	const [showName, toggleShowName] = React.useState(false);
	console.log('render');
	setTimeout(() => toggleShowName(true), 3000);
    return (
        <>
            <button onClick={() => actions.inc(state)}>+</button>
            <span>{state.count}</span>
            <button onClick={() => actions.dec(state)}>-</button>
			<br/>
			{ showName ? <Name /> : null}
        </>
    )
}

const IApp = inject('count')(App);

ReactDOM.render(
    <IApp />,
    document.querySelector('#app')
);
