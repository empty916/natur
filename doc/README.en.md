# natur cook book


- [concept of design](./design.en.md)


## basic introduction
1. This is a simple and efficient react state manager
1. Browser compatible: IE9+
1. support react 15.x, 16.x and anujs
1. Unit test coverage rate of 99%, rest assured to use
1. minizipped size 5k


## Use steps (only two steps)


### The first step is to create a store instance
**This step needs to be completed before rendering the component, because the component wrapped by the inject method depends on the store instance when rendering**

```js
import { createStore } from 'natur';
import { 
  thunkMiddleware,
  promiseMiddleware, 
  shallowEqualMiddleware, 
  fillObjectRestDataMiddleware
  filterUndefinedMiddleware,
} from 'natur/dist/middlewares';

/*
Here the app is considered a module
This is the data structure of a module
*/
const app = {
  // state, used to store data, unlimited data types
  state: {
    name: 'tom',
    todos: [{
      text: 'play game ',
    }],
    games: new Map(['favorite', 'lol'])
  },
  /*
  Optional parameter, which is a mapping of state data, must be an Object, the child elements must be Array <String | Function>, and the last element of the array must be a function.
  The maps obtained on the page will be the function return value after the last function is run
  The maps method needs to manually declare a dependency on state, and the result will only be recalculated when the dependency changes.
  ps: In fact, this should be called mapState. I think the name is too long, so I changed it to maps.
  */
  maps: { 
    // Get the text data of the first element in todoList
    firstTodoText: ['todos[0].text', firstTodoText => firstTodoText],
    /** 
     * This example will only recalculate the results when the todos [0] .text or s.info.get ('favorite') data changes
    */
    deepDep: [
      /*
      For common data types, you can declare dependencies using string paths
      If an error occurs during retrieval, it will automatically return undefined
      */
      'todos[0].text',
      (s: State) => s.info.get('favorite'), // For complex types, you can use functions to declare dependencies
      (firstTodo, favorite) => firstTodo + favorite; // 'play game lol'
    ]
  },
  // actions: used to update state, must be Object, and child elements must be functions
  actions: {
    /*
    The return value will be used as the new state and trigger the view update
    Need to follow the immutable specification! !! !!
    */
    changeName: newName => ({ name: newName }),
    asyncChangeName: newName => Promise.resolve({ name: newName }),
    thunkChangeName: newName => (getState, setState, getMaps) => {
      getState(); // Get the latest state
      setState({name: newName}); // Set state name
      getMaps(); // Get the latest maps
      return {name: newName} // Update state name
    }
  },
};

// Other modules
const otherModules = { 
  //... 
};

// Create a store instance
const store = createStore(
  { app, ...otherModules },
  {},
  undefined,
  [ // This is the recommended middleware configuration, and the order is also required. For details, please see the middleware article.
    thunkMiddleware,
    promiseMiddleware,
    fillObjectRestDataMiddleware,
    shallowEqualMiddleware,
    filterUndefinedMiddleware,
  ],
); 

export default store;
```

---

### The second step is to inject the module into the component

```jsx
import { inject } from 'natur';
const App = ({app, otherModuleName}) => {
  // Get the injected app module
  const {state, actions, maps} = app;
  /*
    The obtained app module
    state: {
      name: 'tom',
      todos: [{
        text: 'play game ',
      }],
      games: new Map(['favorite', 'lol'])
    },
    actions: {
      changeName,
      asyncChangeName,
      thunkChangeName,
    },
    maps: {
      firstTodoText: 'play game',
      deepDep: 'play game lol',
    }
  */
  return (
    <input
      value={state.name} // Data in the app
      onChange={e => actions.changeName(e.target.value)}
    />
  )
};

// Inject the app module in the store;
export default inject('app', 'otherModuleName')(App);   

```  

---


### Alright, you already have it. Here are some additional features.


