import { Component } from '../EntityComponentSystem/Component';
import { BoundingBox } from '../Collision/BoundingBox';

export interface PointerComponentOptions {
  useColliderShape?: boolean;
  useGraphicsBounds?: boolean;
  localBounds?: BoundingBox;
}

/**
 * Add this component to optionally configure how the pointer
 * system detects pointer events.
 *
 * By default the collider shape is used and graphics bounds is not.
 *
 * If both collider shape and graphics bounds are enabled it will fire events if either or
 * are intersecting the pointer.
 */
export class PointerComponent extends Component {
  /**
   * Use any existing Collider component geometry for pointer events. This is useful if you want
   * user pointer events only to trigger on the same collision geometry used in the collider component
   * for collision resolution. Default is `true`.
   */
  public useColliderShape = true;
  /**
   * Use any existing Graphics component bounds for pointers. This is useful if you want the axis aligned
   * bounds around the graphic to trigger pointer events. Default is `true`.
   */
  public useGraphicsBounds = true;

  /**
   * Optionally use other bounds for pointer testing
   */
  public localBounds?: BoundingBox;

  constructor(options?: PointerComponentOptions) {
    super();
    this.useColliderShape = options?.useColliderShape ?? this.useColliderShape;
    this.useGraphicsBounds = options?.useGraphicsBounds ?? this.useGraphicsBounds;
    this.localBounds = options?.localBounds;
  }
}
