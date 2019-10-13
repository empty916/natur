import { createStore, Middleware } from '../src';
// import * as nameModule from './name';
import countModule from './count';

const LogMiddleware:Middleware = ({ setState }) => next => record => {
	console.log(`${record.moduleName}: ${record.actionName}`, record.state);
	return next(record);
};

export default () => createStore(
	{
		// name: nameModule,
		count: countModule,
	},
	{
		name: () => import('./name'),
	},
	{
		count: { count: 111 },
		name: { name: 'wxg' },
	},
	[
		// LogMiddleware,
		// LogMiddleware2
	],
);

