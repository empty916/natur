/**
 * @jest-environment jsdom
 */
import React, {
	FC,
	ReactChildren,
	ReactElement,
	ReactNode,
	StrictMode,
} from "react";
import {
	render,
	fireEvent,
	waitFor,
	screen,
	logDOM,
} from "@testing-library/react";
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
import { AllModuleEvent, ModuleEvent, WatchParams } from "../src/ts-utils";

const name = () => ({
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
});

const count = () => ({
	state: {
		text: "count",
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
});

test("watch function", () => {
	const store = createStore(
		{
			name: name(),
			count: {
				...count(),
				watch: (event: AllModuleEvent, apis: WatchParams) => {
					expect(["count", "name"].includes(event.moduleName)).toBe(
						true
					);
					if (event.actionName) {
						expect(event.type).toBe("update");
						expect(
							["updateText", "inc", "globalSetStates"].includes(
								event.actionName
							)
						).toBe(true);
					} else {
						expect(event.type).toBe("init");
						expect(event.actionName).toBe(undefined);
						expect(event.oldModule).toBe(undefined);
						event.moduleName === "count" &&
							expect({
								state: event.newModule?.state,
								maps: event.newModule?.maps,
							}).toEqual({
								state: {
									text: "count",
									count: 0,
								},
								maps: {
									firstChar: "c",
									textSplit: "c,o,u,n,t",
								},
							});
					}
				},
			},
		},
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
		{
			name: {
				...name(),
				watch: (event: AllModuleEvent, apis: WatchParams) => {
					expect(["name"].includes(event.moduleName)).toBe(true);
					if (event.actionName) {
						expect(event.type).toBe("update");
						expect(
							["globalSetStates"].includes(event.actionName)
						).toBe(true);

						expect(event.oldModule?.state).toEqual({
							text: "name",
							count: 0,
						});
						expect({
							state: event.newModule?.state,
							maps: event.newModule?.maps,
						}).toEqual({
							state: {
								text: "name1",
								count: 1,
							},
							maps: {
								firstChar: "n",
								textSplit: "n,a,m,e,1",
							},
						});
					} else {
						expect(event.type).toBe("init");
						expect(event.actionName).toBe(undefined);
						expect(event.oldModule).toBe(undefined);
						expect({
							state: event.newModule?.state,
							maps: event.newModule?.maps,
						}).toEqual({
							state: {
								text: "name",
								count: 0,
							},
							maps: {
								firstChar: "n",
								textSplit: "n,a,m,e",
							},
						});
					}
				},
			},
		},
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

	store.globalSetStates({
		name: {
			text: "name1",
			count: 1,
		},
	});
});

test("watch object", () => {
	const store = createStore(
		{
			name: name(),
			count: {
				...count(),
				watch: {
					count: (event: ModuleEvent, apis: WatchParams) => {
						if (event.actionName) {
							expect(event.type).toBe("update");
							expect(
								["globalSetStates"].includes(event.actionName)
							).toBe(true);

							expect(event.oldModule?.state).toEqual({
								text: "count",
								count: 0,
							});
							expect({
								state: event.newModule?.state,
								maps: event.newModule?.maps,
							}).toEqual({
								state: {
									text: "name1",
									count: 1,
								},
								maps: {
									firstChar: "n",
									textSplit: "n,a,m,e,1",
								},
							});
						} else {
							expect(event.type).toBe("init");
							expect(event.actionName).toBe(undefined);
							expect(event.oldModule).toBe(undefined);
							expect({
								state: event.newModule?.state,
								maps: event.newModule?.maps,
							}).toEqual({
								state: {
									text: "count",
									count: 0,
								},
								maps: {
									firstChar: "c",
									textSplit: "c,o,u,n,t",
								},
							});
						}
					},
					name: (event: ModuleEvent, apis: WatchParams) => {
						if (event.actionName) {
							expect(
								["globalSetStates"].includes(event.actionName)
							).toBe(true);
							expect(apis.getState().count).toBe(1);
							expect(event.newModule?.state.count).toBe(1);
						} else {
							expect(event.actionName).toBe(undefined);
							expect(event.type).toBe("init");
						}
					},
				},
			},
		},
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

	store.globalSetStates({
		count: {
			text: "name1",
			count: 1,
		},
	});
});

test("watch obj apis", () => {
	const store = createStore(
		{
			count: {
				...count(),
				watch: {
					count: (event: ModuleEvent, apis: WatchParams) => {
                        if (event.type === 'init') {
                            expect(apis.getState()).toEqual({
                                text: "count",
                                count: 0,
                            });
                            expect(apis.getMaps()).toEqual({
                                firstChar: "c",
                                textSplit: "c,o,u,n,t",
                            });
    
                            expect(apis.getStore()).toBe(store);
                            apis.dispatch('updateText', 'count1');
                        } else {
                            expect(apis.getState()).toEqual({
                                text: "count1",
                                count: 0,
                            });
                        }
					},
				},
			},
		},
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
});


test("watch obj apis", () => {
	const store = createStore(
		{
            name: name(),
			count: {
				...count(),
				watch: (event: AllModuleEvent, apis: WatchParams) => {
                    if (event.moduleName === 'name') {
                        return;
                    }
                    if (event.type === 'init') {
                        expect(apis.getState()).toEqual({
                            text: "count",
                            count: 0,
                        });
                        expect(apis.getMaps()).toEqual({
                            firstChar: "c",
                            textSplit: "c,o,u,n,t",
                        });

                        expect(apis.getStore()).toBe(store);
                        apis.dispatch('updateText', 'count1');
                    } else {
                        expect(apis.getState()).toEqual({
                            text: "count1",
                            count: 0,
                        });
                    }
                },
			},
		},
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
});