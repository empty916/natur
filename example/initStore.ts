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

const LogMiddleware: Middleware = ({setState}) => next => record => {
	console.log(`${record.moduleName}: ${record.actionName}`, record.state);
	return next(record);
};

export default () => createStore(
	{
		count: countModule,
	},
	{},
	{},
	[
		thunkMiddleware,
		promiseMiddleware, 
		fillObjectRestDataMiddleware,
		shallowEqualMiddleware, 
		// filterUndefinedMiddleware,
		devTool,
		// LogMiddleware,
		// LogMiddleware2
	],
);

