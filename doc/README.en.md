# react-natural-store cook book

#### [This package has been migrated to natur](https://www.npmjs.com/package/natur)

#### This is a pure version of the [react-natural-store](https://www.npmjs.com/package/react-natural-store).

#### The difference between rns-pure and react-natural-store is as follows：

- State itself does not restrict data types
- Maps must be manually declared dependencies
- Actions return any value can be used as the value of state, without any interception
- Does not automatically attach asynchronous support, does not automatically attach shallow comparison state update optimization
- Middlewares.js comes with common middleware, including asynchronous middleware, shallow contrast state optimization middleware, etc.
- Rns-pure does not automatically collect dependencies, so it does not restrict actions to state changes, but must follow the immutable specification.
- Because rns-pure does not use the Object.defineProperty API, it can support IE low version browsers.
- Because there is no Object.defineProperty interception, the following will occur

```ts
/*
  app: {
    state: {
      name: 'tom'
    },
    actions: {
      updateName: () => ({name: 'jerry'}),
    }
  }
*/

const App = () => {
  const [{state, actions}] = useInject('app');
  // call action
  const newState = actions.updateName();
  // The old state cannot get the latest state value directly
  // state.name === 'tom'
  // newState.name === 'jerry'
  // ...
}


```



- Due to runtime closure issues, the latest state cannot be obtained, and thunkMiddleware is added

```typescript

import { thunkMiddleware } from 'rns-pure/dist/middlewares'

const actionExample = (myParams: any) => (getState, setState: (s: State) => State, getMaps: () => InjectMaps) => {
    const currentState = getState(); // latest state
    const currentMaps = getMaps(); // latest maps
    setState(currentState); // update state
}
```
- devtool

```typescript

// redux.devtool.middleware.ts
import { Middleware } from 'rns-pure';
import { createStore } from 'redux';

const root = (state: Object = {}, actions: any):Object => ({
	...state,
	...actions.state,
});

const createMiddleware = ():Middleware => {
	if (process.env.NODE_ENV === 'development' && (window as any).__REDUX_DEVTOOLS_EXTENSION__) {
		const devMiddleware = (window as any).__REDUX_DEVTOOLS_EXTENSION__();
		const store = createStore(root, devMiddleware);
		return () => next => record => {
			store.dispatch({
				type: `${record.moduleName}/${record.actionName}`,
				state: {
					[record.moduleName]: record.state,
				},
			});
			next(record);
		}
	}
	return () => next => record => next(record);
}

export default createMiddleware();


```

- Recommended middleware configuration

```typescript

import {createStore} from 'rns-pure';
import { promiseMiddleware, shallowEqualMiddleware, thunkMiddleware } from 'rns-pure/dist/middlewares';
import devTool from 'redux.devtool.middleware';

const store = createStore(
	modules,
    {},
	undefined,
	[
		thunkMiddleware,
		promiseMiddleware,
		shallowEqualMiddleware,
		devTool,
	],
);
```
