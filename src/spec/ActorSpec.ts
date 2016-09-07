/// <reference path="jasmine.d.ts" />
/// <reference path="require.d.ts" />
/// <reference path="Mocks.ts" />

describe('A game actor', () => {
	
   var actor: ex.Actor;
   
   var engine;
   var scene: ex.Scene;
   var mock = new Mocks.Mocker();

   beforeEach(() => {
      actor = new ex.Actor();
      actor.collisionType = ex.CollisionType.Active;
      scene = new ex.Scene(engine);

      spyOn(scene, 'draw').and.callThrough();
      spyOn(actor, 'draw');

      engine = mock.engine(100, 100, scene);
   });

   it('should be loaded', () => {
      expect(ex.Actor).toBeTruthy();
   });
   
   it('actors should generate pair hashes in the correct order', () => {
      var actor = new ex.Actor();
      actor.id = 20;
      var actor2 = new ex.Actor();
      actor2.id = 40;

      var hash = actor.calculatePairHash(actor2);
      var hash2 = actor2.calculatePairHash(actor);
      expect(hash).toBe('#20+40');
      expect(hash2).toBe('#20+40');
   });

   //it('can have animation', () => {
   //   expect(actor.frames).toEqual({});

   //   actor.addDrawing('first', null);
   //   expect(actor.frames['first']).toBe(null); //TODO
   //});

   it('can change positions when it has velocity', () => {
      expect(actor.pos.y).toBe(0);
      expect(actor.pos.x).toBe(0);

      actor.vel.y = 10;
      actor.vel.x = -10;

      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      actor.update(engine, 1000);
      expect(actor.pos.x).toBe(-10);
      expect(actor.pos.y).toBe(10);

      actor.update(engine, 1000);
      expect(actor.pos.x).toBe(-20);
      expect(actor.pos.y).toBe(20);
   });

   it('can have its height and width scaled', () => {
      expect(actor.getWidth()).toBe(0);
      expect(actor.getHeight()).toBe(0);

      actor.setWidth(20);
      actor.setHeight(20);

      expect(actor.getWidth()).toBe(20);
      expect(actor.getHeight()).toBe(20);

      actor.scale.x = 2;
      actor.scale.y = 3;

      expect(actor.getWidth()).toBe(40);
      expect(actor.getHeight()).toBe(60);

      actor.scale.x = .5;
      actor.scale.y = .1;

      expect(actor.getWidth()).toBe(10);
      expect(actor.getHeight()).toBe(2);
   });

   it('can have its height and width scaled by parent', () => {
      actor.scale.setTo(2, 2);

      var child = new ex.Actor(0, 0, 50, 50);

      actor.add(child);

      expect(child.getWidth()).toBe(100);
      expect(child.getHeight()).toBe(100);

      actor.scale.setTo(0.5, 0.5);

      expect(child.getWidth()).toBe(25);
      expect(child.getHeight()).toBe(25);
   });

   it('can have a center point', () => {
      actor.setHeight(100);
      actor.setWidth(50);

      var center = actor.getCenter();
      expect(center.x).toBe(0);
      expect(center.y).toBe(0);

      actor.pos.x = 100;
      actor.pos.y = 100;

      center = actor.getCenter();
      expect(center.x).toBe(100);
      expect(center.y).toBe(100);

      // changing the anchor
      actor.anchor = new ex.Vector(0, 0);
      actor.pos.x = 0;
      actor.pos.y = 0;

      center = actor.getCenter();
      expect(center.x).toBe(25);
      expect(center.y).toBe(50);

      actor.pos.x = 100;
      actor.pos.y = 100;

      center = actor.getCenter();
      expect(center.x).toBe(125);
      expect(center.y).toBe(150);
   });

   it('has a left, right, top, and bottom', () => {
      actor.pos.x = 0;
      actor.pos.y = 0;
      actor.anchor = new ex.Vector(0.5, 0.5);
      actor.setWidth(100);
      actor.setHeight(100);

      expect(actor.getLeft()).toBe(-50);
      expect(actor.getRight()).toBe(50);
      expect(actor.getTop()).toBe(-50);
      expect(actor.getBottom()).toBe(50);
   });

   it('should have correct bounds when scaled', () => {
      actor.pos.x = 0;
      actor.pos.y = 0;
      actor.setWidth(100);
      actor.setHeight(100);
      actor.scale.setTo(2, 2);
      actor.anchor = new ex.Vector(0.5, 0.5);
      
      expect(actor.getLeft()).toBe(-100);
      expect(actor.getRight()).toBe(100);
      expect(actor.getTop()).toBe(-100);
      expect(actor.getBottom()).toBe(100);
   });

   it('should have correct bounds when parent is scaled', () => {
      actor.pos.x = 0;
      actor.pos.y = 0;
      actor.setWidth(100);
      actor.setHeight(100);
      actor.scale.setTo(2, 2);
      actor.anchor = new ex.Vector(0.5, 0.5);

      var child = new ex.Actor(0, 0, 50, 50);
      actor.add(child);
      
      expect(child.getLeft()).toBe(-50);
      expect(child.getRight()).toBe(50);
      expect(child.getTop()).toBe(-50);
      expect(child.getBottom()).toBe(50);
   });
   
   it('has a left, right, top, and bottom when the anchor is (0, 0)', () => {
      actor.pos.x = 100;
      actor.pos.y = 100;
      actor.anchor = new ex.Vector(0.0, 0.0);
      actor.setWidth(100);
      actor.setHeight(100);

      expect(actor.getLeft()).toBe(100);
      expect(actor.getRight()).toBe(200);
      expect(actor.getTop()).toBe(100);
      expect(actor.getBottom()).toBe(200);
   });

   it('can contain points', () => {
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);
      actor.setWidth(20);
      actor.setHeight(20);

      expect(actor.anchor.x).toBe(.5);
      expect(actor.anchor.y).toBe(.5);

      actor.anchor = new ex.Vector(0, 0);

      expect(actor.contains(10, 10)).toBe(true);

      expect(actor.contains(21, 20)).toBe(false);
      expect(actor.contains(20, 21)).toBe(false);
		
      expect(actor.contains(0, -1)).toBe(false);
      expect(actor.contains(-1, 0)).toBe(false);
   });

   it('can collide with other actors', () => {
      var actor = new ex.Actor(0, 0, 10, 10);
      var other = new ex.Actor(10, 10, 10, 10);

      // Actors are adjacent and not overlapping should not collide
      expect(actor.collidesWithSide(other)).toBeFalsy();
      expect(other.collidesWithSide(actor)).toBeFalsy();

      // move other actor into collision range from the right side
      other.pos.x = 9;
      other.pos.y = 0;
      expect(actor.collidesWithSide(other)).toBe(ex.Side.Right);
      expect(other.collidesWithSide(actor)).toBe(ex.Side.Left);

      // move other actor into collision range from the left side
      other.pos.x = -9;
      other.pos.y = 0;
      expect(actor.collidesWithSide(other)).toBe(ex.Side.Left);
      expect(other.collidesWithSide(actor)).toBe(ex.Side.Right);

      // move other actor into collision range from the top
      other.pos.x = 0;
      other.pos.y = -9;
      expect(actor.collidesWithSide(other)).toBe(ex.Side.Top);
      expect(other.collidesWithSide(actor)).toBe(ex.Side.Bottom);

      // move other actor into collision range from the bottom
      other.pos.x = 0;
      other.pos.y = 9;
      expect(actor.collidesWithSide(other)).toBe(ex.Side.Bottom);
      expect(other.collidesWithSide(actor)).toBe(ex.Side.Top);
   });

   it('participates with another in a collision', () => {
      var actor = new ex.Actor(0, 0, 10, 10);
      actor.collisionType = ex.CollisionType.Active;
      var other = new ex.Actor(8, 0, 10, 10);
      other.collisionType = ex.CollisionType.Active;
      var actorCalled = 'false';
      var otherCalled = 'false';

      actor.on('collision', function() {
         actorCalled = 'actor';
      });

      other.on('collision', function() {
         otherCalled = 'other';
      });

      scene.add(actor);
      scene.add(other);
      scene.update(engine, 20);
      scene.update(engine, 20);

      expect(actorCalled).toBe('actor');
      expect(otherCalled).toBe('other');
   });   

   it('is rotated along with its parent', () => {
      var rotation = ex.Util.toRadians(90);

      actor.pos.setTo(10, 10);
      actor.rotation = rotation;

      var child = new ex.Actor(10, 0, 10, 10); // (20, 10)

      actor.add(child);
      actor.update(engine, 100);

      expect(child.getWorldPos().x).toBeCloseTo(10, 0.001);
      expect(child.getWorldPos().y).toBeCloseTo(20, 0.001);
   });

   it('is rotated along with its grandparent', () => {
      var rotation = ex.Util.toRadians(90);

      actor.pos.setTo(10, 10);
      actor.rotation = rotation;

      var child = new ex.Actor(10, 0, 10, 10); // (20, 10)
      var grandchild = new ex.Actor(10, 0, 10, 10); // (30, 10)

      actor.add(child);
      child.add(grandchild);
      actor.update(engine, 100);

      expect(grandchild.getWorldRotation()).toBe(rotation);
      expect(grandchild.getWorldPos().x).toBeCloseTo(10, 0.001);
      expect(grandchild.getWorldPos().y).toBeCloseTo(30, 0.001);
   });

   it('is scaled along with its parent', () => {
      actor.anchor.setTo(0, 0);
      actor.pos.setTo(10, 10);
      actor.scale.setTo(2, 2);

      var child = new ex.Actor(10, 10, 10, 10);

      actor.add(child);
      actor.update(engine, 100);

      expect(child.getWorldPos().x).toBe(30);
      expect(child.getWorldPos().y).toBe(30);
   });

   it('is scaled along with its grandparent', () => {
      actor.anchor.setTo(0, 0);
      actor.pos.setTo(10, 10);
      actor.scale.setTo(2, 2);

      var child = new ex.Actor(10, 10, 10, 10);
      var grandchild = new ex.Actor(10, 10, 10, 10);

      actor.add(child);
      child.add(grandchild);
      actor.update(engine, 100);

      // Logic:
      // p = (10, 10)
      // c = (10 * 2 + 10, 10 * 2 + 10) = (30, 30)
      // gc = (10 * 2 + 30, 10 * 2 + 30) = (50, 50)
      expect(grandchild.getWorldPos().x).toBe(50);
      expect(grandchild.getWorldPos().y).toBe(50);
   });

   it('is rotated and scaled along with its parent', () => {
      var rotation = ex.Util.toRadians(90);

      actor.pos.setTo(10, 10);
      actor.scale.setTo(2, 2);
      actor.rotation = rotation;

      var child = new ex.Actor(10, 0, 10, 10); // (30, 10)

      actor.add(child);
      actor.update(engine, 100);

      expect(child.getWorldPos().x).toBeCloseTo(10, 0.001);
      expect(child.getWorldPos().y).toBeCloseTo(30, 0.001);
   });

   it('is rotated and scaled along with its grandparent', () => {
      var rotation = ex.Util.toRadians(90);

      actor.pos.setTo(10, 10);
      actor.scale.setTo(2, 2);
      actor.rotation = rotation;

      var child = new ex.Actor(10, 0, 10, 10); // (30, 10)
      var grandchild = new ex.Actor(10, 0, 10, 10); // (50, 10)

      actor.add(child);
      child.add(grandchild);
      actor.update(engine, 100);

      expect(grandchild.getWorldPos().x).toBeCloseTo(10, 0.001);
      expect(grandchild.getWorldPos().y).toBeCloseTo(50, 0.001);
   });       

   it('can find its global coordinates if it has a parent', () => {
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      var childActor = new ex.Actor(50, 50);
      expect(childActor.pos.x).toBe(50);
      expect(childActor.pos.y).toBe(50);

      actor.add(childActor);

      actor.actions.moveBy(10, 15, 1000);
      actor.update(engine, 1000);

      expect(childActor.getWorldPos().x).toBe(60);
      expect(childActor.getWorldPos().y).toBe(65);
   });

   it('can find its global coordinates if it has multiple parents', () => {
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      var childActor = new ex.Actor(50, 50);
      var grandChildActor = new ex.Actor(10, 10);

      actor.add(childActor);
      childActor.add(grandChildActor);

      actor.actions.moveBy(10, 15, 1000);
      actor.update(engine, 1000);

      expect(grandChildActor.getWorldPos().x).toBe(70);
      expect(grandChildActor.getWorldPos().y).toBe(75);
   });

   it('can find its global coordinates if it doesn\'t have a parent', () => {
      expect(actor.pos.x).toBe(0);
      expect(actor.pos.y).toBe(0);

      actor.actions.moveBy(10, 15, 1000);
      actor.update(engine, 1000);

      expect(actor.getWorldPos().x).toBe(10);
      expect(actor.getWorldPos().y).toBe(15);
   });

   it('can be removed from the scene', () => {
      scene.add(actor);
      expect(scene.children.length).toBe(1);
      actor.kill();
      scene.update(engine, 100);
      expect(scene.children.length).toBe(0);
   });

   it('once killed is not drawn', () => {
      scene.add(actor);
      actor.kill();
      scene.update(engine, 100);
      scene.draw(engine.ctx, 100);
      expect(actor.draw).not.toHaveBeenCalled();
   });

   it('does not incure pointer overhead until an event is registered', () => {
      expect(actor.enableCapturePointer).toBeFalsy();
      expect(actor.capturePointer.captureMoveEvents).toBeFalsy();
      actor.on('pointerdown', () => { /*do nothing*/ });
      expect(actor.capturePointer.captureMoveEvents).toBeFalsy();
      expect(actor.enableCapturePointer).toBeTruthy();
      actor.on('pointermove', () => { /*do nothing*/ });
      expect(actor.capturePointer.captureMoveEvents).toBeTruthy();
      expect(actor.enableCapturePointer).toBeTruthy();
   });
	
   it('changes opacity on color', () => {
      actor.color = ex.Color.Black.clone();
      expect(actor.color.a).toBe(1);
      expect(actor.color.r).toBe(0);
      expect(actor.color.g).toBe(0);
      expect(actor.color.b).toBe(0);
		
      expect(actor.opacity).toBe(1.0);
      actor.opacity = .5;
		
      actor.update(engine, 100);
      expect(actor.color.a).toBe(.5);
      expect(actor.color.r).toBe(0);
      expect(actor.color.g).toBe(0);
      expect(actor.color.b).toBe(0);
   });
   
   it('can detect containment off of child actors', () => {
      var parent = new ex.Actor(600, 100, 100, 100);
      var child = new ex.Actor(0, 0, 100, 100);
      var child2 = new ex.Actor(-600, -100, 100, 100);
	  
      parent.add(child);
      child.add(child2);
	  
      // check reality
      expect(parent.contains(550, 50)).toBeTruthy();
      expect(parent.contains(650, 150)).toBeTruthy();

      // in world coordinates this should be false 
      expect(child.contains(50, 50)).toBeFalsy();
	  
      // in world coordinates this should be true
      expect(child.contains(550, 50)).toBeTruthy();
      expect(child.contains(650, 150)).toBeTruthy();
	  
      // second order child shifted to the origin
      expect(child2.contains(-50, -50)).toBeTruthy();
      expect(child2.contains(50, 50)).toBeTruthy();	   
   });
   
   it('can recursively check containment', () => {
      var parent = new ex.Actor(0, 0, 100, 100); 
      var child = new ex.Actor(100, 100, 100, 100);
      var child2 = new ex.Actor(100, 100, 100, 100);
      parent.add(child);
	  
      expect(parent.contains(150, 150)).toBeFalsy();
      expect(child.contains(150, 150)).toBeTruthy();
      expect(parent.contains(150, 150, true)).toBeTruthy();
      expect(parent.contains(200, 200, true)).toBeFalsy();
	  
      child.add(child2);
      expect(parent.contains(250, 250, true)).toBeTruthy();	  
   });

   it('with an active collision type can be placed on a fixed type', () => {
      var scene = new ex.Scene(engine); 
	  
      var active = new ex.Actor(0, -50, 100, 100);
      active.collisionType = ex.CollisionType.Active;
      active.vel.y = 10;
      active.acc.y = 1000;
	  
      var fixed = new ex.Actor(-100, 50, 1000, 100);
      fixed.collisionType = ex.CollisionType.Fixed;
	  
      scene.add(active);
      scene.add(fixed);
	  
      expect(active.pos.x).toBe(0);
      expect(active.pos.y).toBe(-50);

      expect(fixed.pos.x).toBe(-100);
      expect(fixed.pos.y).toBe(50);
	  
      // update many times for safety
      for (var i = 0; i < 40; i++) {
         scene.update(engine, 100);
      }
	 	  
      expect(active.pos.x).toBe(0);
      expect(active.pos.y).toBe(-50);
	  
      expect(fixed.pos.x).toBe(-100);
      expect(fixed.pos.y).toBe(50);
   });

   it('updates child actors', () => {
      var parentActor = new ex.Actor();
      var childActor = new ex.Actor();
      scene.add(parentActor);
      parentActor.add(childActor);
      
      spyOn(childActor, 'update');
      
      scene.update(engine, 100);
      
      expect(childActor.update).toHaveBeenCalled();
   });
   
   it('draws visible child actors', () => {
      var parentActor = new ex.Actor();
      var childActor = new ex.Actor();
      scene.add(parentActor);
      parentActor.add(childActor);
      
      spyOn(childActor, 'draw');
      
      childActor.visible = true;
      scene.draw(engine.ctx, 100);
      expect(childActor.draw).toHaveBeenCalled();
   });
   
   it('does not draw invisible child actors', () => {
      var parentActor = new ex.Actor();
      var childActor = new ex.Actor();
      scene.add(parentActor);
      parentActor.add(childActor);
      
      spyOn(childActor, 'draw');
      
      childActor.visible = false;
      scene.draw(engine.ctx, 100);
      expect(childActor.draw).not.toHaveBeenCalled();
   });
   
   it('fires a killed event when killed', () => {
      var actor = new ex.Actor();
      scene.add(actor);
      var killed = false;
      actor.on('kill', (evt: ex.KillEvent) => {
         killed = true;
      });
      actor.kill();
      
      expect(killed).toBe(true);
   });
   
   it('is no longer killed when re-added to the game', () => {
      var actor = new ex.Actor();
      scene.add(actor);
      expect(actor.isKilled()).toBeFalsy();
      actor.kill();
      scene.update(engine, 100);
      expect(actor.isKilled()).toBeTruthy();
      scene.add(actor);
      expect(actor.isKilled()).toBeFalsy();
   });
   
});
