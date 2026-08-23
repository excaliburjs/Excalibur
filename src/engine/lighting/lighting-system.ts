import { System, SystemType } from '../entity-component-system/system';
import { SystemPriority } from '../entity-component-system/priority';
import type { World } from '../entity-component-system/world';
import { TransformComponent } from '../entity-component-system/components/transform-component';
import type { Component, ComponentCtor } from '../entity-component-system/component';
import type { Entity } from '../entity-component-system/entity';
import type { Scene } from '../scene';
import type { Engine } from '../engine';
import type { Camera } from '../camera';
import { Vector } from '../math/vector';
import type { AffineMatrix } from '../math/affine-matrix';
import { CoordPlane } from '../math/coord-plane';
import { canonicalizeAngle } from '../math/util';
import { Color } from '../color';
import { ScreenElement } from '../screen-element';
import { Canvas } from '../graphics/canvas';
import { Logger } from '../util/log';
import type { Observable } from '../util/observable';
import { BoundingBox } from '../collision/bounding-box';
import { DarknessComponent } from './darkness-component';
import { PointLightComponent } from './point-light-component';
import { ConeLightComponent } from './cone-light-component';
import { LightOccluderComponent } from './light-occluder-component';
import type { Occluder } from './light-occluder-component';

interface DarknessEntry {
  comp: DarknessComponent;
  transform: TransformComponent;
  cached: RoomClip | null;
  lastCenterX: number | null;
  lastCenterY: number | null;
  /**
   * Snapshot of the camera transform's 6 matrix components from the last rebuild. The screen quad
   * depends on the full finalized camera transform - which also moves with camera shake and
   * fixed-update interpolation - so caching on pos/zoom/rotation alone goes stale during those.
   */
  lastCameraMatrix: Float64Array | null;
  lastWidth: number | null;
  lastHeight: number | null;
}

/**
 * A darkness room rect's clip geometry: `worldBounds` (axis-aligned in world space, since rooms have
 * no independent rotation) for containment tests, `screenCorners` (rotated through the camera transform)
 * for drawing/clipping the veil.
 */
interface RoomClip {
  worldBounds: BoundingBox;
  screenCorners: [Vector, Vector, Vector, Vector];
}

interface AmbientResult {
  intensity: number;
  color: Color | null;
}

interface LightEntry<TLight> {
  light: TLight;
  transform: TransformComponent;
  /** This frame's screen-space position, mutated in place every frame via an AffineMatrix `dest` write - never reallocated. */
  screenPos: Vector;
  screenRadius: number;
  visible: boolean;
}

interface OccluderEntry {
  comp: LightOccluderComponent;
  transform: TransformComponent;
  cached: Occluder | null;
  cachedLocalVerts: Vector[] | null;
  lastX: number | null;
  lastY: number | null;
  lastRotation: number | null;
  lastScaleX: number | null;
  lastScaleY: number | null;
}

/**
 * An {@apilink Occluder}'s geometry pre-transformed to screen space for the current frame's camera -
 * computed once per occluder per frame (in `_collectScreenOccluders`) rather than once per (light,
 * occluder) pair, since an occluder's screen position doesn't depend on which light is asking.
 */
type ScreenOccluder =
  | { kind: 'circle'; screenCenter: Vector; screenRadius: number }
  | { kind: 'poly'; screenVerts: Vector[]; boundCenter: Vector; boundRadius: number };

interface ConeGradientOptions {
  startAngle: number;
  endAngle: number;
  softness: number;
}

/**
 * Finds the room darkness rect (if any) that contains a screen-space point, used to clip light/shadow
 * drawing. The containment test is done in world space (via `camInverse`) rather than against the
 * rotated screen quad directly, since rooms are always axis-aligned in world space.
 */
function findRoomClip(camInverse: AffineMatrix, screenPos: Vector, roomClips: RoomClip[]): RoomClip | undefined {
  const worldPos = camInverse.multiply(screenPos);
  return roomClips.find((clip) => clip.worldBounds.contains(worldPos));
}

/** Traces a closed path through a room clip's (possibly camera-rotated) screen-space quad corners */
function pathRoomQuad(ctx: CanvasRenderingContext2D, corners: readonly [Vector, Vector, Vector, Vector]): void {
  ctx.moveTo(corners[0].x, corners[0].y);
  ctx.lineTo(corners[1].x, corners[1].y);
  ctx.lineTo(corners[2].x, corners[2].y);
  ctx.lineTo(corners[3].x, corners[3].y);
  ctx.closePath();
}

/** Projects `v` away from `source` out to `reach` world/screen units, used to close off shadow volume far edges */
function projectAway(v: Vector, source: Vector, reach: number): Vector {
  const dx = v.x - source.x;
  const dy = v.y - source.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return new Vector(v.x + (dx / len) * reach, v.y + (dy / len) * reach);
}

/**
 * Computes a 2D shadow volume polygon projecting away from a light source point.
 *
 * Wraps the occluder's screen-space hull: the nearest hull vertex to the light becomes the shadow's
 * near tip, the min/max angular hull vertices (as seen from the light) are the silhouette edge
 * extremes, and those two silhouette vertices are projected out to `reach` to close off the far edge.
 *
 */
