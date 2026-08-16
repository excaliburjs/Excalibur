import { System, SystemType } from '../entity-component-system/system';
import { SystemPriority } from '../entity-component-system/priority';
import type { World } from '../entity-component-system/world';
import type { Query } from '../entity-component-system/query';
import { TransformComponent } from '../entity-component-system/components/transform-component';
import type { Scene } from '../scene';
import type { Engine } from '../engine';
import { Vector } from '../math/vector';
import { CoordPlane } from '../math/coord-plane';
import { Color } from '../color';
import { ScreenElement } from '../screen-element';
import { Canvas } from '../graphics/canvas';
import { Logger } from '../util/log';
import { DarknessComponent } from './darkness-component';
import { AmbientLightComponent } from './ambient-light-component';
import { PointLightComponent } from './point-light-component';
import { ConeLightComponent } from './cone-light-component';
import { LightOccluderComponent } from './light-occluder-component';

type PolyOccluder = { kind: 'poly'; verts: Vector[] };
type CircleOccluder = { kind: 'circle'; center: Vector; radius: number };
type Occluder = PolyOccluder | CircleOccluder;

type WorldToScreen = (worldPos: Vector) => Vector;
type RoomClip = { x: number; y: number; w: number; h: number };

const DEFAULT_Z_INDEX = 100;
/** World-pixel padding added around the camera frustum when culling lights/occluders */
const CULL_PADDING = 64;
/** Ambient brightness floor assumed when no AmbientLightComponent is present */
const DEFAULT_AMBIENT_INTENSITY = 0.05;
/** Fraction of a light's intensity used when painting its colored tint */
const TINT_ALPHA_FACTOR = 0.35;
/** Occluder shadow radial gradient opacity at the occluder (near) edge */
const SHADOW_NEAR_OPACITY = 0.92;
/** Occluder shadow radial gradient opacity at 40% reach */
const SHADOW_MID_OPACITY = 0.6;

/** Projects local vertex chains out into full absolute world coordinates. Entity scale is not applied. */
function localToWorld(vertices: Vector[], worldPos: Vector, rotation: number): Vector[] {
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  return vertices.map((v) => new Vector(worldPos.x + v.x * cos - v.y * sin, worldPos.y + v.x * sin + v.y * cos));
}

/** Translates an Excalibur Color object into standard CSS rgba string format. */
function colorToRgba(color: Color, alpha: number): string {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
}

/**
 * Computes a 2D shadow volume polygon projecting away from a light source point.
 *
 * Known limitation: the quad splits the corners if the silhouette edge is not face on with the occluder.
 */
function shadowPolygon(lightSource: Vector, occluderVerts: Vector[], worldToScreen: WorldToScreen, reach: number): Vector[] {
  const occluderScreenVerts = occluderVerts.map(worldToScreen);

  let nearestDist = Infinity;
  let minAngle = Infinity;
  let maxAngle = -Infinity;
  let minIdx = 0;
  let maxIdx = 0;
  let nearestIdx = 0;

  // We find the smallest and largest angle because
  // these are the extremes of the shadow cast
  for (let i = 0; i < occluderScreenVerts.length; i++) {
    // light source to occluder
    const angle = Math.atan2(occluderScreenVerts[i].y - lightSource.y, occluderScreenVerts[i].x - lightSource.x);
    if (angle < minAngle) {
      minAngle = angle;
      minIdx = i;
    }
    if (angle > maxAngle) {
      maxAngle = angle;
      maxIdx = i;
    }

    // also find the nearest hull point
    const sqDist = lightSource.squareDistance(occluderScreenVerts[i]);
    if (sqDist < nearestDist) {
      nearestDist = sqDist;
      nearestIdx = i;
    }
  }

  const project = (v: Vector): Vector => {
    const dx = v.x - lightSource.x;
    const dy = v.y - lightSource.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    return new Vector(v.x + (dx / len) * reach, v.y + (dy / len) * reach);
  };

  const farMin = project(occluderScreenVerts[minIdx]);
  const farMax = project(occluderScreenVerts[maxIdx]);

  return [occluderScreenVerts[nearestIdx], occluderScreenVerts[minIdx], farMin, farMax, occluderScreenVerts[maxIdx]];
}

