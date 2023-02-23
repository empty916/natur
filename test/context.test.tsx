/**
 * @jest-environment jsdom
 */
import React, { FC, ReactChildren, ReactElement, ReactNode, StrictMode } from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import {
	createInject,
	createStore,
	createUseInject,
	createUseStore,
	Provider,
} from "../src";
import {
	promiseMiddleware,
	filterNonObjectMiddleware,
	fillObjectRestDataMiddleware,
	shallowEqualMiddleware,
} from "../src/middlewares";

const createIns = () => {
	const name = {
		state: {
			text: "name",
			count: 0,
		},
		actions: {
			updateText: (text: string) => ({ text }),
			inc: (count: number) => ({ count: count + 1 }),
		},
		maps: {
			textSplit: ["text", (text: string) => text.split("").join(",")],
			firstChar: ["text", (text: string) => text[0]],
		},
	};

	const store = createStore(
		{ name },
		{},
		{
			middlewares: [
				promiseMiddleware,
				filterNonObjectMiddleware,
				fillObjectRestDataMiddleware,
				shallowEqualMiddleware,
			],
		}
	);

	const store1 = createStore(
		{ name },
		{},
		{
			middlewares: [
				promiseMiddleware,
				filterNonObjectMiddleware,
				fillObjectRestDataMiddleware,
				shallowEqualMiddleware,
			],
		}
	);

	store1.globalSetStates({
		name: {
			text: "name1",
			count: 1,
		},
	});

	const useStore = createUseStore(() => store);
	const useInject = createUseInject(() => store);
	const inject = createInject({
		storeGetter: () => store,
	});
	return {
		store,
		store1,
		inject,
		useStore,
		useInject,
	};
};

test("context without Provider", () => {
	const { store, store1, useStore, useInject, inject } = createIns();

	const App = ({ children }) => {
		return children;
	}

	function Child1() {
		const [name] = useInject("name");
		expect(name).toBe(store.getModule("name"));
		return null;
	}

	const Child2 = inject("name")(({ name }) => {
		expect(name).toBe(store.getModule("name"));
		return null;
	});

	render(
		<StrictMode>
			<App>
				<Child1 />
				<Child2 />
			</App>
		</StrictMode>
	);
});

test("context with provider", () => {
	const { store, store1, useStore, useInject, inject } = createIns();

	const App = ({ children }) => {
		return (
			<Provider store={store1}>
				{children}
			</Provider>
		);
	}

	function Child1() {
		const [name] = useInject("name");
		expect(name).toBe(store1.getModule("name"));
		return null;
	}

	const Child2 = inject("name")(({ name }) => {
		expect(name).toBe(store1.getModule("name"));
		return null;
	});

	render(
		<StrictMode>
			<App>
				<Child1 />
				<Child2 />
			</App>
		</StrictMode>
	);
});
