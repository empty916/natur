import React from "react";
import { createInject, createStore } from "../../src";
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
		updateText: (text: string) => ({text}),
		inc: (count: number) => ({count: count + 1}),
	},
	maps: {
		textSplit: ['text', (text: string) => text.split('').join(',')],
		firstChar: ['text', (text: string) => text[0]],
	}
}
const lazyName = {
	state: {
		text: 'name',
	},
	actions: {
		updateText: (text: string) => ({text}),
	},
	maps: {
		textSplit: ['text', (text: string) => text.split('').join(',')],
	}
}

export const store = createStore(
	{name},
	{
		lazyName: () => new Promise<typeof lazyName>(res => {
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

const appInjector = Inject(
	['name', {
		state: ['text'],
		maps: ['textSplit']
	}], 
	'lazyName', 
	'name1' as any
);

const App = appInjector(({name, lazyName}) => {
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

const name1Injector = Inject('name1' as any);

const AppWithNoModule = name1Injector(({name}) => {
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
