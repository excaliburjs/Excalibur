module ex {

   export interface ICollisionBroadphase {
      register(target: Actor);
      remove(tartet: Actor);
      resolve(targets: Actor[]): CollisionContact[];
      update(targets: Actor[]): number;
      debugDraw(ctx, delta): void;
   }
 }