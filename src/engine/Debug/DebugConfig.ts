import { ColorBlindFlags } from './DebugFlags';
import type { Engine } from '../Engine';
import { Color } from '../Color';
import type { CollisionContact } from '../Collision/Detection/CollisionContact';
import type { StandardClock, TestClock } from '../Util/Clock';

/**
 * Debug stats containing current and previous frame statistics
 */
export interface DebugStats {
  currFrame: FrameStats;
  prevFrame: FrameStats;
}

/**
 * Represents a frame's individual statistics
 */
export interface FrameStatistics {
  /**
   * The number of the frame
   */
  id: number;

  /**
   * Gets the frame's delta (time since last frame scaled by {@apilink Engine.timescale}) (in ms)
   *
   * Excalibur extension depends on this
   */
  elapsedMs: number;

  /**
   * Gets the frame's frames-per-second (FPS)
   */
  fps: number;

  /**
   * Duration statistics (in ms)
   */
  duration: FrameDurationStats;

  /**
   * Actor statistics
   */
  actors: FrameActorStats;

  /**
   * Physics statistics
   */
  physics: PhysicsStatistics;

  /**
   * Graphics statistics
   */
  graphics: GraphicsStatistics;
}

/**
 * Represents actor stats for a frame
 */
export interface FrameActorStats {
  /**
   * Gets the frame's number of actors (alive)
   */
  alive: number;

  /**
   * Gets the frame's number of actors (killed)
   */
  killed: number;

  /**
   * Gets the frame's number of remaining actors (alive - killed)
   */
  remaining: number;

  /**
   * Gets the frame's number of UI actors
   */
  ui: number;

  /**
   * Gets the frame's number of total actors (remaining + UI)
   */
  total: number;
}

/**
 * Represents duration stats for a frame
 */
export interface FrameDurationStats {
  /**
   * Gets the frame's total time to run the update function (in ms)
   */
  update: number;

  /**
   * Gets the frame's total time to run the draw function (in ms)
   */
  draw: number;

  /**
   * Gets the frame's total render duration (update + draw duration) (in ms)
   */
  total: number;
}

/**
 * Represents physics stats for the current frame
 */
export interface PhysicsStatistics {
  /**
   * Gets the number of broadphase collision pairs which
   */
  pairs: number;

  /**
   * Gets the number of actual collisions
   */
  collisions: number;

  /**
   * Copy of the current frame contacts (only updated if debug is toggled on)
   */
  contacts: Map<string, CollisionContact>;

  /**
   * Gets the number of fast moving bodies using raycast continuous collisions in the scene
   */
  fastBodies: number;

  /**
   * Gets the number of bodies that had a fast body collision resolution
   */
  fastBodyCollisions: number;

  /**
   * Gets the time it took to calculate the broadphase pairs
   */
  broadphase: number;

  /**
   * Gets the time it took to calculate the narrowphase
   */
  narrowphase: number;
}

export interface GraphicsStatistics {
  drawCalls: number;
  drawnImages: number;
}

/**
 * Debug statistics and flags for Excalibur. If polling these values, it would be
 * best to do so on the `postupdate` event for {@apilink Engine}, after all values have been
 * updated during a frame.
 */
export class DebugConfig {
  private _engine: Engine;

  constructor(engine: Engine) {
    this._engine = engine;

    this.colorBlindMode = new ColorBlindFlags(this._engine);
  }

  /**
   * Switch the current excalibur clock with the {@apilink TestClock} and return
   * it in the same running state.
   *
   * This is useful when you need to debug frame by frame.
   */
  public useTestClock(): TestClock {
    const clock = this._engine.clock;
    const wasRunning = clock.isRunning();
    clock.stop();

    const testClock = clock.toTestClock();
    if (wasRunning) {
      testClock.start();
    }
    this._engine.clock = testClock;
    return testClock;
  }

  /**
   * Switch the current excalibur clock with the {@apilink StandardClock} and
   * return it in the same running state.
   *
   * This is useful when you need to switch back to normal mode after
   * debugging.
   */
  public useStandardClock(): StandardClock {
    const currentClock = this._engine.clock;
    const wasRunning = currentClock.isRunning();
    currentClock.stop();

    const standardClock = currentClock.toStandardClock();
    if (wasRunning) {
      standardClock.start();
    }
    this._engine.clock = standardClock;
    return standardClock;
  }

