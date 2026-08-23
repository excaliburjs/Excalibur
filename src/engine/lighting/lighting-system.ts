import { System, SystemType } from '../entity-component-system/system';
import { SystemPriority } from '../entity-component-system/priority';
import type { World } from '../entity-component-system/world';
import type { Query } from '../entity-component-system/query';
import { TransformComponent } from '../entity-component-system/components/transform-component';
import type { Scene } from '../scene';
import type { Engine } from '../engine';
import type { Camera } from '../camera';
import { Vector } from '../math/vector';
import type { AffineMatrix } from '../math/affine-matrix';
import { CoordPlane } from '../math/coord-plane';
import { Color } from '../color';
import { ScreenElement } from '../screen-element';
import { Canvas } from '../graphics/canvas';
import { Logger } from '../util/log';
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
  lastZoom: number | null;
  lastRotation: number | null;
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
 * Known limitation: since the near tip is the closest hull point rather than one of the silhouette
 * extremes, the shadow's near edge can still kink/split when the silhouette edge is not face on with
 * the occluder.
 */
function shadowPolygon(lightSource: Vector, occluderVerts: Vector[], camTransform: AffineMatrix, reach: number): Vector[] {
  const occluderScreenVerts: Vector[] = [];
  for (let i = 0; i < occluderVerts.length; i++) {
    occluderScreenVerts.push(camTransform.multiply(occluderVerts[i]));
  }

  let nearestDistSq = Infinity;
  let minAngle = Infinity;
  let maxAngle = -Infinity;
  let minAngleIdx = 0;
  let maxAngleIdx = 0;
  let nearestIdx = 0;

  for (let i = 0; i < occluderScreenVerts.length; i++) {
    // light source to occluder vertex
    const angle = Math.atan2(occluderScreenVerts[i].y - lightSource.y, occluderScreenVerts[i].x - lightSource.x);
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
  centerWorld: Vector,
  worldRadius: number,
  camTransform: AffineMatrix,
  zoom: number,
  reach: number,
  grad: CanvasGradient
): void {
  const center = camTransform.multiply(centerWorld);
  const screenRadius = worldRadius * zoom;

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

  const tp1 = new Vector(center.x + Math.cos(t1 + Math.PI / 2) * screenRadius, center.y + Math.sin(t1 + Math.PI / 2) * screenRadius);
  const tp2 = new Vector(center.x + Math.cos(t2 - Math.PI / 2) * screenRadius, center.y + Math.sin(t2 - Math.PI / 2) * screenRadius);

  const far1 = projectAway(tp1, lightScreen, reach);
  const far2 = projectAway(tp2, lightScreen, reach);

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(tp1.x, tp1.y);
  ctx.lineTo(far1.x, far1.y);
  ctx.lineTo(far2.x, far2.y);
  ctx.lineTo(tp2.x, tp2.y);
  ctx.arc(center.x, center.y, screenRadius, t2 - Math.PI / 2, t1 + Math.PI / 2, true);
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

  private _darknessQuery!: Query<typeof DarknessComponent | typeof TransformComponent>;
  private _pointQuery!: Query<typeof PointLightComponent | typeof TransformComponent>;
  private _coneQuery!: Query<typeof ConeLightComponent | typeof TransformComponent>;
  private _occluderQuery!: Query<typeof LightOccluderComponent | typeof TransformComponent>;

  private _darknessEntries: DarknessEntry[] = [];
  private _pointLights: LightEntry<PointLightComponent>[] = [];
  private _coneLights: LightEntry<ConeLightComponent>[] = [];
  private _occluderEntries: OccluderEntry[] = [];
  private _ambientScratch: AmbientResult = { intensity: 0, color: null };

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

  private _initDarkness(world: World): void {
    this._darknessQuery = world.query([DarknessComponent, TransformComponent]);
    for (const e of this._darknessQuery.entities) {
      this._darknessEntries.push({
        comp: e.get(DarknessComponent)!,
        transform: e.get(TransformComponent)!,
        cached: null,
        lastCenterX: null,
        lastCenterY: null,
        lastZoom: null,
        lastRotation: null,
        lastWidth: null,
        lastHeight: null
      });
    }
    this._darknessQuery.entityAdded$.subscribe((e) => {
      this._darknessEntries.push({
        comp: e.get(DarknessComponent)!,
        transform: e.get(TransformComponent)!,
        cached: null,
        lastCenterX: null,
        lastCenterY: null,
        lastZoom: null,
        lastRotation: null,
        lastWidth: null,
        lastHeight: null
      });
    });
    this._darknessQuery.entityRemoved$.subscribe((e) => {
      const comp = e.get(DarknessComponent)!;
      const index = this._darknessEntries.findIndex((entry) => entry.comp === comp);
      if (index > -1) {
        this._darknessEntries.splice(index, 1);
      }
    });
  }

  private _initPointLights(world: World): void {
    this._pointQuery = world.query([PointLightComponent, TransformComponent]);
    for (const e of this._pointQuery.entities) {
      this._pointLights.push({ light: e.get(PointLightComponent)!, transform: e.get(TransformComponent)! });
    }
    this._pointQuery.entityAdded$.subscribe((e) => {
      this._pointLights.push({ light: e.get(PointLightComponent)!, transform: e.get(TransformComponent)! });
    });
    this._pointQuery.entityRemoved$.subscribe((e) => {
      const light = e.get(PointLightComponent)!;
      const index = this._pointLights.findIndex((entry) => entry.light === light);
      if (index > -1) {
        this._pointLights.splice(index, 1);
      }
    });
  }

  private _initConeLights(world: World): void {
    this._coneQuery = world.query([ConeLightComponent, TransformComponent]);
    for (const e of this._coneQuery.entities) {
      this._coneLights.push({ light: e.get(ConeLightComponent)!, transform: e.get(TransformComponent)! });
    }
    this._coneQuery.entityAdded$.subscribe((e) => {
      this._coneLights.push({ light: e.get(ConeLightComponent)!, transform: e.get(TransformComponent)! });
    });
    this._coneQuery.entityRemoved$.subscribe((e) => {
      const light = e.get(ConeLightComponent)!;
      const index = this._coneLights.findIndex((entry) => entry.light === light);
      if (index > -1) {
        this._coneLights.splice(index, 1);
      }
    });
  }

  private _initOccluders(world: World): void {
    this._occluderQuery = world.query([LightOccluderComponent, TransformComponent]);
    for (const e of this._occluderQuery.entities) {
      this._occluderEntries.push({
        comp: e.get(LightOccluderComponent)!,
        transform: e.get(TransformComponent)!,
        cached: null,
        cachedLocalVerts: null,
        lastX: null,
        lastY: null,
        lastRotation: null,
        lastScaleX: null,
        lastScaleY: null
      });
    }
    this._occluderQuery.entityAdded$.subscribe((e) => {
      this._occluderEntries.push({
        comp: e.get(LightOccluderComponent)!,
        transform: e.get(TransformComponent)!,
        cached: null,
        cachedLocalVerts: null,
        lastX: null,
        lastY: null,
        lastRotation: null,
        lastScaleX: null,
        lastScaleY: null
      });
    });
    this._occluderQuery.entityRemoved$.subscribe((e) => {
      const comp = e.get(LightOccluderComponent)!;
      const index = this._occluderEntries.findIndex((entry) => entry.comp === comp);
      if (index > -1) {
        this._occluderEntries.splice(index, 1);
      }
    });
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

    // Load bearing: flagDirty() forces this frame's light/darkness/occluder state to be re-rendered.
    // rasterize() is called here rather than left lazy so the raster cost is attributed to
    // LightingSystem in profiling/debug instrumentation, not GraphicsSystem/DrawingSystem.
    this._lightingCanvas.flagDirty();
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
   * rebuilds when the room's world position/dimensions or the camera's zoom/rotation changed since
   * last frame.
   */
  private _computeRoomClip(entry: DarknessEntry, camera: Camera): RoomClip {
    const d = entry.comp;
    const pos = entry.transform.pos;
    const unchanged =
      entry.cached &&
      entry.lastCenterX === pos.x &&
      entry.lastCenterY === pos.y &&
      entry.lastZoom === camera.zoom &&
      entry.lastRotation === camera.rotation &&
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
    entry.lastZoom = camera.zoom;
    entry.lastRotation = camera.rotation;
    entry.lastWidth = d.width;
    entry.lastHeight = d.height;

    return entry.cached;
  }

  private _inCameraView(cullBounds: BoundingBox, worldPos: Vector, radius: number): boolean {
    return cullBounds.overlaps(BoundingBox.fromDimension(radius * 2, radius * 2, Vector.Half, worldPos));
  }

  /**
   * Computes (and caches) an occluder's world-space shadow geometry. Only re-projects through the
   * entity's transform when its position/rotation/scale or the component's shape/offset changed
   * since last frame — avoids rebuilding shadow geometry for static occluders every frame.
   */
  private _computeOccluderGeometry(entry: OccluderEntry): Occluder {
    const xf = entry.transform.get();
    const pos = xf.pos;
    const rotation = xf.rotation;
    const scale = xf.scale;
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

  private _collectOccluders(): Occluder[] {
    const occluders: Occluder[] = [];
    for (let i = 0; i < this._occluderEntries.length; i++) {
      const entry = this._occluderEntries[i];
      if (!entry.comp.castShadows) {
        continue;
      }
      occluders.push(this._computeOccluderGeometry(entry));
    }
    return occluders;
  }

  private _drawOccluderShadows(
    ctx: CanvasRenderingContext2D,
    lightScreen: Vector,
    occluders: Occluder[],
    reach: number,
    camTransform: AffineMatrix
  ): void {
    const zoom = this._scene.camera.zoom;
    const shadowNearOpacity = this._engine.lighting.shadowNearOpacity;
    const shadowMidOpacity = this._engine.lighting.shadowMidOpacity;
    for (let i = 0; i < occluders.length; i++) {
      const occ = occluders[i];
      if (occ.kind === 'circle') {
        const centerScreen = camTransform.multiply(occ.center);
        const dx = centerScreen.x - lightScreen.x;
        const dy = centerScreen.y - lightScreen.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const nearDist = Math.max(0, dist - occ.radius * zoom);
        const grad = ctx.createRadialGradient(lightScreen.x, lightScreen.y, nearDist, lightScreen.x, lightScreen.y, reach);
        grad.addColorStop(0, `rgba(0,0,0,${shadowNearOpacity})`);
        grad.addColorStop(0.4, `rgba(0,0,0,${shadowMidOpacity})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');

        drawShadowCircle(ctx, lightScreen, occ.center, occ.radius, camTransform, zoom, reach, grad);
      } else {
        const poly = shadowPolygon(lightScreen, occ.verts, camTransform, reach);
        if (poly.length < 3) {
          continue;
        }

        const nearMidX = (poly[0].x + poly[3].x) / 2;
        const nearMidY = (poly[0].y + poly[3].y) / 2;
        const nearDist = Math.sqrt((nearMidX - lightScreen.x) ** 2 + (nearMidY - lightScreen.y) ** 2);

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
    occluders: Occluder[],
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
    this._drawOccluderShadows(this._offscreenCtx, screenPos, occluders, shadowReach, camera.transform);

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
    cullBounds: BoundingBox,
    occluders: Occluder[],
    roomClips: RoomClip[],
    w: number,
    h: number,
    camera: Camera
  ): void {
    for (let i = 0; i < this._pointLights.length; i++) {
      const entry = this._pointLights[i];
      const light = entry.light;
      if (!light.enabled) {
        continue;
      }
      const pos = entry.transform.pos;
      if (!this._inCameraView(cullBounds, pos, light.radius)) {
        continue;
      }

      const screenPos = camera.transform.multiply(pos);
      const screenRadius = light.radius * camera.zoom;

      this._drawLight(ctx, screenPos, screenRadius, light.currentIntensity, occluders, roomClips, w, h, camera);
    }
  }

  private _drawConeLights(
    ctx: CanvasRenderingContext2D,
    cullBounds: BoundingBox,
    occluders: Occluder[],
    roomClips: RoomClip[],
    w: number,
    h: number,
    camera: Camera
  ): void {
    for (let i = 0; i < this._coneLights.length; i++) {
      const entry = this._coneLights[i];
      const light = entry.light;
      if (!light.enabled) {
        continue;
      }
      const pos = entry.transform.pos;
      if (!this._inCameraView(cullBounds, pos, light.radius)) {
        continue;
      }

      const screenPos = camera.transform.multiply(pos);
      const screenRadius = light.radius * camera.zoom;
      const halfAngle = light.angle / 2;
      const screenDirection = light.direction + camera.rotation;

      this._drawLight(ctx, screenPos, screenRadius, light.currentIntensity, occluders, roomClips, w, h, camera, {
        startAngle: screenDirection - halfAngle,
        endAngle: screenDirection + halfAngle,
        softness: light.softness
      });
    }
  }

  private _drawColorTints(ctx: CanvasRenderingContext2D, cullBounds: BoundingBox, roomClips: RoomClip[], camera: Camera): void {
    for (let i = 0; i < this._pointLights.length; i++) {
      const entry = this._pointLights[i];
      const light = entry.light;
      if (!light.enabled || light.color.equal(Color.White)) {
        continue;
      }
      const pos = entry.transform.pos;
      if (!this._inCameraView(cullBounds, pos, light.radius)) {
        continue;
      }

      this._drawColorTint(ctx, light, camera.transform.multiply(pos), camera, roomClips);
    }

    for (let i = 0; i < this._coneLights.length; i++) {
      const entry = this._coneLights[i];
      const light = entry.light;
      if (!light.enabled || light.color.equal(Color.White)) {
        continue;
      }
      const pos = entry.transform.pos;
      if (!this._inCameraView(cullBounds, pos, light.radius)) {
        continue;
      }

      const halfAngle = light.angle / 2;
      const screenDirection = light.direction + camera.rotation;
      this._drawColorTint(ctx, light, camera.transform.multiply(pos), camera, roomClips, {
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
    const vp = camera.viewport;
    const cullBounds = new BoundingBox(vp.left - cullPadding, vp.top - cullPadding, vp.right + cullPadding, vp.bottom + cullPadding);

    const occluders = this._collectOccluders();

    this._drawPointLights(ctx, cullBounds, occluders, roomClips, w, h, camera);
    this._drawConeLights(ctx, cullBounds, occluders, roomClips, w, h, camera);
    this._drawColorTints(ctx, cullBounds, roomClips, camera);
  }
}
