import { Vector } from '../Math/vector';
import { CollisionType } from './CollisionType';
import { Physics } from './Physics';
import { Clonable } from '../Interfaces/Clonable';
import { TransformComponent } from '../EntityComponentSystem/Components/TransformComponent';
import { MotionComponent } from '../EntityComponentSystem/Components/MotionComponent';
import { Component } from '../EntityComponentSystem/Component';
import { CollisionGroup } from './Group/CollisionGroup';
import { EventDispatcher } from '../EventDispatcher';
import { createId, Id } from '../Id';
import { clamp } from '../Math/util';
import { ColliderComponent } from './ColliderComponent';
import { Transform } from '../Math/transform';

export interface BodyComponentOptions {
  type?: CollisionType;
  group?: CollisionGroup;
  useGravity?: boolean;
}

export enum DegreeOfFreedom {
  Rotation = 'rotation',
  X = 'x',
  Y = 'y'
}

/**
 * Body describes all the physical properties pos, vel, acc, rotation, angular velocity for the purpose of
 * of physics simulation.
 */
export class BodyComponent extends Component<'ex.body'> implements Clonable<BodyComponent> {
  public readonly type = 'ex.body';
  public dependencies = [TransformComponent, MotionComponent];
  public static _ID = 0;
  public readonly id: Id<'body'> = createId('body', BodyComponent._ID++);
  public events = new EventDispatcher();

  private _oldTransform = new Transform();

  /**
   * Indicates whether the old transform has been captured at least once for interpolation
   * @internal
   */
  public __oldTransformCaptured: boolean = false;

  /**
   * Enable or disabled the fixed update interpolation, by default interpolation is on.
   */
  public enableFixedUpdateInterpolate = true;

  constructor(options?: BodyComponentOptions) {
    super();
    if (options) {
      this.collisionType = options.type ?? this.collisionType;
      this.group = options.group ?? this.group;
      this.useGravity = options.useGravity ?? this.useGravity;
    }
  }

  public get matrix() {
    return this.transform.get().matrix;
  }

  /**
   * Collision type for the rigidbody physics simulation, by default [[CollisionType.PreventCollision]]
   */
  public collisionType: CollisionType = CollisionType.PreventCollision;

  /**
   * The collision group for the body's colliders, by default body colliders collide with everything
   */
  public group: CollisionGroup = CollisionGroup.All;

  /**
   * The amount of mass the body has
   */
  private _mass: number = Physics.defaultMass;
  public get mass(): number {
    return this._mass;
  }

  public set mass(newMass: number) {
    this._mass = newMass;
    this._cachedInertia = undefined;
    this._cachedInverseInertia = undefined;
  }

  /**
   * The inverse mass (1/mass) of the body. If [[CollisionType.Fixed]] this is 0, meaning "infinite" mass
   */
  public get inverseMass(): number {
    return this.collisionType === CollisionType.Fixed ? 0 : 1 / this.mass;
  }

  /**
   * Amount of "motion" the body has before sleeping. If below [[Physics.sleepEpsilon]] it goes to "sleep"
   */
  public sleepMotion: number = Physics.sleepEpsilon * 5;

  /**
   * Can this body sleep, by default bodies do not sleep
   */
  public canSleep: boolean = Physics.bodiesCanSleepByDefault;

  private _sleeping = false;
  /**
   * Whether this body is sleeping or not
   */
  public get sleeping(): boolean {
    return this._sleeping;
  }

  /**
   * Set the sleep state of the body
   * @param sleeping
   */
  public setSleeping(sleeping: boolean) {
    this._sleeping = sleeping;
    if (!sleeping) {
      // Give it a kick to keep it from falling asleep immediately
      this.sleepMotion = Physics.sleepEpsilon * 5;
    } else {
      this.vel = Vector.Zero;
      this.acc = Vector.Zero;
      this.angularVelocity = 0;
      this.sleepMotion = 0;
    }
  }