function shadowPolygon(lightSource: Vector, occluderScreenVerts: Vector[], reach: number): Vector[] {
  let nearestDistSq = Infinity;
  let minAngle = Infinity;
  let maxAngle = -Infinity;
  let minAngleIdx = 0;
  let maxAngleIdx = 0;
  let nearestIdx = 0;

  const refAngle = Math.atan2(occluderScreenVerts[0].y - lightSource.y, occluderScreenVerts[0].x - lightSource.x);

  for (let i = 0; i < occluderScreenVerts.length; i++) {
    // light source to occluder vertex
    const rawAngle = Math.atan2(occluderScreenVerts[i].y - lightSource.y, occluderScreenVerts[i].x - lightSource.x);
    let delta = canonicalizeAngle(rawAngle - refAngle); // [0, 2*PI)
    if (delta > Math.PI) {
      delta -= 2 * Math.PI; // (-PI, PI]
    }
    const angle = refAngle + delta;
    if (angle < minAngle) {
      minAngle = angle;
      minAngleIdx = i;
    }
    if (angle > maxAngle) {
      maxAngle = angle;
      maxAngleIdx = i;
    }

    const sqDist = lightSource.squareDistance(occluderScreenVerts[i]);
    if (sqDist < nearestDistSq) {
      nearestDistSq = sqDist;
      nearestIdx = i;
    }
  }

  const farMin = projectAway(occluderScreenVerts[minAngleIdx], lightSource, reach);
  const farMax = projectAway(occluderScreenVerts[maxAngleIdx], lightSource, reach);

  return [occluderScreenVerts[nearestIdx], occluderScreenVerts[minAngleIdx], farMin, farMax, occluderScreenVerts[maxAngleIdx]];
}

/** Renders a circular profile occlusion shadow block masking light distribution. */
function drawShadowCircle(
  ctx: CanvasRenderingContext2D,
  lightScreen: Vector,
  center: Vector,
  screenRadius: number,
  reach: number,
  grad: CanvasGradient
): void {
  const dx = center.x - lightScreen.x;
  const dy = center.y - lightScreen.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist <= screenRadius) {
    return;
  }

  const angleToCenter = Math.atan2(dy, dx);
  const halfAngle = Math.asin(Math.min(1, screenRadius / dist));

  const t1 = angleToCenter - halfAngle;
  const t2 = angleToCenter + halfAngle;

  // A tangent ray at angle t from the light touches the circle at the point whose direction from
  // the circle's center is perpendicular to the ray, on the side facing away from it: t1 - PI/2
  // for the min-angle ray and t2 + PI/2 for the max-angle ray
  const tp1 = new Vector(center.x + Math.cos(t1 - Math.PI / 2) * screenRadius, center.y + Math.sin(t1 - Math.PI / 2) * screenRadius);
  const tp2 = new Vector(center.x + Math.cos(t2 + Math.PI / 2) * screenRadius, center.y + Math.sin(t2 + Math.PI / 2) * screenRadius);

  const far1 = projectAway(tp1, lightScreen, reach);
  const far2 = projectAway(tp2, lightScreen, reach);

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(tp1.x, tp1.y);
  ctx.lineTo(far1.x, far1.y);
  ctx.lineTo(far2.x, far2.y);
  ctx.lineTo(tp2.x, tp2.y);
  // Close along the circle's far cap (through angleToCenter, away from the light)
  ctx.arc(center.x, center.y, screenRadius, t2 + Math.PI / 2, t1 - Math.PI / 2, true);
  ctx.closePath();
  ctx.fill();
}

export interface LightingSystemOptions {
  /**
   * The z-index of the provisioned lighting overlay. Defaults to 100.
   */
  zIndex?: number;
  /**
   * Fixed anchor screen positioning coordinate. When omitted the overlay is anchored to the
   * top left of the full visible canvas ({@apilink Screen.unsafeArea}) every frame.
   */
  pos?: Vector;
  /**
   * Fixed resolution dimensions. Defaults to tracking the screen {@apilink Screen.resolution} when omitted.
   */
  size?: { width: number; height: number };
  /**
   * Hook an external ScreenElement host rather than provisioning an independent one.
   * The caller becomes responsible for its position and size.
   */
  screenElement?: ScreenElement;
  /**
   * Overrides {@apilink EngineOptions.lighting}'s `ambientIntensity` for this scene's instance.
   */
  ambientIntensity?: number;
  /**
   * Overrides {@apilink EngineOptions.lighting}'s `ambientColor` for this scene's instance.
   */
  ambientColor?: Color | null;
}

