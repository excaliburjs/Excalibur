import { System, SystemType } from '../entity-component-system/system';
import { SystemPriority } from '../entity-component-system/priority';
import type { World } from '../entity-component-system/world';
import type { Query } from '../entity-component-system/query';
import { TransformComponent } from '../entity-component-system/components/transform-component';
import type { Scene } from '../scene';
import type { Engine } from '../engine';
import { Vector } from '../math/vector';
import type { AffineMatrix } from '../math/affine-matrix';
import { CoordPlane } from '../math/coord-plane';
import { Color } from '../color';
import { ScreenElement } from '../screen-element';
import { Canvas } from '../graphics/canvas';
import { Logger } from '../util/log';
import { BoundingBox } from '../collision/bounding-box';
import { DarknessComponent } from './darkness-component';
import { AmbientLightComponent } from './ambient-light-component';
import { PointLightComponent } from './point-light-component';
import { ConeLightComponent } from './cone-light-component';
import { LightOccluderComponent } from './light-occluder-component';
import type { Occluder } from './light-occluder-component';

interface DarknessEntry {
  comp: DarknessComponent;
  transform: TransformComponent;
  cachedRect: BoundingBox | null;
  lastCenterX: number | null;
  lastCenterY: number | null;
  lastZoom: number | null;
  lastWidth: number | null;
  lastHeight: number | null;
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

/** Finds the room darkness rect (if any) that contains a screen-space point, used to clip light/shadow drawing */
function findRoomClip(screenPos: Vector, roomClips: BoundingBox[]): BoundingBox | undefined {
  return roomClips.find((clip) => clip.contains(screenPos));
}

/**
 * Computes a 2D shadow volume polygon projecting away from a light source point.
 *
 * Wraps the occluder's screen-space hull: the nearest hull vertex to the light becomes the shadow's
 * near tip, the min/max angular hull vertices (as seen from the light) are the silhouette edge
 * extremes, and those two silhouette vertices are projected out to `reach` to close off the far edge.
 *
 * Known limitation: the quad splits the corners if the silhouette edge is not face on with the occluder.
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

  const project = (v: Vector): Vector => {
    const dx = v.x - lightSource.x;
    const dy = v.y - lightSource.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    return new Vector(v.x + (dx / len) * reach, v.y + (dy / len) * reach);
  };

  const farMin = project(occluderScreenVerts[minAngleIdx]);
  const farMax = project(occluderScreenVerts[maxAngleIdx]);

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

  const project = (v: Vector): Vector => {
    const px = v.x - lightScreen.x;
    const py = v.y - lightScreen.y;
    const len = Math.sqrt(px * px + py * py) || 1;
    return new Vector(v.x + (px / len) * reach, v.y + (py / len) * reach);
  };

  const far1 = project(tp1);
  const far2 = project(tp2);

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
 * **Low performance API** — the overlay is rasterized with the 2D Canvas API and re-uploaded to the
 * GPU every frame.
 *
 * Known limitations: camera rotation is ignored, occluder shadow *radii* are not scaled by entity
 * scale (only occluder position/rotation/vertices are), and polygon shadow volumes can split at
 * corners when the silhouette edge is not face on to the light.
 */
export class LightingSystem extends System {
  static priority = SystemPriority.Lower;
  public readonly systemType = SystemType.Update;

  private _options: LightingSystemOptions;
  private _engine!: Engine;
  private _scene!: Scene;

  private _lightingEntity!: ScreenElement;
  private _lightingCanvas!: Canvas;
  private _offscreen: HTMLCanvasElement | null = null;
  private _offscreenCtx: CanvasRenderingContext2D | null = null;

  private _darknessQuery!: Query<typeof DarknessComponent | typeof TransformComponent>;
  private _ambientQuery!: Query<typeof AmbientLightComponent>;
  private _pointQuery!: Query<typeof PointLightComponent | typeof TransformComponent>;
  private _coneQuery!: Query<typeof ConeLightComponent | typeof TransformComponent>;
  private _occluderQuery!: Query<typeof LightOccluderComponent | typeof TransformComponent>;

  private _darknessEntries: DarknessEntry[] = [];
  private _ambientLights: AmbientLightComponent[] = [];
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

