import { runFn } from './../src/collectDeps';






it('dev', () => {
    const state = {
        name: 'tom',
        data: {
            age: 18,
            age2: 19
        },
        todo: [{
            id: 1,
            name: 'pay card',
        }],
        m: new Map([[1,1], [2,2]])
    }
    runFn(state, (s) => {
        s.name;
        s.data.age;
        s.todo[0].id;
        s.todo[0].name;
        s.m.get(1);
    });
})