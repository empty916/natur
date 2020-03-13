import React, {useState} from "react";
import { inject, createStore, useInject, setInjectStoreGetter } from "../../src";
import {
	promiseMiddleware,
	filterNonObjectMiddleware,
	shallowEqualMiddleware,
	fillObjectRestDataMiddleware,
} from '../../src/middlewares'

const name = {
	state: {
		text: 'name',
		count: 0,
	},
	actions: {
		updateText: (text) => ({text,}),
		inc: count => ({count: count + 1}),
	},
	maps: {
		textSplit: ['text', text => text.split('').join(',')],
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
const App = () => {
	const [name, lazyName] = useInject(['name', {state: [s => s.text], maps: ['textSplit']}], 'lazyName');
	if (!name) {
		return null;
	}
	const { state, actions, maps } = name;
	return (
		<>
			<input value={state.text} onChange={e => actions.updateText(e.target.value)} />
			<br/>
			<button onClick={() => actions.inc(state.count)}>+</button>
			<span id='count'>{state.count + ''}</span>
			<span id='textSplit'>{maps.textSplit}</span>
		</>
	);
};

const AppWithErrorModuleName = () => {
	const [name] = useInject('name', 'aaa');
	const { state, actions, maps } = name;
	return (
		<>
			<input value={state.text} onChange={e => actions.updateText(e.target.value)} />
			<br/>
			{maps.textSplit}
		</>
	);
};


const AppWithLoadErrorModule = () => {
	const storeModules = useInject('lazyLoadError');
	if (!storeModules.length) {
		return 'loading';
	}
	return (
		<>
			aaa
		</>
	);
};


const AppWithNoModule = () => {
	const storeModules = useInject();
	if (!storeModules.length) {
		return 'loading';
	}
	return (
		<>
			aaa
		</>
	);
};
const initStore = () => {
	return createStore(
		{
			name,
			name1: name,
			name2: name,
			name3: name,
		},
		{
			lazyName: () => Promise.resolve(lazyName),
			lazyLoadError: () => Promise.reject(lazyName),
		},
		{},
		[
			promiseMiddleware, 
			filterNonObjectMiddleware, 
			fillObjectRestDataMiddleware,
			shallowEqualMiddleware
		]
	);
	// setInjectStoreGetter(() => store);
}

export {
	App,
	AppWithErrorModuleName,
	AppWithLoadErrorModule,
	AppWithNoModule,
	initStore,
};
