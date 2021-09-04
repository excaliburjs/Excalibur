import { Engine } from '../Engine';
import { Scene } from '../Scene';
import { Camera } from '../Camera';
import { MotionComponent } from '../EntityComponentSystem/Components/MotionComponent';
import { ColliderComponent } from '../Collision/ColliderComponent';
import { CoordPlane, Entity, TransformComponent } from '../EntityComponentSystem';
import { System, SystemType } from '../EntityComponentSystem/System';
import { ExcaliburGraphicsContext } from '../Graphics/Context/ExcaliburGraphicsContext';
import { vec, Vector } from '../Math/vector';
import { BodyComponent, CompositeCollider, GraphicsComponent, Particle, Util } from '..';

export class DebugSystem extends System<TransformComponent> {
  public readonly types = ['ex.transform'] as const;
  public readonly systemType = SystemType.Draw;
  public priority = 999; // lowest priority
  private _graphicsContext: ExcaliburGraphicsContext;
  private _camera: Camera;
  private _engine: Engine;

  public initialize(scene: Scene): void {
    this._graphicsContext = scene.engine.graphicsContext;
    this._camera = scene.camera;
    this._engine = scene.engine;
  }
  update(entities: Entity[], _delta: number): void {
    if (!this._engine.isDebug) {
      return;
    }

    const filterSettings = this._engine.debug.filter;

    let id: number;
    // let killed: boolean;
    let name: string;
    const entitySettings = this._engine.debug.entity;

    let tx: TransformComponent;
    const txSettings = this._engine.debug.transform;

    let motion: MotionComponent;
    const motionSettings = this._engine.debug.motion;

    let collider: ColliderComponent;
    const colliderSettings = this._engine.debug.collider;

    let graphics: GraphicsComponent;
    const graphicsSettings = this._engine.debug.graphics;

    let body: BodyComponent;
    const bodySettings = this._engine.debug.body;
    // let offscreen: boolean;
    for (const entity of entities) {
      if (entity.hasTag('offscreen')) {
        // skip offscreen entities
        continue;
      }
      if (entity instanceof Particle) {
        // Particles crush the renderer :(
        continue;
      }
      if (filterSettings.useFilter) {
        const allIds = filterSettings.ids.length === 0;
        const idMatch = allIds || filterSettings.ids.includes(entity.id);
        if (!idMatch) {
          continue;
        }
        const allNames = filterSettings.nameQuery === '';
        const nameMatch = allNames || entity.name.includes(filterSettings.nameQuery);
        if (!nameMatch) {
          continue;
        }
      }

      let cursor = Vector.Zero;
      const lineHeight = vec(0, 16);
      id = entity.id;
      name = entity.name;
      tx = entity.get(TransformComponent);

      // This optionally sets our camera based on the entity coord plan (world vs. screen)
      this._pushCameraTransform(tx);

      this._graphicsContext.save();

      this._applyTransform(entity);
      if (tx) {
        if (txSettings.showAll || txSettings.showPosition) {
          this._graphicsContext.debug.drawPoint(Vector.Zero, { size: 2, color: txSettings.positionColor });
          this._graphicsContext.debug.drawText(`pos${tx.pos.toString(2)}`, cursor);
          cursor = cursor.add(lineHeight);
        }

        if (entitySettings.showAll || entitySettings.showId) {
          this._graphicsContext.debug.drawText(`id(${id}) ${tx.parent ? 'child of id(' + tx.parent?.owner?.id + ')' : ''}`, cursor);
          cursor = cursor.add(lineHeight);
        }

        if (entitySettings.showAll || entitySettings.showName) {
          this._graphicsContext.debug.drawText(`name(${name})`, cursor);
          cursor = cursor.add(lineHeight);
        }

        if (txSettings.showAll || txSettings.showRotation) {
          this._graphicsContext.drawLine(
            Vector.Zero,
            Vector.fromAngle(tx.rotation).scale(50).add(Vector.Zero),
            txSettings.rotationColor,
            2
          );
          this._graphicsContext.debug.drawText(`rot deg(${Util.toDegrees(tx.rotation).toFixed(2)})`, cursor);
          cursor = cursor.add(lineHeight);
        }

        if (txSettings.showAll || txSettings.showScale) {
          this._graphicsContext.drawLine(Vector.Zero, tx.scale.add(Vector.Zero), txSettings.scaleColor, 2);
        }
      }

      motion = entity.get(MotionComponent);
      if (motion) {
        if (motionSettings.showAll || motionSettings.showVelocity) {
          this._graphicsContext.debug.drawText(`vel${motion.vel.toString(2)}`, cursor);
          this._graphicsContext.drawLine(Vector.Zero, motion.vel, motionSettings.velocityColor, 2);
          cursor = cursor.add(lineHeight);
        }

        if (motionSettings.showAll || motionSettings.showAcceleration) {
          this._graphicsContext.drawLine(Vector.Zero, motion.acc, motionSettings.accelerationColor, 2);
        }
      }

      graphics = entity.get(GraphicsComponent);
      if (graphics) {
        if (graphicsSettings.showAll || graphicsSettings.showBounds) {
          const bounds = graphics.localBounds;
          bounds.draw(this._graphicsContext, graphicsSettings.boundsColor);
        }
      }

      body = entity.get(BodyComponent);
      if (body) {
        if (bodySettings.showAll || bodySettings.showCollisionGroup) {
          this._graphicsContext.debug.drawText(`collision group(${body.group.name})`, cursor);
          cursor = cursor.add(lineHeight);
        }

        if (bodySettings.showAll || bodySettings.showCollisionType) {
          this._graphicsContext.debug.drawText(`collision type(${body.collisionType})`, cursor);
          cursor = cursor.add(lineHeight);
        }

        if (bodySettings.showAll || bodySettings.showMass) {
          this._graphicsContext.debug.drawText(`mass(${body.mass})`, cursor);
          cursor = cursor.add(lineHeight);
        }

        if (bodySettings.showAll || bodySettings.showMotion) {
          this._graphicsContext.debug.drawText(`motion(${body.motion})`, cursor);
          cursor = cursor.add(lineHeight);
        }

        if (bodySettings.showAll || bodySettings.showSleeping) {
          this._graphicsContext.debug.drawText(`sleeping(${body.canSleep ? 'cant sleep' : body.sleeping})`, cursor);
          cursor = cursor.add(lineHeight);
        }
      }

      // if (Debug.showCameraFocus) {
      //   const focus = this.getFocus();
      //   ctx.fillStyle = 'red';
      //   ctx.strokeStyle = 'white';
      //   ctx.lineWidth = 3;
      //   ctx.beginPath();
      //   ctx.arc(focus.x, focus.y, 15, 0, Math.PI * 2);
      //   ctx.closePath();
      //   ctx.stroke();

      //   ctx.beginPath();
      //   ctx.arc(focus.x, focus.y, 5, 0, Math.PI * 2);
      //   ctx.closePath();
      //   ctx.stroke();
      // }

      // if (Debug.showCameraViewport) {
      //   ctx.beginPath();
      //   ctx.setLineDash([5, 15]);
      //   ctx.lineWidth = 5;
      //   ctx.strokeStyle = 'white';
      //   ctx.strokeRect(this.viewport.left, this.viewport.top, this.viewport.width, this.viewport.height);
      //   ctx.closePath();
      // }

      this._graphicsContext.restore();

      // Colliders live in world space already so after the restore()
      collider = entity.get(ColliderComponent);
      if (collider) {
        if (colliderSettings.showAll || colliderSettings.showBounds) {
          if (collider.collider instanceof CompositeCollider) {
            const colliders = collider.collider.getColliders();
            for (const collider of colliders) {
              const bounds = collider.bounds;
              const pos = vec(bounds.left, bounds.top);
              if (colliderSettings.showOwner) {
                this._graphicsContext.debug.drawText(`owner id(${collider.owner.id})`, pos);
              }
              this._graphicsContext.debug.drawRect(pos.x, pos.y, bounds.width, bounds.height, { color: colliderSettings.boundsColor });
            }
          } else {
            const bounds = collider.bounds;
            const pos = vec(bounds.left, bounds.top);
            if (colliderSettings.showOwner) {
              this._graphicsContext.debug.drawText(`owner id(${collider.owner.id})`, pos);
            }
            this._graphicsContext.debug.drawRect(pos.x, pos.y, bounds.width, bounds.height, { color: colliderSettings.boundsColor });
          }
        }

        if (colliderSettings.showAll || colliderSettings.showGeometry) {
          collider.collider.debug(this._graphicsContext, colliderSettings.geometryColor);
        }
      }

      this._popCameraTransform(tx);

      this._graphicsContext.flush();
    }
  }

  /**
   * This applies the current entity transform to the graphics context
   * @param entity
   */
  private _applyTransform(entity: Entity): void {
    const ancestors = entity.getAncestors();
    for (const ancestor of ancestors) {
      const transform = ancestor?.get(TransformComponent);
      if (transform) {
        this._graphicsContext.translate(transform.pos.x, transform.pos.y);
        this._graphicsContext.scale(transform.scale.x, transform.scale.y);
        this._graphicsContext.rotate(transform.rotation);
      }
    }
  }

  /**
   * Applies the current camera transform if in world coordinates
   * @param transform
   */
  private _pushCameraTransform(transform: TransformComponent) {
    // Establish camera offset per entity
    if (transform.coordPlane === CoordPlane.World) {
      this._graphicsContext.save();
      if (this._camera) {
        this._camera.draw(this._graphicsContext);
      }
    }
  }

  /**
   * Resets the current camera transform if in world coordinates
   * @param transform
   */
  private _popCameraTransform(transform: TransformComponent) {
    if (transform.coordPlane === CoordPlane.World) {
      // Apply camera world offset
      this._graphicsContext.restore();
    }
  }
}
