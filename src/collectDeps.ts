import { State } from "./ts";


const supportProxy = typeof Proxy !== undefined;

const createProxy = <O extends object>(obj: O, pathHandler: (p: string) => any) => {
    return new Proxy(obj, {
        get(target, path): any {
            if (typeof path === 'string') {
                const result = pathHandler(path);
                if (typeof result === 'object' && !result) {
                    return createProxy(result, (rp: string) => {
                        return pathHandler(`${path}.${rp}`);
                    });
                }
                return pathHandler(path);
            }
            return Reflect.get(target, path);
        }
    })
}

export const runFn = <S extends State, F extends (s: S) => any>(state: S, fn: F) => {
    if (typeof state !== 'object' || !state) {
        return {
            result: fn(state),
            deps: []
        };
    }
    const proxyState = createProxy(state, (p) => {
        console.log('path: ', p);
        return Reflect.get(state, p);
    });
    return {
        result: fn(proxyState),
        deps: []
    }

}
