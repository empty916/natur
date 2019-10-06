import React, { useEffect } from "react";
import ReactDOM from "react-dom";

// import content from './injectHoc'
import content from './injectHooks'


const obj = {
	a: 1,
	b: 'b',
}
const objProxy = Object.defineProperty({}, "a", {
	configurable: true,
	// writable: false,
	enumerable: true,
	get() {
		return obj['a'];
	}
});
// Object.defineProperty(objProxy, "b", {
// 	configurable: true,
// 	// writable: false,
// 	enumerable: true,
// 	get() {
// 		return obj['b'];
// 	},
// 	set(nv) {
// 		console.log(nv);
// 		obj['b'] = nv;
// 	}
// });
// objProxy.b = 3;
// delete objProxy.b;
// for(let key in objProxy) {
// 	console.log(key, objProxy.hasOwnProperty(key));
// }
// console.log(objProxy);
// console.log({...objProxy});

ReactDOM.render(content, document.querySelector("#app"));
