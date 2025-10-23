import { GraphicsComponent } from './GraphicsComponent';
import { EnterViewPortEvent, ExitViewPortEvent } from '../Events';
import type { Scene } from '../Scene';
import type { Screen } from '../Screen';
import { TransformComponent } from '../EntityComponentSystem/Components/TransformComponent';
// import type { Camera } from '../Camera';
import { System, SystemType } from '../EntityComponentSystem/System';
// import { ParallaxComponent } from './ParallaxComponent';
// import { Vector } from '../Math/vector';
// import { CoordPlane } from '../Math/coord-plane';
import type { BoundingBox } from '../Collision/BoundingBox';
import type { Entity, Query, World } from '../EntityComponentSystem';
import { SystemPriority } from '../EntityComponentSystem';
import { SparseHashGrid } from '../Collision/Detection/SparseHashGrid';
import { CoordPlane } from '../Math';

export class OffscreenSystem extends System {
  static priority: number = SystemPriority.Higher;

  public systemType = SystemType.Draw;
  // private _camera!: Camera;
  private _screen!: Screen;
  private _worldBounds!: BoundingBox;

  // TODO move somewhere central similar concern in PointerSystem
  private _graphicsHashGrid = new SparseHashGrid<GraphicsComponent>({ size: 100 });
  private _graphics: GraphicsComponent[] = [];

  // private _graphicsOnScreen: GraphicsComponent[] = [];
  // private _graphicsOffScreen: GraphicsComponent[] = [];

  private _transforms: TransformComponent[] = [];
  // private _transformsOnScreen: TransformComponent[] = [];
  // private _transformsOffScreen: TransformComponent[] = [];

  private _onScreenGraphics = new Set<GraphicsComponent>();
  private _offScreenIds = new Set<number>();

  query: Query<typeof TransformComponent | typeof GraphicsComponent>;
  queryOnScreen: Query<typeof TransformComponent | typeof GraphicsComponent>;
  queryOffScreen: Query<typeof TransformComponent | typeof GraphicsComponent>;

  constructor(public world: World) {
    super();
    // Split on/off screen query to avoid branch in hot loop
    this.queryOnScreen = this.world.query({
      components: { all: [TransformComponent, GraphicsComponent] },
      tags: { not: ['ex.offscreen'] }
    });

    // this.queryOnScreen.entityAdded$.subscribe((e) => {
    //   const graphic = e.get(GraphicsComponent);
    //   this._graphicsOnScreen.push(graphic);
    //   this._graphicsHashGrid.track(graphic);
    //   const transform = e.get(TransformComponent);
    //   this._transformsOnScreen.push(transform);
    // });
    //
    // this.queryOnScreen.entityRemoved$.subscribe((e) => {
    //   const maybeGfx = e.get(GraphicsComponent);
    //   if (maybeGfx) {
    //     const index = this._graphicsOnScreen.indexOf(maybeGfx);
    //     if (index > -1) {
    //       this._graphicsOnScreen.splice(index, 1);
    //     }
    //     this._graphicsHashGrid.untrack(maybeGfx);
    //   }
    //
    //   const maybeTx = e.get(TransformComponent);
    //   if (maybeTx) {
    //     const index = this._transformsOnScreen.indexOf(maybeTx);
    //     if (index > -1) {
    //       this._transformsOnScreen.splice(index, 1);
    //     }
    //   }
    // });

    this.queryOffScreen = this.world.query({
      components: { all: [TransformComponent, GraphicsComponent] },
      tags: { all: ['ex.offscreen'] }
    });

    this.queryOffScreen.entityAdded$.subscribe((e) => {
      this._offScreenIds.add(e.id);
      // const graphic = e.get(GraphicsComponent);
      // this._graphicsOffScreen.push(graphic);
      // this._graphicsHashGrid.track(graphic);
      // const transform = e.get(TransformComponent);
      // this._transformsOffScreen.push(transform);
    });

    this.queryOffScreen.entityRemoved$.subscribe((e) => {
      this._offScreenIds.delete(e.id);
      // const maybeGfx = e.get(GraphicsComponent);
      // if (maybeGfx) {
      //   const index = this._graphicsOffScreen.indexOf(maybeGfx);
      //   if (index > -1) {
      //     this._graphicsOffScreen.splice(index, 1);
      //   }
      //   this._graphicsHashGrid.untrack(maybeGfx);
      // }
      //
      // const maybeTx = e.get(TransformComponent);
      // if (maybeTx) {
      //   const index = this._transformsOffScreen.indexOf(maybeTx);
      //   if (index > -1) {
      //     this._transformsOffScreen.splice(index, 1);
      //   }
      // }
    });

    this.query = this.world.query([TransformComponent, GraphicsComponent]);
    this.query.entityAdded$.subscribe((e) => {
      const graphic = e.get(GraphicsComponent);
      this._graphics.push(graphic);
      this._graphicsHashGrid.track(graphic);
      const transform = e.get(TransformComponent);
      this._transforms.push(transform);
    });

    this.query.entityRemoved$.subscribe((e) => {
      const maybeGfx = e.get(GraphicsComponent);
      if (maybeGfx) {
        const index = this._graphics.indexOf(maybeGfx);
        if (index > -1) {
          this._graphics.splice(index, 1);
        }
        this._graphicsHashGrid.untrack(maybeGfx);
      }

      const maybeTx = e.get(TransformComponent);
      if (maybeTx) {
        const index = this._transforms.indexOf(maybeTx);
        if (index > -1) {
          this._transforms.splice(index, 1);
        }
      }
    });
  }

