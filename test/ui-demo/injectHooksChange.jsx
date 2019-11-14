import React, {useState} from "react";
import { createStore, useInject, setInjectStoreGetter } from "../../src";

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
const count = {
	state: {
		count: 0,
	},
	actions: {
		inc: (state) => ({count: state.count + 1}),
		dec: (state) => ({count: state.count - 1}),
	}
}

const App = () => {
	const [moduleNames, setModuleNames] = useState(['count', 'name'])
	const [count, name] = useInject(...moduleNames);
	if (!count) return 'loading'
	const { state, actions, maps } = name;
	return (
		<>
			<button id='dec' onClick={() => count.actions.dec(count.state)}>-</button>
			<span id="count">{count.state.count}</span>
			<button id='inc' onClick={() => count.actions.inc(count.state)}>+</button>
			<input value={state.text} onChange={e => actions.updateText(e.target.value)} />
			<br/>
			<span id="name">{state.text}</span>
			<button id="btn00" onClick={() => setModuleNames(['count', 'name'])}>count, name</button>
			<button id="btn10" onClick={() => setModuleNames(['count1', 'name', 'count2'])}>count1, name</button>
			<button id="btn01" onClick={() => setModuleNames(['count', 'name1'])}>count, name1</button>
			<button id="btn11" onClick={() => setModuleNames(['count1', 'name1'])}>count1, name1</button>
		</>
	);
};

const initStore = () => createStore(
	{
		name,
		count,
		name1: name,
		count1: count,
	},
	{
		count2: () => Promise.resolve(count),
	}
)

export {
	App,
	initStore,
};
