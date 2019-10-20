type dataItem = {
	name: string,
	author: string,
	id: number,
}
type State = {
	data: dataItem[],
}

let id = 0;
const createItem = () => ({
	name: 'name-' + id,
	author: `author-${id}`,
	id: id++,
});

const state: State = {
	data: new Array(1000).fill(0).map(createItem),
}
const actions = {
	changeItem: (state: State, id: number, name: string) => {
		const nd = state.data.map(item => {
			if(item.id === id) {
				return {
					...item,
					name,
				}
			}
			return item;
		})

		return {
			...state,
			data: nd,
		}
	}
}

export default {
	state,
	actions
}
