module ex {
   export interface ICollisionArea {
      pos: Vector;

      getCenter(): Vector;      
      getFurthestPoint(direction: Vector): Vector;
      getBounds(): BoundingBox;
      getAxes(): Vector[];
      
      // All new ICollisionAreas need to do the following
      // Create a new collision function in the CollisionJumpTable against all the primitives 
      // Currently there are 3 primitive collision areas 3! = 6 jump functions
      collide(area: ICollisionArea): CollisionContact;

      contains(point: Vector): boolean;
      castRay(ray: Ray): Vector;
      project(axis: Vector): Projection;
      actor: Actor;
      
   } 
}