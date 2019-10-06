export const ObjHasSameKeys = (obj1: Object, obj2: Object) => {
	if (!obj1 || !obj2) {
		return false;
	}
	if (Object.keys(obj1).length !== Object.keys(obj2).length) {
		return false;
	}
	for(let key in obj1) {
		if (obj1.hasOwnProperty(key)) {
			if (!obj2.hasOwnProperty(key)) {
				return false;
			}
		}
	}
	return true;
}

type Obj = {[p: string]: any}

export const ObjChangedKeys = (source: Obj, afterChange: Obj) => {
	// console.log(source, afterChange);
	if (!source || !afterChange) {
		return {
			updatedKeys: [],
			keyHasChanged: false,
		};
	}
	// KEY还在，但是值变化了的
	const updatedKeys = [];
	// KEY是否变动
	let keyHasChanged = false;

	for(let key in source) {
		if (source.hasOwnProperty(key)) {
			if (!afterChange.hasOwnProperty(key)) {
				keyHasChanged = true;
				updatedKeys.push(key);
			}
			if (afterChange.hasOwnProperty(key) && source[key] !== afterChange[key]) {
				updatedKeys.push(key);
			}
		}
	}
	for(let key in afterChange) {
		if (afterChange.hasOwnProperty(key)) {
			if (!source.hasOwnProperty(key)) {
				updatedKeys.push(key);
				keyHasChanged = true;
			}
		}
	}
	return {updatedKeys, keyHasChanged};
}

class Watcher {
	target: any;
	callback: any;
	constructor(target: any, callback: any) {
		this.target = target;
		this.callback = callback;
	}
}
