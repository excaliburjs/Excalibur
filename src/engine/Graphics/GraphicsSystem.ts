import { isActor } from '../Actor';
import { ExcaliburGraphicsContext } from './Context/ExcaliburGraphicsContext';
import { Scene } from '../Scene';
import { Entity } from '../Entity';
import { GraphicsComponent } from './GraphicsComponent';
import { TransformComponent, CoordPlane } from '../Transform';
// import { Rect } from './Rect';
// import { Color } from '../Drawing/Color';

export class GraphicsSystem {
  public readonly types = [GraphicsComponent.type, TransformComponent.type];
  constructor(public ctx: ExcaliburGraphicsContext, public scene: Scene) {}
  private _token = 0;

  public update(entities: Entity<GraphicsComponent | TransformComponent>[], delta: number): void {
    this._clearScreen();
    this._token++;
    // sort actors in z order
    entities.sort((a, b) => a.components.transform.z - b.components.transform.z);
    let transform: TransformComponent;
    let graphics: GraphicsComponent;
    for (let entity of entities) {
      transform = entity.components.transform;
      graphics = entity.components.graphics;

      if (this._isOffscreen(entity)) continue;
      this._pushCameraTransform(transform);

      this.ctx.save();
      graphics.update(delta, this._token);
      this._applyEntityTransform(transform);
      const [x, y] = this._applyActorAnchor(entity);
      this.ctx.z = transform.z;
      this.ctx.opacity = graphics.opacity * ((entity as any).opacity ?? 1);
      graphics.draw(this.ctx, x, y);
      // if ((this.scene as any)._engine.isDebug) {
      //   this.ctx.z = 99;
      //   if (isActor(entity)) {
      //     if (!graphics.__debug.colliderBounds) {
      //       graphics.__debug.colliderBounds = new Rect({
      //         color: Color.Transparent,
      //         lineWidth: 4,
      //         strokeColor: Color.Red,
      //         width: entity.width,
      //         height: entity.height
      //       });
      //     } else {
      //       graphics.__debug.colliderBounds.width = entity.body.collider.bounds.width;
      //       graphics.__debug.colliderBounds.height = entity.body.collider.bounds.height;
      //     }
      //     graphics.__debug.colliderBounds.draw(this.ctx, 0, 0);

      //     if (!graphics.__debug.graphicBounds) {
      //       graphics.__debug.graphicBounds = new Rect({
      //         color: Color.Transparent,
      //         lineWidth: 4,
      //         strokeColor: Color.Blue,
      //         width: graphics.current?.width ?? 0,
      //         height: graphics.current?.height ?? 0
      //       });
      //     } else {
      //       graphics.__debug.graphicBounds.width = graphics.current?.width ?? 0;
      //       graphics.__debug.graphicBounds.height = graphics.current?.height ?? 0;
      //     }
      //     graphics.__debug.graphicBounds.draw(this.ctx, x, y);
      //   }
      // }

      this.ctx.restore();

      this._popCameraTransform(transform);
    }
    this.ctx.flush();
  }

  private _clearScreen(): void {
    this.ctx.clear();
  }

  private _isOffscreen(entity: Entity) {
    if (isActor(entity)) {
      return entity.isOffScreen;
    }
    return false;
  }

  private _applyEntityTransform(transform: TransformComponent): void {
    this.ctx.translate(transform.pos.x, transform.pos.y);
    this.ctx.rotate(transform.rotation);
    this.ctx.scale(transform.scale.x, transform.scale.y);
  }

  private _applyActorAnchor(entity: Entity): [number, number] {
    if (isActor(entity)) {
      this.ctx.translate(-(entity.width * entity.anchor.x), -(entity.height * entity.anchor.y));

      // TODO this is odd
      const gfx = entity.graphics.current[0]?.graphic;
      if (gfx) {
        // See https://github.com/excaliburjs/Excalibur/pull/619 for discussion on this formula
        const offsetX = (entity.width - gfx.width * gfx.scale.x) * entity.anchor.x;
        const offsetY = (entity.height - gfx.height * gfx.scale.y) * entity.anchor.y;
        return [offsetX, offsetY];
      }
    }
    return [0, 0];
  }

  private _pushCameraTransform(transform: TransformComponent) {
    // Establish camera offset per entity
    if (transform.coordPlane === CoordPlane.World) {
      this.ctx.save();
      if (this?.scene?.camera) {
        this.scene.camera.draw(this.ctx);
      }
    }
  }

  private _popCameraTransform(transform: TransformComponent) {
    if (transform.coordPlane === CoordPlane.World) {
      // Apply camera world offset
      this.ctx.restore();
    }
  }
}
