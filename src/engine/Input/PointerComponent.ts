import { Component } from '../EntityComponentSystem/Component';

/**
 * Add this component to optionally configure how the pointer
 * system detects pointer events.
 *
 * By default the collider shape is used and graphics bounds is not.
 *
 * If both collider shape and graphics bounds are enabled it will fire events if either or
 * are intersecting the pointer.
 */
export class PointerComponent extends Component<'ex.pointer'> {
  public readonly type = 'ex.pointer';
  /**
   * Use any existsing Collider component geometry for pointers
   */
  public useColliderShape = true;
  /**
   * Use any existing Graphics component bounds for pointers
   */
  public useGraphicsBounds = false;
}