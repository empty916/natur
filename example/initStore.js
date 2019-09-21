import { createStore } from 'react-natural-store';
import * as nameModule from './name';
import countModule from './count';


// export default () => createStore().addModule('name', nameModule).addModule('count', {
// 	state, maps,actions,
// });

export default () => createStore({
	name: nameModule,
	count: countModule,
});

