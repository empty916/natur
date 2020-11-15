import {createStore, Middleware} from '../src';
// import { createStore, Middleware } from '../dist/rns';
import {
  thunkMiddleware,
  promiseMiddleware, 
  fillObjectRestDataMiddleware,
  shallowEqualMiddleware, 
  filterUndefinedMiddleware,
} from '../src/middlewares'
import countModule from './count';
import devTool from './redux.devtool';


export default () => {
	const store = createStore(
		{
			count: countModule,
			count2: countModule,
		},
		{
			lazyCount: () => Promise.resolve(countModule),
		},
		{
			middlewares: [
				thunkMiddleware,
				promiseMiddleware, 
				fillObjectRestDataMiddleware,
				shallowEqualMiddleware, 
				// filterUndefinedMiddleware,
				devTool,
				// LogMiddleware,
				// LogMiddleware2
			]
		},
	);
	const LogMiddleware: Middleware<typeof store.type> = ({setState, dispatch}) => next => record => {
		console.log(`${record.moduleName}: ${record.actionName}`, record.state);
		return next(record);
	};
	return store;
};

