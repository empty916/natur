import { createStore, Middleware } from '../src';
// import { createStore, Middleware } from '../dist/rns';
import * as nameModule from './name';
import countModule from './count';
import longItem from './longItem';

const LogMiddleware:Middleware = ({ setState }) => next => record => {
	console.log(`${record.moduleName}: ${record.actionName}`, record.state);
	return next(record);
};

export default () => createStore(
	{
		name: nameModule,
		name1: nameModule,
		count: countModule,
		count1: countModule,
		longItem,
	},
	{
		name: () => import('./name'),
	},
	{
		// count: { count: 111 },
		name: { name: 'wxg' },
	},
	[
		// LogMiddleware,
		// LogMiddleware2
	],
);

