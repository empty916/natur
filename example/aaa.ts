import MapCache from "../src/MapCache";
import { Store } from "../src";
import initStore from './initStore';


const a = {
    count: true,
    app: {
        state: ['name', state => state.age],
        maps: ['isTom', 'isAdult']
    },
    name: {
        state: [],
        maps: ['splitName'],
    }
}


type Diff = {
    [m: string]: {
        state: MapCache,
        maps: MapCache,
        hasChanged: boolean,
    }
};

function initDiff(a, store: Store): Diff {
    const moduleDiff: Diff = {};
    for(let moduleName in a) {
        if(a[moduleName] !== true) {
            moduleDiff[moduleName] = {
                state: new MapCache(
                    () => store.getModule(moduleName).state,
                    [...a.state, () => {}],
                ),
                maps: new MapCache(
                    () => store.getModule(moduleName).maps,
                    [...a.maps, () => {}],
                ),
                hasChanged: false,
            }
        }
    }
    return moduleDiff;
}

const store = initStore();

const diff = initDiff(a, store);

function shouldUpdate(moduleName) {
    if (a[moduleName] === true) {
        return true;
    } else {
        diff[moduleName].hasChanged = false;
        diff[moduleName].state.shouldCheckCache();
        if (diff[moduleName].state.hasDepChanged() === true) {
            return true;
        }
        diff[moduleName].maps.shouldCheckCache();
        if (diff[moduleName].maps.hasDepChanged() === true) {
            return true;
        }
        return false;
    }
    
}