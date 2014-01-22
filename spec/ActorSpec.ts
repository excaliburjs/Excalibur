/// <reference path="jasmine.d.ts" />
/// <reference path="require.d.ts" />
/// <reference path="../ts/Core.ts" />

describe("A game actor", () => {
	
	var actor;
	var engine;
	beforeEach(()=>{
		actor = new ex.Actor();
		// mock engine
		engine = {
			currentScene : {
				children : []
			},
			keys : [],
			clicks : [],
			mouseDown : [],
			mouseUp : []
		}
	});


	it("should be loaded", () => {
		expect(ex.Actor).toBeTruthy();
	});


	it("can have animation", () => {
		expect(actor.frames).toEqual({});

		actor.addDrawing("first", null);
		expect(actor.frames['first']).toBe(null);

	});

	it("can change positions when it has velocity", ()=>{
		expect(actor.y).toBe(0);
		expect(actor.x).toBe(0);

		actor.dy = 10;
		actor.dx = -10;

		expect(actor.x).toBe(0);
		expect(actor.y).toBe(0);

		actor.update(engine, 1000);

		expect(actor.x).toBe(-10);
		expect(actor.y).toBe(10);

		actor.update(engine, 1000);

		expect(actor.x).toBe(-20);
		expect(actor.y).toBe(20);

	});

	it('can have its height and width scaled', ()=>{
		expect(actor.getWidth()).toBe(0);
		expect(actor.getHeight()).toBe(0);

		actor.setWidth(20);
		actor.setHeight(20);

		expect(actor.getWidth()).toBe(20);
		expect(actor.getHeight()).toBe(20);

		actor.scale = 2;

		expect(actor.getWidth()).toBe(40);
		expect(actor.getHeight()).toBe(40);

		actor.scale = .5;

		expect(actor.getWidth()).toBe(10);
		expect(actor.getHeight()).toBe(10);


	});

	it('can have a center point', () => {
		actor.setHeight(100);
		actor.setWidth(50);

		var center = actor.getCenter();
		expect(center.x).toBe(25);
		expect(center.y).toBe(50);

		actor.x = 100;
		actor.y = 100;

		center = actor.getCenter();
		expect(center.x).toBe(125);
		expect(center.y).toBe(150);

	});

	it('has a left, right, top, and bottom', ()=>{
		actor.setWidth(100);
		actor.setHeight(100);

		expect(actor.getLeft()).toBe(0);
		expect(actor.getRight()).toBe(100);
		expect(actor.getTop()).toBe(0);
		expect(actor.getBottom()).toBe(100);

	});

	it('can contain points', ()=>{
		expect(actor.x).toBe(0);
		expect(actor.y).toBe(0);
		actor.setWidth(20);
		actor.setHeight(20);

		expect(actor.contains(10,10)).toBe(true);

		expect(actor.contains(0, 0)).toBe(true);

		expect(actor.contains(20, 20)).toBe(true);

		expect(actor.contains(21, 20)).toBe(false);
		expect(actor.contains(20, 21)).toBe(false);
		
		expect(actor.contains(0, -1)).toBe(false);
		expect(actor.contains(-1, 0)).toBe(false);
		expect(actor.contains(10, 0)).toBe(true);
		expect(actor.contains(10, 20)).toBe(true);


	});

	it('can collide with other actors', ()=>{
		var otherActor = new ex.Actor(10, 10, 20, 20);
		actor.setHeight(20);
		actor.setWidth(20);

		expect(actor.collides(otherActor)).toBeTruthy();
		expect(otherActor.collides(actor)).toBeTruthy();

		otherActor.x = 19;
		otherActor.y = 0;

		expect(actor.collides(otherActor)).toBe(ex.Side.LEFT);
		expect(otherActor.collides(actor)).toBe(ex.Side.RIGHT);

		actor.x = 0;
		actor.y = 0;
		otherActor.x  = 21;
		otherActor.y = 0;
		expect(actor.collides(otherActor)).toBe(ex.Side.NONE);

		actor.setWidth(22);
		expect(actor.collides(otherActor)).toBe(ex.Side.LEFT);

	});

	it('can be moved to a location at a speed', ()=>{
		expect(actor.x).toBe(0);
		expect(actor.y).toBe(0);

		actor.moveTo(100, 0, 100);
		actor.update(engine, 500);

		expect(actor.x).toBe(50);
		expect(actor.y).toBe(0);

		actor.update(engine, 500);
		expect(actor.x).toBe(100);
		expect(actor.y).toBe(0);
	});

	it('can be moved to a location by a certain time', ()=>{
		expect(actor.x).toBe(0);
		expect(actor.y).toBe(0);

		actor.moveBy(100, 0,  2000);
		actor.update(engine, 1000);

		expect(actor.x).toBe(50);
		expect(actor.y).toBe(0);

	});

	it('can be rotated to an angle at a speed', ()=>{
		expect(actor.rotation).toBe(0);

		actor.rotateTo(Math.PI/2, Math.PI/2);
		actor.update(engine, 500);

		expect(actor.rotation).toBe(Math.PI/4);

		actor.update(engine, 500);
		expect(actor.rotation).toBe(Math.PI/2);
	});

	it('can be rotated to an angle by a certain time', ()=>{
		expect(actor.rotation).toBe(0);

		actor.rotateBy(Math.PI/2, 2000);
		actor.update(engine, 1000);

		expect(actor.rotation).toBe(Math.PI/4);
		actor.update(engine, 1000);

		expect(actor.rotation).toBe(Math.PI/2);

	});

	it('can be scaled at a speed', ()=>{
		expect(actor.scale).toBe(1);

		actor.scaleTo(2, .5);
		actor.update(engine, 1000);

		expect(actor.scale).toBe(1.5);
		actor.update(engine, 1000);

		expect(actor.scale).toBe(2);
	});

	it('can be scaled by a certain time', ()=>{
		expect(actor.scale).toBe(1);

		actor.scaleBy(4, 1000);

		actor.update(engine, 500);
		expect(actor.scale).toBe(2.5);

		actor.update(engine, 500);
		expect(actor.scale).toBe(4);
	});

	it('can blink at a frequency', ()=>{
		expect(actor.invisible).toBe(false);
		actor.blink(1, 3000);

		actor.update(engine, 500);
		expect(actor.invisible).toBe(true);

		actor.update(engine, 250);
		actor.update(engine, 250);
		expect(actor.invisible).toBe(false);

	});

	it('can blink at a frequency forever', ()=>{
		expect(actor.invisible).toBe(false);
		actor.blink(1, 1000).repeatForever();

		
		for(var i = 0; i < 2; i++){
			actor.update(engine, 250);
			actor.update(engine, 250);
			expect(actor.invisible).toBe(true);
			actor.update(engine, 250);
			actor.update(engine, 250);
			expect(actor.invisible).toBe(false);
			actor.update(engine, 250);
		}
		
	});

	it('can be delayed by an amount off time', ()=>{
		expect(actor.x).toBe(0);
		expect(actor.y).toBe(0);

		actor.delay(1000).moveTo(20, 0, 20);
		actor.update(engine, 1000);

		expect(actor.x).toBe(0);

		actor.update(engine, 1000);

		expect(actor.x).toBe(20);

	});

	it('can repeat previous actions', ()=>{
		expect(actor.x).toBe(0);
		expect(actor.y).toBe(0);

		actor.moveTo(20, 0, 10).moveTo(0, 0, 10).repeat();

		actor.update(engine, 1000);
		expect(actor.x).toBe(10);
		expect(actor.y).toBe(0);

		actor.update(engine, 1000);
		expect(actor.x).toBe(20);
		expect(actor.y).toBe(0);

		actor.update(engine, 1);
		actor.update(engine, 1000);
		expect(actor.x).toBe(10);
		expect(actor.y).toBe(0);

		actor.update(engine, 1000);
		expect(actor.x).toBe(0);
		expect(actor.y).toBe(0);

		actor.update(engine, 1);
		actor.update(engine, 1000);
		expect(actor.x).toBe(10);
		expect(actor.y).toBe(0);

		actor.update(engine, 1000);
		expect(actor.x).toBe(20);
		expect(actor.y).toBe(0);

		actor.update(engine, 1000);
		expect(actor.x).toBe(20);
		expect(actor.y).toBe(0);
	});

	it('can repeat previous actions forever', ()=>{
		expect(actor.x).toBe(0);
		expect(actor.y).toBe(0);

		actor.moveTo(20, 0, 10).moveTo(0, 0, 10).repeatForever();

		for(var i = 0; i < 20; i++){
			actor.update(engine, 1000);
			expect(actor.x).toBe(10);
			expect(actor.y).toBe(0);

			actor.update(engine, 1000);
			expect(actor.x).toBe(20);
			expect(actor.y).toBe(0);

			actor.update(engine, 1);
			actor.update(engine, 1000);
			expect(actor.x).toBe(10);
			expect(actor.y).toBe(0);

			actor.update(engine, 1000);
			expect(actor.x).toBe(0);
			expect(actor.y).toBe(0);

			actor.update(engine,1);
		}

	});

	it('can have its moveTo action stopped', ()=>{
		expect(actor.x).toBe(0);
		expect(actor.y).toBe(0);

		actor.moveTo(20, 0, 10);
		actor.update(engine,500);

		actor.clearActions();
		expect(actor.x).toBe(5);
		expect(actor.y).toBe(0);

		// Actor should not move after stop
		actor.update(engine,500);
		expect(actor.x).toBe(5);
		expect(actor.y).toBe(0);
	});

	it('can have its moveBy action stopped', ()=>{
		expect(actor.x).toBe(0);
		expect(actor.y).toBe(0);

		actor.moveBy(20, 0, 1000);
		actor.update(engine,500);

		actor.clearActions();
		expect(actor.x).toBe(10);
		expect(actor.y).toBe(0);

		// Actor should not move after stop
		actor.update(engine,500);
		expect(actor.x).toBe(10);
		expect(actor.y).toBe(0);
	});

	it('can have its rotateTo action stopped', ()=>{
		expect(actor.rotation).toBe(0);

		actor.rotateTo(Math.PI/2, Math.PI/2);
		actor.update(engine, 500);

		expect(actor.rotation).toBe(Math.PI/4);
		actor.clearActions();

		actor.update(engine, 500);
		expect(actor.rotation).toBe(Math.PI/4);
	});

	it('can have its rotateBy action stopped', ()=>{
		expect(actor.rotation).toBe(0);

		actor.rotateBy(Math.PI/2, 2000);
		
		actor.update(engine, 1000);

		actor.clearActions();
		expect(actor.rotation).toBe(Math.PI/4);

		actor.update(engine, 1000);

		expect(actor.rotation).toBe(Math.PI/4);
	});

	it('can have its scaleTo action stopped', ()=>{
		expect(actor.scale).toBe(1);

		actor.scaleTo(2, .5);
		actor.update(engine, 1000);

		actor.clearActions();
		expect(actor.scale).toBe(1.5);
		actor.update(engine, 1000);

		expect(actor.scale).toBe(1.5);
	});

	it('can have its scaleBy action stopped', ()=>{
		expect(actor.scale).toBe(1);

		actor.scaleBy(4, 1000);

		actor.update(engine, 500);

		actor.clearActions();
		expect(actor.scale).toBe(2.5);

		actor.update(engine, 500);
		expect(actor.scale).toBe(2.5);
	});

	it('can have its blink action stopped', ()=>{
		expect(actor.invisible).toBe(false);
		actor.blink(1, 3000);

		actor.update(engine, 500);
		expect(actor.invisible).toBe(true);

		actor.clearActions();
		
		actor.update(engine, 500);
		actor.update(engine, 500);
		expect(actor.invisible).toBe(false);
	});

	it('can have its delay action stopped', ()=>{
		expect(actor.x).toBe(0);
		expect(actor.y).toBe(0);

		actor.delay(1000).moveTo(20, 0, 20);
		actor.update(engine, 1000);

		expect(actor.x).toBe(0);

		actor.clearActions();
		actor.update(engine, 1000);

		expect(actor.x).toBe(0);
	});

	it('can have its repeat action stopped', ()=>{
		expect(actor.x).toBe(0);
		expect(actor.y).toBe(0);

		actor.moveTo(20, 0, 10).moveTo(0, 0, 10).repeat();

		actor.update(engine, 1000);
		expect(actor.x).toBe(10);
		expect(actor.y).toBe(0);

		actor.update(engine, 1000);
		expect(actor.x).toBe(20);
		expect(actor.y).toBe(0);

		actor.clearActions();
		actor.update(engine, 1);
		actor.update(engine, 1000);
		expect(actor.x).toBe(20);
		expect(actor.y).toBe(0);

		actor.update(engine, 1000);
		expect(actor.x).toBe(20);
		expect(actor.y).toBe(0);

		actor.update(engine, 1);
		actor.update(engine, 1000);
		expect(actor.x).toBe(20);
		expect(actor.y).toBe(0);

		actor.update(engine, 1000);
		expect(actor.x).toBe(20);
		expect(actor.y).toBe(0);

		actor.update(engine, 1000);
		expect(actor.x).toBe(20);
		expect(actor.y).toBe(0);
	});

	it('can have its repeatForever action stopped', ()=>{
		expect(actor.x).toBe(0);
		expect(actor.y).toBe(0);

		actor.moveTo(20, 0, 10).moveTo(0, 0, 10).repeatForever();

		actor.update(engine, 1000);
		expect(actor.x).toBe(10);
		expect(actor.y).toBe(0);

		actor.clearActions();

		for(var i = 0; i < 20; i++){
			actor.update(engine, 1000);
			expect(actor.x).toBe(10);
			expect(actor.y).toBe(0);
		}
	});

	it('can follow another actor', ()=>{
		expect(actor.x).toBe(0);
		expect(actor.y).toBe(0);

		var actorToFollow = new ex.Actor(10, 0);
		actorToFollow.moveTo(100, 0, 10);
		actor.follow(actorToFollow);
		// actor.update(engine, 1000);
		// expect(actor.x).toBe(actorToFollow.x);

		for(var i = 1; i < 10; i++){
			// actor.follow(actorToFollow);
			actorToFollow.update(engine, 1000);
			actor.update(engine, 1000);
			expect(actor.x).toBe(actorToFollow.x-10)
		}


		// test different follow distances?
	});

	it('can meet another actor' , ()=>{
		expect(actor.x).toBe(0);
		expect(actor.y).toBe(0);

		// testing basic meet
		var actorToMeet = new ex.Actor(10, 0);
		actorToMeet.moveTo(100, 0, 10);
		actor.meet(actorToMeet);

		for(var i = 0; i < 9; i++){
			actorToMeet.update(engine, 1000);
			actor.update(engine, 1000);
			expect(actor.x).toBe(actorToMeet.x-10)
		}

		// actor should have caught up to actorToFollow since it stopped moving
		actorToMeet.update(engine, 1000);
		actor.update(engine, 1000);
		expect(actor.x).toBe (actorToMeet.x);

		//TODO have actor to be followed traveling at a diagonal 'toward' the following actor
		// testing when actorToMeet is moving in a direction towards the following actor


		})

});