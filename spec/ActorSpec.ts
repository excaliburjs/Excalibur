/// <reference path="jasmine.d.ts" />
/// <reference path="require.d.ts" />
/// <reference path="../ts/Core.ts" />

describe("A game actor", () => {
	
	var actor;
	beforeEach(()=>{
		actor = new Actor();
	});


	it("should be loaded", () => {
		expect(Actor).toBeTruthy();
	});


	it("can have animation", () => {
		expect(actor.animations).toEqual({});

		actor.addAnimation("first", null);
		expect(actor.animations['first']).toBe(null);

	});

	it("can change positions when it has velocity", ()=>{
		expect(actor.y).toBe(0);
		expect(actor.x).toBe(0);

		actor.dy = 10;
		actor.dx = -10;

		expect(actor.x).toBe(0);
		expect(actor.y).toBe(0);

		actor.update();

		expect(actor.x).toBe(-10);
		expect(actor.y).toBe(10);

		actor.update();

		expect(actor.x).toBe(-20);
		expect(actor.y).toBe(20);

	});

	it("can change position and velocity when it has acceleration", ()=>{
		expect(actor.y).toBe(0);
		expect(actor.x).toBe(0);

		expect(actor.dy).toBe(0);
		expect(actor.dx).toBe(0);


		actor.ay = -10;
		actor.ax = 10;

		expect(actor.y).toBe(0);
		expect(actor.x).toBe(0);

		expect(actor.dy).toBe(0);
		expect(actor.dx).toBe(0);

		actor.update();

		expect(actor.y).toBe(0);
		expect(actor.x).toBe(0);

		expect(actor.dy).toBe(-10);
		expect(actor.dx).toBe(10);

		actor.update();

		expect(actor.y).toBe(-10);
		expect(actor.x).toBe(10);

		expect(actor.dy).toBe(-20);
		expect(actor.dx).toBe(20);

		actor.update()

		expect(actor.y).toBe(-30);
		expect(actor.x).toBe(30);

		expect(actor.dy).toBe(-30);
		expect(actor.dx).toBe(30);

	});

});