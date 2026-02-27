import { Vector, vec } from '../math/vector';
import { Graphic } from './graphic';
import type { HasTick } from './animation';
import type { ExcaliburGraphicsContext } from './context/excalibur-graphics-context';
import { BoundingBox } from '../collision/index';
import { Component } from '../entity-component-system/component';
import type { Material } from './context/material';
import { Logger } from '../util/log';
import { WatchVector } from '../math/watch-vector';
import { TransformComponent } from '../entity-component-system';
import { GraphicsGroup } from '../graphics/graphics-group';
import { Color } from '../color';
import { Raster } from './raster';
import { Text } from './text';

/**
 * Type guard for checking if a Graphic HasTick (used for graphics that change over time like animations)
 * @param graphic
 */
export function hasGraphicsTick(graphic: Graphic): graphic is Graphic & HasTick {
  return !!(graphic as unknown as HasTick).tick;
}
export interface GraphicsShowOptions {
  offset?: Vector;
  anchor?: Vector;
}
// ============================================================================
// GraphicsComponent Serialization Data Structure
// ============================================================================

export interface GraphicsComponentData {
  type: string;
  current: string;
  graphicRefs: string[]; // List of graphic IDs used by this component
  options: {
    [name: string]:
      | {
          offset?: { x: number; y: number };
          anchor?: { x: number; y: number };
        }
      | undefined;
  };
  isVisible: boolean;
  opacity: number;
  offset: { x: number; y: number };
  anchor: { x: number; y: number };
  color?: { r: number; g: number; b: number; a: number };
  flipHorizontal: boolean;
  flipVertical: boolean;
  copyGraphics: boolean;
  forceOnScreen: boolean;
  tint?: { r: number; g: number; b: number; a: number };
}
export interface GraphicsComponentOptions {
  onPostDraw?: (ex: ExcaliburGraphicsContext, elapsed: number) => void;
  onPreDraw?: (ex: ExcaliburGraphicsContext, elapsed: number) => void;
  onPreTransformDraw?: (ex: ExcaliburGraphicsContext, elapsed: number) => void;
  onPostTransformDraw?: (ex: ExcaliburGraphicsContext, elapsed: number) => void;

  /**
   * Name of current graphic to use
   */
  current?: string;

  /**
   * Optionally set the color of the graphics component
   */
  color?: Color;

  /**
   * Optionally set a material to use on the graphic
   */
  material?: Material;

  /**
   * Optionally copy instances of graphics by calling .clone(), you may set this to false to avoid sharing graphics when added to the
   * component for performance reasons. By default graphics are not copied and are shared when added to the component.
   */
  copyGraphics?: boolean;

  /**
   * Optional visible flag, if the graphics component is not visible it will not be displayed
   */
  visible?: boolean;

  /**
   * Optional opacity
   */
  opacity?: number;

  /**
   * List of graphics and optionally the options per graphic
   */
  graphics?: { [graphicName: string]: Graphic | { graphic: Graphic; options?: GraphicsShowOptions | undefined } };

  /**
   * Optional offset in absolute pixels to shift all graphics in this component from each graphic's anchor (default is top left corner)
   */
  offset?: Vector;

  /**
   * Optional anchor
   */
  anchor?: Vector;
}

/**
 * Component to manage drawings, using with the position component
 */
export class GraphicsComponent extends Component {
  private _logger = Logger.getInstance();

  private _current: string = 'default';
  private _graphics: Record<string, Graphic> = {};
  private _options: Record<string, GraphicsShowOptions | undefined> = {};

  public material: Material | null = null;

  /**
   * Draws after the entity transform has been applied, but before graphics component graphics have been drawn
   */
  public onPreDraw?: (ctx: ExcaliburGraphicsContext, elapsed: number) => void;

  /**
   * Draws after the entity transform has been applied, and after graphics component graphics has been drawn
   */
  public onPostDraw?: (ctx: ExcaliburGraphicsContext, elapsed: number) => void;

  /**
   * Draws before the entity transform has been applied before any any graphics component drawing
   */
  public onPreTransformDraw?: (ctx: ExcaliburGraphicsContext, elapsed: number) => void;

  /**
   * Draws after the entity transform has been applied, and after all graphics component drawing
   */
  public onPostTransformDraw?: (ctx: ExcaliburGraphicsContext, elapsed: number) => void;
  private _color?: Color;

