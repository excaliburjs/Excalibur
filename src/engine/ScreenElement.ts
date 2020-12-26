import { Vector } from './Algebra';
import { Engine } from './Engine';
import { Actor, ActorArgs } from './Actor';
import * as Traits from './Traits/Index';
import { CollisionType } from './Collision/CollisionType';
import { Shape } from './Collision/Shape';
import { CoordPlane } from './EntityComponentSystem/Components/TransformComponent';

/**
 * Helper [[Actor]] primitive for drawing UI's, optimized for UI drawing. Does
 * not participate in collisions. Drawn on top of all other actors.
 */
export class ScreenElement extends Actor {
  protected _engine: Engine;

  constructor();
  constructor(xOrConfig?: number, y?: number, width?: number, height?: number);
  constructor(config?: ActorArgs);
  /**
   * @param xOrConfig  The starting x coordinate of the actor or the actor option bag
   * @param y       The starting y coordinate of the actor
   * @param width   The starting width of the actor
   * @param height  The starting height of the actor
   */
  constructor(xOrConfig?: number | ActorArgs, y?: number, width?: number, height?: number) {
    if (typeof xOrConfig !== 'object') {
      super(<number>xOrConfig, y, width, height);
    } else {
      super(<ActorArgs>xOrConfig);
    }
    this.components.transform.coordPlane = CoordPlane.Screen;
    this.traits = [];
    this.traits.push(new Traits.CapturePointer());
    this.anchor.setTo(0, 0);
    this.body.collider.type = CollisionType.PreventCollision;
    this.body.collider.shape = Shape.Box(this.width, this.height, this.anchor);
    this.enableCapturePointer = true;
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
