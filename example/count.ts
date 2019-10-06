export const state = {
	count: 1,
	name: "count",
};
export const maps = {
	isOdd: ({ count }) => count % 2 !== 0,
	splitName: state => {
		return state.name.split("");
	},
	count: state => ({count: state.count}),
	combine: state => ({ ...state })
};
export const actions = {
	inc: state => {
		return {
			...state,
			count: state.count + 1
		};
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
