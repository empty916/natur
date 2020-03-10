import React from "react";
import { inject, createStore, setInjectStoreGetter } from "../../src";
import {
	promiseMiddleware,
	filterNonObjectMiddleware,
	shallowEqualMiddleware
} from '../../src/middlewares'

const name = {
	state: {
		text: 'name',
	},
	actions: {
		updateText: text => ({text}),
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
const App = inject('name', 'lazyName', 'name1')(({name}) => {
	const { state, actions, maps } = name;
	return (
		<>
			<input value={state.text} onChange={e => actions.updateText(e.target.value)} />
			<br/>
			{maps.textSplit}
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
		[promiseMiddleware, filterNonObjectMiddleware, shallowEqualMiddleware]
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
