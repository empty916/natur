export const state = {
	count: 1,
	name: "count",
	deeep: {
		deep: {
			count: 1,
			count2: 1,
		}
	}
};
export const maps = {
	isOdd: ['count', (count: number) => count % 2 !== 0],
	deeepCountIsOdd: ['deeep.deep.count', (count: number) => {
		return count % 2 !== 0;
	}],
	splitName: ['name', (name: string) => {
		return name.split("");
	}]
};
export const actions = {
	inc: () => (getState) => ({count: getState().count + 1}),
	dec: () => (getState) => {
		return { 
			count: getState().count - 1, 
		};
	},
	incDeeep: () => getState => {
		const state = getState();
		return {
			deeep: {
				deep: {
					...state.deeep.deep,
					count: state.deeep.deep.count + 1,
				}
			}
		};
	},
	decDeeep: () => getState => {
		const state = getState();
		return {
			deeep: {
				deep: {
					...state.deeep.deep,
					count: state.deeep.deep.count - 1,
				}
			}
		};
	},
	changeName: (newName: string) => ({
		name: newName,
	})
};

const a = {
	state,
	maps,
	actions
};

export default a;