/**
 * Composite canvas-driven visibility system tracking ambient, darkness,
 * light masks, and ray projected shadow volumes.
 *
 * Renders via a {@apilink Canvas} graphic on a screen-space {@apilink ScreenElement} named 'lighting'.
 * The raster pipeline per frame: ambient-blended darkness veil → room rect fills/clips → camera frustum
 * cull → per-light destination-out punch (with occluder shadows subtracted) → colored tint passes.
 *
 * Enabled scene-wide via {@apilink EngineOptions.lighting}, or add an instance manually to a scene's world.
 *
 * **Potentially performance impacting** — the overlay is rasterized with the 2D Canvas API and re-uploaded
 * to the GPU every frame.
 *
 * Known limitations: circle occluder radii scale uniformly with `Math.min(scale.x, scale.y)` so a
 * non-uniformly scaled occluder won't cast an elliptical shadow, darkness room rects have no independent
 * rotation of their own (though they do rotate along with the camera), and polygon shadow volumes can
 * split at corners when the silhouette edge is not face on to the light.
 */
export class LightingSystem extends System {
  static priority = SystemPriority.Highest;
  public readonly systemType = SystemType.Draw;

  private _options: LightingSystemOptions;
  private _engine!: Engine;
  private _scene!: Scene;

  private _lightingEntity!: ScreenElement;
  private _lightingCanvas!: Canvas;
  private _offscreen: HTMLCanvasElement | null = null;
  private _offscreenCtx: CanvasRenderingContext2D | null = null;

  private _darknessEntries: DarknessEntry[] = [];
  private _pointLights: LightEntry<PointLightComponent>[] = [];
  private _coneLights: LightEntry<ConeLightComponent>[] = [];
  private _occluderEntries: OccluderEntry[] = [];
  private _ambientScratch: AmbientResult = { intensity: 0, color: null };
  private _subscriptions: { observable: Observable<any>; fn: (e: any) => void }[] = [];

  constructor(options?: LightingSystemOptions) {
    super();
    this._options = options ?? {};
  }

  public initialize(world: World, scene: Scene): void {
    this._scene = scene;
    this._engine = scene.engine;

    this._initDarkness(world);
    this._initPointLights(world);
    this._initConeLights(world);
    this._initOccluders(world);
    this._initCanvas(scene);
  }

  /**
   * Releases everything `initialize` provisioned: unsubscribes the component tracking queries,
   * removes the lighting overlay ScreenElement (when this system created it), and drops the
   * offscreen scratch canvas. Called by the {@apilink SystemManager} when the system is removed,
   * e.g. when `engine.lighting.enabled` is turned off at runtime.
   */
  public uninitialize(_world: World, scene: Scene): void {
    for (const sub of this._subscriptions) {
      sub.observable.unsubscribe(sub.fn);
    }
    this._subscriptions.length = 0;
    this._darknessEntries.length = 0;
    this._pointLights.length = 0;
    this._coneLights.length = 0;
    this._occluderEntries.length = 0;

    if (this._lightingEntity) {
      if (this._options.screenElement) {
        // Caller-managed host: leave the entity in place but stop showing the (now frozen) canvas
        this._lightingEntity.graphics.hide();
      } else {
        scene.remove(this._lightingEntity);
      }
    }
    this._offscreen = null;
    this._offscreenCtx = null;
  }

  /**
   * Queries `world` for entities with `ctor` + a TransformComponent, seeds `entries` from the
   * initial matches, and wires the query's entityAdded$/entityRemoved$ to keep `entries` in sync
   * as matching entities are added/removed. Shared by all four light-like component trackers below.
   */
  private _wireQuery<TComp extends Component, TEntry>(
    world: World,
    ctor: ComponentCtor<TComp>,
    entries: TEntry[],
    makeEntry: (comp: TComp, transform: TransformComponent) => TEntry,
    getComp: (entry: TEntry) => TComp
  ): void {
    const query = world.query([ctor, TransformComponent]);
    const add = (e: Entity) => entries.push(makeEntry(e.get(ctor)! as TComp, e.get(TransformComponent)!));
    const remove = (e: Entity) => {
      const comp = e.get(ctor)! as TComp;
      const index = entries.findIndex((entry) => getComp(entry) === comp);
      if (index > -1) {
        entries.splice(index, 1);
      }
    };
    for (let i = 0; i < query.entities.length; i++) {
      add(query.entities[i]);
    }
    query.entityAdded$.subscribe(add);
    query.entityRemoved$.subscribe(remove);
    this._subscriptions.push({ observable: query.entityAdded$, fn: add }, { observable: query.entityRemoved$, fn: remove });
  }

  private _initDarkness(world: World): void {
    this._wireQuery(
      world,
      DarknessComponent,
      this._darknessEntries,
      (comp, transform) => ({
        comp,
        transform,
        cached: null,
        lastCenterX: null,
        lastCenterY: null,
        lastCameraMatrix: null,
        lastWidth: null,
        lastHeight: null
      }),
      (entry) => entry.comp
    );
  }

  private _initPointLights(world: World): void {
    this._wireQuery(
      world,
      PointLightComponent,
      this._pointLights,
      (light, transform) => ({ light, transform, screenPos: new Vector(0, 0), screenRadius: 0, visible: false }),
      (entry) => entry.light
    );
  }