/** Renders a circular profile occlusion shadow block masking light distribution. */
function drawShadowCircle(
  ctx: CanvasRenderingContext2D,
  lightScreen: Vector,
  centerWorld: Vector,
  worldRadius: number,
  worldToScreen: WorldToScreen,
  zoom: number,
  reach: number,
  grad: CanvasGradient
): void {
  const center = worldToScreen(centerWorld);
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
 * Known limitations: camera rotation is ignored, entity scale is ignored for occluders, and polygon
 * shadow volumes can split at corners when the silhouette edge is not face on to the light.
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

  constructor(options?: LightingSystemOptions) {
    super();
    this._options = options ?? {};
  }

  public initialize(world: World, scene: Scene): void {
    this._scene = scene;
    this._engine = scene.engine;

    this._darknessQuery = world.query([DarknessComponent, TransformComponent]);
    this._ambientQuery = world.query([AmbientLightComponent]);
    this._pointQuery = world.query([PointLightComponent, TransformComponent]);
    this._coneQuery = world.query([ConeLightComponent, TransformComponent]);
    this._occluderQuery = world.query([LightOccluderComponent, TransformComponent]);

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
        z: this._options.zIndex ?? DEFAULT_Z_INDEX,
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

  private _drawOccluderShadows(
    ctx: CanvasRenderingContext2D,
    lightScreen: Vector,
    occluders: Occluder[],
    reach: number,
    worldToScreen: WorldToScreen
  ): void {
    const zoom = this._scene.camera.zoom;
    for (const occ of occluders) {
      if (occ.kind === 'circle') {
        const centerScreen = worldToScreen(occ.center);
        const dx = centerScreen.x - lightScreen.x;
        const dy = centerScreen.y - lightScreen.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const nearDist = Math.max(0, dist - occ.radius * zoom);
        const grad = ctx.createRadialGradient(lightScreen.x, lightScreen.y, nearDist, lightScreen.x, lightScreen.y, reach);
        grad.addColorStop(0, `rgba(0,0,0,${SHADOW_NEAR_OPACITY})`);
        grad.addColorStop(0.4, `rgba(0,0,0,${SHADOW_MID_OPACITY})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');

        drawShadowCircle(ctx, lightScreen, occ.center, occ.radius, worldToScreen, zoom, reach, grad);
      } else {
        const poly = shadowPolygon(lightScreen, occ.verts, worldToScreen, reach);
        if (poly.length < 3) {
          continue;
        }

        const nearMidX = (poly[0].x + poly[3].x) / 2;
        const nearMidY = (poly[0].y + poly[3].y) / 2;
        const nearDist = Math.sqrt((nearMidX - lightScreen.x) ** 2 + (nearMidY - lightScreen.y) ** 2);

        const grad = ctx.createRadialGradient(lightScreen.x, lightScreen.y, nearDist, lightScreen.x, lightScreen.y, reach);
        grad.addColorStop(0, `rgba(0,0,0,${SHADOW_NEAR_OPACITY})`);
        grad.addColorStop(0.4, `rgba(0,0,0,${SHADOW_MID_OPACITY})`);
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

  /**
   * Paints the additive colored tint for a non-white light, clipped to its containing room rect
   */
  private _drawColorTint(
    ctx: CanvasRenderingContext2D,
    light: PointLightComponent | ConeLightComponent,
    screenPos: Vector,
    effectiveZoom: number,
    roomClips: RoomClip[],
    wedge?: { start: number; end: number }
  ): void {
    const activeClip = roomClips.find(
      (rect) => screenPos.x >= rect.x && screenPos.x <= rect.x + rect.w && screenPos.y >= rect.y && screenPos.y <= rect.y + rect.h
    );

    ctx.save();
    if (activeClip) {
      ctx.beginPath();
      ctx.rect(activeClip.x, activeClip.y, activeClip.w, activeClip.h);
      ctx.clip();
    }
    ctx.globalCompositeOperation = 'source-over';

    const screenRadius = light.radius * effectiveZoom;
    const tintAlpha = light.currentIntensity * TINT_ALPHA_FACTOR;

    const grad = ctx.createRadialGradient(screenPos.x, screenPos.y, 0, screenPos.x, screenPos.y, screenRadius);
    grad.addColorStop(0, colorToRgba(light.color, tintAlpha));
    grad.addColorStop(0.5, colorToRgba(light.color, tintAlpha * 0.4));
    grad.addColorStop(1, colorToRgba(light.color, 0));

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

  private _renderLightingCanvas(ctx: CanvasRenderingContext2D): void {
    const screen = this._engine.screen;
    const camera = this._scene.camera;
    // The overlay raster is anchored at the canvas top left (unsafeArea.topLeft), so project into
    // the raw resolution frame by undoing the content-area rooting of screen space
    const worldToScreen: WorldToScreen = (worldPos) => screen.worldToScreenCoordinates(worldPos).add(screen.contentAreaOffset);

    const w = this._lightingCanvas.width;
    const h = this._lightingCanvas.height;
    const effectiveZoom = camera.zoom;

    ctx.clearRect(0, 0, w, h);

    // Last enabled ambient light wins, they are not blended
    let ambientIntensity = DEFAULT_AMBIENT_INTENSITY;
    let ambientColor: Color | null = null;
    for (const e of this._ambientQuery.entities) {
      const a = e.get(AmbientLightComponent)!;
      ambientIntensity = a.enabled ? a.intensity : 0;
      ambientColor = a.enabled ? a.color : null;
    }

    const darknessFill = (d: DarknessComponent): string => {
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
      return colorToRgba(color, effectiveAlpha);
    };

    const roomClips: RoomClip[] = [];

    for (const e of this._darknessQuery.entities) {
      const d = e.get(DarknessComponent)!;
      const xf = e.get(TransformComponent)!;

      if (d.width === Infinity || d.height === Infinity) {
        ctx.fillStyle = darknessFill(d);
        ctx.fillRect(0, 0, w, h);
        continue;
      }

      const hw = (d.width / 2) * effectiveZoom;
      const hh = (d.height / 2) * effectiveZoom;
      const center = worldToScreen(xf.pos);

      const rect = {
        x: center.x - hw,
        y: center.y - hh,
        w: hw * 2,
        h: hh * 2
      };

      roomClips.push(rect);

      ctx.fillStyle = darknessFill(d);
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }

    const camPos = camera.pos;
    const halfW = w / 2 / effectiveZoom + CULL_PADDING;
    const halfH = h / 2 / effectiveZoom + CULL_PADDING;
    const camMinX = camPos.x - halfW;
    const camMaxX = camPos.x + halfW;
    const camMinY = camPos.y - halfH;
    const camMaxY = camPos.y + halfH;

    const inCameraView = (worldPos: Vector, radius: number) =>
      worldPos.x + radius > camMinX && worldPos.x - radius < camMaxX && worldPos.y + radius > camMinY && worldPos.y - radius < camMaxY;

    const occluders: Occluder[] = [];
    for (const e of this._occluderQuery.entities) {
      const comp = e.get(LightOccluderComponent)!;
      if (!comp.castShadows) {
        continue;
      }
      const xf = e.get(TransformComponent)!;

      if (comp.shape.kind === 'circle') {
        const cos = Math.cos(xf.rotation);
        const sin = Math.sin(xf.rotation);
        const rotatedOffset = new Vector(comp.offset.x * cos - comp.offset.y * sin, comp.offset.x * sin + comp.offset.y * cos);

        occluders.push({
          kind: 'circle',
          center: xf.pos.add(rotatedOffset),
          radius: comp.shape.radius
        });
      } else {
        occluders.push({
          kind: 'poly',
          verts: localToWorld(comp.localVertices(), xf.pos, xf.rotation)
        });
      }
    }

    // Lights are drawn into the offscreen scratch canvas, shadows are punched out of the light,
    // then the scratch is punched out of the darkness veil (lights erase darkness)
    const drawLight = (screenPos: Vector, drawShape: (c: CanvasRenderingContext2D) => void) => {
      if (!this._offscreenCtx || !this._offscreen) {
        return;
      }
      this._offscreenCtx.clearRect(0, 0, w, h);

      const activeClip = roomClips.find(
        (rect) => screenPos.x >= rect.x && screenPos.x <= rect.x + rect.w && screenPos.y >= rect.y && screenPos.y <= rect.y + rect.h
      );

      if (activeClip) {
        this._offscreenCtx.save();
        this._offscreenCtx.beginPath();
        this._offscreenCtx.rect(activeClip.x, activeClip.y, activeClip.w, activeClip.h);
        this._offscreenCtx.clip();
      }

      const shadowReach = activeClip ? Math.sqrt(activeClip.w ** 2 + activeClip.h ** 2) : Math.sqrt(w ** 2 + h ** 2);

      this._offscreenCtx.globalCompositeOperation = 'source-over';
      drawShape(this._offscreenCtx);

      this._offscreenCtx.globalCompositeOperation = 'destination-out';
      this._drawOccluderShadows(this._offscreenCtx, screenPos, occluders, shadowReach, worldToScreen);

      if (activeClip) {
        this._offscreenCtx.restore();
      }

      ctx.save();
      if (activeClip) {
        ctx.beginPath();
        ctx.rect(activeClip.x, activeClip.y, activeClip.w, activeClip.h);
        ctx.clip();
      }
      ctx.globalCompositeOperation = 'destination-out';
      ctx.drawImage(this._offscreen, 0, 0);
      ctx.restore();
    };

    for (const e of this._pointQuery.entities) {
      const light = e.get(PointLightComponent)!;
      if (!light.enabled) {
        continue;
      }
      const xf = e.get(TransformComponent)!;
      if (!inCameraView(xf.pos, light.radius)) {
        continue;
      }

      const screenPos = worldToScreen(xf.pos);
      const screenRadius = light.radius * effectiveZoom;
      const alpha = light.currentIntensity;

      drawLight(screenPos, (c) => {
        const grad = c.createRadialGradient(screenPos.x, screenPos.y, 0, screenPos.x, screenPos.y, screenRadius);
        grad.addColorStop(0, `rgba(255,255,255,${alpha})`);
        grad.addColorStop(0.6, `rgba(255,255,255,${alpha * 0.6})`);
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        c.fillStyle = grad;
        c.beginPath();
        c.arc(screenPos.x, screenPos.y, screenRadius, 0, Math.PI * 2);
        c.fill();
      });
    }

    for (const e of this._coneQuery.entities) {
      const light = e.get(ConeLightComponent)!;
      if (!light.enabled) {
        continue;
      }
      const xf = e.get(TransformComponent)!;
      if (!inCameraView(xf.pos, light.radius)) {
        continue;
      }

      const screenPos = worldToScreen(xf.pos);
      const screenRadius = light.radius * effectiveZoom;
      const halfAngle = light.angle / 2;
      const alpha = light.currentIntensity;
      const startAngle = light.direction - halfAngle;
      const endAngle = light.direction + halfAngle;

      drawLight(screenPos, (c) => {
        const softEdgeStart = Math.max(0, 1 - light.softness);

        const grad = c.createRadialGradient(screenPos.x, screenPos.y, 0, screenPos.x, screenPos.y, screenRadius);
        grad.addColorStop(0, `rgba(255,255,255,${alpha})`);
        grad.addColorStop(softEdgeStart * 0.7, `rgba(255,255,255,${alpha * 0.5})`);
        grad.addColorStop(softEdgeStart, `rgba(255,255,255,${alpha * 0.2})`);
        grad.addColorStop(1, 'rgba(255,255,255,0)');

        c.fillStyle = grad;
        c.beginPath();
        c.moveTo(screenPos.x, screenPos.y);
        c.arc(screenPos.x, screenPos.y, screenRadius, startAngle, endAngle);
        c.closePath();
        c.fill();
      });
    }

    for (const e of this._pointQuery.entities) {
      const light = e.get(PointLightComponent)!;
      if (!light.enabled || light.color.equal(Color.White)) {
        continue;
      }
      const xf = e.get(TransformComponent)!;
      if (!inCameraView(xf.pos, light.radius)) {
        continue;
      }

      this._drawColorTint(ctx, light, worldToScreen(xf.pos), effectiveZoom, roomClips);
    }

    for (const e of this._coneQuery.entities) {
      const light = e.get(ConeLightComponent)!;
      if (!light.enabled || light.color.equal(Color.White)) {
        continue;
      }
      const xf = e.get(TransformComponent)!;
      if (!inCameraView(xf.pos, light.radius)) {
        continue;
      }

      const halfAngle = light.angle / 2;
      this._drawColorTint(ctx, light, worldToScreen(xf.pos), effectiveZoom, roomClips, {
        start: light.direction - halfAngle,
        end: light.direction + halfAngle
      });
    }
  }
}
