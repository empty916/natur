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
	if (!source || !afterChange) {
		return [];
	}
	const keysOfChangedValue = [];
	for(let key in source) {
		if (source.hasOwnProperty(key)) {
			if (!afterChange.hasOwnProperty(key)) {
				keysOfChangedValue.push(key);
			}
			if (afterChange.hasOwnProperty(key) && source[key] !== afterChange[key]) {
				keysOfChangedValue.push(key);
			}
		}
	}
	for(let key in afterChange) {
		if (afterChange.hasOwnProperty(key)) {
			if (!source.hasOwnProperty(key)) {
				keysOfChangedValue.push(key);
			}
		}
	}
	return keysOfChangedValue;
}
