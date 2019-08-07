# react-store使用手册

[English doc](README.en.md)

1. 创建store实例，配置全局store, 这一步需要在使用Inject方法之前完成，因为inject方法注入依赖store的实例

````
import { createStore } from '../react-store'
const app = {
	state: {
		name: 'tom',
	},
	actions: {
		changeName: newName => ({name: newName}), // 返回的参数会作为新的state，如果返回原来的state，或undefined，则页面不会触发更新
		asyncChangeName: newName => Promise.resolve({name: newName}), // 支持promise，promise返回的参数会作为新的state，如果返回原来的state，或undefined，则页面不会触发更新
	},
	maps: { // 可选的参数，在页面获取的maps，会是运行后的函数返回值
		nameSplit: state => state.name.split(''),
		addName: state => lastName => state.name + lastName,
	}
}

const store = createStore({app}); // 创建store实例

````

2. 使用inject将app模块注入组件当中

````

const App = ({app, module1}) => {
	/*
		state: {
			name: 'tom'
		},
		actions: {
			changeName,
			asyncChangeName,
		},
		maps: {
			splitName: ['t', 'o', 'm'],
			addName: lastName => state.name + lastName,
		}
	*/
	const {state, actions, maps} = app; // 获取注入的的app模块
	return (
		<input
			value={state.name} // app中的数据
			onChange={e => actions.changeName(e.target.value)}
		/>
	)
};
export default Inject('app', 'module1', ...)(App); // 注入store中的app模块；

````

3. 懒加载模块配置

````
/*
	module1.js
	export {
		state: {
			count: 1,
		}
		actions: {
			inc: state => ({count: state.count + 1}),
		}
	}
*/
const module1 = () => import('module1'); // 懒加载模块

// 第二参数就是懒加载的模块；
const store = createStore({app}, {module1}); // 创建store实例
inject.setStore(store);// 配置inject的store
// 然后用法等同于第二步

````

4. 加载时候的占位组件配置

````
import { inject } from 'react-natural-store'
// 全局配置
inject.setLoadingComponent(() => <div>loading...</div>);

// 局部使用
inject('app')(App, () => <div>loading</div>)

````