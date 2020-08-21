import { ThunkParams } from "../src/middlewares";
import { ModuleType } from "../src/ts-utils";

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
	isOdd2: (s: typeof state) => {
		console.log('ssss', s)
		return s.count % 2 !== 0;
	},
	isTrue: () => {
		console.log('is true')
		return true;
	},
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
	inc: () => ({getState, getMaps, dispatch}: ThunkParams<typeof state, typeof maps>) => {
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

export type InjectCountStore = ModuleType<typeof a>;


export default a;
