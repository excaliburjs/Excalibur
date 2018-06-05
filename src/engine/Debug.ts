import { IDebugFlags } from './DebugFlags';
import { Pair } from './Collision/Pair';

/**
 * Debug stats containing current and previous frame statistics
 */
export interface IDebugStats {
  currFrame: FrameStats;
  prevFrame: FrameStats;
}

/**
 * Hash containing the [[Pair.id]]s of pairs that collided in a frame
 */
export interface ICollidersHash {
  [pairId: string]: Pair;
}

/**
 * Represents a frame's individual statistics
 */
export interface IFrameStats {
  /**
   * The number of the frame
   */
  id: number;

  /**
   * Gets the frame's delta (time since last frame scaled by [[Engine.timescale]]) (in ms)
   */
  delta: number;

  /**
   * Gets the frame's frames-per-second (FPS)
   */
  fps: number;

  /**
   * Duration statistics (in ms)
   */
  duration: IFrameDurationStats;

  /**
   * Actor statistics
   */
  actors: IFrameActorStats;

  /**
   * Physics statistics
   */
  physics: IPhysicsStats;
}

/**
 * Represents actor stats for a frame
 */
export interface IFrameActorStats {
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
export interface IFrameDurationStats {
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
export interface IPhysicsStats {
  /**
   * Gets the number of broadphase collision pairs which
   */
  pairs: number;

  /**
   * Gets the number of actual collisons
   */
  collisions: number;

  /**
   * A Hash storing the [[Pair.id]]s of [[Pair]]s that collided in the frame
   */
  collidersHash: ICollidersHash;

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

/**
 * Debug statistics and flags for Excalibur. If polling these values, it would be
 * best to do so on the `postupdate` event for [[Engine]], after all values have been
 * updated during a frame.
 */
export class Debug implements IDebugFlags {
  /**
   * Performance statistics
   */
  public stats: IDebugStats = {
    /**
     * Current frame statistics. Engine reuses this instance, use [[FrameStats.clone]] to copy frame stats.
     * Best accessed on [[postframe]] event. See [[IFrameStats]]
     */
    currFrame: new FrameStats(),

    /**
     * Previous frame statistics. Engine reuses this instance, use [[FrameStats.clone]] to copy frame stats.
     * Best accessed on [[preframe]] event. Best inspected on engine event `preframe`. See [[IFrameStats]]
     */
    prevFrame: new FrameStats()
  };
}

/**
 * Implementation of a frame's stats. Meant to have values copied via [[FrameStats.reset]], avoid
 * creating instances of this every frame.
 */
export class FrameStats implements IFrameStats {
  private _id: number = 0;
  private _delta: number = 0;
  private _fps: number = 0;
  private _actorStats: IFrameActorStats = {
    alive: 0,
    killed: 0,
    ui: 0,
    get remaining(this: IFrameActorStats) {
      return this.alive - this.killed;
    },
    get total(this: IFrameActorStats) {
      return this.remaining + this.ui;
    }
  };
  private _durationStats: IFrameDurationStats = {
    update: 0,
    draw: 0,
    get total(this: IFrameDurationStats) {
      return this.update + this.draw;
    }
  };

  private _physicsStats: PhysicsStats = new PhysicsStats();

  /**
   * Zero out values or clone other IFrameStat stats. Allows instance reuse.
   *
   * @param [otherStats] Optional stats to clone
   */
  public reset(otherStats?: IFrameStats) {
    if (otherStats) {
      this.id = otherStats.id;
      this.delta = otherStats.delta;
      this.fps = otherStats.fps;
      this.actors.alive = otherStats.actors.alive;
      this.actors.killed = otherStats.actors.killed;
      this.actors.ui = otherStats.actors.ui;
      this.duration.update = otherStats.duration.update;
      this.duration.draw = otherStats.duration.draw;
      this._physicsStats.reset(otherStats.physics);
    } else {
      this.id = this.delta = this.fps = 0;
      this.actors.alive = this.actors.killed = this.actors.ui = 0;
      this.duration.update = this.duration.draw = 0;
      this._physicsStats.reset();
    }
  }

  /**
   * Provides a clone of this instance.
   */
  public clone(): FrameStats {
    var fs = new FrameStats();

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
  public get delta() {
    return this._delta;
  }

  /**
   * Sets the frame's delta (time since last frame). Internal use only.
   * @internal
   */
  public set delta(value: number) {
    this._delta = value;
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
}

export class PhysicsStats implements IPhysicsStats {
  private _pairs: number = 0;
  private _collisions: number = 0;
  private _collidersHash: ICollidersHash = {};
  private _fastBodies: number = 0;
  private _fastBodyCollisions: number = 0;
  private _broadphase: number = 0;
  private _narrowphase: number = 0;

  /**
   * Zero out values or clone other IPhysicsStats stats. Allows instance reuse.
   *
   * @param [otherStats] Optional stats to clone
   */
  public reset(otherStats?: IPhysicsStats) {
    if (otherStats) {
      this.pairs = otherStats.pairs;
      this.collisions = otherStats.collisions;
      this.collidersHash = otherStats.collidersHash;
      this.fastBodies = otherStats.fastBodies;
      this.fastBodyCollisions = otherStats.fastBodyCollisions;
      this.broadphase = otherStats.broadphase;
      this.narrowphase = otherStats.narrowphase;
    } else {
      this.pairs = this.collisions = this.fastBodies = 0;
      this.fastBodyCollisions = this.broadphase = this.narrowphase = 0;
      this.collidersHash = {};
    }
  }

  /**
   * Provides a clone of this instance.
   */
  public clone(): IPhysicsStats {
    var ps = new PhysicsStats();

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

  public get collidersHash(): ICollidersHash {
    return this._collidersHash;
  }

  public set collidersHash(colliders: ICollidersHash) {
    this._collidersHash = colliders;
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