  /**
   * Performance statistics
   */
  public stats: DebugStats = {
    /**
     * Current frame statistics. Engine reuses this instance, use {@apilink FrameStats.clone} to copy frame stats.
     * Best accessed on {@apilink postframe} event. See {@apilink FrameStats}
     */
    currFrame: new FrameStats(),

    /**
     * Previous frame statistics. Engine reuses this instance, use {@apilink FrameStats.clone} to copy frame stats.
     * Best accessed on {@apilink preframe} event. Best inspected on engine event `preframe`. See {@apilink FrameStats}
     */
    prevFrame: new FrameStats()
  };

  /**
   * Correct or simulate color blindness using {@apilink ColorBlindnessPostProcessor}.
   * @warning Will reduce FPS.
   */
  public colorBlindMode: ColorBlindFlags;

  /**
   * Filter debug context to named entities or entity ids
   */
  public filter: { useFilter: boolean; nameQuery: string; ids: number[] } = {
    /**
     * Toggle filter on or off (default off) must be on for DebugDraw to use filters
     */
    useFilter: false,
    /**
     * Query for entities by name, if the entity name contains `nameQuery` it will be included
     */
    nameQuery: '',
    /**
     * Query for Entity ids, if the id matches it will be included
     */
    ids: []
  };

  /**
   * Entity debug settings
   */
  public entity = {
    showAll: false,
    showId: false,
    showName: false
  };

  /**
   * Transform component debug settings
   */
  public transform = {
    showAll: false,

    debugZIndex: 10_000_000,
    showPosition: false,
    showPositionLabel: false,
    positionColor: Color.Yellow,

    showZIndex: false,

    showScale: false,
    scaleColor: Color.Green,

    showRotation: false,
    rotationColor: Color.Blue
  };

  /**
   * Graphics component debug settings
   */
  public graphics = {
    showAll: false,

    showBounds: false,
    boundsColor: Color.Yellow
  };

  /**
   * Collider component debug settings
   */
  public collider = {
    showAll: false,

    showBounds: false,
    boundsColor: Color.Blue,

    showOwner: false,

    showGeometry: true,
    geometryColor: Color.Green,
    geometryLineWidth: 1,
    geometryPointSize: 0.5
  };

  /**
   * Physics simulation debug settings
   */
  public physics = {
    showAll: false,

    showBroadphaseSpacePartitionDebug: false,

    showCollisionNormals: false,
    collisionNormalColor: Color.Cyan,

    showCollisionContacts: true,
    contactSize: 2,
    collisionContactColor: Color.Red
  };

  /**
   * Motion component debug settings
   */
  public motion = {
    showAll: false,

    showVelocity: false,
    velocityColor: Color.Yellow,

    showAcceleration: false,
    accelerationColor: Color.Red
  };

  /**
   * Body component debug settings
   */
  public body = {
    showAll: false,

    showCollisionGroup: false,
    showCollisionType: false,
    showSleeping: false,
    showMotion: false,
    showMass: false
  };

  /**
   * Camera debug settings
   */
  public camera = {
    showAll: false,

    showFocus: false,
    focusColor: Color.Red,

    showZoom: false
  };

  public tilemap = {
    showAll: false,

    showGrid: false,
    gridColor: Color.Red,
    gridWidth: 0.5,
    showSolidBounds: false,
    solidBoundsColor: Color.fromHex('#8080807F'), // grayish
    showColliderGeometry: true
  };

  public isometric = {
    showAll: false,
    showPosition: false,
    positionColor: Color.Yellow,
    positionSize: 1,
    showGrid: false,
    gridColor: Color.Red,
    gridWidth: 1,
    showColliderGeometry: true
  };
}

/**
 * Implementation of a frame's stats. Meant to have values copied via {@apilink FrameStats.reset}, avoid
 * creating instances of this every frame.
 */
export class FrameStats implements FrameStatistics {
  private _id: number = 0;
  private _elapsedMs: number = 0;
  private _fps: number = 0;
  private _actorStats: FrameActorStats = {
    alive: 0,
    killed: 0,
    ui: 0,
    get remaining() {
      return this.alive - this.killed;
    },
    get total() {
      return this.remaining + this.ui;
    }
  };
  private _durationStats: FrameDurationStats = {
    update: 0,
    draw: 0,
    get total() {
      return this.update + this.draw;
    }
  };

  private _physicsStats: PhysicsStats = new PhysicsStats();

  private _graphicsStats: GraphicsStatistics = {
    drawCalls: 0,
    drawnImages: 0
  };