  private _initConeLights(world: World): void {
    this._wireQuery(
      world,
      ConeLightComponent,
      this._coneLights,
      (light, transform) => ({ light, transform, screenPos: new Vector(0, 0), screenRadius: 0, visible: false }),
      (entry) => entry.light
    );
  }

  private _initOccluders(world: World): void {
    this._wireQuery(
      world,
      LightOccluderComponent,
      this._occluderEntries,
      (comp, transform) => ({
        comp,
        transform,
        cached: null,
        cachedLocalVerts: null,
        lastX: null,
        lastY: null,
        lastRotation: null,
        lastScaleX: null,
        lastScaleY: null
      }),
      (entry) => entry.comp
    );
  }

  private _initCanvas(scene: Scene): void {
    this._offscreen = document.createElement('canvas');
    this._offscreenCtx = this._offscreen.getContext('2d');

    const initialWidth = this._options.size?.width ?? this._engine.screen.resolution.width;
    const initialHeight = this._options.size?.height ?? this._engine.screen.resolution.height;

    this._offscreen.width = initialWidth;
    this._offscreen.height = initialHeight;

    this._lightingCanvas = new Canvas({
      width: initialWidth,
      height: initialHeight,
      draw: (ctx) => this._renderLightingCanvas(ctx)
    });

    if (this._options.screenElement) {
      if (process.env.NODE_ENV === 'development') {
        Logger.getInstance().debug('LightingSystem is using a provided ScreenElement, its position and size will not be managed');
      }
      this._lightingEntity = this._options.screenElement;
    } else {
      this._lightingEntity = new ScreenElement({
        name: 'lighting',
        pos: this._options.pos ?? Vector.Zero,
        width: initialWidth,
        height: initialHeight,
        z: this._options.zIndex ?? this._engine.lighting.zIndex,
        coordPlane: CoordPlane.Screen,
        color: Color.Transparent
      });
      scene.add(this._lightingEntity);
    }

    this._lightingEntity.graphics.use(this._lightingCanvas);
  }

  public update(elapsed: number): void {
    const screen = this._engine.screen;
    this._lightingEntity.transform.coordPlane = CoordPlane.Screen;

    // Camera.transform isn't finalized for this frame until Camera.draw() applies fixed-update
    // interpolation/pixel-snapping - normally that's done by GraphicsSystem (SystemPriority.Average),
    this._scene.camera._finalizeDrawTransform(this._engine.graphicsContext);

    if (!this._options.pos && !this._options.screenElement) {
      // Anchor the overlay to the top left of the full visible canvas, the unsafeArea spans the
      // whole resolution and its topLeft is negative by the clip amount in clipping display modes
      this._lightingEntity.pos = screen.unsafeArea.topLeft;
    }

    if (!this._options.size) {
      if (this._lightingCanvas.width !== screen.resolution.width || this._lightingCanvas.height !== screen.resolution.height) {
        const w = screen.resolution.width;
        const h = screen.resolution.height;

        this._lightingCanvas.width = w;
        this._lightingCanvas.height = h;

        if (this._lightingEntity.graphics.current) {
          this._lightingEntity.graphics.current.width = w;
          this._lightingEntity.graphics.current.height = h;
        }

        if (this._offscreen) {
          this._offscreen.width = w;
          this._offscreen.height = h;
        }
      }
    }

    // rasterize() forces this frame's light/darkness/occluder state to be re-rendered.
    // it is called here rather than left lazy so the raster cost is attributed to
    this._lightingCanvas.rasterize();
  }

  /**
   * Writes the scene's effective ambient intensity/color into `dest` (avoids allocating a fresh
   * object every frame).
   */
  private _computeAmbient(dest: AmbientResult): void {
    dest.intensity = this._options.ambientIntensity ?? this._engine.lighting.ambientIntensity;
    dest.color = this._options.ambientColor ?? this._engine.lighting.ambientColor;
  }

  private _darknessFill(d: DarknessComponent, ambientIntensity: number, ambientColor: Color | null): string {
    const effectiveAlpha = Math.max(0, d.intensity - ambientIntensity);
    let color = d.color;
    if (ambientColor) {
      // Tint the veil toward the ambient light color proportional to its intensity
      color = new Color(
        d.color.r + (ambientColor.r - d.color.r) * ambientIntensity,
        d.color.g + (ambientColor.g - d.color.g) * ambientIntensity,
        d.color.b + (ambientColor.b - d.color.b) * ambientIntensity
      );
    }
    return Color.fromRGB(color.r, color.g, color.b, effectiveAlpha).toRGBA();
  }

  private _drawDarknessVeil(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    camera: Camera,
    ambientIntensity: number,
    ambientColor: Color | null
  ): RoomClip[] {
    const roomClips: RoomClip[] = [];

    for (let i = 0; i < this._darknessEntries.length; i++) {
      const entry = this._darknessEntries[i];
      const d = entry.comp;

      if (d.width === Infinity || d.height === Infinity) {
        ctx.fillStyle = this._darknessFill(d, ambientIntensity, ambientColor);
        ctx.fillRect(0, 0, w, h);
        continue;
      }

      const clip = this._computeRoomClip(entry, camera);
      roomClips.push(clip);

      ctx.fillStyle = this._darknessFill(d, ambientIntensity, ambientColor);
      ctx.beginPath();
      pathRoomQuad(ctx, clip.screenCorners);
      ctx.fill();
    }

    return roomClips;
  }

