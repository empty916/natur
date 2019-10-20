import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { inject, StoreModule, Store } from "../src";
import { useInject } from "../src/hooks";
import initStore from "./initStore";

const style = {
	width: 200,
	border: '2px solid black',
}

const Item = React.memo(({item, changeItem, state}) => (
	<div style={style} key={item.id}>
		<div>
			<input type="text" value={item.name} onChange={e => changeItem(state, item.id, e.target.value)} />
		</div>
		<div>{item.author}</div>
	</div>
));
const App = inject('longItem')(({longItem}) => {
	const {state, actions} = longItem;
	return (
		<>
			{
				state.data.map(item => (
					<Item key={item.id} item={item} changeItem={actions.changeItem} state={state}></Item>
					// <div style={style} key={item.id}>
					// 	<div>
					// 		<input type="text" value={item.name} onChange={e => actions.changeItem(state, item.id, e.target.value)} />
					// 	</div>
					// 	<div>{item.author}</div>
					// </div>
				))
			}
		</>
	);
});

initStore()
export default <App />;