- [hooks way](#hooks)
- [Configure lazy loading module](#config-lazy-module)
- [When initializing the store, use another state](#init-with-state)
- [Middleware](#middleware)
- [Placement component configuration when lazy loading module is loading](#loading-component)
- [Using natur outside react](#use-store-without-react)
- [Importing modules manually](#manual-import-module)
- [Use in typescript](#typescript)
- [<font color="#faad14">Precautions for use</font>](#caution)




### <a id='hooks' style="color: black;">The second step can be replaced with hooks. UseInject is used to inject the app module into the component.</a>

```jsx

import { useInject } from 'natur';

const App = () => {
  /*
  Note that if there is a lazy loading module in the useInject parameter, the empty array will be returned first.
  Wait until the lazy loading module is loaded before returning the module you need,
  So useInject is not recommended for lazy loading modules

  But you can use the way of adding modules manually
  store.setModule ('otherModuleName', otherModule);
  See manual import module description for details
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

### <a id='config-lazy-module' style="color: black;">Lazy loading module configuration</a>

```js
/*
  module1.js
  export {
    state: {
      count: 1,
    }
    actions: {
      inc: state => ({count: state.count + 1}),
    }
  }
  
*/
const otherLazyModules = {
  // module2: () => import('module2');
  // ...
}
const module1 = () => import('module1'); // Lazy loading module

// Create a store instance
// The second parameter is the lazy loaded module;
const store = createStore(
  { app }, 
  { module1, ...otherLazyModules }
);

// Then the usage is equivalent to the second step
```



### <a id="init-with-state" style="color: black;">createStore initialization state</a>

```jsx


import { createStore } from 'natur';
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
    [moduleName: ModuleName]: Require<State>,
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



### <a id='middleware' style="color: black;">MiddleWare</a>

```jsx


import { createStore, MiddleWare, Next, Record } from 'natur';
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

type Record = {
  moduleName: String,
  actionName: String,
  state: ReturnType<Action>,
}

type Next = (record: Record) => ReturnType<Action>;

middlewareParams: {
  setState: Next, 
  getState: () => State,
  getMaps: () => InjectMaps
};

*/
const LogMiddleware: MiddleWare = (middlewareParams) => (next: Next) => (record: Record) => {
  console.log(`${record.moduleName}: ${record.actionName}`, record.state);
  return next(record); // You should return, only then will you have a return value when the page calls the action
  // return middlewareParams.setState(record); // You should return, only then will you have a return value when the page calls the action
const store = createStore(
  { app }, 
  {},
  {},
  [LogMiddleware, /* ...moreMiddleware */]
);

export default store;


```

#### Built-in middleware description

- thunkMiddleware: Due to the runtime closure problem within the component, the latest state cannot be obtained, so all this middleware exists

```typescript

import { thunkMiddleware } from 'natur/dist/middlewares'

const actionExample = (myParams: any) => (getState, setState: (s: State) => State, getMaps: () => InjectMaps) => {
  const currentState = getState(); // Latest state
  const currentMaps = getMaps(); // Latest maps
  setState(currentState); // Update state
}
```

- promiseMiddleware: action supports asynchronous operations
```typescript
const action1 = () => Promise.resolve(2333);
const action2 = async () => await new Promise(res => res(2333));
```

- fillObjectRestDataMiddleware: Automatically fill the child state of the child elements that are not returned by other actions, only valid when the state is an object
```typescript

const state = {a: 1, b:2};
const action = () => ({a: 11})// Call this action, the final state is {a: 11, b: 2}, this middleware requires that the data returned by the state and action must be ordinary objects
```


- shallowEqualMiddleware：Shallow comparison optimization middleware, limited to the state of ordinary objects
```typescript

const state = {a: 1, b:2};
const action = () => ({a: 1, b:2}) // Same as the old state, do not update the view
```

- filterUndefinedMiddleware: Filter actions that return undefined
```typescript
const action = () => undefined; // The return of this action will not be used as the new state
```


- devtool

```typescript

// redux.devtool.middleware.ts
import { Middleware } from 'natur';
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

**Note: The order of middleware configuration is important**

```typescript

import {createStore} from 'natur';
import { 
  thunkMiddleware,
  promiseMiddleware, 
  fillObjectRestDataMiddleware,
  shallowEqualMiddleware, 
  filterUndefinedMiddleware,
} from 'natur/dist/middlewares';
import devTool from 'redux.devtool.middleware';

const store = createStore(
  modules,
  {},
  undefined,
  [
    thunkMiddleware, // Action supports returning functions and getting the latest data
    promiseMiddleware, // action supports asynchronous operations
    fillObjectRestDataMiddleware, // Fill unreturned child elements by default
    shallowEqualMiddleware, // Shallow contrast optimization between old and new state
    filterUndefinedMiddleware, // Filter actions with no return value
    devTool,
  ],
);
```


---


### <a id='loading-component' style="color: black;">Placeholder component configuration when loading</a>

```jsx
import { inject } from 'natur';
// Global configuration
inject.setLoadingComponent(() => <div>loading...</div>);

// Local use
inject('app')(App, () => <div>loading</div>);
```


### <a id='use-store-without-react' style="color: black;">Use natur outside react</a>

```js
// Store instance created before
import store from 'my-store-instance';

/*
  Get the registered app module, which is equivalent to the app module obtained in the react component
  If you want to get lazy loaded modules,
  Then you have to make sure that the module is already loaded at this time
*/
const app = store.getModule('app');
/*
  If you are sure, lazy load the module, not loaded yet
  You can listen for lazy loading modules and get
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
  When you use the action method to update the state here,
  All components injected into the app module will be updated,
  And get the data in the latest app module,
  Advised not to abuse
*/
app.actions.changeName('jerry');


// Monitoring module changes
const unsubscribe = store.subscribe('app', () => {
  // Here you can get the latest app data
  store.getModule('app');
});


// Cancel listening
unsubscribe();

```


### <a id='manual-import-module' style="color: black;">Importing modules manually</a>

```ts

// initStore.ts
import { createStore } from 'natur';

// When instantiating the store, no lazy loading module was imported
export default createStore({/*...modules*/});

// ================================================
// lazyloadPage.ts This is a lazy loaded page
import { useInject } from 'natur';
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
Add the module manually, it cannot be used anywhere else until it is added
To use it elsewhere, it must be imported when the store is instantiated
*/
store.setModule('lazyModuleName', lazyLoadModule);

const lazyLoadView = () => {
  // Now you can get manually added modules
  const [{state, maps, actions}] = useInject('lazyModuleName');
  return (
    <div>{state.name}</div>
  )
}


```

### <a id='typescript' style="color: black;">typescript support</a>
```ts

import React from 'react';
import ReactDOM from 'react-dom';
import {inject, InjectStoreModule} from 'natur'

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


### <a id='caution' style="color: black;">Precautions for use</a>

 - Because the lower version does not support the react.forwardRef method, you cannot directly use the ref to obtain the wrapped component instance. You need to use the forwardedRef property to obtain it (the usage is the same as ref).

 - Tips in TypeScript may be less friendly, like
 ```ts

@inject<storeProps>('count', 'name')
class App extends React.Component {
  // ...
}

// This usage method will report an error, indicating that there is no forwardedRef attribute declaration in the App component
<App forwardedRef={console.log} />

// The following usage methods will not report an error
class _App extends React.Component {
  // ...
}
const App = @inject<storeProps>('count', 'name')(_App);
// 正确
<App forwardedRef={console.log} />

 ```
- **To modify state in actions, you need to follow the immutable specification**