    this._darknessQuery = world.query([DarknessComponent, TransformComponent]);
    for (const e of this._darknessQuery.entities) {
      this._darknessEntries.push({
        comp: e.get(DarknessComponent)!,
        transform: e.get(TransformComponent)!,
        cachedRect: null,
        lastCenterX: null,
        lastCenterY: null,
        lastZoom: null,
        lastWidth: null,
        lastHeight: null
      });
    }
    this._darknessQuery.entityAdded$.subscribe((e) => {
      this._darknessEntries.push({
        comp: e.get(DarknessComponent)!,
        transform: e.get(TransformComponent)!,
        cachedRect: null,
        lastCenterX: null,
        lastCenterY: null,
        lastZoom: null,
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

    this._ambientQuery = world.query([AmbientLightComponent]);
    for (const e of this._ambientQuery.entities) {
      this._ambientLights.push(e.get(AmbientLightComponent)!);
    }
    this._ambientQuery.entityAdded$.subscribe((e) => {
      this._ambientLights.push(e.get(AmbientLightComponent)!);
    });
    this._ambientQuery.entityRemoved$.subscribe((e) => {
      const comp = e.get(AmbientLightComponent)!;
      const index = this._ambientLights.indexOf(comp);
      if (index > -1) {
        this._ambientLights.splice(index, 1);
      }
    });

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

    this._lightingCanvas.flagDirty();
  }

  /**
   * Writes the scene's effective ambient intensity/color into `dest` (avoids allocating a fresh
   * object every frame). Last ambient light in the scene wins, they are not blended.
   */
  private _computeAmbient(dest: AmbientResult): void {
    dest.intensity = this._engine.lighting.ambientIntensity;
    dest.color = null;
    for (let i = 0; i < this._ambientLights.length; i++) {
      const a = this._ambientLights[i];
      dest.intensity = a.enabled ? a.intensity : 0;
      dest.color = a.enabled ? a.color : null;
    }
    if (this._ambientLights.length > 1 && process.env.NODE_ENV === 'development') {
      Logger.getInstance().warnOnce(
        `Scene has ${this._ambientLights.length} AmbientLightComponents, only the last one added is used — they are not blended`
      );
    }
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
    effectiveZoom: number,
    camTransform: AffineMatrix,
    ambientIntensity: number,
    ambientColor: Color | null
  ): BoundingBox[] {
    const roomClips: BoundingBox[] = [];

    for (let i = 0; i < this._darknessEntries.length; i++) {
      const entry = this._darknessEntries[i];
      const d = entry.comp;

      if (d.width === Infinity || d.height === Infinity) {
        ctx.fillStyle = this._darknessFill(d, ambientIntensity, ambientColor);
        ctx.fillRect(0, 0, w, h);
        continue;
      }

      const center = camTransform.multiply(entry.transform.pos);
      const rect = this._computeRoomRect(entry, center, effectiveZoom);
      roomClips.push(rect);

      ctx.fillStyle = this._darknessFill(d, ambientIntensity, ambientColor);
      ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
    }

    return roomClips;
  }

  /**
   * Computes (and caches) a room darkness rect's screen-space clip bounds. Only rebuilds the
   * BoundingBox when the room's screen position, zoom, or dimensions changed since last frame.
   */
  private _computeRoomRect(entry: DarknessEntry, center: Vector, effectiveZoom: number): BoundingBox {
    const d = entry.comp;
    const unchanged =
      entry.cachedRect &&
      entry.lastCenterX === center.x &&
      entry.lastCenterY === center.y &&
      entry.lastZoom === effectiveZoom &&
      entry.lastWidth === d.width &&
      entry.lastHeight === d.height;

    if (unchanged) {
      return entry.cachedRect!;
    }

    const hw = (d.width / 2) * effectiveZoom;
    const hh = (d.height / 2) * effectiveZoom;

    entry.cachedRect = BoundingBox.fromDimension(hw * 2, hh * 2, Vector.Half, center);
    entry.lastCenterX = center.x;
    entry.lastCenterY = center.y;
    entry.lastZoom = effectiveZoom;
    entry.lastWidth = d.width;
    entry.lastHeight = d.height;

    return entry.cachedRect;
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
        radius: entry.comp.shape.radius
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
    for (const occ of occluders) {
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
        for (let i = 1; i < poly.length; i++) {
          ctx.lineTo(poly[i].x, poly[i].y);
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
    roomClips: BoundingBox[],
    w: number,
    h: number,
    camTransform: AffineMatrix,
    cone?: ConeGradientOptions
  ): void {
    if (!this._offscreenCtx || !this._offscreen) {
      return;
    }
    this._offscreenCtx.clearRect(0, 0, w, h);

    const activeClip = findRoomClip(screenPos, roomClips);

    if (activeClip) {
      this._offscreenCtx.save();
      this._offscreenCtx.beginPath();
      this._offscreenCtx.rect(activeClip.left, activeClip.top, activeClip.width, activeClip.height);
      this._offscreenCtx.clip();
    }

    const shadowReach = activeClip ? Math.sqrt(activeClip.width ** 2 + activeClip.height ** 2) : Math.sqrt(w ** 2 + h ** 2);

    this._offscreenCtx.globalCompositeOperation = 'source-over';
    if (cone) {
      this._paintConeGradient(this._offscreenCtx, screenPos, screenRadius, alpha, cone);
    } else {
      this._paintPointGradient(this._offscreenCtx, screenPos, screenRadius, alpha);
    }

    this._offscreenCtx.globalCompositeOperation = 'destination-out';
    this._drawOccluderShadows(this._offscreenCtx, screenPos, occluders, shadowReach, camTransform);

    if (activeClip) {
      this._offscreenCtx.restore();
    }

    ctx.save();
    if (activeClip) {
      ctx.beginPath();
      ctx.rect(activeClip.left, activeClip.top, activeClip.width, activeClip.height);
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
    effectiveZoom: number,
    roomClips: BoundingBox[],
    wedge?: { start: number; end: number }
  ): void {
    const activeClip = findRoomClip(screenPos, roomClips);

    ctx.save();
    if (activeClip) {
      ctx.beginPath();
      ctx.rect(activeClip.left, activeClip.top, activeClip.width, activeClip.height);
      ctx.clip();
    }
    ctx.globalCompositeOperation = 'source-over';

    const screenRadius = light.radius * effectiveZoom;
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
    roomClips: BoundingBox[],
    w: number,
    h: number,
    effectiveZoom: number,
    camTransform: AffineMatrix
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

      const screenPos = camTransform.multiply(pos);
      const screenRadius = light.radius * effectiveZoom;

      this._drawLight(ctx, screenPos, screenRadius, light.currentIntensity, occluders, roomClips, w, h, camTransform);
    }
  }

  private _drawConeLights(
    ctx: CanvasRenderingContext2D,
    cullBounds: BoundingBox,
    occluders: Occluder[],
    roomClips: BoundingBox[],
    w: number,
    h: number,
    effectiveZoom: number,
    camTransform: AffineMatrix
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

      const screenPos = camTransform.multiply(pos);
      const screenRadius = light.radius * effectiveZoom;
      const halfAngle = light.angle / 2;

      this._drawLight(ctx, screenPos, screenRadius, light.currentIntensity, occluders, roomClips, w, h, camTransform, {
        startAngle: light.direction - halfAngle,
        endAngle: light.direction + halfAngle,
        softness: light.softness
      });
    }
  }

  private _drawColorTints(
    ctx: CanvasRenderingContext2D,
    cullBounds: BoundingBox,
    roomClips: BoundingBox[],
    effectiveZoom: number,
    camTransform: AffineMatrix
  ): void {
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

      this._drawColorTint(ctx, light, camTransform.multiply(pos), effectiveZoom, roomClips);
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
      this._drawColorTint(ctx, light, camTransform.multiply(pos), effectiveZoom, roomClips, {
        start: light.direction - halfAngle,
        end: light.direction + halfAngle
      });
    }
  }

  private _renderLightingCanvas(ctx: CanvasRenderingContext2D): void {
    const camera = this._scene.camera;
    const camTransform = camera.transform;

    const w = this._lightingCanvas.width;
    const h = this._lightingCanvas.height;
    const effectiveZoom = camera.zoom;

    ctx.clearRect(0, 0, w, h);

    this._computeAmbient(this._ambientScratch);
    const roomClips = this._drawDarknessVeil(
      ctx,
      w,
      h,
      effectiveZoom,
      camTransform,
      this._ambientScratch.intensity,
      this._ambientScratch.color
    );

    const cullPadding = this._engine.lighting.cullPadding;
    const vp = camera.viewport;
    const cullBounds = new BoundingBox(vp.left - cullPadding, vp.top - cullPadding, vp.right + cullPadding, vp.bottom + cullPadding);

    const occluders = this._collectOccluders();

    this._drawPointLights(ctx, cullBounds, occluders, roomClips, w, h, effectiveZoom, camTransform);
    this._drawConeLights(ctx, cullBounds, occluders, roomClips, w, h, effectiveZoom, camTransform);
    this._drawColorTints(ctx, cullBounds, roomClips, effectiveZoom, camTransform);
  }
}
