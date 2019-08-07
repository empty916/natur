# react-store使用手册

1. Create a store instance, this step needs to be done before using the inject method, because the inject method depends on the instance of the store

````
import { createStore } from '../react-store'
const app = {
	state: {
		name: 'tom',
	},
	actions: {
		changeName: newName => ({name: newName}), // The returned value will be used as the new state. If the original state or undefined is returned, , the page will not trigger an update.
		asyncChangeName: newName => Promise.resolve({name: newName}), // Support promise return value, the value returned by promise will be used as the new state, if the original state or undefined is returned, the page will not trigger the update.
	},
	maps: { // The optional parameters, the maps obtained on the page, will be the return value of the function after the run.
		nameSplit: state => state.name.split(''),
		addName: state => lastName => state.name + lastName,
	}
}

const store = createStore({app}); // create store instance

````

2. Inject the store module into the component using the inject method

````

const App = ({app, module1}) => {
	/*
		state: {
			name: 'tom'
		},
		actions: {
			changeName,
			asyncChangeName,
		},
		maps: {
			splitName: ['t', 'o', 'm'],
			addName: lastName => state.name + lastName,
		}
	*/
	const {state, actions, maps} = app; // Get the injected app module
	return (
		<input
			value={state.name} // State data in the app module
			onChange={e => actions.changeName(e.target.value)}
		/>
	)
};
export default Inject('app', 'module1', ...)(App); // Inject the app module in the store.

````

3. Lazy loading configuration

````
/*
	module1.js content
	export {
		state: {
			count: 1,
		}
		actions: {
			inc: state => ({count: state.count + 1}),
		}
	}
*/
const module1 = () => import('module1'); // Lazy loading module

// The second parameter is the lazy loading module.
const store = createStore({app}, {module1}); // create store instance

// The latter usage is the same as before

````


4. when loading the module, the configuration of the loading prompt component

````
import { inject } from 'react-natural-store'
// Global configuration
inject.setLoadingComponent(() => <div>loading...</div>);

// Local configuration
inject('app')(App, () => <div>loading</div>)

````
