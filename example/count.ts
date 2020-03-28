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
	}],
	firstChar: ['name', (name: string) => name[0]],
};
export const actions = {
	inc: () => ({getState, setState}) => setState({count: getState().count + 1}),
	dec: () => ({getState, setState}) => {
		return setState({ 
			count: getState().count - 1, 
		});
	},
	incDeeep: () => ({getState, setState}) => {
		const state = getState();
		return setState({
			deeep: {
				deep: {
					...state.deeep.deep,
					count: state.deeep.deep.count + 1,
				}
			}
		});
	},
	decDeeep: () => ({getState, setState}) => {
		const state = getState();
		return setState({
			deeep: {
				deep: {
					...state.deeep.deep,
					count: state.deeep.deep.count - 1,
				}
			}
		});
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
