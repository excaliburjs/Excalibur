/// <reference path="CollisionContact.ts" />
/// <reference path="../DebugFlags.ts" />
module ex {
    export interface ICollisionArea {

      /**
       * Position of the collision area relative to the actor if it exists
       */
      pos: Vector;
      actor: Actor;

      getCenter(): Vector;      
      getFurthestPoint(direction: Vector): Vector;
      getBounds(): BoundingBox;
      getAxes(): Vector[];
      getMomentOfInertia(): number;
      
      // All new ICollisionAreas need to do the following
      // Create a new collision function in the CollisionJumpTable against all the primitives 
      // Currently there are 3 primitive collision areas 3! = 6 jump functions
      collide(area: ICollisionArea): CollisionContact;

      contains(point: Vector): boolean;
      castRay(ray: Ray): Vector;
      project(axis: Vector): Projection;

      /**
       * Recalculates internal caches
       */
      recalc(): void;

      debugDraw(ctx: CanvasRenderingContext2D, debugFlags: IDebugFlags);
      
   } 
}