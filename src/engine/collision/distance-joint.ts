import type { PhysicsWorld } from './physics-world';
import { PauseComponentTag } from '../entity-component-system/components/pause-component';
import type { BodyComponent } from './body-component';
import { DegreeOfFreedom } from './body-component';
import { CollisionType } from './collision-type';
import type { PhysicsConfig } from './physics-config';
import type { DeepRequired } from '../util/required';
import { Vector } from '../math/vector';
import { clamp } from '../math/util';

export interface DistanceJointOptions {
  bodyA: BodyComponent;
  bodyB: BodyComponent;
  anchorA: Vector;
  anchorB: Vector;
  length: number;
}

/** A rigid connection between two body-local anchors. */
export class DistanceJoint {
  public readonly bodyA: BodyComponent;
  public readonly bodyB: BodyComponent;
  public readonly anchorA: Vector;
  public readonly anchorB: Vector;
  public readonly length: number;

  private _physicsWorld: PhysicsWorld | null = null;

  /** @internal */
  public setPhysicsWorld(world: PhysicsWorld | null): void {
    this._physicsWorld = world;
  }

  /** @internal */
  public get isActive(): boolean {
    return (
      this._physicsWorld !== null &&
      [this.bodyA, this.bodyB].every(
        (body) => body.owner?.isActive && body.owner.scene?.physics === this._physicsWorld && !body.owner.hasTag(PauseComponentTag)
      )
    );
  }

  private _canSolve(): boolean {
    return (
      this.isActive &&
      !(this.bodyA.collisionType === CollisionType.Active && this.bodyA.isSleeping) &&
      !(this.bodyB.collisionType === CollisionType.Active && this.bodyB.isSleeping)
    );
  }

  private _pointA = Vector.Zero;
  private _pointB = Vector.Zero;
  private _offsetA = Vector.Zero;
  private _offsetB = Vector.Zero;
  private _normal = Vector.Right;
  private _distance = 0;
  private _inverseEffectiveMass = 0;

  constructor(options: DistanceJointOptions) {
    if (!Number.isFinite(options.length) || options.length <= 0) {
      throw new Error('Distance joint length must be finite and positive');
    }
    this.bodyA = options.bodyA;
    this.bodyB = options.bodyB;
    this.anchorA = options.anchorA.clone();
    this.anchorB = options.anchorB.clone();
    this.length = options.length;
  }

  /** @internal */
  public updateSleepState(slop: number): void {
    if (!this.isActive || ![this.bodyA, this.bodyB].some((body) => body.collisionType === CollisionType.Active && body.isSleeping)) {
      return;
    }
    this._updateGeometry();
    const movingFixedEndpoint = [this.bodyA, this.bodyB].some(
      (body) => body.collisionType === CollisionType.Fixed && (body.vel.x !== 0 || body.vel.y !== 0 || body.angularVelocity !== 0)
    );
    if (movingFixedEndpoint || Math.abs(this._distance - this.length) > slop) {
      this.bodyA.wake();
      this.bodyB.wake();
    }
  }

  /** @internal */
  public solveVelocity(): void {
    if (!this._canSolve()) {
      return;
    }
    this._updateGeometry();
    const a = this.bodyA;
    const b = this.bodyB;
    const velocityX = b.vel.x - b.angularVelocity * this._offsetB.y - a.vel.x + a.angularVelocity * this._offsetA.y;
    const velocityY = b.vel.y + b.angularVelocity * this._offsetB.x - a.vel.y - a.angularVelocity * this._offsetA.x;
    const speed = velocityX * this._normal.x + velocityY * this._normal.y;
    const impulse = -speed * this._inverseEffectiveMass;
    this._applyVelocity(a, this._offsetA, -impulse);
    this._applyVelocity(b, this._offsetB, impulse);
  }

  /** @internal */
  public solvePosition(config: DeepRequired<PhysicsConfig>['realistic']): void {
    if (!this._canSolve()) {
      return;
    }
    this._updateGeometry();
    const error = this._distance - this.length;
    const correction = Math.sign(error) * Math.max(0, Math.abs(error) - config.slop);
    const limit = Math.abs(config.maxPositionCorrection);
    const impulse = -clamp(config.steeringFactor * correction, -limit, limit) * this._inverseEffectiveMass;
    this._applyPosition(this.bodyA, this._offsetA, -impulse);
    this._applyPosition(this.bodyB, this._offsetB, impulse);
  }

  private _inverseInertia(body: BodyComponent): number {
    if (body.collisionType !== CollisionType.Active || body.limitDegreeOfFreedom.includes(DegreeOfFreedom.Rotation)) {
      return 0;
    }
    return body.inertia > 0 ? body.inverseInertia : 0;
  }

  private _axisMass(body: BodyComponent, axis: DegreeOfFreedom): number {
    return body.collisionType === CollisionType.Active && !body.limitDegreeOfFreedom.includes(axis) ? body.inverseMass : 0;
  }

  private _updateGeometry(): void {
    this.bodyA.transform.get().matrix.multiply(this.anchorA, this._pointA);
    this.bodyB.transform.get().matrix.multiply(this.anchorB, this._pointB);
    this._pointA.sub(this.bodyA.globalPos, this._offsetA);
    this._pointB.sub(this.bodyB.globalPos, this._offsetB);
    const dx = this._pointB.x - this._pointA.x;
    const dy = this._pointB.y - this._pointA.y;
    this._distance = Math.hypot(dx, dy);
    if (this._distance > 0) {
      this._normal.setTo(dx / this._distance, dy / this._distance);
    }
    const nx = this._normal.x;
    const ny = this._normal.y;
    const crossA = this._offsetA.cross(this._normal);
    const crossB = this._offsetB.cross(this._normal);
    const mass =
      (this._axisMass(this.bodyA, DegreeOfFreedom.X) + this._axisMass(this.bodyB, DegreeOfFreedom.X)) * nx * nx +
      (this._axisMass(this.bodyA, DegreeOfFreedom.Y) + this._axisMass(this.bodyB, DegreeOfFreedom.Y)) * ny * ny +
      this._inverseInertia(this.bodyA) * crossA * crossA +
      this._inverseInertia(this.bodyB) * crossB * crossB;
    this._inverseEffectiveMass = mass > 0 ? 1 / mass : 0;
  }

  private _applyVelocity(body: BodyComponent, offset: Vector, impulse: number): void {
    if (body.collisionType !== CollisionType.Active || impulse === 0) {
      return;
    }
    const x = this._normal.x * impulse;
    const y = this._normal.y * impulse;
    body.vel.x += this._axisMass(body, DegreeOfFreedom.X) * x;
    body.vel.y += this._axisMass(body, DegreeOfFreedom.Y) * y;
    body.angularVelocity += this._inverseInertia(body) * (offset.x * y - offset.y * x);
  }

  private _applyPosition(body: BodyComponent, offset: Vector, impulse: number): void {
    if (body.collisionType !== CollisionType.Active || impulse === 0) {
      return;
    }
    const x = this._normal.x * impulse;
    const y = this._normal.y * impulse;
    body.globalPos = body.globalPos.add(
      new Vector(this._axisMass(body, DegreeOfFreedom.X) * x, this._axisMass(body, DegreeOfFreedom.Y) * y)
    );
    body.rotation += this._inverseInertia(body) * (offset.x * y - offset.y * x);
  }
}
