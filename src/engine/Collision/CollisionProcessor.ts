import { FrameStats } from '../Debug';
import { Pair } from './Pair';
import { Collider } from './Collider';
import { CollisionContact } from './CollisionContact';

/**
 * Definition for collision broadphase
 */
export interface CollisionProcessor {
  /**
   * Detect potential collision pairs
   */
  broadphase(targets: Collider[], delta: number, stats?: FrameStats): Pair[];

  /**
   * Identify actual collisions from those pairs, and calculate collision impulse
   */
  narrowphase(pairs: Pair[], stats?: FrameStats): CollisionContact[];

  /**
   * Update the internal structures to track bodies
   */
  update(targets: Collider[], delta: number): number;

  /**
   * Draw any debug information
   */
  debugDraw(ctx: CanvasRenderingContext2D, delta: number): void;
}
