import MapCache from '../src/MapCache';

export const state = {
    name: 'tom',
}
export const maps = {
    splitName: [s => s, state => state.name.split('')],
}
export const actions = {
    changeName: (name) => (name),
    asyncChangeName: name => {
        return new Promise(res => setTimeout(res, 3000))
            .then(() => ({name}))
    },
}