  /**
   * Sets or gets wether any drawing should be visible in this component
   * @deprecated use isVisible
   */
  public get visible(): boolean {
    return this.isVisible;
  }

  /**
   * Sets or gets wether any drawing should be visible in this component
   * @deprecated use isVisible
   */
  public set visible(val: boolean) {
    this.isVisible = val;
  }

  /**
   * Sets or gets wether any drawing should be visible in this component
   */
  public isVisible: boolean = true;

  /**
   * Optionally force the graphic onscreen, default false. Not recommend to use for perf reasons, only if you known what you're doing.
   */
  public forceOnScreen: boolean = false;

  /**
   * Sets or gets wither all drawings should have an opacity applied
   */
  public opacity: number = 1;

  private _offset: Vector = new WatchVector(Vector.Zero, () => this.recalculateBounds());

  /**
   * Offset to apply to graphics by default
   */
  public get offset(): Vector {
    return this._offset;
  }
  public set offset(value: Vector) {
    this._offset = new WatchVector(value, () => this.recalculateBounds());
    this.recalculateBounds();
  }

  private _anchor: Vector = new WatchVector(Vector.Half, () => this.recalculateBounds());

  /**
   * Anchor to apply to graphics by default
   */
  public get anchor(): Vector {
    return this._anchor;
  }
  public set anchor(value: Vector) {
    this._anchor = new WatchVector(value, () => this.recalculateBounds());
    this.recalculateBounds();
  }

  /**
   * Sets the color of the actor's current graphic
   */
  public get color(): Color | undefined {
    return this._color;
  }
  public set color(v: Color | undefined) {
    if (v) {
      this._color = v.clone();
      const currentGraphic = this.current;
      if (currentGraphic instanceof Raster || currentGraphic instanceof Text) {
        currentGraphic.color = this._color;
      }
    }
  }

  /**
   * Flip all graphics horizontally along the y-axis
   */
  public flipHorizontal: boolean = false;

  /**
   * Flip all graphics vertically along the x-axis
   */
  public flipVertical: boolean = false;

  /**
   * If set to true graphics added to the component will be copied. This can effect performance, but is useful if you don't want
   * changes to a graphic to effect all the places it is used.
   */
  public copyGraphics: boolean = false;

  constructor(options?: GraphicsComponentOptions) {
    super();
    // Defaults
    options = {
      visible: this.isVisible,
      graphics: {},
      ...options
    };

    const {
      current,
      anchor,
      color,
      opacity,
      visible,
      graphics,
      offset,
      copyGraphics,
      onPreDraw,
      onPostDraw,
      onPreTransformDraw,
      onPostTransformDraw
    } = options;

    for (const [key, graphicOrOptions] of Object.entries(graphics as GraphicsComponentOptions)) {
      if (graphicOrOptions instanceof Graphic) {
        this._graphics[key] = graphicOrOptions;
      } else {
        this._graphics[key] = graphicOrOptions.graphic;
        this._options[key] = graphicOrOptions.options;
      }
    }

    this.offset = offset ?? this.offset;
    this.opacity = opacity ?? this.opacity;
    this.anchor = anchor ?? this.anchor;
    this.color = color ?? this.color;
    this.copyGraphics = copyGraphics ?? this.copyGraphics;
    this.onPreDraw = onPreDraw ?? this.onPreDraw;
    this.onPostDraw = onPostDraw ?? this.onPostDraw;
    this.onPreDraw = onPreTransformDraw ?? this.onPreTransformDraw;
    this.onPostTransformDraw = onPostTransformDraw ?? this.onPostTransformDraw;
    this.isVisible = !!visible;
    this._current = current ?? this._current;
    if (current && this._graphics[current]) {
      this.use(current);
    }
  }

  public getGraphic(name: string): Graphic | undefined {
    return this._graphics[name];
  }
  public getOptions(name: string): GraphicsShowOptions | undefined {
    return this._options[name];
  }

  /**
   * Get registered graphics names
   */
  public getNames(): string[] {
    return Object.keys(this._graphics);
  }

  /**
   * Returns the currently displayed graphic
   */
  public get current(): Graphic | undefined {
    return this._graphics[this._current];
  }

  /**
   * Returns the currently displayed graphic offsets
   */
  public get currentOptions(): GraphicsShowOptions | undefined {
    return this._options[this._current];
  }

