import { Body } from './Body';
import { FrameStats } from './../Debug';
import { Pair } from './Pair';
import { Actor } from './../Actor';
import { CollisionResolutionStrategy } from '../Physics';

/**
 * Definition for collision broadphase
 */
export interface ICollisionBroadphase {
   /**
    * Track a physics body
    */
   track(target: Body): void;

   /**
    * Untrack a physics body
    */
   untrack(tartet: Body): void;

   /**
    * Detect potential collision pairs
    */
   broadphase(targets: Actor[], delta: number, stats?: FrameStats): Pair[];

   /**
    * Identify actual collisions from those pairs, and calculate collision impulse
    */
   narrowphase(pairs: Pair[], stats?: FrameStats): void;

   /**
    * Resolve the position and velocity of the physics bodies
    */
   resolve(delta: number, strategy: CollisionResolutionStrategy): void;

   /**
    * Update the internal structures to track bodies
    */
   update(targets: Actor[], delta: number): number;

   /**
    * Draw any debug information
    */
   debugDraw(ctx: CanvasRenderingContext2D, delta: number): void;
}
