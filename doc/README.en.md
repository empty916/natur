# react-natural-store cook book


- [concept of design](./design.en.md)


### [This package has been migrated to natur](https://www.npmjs.com/package/natur)

- **If your project wants to migrate from react-natural-store to natur, then you can see this [migration navigation](https://github.com/empty916/natur/releases/tag/0.0.3). The main thing is that maps must be manually declared. Others are fine.**

#### basic introduction
- This is a simple and efficient react state manager
- Browser compatible: IE9+
- support react 15.x, 16.x and anujs
- Unit test coverage rate of 99%, rest assured to use
- minizipped size 5k

#### STEP1. Create a store instance

**This step needs to be done before the component is rendered, because the component wrapped by the inject method depends on the instance of the store when rendering.**

```js
import { createStore} from 'react-natural-store'

/*
Here the app is treated as a module
The data structure of a module is like this
*/
const app = {
  // State must be an Object, and the child elements are not limited.
  state: {
    name: 'tom',
    todos: [{
      text: 'play game ',
    }],
    games: new Map(['favorite', 'lol'])
  },
  // The actions must be an Object, the child element must be a function
  actions: {
  /*
  Returned parameter
  If it is Object, it will be the new state.
  If not, it will not be processed and the original value will be returned   to the caller.
  Need to follow the immutable specification! ! !
  */
  changeName: newName => ({name: newName}),
  /*
    Support promise,
    The return value behavior is consistent with the above synchronous action
  */
  asyncChangeName: newName => Promise.resolve({name: newName}),
  },
  /*
    Optional parameters, must be an Object, the child element must be a Function or Array<String | Function>
    The maps obtained on the page will be the return value of the function after the run.
    The maps method automatically collects dependencies and recalculates the results only when the dependencies change.
  */
  maps: {
    /*
    If the map is just using the first layer of state data, you can write a function directly.
    */
    nameSplit: state => state.name.split(''),
    addName: state => lastName => state.name + lastName,
	
    /** 
     * If your map requires performance，
     * And rely on state deep data, or complex data, you can manually rely on the declaration
     * This example will only recalculate the result if the todos[0].text or s.info.get('favorite') data changes.
    */
    deepDep: [
      /*
      For common data types, 
      you can declare dependencies using string paths.
      If an error occurs while getting, it will automatically return to undefined
      */
      'todos[0].text', 
      (s: State) => s.info.get('favorite'), // For complex types, you can use functions to declare dependencies.
      (firstTodo, favorite) => firstTodo + favorite; // 'play game lol'
    ]
  }
}

const otherModules = {
  //...
};
// create store instance
const store = createStore({app, ...otherModules}); 
export default store;


```

#### STEP2. Inject the store module into the component using the inject method

```jsx

const App = ({app, module1}) => {
  // Get the injected app module
  const {state, actions, maps} = app;
  /*
    the app module you got
    state: {
      name: 'tom'
    },
    actions: {
      changeName,
      asyncChangeName,
    },
    maps: {
      splitName: ['t', 'o', 'm'],
      addName: lastName => state.name + lastName,
    }
  */
  return (
    <input
      value={state.name} // State data in the app module
      onChange={e => actions.changeName(e.target.value)}
    />
  )
};

// Inject the app module in the store.
export default Inject('app', 'module1', ...)(App);

```

---
#### Ok, you have mastered it. here are some additional features.


- [hooks](#hooks)
- [Configuring lazy loading module](#config-lazy-module)
- [Use other state when initializing the store](#init-with-state)
- [Middleware](#middleware)
- [When the lazy loading module is loading, the placeholder component is configured](#loading-component)
- [Use store outside of react](#use-store-without-react)
- [Manual import module](#manual-import-module)
- [Used in typescript](#typescript)
- [<font color=#faad14 >Cautions</font>](#caution)

---

#### <a id='hooks' style="color: black;">The second step can be replaced by hooks. Use useInject to inject the app module into the component.</a>

```jsx

import { useInject } from 'react-natural-store';

const App = () => {
  /*
  Note： that if there is a lazy load module in the useInject parameter, 
  it will return an empty array first, 
  and wait until the lazy load module is loaded to return the module you need, 
  so useInject is not recommended for lazy loading module.

  But you can use the way to manually set modules

  store.setModule('otherModuleName', otherModule);

  See manual import module description for details.
  */
  const [app, otherModule] = useInject('app', 'otherModuleName'， /* ...moreOtherModuleName */);
  const {state, actions, maps} = app;
  return (
    <input
      value={state.name}
      onChange={e => actions.changeName(e.target.value)}
    />
  )
};
export default App; 

```





---
#### <a id='config-lazy-module' style="color: black;">Lazy loading configuration</a>

```js
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
// Lazy loading module
const module1 = () => import('module1');

const otherLazyModules = {
  // module2: () => import('module2');
  // ...
};
// The second parameter is the lazy loading module.
const store = createStore({ app }, { module1, ...otherLazyModules }); // create store instance

// The latter usage is the same as before
```







#### <a id='init-with-state' style="color: black;">createStore initializes state</a>

```jsx


import { createStore } from 'react-natural-store';
const app = {
  state: {
    name: 'tom',
  },
  actions: {
    changeName: newName => ({ name: newName }),
    asyncChangeName: newName => Promise.resolve({ name: newName }),
  },
};
/*
  createStore third parameter
  {
	  [moduleName: ModuleName]: Partial<State>,
  }
*/
const store = createStore(
  { app }, 
  {},
  { 
    app: {name: 'jerry'} // Initialize the state of the app module
  }
);

export default store;


```

---






#### <a id='middleware' style="color: black;">Middleware</a>

```jsx


import { createStore, MiddleWare, Next, Record } from 'react-natural-store';
const app = {
  state: {
    name: 'tom',
  },
  actions: {
    changeName: newName => ({ name: newName }),
    asyncChangeName: newName => Promise.resolve({ name: newName }),
  },
};
/*

Copy the redux middleware,

type Record = {
	moduleName: String,
	actionName: String,
	state: ReturnType<Action>,
}

type Next = (record: Record) => ReturnType<Action>;

middlewareParams: {
	setState: Next, 
	getState: () => State,
};

*/
const LogMiddleware: MiddleWare = (middlewareParams) => (next: Next) => (record: Record) => {
	console.log(`${record.moduleName}: ${record.actionName}`, record.state);
    return next(record); // Should be returned, only then you will have a return value when the page calls the action
    // return middlewareParams.setState(record); // Should be returned, only then you will have a return value when the page calls the action
};
const store = createStore(
  { app }, 
  {},
  {},
  [LogMiddleware, /* ...moreMiddleware */]
);

export default store;


```

---







#### <a id='loading-component' style="color: black;">when loading the module, the configuration of the loading prompt component</a>

```jsx
import { inject } from 'react-natural-store';
// Global configuration
inject.setLoadingComponent(() => <div>loading...</div>);

// Local configuration
inject('app')(App, () => <div>loading</div>);
```

#### <a id='use-store-without-react' style="color: black;">Use store outside of react</a>

```js
// Import the previously created store instance
import store from 'my-store-instance';

/* 
  get app module. 
  Equivalent to the app module obtained in the react component.
  If you want to get a lazy loaded module,
  Then you have to make sure that the module is loaded at this time.
*/
const app = store.getModule('app');
/*
  If you are sure, lazy loading module, not loaded yet
  You can listen to the lazy load module and get it
*/
store.subscribe('lazyModuleName', () => {
  const lazyModule = store.getModule('lazyModuleName');
});
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
  addName: lastName => state.name + lastName,
  }
*/

/*
  When you update the state using the action method here，
  All components injected into the app module will be updated，
  And get the data in the latest app module，
  It is recommended not to abuse
*/
app.actions.changeName('jerry');

// listen module change
const unsubscribe = store.subscribe('app', () => {
  // Here you can get the latest app data
  store.getModule('app');
});

// cancel listen
unsubscribe();
```


#### <a id='manual-import-module' style="color: black;">Manual import module</a>

```ts

// initStore.ts
import { createStore } from 'react-natural-store';

// Lazy load module is not imported when instantiating the store
export default createStore({/*...modules*/});

// ================================================
// lazyloadPage.ts
import { useInject } from 'react-natural-store';
import store from 'initStore.ts'

const lazyLoadModule = {
  state: {
    name: 'tom',
  },
  actions: {
    changeName: newName => ({ name: newName }),
  },
  maps: {
    nameSplit: state => state.name.split(''),
    addName: state => lastName => state.name + lastName,
  },
};
/*
Set modules manually. 
Before this module is added, 
you can't use this module anywhere else. 
If you want to use it elsewhere, 
you must import it when the store is instantiated.
*/
store.setModule('lazyModuleName', lazyLoadModule);

const lazyLoadView = () => {
  // Now you can get the modules you added manually.
  const [{state, maps, actions}] = useInject('lazyModuleName');
  return (
    <div>{state.name}</div>
  )
}


```



#### <a id='typescript' style="color: black;">typescript support</a>

```ts

import React from 'react';
import ReactDOM from 'react-dom';
import {inject, InjectStoreModule} from 'react-natural-store'

type storeProps = {count: InjectStoreModule, name: InjectStoreModule};
type otherProps = {
  className: string,
  style: Object,
}

const App: React.FC<storeProps & otherProps> = (props) => {
  const {state, actions, maps} = props.count;
  return (
    <>
      <button onClick={() => actions.inc(state)}>+</button>
      <span>{state.count}</span>
      <button onClick={() => actions.dec(state)}>-</button>
    </>
  )
}

const IApp = inject<storeProps>('count', 'name')(App);

const app = (
  <IApp className='1' style={{}} />
);
ReactDOM.render(
  app,
  document.querySelector('#app')
);


```



#### <a id='caution' style="color: black;">react-natural-store precautions for use</a>

 - Since the low version does not support the react.forwardRef method, you cannot directly use ref to get the component instance of the package. You need to use the forwardedRef property to get it (using the same ref).

 - Tips in TypeScript may not be so friendly, such as
 ```ts

@inject<storeProps>('count', 'name')
class App extends React.Component {
	// ...
}

// This method of use will report an error, indicating that there is no forwardedRef attribute declaration in the App component.
<App forwardedRef={console.log} />

// The following usage methods will not give an error.
class _App extends React.Component {
	// ...
}
const App = @inject<storeProps>('count', 'name')(_App);
// correct
<App forwardedRef={console.log} />

 ```


- **When the action modifies the state, it should follow the immutable specification**.Starting with version 1.x, the values in maps are dynamically calculated based on changes in dependencies, and the cache is dependent on constants. The principle is to use Object.defineProperty for data hijacking and collect dependencies. So when changing the state, you should use immutable, otherwise maps will not listen to state changes, it will not be recalculated. (Because the immutable specification is followed, the maps listener only listens for changes in the first layer value of the state. If the value of the first layer of the state has not changed, the maps will not be updated.)

- **Please try to avoid dynamically adding or deleting the state key in the action**.In the 1.x version, the first layer attribute of state should be declared in advance. If a new attribute is dynamically added, or an attribute is dynamically deleted, the maps cannot monitor its changes, and the maps cannot be updated in time.


