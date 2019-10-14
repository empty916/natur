import React from "react";
import { inject, createStore, useInject } from "../../src";

const name = {
	state: {
		text: 'name',
	},
	actions: {
		updateText: text => ({text}),
	},
	maps: {
		textSplit: ({text}) => text.split('').join(','),
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
		textSplit: ({text}) => text.split('').join(','),
	}
}
const App = () => {
	const [name, lazyName] = useInject('name', 'lazyName');
	const [] = useInject();
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
	const [] = useInject();
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
const initStore = () => createStore({name}, {
	lazyName: () => Promise.resolve(lazyName),
	lazyLoadError: () => Promise.reject(lazyName),
})

export {
	App,
	AppWithErrorModuleName,
	AppWithLoadErrorModule,
	initStore,
};
