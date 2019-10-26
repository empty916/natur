export const state = {
	count: 1,
	name: "count",
	newKey: -1,
	deep: {
		count: 2,
	},
	deeep: {
		deep: {
			count: 1,
			count2: 1,
		}
	}
};
export const maps = {
	isOdd: ({ count }) => count % 2 !== 0,
	deepCountIsOdd: ['deeep.deep.count2', count => {
		console.log('run deep map');
		return count % 2 !== 0;
	}],
	deeepCountIsOdd: ['deeep.deep.count', (count) => {
		console.log('run deeep map');
		return count % 2 !== 0;
	}],
	splitName: state => {
		return state.name.split("");
	},
	returnNameWhenCountIsOdd: state => {
		if (state.count % 2 !== 0) {
			return state.name;
		}
		return state.count;
	},
	count: state => ({count: state.count}),
	combine: state => ({ ...state }),
	showNewKey: state => !!state.newKey && state.newKey,
};
export const actions = {
	inc: state => {
		return Promise.resolve({
			...state,
			count: state.count + 1
		});
	},
	// inc: state => null,
	incDeep: state => {
		return {
			...state,
			// deep: {
			// 	count: state.deep.count + 1,
			// }
			deeep: {
				deep: {
					...state.deeep.deep,
					count2: state.deeep.deep.count2 + 1,
				}
			}
		};
	},
	incDeeep: state => {
		return {
			...state,
			deeep: {
				deep: {
					...state.deeep.deep,
					count: state.deeep.deep.count + 1,
				}
			}
		};
	},
	addKey: state => ({...state, newKey: 1}),
	deleteKey: state => {
		const res = {...state};
		delete res.newKey;
		return res;
	},
	doNothing: state => state,
	asyncDoNothing: state => Promise.resolve(state),
	asInc: ({ count, ...rest }) => Promise.resolve({ count: count + 1, ...rest }),
	dec: ({ count, ...rest }) => {
		return { count: count - 1, ...rest };
	},
	changeName: (newName, state) => ({
		...state,
		name: newName,
	})
};

export default {
	state,
	maps,
	actions
};