  /**
   * Zero out values or clone other IFrameStat stats. Allows instance reuse.
   * @param [otherStats] Optional stats to clone
   */
  public reset(otherStats?: FrameStatistics) {
    if (otherStats) {
      this.id = otherStats.id;
      this.elapsedMs = otherStats.elapsedMs;
      this.fps = otherStats.fps;
      this.actors.alive = otherStats.actors.alive;
      this.actors.killed = otherStats.actors.killed;
      this.actors.ui = otherStats.actors.ui;
      this.duration.update = otherStats.duration.update;
      this.duration.draw = otherStats.duration.draw;
      this._physicsStats.reset(otherStats.physics);
      this.graphics.drawCalls = otherStats.graphics.drawCalls;
      this.graphics.drawnImages = otherStats.graphics.drawnImages;
    } else {
      this.id = this.elapsedMs = this.fps = 0;
      this.actors.alive = this.actors.killed = this.actors.ui = 0;
      this.duration.update = this.duration.draw = 0;
      this._physicsStats.reset();
      this.graphics.drawnImages = this.graphics.drawCalls = 0;
    }
  }

  /**
   * Provides a clone of this instance.
   */
  public clone(): FrameStats {
    const fs = new FrameStats();

    fs.reset(this);

    return fs;
  }

  /**
   * Gets the frame's id
   */
  public get id() {
    return this._id;
  }

  /**
   * Sets the frame's id
   */
  public set id(value: number) {
    this._id = value;
  }

  /**
   * Gets the frame's delta (time since last frame)
   */
  public get elapsedMs() {
    return this._elapsedMs;
  }

  /**
   * Sets the frame's delta (time since last frame). Internal use only.
   * @internal
   */
  public set elapsedMs(value: number) {
    this._elapsedMs = value;
  }

  /**
   * Gets the frame's frames-per-second (FPS)
   */
  public get fps() {
    return this._fps;
  }

  /**
   * Sets the frame's frames-per-second (FPS). Internal use only.
   * @internal
   */
  public set fps(value: number) {
    this._fps = value;
  }

  /**
   * Gets the frame's actor statistics
   */
  public get actors() {
    return this._actorStats;
  }

  /**
   * Gets the frame's duration statistics
   */
  public get duration() {
    return this._durationStats;
  }

  /**
   * Gets the frame's physics statistics
   */
  public get physics() {
    return this._physicsStats;
  }

  /**
   * Gets the frame's graphics statistics
   */
  public get graphics() {
    return this._graphicsStats;
  }
}

export class PhysicsStats implements PhysicsStatistics {
  private _pairs: number = 0;
  private _collisions: number = 0;
  private _contacts: Map<string, CollisionContact> = new Map();
  private _fastBodies: number = 0;
  private _fastBodyCollisions: number = 0;
  private _broadphase: number = 0;
  private _narrowphase: number = 0;

  /**
   * Zero out values or clone other IPhysicsStats stats. Allows instance reuse.
   * @param [otherStats] Optional stats to clone
   */
  public reset(otherStats?: PhysicsStatistics) {
    if (otherStats) {
      this.pairs = otherStats.pairs;
      this.collisions = otherStats.collisions;
      this.contacts = otherStats.contacts;
      this.fastBodies = otherStats.fastBodies;
      this.fastBodyCollisions = otherStats.fastBodyCollisions;
      this.broadphase = otherStats.broadphase;
      this.narrowphase = otherStats.narrowphase;
    } else {
      this.pairs = this.collisions = this.fastBodies = 0;
      this.fastBodyCollisions = this.broadphase = this.narrowphase = 0;
      this.contacts.clear();
    }
  }

  /**
   * Provides a clone of this instance.
   */
  public clone(): PhysicsStatistics {
    const ps = new PhysicsStats();

    ps.reset(this);

    return ps;
  }

  public get pairs(): number {
    return this._pairs;
  }

  public set pairs(value: number) {
    this._pairs = value;
  }

  public get collisions(): number {
    return this._collisions;
  }

  public set collisions(value: number) {
    this._collisions = value;
  }

  public get contacts(): Map<string, CollisionContact> {
    return this._contacts;
  }

  public set contacts(contacts: Map<string, CollisionContact>) {
    this._contacts = contacts;
  }

  public get fastBodies(): number {
    return this._fastBodies;
  }

  public set fastBodies(value: number) {
    this._fastBodies = value;
  }

  public get fastBodyCollisions(): number {
    return this._fastBodyCollisions;
  }

  public set fastBodyCollisions(value: number) {
    this._fastBodyCollisions = value;
  }

  public get broadphase(): number {
    return this._broadphase;
  }

  public set broadphase(value: number) {
    this._broadphase = value;
  }

  public get narrowphase(): number {
    return this._narrowphase;
  }

  public set narrowphase(value: number) {
    this._narrowphase = value;
  }
}
