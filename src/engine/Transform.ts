import { Component } from './Component';
import { Vector } from './Algebra';
import { Entity } from './Entity';

/**
 * Enum representing the coordinate plane for the position 2D vector in the [[TransformComponent]]
 */
export enum CoordPlane {
  /**
   * The world coordinate plane (default) represents world space, any entities drawn with world space move when the camera moves.
   */
  World = 'world',
  /**
   * The screen coordinate plane represents screen space, entities drawn in screen space are pinned to screen coordinates ignoring the camera.
   */
  Screen = 'screen'
}

export class TransformComponent implements Component<'transform'> {
  static type = 'transform';
  readonly type = 'transform';
  public owner: Entity = null;

  public coordPlane = CoordPlane.World;
  public pos: Vector = Vector.Zero;
  public z: number = 0;
  public rotation: number = 0;
  public scale: Vector = Vector.One;
}
