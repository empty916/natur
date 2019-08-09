import React, {useCallback} from 'react';
import ReactDOM from 'react-dom';
import {inject} from 'react-natural-store'
import './initStore';


const App = props => {
	const {count: {state, actions, maps}} = props;
	const acn = useCallback(e => {
		const a = props.name.actions.asyncChangeName(e.target.value)
		// console.log(a);
		.then((ns) => {
			console.log(props.name, ns);
		})
	}, [props]);
    return (
        <>
            <button onClick={() => actions.inc(state)}>+</button>
            <span>{state.count}</span>
            <button onClick={() => actions.dec(state)}>-</button>
            <div>count is {maps.isOdd ? 'odd' : 'even'}</div>
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>
            changeName:
            <input
                type="text"
                value={props.name.state.name}
                onChange={e => props.name.actions.changeName(e.target.value)}
            />
            <br/>
            asyncChangeName:
            <input
                type="text"
                value={props.name.state.name}
                onChange={acn}
            />
        </>
    )
}

const IApp = inject('count', 'name')(App);

ReactDOM.render(
    <IApp />,
    document.querySelector('#app')
);
