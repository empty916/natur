/**
 * @jest-environment jsdom
 */
import React, { StrictMode } from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { store, App, DynamicModuleApp } from "./ui-demo/use-inject-flat";
import { getDepValue } from "../src/useInject";

beforeEach(() => {
	store.globalResetStates();
});

test("use inject flat", async () => {
	render(
		<StrictMode>
			<App />
		</StrictMode>
	);
	expect(screen.getByRole("loading")).toHaveTextContent("loading");

	await waitFor(() => screen.getByRole("name-input"));

	expect(screen.getByRole("lazy-name-input")).toHaveValue("name");

	expect(screen.getByRole("name-input")).toHaveValue("name");
	expect(screen.getByRole("count")).toHaveTextContent("0");
	expect(screen.getByRole("text-split")).toHaveTextContent(
		"name".split("").join(",")
	);

	fireEvent.change(screen.getByRole("name-input"), {
		target: {
			value: "name1",
		},
	});

	fireEvent.click(screen.getByRole("btn-inc"));

	expect(screen.getByRole("lazy-name-input")).toHaveValue("name");

	expect(screen.getByRole("name-input")).toHaveValue("name1");
	expect(screen.getByRole("count")).toHaveTextContent("0");
	expect(screen.getByRole("text-split")).toHaveTextContent(
		"name1".split("").join(",")
	);

	fireEvent.change(screen.getByRole("lazy-name-input"), {
		target: {
			value: "name2",
		},
	});

	expect(screen.getByRole("lazy-name-input")).toHaveValue("name2");
	expect(screen.getByRole("name-input")).toHaveValue("name1");
	expect(screen.getByRole("count")).toHaveTextContent("0");
	expect(screen.getByRole("text-split")).toHaveTextContent(
		"name1".split("").join(",")
	);
});

test("use inject flat dynamic app", async () => {
    store.removeModule('lazyName');
	render(
		<StrictMode>
			<DynamicModuleApp />
		</StrictMode>
	);
	expect(screen.getByRole("loading")).toHaveTextContent("loading");
	await waitFor(() => screen.getByRole("lazy-name-input"));
    await waitFor(() => screen.getByRole("loading"));
    await waitFor(() => screen.getByRole("lazy-name-input"));

	expect(screen.getByRole("lazy-name-input")).toHaveValue("name");
    
    expect(store.hasModule('lazyName')).toBe(true);
    expect(store.hasModule('lazyName2')).toBe(true);

	fireEvent.change(screen.getByRole("lazy-name-input"), {
		target: {
			value: "name2",
		},
	});
	expect(screen.getByRole("lazy-name-input")).toHaveValue("name2");
});
