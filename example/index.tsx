import React from 'react';
import ReactDOM from 'react-dom';
// import {inject, Provider, StoreModule} from 'react-natural-store'
import {inject, StoreModule} from '../src'
import initStore from './initStore.js';


type storeProps = {count?: StoreModule, name?: StoreModule};
type otherProps = {
	className: string,
	style: Object,
}

// const Name = React.memo(({name}) => (
// 	<>
// 		<div>{name.state.name}</div>
// 		<div>{name.maps.splitName.join(',')}</div>
// 	</>
// ))
class App extends React.Component<storeProps & otherProps> {
	componentDidUpdate(prevProps, prevState) {
		const { count, name } = this.props;
		console.log(prevProps.count === count);
	}

	render() {
		const { count } = this.props;
		const {state, actions, maps} = count;
		return (
			<div>
				<button onClick={() => actions.inc(state)}>+</button>
				<span>{state.count}</span>
				<button onClick={() => actions.dec(state)}>-</button>
			</div>
		)
	}
}

const IApp = inject<storeProps>('count', 'name')(App);
initStore();
const app =  (
	<IApp className='1' style={{}} forwardedRef={console.log} />
);
ReactDOM.render(
    app,
    document.querySelector('#app')
);
