import { Vector, vec } from '../Math/vector';
import { DeepRequired } from '../Util/Required';
import { SolverStrategy } from './SolverStrategy';
import { Physics } from './Physics';
import { ContactSolveBias } from './Solver/ContactBias';


export interface PhysicsConfig {
  /**
   * Excalibur physics simulation is enabled
   */
  enabled?: boolean;
  /**
   * Configure gravity that applies to all [[CollisionType.Active]] bodies.
   *
   * This is acceleration in pixels/sec^2
   *
   * Default vec(0, 0)
   *
   * [[BodyComponent.useGravity]] to opt out
   */
  gravity?: Vector;
  /**
   * Configure the type of physics simulation you would like
   *
   * * [[SolverStrategy.Arcade]] is suitable for games where you might be doing platforming or top down movement.
   * * [[SolverStrategy.Realistic]] is where you need objects to bounce off each other and respond like real world objects.
   *
   * Default is Arcade
   */
  solver?: SolverStrategy;

  /**
   * Configure colliders
   */
  colliders?: {
    /**
     * Treat composite collider's member colliders as either separate colliders for the purposes of onCollisionStart/onCollision
     * or as a single collider together.
     *
     * This property can be overridden on individual [[CompositeColliders]].
     *
     * For composites without gaps or small groups of colliders, you probably want 'together'
     *
     * For composites with deliberate gaps, like a platforming level layout, you probably want 'separate'
     *
     * Default is 'together' if unset
     */
    compositeStrategy?: 'separate' | 'together'
  }

  /**
   * Configure excalibur continuous collision (WIP)
   */
  continuous?: {

    /**
     * Enable fast moving body checking, this enables checking for collision pairs via raycast for fast moving objects to prevent
     * bodies from tunneling through one another.
     *
     * Default true
     */
    checkForFastBodies?: boolean;

    /**
     * Disable minimum fast moving body raycast, by default if checkForFastBodies = true Excalibur will only check if the
     * body is moving at least half of its minimum dimension in an update. If disableMinimumSpeedForFastBody is set to true,
     * Excalibur will always perform the fast body raycast regardless of speed.
     *
     * Default false
     */
    disableMinimumSpeedForFastBody?: boolean;

    /**
     * Surface epsilon is used to help deal with predicting collisions by applying a slop
     *
     * Default 0.1
     */
    surfaceEpsilon?: number;
  }

  /**
   * Configure body defaults
   */
  bodies?: {
    /**
     * Configure default mass that bodies have
     *
     * Default 10 mass units
     */
    defaultMass?: number;

    /**
     * Sleep epsilon
     *
     * Default 0.07
     */
    sleepEpsilon?: number;

    /**
     * Wake Threshold, the amount of "motion" need to wake a body from sleep
     *
     * Default 0.07 * 3;
     */
    wakeThreshold?: number;

    /**
     * Sleep bias
     *
     * Default 0.9
     */
    sleepBias?: number;

    /**
     * By default bodies do not sleep, this can be turned on to improve perf if you have a lot of bodies.
     *
     * Default false
     */
    canSleepByDefault?: boolean;
  }

  /**
   * Configure the dynamic tree spatial data structure for locating pairs and raycasts
   */
  dynamicTree?: {
    /**
     * Pad collider BoundingBox by a constant amount for purposes of potential pairs
     *
     * Default 5 pixels
     */
    boundsPadding?: number;

    /**
     * Factor to add to the collider BoundingBox, bounding box (dimensions += vel * dynamicTreeVelocityMultiplier);
     *
     * Default 2
     */
    velocityMultiplier?: number;
  }

  /**
   * Configure the [[ArcadeSolver]]
   */
  arcade?: {
    /**
     * Hints the [[ArcadeSolver]] to preferentially solve certain contact directions first.
     *
     * Options:
     * * Solve [[ContactSolveBias.VerticalFirst]] which will do vertical contact resolution first (useful for platformers
     * with up/down gravity)
     * * Solve [[ContactSolveBias.HorizontalFirst]] which will do horizontal contact resolution first (useful for games with
     * left/right forces)
     * * By default [[ContactSolveBias.None]] which sorts by distance
     */
    contactSolveBias?: ContactSolveBias;
  }

  /**
   * Configure the [[RealisticSolver]]
   */
  realistic?: {
    /**
     * Number of position iterations (overlap) to run in the solver
     *
     * Default 3 iterations
     */
    positionIterations?: number;

    /**
     * Number of velocity iteration (response) to run in the solver
     *
     * Default 8 iterations
     */
    velocityIterations?: number;

    /**
     * Amount of overlap to tolerate in pixels
     *
     * Default 1 pixel
     */
    slop?: number;

    /**
     * Amount of positional overlap correction to apply each position iteration of the solver
     * 0 - meaning no correction, 1 - meaning correct all overlap. Generally values 0 < .5 look nice.
     *
     * Default 0.2
     */
    steeringFactor?: number;

    /**
     * Warm start set to true re-uses impulses from previous frames back in the solver. Re-using impulses helps
     * the solver converge quicker
     *
     * Default true
     */
    warmStart?: boolean;
  }
}

export const DefaultPhysicsConfig: DeepRequired<PhysicsConfig> = {
  enabled: true,
  gravity: vec(0, 0),
  solver: SolverStrategy.Arcade,
  colliders: {
    compositeStrategy: 'together'
  },
  continuous: {
    checkForFastBodies: true,
    disableMinimumSpeedForFastBody: false,
    surfaceEpsilon: 0.1
  },
  bodies: {
    canSleepByDefault: false,
    sleepEpsilon: 0.07,
    wakeThreshold: 0.07 * 3,
    sleepBias: 0.9,
    defaultMass: 10
  },
  dynamicTree: {
    boundsPadding: 5,
    velocityMultiplier: 2
  },
  arcade: {
    contactSolveBias: ContactSolveBias.None
  },
  realistic: {
    positionIterations: 3,
    velocityIterations: 8,
    slop: 1,
    steeringFactor: 0.2,
    warmStart: true
  }
};

/**
 * @deprecated will be removed in v0.30
 */
export function DeprecatedStaticToConfig(): DeepRequired<PhysicsConfig> {
  return {
    enabled: Physics.enabled,
    gravity: Physics.gravity,
    solver: Physics.collisionResolutionStrategy,
    continuous: {
      checkForFastBodies: Physics.checkForFastBodies,
      disableMinimumSpeedForFastBody: Physics.disableMinimumSpeedForFastBody,
      surfaceEpsilon: Physics.surfaceEpsilon
    },
    colliders: {
      compositeStrategy: 'together'
    },
    bodies: {
      canSleepByDefault: Physics.bodiesCanSleepByDefault,
      sleepEpsilon: Physics.sleepEpsilon,
      wakeThreshold: Physics.wakeThreshold,
      sleepBias: Physics.sleepBias,
      defaultMass: Physics.defaultMass
    },
    dynamicTree: {
      boundsPadding: Physics.boundsPadding,
      velocityMultiplier: Physics.dynamicTreeVelocityMultiplier
    },
    arcade: {
      contactSolveBias: ContactSolveBias.None
    },
    realistic: {
      positionIterations: Physics.positionIterations,
      velocityIterations: Physics.velocityIterations,
      slop: Physics.slop,
      steeringFactor: Physics.steeringFactor,
      warmStart: Physics.warmStart
    }
  };
}