/// <reference path="Collision/IPhysics.ts" />
module ex {
   export enum CollisionResolutionStrategy {
      Box,
      RigidBody      
   }
   
   export enum BroadphaseStrategy {
        Naive,
        DynamicAABBTree
    }

   /**
    * Static access engine global physics settings
    */
   export class Physics {
      public static acc = new ex.Vector(0, 0);
      public static enabled = true;
      public static collisionPasses = 5;
      public static broadphaseStrategy = BroadphaseStrategy.DynamicAABBTree;
      public static collisionResolutionStrategy = CollisionResolutionStrategy.Box;
      public static defaultMass = 10;
      public static integrator = 'euler';
      public static integrationSteps = 1;
      public static allowRotation = true;
      public static motionBias = .9;
   };
}