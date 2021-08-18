import { Vector } from '../Algebra';
import { CollisionType } from './CollisionType';
import { Physics } from './Physics';
import { Clonable } from '../Interfaces/Clonable';
import { TransformComponent } from '../EntityComponentSystem/Components/TransformComponent';
import { MotionComponent } from '../EntityComponentSystem/Components/MotionComponent';
import { Component } from '../EntityComponentSystem/Component';
import { Entity } from '../EntityComponentSystem/Entity';
import { CollisionGroup } from './Group/CollisionGroup';
import { EventDispatcher } from '../EventDispatcher';
import { CollisionEndEvent, CollisionStartEvent, PostCollisionEvent, PreCollisionEvent } from '../Events';
import { createId, Id } from '../Id';
import { clamp } from '../Util/Util';
import { DrawUtil } from '../Util/Index';
import { Color } from '../Drawing/Color';
import { ColliderComponent } from './ColliderComponent';

export interface BodyComponentOptions {
  type?: CollisionType;
  group?: CollisionGroup;
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
  public events = new EventDispatcher(this);

  constructor(options?: BodyComponentOptions) {
    super();
    if (options) {
      this.collisionType = options.type ?? this.collisionType;
      this.group = options.group ?? this.group;
    }
  }

  /**
   * Collision type of the body's colliders, by default [[CollisionType.PreventCollision]]
   */
  public collisionType: CollisionType = CollisionType.PreventCollision;

  /**
   * The collision group for the body's colliders, by default body colliders collide with everything
   */
  public group: CollisionGroup = CollisionGroup.All;

  /**
   * The amount of mass the body has
   */
  public mass: number = Physics.defaultMass;

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

  /**
   * Get the moment of inertia from the [[CollisionShape]]
   */
  public get inertia() {
    // TODO Add moments https://physics.stackexchange.com/questions/273394/is-moment-of-inertia-cumulative
    // TODO does this belong here?
    const collider = this.owner.get(ColliderComponent);
    if (collider?.collider) {
      return collider.collider.getInertia(this.mass);
    }
    return 0;
  }

