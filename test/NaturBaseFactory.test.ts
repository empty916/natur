import { NaturBaseFactory } from './../src/NaturBaseFactory';



const state = {
    name: 'tom',
    data: {
        sex: 'male',
        age: 18,
    },
    todo: [
        {
            id: 1,
            name: 'play game'
        },
    ]
}

test('map creator', () => {
    const createMap = NaturBaseFactory.mapCreator(state);

    const maps = {
        f1: createMap(
            s => s.data.age,
        ),
        f2: createMap(
            s => s.data.age,
            a => a + 1
        ),
        f3: createMap(
            s => s.data.age,
            s => s.todo[0].id,
            (a, id) => a + id
        ),
    };

    expect(maps).toMatchSnapshot();
})


test('create module', () => {
    const m = NaturBaseFactory.createModule((createMap) => ({
        state: {
            name: '',
            body: {
                leg: 1,
                finger: 5,
            }
        },
        actions: {
            updateName: (newName: string) => ({
                name: newName
            }),
            updateName2: (newName: string) => (api) => {
                api.getState();
            },
            
        }
    }))
})

test('actions creator', () => {
    const createMap = NaturBaseFactory.mapCreator(state);

    const maps = {
        f1: createMap(
            s => s.data.age,
        ),
        f2: createMap(
            s => s.data.age,
            a => a + 1
        ),
        f3: createMap(
            s => s.data.age,
            s => s.todo[0].id,
            (a, id) => a + id
        ),
    };
    const createActions = NaturBaseFactory.actionsCreator(state);

    const actions1 = createActions({
        a1: (name: string) => ({
            name,
        }),
        a2: (sex: string) => (api) => ({
            data: {
                ...api.getState().data,
                sex,
            }
        })
    });
    expect(actions1).toMatchSnapshot();

    const createActions2 = NaturBaseFactory.actionsCreator(state, maps);
    const actions2 = createActions2({
        addAge: () => (api) => ({
            data: {
                ...api.getState().data,
                age: api.getMaps().f1,
            }
        })
    });
    expect(actions2).toMatchSnapshot();
});

test('watch creator', () => {
    const createWatch = NaturBaseFactory.watchCreator();
    expect(createWatch({
        ff: (event, api) => {
            if (event.type === 'init') {
                event.oldModule;
            }
        }
    })).toMatchSnapshot();
})


test('create watch', () => {
    expect(NaturBaseFactory.createWatch({
        ff: (event, api) => {
            if (event.type === 'init') {
                event.oldModule;
            }
        }
    })).toMatchSnapshot();
})