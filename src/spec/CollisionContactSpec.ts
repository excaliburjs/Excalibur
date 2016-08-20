/// <reference path="jasmine.d.ts" />
/// <reference path="require.d.ts" />
/// <reference path="Mocks.ts" />

describe('A CollisionContact', () => {
   var actorA: ex.Actor;
   var actorB: ex.Actor;

   beforeEach(() => {
      actorA = new ex.Actor(0, 0, 20, 20);
      actorA.collisionType = ex.CollisionType.Active;
      actorA.collisionArea = new ex.CircleArea({
         radius: 10,
         body: actorA.body
      });

      actorB = new ex.Actor(20, 0, 20, 20);
      actorB.collisionType = ex.CollisionType.Active;
      
      actorB.collisionArea = new ex.CircleArea({
         radius: 10,
         body: actorB.body
      });
   });

   it('exists', () => {
      expect(ex.CollisionContact).toBeDefined();
   });

   it('can be created', () => {

      var cc = new ex.CollisionContact(actorA.collisionArea, 
                                       actorB.collisionArea, 
                                       ex.Vector.Zero.clone(), 
                                       new ex.Vector(10, 0), 
                                       ex.Vector.Right.clone());
      expect(cc).not.toBe(null);
   });

   it('can reslove in the Box system', () => {
      actorB.x = 19;
      var cc = new ex.CollisionContact(actorA.collisionArea, 
                                       actorB.collisionArea, 
                                       ex.Vector.Right.clone(), 
                                       new ex.Vector(10, 0), 
                                       ex.Vector.Right.clone());
      cc.resolve(100, ex.CollisionResolutionStrategy.Box);      

      expect(actorA.x).toBe(-.5);
      expect(actorA.y).toBe(0);

      expect(actorB.x).toBe(19.5);
      expect(actorB.y).toBe(0);
   });

   it('emits a collision event on both in the Box system', () => {
      var emittedA = false;
      var emittedB = false;

      actorA.on('collision', () => {
         emittedA = true;
      });

      actorB.on('collision', () => {
         emittedB = true;
      });

      actorB.x = 19;
      var cc = new ex.CollisionContact(actorA.collisionArea, 
                                       actorB.collisionArea, 
                                       ex.Vector.Right.clone(), 
                                       new ex.Vector(10, 0), 
                                       ex.Vector.Right.clone());
      cc.resolve(100, ex.CollisionResolutionStrategy.Box);

      expect(emittedA).toBe(true);
      expect(emittedB).toBe(true);

   });

   it('can reslove in the Dynamic system', () => {
      expect(actorA.x).toBe(0, 'Actor A should be y=10');
      expect(actorA.y).toBe(0, 'Actor A should be y=0');
      expect(actorB.x).toBe(20, 'Actor B should be x=20');
      expect(actorB.y).toBe(0, 'Actor B should be y=0');
      expect(actorA.vel.x).toBe(0, 'Actor A should not be moving in x');
      expect(actorB.vel.x).toBe(0, 'Actor B should not be moving in x');
      actorA.vel.x = 10;
      actorB.vel.x = -10;
      actorB.x = 19;
      actorA.collisionArea.recalc();
      actorB.collisionArea.recalc();
      var cc = new ex.CollisionContact(actorA.collisionArea, 
                                       actorB.collisionArea, 
                                       ex.Vector.Right.clone(), 
                                       new ex.Vector(10, 0), 
                                       ex.Vector.Right.clone());
      cc.resolve(100, ex.CollisionResolutionStrategy.RigidBody);

      // mtv's are cached and not applied until all pairs are resolved, so we need to call it manually here
      actorA.applyMtv();
      actorB.applyMtv();
      
      expect(actorA.x).toBe(-.5);
      expect(actorA.y).toBe(0);
      expect(actorA.vel.x).toBeLessThan(0);
      expect(actorA.vel.y).toBe(0);

      expect(actorB.x).toBe(19.5);
      expect(actorB.y).toBe(0);
      expect(actorB.vel.x).toBeGreaterThan(0);
      expect(actorB.vel.y).toBe(0);
      
   });

   it('emits a collision event on both in the Dynamic system', () => {
      var emittedA = false;
      var emittedB = false;


      actorA.on('collision', () => {
         emittedA = true;
      });

      actorB.on('collision', () => {
         emittedB = true;
      });

      actorB.x = 19;
      var cc = new ex.CollisionContact(actorA.collisionArea, 
                                       actorB.collisionArea, 
                                       ex.Vector.Right.clone(), 
                                       new ex.Vector(10, 0), 
                                       ex.Vector.Right.clone());
      cc.resolve(100, ex.CollisionResolutionStrategy.RigidBody);

      

      expect(emittedA).toBe(true);
      expect(emittedB).toBe(true);

   });
});