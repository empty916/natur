# react-natural-store cook book


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
