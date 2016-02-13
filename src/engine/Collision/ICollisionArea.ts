module ex {
   export interface ICollisionArea {
      pos: Vector;
      getCenter(): Vector;
      contains(point: Vector): boolean;
      getFurthestPoint(direction: Vector): Vector;
      getBounds(): BoundingBox;
      getAxis(): Vector[];
      project(axis: Vector): Projection;
      actor: Actor;
      
   } 
}