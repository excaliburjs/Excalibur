import { Vector } from './../Algebra';
import { BroadphaseStrategy, CollisionResolutionStrategy } from '../Physics';

export interface IEnginePhysics {
  /**
   * Global engine acceleration, useful for defining consistent gravity on all actors
   */
  acc: Vector;
  /**
   * Global to switch physics on or off (switching physics off will improve performance)
   */
  enabled: boolean;
  /**
   * Default mass of new actors created in excalibur
   */
  defaultMass: number;
  /**
   * Number of pos/vel integration steps
   */
  integrationSteps: number;
  /**
   * The integration method
   */
  integrator: string;
  /**
   * Number of collision resolution passes
   */
  collisionPasses: number;

  /**
   * Broadphase strategy for identifying potential collision contacts
   */
  broadphaseStrategy: BroadphaseStrategy;

  /**
   * Collision resolution strategy for handling collision contacts
   */
  collisionResolutionStrategy: CollisionResolutionStrategy;

  /**
   * Bias motion calculation towards the current frame, or the last frame
   */
  motionBias: number;
  /**
   * Allow rotation in the physics simulation
   */
  allowRotation: boolean;
}
