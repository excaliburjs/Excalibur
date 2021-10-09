import { Vector } from '../Math/vector';
import { obsolete } from '../Util/Decorators';


/**
 * Possible collision resolution strategies
 *
 * The default is [[CollisionResolutionStrategy.Arcade]] which performs simple axis aligned arcade style physics. This is useful for things
 * like platformers or top down games.
 *
 * More advanced rigid body physics are enabled by setting [[CollisionResolutionStrategy.Realistic]] which allows for complicated
 * simulated physical interactions.
 */
export enum CollisionResolutionStrategy {
  Arcade = 'arcade',
  Realistic = 'realistic'
}

/**
 * Possible broadphase collision pair identification strategies
 *
 * The default strategy is [[BroadphaseStrategy.DynamicAABBTree]] which uses a binary tree of axis-aligned bounding boxes to identify
 * potential collision pairs which is O(nlog(n)) faster.
 */
export enum BroadphaseStrategy {
  DynamicAABBTree
}

/**
 * Possible numerical integrators for position and velocity
 */
export enum Integrator {
  Euler
}

/**
 * The [[Physics]] object is the global configuration object for all Excalibur physics.
 */
/* istanbul ignore next */
export class Physics {
  /**
   * Global acceleration that is applied to all vanilla actors that have a [[CollisionType.Active|active]] collision type.
   * Global acceleration won't effect [[Label|labels]], [[ScreenElement|ui actors]], or [[Trigger|triggers]] in Excalibur.
   *
   * This is a great way to globally simulate effects like gravity.
   */
  public static acc = new Vector(0, 0);
  public static get gravity() {
    return Physics.acc;
  }
  public static set gravity(v: Vector) {
    Physics.acc = v;
  }

  /**
   * Globally switches all Excalibur physics behavior on or off.
   */
  public static enabled = true;

  /**
   * Gets or sets the broadphase pair identification strategy.
   *
   * The default strategy is [[BroadphaseStrategy.DynamicAABBTree]] which uses a binary tree of axis-aligned bounding boxes to identify
   * potential collision pairs which is O(nlog(n)) faster.
   */
  public static broadphaseStrategy: BroadphaseStrategy = BroadphaseStrategy.DynamicAABBTree;

  /**
   * Gets or sets the global collision resolution strategy (narrowphase).
   *
   * The default is [[CollisionResolutionStrategy.Arcade]] which performs simple axis aligned arcade style physics.
   *
   * More advanced rigid body physics are enabled by setting [[CollisionResolutionStrategy.Realistic]] which allows for complicated
   * simulated physical interactions.
   */
  public static collisionResolutionStrategy: CollisionResolutionStrategy = CollisionResolutionStrategy.Arcade;
  /**
   * The default mass to use if none is specified
   */
  public static defaultMass: number = 10;
  /**
   * Gets or sets the position and velocity positional integrator, currently only Euler is supported.
   */
  public static integrator: Integrator = Integrator.Euler;

  /**
   * Configures Excalibur to use "arcade" physics. Arcade physics which performs simple axis aligned arcade style physics.
   */
  public static useArcadePhysics(): void {
    Physics.collisionResolutionStrategy = CollisionResolutionStrategy.Arcade;
  }

  /**
   * Configures Excalibur to use rigid body physics. Rigid body physics allows for complicated
   * simulated physical interactions.
   */
  public static useRealisticPhysics(): void {
    Physics.collisionResolutionStrategy = CollisionResolutionStrategy.Realistic;
  }

  /**
   * Factor to add to the RigidBody BoundingBox, bounding box (dimensions += vel * dynamicTreeVelocityMultiplier);
   */
  public static dynamicTreeVelocityMultiplier = 2;

  @obsolete({
    message: 'Alias for incorrect spelling used in older versions, will be removed in v0.25.0',
    alternateMethod: 'dynamicTreeVelocityMultiplier'
  })
  public static get dynamicTreeVelocityMultiplyer() {
    return Physics.dynamicTreeVelocityMultiplier;
  }

  public static set dynamicTreeVelocityMultiplyer(value: number) {
    Physics.dynamicTreeVelocityMultiplier = value;
  }

  /**
   * Pad RigidBody BoundingBox by a constant amount
   */
  public static boundsPadding = 5;

  /**
   * Number of position iterations (overlap) to run in the solver
   */
  public static positionIterations = 3;

  /**
   * Number of velocity iteration (response) to run in the solver
   */
  public static velocityIterations = 8;

  /**
   * Amount of overlap to tolerate in pixels
   */
  public static slop = 1;

  /**
   * Amount of positional overlap correction to apply each position iteration of the solver
   * O - meaning no correction, 1 - meaning correct all overlap
   */
  public static steeringFactor = 0.2;

  /**
   * Warm start set to true re-uses impulses from previous frames back in the solver
   */
  public static warmStart = true;

  /**
   * By default bodies do not sleep
   */
  public static bodiesCanSleepByDefault = false;

  /**
   * Surface epsilon is used to help deal with surface penetration
   */
  public static surfaceEpsilon = 0.1;

  public static sleepEpsilon = 0.07;

  public static wakeThreshold = Physics.sleepEpsilon * 3;

  public static sleepBias = 0.9;

  /**
   * Enable fast moving body checking, this enables checking for collision pairs via raycast for fast moving objects to prevent
   * bodies from tunneling through one another.
   */
  public static checkForFastBodies = true;

  /**
   * Disable minimum fast moving body raycast, by default if ex.Physics.checkForFastBodies = true Excalibur will only check if the
   * body is moving at least half of its minimum dimension in an update. If ex.Physics.disableMinimumSpeedForFastBody is set to true,
   * Excalibur will always perform the fast body raycast regardless of speed.
   */
  public static disableMinimumSpeedForFastBody = false;
}