  /**
   * Computes (and caches) a room darkness rect's world bounds and camera-rotated screen quad. Only
   * rebuilds when the room's world position/dimensions or the camera's finalized transform changed
   * since last frame - the screen quad depends on the camera's full transform (which also moves with
   * camera shake and fixed-update interpolation, not just pos/zoom/rotation), so the transform's
   * matrix components are the cache key.
   */
  private _computeRoomClip(entry: DarknessEntry, camera: Camera): RoomClip {
    const d = entry.comp;
    const pos = entry.transform.globalPos;
    const m = camera.transform.data;
    const lastM = entry.lastCameraMatrix;
    const unchanged =
      entry.cached &&
      entry.lastCenterX === pos.x &&
      entry.lastCenterY === pos.y &&
      lastM !== null &&
      lastM[0] === m[0] &&
      lastM[1] === m[1] &&
      lastM[2] === m[2] &&
      lastM[3] === m[3] &&
      lastM[4] === m[4] &&
      lastM[5] === m[5] &&
      entry.lastWidth === d.width &&
      entry.lastHeight === d.height;

    if (unchanged) {
      return entry.cached!;
    }

    const hw = d.width / 2;
    const hh = d.height / 2;
    const worldBounds = BoundingBox.fromDimension(d.width, d.height, Vector.Half, pos);
    const screenCorners: [Vector, Vector, Vector, Vector] = [
      camera.transform.multiply(new Vector(pos.x - hw, pos.y - hh)),
      camera.transform.multiply(new Vector(pos.x + hw, pos.y - hh)),
      camera.transform.multiply(new Vector(pos.x + hw, pos.y + hh)),
      camera.transform.multiply(new Vector(pos.x - hw, pos.y + hh))
    ];

    entry.cached = { worldBounds, screenCorners };
    entry.lastCenterX = pos.x;
    entry.lastCenterY = pos.y;
    if (!entry.lastCameraMatrix) {
      entry.lastCameraMatrix = new Float64Array(6);
    }
    entry.lastCameraMatrix.set(m);
    entry.lastWidth = d.width;
    entry.lastHeight = d.height;

    return entry.cached;
  }

  private _inCameraView(cullBounds: BoundingBox, worldPos: Vector, radius: number): boolean {
    return (
      cullBounds.left < worldPos.x + radius &&
      worldPos.x - radius < cullBounds.right &&
      cullBounds.top < worldPos.y + radius &&
      worldPos.y - radius < cullBounds.bottom
    );
  }

