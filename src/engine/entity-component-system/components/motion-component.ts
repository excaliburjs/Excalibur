import { Vector } from '../../math/vector';
import { Component } from '../component';

export interface Motion {
  /**
   * The velocity of an entity in pixels per second
   */
  vel: Vector;

  /**
   * The maximum component-wise velocity of an entity in pixels per second
   */
  maxVel: Vector;

  /**
   * The acceleration of entity in pixels per second^2
   */
  acc: Vector;

  /**
   * The scale rate of change in scale units per second
   */
  scaleFactor: Vector;

  /**
   * The angular velocity which is how quickly the entity is rotating in radians per second
   */
  angularVelocity: number;

  /**
   * The amount of torque applied to the entity, angular acceleration is torque * inertia
   */
  torque: number;

  /**
   * Inertia can be thought of as the resistance to motion
   */
  inertia: number;
}

export class MotionComponent extends Component {
  /**
   * The velocity of an entity in pixels per second
   */
  public vel: Vector = Vector.Zero;

  /**
   * The maximum component-wise velocity of an entity in pixels per second
   */
  public maxVel: Vector = Vector.One.scaleEqual(Infinity);

  /**
   * The acceleration of entity in pixels per second^2
   */
  public acc: Vector = Vector.Zero;

  /**
   * The scale rate of change in scale units per second
   */
  public scaleFactor: Vector = Vector.Zero;

  /**
   * The angular velocity which is how quickly the entity is rotating in radians per second
   */
  public angularVelocity = 0;

  /**
   * The amount of torque applied to the entity, angular acceleration is torque * inertia
   */
  public torque: number = 0;

  /**
   * Inertia can be thought of as the resistance to motion
   */
  public inertia: number = 1;

  /**
   * Configure per-entity integration systems
   */
  public integration: {
    /**
     * Integrate on screen only entities, defaults to false meaning all entities are integrated
     */
    onScreenOnly: boolean;
  } = {
    onScreenOnly: false
  };
}
