import React, { useEffect, useState } from "react";
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
				res({
					...lazyName,
				});
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


const useInject = createUseInject(() => store, {flat: true});


const App = () => {
	const [name] = useInject('name', {
		state: ['text'],
		maps: ['textSplit']
	});
	const [lazyName, loading] = useInject('lazyName')
	if (loading) {
		return <div role='loading'>loading</div>;
	}
	return (
		<>
			<input role='name-input' value={name.text} onChange={e => name.updateText(e.target.value)} />
			<input role='lazy-name-input' value={lazyName.text} onChange={e => lazyName.updateText(e.target.value)} />
			<br/>
			<button role='btn-inc' onClick={() => name.inc(name.count)}>+</button>
			<span role='count'>{name.count + ''}</span>
			<span role='text-split'>{name.textSplit}</span>
		</>
	);
}


const DynamicModuleApp = () => {
	const [moduleName, setModuleName] = useState<'lazyName' | 'lazyName2'>('lazyName');
	const [lazyName, loading] = useInject(moduleName);

	useEffect(() => {
		if (moduleName === 'lazyName' && loading === false) {
			setModuleName('lazyName2');
		}
	}, [loading, moduleName]);

	if (loading) {
		return <div role='loading'>loading</div>;
	}
	return (
		<>
			<input role='lazy-name-input' value={lazyName.text} onChange={e => lazyName.updateText(e.target.value)} />
		</>
	);
}


export {
	App,
	DynamicModuleApp,
};
