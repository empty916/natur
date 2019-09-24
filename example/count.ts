export const state = {
	count: 1
};
export const maps = {
	isOdd: ({ count }) => count % 2 !== 0
};
export const actions = {
	inc: ({ count }) => {
		return { count: count + 1 };
	},
	asInc: ({ count }) => Promise.resolve({ count: count + 1 }),
	dec: ({ count }) => {
		return { count: count - 1 };
	}
};

export default {
	state,
	maps,
	actions
}