  /**
   * Get the inverse moment of inertial from the [[CollisionShape]]. If [[CollisionType.Fixed]] this is 0, meaning "infinite" mass
   */
  public get inverseInertia() {
    return this.collisionType === CollisionType.Fixed ? 0 : 1 / this.inertia;
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
   * Should use global gravity [[Physics.gravity]]
   */
  public useGravity: boolean = true;

  /**
   * Degrees of freedom to limit
   */
  public limitDegreeOfFreedom: DegreeOfFreedom[] = [];

  /**
   *
   */
  public get active() {
    // todo active = alive?
    return this.owner?.active;
  }

  public get center() {
    return this.pos;
  }

  public get transform(): TransformComponent {
    return this.owner?.get(TransformComponent);
  }

  public get motion(): MotionComponent {
    return this.owner?.get(MotionComponent);
  }

  /**
   * The (x, y) position of the actor this will be in the middle of the actor if the
   * [[Actor.anchor]] is set to (0.5, 0.5) which is default.
   * If you want the (x, y) position to be the top left of the actor specify an anchor of (0, 0).
   */
  public get pos(): Vector {
    return this.transform.globalPos;
  }

  public set pos(val: Vector) {
    this.transform.globalPos = val;
  }

  /**
   * The position of the actor last frame (x, y) in pixels
   */
  public oldPos: Vector = new Vector(0, 0);

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
  public oldRotation: number = 0; // radians

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
   * @obsolete ex.Body.scale will be removed in v0.25.0, Use ex.Transform.scale
   */
  public get scale(): Vector {
    return this.transform.globalScale;
  }

  public set scale(val: Vector) {
    this.transform.globalScale = val;
  }

  /**
   * The scale of the actor last frame
   * @obsolete ex.Body.scale will be removed in v0.25.0
   */
  public oldScale: Vector = Vector.One;

  /**
   * The x scalar velocity of the actor in scale/second
   * @obsolete ex.Body.scale will be removed in v0.25.0
   */
  public get sx(): number {
    return this.motion.scaleFactor.x;
  }

  public set sx(xFactor: number) {
    this.motion.scaleFactor.x = xFactor;
  }

  /**
   * The y scalar velocity of the actor in scale/second
   * @obsolete ex.Body.scale will be removed in v0.25.0
   */
  public get sy(): number {
    return this.motion.scaleFactor.y;
  }

  public set sy(yFactor: number) {
    this.motion.scaleFactor.y = yFactor;
  }

  /**
   * The rotational velocity of the actor in radians/second
   * @deprecated
   */
  public get rx(): number {
    return this.motion.angularVelocity;
  }

  /**
   * The rotational velocity of the actor in radians/second
   * @deprecated
   */
  public set rx(value: number) {
    this.motion.angularVelocity = value;
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
      const distanceFromCenter = point.sub(this.pos);
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
   * Apply only angular impuse to the body
   * @param point
   * @param impulse
   */
  public applyAngularImpulse(point: Vector, impulse: Vector) {
    if (this.collisionType !== CollisionType.Active) {
      return; // only active objects participate in the simulation
    }

    if (!this.limitDegreeOfFreedom.includes(DegreeOfFreedom.Rotation)) {
      const distanceFromCenter = point.sub(this.pos);
      this.angularVelocity += this.inverseInertia * distanceFromCenter.cross(impulse);
    }
  }

  /**
   * Sets the old versions of pos, vel, acc, and scale.
   */
  public captureOldTransform() {
    // Capture old values before integration step updates them
    this.oldVel.setTo(this.vel.x, this.vel.y);
    this.oldPos.setTo(this.pos.x, this.pos.y);
    this.oldAcc.setTo(this.acc.x, this.acc.y);
    this.oldScale.setTo(this.scale.x, this.scale.y);
    this.oldRotation = this.rotation;
  }

  public hasChanged() {
    return !this.oldPos.equals(this.pos) || this.oldRotation !== this.rotation || this.oldScale !== this.scale;
  }

  onAdd(entity: Entity) {
    // this.update();
    this.events.on('precollision', (evt: any) => {
      entity.events.emit('precollision', new PreCollisionEvent(evt.target.owner.owner, evt.other.owner.owner, evt.side, evt.intersection));
    });
    this.events.on('postcollision', (evt: any) => {
      entity.events.emit(
        'postcollision',
        new PostCollisionEvent(evt.target.owner.owner, evt.other.owner.owner, evt.side, evt.intersection)
      );
    });
    this.events.on('collisionstart', (evt: any) => {
      entity.events.emit('collisionstart', new CollisionStartEvent(evt.target?.owner?.owner, evt.other?.owner?.owner, evt.contact));
    });
    this.events.on('collisionend', (evt: any) => {
      entity.events.emit('collisionend', new CollisionEndEvent(evt.target?.owner?.owner, evt.other?.owner?.owner));
    });
  }

  // onRemove() {
  //   this.events.clear();
  //   // Signal to remove colliders from process
  //   for (const collider of this._colliders) {
  //     this.$collidersRemoved.notifyAll(collider);
  //   }
  // }

  // update() {
  //   if (this.transform) {
  //     for (const collider of this._colliders) {
  //       collider.update(this.transform);
  //     }
  //   }
  // }

  debugDraw(ctx: CanvasRenderingContext2D) {
    // Draw motion vectors
    // TODO move to motion system
    if (Physics.debug.showMotionVectors) {
      DrawUtil.vector(ctx, Color.Yellow, this.pos, this.acc.add(Physics.acc));
      DrawUtil.vector(ctx, Color.Blue, this.pos, this.vel);
      DrawUtil.point(ctx, Color.Red, this.pos);
    }

    // TODO move to collision system
    // if (Physics.debug.showColliderBounds) {
    //   this.bounds.debugDraw(ctx, Color.Yellow);
    // }

    // if (Physics.debug.showColliderGeometry) {
    //   for (const collider of this._colliders) {
    //     collider.debugDraw(ctx, this.sleeping ? Color.Gray : Color.Green);
    //   }
    // }
  }

}