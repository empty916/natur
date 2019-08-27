import { createStore } from 'react-natural-store';

const name = () => import('./name');
const count = {
    state: {
        count: 1,
    },
    actions: {
        inc: ({count}) => {
            return {count: count + 1};
        },
        dec: ({count}) => {
            return {count: count - 1};
        },
    },
    maps: {
        isOdd: ({count}) => count % 2 !== 0,
    }
};

// const store = createStore({count}, {name});

// setTimeout(() => {
// 	store.setStates({
// 		count: {
// 			count: 100,
// 		},
// 		name: {
// 			name: 'jerry',
// 		}
// 	});
// }, 1000);
export default () => createStore({count}, {name});
// export default store;

