module ex {

   export interface ICollisionBroadphase {
      register(target: Actor);
      remove(tartet: Actor);

      resolve(targets: Actor[], delta: number): CollisionContact[];
      update(targets: Actor[], delta: number): number;

      debugDraw(ctx, delta): void;
   }
 }