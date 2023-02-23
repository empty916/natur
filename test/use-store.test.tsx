/**
 * @jest-environment jsdom
 */
import React, { ReactElement, ReactNode, StrictMode } from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { createStore, createUseStore, Provider } from "../src";
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
	return {
		store,
		store1,
		useStore,
	}
}

test("createUseStore without Provider", () => {
	const {store, store1, useStore} = createIns();

	function App({ children }: { children: ReactElement }) {
		return children;
	}

	function Child() {
		const innerStore = useStore();
		expect(innerStore).toBe(store);
		return <div>1</div>;
	}

	render(
		<StrictMode>
			<App>
				<Child />
			</App>
		</StrictMode>
	);
});

test("createUseStore with provider", () => {
	const {store, store1, useStore} = createIns();

	function App({ children }: { children: ReactNode }) {
		return (
			<Provider store={store1}>
				{children}
			</Provider>
		);
	}

	function Child() {
		const innerStore = useStore();
		expect(innerStore).toBe(store1);
		return null;
	}

	render(
		<StrictMode>
			<App>
				<Child />
			</App>
		</StrictMode>
	);
});
