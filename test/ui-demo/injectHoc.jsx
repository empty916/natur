import React from "react";
import { inject, createStore, setInjectStoreGetter } from "../../src";
import {
	promiseMiddleware,
	filterNonObjectMiddleware,
	fillObjectRestDataMiddleware,
	shallowEqualMiddleware
} from '../../src/middlewares'

const name = {
	state: {
		text: 'name',
		count: 0,
	},
	actions: {
		updateText: text => ({text}),
		inc: count => ({count: count + 1}),
	},
	maps: {
		textSplit: ['text', text => text.split('').join(',')],
		firstChar: ['text', text => text[0]],
	}
}
const lazyName = {
	state: {
		text: 'name',
	},
	actions: {
		updateText: text => ({text}),
	},
	maps: {
		textSplit: ['text', text => text.split('').join(',')],
	}
}
const App = inject(
	['name', {state: ['text'], maps: [m => m.textSplit]}], 
	'lazyName', 
	'name1'
)(({name, lazyName}) => {
	const { state, actions, maps } = name;
	return (
		<>
			<input id='name-input' value={state.text} onChange={e => actions.updateText(e.target.value)} />
			<input id='lazy-name-input' value={lazyName.state.text} onChange={e => lazyName.actions.updateText(e.target.value)} />
			<br/>
			<button onClick={() => actions.inc(state.count)}>+</button>
			<span id='count'>{state.count + ''}</span>
			<span id='textSplit'>{maps.textSplit}</span>
		</>
	);
});

const AppWithNoModule = inject('name1')(({name}) => {
	// const { state, actions, maps } = name;
	return (
		<>
			aaa
		</>
	);
});

const AppWithLoadErrorModule = inject('lazyLoadError')(({lazyLoadError}) => {
	return (
		<>
			aaa
		</>
	);
});

const initStore = () => {
	return createStore(
		{name},
		{
			lazyName: () => Promise.resolve(lazyName),
			lazyLoadError: () => Promise.reject(lazyName),
		},
		{},
		[
			promiseMiddleware, 
			filterNonObjectMiddleware, 
			fillObjectRestDataMiddleware,
			shallowEqualMiddleware,
		]
	);
	// setInjectStoreGetter(() => store);
};

inject.setLoadingComponent(() => <>loading</>)

export {
	App,
	AppWithNoModule,
	AppWithLoadErrorModule,
	initStore,
};
