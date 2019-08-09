# react-natural-store 使用手册

[English doc](./doc/README.en.md)


- [设计概念](./doc/design.md)


<!-- # react-natural-store 使用手册 -->

#### 第一步 创建 store 实例
**这一步需要在使用 Inject 方法之前完成，因为 inject 方法注入依赖 store 的实例**

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
export default Inject('app', 'otherModuleName')(App); 

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

