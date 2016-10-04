module ex {
  
   export interface ICollisionBroadphase {
      track(target: Body);
      untrack(tartet: Body);
      
      //getPairs(): CollisionContact[];
      detect(targets: Actor[], delta: number): CollisionContact[];
      update(targets: Actor[], delta: number): number;

      debugDraw(ctx, delta): void;
   }
 }