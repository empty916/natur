import MapCache from "./MapCache";
import { ModuleDepDec } from "./ts/utils";

export type DepDecs = {
	[m: string]: ModuleDepDec[1];
}

export const isModuleDepDec = (obj: any): obj is ModuleDepDec => {
	if (Array.isArray(obj) && obj.length === 2) {
		if (typeof obj[0] !== 'string') {
			return false;
		}
		if (obj[1].state && !Array.isArray(obj[1].state)) {
			return false;
		}
		if (obj[1].maps && !Array.isArray(obj[1].maps)) {
			return false;
		}
		return true;
	}
	return false;
}

export type Diff = {
    [m: string]: MapCache[];
};

export type InitDiffReturnType = {
	diff: Diff;
	destroy: Function;
}