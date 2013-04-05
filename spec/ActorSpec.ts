/// <reference path="jasmine.d.ts" />
/// <reference path="require.d.ts" />
/// <reference path="../ts/Core.ts" />

describe("A game actor", () => {
	var Actor = Core.Actor;
	var actor;
	beforeEach(()=>{
		actor = new Actor();
	});


	it("should be loaded", () => {
		expect(Actor).toBeTruthy();
	});

	it("can have its position set", ()=>{
		actor.setX(99);
		actor.setY(-99);
		expect(actor.getX()).toBe(99);
		expect(actor.getY()).toBe(-99);

		actor.setX(-99);
		actor.setY(99);
		expect(actor.getX()).toBe(-99);
		expect(actor.getY()).toBe(99);
	})

	it("can have its velocity set", ()=>{
		actor.setDx(99);
		actor.setDy(-99);
		expect(actor.getDx()).toBe(99);
		expect(actor.getDy()).toBe(-99);

		actor.setDx(-99);
		actor.setDy(99);
		expect(actor.getDx()).toBe(-99);
		expect(actor.getDy()).toBe(99);
	});

	it("can have its acceleration set", () => {
		actor.setAx(99);
		actor.setAy(-99);
		expect(actor.getAx()).toBe(99);
		expect(actor.getAy()).toBe(-99);

		actor.setAx(-99);
		actor.setAy(99);
		expect(actor.getAx()).toBe(-99);
		expect(actor.getAy()).toBe(99);
	});

	it("can have its color set", ()=>{
		var color = new Core.Color(2,2,2);
		actor.setColor(color);
		expect(actor.getColor()).toEqual(color);
	});

	it("can have animation", () => {
		expect(actor.animations).toEqual({});

		actor.addAnimation("first", null);
		expect(actor.animations['first']).toBe(null);

	});

	it("can change positions when it has velocity", ()=>{
		expect(actor.getDy()).toBe(0);
		expect(actor.getDx()).toBe(0);

		actor.setDy(10);
		actor.setDx(-10);

		expect(actor.getX()).toBe(0);
		expect(actor.getY()).toBe(0);

		actor.update();

		expect(actor.getX()).toBe(-10);
		expect(actor.getY()).toBe(10);

		actor.update();

		expect(actor.getX()).toBe(-20);
		expect(actor.getY()).toBe(20);

	});

	it("can change position and velocity when it has acceleration", ()=>{
		expect(actor.getY()).toBe(0);
		expect(actor.getX()).toBe(0);

		expect(actor.getDy()).toBe(0);
		expect(actor.getDx()).toBe(0);


		actor.setAy(-10);
		actor.setAx(10);

		expect(actor.getY()).toBe(0);
		expect(actor.getX()).toBe(0);

		expect(actor.getDy()).toBe(0);
		expect(actor.getDx()).toBe(0);

		actor.update();

		expect(actor.getY()).toBe(0);
		expect(actor.getX()).toBe(0);

		expect(actor.getDy()).toBe(-10);
		expect(actor.getDx()).toBe(10);

		actor.update();

		expect(actor.getY()).toBe(-10);
		expect(actor.getX()).toBe(10);

		expect(actor.getDy()).toBe(-20);
		expect(actor.getDx()).toBe(20);

		actor.update()

		expect(actor.getY()).toBe(-30);
		expect(actor.getX()).toBe(30);

		expect(actor.getDy()).toBe(-30);
		expect(actor.getDx()).toBe(30);

	});

});