  /**
   * Returns all graphics associated with this component
   */
  public get graphics(): { [graphicName: string]: Graphic } {
    return this._graphics;
  }

  /**
   * Returns all graphics options associated with this component
   */
  public get options(): { [graphicName: string]: GraphicsShowOptions | undefined } {
    return this._options;
  }

  /**
   * Adds a named graphic to this component, if the name is "default" or not specified, it will be shown by default without needing to call
   * @param graphic
   */
  public add(graphic: Graphic, options?: GraphicsShowOptions): Graphic;
  public add(name: string, graphic: Graphic, options?: GraphicsShowOptions): Graphic;
  public add(nameOrGraphic: string | Graphic, graphicOrOptions?: Graphic | GraphicsShowOptions, options?: GraphicsShowOptions): Graphic {
    let name = 'default';
    let graphicToSet: Graphic | null = null;
    let optionsToSet: GraphicsShowOptions | undefined = undefined;
    if (typeof nameOrGraphic === 'string' && graphicOrOptions instanceof Graphic) {
      name = nameOrGraphic;
      graphicToSet = graphicOrOptions;
      optionsToSet = options;
    }
    if (nameOrGraphic instanceof Graphic && !(graphicOrOptions instanceof Graphic)) {
      graphicToSet = nameOrGraphic;
      optionsToSet = graphicOrOptions;
    }

    if (!graphicToSet) {
      throw new Error('Need to provide a graphic or valid graphic string');
    }
    this._graphics[name] = this.copyGraphics ? graphicToSet.clone() : graphicToSet;
    this._options[name] = this.copyGraphics ? { ...optionsToSet } : optionsToSet;
    if (name === 'default') {
      this.use('default');
    }
    return graphicToSet;
  }

  /**
   * Removes a registered graphic, if the removed graphic is the current it will switch to the default
   * @param name
   */
  public remove(name: string) {
    delete this._graphics[name];
    delete this._options[name];
    if (this._current === name) {
      this._current = 'default';
      this.recalculateBounds();
    }
  }

  /**
   * Use a graphic only, will set the default graphic. Returns the new {@apilink Graphic}
   *
   * Optionally override the stored options
   * @param nameOrGraphic
   * @param options
   */
  public use<T extends Graphic = Graphic>(nameOrGraphic: string | T, options?: GraphicsShowOptions): T {
    if (nameOrGraphic instanceof Graphic) {
      let graphic = nameOrGraphic as Graphic;
      if (this.copyGraphics) {
        graphic = nameOrGraphic.clone();
      }
      this._current = 'default';
      this._graphics[this._current] = graphic;
      this._options[this._current] = options;
    } else {
      this._current = nameOrGraphic;
      this._options[this._current] = options;
      if (!(this._current in this._graphics)) {
        this._logger.warn(
          `Graphic ${this._current} is not registered with the graphics component owned by ${this.owner?.name}. Nothing will be drawn.`
        );
      }
    }
    this.recalculateBounds();
    return this.current as T;
  }

  /**
   * Hide currently shown graphic
   */
  public hide(): void {
    this._current = 'ex.none';
  }

  private _localBounds?: BoundingBox;
  public set localBounds(bounds: BoundingBox) {
    this._localBounds = bounds;
  }

  public recalculateBounds() {
    let bb = new BoundingBox();
    const graphic = this._graphics[this._current];
    const options = this._options[this._current];

    if (!graphic) {
      this._localBounds = bb;
      return;
    }

    let anchor = this.anchor;
    let offset = this.offset;
    if (options?.anchor) {
      anchor = options.anchor;
    }
    if (options?.offset) {
      offset = options.offset;
    }
    const bounds = graphic.localBounds;
    const offsetX = -bounds.width * anchor.x + offset.x;
    const offsetY = -bounds.height * anchor.y + offset.y;
    if (graphic instanceof GraphicsGroup && !graphic.useAnchor) {
      bb = graphic?.localBounds.combine(bb);
    } else {
      bb = graphic?.localBounds.translate(vec(offsetX, offsetY)).combine(bb);
    }
    this._localBounds = bb;
  }

  /**
   * Get local bounds of graphics component
   */
  public get localBounds(): BoundingBox {
    if (!this._localBounds || this._localBounds.hasZeroDimensions()) {
      this.recalculateBounds();
    }
    return this._localBounds as BoundingBox; // recalc guarantees type
  }

