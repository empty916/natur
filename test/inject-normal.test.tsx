/**
 * @jest-environment jsdom
 */
import React, { StrictMode } from "react";
import {
	render,
	fireEvent,
	waitFor,
	screen,
	act,
} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { store, App, App2 } from "./ui-demo/inject-normal";

beforeEach(() => {
	store.globalResetStates();
});

const sleep = (time = 0) => new Promise((res) => setTimeout(res, time));

test("inject normal", async () => {
	act(() => {
		render(
			<StrictMode>
				<App />
			</StrictMode>
		);
	});
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
	expect(screen.getByRole("count")).toHaveTextContent("0");

	await sleep();
	expect(screen.getByRole("name-input")).toHaveValue("name1");

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
	expect(screen.getByRole("count")).toHaveTextContent("1");
	expect(screen.getByRole("text-split")).toHaveTextContent(
		"name1".split("").join(",")
	);
});

test("inject normal2", async () => {
	act(() => {
		render(
			<StrictMode>
				<App2 />
			</StrictMode>
		);
	});

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

	expect(screen.getByRole("count")).toHaveTextContent("0");
	expect(screen.getByRole("name-input")).toHaveValue("name1");
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
	expect(screen.getByRole("count")).toHaveTextContent("1");
	expect(screen.getByRole("text-split")).toHaveTextContent(
		"name1".split("").join(",")
	);
});
