import React from "react";
import { createInject, createStore } from "../../src";
import {
	promiseMiddleware,
	filterNonObjectMiddleware,
	fillObjectRestDataMiddleware,
	shallowEqualMiddleware
} from '../../src/middlewares'
import { resolvePlugin } from "@babel/core";

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

export const store = createStore(
	{name},
	{
		lazyName: () => new Promise(res => {
			setTimeout(() => {
				res(lazyName);
			}, 500);
		}),
		lazyLoadError: () => Promise.reject(lazyName),
	},
	{
		middlewares: [
			promiseMiddleware, 
			filterNonObjectMiddleware, 
			fillObjectRestDataMiddleware,
			shallowEqualMiddleware,
		]
	}
);
const Inject = createInject({
	storeGetter: () => store,
	loadingComponent: () => <>loading</>
});

const injectSome = Inject(['name', {}], 'lazyName');

const App = Inject(
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

const AppWithNoModule = Inject('name1')(({name}) => {
	// const { state, actions, maps } = name;
	return (
		<>
			aaa
		</>
	);
});

const AppWithLoadErrorModule = Inject('lazyLoadError')(({lazyLoadError}) => {
	return (
		<>
			aaa
		</>
	);
});

// Inject.setLoadingComponent()

export {
	App,
	AppWithNoModule,
	AppWithLoadErrorModule,
};
