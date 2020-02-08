# rns-pure 使用手册

[English doc](./doc/README.en.md)


#### 这是[react-natural-store](https://www.npmjs.com/package/react-natural-store)的纯净版。

#### rns-pure与react-natural-store的区别如下：

- state本身不限制数据类型
- maps必须是手动声明依赖
- actions返回任意值都可以作为state的值，不做任何拦截
- 不自动附带异步支持，不自动附带浅比较state更新优化
- middlewares.js中附带了常用的中间件，包括异步中间件，浅层对比state优化中间件等
- rns-pure不会自动收集依赖，所以不限制actions对state的修改，但是必须遵守immutable规范
- 因为rns-pure没有使用Object.defineProperty API所以可以支持IE低版本浏览器
- 因为没有了Object.defineProperty拦截，所以会出现以下情况

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
  // 调用action
  const newState = actions.updateName();
  // 旧的state无法直接获取到最新的state值
  // state.name === 'tom'
  // newState.name === 'jerry'
  // ...
}


```

- 因为运行时闭包问题，拿不到最新state，新增thunkMiddleware

```typescript

import { thunkMiddleware } from 'rns-pure/dist/middlewares'

const actionExample = (myParams: any) => (getState, setState: (s: State) => State, getMaps: () => InjectMaps) => {
    const currentState = getState(); // 最新的state
    const currentMaps = getMaps(); // 最新的maps
    setState(currentState); // 更新state
}





```
