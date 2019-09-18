/**
 * @author empty916
 * @email [empty916@qq.com]
 * @create date 2019-08-09 17:12:57
 * @modify date 2019-08-09 17:12:57
 * @desc [description]
 */
export {
	default as createStore,
	Listener,
	State,
	States,
	Action,
	Actions,
	Maps,
	StoreModule,
	LazyStoreModules,
	Modules,
	Store,
 } from './createStore'
 export { default as inject } from './inject_class'
// export { default as inject } from './inject_hooks'

// type Person = {
// 	name: 'tom',
// 	age: 22,
// 	sex: '男',
// };
// type PersonProps = ['name', 'age'];

// todo: getRestType<Person, PersonProps> => {sex}; ?
