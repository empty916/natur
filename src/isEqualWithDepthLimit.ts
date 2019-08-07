const hasOwn = Object.prototype.hasOwnProperty

function is(x: any, y: any) {
  if (x === y) {
    return x !== 0 || y !== 0 || 1 / x === 1 / y
  } else {
    return x !== x && y !== y
  }
}

export default function isEqualWithDepthLimit(objA: any, objB: any, depthLimit: number = 3, depth: number = 1): boolean {
  if (is(objA, objB)) return true

  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    return false
  }

  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) return false

  for (let i = 0; i < keysA.length; i++) {
	if (
		!hasOwn.call(objB, keysA[i]) ||
		!is(objA[keysA[i]], objB[keysA[i]])
	) {
		if (typeof objA[keysA[i]] === 'object' && typeof objB[keysB[i]] === 'object' && depth < depthLimit) {
			return isEqualWithDepthLimit(objA[keysA[i]], objB[keysB[i]], depthLimit, depth+1);
		}
      	return false
    }
  }

  return true
}
