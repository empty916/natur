import { ThunkParams } from "../src/middlewares";

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
	firstChar: ['name', (name: string) => {
		console.log(name);
		return  name[0];
	}],
};
export const actions = {
	inc: () => ({getState}) => {
		console.log(getState());
		return {count: getState().count + 1};
	},
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
	decDeeep: () => ({getState, setState}: ThunkParams<typeof state>) => {
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

type State = typeof state;

export type InjectCountStore = {
	state: State;
	maps: {
		isOdd: boolean;
		deeepCountIsOdd: boolean;
		splitName: string[];
		firstChar: string,
	};
	actions: {
		inc(): State;
		dec(): State;
		incDeeep(): State;
		decDeeep(): State;
		changeName(newName: string): State;
	}
}



export default a;
