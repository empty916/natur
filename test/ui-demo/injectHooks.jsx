import React, {useState} from "react";
import { inject, createStore, useInject } from "../../src";
import {
	promiseMiddleware,
	filterIllegalTypeMiddleware,
	shallowEqualMiddleware,
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
	const [moduleNames, setModuleNames] = useState(['name', 'lazyName'])
	const [name, lazyName] = useInject(...moduleNames);
	if (!name) {
		return null;
	}
	const { state, actions, maps } = name;
	return (
		<>
			<input value={state.text} onChange={e => actions.updateText(e.target.value)} />
			<br/>
			{maps.textSplit}
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
const initStore = () => createStore(
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
	[promiseMiddleware, filterIllegalTypeMiddleware, shallowEqualMiddleware]
)

export {
	App,
	AppWithErrorModuleName,
	AppWithLoadErrorModule,
	AppWithNoModule,
	initStore,
};