  /**
   * Update body's [[BodyComponent.sleepMotion]] for the purpose of sleeping
   */
  public updateMotion() {
    if (this._sleeping) {
      this.setSleeping(true);
    }
    const currentMotion = this.vel.size * this.vel.size + Math.abs(this.angularVelocity * this.angularVelocity);
    const bias = Physics.sleepBias;
    this.sleepMotion = bias * this.sleepMotion + (1 - bias) * currentMotion;
    this.sleepMotion = clamp(this.sleepMotion, 0, 10 * Physics.sleepEpsilon);
    if (this.canSleep && this.sleepMotion < Physics.sleepEpsilon) {
      this.setSleeping(true);
    }
  }

  private _cachedInertia: number;
  /**
   * Get the moment of inertia from the [[ColliderComponent]]
   */
  public get inertia() {
    if (this._cachedInertia) {
      return this._cachedInertia;
    }

    // Inertia is a property of the geometry, so this is a little goofy but seems to be okay?
    const collider = this.owner.get(ColliderComponent);
    if (collider) {
      collider.$colliderAdded.subscribe(() => {
        this._cachedInertia = null;
      });
      collider.$colliderRemoved.subscribe(() => {
        this._cachedInertia = null;
      });
      const maybeCollider = collider.get();
      if (maybeCollider) {
        return this._cachedInertia = maybeCollider.getInertia(this.mass);
      }
    }
    return 0;
  }

  private _cachedInverseInertia: number;
  /**
   * Get the inverse moment of inertial from the [[ColliderComponent]]. If [[CollisionType.Fixed]] this is 0, meaning "infinite" mass
   */
  public get inverseInertia() {
    if (this._cachedInverseInertia) {
      return this._cachedInverseInertia;
    }
    return this._cachedInverseInertia = this.collisionType === CollisionType.Fixed ? 0 : 1 / this.inertia;
  }

  /**
   * The also known as coefficient of restitution of this actor, represents the amount of energy preserved after collision or the
   * bounciness. If 1, it is 100% bouncy, 0 it completely absorbs.
   */
  public bounciness: number = 0.2;

  /**
   * The coefficient of friction on this actor
   */
  public friction: number = 0.99;

  /**
   * Should use global gravity [[Physics.gravity]] in it's physics simulation, default is true
   */
  public useGravity: boolean = true;

  /**
   * Degrees of freedom to limit
   *
   * Note: this only limits responses in the realistic solver, if velocity/angularVelocity is set the actor will still respond
   */
  public limitDegreeOfFreedom: DegreeOfFreedom[] = [];

  /**
   * Returns if the owner is active
   */
  public get active() {
    return !!this.owner?.active;
  }

  /**
   * @deprecated Use globalP0s
   */
  public get center() {
    return this.globalPos;
  }

  public get transform(): TransformComponent {
    return this.owner?.get(TransformComponent);
  }

  public get motion(): MotionComponent {
    return  this.owner?.get(MotionComponent);
  }

  public get pos(): Vector {
    return this.transform.pos;
  }

  public set pos(val: Vector) {
    this.transform.pos = val;
  }

  /**
   * The (x, y) position of the actor this will be in the middle of the actor if the
   * [[Actor.anchor]] is set to (0.5, 0.5) which is default.
   * If you want the (x, y) position to be the top left of the actor specify an anchor of (0, 0).
   */
  public get globalPos(): Vector {
    return this.transform.globalPos;
  }

  public set globalPos(val: Vector) {
    this.transform.globalPos = val;
  }

  /**
   * The position of the actor last frame (x, y) in pixels
   */
  public get oldPos(): Vector {
    return this._oldTransform.pos;
  }

  /**
   * The current velocity vector (vx, vy) of the actor in pixels/second
   */
  public get vel(): Vector {
    return this.motion.vel;
  }

  public set vel(val: Vector) {
    this.motion.vel = val;
  }

  /**
   * The velocity of the actor last frame (vx, vy) in pixels/second
   */
  public oldVel: Vector = new Vector(0, 0);

  /**
   * The current acceleration vector (ax, ay) of the actor in pixels/second/second. An acceleration pointing down such as (0, 100) may
   * be useful to simulate a gravitational effect.
   */
  public get acc(): Vector {
    return this.motion.acc;
  }

