module ex {
  
  /**
   * Definition for collision broadphase
   */
   export interface ICollisionBroadphase {
      /**
       * Track a physics body
       */
      track(target: Body);

      /**
       * Untrack a physics body
       */
      untrack(tartet: Body);
      
      /**
       * Detect potential collision pairs
       */
      broadphase(targets: Actor[], delta: number): Pair[];
      
      /**
       * Identify actual collisions from those pairs, and calculate collision impulse
       */
      narrowphase(pairs: Pair[]);
      
      /**
       * Resolve the position and velocity of the physics bodies
       */
      resolve(delta: number, strategy: CollisionResolutionStrategy);

      /**
       * Update the internal structures to track bodies
       */
      update(targets: Actor[], delta: number): number;

      debugDraw(ctx, delta): void;
   }
 }