# react-natural-store 使用手册

[English doc](./doc/README.en.md)


- [设计概念](./doc/design.md)


#### 基本介绍
- 这是一个简洁、高效的react状态管理器
- 浏览器兼容：IE9+
- 支持react 15.x, 16.x, 以及anujs
- 单元测试覆盖率99％，放心使用
- 包体积，minizip 5k(uglify+gzip压缩后5k)
<!-- # react-natural-store 使用手册 -->

#### 第一步 创建 store 实例
**这一步需要在渲染组件之前完成，因为 inject方法包裹的组件，在渲染时依赖store的实例**

```js
import { createStore } from 'react-natural-store';

/*
此处app视为一个模块
一个模块的数据结构就是如此
*/
const app = {
  // state 必须是Object对象，子元素不限
  state: {
    name: 'tom',
  },
  // actions必须是Object对象，子元素必须是function
  actions: {
    /*
    返回的参数
    如果是Object则会作为新的state，
    如果不是则不会处理，并原值返回给调用者。
    需要遵照immutable规范！！！
    */
    changeName: newName => ({ name: newName }),
    /*
    支持promise，
    返回值行为与上面的同步action一致
    */
    asyncChangeName: newName => Promise.resolve({ name: newName }), // 
  },
  /*
  可选的参数，必须是Object对象，子元素必须是function
  在页面获取的maps，会是运行后的函数返回值，
  maps方法会自动收集依赖，只有在依赖发生变化时，才会重新计算结果。
  */
  maps: { 
    nameSplit: state => state.name.split(''),
    addName: state => lastName => state.name + lastName,
  },
};

// 其他的模块
const otherModules = { 
  //... 
};

// 创建store实例
const store = createStore({ app, ...otherModules }); 

export default store;

```

---

#### 第二步 使用 inject 将模块注入组件当中

```jsx
import { inject } from 'react-natural-store';
const App = ({app, otherModuleName}) => {
  // 获取注入的app模块
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
#### 好了，你已经掌握了。以下是一些附加功能。

- [hooks方式](#hooks)
- [配置懒加载模块](#config-lazy-module)
- [初始化store时，使用其他的state](#init-with-state)
- [中间件](#middleware)
- [懒加载模块，加载中，占位组件配置](#loading-component)
- [在react外使用store](#use-store-without-react)
- [手动导入模块](#manual-import-module)
- [在typescript中使用](#typescript)
- [<font color="#faad14">使用注意事项</font>](#caution)


---


#### <a id='hooks' style="color: black;">第二步可以换成hooks使用方式 使用 useInject 将 app 模块注入组件当中</a>

```jsx

import { useInject } from 'react-natural-store';

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


#### <a id='config-lazy-module' style="color: black;">懒加载模块配置</a>

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



#### <a id="init-with-state" style="color: black;">createStore初始化state</a>

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
    [moduleName: ModuleName]: Partial<State>,
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



#### <a id='middleware' style="color: black;">中间件</a>

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

抄的redux middleware,
	
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

---


#### <a id='loading-component' style="color: black;">加载时候的占位组件配置</a>

```jsx
import { inject } from 'react-natural-store';
// 全局配置
inject.setLoadingComponent(() => <div>loading...</div>);

// 局部使用
inject('app')(App, () => <div>loading</div>);
```


#### <a id='use-store-without-react' style="color: black;">在react之外使用store</a>

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


#### <a id='manual-import-module' style="color: black;">手动导入模块</a>

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
store.setModule('lazyModuleName', lazyLoadModule);

const lazyLoadView = () => {
  // 现在你可以获取手动添加的模块了
  const [{state, maps, actions}] = useInject('lazyModuleName');
  return (
    <div>{state.name}</div>
  )
}


```

#### <a id='typescript' style="color: black;">typescript支持</a>
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


#### <a id='caution' style="color: black;">使用注意事项</a>

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

- **在actions中修改state，需要遵循immutable规范**。maps只监听state下第一层值的变化，所以如果第一层值没有变化，但是state深层值确实有变化，那么对应的maps缓存不会刷新。 

- **请尽量避免在actions中动态增加或删除state的key**。这会导致一个问题，当maps依赖state动态增加或删除的key时，由于Object.defineProperty无法监听到增加key或删除key的变化，所以对应的maps不会重新计算，依然会使用上次的缓存。