  public set acc(val: Vector) {
    this.motion.acc = val;
  }

  /**
   * Gets/sets the acceleration of the actor from the last frame. This does not include the global acc [[Physics.acc]].
   */
  public oldAcc: Vector = Vector.Zero;

  /**
   * The current torque applied to the actor
   */
  public get torque(): number {
    return this.motion.torque;
  }

  public set torque(val: number) {
    this.motion.torque = val;
  }

  /**
   * Gets/sets the rotation of the body from the last frame.
   */
  public get oldRotation(): number {
    return this._oldTransform.rotation;
  }

  /**
   * The rotation of the body in radians
   */
  public get rotation() {
    return this.transform.globalRotation;
  }

  public set rotation(val: number) {
    this.transform.globalRotation = val;
  }

  /**
   * The scale vector of the actor
   */
  public get scale(): Vector {
    return this.transform.globalScale;
  }

  public set scale(val: Vector) {
    this.transform.globalScale = val;
  }

  /**
   * The scale of the actor last frame
   */
  public get oldScale(): Vector {
    return this._oldTransform.scale;
  }

  /**
   * The scale rate of change of the actor in scale/second
   */
  public get scaleFactor(): Vector {
    return this.motion.scaleFactor;
  }

  public set scaleFactor(scaleFactor: Vector) {
    this.motion.scaleFactor = scaleFactor;
  }

  /**
   * Get the angular velocity in radians/second
   */
  public get angularVelocity(): number {
    return this.motion.angularVelocity;
  }

  /**
   * Set the angular velocity in radians/second
   */
  public set angularVelocity(value: number) {
    this.motion.angularVelocity = value;
  }

  /**
   * Apply a specific impulse to the body
   * @param point
   * @param impulse
   */
  public applyImpulse(point: Vector, impulse: Vector) {
    if (this.collisionType !== CollisionType.Active) {
      return; // only active objects participate in the simulation
    }

    const finalImpulse = impulse.scale(this.inverseMass);
    if (this.limitDegreeOfFreedom.includes(DegreeOfFreedom.X)) {
      finalImpulse.x = 0;
    }
    if (this.limitDegreeOfFreedom.includes(DegreeOfFreedom.Y)) {
      finalImpulse.y = 0;
    }

    this.vel.addEqual(finalImpulse);

    if (!this.limitDegreeOfFreedom.includes(DegreeOfFreedom.Rotation)) {
      const distanceFromCenter = point.sub(this.globalPos);
      this.angularVelocity += this.inverseInertia * distanceFromCenter.cross(impulse);
    }
  }

  /**
   * Apply only linear impulse to the body
   * @param impulse
   */
  public applyLinearImpulse(impulse: Vector) {
    if (this.collisionType !== CollisionType.Active) {
      return; // only active objects participate in the simulation
    }

    const finalImpulse = impulse.scale(this.inverseMass);

    if (this.limitDegreeOfFreedom.includes(DegreeOfFreedom.X)) {
      finalImpulse.x = 0;
    }
    if (this.limitDegreeOfFreedom.includes(DegreeOfFreedom.Y)) {
      finalImpulse.y = 0;
    }

    this.vel = this.vel.add(finalImpulse);
  }

  /**
   * Apply only angular impulse to the body
   * @param point
   * @param impulse
   */
  public applyAngularImpulse(point: Vector, impulse: Vector) {
    if (this.collisionType !== CollisionType.Active) {
      return; // only active objects participate in the simulation
    }

    if (!this.limitDegreeOfFreedom.includes(DegreeOfFreedom.Rotation)) {
      const distanceFromCenter = point.sub(this.globalPos);
      this.angularVelocity += this.inverseInertia * distanceFromCenter.cross(impulse);
    }
  }

  /**
   * Sets the old versions of pos, vel, acc, and scale.
   */
  public captureOldTransform() {
    // Capture old values before integration step updates them
    this.__oldTransformCaptured = true;
    this.transform.get().clone(this._oldTransform);
    this.oldVel.setTo(this.vel.x, this.vel.y);
    this.oldAcc.setTo(this.acc.x, this.acc.y);
  }
}
