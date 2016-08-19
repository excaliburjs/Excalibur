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

   export enum Integrator {
       Euler
   }

   /**
    * Static access engine global physics settings
    */
   /* istanbul ignore next */
   export class Physics {
      public static acc = new ex.Vector(0, 0);
      public static enabled = true;
      public static collisionPasses = 5;
      public static broadphaseStrategy: BroadphaseStrategy = BroadphaseStrategy.DynamicAABBTree;
      public static broadphaseDebug: boolean = false;
      public static showCollisionNormals: boolean = false;
      public static showMotionVectors: boolean = false;
      public static collisionResolutionStrategy: CollisionResolutionStrategy = CollisionResolutionStrategy.Box;
      public static defaultMass: number = 10;
      public static integrator: Integrator = Integrator.Euler;
      public static integrationSteps = 1;
      public static allowRotation = true;
      public static motionBias = .9;
   };
}