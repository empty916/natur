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
	isOdd: ['count', (count: number) => count % 2 !== 0],
	deepCountIsOdd: ['deeep.deep.count2', (count: number) => {
		// console.log('run deep map');
		return count % 2 !== 0;
	}],
	deeepCountIsOdd: ['deeep.deep.count', (count: number) => {
		// console.log('run deeep map');
		return count % 2 !== 0;
	}],
	splitName: ['name', (name: string) => {
		return name.split("");
	}],
	returnNameWhenCountIsOdd: ['count', 'name', (count: number, name: string) => {
		if (count % 2 !== 0) {
			return name;
		}
		return count;
	}],
	count: [(s: any) => s, (state: any) => ({count: state.count})],
	combine: [(s: any) => s, (state: any) => ({ ...state })],
	showNewKey: [(s: any) => s, (state: any) => !!state.newKey && state.newKey],
};
export const actions = {
	inc: (state: any) => {
		console.log(state);
		return Promise.resolve({
			...state,
			count: state.count + 1
		});
	},
	// inc: state => null,
	incDeep: () => (getState: () => any, next: (s: any) => any) => {
		console.log('inc deep');
		const state = getState();
		return next({
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
		})
		// return {
		// 	...state,
		// 	// deep: {
		// 	// 	count: state.deep.count + 1,
		// 	// }
		// 	deeep: {
		// 		deep: {
		// 			...state.deeep.deep,
		// 			count2: state.deeep.deep.count2 + 1,
		// 		}
		// 	}
		// };
	},
	incDeeep: (state: any) => {
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
	decDeeep: (state: any) => {
		return {
			...state,
			deeep: {
				deep: {
					...state.deeep.deep,
					count: state.deeep.deep.count - 1,
				}
			}
		};
	},
	addKey: (state: any) => ({...state, newKey: 1}),
	deleteKey: (state: any) => {
		const res = {...state};
		delete res.newKey;
		return res;
	},
	doNothing: (state: any) => state,
	asyncDoNothing: (state: any) => Promise.resolve(state),
	asInc: ({ count, ...rest }: any) => Promise.resolve({ count: count + 1, ...rest }),
	dec: ({ count, ...rest }: any) => {
		return { count: count - 1, ...rest };
	},
	changeName: (newName: string, state: any) => ({
		...state,
		name: newName,
	})
};

const a = {
	state,
	maps,
	actions
};

export default a;
