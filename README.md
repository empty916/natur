# natur 使用手册

[English doc](./doc/README.en.md)

- [设计图](./doc/design.md)


## 基本介绍

1. 这是一个简洁、高效的react状态管理器
1. 浏览器兼容：IE8+
1. 支持react 15.x, 16.x, 以及anujs
1. 单元测试覆盖率99％，放心使用
1. 包体积，minizip 5k(uglify+gzip压缩后5k)


## 目录

- [起步](#start)
- [简单示例](#simple-demo)
- [module详解](#module)
- [复杂的例子](#complex-demo)
- [组件只监听部分数据的变更](#partial-listener)
- [hooks方式](#hooks)
- [配置懒加载模块](#config-lazy-module)
- [初始化state](#init-with-state)
- [中间件](#middleware)
- [懒加载模块，加载中，占位组件配置](#loading-component)
- [在react外使用natur](#use-store-without-react)
- [手动导入模块](#manual-import-module)
- [dispatch](#dispatch)
- [在typescript中使用](#typescript)
- [使用注意事项](#caution)


## <a id='start'>起步</a>

1. 打开你的react项目
1. 安装**natur**
  ````node
  yarn add natur
  // npm install natur -S
  ````


## <a id='simple-demo'>简单的示例</a>

[在线体验](https://codesandbox.io/embed/natur-demo-t12n7?fontsize=14&hidenavigation=1&theme=dark)
````tsx

// index.tsx
import { createStore, inject, InjectStoreModule } from 'natur';
import React, { useEffect } from "react";
import ReactDOM from "react-dom";

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

// 创建store这一步需要在渲染组件之前完成，因为在组件中，需要用到你创建的store
createStore({count});


const App = ({count}) => {
  return (
    <>
      <button onClick={() => count.actions.dec(count.state.number)}>-</button>
      <span>{count.state.number}</span>
      <button onClick={() => count.actions.inc(count.state.number)}>+</button>
    </>
  )
};
// 注入count模块
// 注入count模块
// 注入count模块
const IApp = inject<{count: InjectStoreModule}>('count')(App);

// 渲染注入后的组件
ReactDOM.render(<IApp />, document.querySelector('#app'));

````


## <a id='module'>module详解</a>

**一个模块由state, maps, actions构成**

### state


````typescript
type State = any;
````

1. 必须传入的参数
2. state用来存储数据
3. state本身不限制数据类型，你可以使用三方库比如**immutablejs**

### maps


````typescript

type Maps = {
  [map: string]: Array<string|Function>;
}

const demo = {
  state: {
    number: 1,
  },
  maps: {
    // 数组前面的元素，都是在声明此map对state的依赖项，最后一个函数可以获取前面声明的依赖，你可以在里面实现你想要的东西
    isEven: ['number', number => number % 2 === 0],
    // 你也可以通过函数的方式声明依赖项，这对于复杂类型的state很有用
    isEven2: [state => state.number, number => number % 2 === 0],
  },
  // ...actions
}
````
1. maps是可选的参数，maps本身必须是一个普通对象
2. maps是state数据的映射，它的子元素必须是一个数组，我们暂且称其为map
3. 在map中，前面的元素都是在声明此map对state的依赖项。最后一个函数可以获取前面声明的依赖，你可以在里面实现你想要的东西。在页面中，你可以获取数组最后一个函数运行的结果。
4. maps的结果是有缓存的，如果你声明的依赖项的值没有变化，那么最后一个函数便不会重新执行
5. 其实这个应该叫mapState，我嫌名字太长，就改成了maps




### actions


````typescript

type Actions = {
  [action: string]: (...arg: any[]) => any;
}

const demo = {
  state: {
    number: 1,
  },
  // actions用来修改state。它返回的数据会作为新的state(这部分由natur内部完成)
  actions: { 
    inc: number => ({number: number + 1}),
    dec: number => ({number: number - 1}),
  }
}
````

1. actions是必须传入的参数，它本身必须是个普通对象
2. actions的子元素必须是函数，如果不设置中间件，那么它返回的任何数据都会作为新的state，并通知使用此模块的react组件更新，这是在natur内部完成的。
3. actions必须遵照immutable规范！

## <a id='complex-demo'>复杂的例子</a>

### 创建 store 实例

```js
import { createStore, State } from 'natur';

// 这是natur内置常用的中间件, 推荐使用
import { 
  thunkMiddleware,
  promiseMiddleware, 
  shallowEqualMiddleware, 
  fillObjectRestDataMiddleware
  filterUndefinedMiddleware,
} from 'natur/dist/middlewares';

const app = {
  state: {
    name: 'tom',
    todos: [{
      text: 'play game ',
    }],
    games: new Map(['favorite', 'lol'])
  },
  maps: { 
    firstTodoText: ['todos[0].text', firstTodoText => firstTodoText],
    deepDep: [
      'todos[0].text',
      (s: State) => s.info.get('favorite'),
      (firstTodo, favorite) => firstTodo + favorite;
    ]
  },
  actions: {
    changeName: newName => ({ name: newName }),
    asyncChangeName: newName => Promise.resolve({ name: newName }),
    thunkChangeName: newName => (getState, setState, getMaps) => {
      getState(); // 获取当前最新的state
      setState({name: newName}); // 设置state的name
      getMaps(); // 获取当前最新的maps
      return setState({name: newName + newName}) // 更新state的name
    }
  },
};

// 其他的模块
const otherModules = { 
  //... 
};

// 创建store实例
const store = createStore(
  { app, ...otherModules },
  {},
  undefined,
  [ // 这个是推荐的中间件配置，顺序也有要求，详细请查看中间件篇
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

### 使用 inject 将模块注入组件当中

```jsx
import { inject } from 'natur';
const App = ({app, otherModuleName}) => {
  // 获取注入的app模块
  const {state, actions, maps} = app;
  /*
    获取到的 app模块
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
      value={state.name} // app中的数据
      onChange={e => actions.changeName(e.target.value)}
    />
  )
};

// 注入store中的app模块；
export default inject('app', 'otherModuleName')(App);   

```  

---



## <a id='partial-listener'>组件只监听部分数据的变更</a>

```jsx
import { inject } from 'natur';
const App = ({app}) => {
  // 获取注入的app模块
  const {state, actions, maps} = app;
  return (
    <input
      value={state.name} // app中的数据
      onChange={e => actions.changeName(e.target.value)}
    />
  )
};

// 这里App组件只会监听app，state中name的变化，其他值的变化不会引起App组件的更新
export default inject(
  ['app', {
    state: ['name'], // 也可以使用函数声明 state: [s => s.name]
  }]
)(App); 


// 这里App组件只会监听app，maps中deepDep的变化，其他值的变化不会引起App组件的更新
inject(
  ['app', {
    maps: ['deepDep'], 
  }]
)(App); 

// 这里App组件不论app模块发生什么变化，都不会更新
inject(
  ['app', {}]
)(App); 

// 因为actions在创建后会保持不变，所以你不必监听它的变化


// 此功能不适用于hooks，因为hooks没有shouldComponentUpdate开关控制组件更新，
```  


## <a id='hooks'>hooks方式</a>

```jsx

import { useInject } from 'natur';

const App = () => {
  /*
  注意，如果useInject参数中，存在懒加载模块，则会先返回空的数组，
  等到懒加载模块加载完成才会返回你需要的模块，
  所以useInject不建议使用于懒加载模块

  但是你可以使用手动添加模块的的方式
  store.setModule('otherModuleName', otherModule);
  详情见手动导入模块说明
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

## <a id='config-lazy-module'>懒加载模块配置</a>

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
const module1 = () => import('module1'); // 懒加载模块

// 创建store实例
// 第二参数就是懒加载的模块；
const store = createStore(
  { app }, 
  { module1, ...otherLazyModules }
);

// 然后用法等同于第二步
```



## <a id="init-with-state">初始化state</a>

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
  createStore第三个参数
  {
    [moduleName: ModuleName]: Require<State>,
  }
*/
const store = createStore(
  { app }, 
  {},
  { 
    app: {name: 'jerry'} // 初始化app 模块的state
  }
);

export default store;


```

---



## <a id='middleware'>中间件</a>

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
  getMaps: () => InjectMaps,
  dispatch: (action, ...arg: any[]) => ReturnType<Action>,
};

*/
const LogMiddleware: MiddleWare = (middlewareParams) => (next: Next) => (record: Record) => {
  console.log(`${record.moduleName}: ${record.actionName}`, record.state);
  return next(record); // 你应该return, 只有这样你在页面调用action的时候才会有返回值
  // return middlewareParams.setState(record); // 你应该return，只有这样你在页面调用action的时候才会有返回值
};
const store = createStore(
  { app }, 
  {},
  {},
  [LogMiddleware, /* ...moreMiddleware */]
);

export default store;


```

### 内置中间件说明

- thunkMiddleware: 因为组件内运行时闭包问题，拿不到最新state, 所有有此中间件存在

```typescript

import { thunkMiddleware } from 'natur/dist/middlewares'

const actionExample = (myParams: any) => ({getState, setState: (s: State) => State, getMaps: () => InjectMaps, dispatch}) => {
  const currentState = getState(); // 最新的state
  const currentMaps = getMaps(); // 最新的maps
  // dispatch('otherActionNameOfThisModule', ...params)
  // dispatch('otherModuleName/otherActionNameOfOtherModule', ...params);
  setState(currentState); // 更新state
  return true; // 返回值会返回给调用者true值，不会用作新的state
}
```

- promiseMiddleware: action支持异步操作
```typescript

// promiseMiddleware
const action1 = () => Promise.resolve(2333);
const action2 = async () => await new Promise(res => res(2333));
```

- fillObjectRestDataMiddleware: state增量更新/覆盖更新，state是对象时才有效
```typescript

const state = {a: 1, b:2};
const action = () => ({a: 11})// 调用此action，最后的state是{a: 11, b:2}， 此中间件要求，state和action返回的数据必须都是普通对象
```


- shallowEqualMiddleware：浅层比较优化中间件，仅限于普通对象的state
```typescript

const state = {a: 1, b:2};
const action = () => ({a: 1, b:2}) // 与旧的state相同，不做更新视图
```

- filterUndefinedMiddleware: 过滤返回undefined的action操作
```typescript
const action = () => undefined; // 这种action的返回不会作为新的state
```


- devtool：开发调试工具

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

- 推荐的中间件配置

**注意：中间件配置的先后顺序很重要**

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
    thunkMiddleware, // action支持返回函数，并获取最新数据
    promiseMiddleware, // action支持异步操作
    fillObjectRestDataMiddleware, // 增量更新/覆盖更新
    shallowEqualMiddleware, // 新旧state浅层对比优化
    filterUndefinedMiddleware, // 过滤无返回值的action
    devTool, // 开发工具
  ],
);
```


---


## <a id='loading-component'>加载时候的占位组件配置</a>

```jsx
import { inject } from 'natur';
// 全局配置
inject.setLoadingComponent(() => <div>loading...</div>);

// 局部使用
inject('app')(App, () => <div>loading</div>);
```


## <a id='use-store-without-react'>在react之外使用natur</a>

```js
// 引入之前创建的store实例
import store from 'my-store-instance';

/*
  获取注册的app模块, 等同于在react组件中获取的app模块
  如果你想要获取懒加载的模块，
  那么你必须确定，这个时候该模块已经加载好了
*/
const app = store.getModule('app');
/*
  如果你确定，懒加载模块，还没有加载好
  你可以监听懒加载模块，然后获取
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
  当你在这里使用action方法更新state时，
  所有注入过app模块的组件都会更新，
  并获取到最新的app模块中的数据，
  建议不要滥用
*/
app.actions.changeName('jerry');
// 等同于
store.dispatch('app/changeName', 'jerry');


// 监听模块变动
const unsubscribe = store.subscribe('app', () => {
  // 这里可以拿到最新的app数据
  store.getModule('app');
});


// 取消监听
unsubscribe();

```


## <a id='manual-import-module'>手动导入模块</a>

```ts

// initStore.ts
import { createStore } from 'natur';

// 在实例化store的时候，没有导入懒加载模块
export default createStore({/*...modules*/});

// ================================================
// lazyloadPage.ts 这是一个懒加载的页面
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
手动添加模块，在此模块被添加之前，其他地方无法使用此模块
要想其他地方也使用，则必须在store实例化的时候就导入
*/
store.setModule('lazyModuleName', lazyLoadModule);

const lazyLoadView = () => {
  // 现在你可以获取手动添加的模块了
  const [{state, maps, actions}] = useInject('lazyModuleName');
  return (
    <div>{state.name}</div>
  )
}


```
## <a id='dispatch'>dispatch</a>

````typescript
import { createStore, inject, InjectStoreModule } from 'natur';

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

// 创建store这一步需要在渲染组件之前完成，因为在组件中，需要用到你创建的store
const store = createStore({count});

const {actions, state} = store.getModule('count')

actions.inc(state.number);
// 等于
store.dispatch('count/inc', state.number);

````

## <a id='typescript'>typescript支持</a>
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


## <a id='caution'>使用注意事项</a>

 - 由于低版本不支持react.forwardRef方法，所以不能直接使用ref获取包裹的组件实例，需要使用forwardedRef属性获取（用法同ref）

 - 在TypeScript中的提示可能不那么友好，比如
 ```ts

@inject<storeProps>('count', 'name')
class App extends React.Component {
  // ...
}

// 此使用方法会报错，提示App组件中无forwardedRef属性声明
<App forwardedRef={console.log} />

// 以下使用方式则不会报错
class _App extends React.Component {
  // ...
}
const App = @inject<storeProps>('count', 'name')(_App);
// 正确
<App forwardedRef={console.log} />

 ```
- **在actions中修改state，需要遵循immutable规范**
