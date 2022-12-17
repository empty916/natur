import React from "react";
import { createInject, createStore, createUseInject } from "../../src";
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
			}, 100);
		}),
		lazyName2: () => new Promise<typeof lazyName>(res => {
			setTimeout(() => {
				res(lazyName);
			}, 100);
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
const useInject = createUseInject(() => store);


const _App = () => {
	const [name] = useInject('name', {
		state: ['text'],
		maps: ['textSplit']
	});
	const [lazyName, loading] = useInject('lazyName')
	const { state, actions, maps } = name;
	if (loading) {
		return <div role='loading'>loading</div>;
	}
	return (
		<>
			<input role='name-input' value={state.text} onChange={e => actions.updateText(e.target.value)} />
			<input role='lazy-name-input' value={lazyName?.state?.text} onChange={e => lazyName?.actions?.updateText(e.target.value)} />
			<br/>
			<button role='btn-inc' onClick={() => actions.inc(state.count)}>+</button>
			<span role='count'>{state.count + ''}</span>
			<span role='text-split'>{maps.textSplit}</span>
		</>
	);
}

const App = _App;

export {
	App,
};
