import React, { StrictMode } from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { FnCompSupportRef, FnCompUnsupportRef, ClsComp } from "./ui-demo/ref";

test("inject normal", async () => {
	let refIns: {
		log(): void;
		inc(): void;
		dec(): void;
	};
	const getRef = (node: typeof refIns) => (refIns = node);

	render(
		<StrictMode>
			{/* @ts-ignore */}
			<FnCompUnsupportRef ref={getRef} />
		</StrictMode>
	);
	expect(refIns).toBe(undefined);

	render(
		<StrictMode>
			<FnCompSupportRef ref={getRef}/>
		</StrictMode>
	);
	expect(refIns).not.toBe(undefined);
	refIns = undefined;

	render(
		<StrictMode>
			<ClsComp ref={getRef}/>
		</StrictMode>
	);
	expect(refIns).not.toBe(undefined);
});
