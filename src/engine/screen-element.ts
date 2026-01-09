import { Vector, vec } from './math/vector';
import type { Engine } from './engine';
import type { ActorArgs } from './actor';
import { Actor } from './actor';
import { TransformComponent } from './entity-component-system/components/transform-component';
import { CollisionType } from './collision/collision-type';
import { CoordPlane } from './math/coord-plane';

/**
 * Type guard to detect a screen element
 */
export function isScreenElement(actor: Actor) {
  return actor instanceof ScreenElement;
}

/**
 * Helper {@apilink Actor} primitive for drawing UI's, optimized for UI drawing. Does
 * not participate in collisions. Drawn on top of all other actors.
 */
export class ScreenElement extends Actor {
  protected _engine: Engine;

  constructor();
  constructor(config?: ActorArgs);

  constructor(config?: ActorArgs) {
    super({ ...config });
    this.get(TransformComponent).coordPlane = CoordPlane.Screen;
    this.anchor = config?.anchor ?? vec(0, 0);
    this.body.collisionType = config?.collisionType ?? CollisionType.PreventCollision;
    this.pointer.useGraphicsBounds = true;
    this.pointer.useColliderShape = false;
    if (!config?.collider && config?.width > 0 && config?.height > 0) {
      this.collider.useBoxCollider(config.width, config.height, this.anchor);
    }
  }

  public _initialize(engine: Engine) {
    this._engine = engine;
    super._initialize(engine);
  }

  public contains(x: number, y: number, useWorld: boolean = true) {
    if (useWorld) {
      return super.contains(x, y);
    }

    const coords = this._engine.worldToScreenCoordinates(new Vector(x, y));
    return super.contains(coords.x, coords.y);
  }
}