  /**
   * Computes (once per frame, shared by the erase and tint passes) whether each light in `entries` is
   * enabled and within `cullBounds`, and its screen-space position/radius. Writes into each entry's
   * persistent `screenPos` in place rather than allocating a new Vector.
   */
  private _updateLightVisibility<TLight extends PointLightComponent | ConeLightComponent>(
    entries: LightEntry<TLight>[],
    cullBounds: BoundingBox,
    camera: Camera
  ): void {
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const light = entry.light;
      if (!light.enabled || !this._inCameraView(cullBounds, entry.transform.globalPos, light.radius)) {
        entry.visible = false;
        continue;
      }
      entry.visible = true;
      camera.transform.multiply(entry.transform.globalPos, entry.screenPos);
      entry.screenRadius = light.radius * camera.zoom;
    }
  }

  /**
   * Computes (and caches) an occluder's world-space shadow geometry. Only re-projects through the
   * entity's transform when its position/rotation/scale or the component's shape/offset changed
   * since last frame — avoids rebuilding shadow geometry for static occluders every frame.
   */
  private _computeOccluderGeometry(entry: OccluderEntry): Occluder {
    const xf = entry.transform.get();
    const pos = xf.globalPos;
    const rotation = xf.globalRotation;
    const scale = xf.globalScale;
    const localVerts = entry.comp.localVertices();

    const unchanged =
      entry.cached &&
      entry.cachedLocalVerts === localVerts &&
      entry.lastX === pos.x &&
      entry.lastY === pos.y &&
      entry.lastRotation === rotation &&
      entry.lastScaleX === scale.x &&
      entry.lastScaleY === scale.y;

    if (unchanged) {
      return entry.cached!;
    }

    entry.cachedLocalVerts = localVerts;
    entry.lastX = pos.x;
    entry.lastY = pos.y;
    entry.lastRotation = rotation;
    entry.lastScaleX = scale.x;
    entry.lastScaleY = scale.y;

    if (entry.comp.shape.kind === 'circle') {
      entry.cached = {
        kind: 'circle',
        center: xf.apply(entry.comp.offset),
        radius: entry.comp.shape.radius * Math.min(Math.abs(scale.x), Math.abs(scale.y))
      };
    } else {
      entry.cached = {
        kind: 'poly',
        verts: localVerts.map((v) => xf.apply(v))
      };
    }

    return entry.cached;
  }

  /**
   * True when the occluder's world geometry overlaps `bounds` expanded by `expand` on every side.
   * Shadows only matter for occluders within a light's radius, and visible light centers lie within
   * the cull bounds expanded by their own radius - so `expand` of twice the largest visible light
   * radius is conservative.
   */
  private _occluderInRange(occ: Occluder, bounds: BoundingBox, expand: number): boolean {
    if (occ.kind === 'circle') {
      return (
        bounds.left - expand < occ.center.x + occ.radius &&
        occ.center.x - occ.radius < bounds.right + expand &&
        bounds.top - expand < occ.center.y + occ.radius &&
        occ.center.y - occ.radius < bounds.bottom + expand
      );
    }
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < occ.verts.length; i++) {
      const v = occ.verts[i];
      minX = Math.min(minX, v.x);
      minY = Math.min(minY, v.y);
      maxX = Math.max(maxX, v.x);
      maxY = Math.max(maxY, v.y);
    }
    return bounds.left - expand < maxX && minX < bounds.right + expand && bounds.top - expand < maxY && minY < bounds.bottom + expand;
  }

  private _collectOccluders(cullBounds: BoundingBox, maxLightRadius: number): Occluder[] {
    const occluders: Occluder[] = [];
    for (let i = 0; i < this._occluderEntries.length; i++) {
      const entry = this._occluderEntries[i];
      if (!entry.comp.castShadows) {
        continue;
      }
      const occ = this._computeOccluderGeometry(entry);
      if (!this._occluderInRange(occ, cullBounds, 2 * maxLightRadius)) {
        continue;
      }
      occluders.push(occ);
    }
    return occluders;
  }

  /**
   * Transforms every occluder's (cached, world-space) geometry to screen space once for this frame,
   * so `_drawOccluderShadows` can reuse the same screen-space geometry for every light instead of
   * re-transforming it once per (light, occluder) pair. Also computes a screen-space bounding circle
   * per occluder so the shadow pass can cheaply skip (light, occluder) pairs that are out of range.
   */
  private _collectScreenOccluders(camera: Camera, cullBounds: BoundingBox, maxLightRadius: number): ScreenOccluder[] {
    const occluders = this._collectOccluders(cullBounds, maxLightRadius);
    const screenOccluders: ScreenOccluder[] = [];
    for (let i = 0; i < occluders.length; i++) {
      const occ = occluders[i];
      if (occ.kind === 'circle') {
        screenOccluders.push({
          kind: 'circle',
          screenCenter: camera.transform.multiply(occ.center),
          screenRadius: occ.radius * camera.zoom
        });
      } else {
        const screenVerts = occ.verts.map((v) => camera.transform.multiply(v));
        const boundCenter = new Vector(0, 0);
        for (let j = 0; j < screenVerts.length; j++) {
          boundCenter.x += screenVerts[j].x;
          boundCenter.y += screenVerts[j].y;
        }
        boundCenter.x /= screenVerts.length;
        boundCenter.y /= screenVerts.length;
        let boundRadius = 0;
        for (let j = 0; j < screenVerts.length; j++) {
          boundRadius = Math.max(boundRadius, Vector.distance(boundCenter, screenVerts[j]));
        }
        screenOccluders.push({ kind: 'poly', screenVerts, boundCenter, boundRadius });
      }
    }
    return screenOccluders;
  }

  private _drawOccluderShadows(
    ctx: CanvasRenderingContext2D,
    lightScreen: Vector,
    lightScreenRadius: number,
    occluders: ScreenOccluder[],
    reach: number
  ): void {
    const shadowNearOpacity = this._engine.lighting.shadowNearOpacity;
    const shadowMidOpacity = this._engine.lighting.shadowMidOpacity;
    for (let i = 0; i < occluders.length; i++) {
      const occ = occluders[i];
      if (occ.kind === 'circle') {
        const dx = occ.screenCenter.x - lightScreen.x;
        const dy = occ.screenCenter.y - lightScreen.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const nearDist = Math.max(0, dist - occ.screenRadius);
        // The light's gradient fades to zero at its screen radius - a shadow starting entirely
        // beyond it erases nothing, skip before paying for the gradient + fill
        if (nearDist > lightScreenRadius) {
          continue;
        }
        const grad = ctx.createRadialGradient(lightScreen.x, lightScreen.y, nearDist, lightScreen.x, lightScreen.y, reach);
        grad.addColorStop(0, `rgba(0,0,0,${shadowNearOpacity})`);
        grad.addColorStop(0.4, `rgba(0,0,0,${shadowMidOpacity})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');

        drawShadowCircle(ctx, lightScreen, occ.screenCenter, occ.screenRadius, reach, grad);
      } else {
        const bdx = occ.boundCenter.x - lightScreen.x;
        const bdy = occ.boundCenter.y - lightScreen.y;
        if (Math.sqrt(bdx * bdx + bdy * bdy) - occ.boundRadius > lightScreenRadius) {
          continue;
        }
        const poly = shadowPolygon(lightScreen, occ.screenVerts, reach);
        if (poly.length < 3) {
          continue;
        }

        const nearDist = Vector.distance(poly[0], lightScreen);

        const grad = ctx.createRadialGradient(lightScreen.x, lightScreen.y, nearDist, lightScreen.x, lightScreen.y, reach);
        grad.addColorStop(0, `rgba(0,0,0,${shadowNearOpacity})`);
        grad.addColorStop(0.4, `rgba(0,0,0,${shadowMidOpacity})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(poly[0].x, poly[0].y);
        for (let j = 1; j < poly.length; j++) {
          ctx.lineTo(poly[j].x, poly[j].y);
        }
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  private _paintPointGradient(c: CanvasRenderingContext2D, screenPos: Vector, screenRadius: number, alpha: number): void {
    const grad = c.createRadialGradient(screenPos.x, screenPos.y, 0, screenPos.x, screenPos.y, screenRadius);
    grad.addColorStop(0, `rgba(255,255,255,${alpha})`);
    grad.addColorStop(0.6, `rgba(255,255,255,${alpha * 0.6})`);
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = grad;
    c.beginPath();
    c.arc(screenPos.x, screenPos.y, screenRadius, 0, Math.PI * 2);
    c.fill();
  }

  private _paintConeGradient(
    c: CanvasRenderingContext2D,
    screenPos: Vector,
    screenRadius: number,
    alpha: number,
    cone: ConeGradientOptions
  ): void {
    const softEdgeStart = Math.max(0, 1 - cone.softness);

    const grad = c.createRadialGradient(screenPos.x, screenPos.y, 0, screenPos.x, screenPos.y, screenRadius);
    grad.addColorStop(0, `rgba(255,255,255,${alpha})`);
    grad.addColorStop(softEdgeStart * 0.7, `rgba(255,255,255,${alpha * 0.5})`);
    grad.addColorStop(softEdgeStart, `rgba(255,255,255,${alpha * 0.2})`);
    grad.addColorStop(1, 'rgba(255,255,255,0)');

    c.fillStyle = grad;
    c.beginPath();
    c.moveTo(screenPos.x, screenPos.y);
    c.arc(screenPos.x, screenPos.y, screenRadius, cone.startAngle, cone.endAngle);
    c.closePath();
    c.fill();
  }

  /**
   * Draws a single light's shape into the offscreen scratch canvas, punches its occluder shadows
   * out of it (destination-out), then punches the scratch out of the darkness veil (lights erase
   * darkness).
   */
  private _drawLight(
    ctx: CanvasRenderingContext2D,
    screenPos: Vector,
    screenRadius: number,
    alpha: number,
    occluders: ScreenOccluder[],
    roomClips: RoomClip[],
    w: number,
    h: number,
    camera: Camera,
    cone?: ConeGradientOptions
  ): void {
    if (!this._offscreenCtx || !this._offscreen) {
      return;
    }
    this._offscreenCtx.clearRect(0, 0, w, h);

    const activeClip = findRoomClip(camera.inverse, screenPos, roomClips);

    if (activeClip) {
      this._offscreenCtx.save();
      this._offscreenCtx.beginPath();
      pathRoomQuad(this._offscreenCtx, activeClip.screenCorners);
      this._offscreenCtx.clip();
    }

    const shadowReach = activeClip ? Vector.distance(activeClip.screenCorners[0], activeClip.screenCorners[2]) : Math.sqrt(w ** 2 + h ** 2);

    this._offscreenCtx.globalCompositeOperation = 'source-over';
    if (cone) {
      this._paintConeGradient(this._offscreenCtx, screenPos, screenRadius, alpha, cone);
    } else {
      this._paintPointGradient(this._offscreenCtx, screenPos, screenRadius, alpha);
    }

    this._offscreenCtx.globalCompositeOperation = 'destination-out';
    this._drawOccluderShadows(this._offscreenCtx, screenPos, screenRadius, occluders, shadowReach);

    if (activeClip) {
      this._offscreenCtx.restore();
    }

    ctx.save();
    if (activeClip) {
      ctx.beginPath();
      pathRoomQuad(ctx, activeClip.screenCorners);
      ctx.clip();
    }
    ctx.globalCompositeOperation = 'destination-out';
    ctx.drawImage(this._offscreen, 0, 0);
    ctx.restore();
  }

  /**
   * Paints the additive colored tint for a non-white light, clipped to its containing room rect
   */
  private _drawColorTint(
    ctx: CanvasRenderingContext2D,
    light: PointLightComponent | ConeLightComponent,
    screenPos: Vector,
    camera: Camera,
    roomClips: RoomClip[],
    wedge?: { start: number; end: number }
  ): void {
    const activeClip = findRoomClip(camera.inverse, screenPos, roomClips);

    ctx.save();
    if (activeClip) {
      ctx.beginPath();
      pathRoomQuad(ctx, activeClip.screenCorners);
      ctx.clip();
    }
    ctx.globalCompositeOperation = 'source-over';

    const screenRadius = light.radius * camera.zoom;
    const tintAlpha = light.currentIntensity * this._engine.lighting.tintAlphaFactor;

    const grad = ctx.createRadialGradient(screenPos.x, screenPos.y, 0, screenPos.x, screenPos.y, screenRadius);
    grad.addColorStop(0, Color.fromRGB(light.color.r, light.color.g, light.color.b, tintAlpha).toRGBA());
    grad.addColorStop(0.5, Color.fromRGB(light.color.r, light.color.g, light.color.b, tintAlpha * 0.4).toRGBA());
    grad.addColorStop(1, Color.fromRGB(light.color.r, light.color.g, light.color.b, 0).toRGBA());

    ctx.fillStyle = grad;
    ctx.beginPath();
    if (wedge) {
      ctx.moveTo(screenPos.x, screenPos.y);
      ctx.arc(screenPos.x, screenPos.y, screenRadius, wedge.start, wedge.end);
      ctx.closePath();
    } else {
      ctx.arc(screenPos.x, screenPos.y, screenRadius, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.restore();
  }

  private _drawPointLights(
    ctx: CanvasRenderingContext2D,
    occluders: ScreenOccluder[],
    roomClips: RoomClip[],
    w: number,
    h: number,
    camera: Camera
  ): void {
    for (let i = 0; i < this._pointLights.length; i++) {
      const entry = this._pointLights[i];
      if (!entry.visible) {
        continue;
      }
      this._drawLight(ctx, entry.screenPos, entry.screenRadius, entry.light.currentIntensity, occluders, roomClips, w, h, camera);
    }
  }

  private _drawConeLights(
    ctx: CanvasRenderingContext2D,
    occluders: ScreenOccluder[],
    roomClips: RoomClip[],
    w: number,
    h: number,
    camera: Camera
  ): void {
    for (let i = 0; i < this._coneLights.length; i++) {
      const entry = this._coneLights[i];
      if (!entry.visible) {
        continue;
      }
      const light = entry.light;
      const halfAngle = light.angle / 2;
      // direction is relative to the owning entity's world rotation, so a cone parented to a
      // rotating entity sweeps with it; camera rotation carries the result into screen space
      const screenDirection = light.direction + entry.transform.globalRotation + camera.rotation;

      this._drawLight(ctx, entry.screenPos, entry.screenRadius, light.currentIntensity, occluders, roomClips, w, h, camera, {
        startAngle: screenDirection - halfAngle,
        endAngle: screenDirection + halfAngle,
        softness: light.softness
      });
    }
  }

  private _drawColorTints(ctx: CanvasRenderingContext2D, roomClips: RoomClip[], camera: Camera): void {
    for (let i = 0; i < this._pointLights.length; i++) {
      const entry = this._pointLights[i];
      if (!entry.visible || entry.light.color.equal(Color.White)) {
        continue;
      }
      this._drawColorTint(ctx, entry.light, entry.screenPos, camera, roomClips);
    }

    for (let i = 0; i < this._coneLights.length; i++) {
      const entry = this._coneLights[i];
      if (!entry.visible || entry.light.color.equal(Color.White)) {
        continue;
      }
      const light = entry.light;
      const halfAngle = light.angle / 2;
      const screenDirection = light.direction + entry.transform.globalRotation + camera.rotation;
      this._drawColorTint(ctx, light, entry.screenPos, camera, roomClips, {
        start: screenDirection - halfAngle,
        end: screenDirection + halfAngle
      });
    }
  }

  private _renderLightingCanvas(ctx: CanvasRenderingContext2D): void {
    const camera = this._scene.camera;

    const w = this._lightingCanvas.width;
    const h = this._lightingCanvas.height;

    ctx.clearRect(0, 0, w, h);

    this._computeAmbient(this._ambientScratch);
    const roomClips = this._drawDarknessVeil(ctx, w, h, camera, this._ambientScratch.intensity, this._ambientScratch.color);

    const cullPadding = this._engine.lighting.cullPadding;
    const vp = this._engine.screen.getWorldBounds();
    const cullBounds = new BoundingBox(vp.left - cullPadding, vp.top - cullPadding, vp.right + cullPadding, vp.bottom + cullPadding);
    this._updateLightVisibility(this._pointLights, cullBounds, camera);
    this._updateLightVisibility(this._coneLights, cullBounds, camera);

    let maxLightRadius = 0;
    for (let i = 0; i < this._pointLights.length; i++) {
      if (this._pointLights[i].visible) {
        maxLightRadius = Math.max(maxLightRadius, this._pointLights[i].light.radius);
      }
    }
    for (let i = 0; i < this._coneLights.length; i++) {
      if (this._coneLights[i].visible) {
        maxLightRadius = Math.max(maxLightRadius, this._coneLights[i].light.radius);
      }
    }

    const occluders = this._collectScreenOccluders(camera, cullBounds, maxLightRadius);

    this._drawPointLights(ctx, occluders, roomClips, w, h, camera);
    this._drawConeLights(ctx, occluders, roomClips, w, h, camera);
    this._drawColorTints(ctx, roomClips, camera);
  }
}
