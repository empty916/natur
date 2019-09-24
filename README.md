# react-natural-store 使用手册

[English doc](./doc/README.en.md)


- [设计概念](./doc/design.md)


#### 兼容性
 - 支持react 15.x, 16.x, 以及anujs
<!-- # react-natural-store 使用手册 -->

#### 第一步 创建 store 实例
**这一步需要在渲染组件之前完成，因为 inject方法包裹的组件，在渲染时依赖store的实例**

```js
import { createStore } from 'react-natural-store';
const app = {
  state: {
    name: 'tom',
  },
  actions: {
    /*
      返回的参数会作为新的state，
      如果返回原来的state，或undefined，
      则不会触发组件更新
    */
    changeName: newName => ({ name: newName }),
    /*
      支持promise，
      promise返回的参数会作为新的state，
      如果返回原来的state，或undefined，
      则不会触发组件更新
    */
    asyncChangeName: newName => Promise.resolve({ name: newName }), // 
  },
  maps: { // 可选的参数，在页面获取的maps，会是运行后的函数返回值
    nameSplit: state => state.name.split(''),
    addName: state => lastName => state.name + lastName,
  },
};
const otherModules = { 
  //... 
}；

const store = createStore({ app, ...otherModules }); // 创建store实例

export default store;


```

---

#### 第二步 使用 inject 将 app 模块注入组件当中

```jsx
import { inject } from 'react-natural-store';
const App = ({app, otherModuleName}) => {
  // 获取注入的的app模块
  const {state, actions, maps} = app;
  /*
    获取到的 app模块
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
      value={state.name} // app中的数据
      onChange={e => actions.changeName(e.target.value)}
    />
  )
};

// 注入store中的app模块；
export default inject('app', 'otherModuleName')(App); 

```

---


#### 第二步可以换成hooks使用方式 使用 useInject 将 app 模块注入组件当中

```jsx

import { useInject } from 'react-natural-store/hooks';

const App = () => {
  /*
  注意，如果useInject参数中，存在懒加载模块，则会先返回空的数组，
  等到懒加载模块加载完成才会返回你需要的模块，
  所以useInject不建议使用于懒加载模块

  但是你可以使用手动添加模块的的方式
  store.addModule('otherModuleName', otherModule);
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





#### - 懒加载模块配置

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

// 第二参数就是懒加载的模块；
const store = createStore({ app }, { module1, ...otherLazyModules }); // 创建store实例

// 然后用法等同于第二步
```



#### createStore初始化state

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
  createStore第三个参数
  {
	  [moduleName: ModuleName]: State,
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






#### 中间件

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

抄的redux middleware,

stateOperate: {setState, getState};
setState: record => Promise<State> | State | undefined;
getState: () => State

next: record => any;

record: {
	moduleName,
	actionName,
	state, // Promise<State> | State
}
*/
const LogMiddleware = (stateOperate: {setState, getState}) => next => record => {
	console.log(`${record.moduleName}: ${record.actionName}`, record.state);
    // return next(record); // 你应该return, 只有这样你在页面调用action的时候才会有返回值
    // return stateOperate.setState(record); // 你应该return，只有这样你在页面调用action的时候才会有返回值
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





#### - 加载时候的占位组件配置

```jsx
import { inject } from 'react-natural-store';
// 全局配置
inject.setLoadingComponent(() => <div>loading...</div>);

// 局部使用
inject('app')(App, () => <div>loading</div>);
```


#### - 在react之外使用store

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


  // 监听模块变动
  const unsubscribe = store.subscribe('app', () => {
    // 这里可以拿到最新的app数据
    store.getModule('app');
  });

  
  // 取消监听
  unsubscribe();

```


#### - 手动导入模块

```ts

// initStore.ts
import { createStore } from 'react-natural-store';

// 在实例化store的时候，没有导入懒加载模块
export default createStore({/*...modules*/});

// ================================================
// lazyloadPage.ts 这是一个懒加载的页面
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
手动添加模块，在此模块被添加之前，其他地方无法使用此模块
要想其他地方也使用，则必须在store实例化的时候就导入
*/
store.addModule('lazyModuleName', lazyLoadModule);

const lazyLoadView = () => {
  // 现在你可以获取手动添加的模块了
  const [{state, maps, actions}] = useInject('lazyModuleName');
  return (
    <div>{state.name}</div>
  )
}


```

#### - typescript支持
```ts

import React from 'react';
import ReactDOM from 'react-dom';
import {inject, StoreModule} from 'react-natural-store'

type storeProps = {count: StoreModule, name: StoreModule};
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


#### - react-natural-store使用注意事项

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
