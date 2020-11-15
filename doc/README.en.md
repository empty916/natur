# natur cook book


- [concept of design](./design.en.md)


## basic introduction
1. This is a simple and efficient react state manager
1. Good typescript experience
1. Browser compatible: IE8+
1. support react 15.x, 16.x and anujs
1. Unit test coverage rate of 99%, rest assured to use
1. minizipped size 5k



## directory

- [start](#start)
- [simple demo](#simple-demo)
- [detailed module](#module)
- [complex demo](#complex-demo)
- [The component only listens to changes in some data](#partial-listener)
- [config lazy module](#config-lazy-module)
- [init state](#init-with-state)
- [middleware](#middleware)
- [complex business scenarios of cross-module interaction](#complex-business-scenarios-of-cross-module-interaction)
- [set loading component](#loading-component)
- [use natur without react](#use-store-without-react)
- [dispatch](#dispatch)
- [manual import module](#manual-import-module)
- [typescript](#typescript)
- [caution](#caution)
- [plugins](#plugins)
- [api](#api)
  - [createStore](#CreateStore)
  - [store api](#store.api)
    - [getModule](#store.getModule)
    - [setModule](#store.setModule)
    - [removeModule](#store.removeModule)
    - [setLazyModule](#store.setLazyModule)
    - [removeLazyModule](#store.removeLazyModule)
    - [hasModule](#store.hasModule)
    - [loadModule](#store.loadModule)
    - [getOriginModule](#store.getOriginModule)
    - [getLazyModule](#store.getLazyModule)
    - [subscribe](#store.subscribe)
    - [getAllModuleName](#store.getAllModuleName)
    - [dispatch](#store.dispatch)
    - [destory](#store.destory)
    - [globalSetStates](#store.globalSetStates)
    - [globalResetStates](#store.globalResetStates)
  - [inject api](#inject.api)
    - [createInject](#inject.createInject)
    - [inject](#inject.self)


## <a id='start'>start</a>

1. Open your react project
1. install **natur**
  ````node
  yarn add natur
  // npm install natur -S
  ````


## <a id='simple-demo'>simple demo</a>

[codesandbox](https://codesandbox.io/s/natur-2x-simple-demo-nx0pp?file=/src/App.tsx)

````tsx

// index.tsx
import { createStore, createInject } from 'natur';
import React, { useEffect } from "react";
import ReactDOM from "react-dom";

const count = {
  state: { // Store data
    number: 0,
  },
  maps: { // State mapping. For example, I need to know if the number in the state is even
    isEven: ['number', number => number % 2 === 0],
  },
  actions: { // Used to modify state. The returned data will be used as the new state (this part is done internally by natur)
    inc: number => ({number: number + 1}),
    dec: number => ({number: number - 1}),
  }
}

// The step of creating the store needs to be completed before rendering the component, because in the component, you need to use the store you created
const store = createStore({count});
const inject = createInject({storeGetter: () => store});

const injector = inject('count');


const App = ({count}: typeof injector.type) => {
  return (
    <>
      <button onClick={() => count.actions.dec(count.state.number)}>-</button>
      <span>{count.state.number}</span>
      <button onClick={() => count.actions.inc(count.state.number)}>+</button>
    </>
  )
};
// Inject the count module
// Inject the count module
// Inject the count module
const IApp = injector(App);

// Render the injected component
ReactDOM.render(<IApp />, document.querySelector('#app'));

````


## <a id='module'>Detailed module</a>

**A module consists of state, maps, actions**

### state


````typescript
type State = any;
````

1. Required parameters
2. state is used to store data
3. state itself does not limit the data type, you can use a three-party library such as**immutablejs**

### maps


````typescript

type Maps = {
  [map: string]: Array<string|Function> | Function;
}

const demo = {
  state: {
    number: 1,
  },
  maps: {
    // The elements in front of the array are all declaring the dependency of this map on state. The last function can get the previously declared dependencies. You can implement what you want in it.
    isEven: ['number', number => number % 2 === 0],
    // You can also declare dependencies as functions, which is useful for complex types of state
    isEven2: [state => state.number, number => number % 2 === 0],
    // It can also be a function that directly depends on the entire state. The disadvantage is that the function will be re-executed as long as the state is updated, and there is no cache.
    isEven3: ({number}) => number % 2 === 0,
    // It can also be a function, no dependencies, only executed once
    isTrue: () => true,
  },
  // ...actions
}
````
1. maps is an optional parameter, and maps itself must be an ordinary object
1. maps is a map of state data, and its child elements must be an array. Let's call it map for now.
1. If the map is an array, the preceding elements are all declaring the dependency of this map on the state. The last function can get the dependency declared earlier, and you can implement what you want in it. On the page, you can get the result of the last function of the array.
1. If the map is a function, then it can only accept state as an input parameter, or there is no parameter. If it is a state as a parameter, then when the state is updated, the map must be re-executed and there is no cache. If the map has no parameters, then this map will only be executed once
1. The results of maps are cached. If the value of the dependencies you declare does not change, the last function will not be re-executed.
1. In fact, this should be called mapState. I think the name is too long, so I changed it to maps.




### actions


````typescript

type Actions = {
  [action: string]: (...arg: any[]) => any;
}

const demo = {
  state: {
    number: 1,
  },
  // Actions are used to modify the state. The data it returns will be used as the new state (this part is done internally by natur)
  actions: { 
    inc: number => ({number: number + 1}),
    dec: number => ({number: number - 1}),
  }
}
````

1. actions is a parameter that must be passed in, it must be a common object itself
2. The child elements of actions must be functions. If no middleware is set, any data it returns will be used as the new state, and the react components using this module will be notified to update, which is done inside natur.
3. actions must follow the immutable specification!



## <a id='complex-demo'>complex demo</a>

[codesandbox](https://codesandbox.io/s/natur-2x-complex-demo-jyut0?file=/src/store.ts)

### The first step is to create a store instance

```js

import { createStore, createInject } from "natur";

// 这是natur内置常用的中间件, 推荐使用
import {
  thunkMiddleware,
  promiseMiddleware,
  shallowEqualMiddleware,
  fillObjectRestDataMiddleware,
  filterUndefinedMiddleware
} from "natur/dist/middlewares";
import devtool from "./redux.devtool.middleware.js";

const app = {
  state: {
    name: "tom",
    todos: [
      {
        text: "play game "
      }
    ],
    games: new Map([["favorite", "lol"]])
  },
  maps: {
    firstTodoText: ["todos[0].text", firstTodoText => firstTodoText],
    deepDep: [
      "todos[0].text",
      s => s.games.get("favorite"),
      (firstTodo, favorite) => firstTodo + favorite
    ]
  },
  actions: {
    changeName: newName => ({ name: newName }),
    asyncChangeName: newName => Promise.resolve({ name: newName }),
    thunkChangeName: newName => ({ getState, setState, getMaps }) => {
      getState(); // 获取当前最新的state
      setState({ name: newName }); // 设置state的name
      getMaps(); // 获取当前最新的maps
      return { name: newName + "1" }; // 更新state的name
    }
  }
};

// 其他的模块
const otherModules = {
  //...
};

// 创建store实例
const store = createStore({ app, ...otherModules }, {}, {
  middlewares: [
    // 这个是推荐的中间件配置，顺序也有要求，详细请查看中间件篇
    thunkMiddleware,
    promiseMiddleware,
    fillObjectRestDataMiddleware,
    shallowEqualMiddleware,
    filterUndefinedMiddleware,
    devtool
  ]
});
export const inject = createInject({
  storeGetter: () => store,
})
export default store;

```

---

### The second step is to inject the module into the component

```jsx
import { inject } from "your-inject";

const injector = inject('app', 'otherModuleName');

const App = ({app, otherModuleName}: typeof injector.type) => {
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
export default injector(App);   

```  

**Alright, you already have it. Here are some additional features.**

---



## <a id='partial-listener'>The component only listens to changes in some data</a>

```jsx
import { inject } from 'your-inject';


// Here the App component will only listen to changes in the name of the app and state. Changes in other values will not cause updates to the App component
let injector = inject(
  ['app', {
    state: ['name'], // You can also use function declarations state: [s => s.name]
  }]
); 


// Here the App component only listens to changes in the app and the map's deepDep. Changes in other values will not cause updates to the App component
injector = inject(
  ['app', {
    maps: ['deepDep'], 
  }]
)(App); 

// Here the App component will not be updated regardless of any changes in the app module
injector = inject(
  ['app', {}]
)(App); 

// Because actions stay the same after they are created, you don't have to listen for changes

const App = ({app}: typeof injector.type) => {
  // get app module
  const {state, actions, maps} = app;
  return (
    <input
      value={state.name} // state in app
      onChange={e => actions.changeName(e.target.value)}
    />
  )
};

```  

---

### <a id='config-lazy-module'>Lazy loading module configuration</a>

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



### <a id="init-with-state">initialization state</a>

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
    initStates: {
      app: {name: 'jerry'} // Initialize the state of the app module
    }
  }
);

export default store;


```

---



### <a id='middleware'>MiddleWare</a>

```jsx


import { createStore, MiddleWare, MiddlewareNext, MiddlewareActionRecord } from 'natur';
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

type MiddlewareActionRecord = {
  moduleName: String,
  actionName: String,
  state: ReturnType<Action>,
}

type MiddlewareNext = (record: MiddlewareActionRecord) => ReturnType<Action>;

middlewareParams: {
  setState: MiddlewareNext, 
  getState: () => State,
  getMaps: () => InjectMaps,
  dispatch: (action, ...arg: any[]) => ReturnType<Action>,
};

*/
const LogMiddleware: MiddleWare = (middlewareParams) => (next: MiddlewareNext) => (record: MiddlewareActionRecord) => {
  console.log(`${record.moduleName}: ${record.actionName}`, record.state);
  return next(record); // You should return, only then will you have a return value when the page calls the action
  // return middlewareParams.setState(record); // You should return, only then will you have a return value when the page calls the action
const store = createStore(
  { app }, 
  {},
  {
    middlewares:[LogMiddleware, /* ...moreMiddleware */]
  },
  
);

export default store;


```

#### Built-in middleware description

- thunkMiddleware: Due to the runtime closure problem within the component, the latest state cannot be obtained, so all this middleware exists

```typescript

import { thunkMiddleware } from 'natur/dist/middlewares'

const actionExample = (myParams: any) => ({
  getState, 
  setState: (s: State) => State, 
  getMaps: () => InjectMaps,
  dispatch,
}) => {
  const currentState = getState(); // Latest state
  const currentMaps = getMaps(); // Latest maps
  // dispatch('otherActionNameOfThisModule', ...params)
  // dispatch('otherModuleName/otherActionNameOfOtherModule', ...params);
  setState(currentState); // Update state
  return currentState; // Update state too
}
```

- promiseMiddleware: action supports asynchronous operations
```typescript
const action1 = () => Promise.resolve(2333);
const action2 = async () => await new Promise(res => res(2333));
```

- fillObjectRestDataMiddleware: Incremental state update / overwrite update, only valid when state is an object
```typescript

const state = {a: 1, b:2};
const action = () => ({a: 11})// Call this action, the final state is {a: 11, b: 2}, this middleware requires that the data returned by the state and action must be ordinary objects
```


- shallowEqualMiddleware：Shallow comparison optimization middleware, limited to the state of ordinary objects
```typescript

const state = {a: 1, b:2};
const action = () => ({a: 1, b:2}) // Same as the old state, do not update the view
```

- filterUndefinedMiddleware: Interceptor actions that return undefined
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
    return ({getState}) => next => record => {
      store.dispatch({
        type: `${record.moduleName}/${record.actionName}`,
        state: {
          [record.moduleName]: record.state || getState(),
        },
      });
      return next(record);
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
  {
    middlewares: [
      thunkMiddleware, // Action supports returning functions and getting the latest data
      promiseMiddleware, // action supports asynchronous operations
      fillObjectRestDataMiddleware, // Incremental state update / overwrite update
      shallowEqualMiddleware, // Shallow contrast optimization between old and new state
      filterUndefinedMiddleware, // Interceptor actions with no return value
      devTool,
    ]
  },
);
```


## <a id='complex-business-scenarios-of-cross-module-interaction'>complex business scenarios of cross-module interaction</a>

> In complex business scenarios, there are usually scenarios where multiple modules monitor and call each other, so for this scenario, you can use [natur-service](https://www.npmjs.com/package/natur-service) Non-intrusive solution, you can monitor any changes in the module, and non-invasive development of complex business logic, while retaining the simplicity and maintainability of each module.

---


### <a id='loading-component'>Placeholder component configuration when loading</a>

```jsx
import { createInject } from 'natur';
// Global configuration
const inject = createInject({
  storeGetter: () => store,
  loadingComponent: () => <div>loading...</div>,
})
// Local use
inject('app')(App, () => <div>loading</div>);
```


### <a id='use-store-without-react'>Use natur outside react</a>

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
// Equivalent to
store.dispatch('app', 'changeName', 'jerry');

// Monitoring module changes
const unsubscribe = store.subscribe('app', () => {
  // Here you can get the latest app data
  store.getModule('app');
});


// Cancel listening
unsubscribe();

```



## <a id='dispatch'>dispatch</a>

````typescript
import { createStore, inject, InjectStoreModule } from 'natur';

const count = {
  state: {
    number: 0,
  },
  maps: {
    isEven: ['number', number => number % 2 === 0],
  },
  actions: {
    inc: number => ({number: number + 1}),
    dec: number => ({number: number - 1}),
  }
}

const store = createStore({count});

const {actions, state} = store.getModule('count')

actions.inc(state.number);
// Equivalent to
store.dispatch('count', 'inc', state.number);

````

### <a id='manual-import-module'>Importing modules manually</a>

```ts

// initStore.ts
import { createStore } from 'natur';

// When instantiating the store, no lazy loading module was imported
export default createStore({/*...modules*/});

// ================================================
// lazyloadPage.ts This is a lazy loaded page
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
  const {state, maps, actions} = store.getModule('lazyModuleName');
  return (
    <div>{state.name}</div>
  )
}


```

### <a id='typescript'>typescript support</a>

### base usage
```ts

import React from 'react';
import ReactDOM from 'react-dom';
import inject from 'your-inject'
import {ModuleType} from 'natur';

const count = {
  state: { // 存放数据
    number: 0,
  },
  maps: { // state的映射。比如，我需要知道state中的number是否是偶数
    isEven: ['number', number => number % 2 === 0],
  },
  actions: { // 用来修改state。返回的数据会作为新的state(这部分由natur内部完成)
    inc: number => ({number: number + 1}),
    dec: number => ({number: number - 1}),
  }
}

// Generate the type obtained by the count module in the component
type InjectCountType = ModuleType<typeof count>;

const injector = inject('count');

type otherProps = {
  className: string,
  style: Object,
}

const App: React.FC<typeof injector.type & otherProps> = (props) => {
  const {state, actions, maps} = props.count;
  return (
    <>
      <button onClick={() => actions.inc(state)}>+</button>
      <span>{state.count}</span>
      <button onClick={() => actions.dec(state)}>-</button>
    </>
  )
}

const IApp = injector(App);

const app = (
  <IApp className='1' style={{}} />
);
ReactDOM.render(
  app,
  document.querySelector('#app')
);


```


### Redefine store type

````ts
import {Store, createStore} from 'natur';

const count = {
  /* ... */
}

const lazyModule1 = () => import(/* ... */);

const allSyncModules = {
  count,
  /* and others */
}
const allAsyncModules = {
  lazyModule1,
  /* and others */
}

const store = createStore(allSyncModules, allAsyncModules);

type StoreInsType = Store<typeof allSyncModules, typeof allAsyncModules>;

// The type of StoreInsType is the type of store, you can extend your type

````


### <a id='caution'>Precautions for use</a>

 - Because the lower version does not support the react.forwardRef method, you cannot directly use the ref to obtain the wrapped component instance. You need to use the forwardedRef property to obtain it (the usage is the same as ref).

 - Tips in TypeScript may be less friendly, like
 ```ts

@inject('count', 'name')
class App extends React.Component {
  // ...
}

// This usage method will report an error, indicating that there is no forwardedRef attribute declaration in the App component
<App forwardedRef={console.log} />

// The following usage methods will not report an error
class _App extends React.Component {
  // ...
}
const App = inject('count', 'name')(_App);
// 正确
<App forwardedRef={console.log} />

 ```
- **To modify state in actions, you need to follow the immutable specification**


## <a id='plugins'>plugins</a>

- [natur-service: natur upper scheduling library](https://www.npmjs.com/package/natur-service)
- [natur-persist: localStorage plugins](https://www.npmjs.com/package/natur-persist)
- [natur-persist-async: async presit plugin](https://www.npmjs.com/package/natur-persist-async)

## <a id='api'>api</a>

### <a id='CreateStore'>createStore</a>

````typescript
createStore(
  modules?: Modules,
  lazyModules?: LazyStoreModules,
  options?: {
    initStates?: States,
    middlewares?: Middleware[],
    interceptors?: Interceptor[],
  }
) => Store;
````
### <a id='store.api'>store api</a>

#### <a id='store.getModule'>getModule</a>

````typescript
store.getModule('moduleName') => InjectStoreModule
````

#### <a id='store.setModule'>setModule</a>

````typescript
store.setModule('moduleName', StoreModule) => Store;
````

#### <a id='store.removeModule'>removeModule</a>

````typescript
store.removeModule('moduleName') => Store;
````


#### <a id='store.setLazyModule'>setLazyModule init/set lazy module</a>

````typescript
store.setLazyModule('moduleName', () => Promise<StoreModule>) => Store;
````

#### <a id='store.removeLazyModule'>removeLazyModule remove lazy module</a>

````typescript
store.removeLazyModule('moduleName') => Store;
````


#### <a id='store.hasModule'>hasModule</a>

````typescript
store.hasModule('moduleName') => boolean;
````

#### <a id='store.loadModule'>loadModule: load lazy module</a>

If the module is already loaded, return the already loaded module
````typescript
store.loadModule('moduleName') => Promise<InjectStoreModule>;
````


#### <a id='store.getOriginModule'>getOriginModule</a>

````typescript
store.getOriginModule('moduleName') => StoreModule;
````

#### <a id='store.getLazyModule'>getLazyModule: getLazyModule import function</a>

````typescript
store.getLazyModule('moduleName') => () => Promise<StoreModule>;
````


#### <a id='store.subscribe'>subscribe: listen module change</a>

````typescript
export type ModuleEvent = {
  type: 'init' | 'update' | 'remove',
  actionName?: string,
};

export interface Listener {
  (me: ModuleEvent): any;
}

store.subscribe('moduleName', listener: Listener) => Function;
````

#### <a id='store.getAllModuleName'>getAllModuleName</a>

````typescript
store.getAllModuleName('moduleName') => string[];
````


#### <a id='store.dispatch'>dispatch: run action</a>

````typescript
store.dispatch(moduleName, actionName, ...actionArg: any[]) => ReturnType<Action>;
````

#### <a id='store.destory'>destory 销毁store</a>

````typescript
store.destory() => void;
````


#### <a id='store.globalSetStates'>globalSetStates</a>

````typescript
// Manually set all state, incoming module name, and corresponding state, it will be updated, and push notification
store.globalSetStates({
  [mn: moduleName]: State;
})
````


#### <a id='store.globalResetStates'>globalResetStates</a>

````typescript
// Use store to initialize the state of all modules and push notifications
// You can pass, exclude, include to filter modules that do not need to be initialized, exclude is higher than include
store.globalResetStates({
  exclude: Arrary<string|RegExp>;
  include: Arrary<string|RegExp>,
})
````


### <a id='inject.api'>inject api</a>


#### <a id='inject.createInject'>createInject</a>

````typescript
createInject({
  storeGetter: () => Store,
  loadingComponent: React.ComponentClass<{}> | React.FC<{}>
})

````


#### <a id='inject.self'>inject</a>

````typescript

type ModuleDepDec = [string, {
  state?: Array<string|Function>;
  maps?: Array<string>;
}]
type TReactComponent<P> = React.FC<P> | React.ComponentClass<P>;

type StoreProps = {[m: string]: InjectStoreModule}

inject<T extends StoreProps>(...moduleDec: Array<string|ModuleDepDec>) 
=> <P extends T>(
  WrappedComponent: TReactComponent<P>, 
  LoadingComponent?: TReactComponent<{}>
) => React.ComponentClass<Omit<P, keyof T> & { forwardedRef?: React.Ref<any> }>

````
