import { Vector, vec } from '../Math/vector';
import { Graphic } from './Graphic';
import { HasTick } from './Animation';
import { ExcaliburGraphicsContext } from './Context/ExcaliburGraphicsContext';
import { BoundingBox } from '../Collision/Index';
import { Component } from '../EntityComponentSystem/Component';
import { Material } from './Context/material';
import { Logger } from '../Util/Log';
import { WatchVector } from '../Math/watch-vector';
import { TransformComponent } from '../EntityComponentSystem';

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
  graphics?: { [graphicName: string]: Graphic | { graphic: Graphic, options: GraphicsShowOptions } };

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
  private _options: Record<string, GraphicsShowOptions> = {};

  public material: Material | null = null;

  /**
   * Draws after the entity transform has been applied, but before graphics component graphics have been drawn
   */
  public onPreDraw: (ctx: ExcaliburGraphicsContext, elapsedMilliseconds: number) => void;

  /**
   * Draws after the entity transform has been applied, and after graphics component graphics has been drawn
   */
  public onPostDraw: (ctx: ExcaliburGraphicsContext, elapsedMilliseconds: number) => void;

  /**
   * Draws before the entity transform has been applied before any any graphics component drawing
   */
  public onPreTransformDraw: (ctx: ExcaliburGraphicsContext, elapsedMilliseconds: number) => void;

  /**
   * Draws after the entity transform has been applied, and after all graphics component drawing
   */
  public onPostTransformDraw: (ctx: ExcaliburGraphicsContext, elapsedMilliseconds: number) => void;

  /**
   * Sets or gets wether any drawing should be visible in this component
   */
  public visible: boolean = true;

  /**
   * Sets or gets wither all drawings should have an opacity applied
   */
  public opacity: number = 1;


  private _offset: Vector = Vector.Zero;

  /**
   * Offset to apply to graphics by default
   */
  public get offset(): Vector {
    return new WatchVector(this._offset, () => {
      this.recalculateBounds();
    });
  }
  public set offset(value: Vector) {
    this._offset = value;
    this.recalculateBounds();
  }

  private _anchor: Vector = Vector.Half;

  /**
   * Anchor to apply to graphics by default
   */
  public get anchor(): Vector {
    return new WatchVector(this._anchor, () => {
      this.recalculateBounds();
    });
  }
  public set anchor(value: Vector) {
    this._anchor = value;
    this.recalculateBounds();
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
      visible: this.visible,
      graphics: {},
      ...options
    };

    const {
      current,
      anchor,
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

    for (const [key, graphicOrOptions] of Object.entries(graphics)) {
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
    this.copyGraphics = copyGraphics ?? this.copyGraphics;
    this.onPreDraw = onPreDraw ?? this.onPreDraw;
    this.onPostDraw = onPostDraw ?? this.onPostDraw;
    this.onPreDraw = onPreTransformDraw ?? this.onPreTransformDraw;
    this.onPostTransformDraw = onPostTransformDraw ?? this.onPostTransformDraw;
    this.visible = !!visible;
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
  public get options(): { [graphicName: string]: GraphicsShowOptions } {
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
    let graphicToSet: Graphic = null;
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

    this._graphics[name] = this.copyGraphics ? graphicToSet.clone() : graphicToSet;
    this._options[name] = this.copyGraphics ? {...optionsToSet} : optionsToSet;
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
   * Shows a graphic, will be removed
   * @param nameOrGraphic
   * @param options
   * @deprecated will be removed in v0.30.0, use `graphics.use(...)`
   */
  public show<T extends Graphic = Graphic>(nameOrGraphic: string | T, options?: GraphicsShowOptions): T {
    return this.use(nameOrGraphic, options);
  }

  /**
   * Use a graphic only, will set the default graphic. Returns the new [[Graphic]]
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
          `Graphic ${this._current} is not registered with the graphics component owned by ${this.owner?.name}. Nothing will be drawn.`);
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

  private _localBounds: BoundingBox = null;
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
    const offsetX = -bounds.width *  anchor.x + offset.x;
    const offsetY = -bounds.height *  anchor.y + offset.y;
    bb = graphic?.localBounds.translate(vec(offsetX, offsetY)).combine(bb);
    this._localBounds = bb;
  }

  /**
   * Get local bounds of graphics component
   */
  public get localBounds(): BoundingBox {
    if (!this._localBounds || this._localBounds.hasZeroDimensions()) {
      this.recalculateBounds();
    }
    return this._localBounds;
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
    graphics._options = {... this._options};
    graphics.offset = this.offset.clone();
    graphics.opacity = this.opacity;
    graphics.anchor = this.anchor.clone();
    graphics.copyGraphics = this.copyGraphics;
    graphics.onPreDraw = this.onPreDraw;
    graphics.onPostDraw = this.onPostDraw;
    graphics.visible = this.visible;

    return graphics;
  }
}
