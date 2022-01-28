import React, { useImperativeHandle, useState } from 'react';
import { createInject, createStore } from "../../src";
import {
	promiseMiddleware,
	filterNonObjectMiddleware,
	fillObjectRestDataMiddleware,
	shallowEqualMiddleware
} from '../../src/middlewares'


const name = {
	state: {
		count: 0,
	},
	actions: {
		inc: (count: number) => ({count: count + 1}),
	},
}


export const store = createStore(
	{name},
	{},
	{
		middlewares: [
			promiseMiddleware, 
			filterNonObjectMiddleware, 
			fillObjectRestDataMiddleware,
			shallowEqualMiddleware,
		]
	}
);
const inject = createInject({
	storeGetter: () => store,
	loadingComponent: () => <div role='loading'>loading</div>
});

const nameInjector = inject('name');

type NameInjector = typeof nameInjector.type;

export const FnCompUnsupportRef = nameInjector(() => {
    return <div>1</div>
})

export type RefIns = {
    log(): void;
    inc(): void;
    dec(): void;
}

export const FnCompSupportRef = nameInjector(React.forwardRef<RefIns, NameInjector>((props, ref) => {
    const [count, setCount] = useState(0);
    useImperativeHandle(
        ref,
        () => ({
            log: () => console.log(count),
            inc: () => setCount(c => c + 1),
            dec: () => setCount(c => c - 1),
        }),
        [],
    )
    return <div>{count}</div>;
}))

class _ClsComp extends React.Component<NameInjector> {
    state = {
        value: 0
    }
    log = () => {
        console.log(this.state.value);
    }
    inc = () => {
        this.setState({
            value: this.state.value + 1,
        })
    }
    dec = () => {
        this.setState({
            value: this.state.value - 1,
        })
    }
    render() {
        return <div>{this.state.value}</div>
    }
}
const ClsComp = nameInjector(_ClsComp);

export {
    ClsComp,
}