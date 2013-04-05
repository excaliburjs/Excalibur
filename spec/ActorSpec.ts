/// <reference path="jasmine.d.ts" />
/// <reference path="require.d.ts" />
/// <reference path="../ts/Core.ts" />

describe("Game actors should move correctly", () => {
	it("true is true", () => {

		expect(true).toBe(true);
	});

	it("Core module should be loaded", () => {

		expect(Core).toBeTruthy();
	});

	it("Actor should exist in the core module", ()=>{
		expect(Core.Actor).toBeTruthy();
	});
});