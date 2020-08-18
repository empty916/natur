// redux.devtool.middleware.ts
import { Middleware } from '../src';
import { createStore } from 'redux';
 
const root = (state: Object = {}, actions: any):Object => ({
  ...state,
  ...actions.state,
});
 
const createMiddleware = (): Middleware<any> => {
  if (process.env.NODE_ENV === 'development' && (window as any).__REDUX_DEVTOOLS_EXTENSION__) {
    const devMiddleware = (window as any).__REDUX_DEVTOOLS_EXTENSION__();
    const store = createStore(root, devMiddleware);
    return () => next => record => {
      store.dispatch({
        type: `${record.moduleName as string}/${record.actionName}`,
        state: {
          [record.moduleName]: record.state,
        },
      });
      return next(record);
    }
  }
  return () => next => record => next(record);
}
 
export default createMiddleware();