  /**
   * Get world bounds of graphics component
   */
  public get bounds(): BoundingBox {
    let bounds = this.localBounds;
    if (this.owner) {
      const tx = this.owner.get(TransformComponent);
      if (tx) {
        bounds = bounds.transform(tx.get().matrix);
      }
    }
    return bounds;
  }

  /**
   * Update underlying graphics if necessary, called internally
   * @param elapsed
   * @internal
   */
  public update(elapsed: number, idempotencyToken: number = 0) {
    const graphic = this.current;
    if (graphic && hasGraphicsTick(graphic)) {
      graphic.tick(elapsed, idempotencyToken);
    }
  }

  public clone(): GraphicsComponent {
    const graphics = new GraphicsComponent();
    graphics._graphics = { ...this._graphics };
    graphics._options = { ...this._options };
    graphics.offset = this.offset.clone();
    if (this.color) {
      graphics.color = this.color.clone();
    }
    graphics.opacity = this.opacity;
    graphics.anchor = this.anchor.clone();
    graphics.copyGraphics = this.copyGraphics;
    graphics.onPreDraw = this.onPreDraw;
    graphics.onPostDraw = this.onPostDraw;
    graphics.isVisible = this.isVisible;

    return graphics;
  }

  /**
   * Custom serialization - stores graphic references instead of graphic data
   */
  public serialize(): GraphicsComponentData {
    const type = this.constructor.name;
    const data: GraphicsComponentData = {
      type,
      current: this._current,
      graphicRefs: [],
      options: {},
      isVisible: this.isVisible,
      opacity: this.opacity,
      offset: { x: this._offset.x, y: this._offset.y },
      anchor: { x: this._anchor.x, y: this._anchor.y },
      flipHorizontal: this.flipHorizontal,
      flipVertical: this.flipVertical,
      copyGraphics: this.copyGraphics,
      forceOnScreen: this.forceOnScreen,
      tint: undefined
    };

    // Extract graphic IDs/names
    data.graphicRefs = Object.keys(this._graphics);

    // Serialize options for each graphic
    for (const [name, option] of Object.entries(this._options)) {
      if (option) {
        data.options[name] = {
          offset: option.offset ? { x: option.offset.x, y: option.offset.y } : undefined,
          anchor: option.anchor ? { x: option.anchor.x, y: option.anchor.y } : undefined
        };
      } else {
        data.options[name] = undefined;
      }
    }

    if (this._color) {
      data.color = {
        r: this._color.r,
        g: this._color.g,
        b: this._color.b,
        a: this._color.a
      };
    }

    if (this.current?.tint) {
      data.tint = {
        r: this.current.tint.r,
        g: this.current.tint.g,
        b: this.current.tint.b,
        a: this.current.tint.a
      };
    }

    return data;
  }

  /**
   * Custom deserialization
   * NOTE - This only restores the component's settings, it does NOT restore the graphics themselves.
   */
  public deserialize(data: GraphicsComponentData): void {
    this._current = data.current ?? 'default';
    this.isVisible = data.isVisible ?? true;
    this.opacity = data.opacity ?? 1;
    this.flipHorizontal = data.flipHorizontal ?? false;
    this.flipVertical = data.flipVertical ?? false;
    this.copyGraphics = data.copyGraphics ?? false;
    this.forceOnScreen = data.forceOnScreen ?? false;

    // Restore offset and anchor as plain objects (WatchVector setup happens in setter)
    this._offset = { x: data.offset.x, y: data.offset.y } as Vector;
    this._anchor = { x: data.anchor.x, y: data.anchor.y } as Vector;

    // Restore color
    if (data.color) {
      this._color = Color.fromRGB(data.color.r, data.color.g, data.color.b, data.color.a);
    }

    // Restore options (sans graphics themselves)
    this._options = {};
    for (const [name, option] of Object.entries(data.options)) {
      if (option) {
        this._options[name] = {
          offset: option.offset ? ({ x: option.offset.x, y: option.offset.y } as Vector) : undefined,
          anchor: option.anchor ? ({ x: option.anchor.x, y: option.anchor.y } as Vector) : undefined
        };
      } else {
        this._options[name] = undefined;
      }
    }
  }
}
