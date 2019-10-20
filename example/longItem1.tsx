import React, { useEffect, useState, useCallback } from "react";
import ReactDOM from "react-dom";
import { inject, StoreModule, Store, useInject } from "../src";
import longItemModule from './longItem';
import initStore from "./initStore";

const style = {
	width: 200,
	border: '2px solid black',
}

const Item = React.memo(({item, changeItem}) => (
	<div style={style} key={item.id}>
		<div>
			<input type="text" value={item.name} onChange={e => changeItem(item.id, e.target.value)} />
		</div>
		<div>{item.author}</div>
	</div>
));


const _App = (props) => {
	// const [longItem, setLongItem] = useState(longItemModule.state.data);

	// const changeItem = useCallback((id: number, name: string) => {
	// 	const nLI = longItem.map((item) => {
	// 		if (item.id === id) {
	// 			return {
	// 				...item,
	// 				name,
	// 			}
	// 		}
	// 		return item;
	// 	});
	// 	setLongItem(nLI);
	// }, [longItem]);

	// const [{state, actions}] = useInject('longItem')
	const {state, actions} = props.longItem;
	const longItem = state.data;
	const changeItem = useCallback((id, name) => {
		actions.changeItem(state, id, name);
	}, [state])
	return (
		<>
			{
				longItem.map(item => (
					<Item key={item.id} item={item} changeItem={changeItem}></Item>
					// <div style={style} key={item.id}>
					// 	<div>
					// 		<input type="text" value={item.name} onChange={e => changeItem(item.id, e.target.value)} />
					// 	</div>
					// 	<div>{item.author}</div>
					// </div>
				))
			}
		</>
	);
};

const App = inject('longItem')(_App);
initStore()
export default <App />;