  public initialize(world: World, scene: Scene): void {
    // TODO parallax
    // this._camera = scene.camera;
    this._screen = scene.engine.screen;
  }

  private _offscreenTag = 'ex.offscreen';
  private _newOffScreen: Entity[] = [];
  private _newOnScreen: Entity[] = [];
  update(): void {
    this._worldBounds = this._screen.getWorldBounds();
    let transform: TransformComponent;
    let graphic: GraphicsComponent;
    let entity: Entity<TransformComponent | GraphicsComponent>;
    // TODO parallax
    // let maybeParallax: ParallaxComponent | undefined;

    // Find the true list of onscreen entities
    this._graphicsHashGrid.update(this._graphics);
    this._graphicsHashGrid.query(this._worldBounds, this._onScreenGraphics);

    // // Find previous tagged onscreen -> now offscreen
    // for (let i = 0; i < this._transformsOnScreen.length; i++) {
    //   transform = this._transforms[i];
    //   entity = transform.owner!;
    //
    //   const isWorld = transform.coordPlane === CoordPlane.World;
    //   const entityOffscreen = isWorld && !this._onScreen.has(entity);
    //
    //   if (entityOffscreen) {
    //     newOffScreen.push(entity);
    //   }
    // }
    //
    // // Find previous tagged offscreen -> now onscreen
    // for (let i = 0; i < this._transformsOffScreen.length; i++) {
    //   transform = this._transforms[i];
    //   entity = transform.owner!;
    //
    //   const isWorld = transform.coordPlane === CoordPlane.World;
    //   const entityOffscreen = isWorld && !this._onScreen.has(entity);
    //
    //   if (!entityOffscreen) {
    //     newOnScreen.push(entity);
    //   }
    // }

    for (let i = 0; i < this._transforms.length; i++) {
      transform = this._transforms[i];
      graphic = this._graphics[i];
      entity = transform.owner!;

      const isWorld = transform.coordPlane === CoordPlane.World;

      // TODO parallax
      // maybeParallax = entity.get(ParallaxComponent);
      // let parallaxOffset: Vector | undefined;
      // if (maybeParallax) {
      //   // We use the Tiled formula
      //   // https://doc.mapeditor.org/en/latest/manual/layers/#parallax-scrolling-factor
      //   // cameraPos * (1 - parallaxFactor)
      //   const oneMinusFactor = Vector.One.sub(maybeParallax.parallaxFactor);
      //   parallaxOffset = this._camera.pos.scale(oneMinusFactor);
      // }

      // Figure out if entities are offscreen
      const hasTagOffscreen = this._offScreenIds.has(entity.id);
      const entityOffscreen = isWorld && !this._onScreenGraphics.has(graphic);
      if (entityOffscreen && !hasTagOffscreen) {
        this._newOffScreen.push(entity);
        continue; // skip the rest of the loop these are mutually exclusive
      }

      if (!entityOffscreen && hasTagOffscreen) {
        this._newOnScreen.push(entity);
      }
    }

    for (let i = 0; i < this._newOffScreen.length; i++) {
      this._newOffScreen[i].events.emit('exitviewport', new ExitViewPortEvent(this._newOffScreen[i]));
      this._newOffScreen[i].addTag(this._offscreenTag);
    }

    for (let i = 0; i < this._newOnScreen.length; i++) {
      this._newOnScreen[i].events.emit('enterviewport', new EnterViewPortEvent(this._newOnScreen[i]));
      this._newOnScreen[i].removeTag(this._offscreenTag);
    }

    // clear book keeping
    this._newOnScreen.length = 0;
    this._newOffScreen.length = 0;
    this._onScreenGraphics.clear();
  }
}
