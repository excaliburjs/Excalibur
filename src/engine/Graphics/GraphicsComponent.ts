import { Vector, vec } from '../Algebra';
import { Graphic } from './Graphic';
import { Animation } from './Animation';
import { GraphicsGroup } from './GraphicsGroup';
import { ExcaliburGraphicsContext } from './Context/ExcaliburGraphicsContext';
import { Logger } from '../Util/Log';
import { BoundingBox } from '../Collision/Index';
import { Color } from '../Drawing/Color';
import { Component } from '../EntityComponentSystem/Component';

export interface GraphicsShowOptions {
  offset?: Vector;
  anchor?: Vector;
}

export interface GraphicsComponentOptions {
  /**
   * Name of current graphic to use
   */
  current?: string;

  /**
   * Optionally share instances of graphics, you may set this to true to avoid copying graphics when added to the
   * component for performance reasons. By default graphics are not shared and are copied when added to the component.
   */
  shareGraphics?: boolean;

  /**
   * Optional visible flag, if the graphics component is not visible it will not be displayed
   */
  visible?: boolean;

  /**
   * Optional opacity
   */
  opacity?: number;

  /**
   * List of graphics
   */
  graphics?: { [graphicName: string]: Graphic };

  /**
   * Optional offset in absolute pixels to shift all graphics in this component from each graphic's anchor (default is top left corner)
   */
  offset?: Vector;

  /**
   * Optional origin
   */
  origin?: Vector;
}

export interface GraphicsLayerOptions {
  name: string;
  order: number;
  offset?: Vector;
  allowMultipleGraphics?: boolean;
}
export class GraphicsLayer {
  public graphics: { graphic: Graphic; options: GraphicsShowOptions }[] = [];
  constructor(private _options: GraphicsLayerOptions, private _graphics: GraphicsComponent) {}
  public get name(): string {
    return this._options.name;
  }

  /**
   * Remove any instance(s) of a graphic currently being shown in this layer
   */
  public hide(nameOrGraphic: string | Graphic): void;
  /**
   * Remove all currently shown graphics in this layer
   */
  public hide(): void;
  public hide(nameOrGraphic?: string | Graphic): void {
    if (!nameOrGraphic) {
      this.graphics.length = 0;
    } else {
      let gfx: Graphic = null;
      if (nameOrGraphic instanceof Graphic) {
        gfx = nameOrGraphic;
      } else {
        gfx = this._graphics.getGraphic(nameOrGraphic);
      }
      this.graphics = this.graphics.filter((g) => g.graphic !== gfx);
    }
  }

  /**
   * Show a graphic by name or instance at an offset, graphics are shown in the order in which `show()` is called.
   *
   * If `show()` is called multiple times for the same graphic it will be shown multiple times.
   * @param nameOrGraphic
   * @param options
   */
  public show<T extends Graphic = Graphic>(nameOrGraphic: string | T, options?: GraphicsShowOptions): T {
    options = { offset: this._graphics.offset.clone(), anchor: this._graphics.anchor.clone(), ...options };
    let gfx: Graphic;
    if (nameOrGraphic instanceof Graphic) {
      gfx = this._graphics.shareGraphics ? nameOrGraphic : nameOrGraphic.clone();
    } else {
      gfx = this._graphics.getGraphic(nameOrGraphic);
      if (!gfx) {
        Logger.getInstance().error(
          `No such graphic added to component named ${nameOrGraphic}. These named graphics are available: `,
          this._graphics.getGraphicNames()
        );
      }
    }
    if (gfx) {
      this.graphics.push({ graphic: gfx, options });
      return gfx as T;
    } else {
      return null;
    }
  }

  /**
   * Swap out any current graphics being shown for another
   * @param nameOrGraphic
   * @param options
   */
  public swap<T extends Graphic = Graphic>(nameOrGraphic: string | T, options?: GraphicsShowOptions): T {
    options = { offset: this._graphics.offset.clone(), anchor: this._graphics.anchor.clone(), ...options };
    this.hide();
    return this.show<T>(nameOrGraphic, options);
  }

  public get allowMultipleGraphics() {
    return !!this._options.allowMultipleGraphics;
  }

  public set allowMultipleGraphics(value: boolean) {
    this._options.allowMultipleGraphics = value;
  }

  /**
   * Current order of the layer, higher numbers are on top, lower numbers are on the bottom.
   *
   * For example a layer with `order = -1` would be under a layer of `order = 1`
   */
  public get order(): number {
    return this._options.order;
  }

  /**
   * Set the order of the layer, higher numbers are on top, lower numbers are on the bottom.
   *
   * For example a layer with `order = -1` would be under a layer of `order = 1`
   */
  public set order(order: number) {
    this._options.order = order;
  }

  /**
   * Get or set the pixel offset from the layer origin for all graphics in the layer
   */
  public get offset(): Vector {
    return this._options.offset ?? Vector.Zero;
  }

  public set offset(value: Vector) {
    this._options.offset = value;
  }
}

export class GraphicsLayers {
  private _layers: GraphicsLayer[] = [];
  private _layerMap: { [layerName: string]: GraphicsLayer } = {};
  public default: GraphicsLayer;
  constructor(private _component: GraphicsComponent) {
    this.default = new GraphicsLayer({ name: 'default', order: 0 }, _component);
    this._maybeAddLayer(this.default);
  }
  public create(options: GraphicsLayerOptions): GraphicsLayer {
    const layer = new GraphicsLayer(options, this._component);
    return this._maybeAddLayer(layer);
  }

  /**
   * Retrieve a single layer by name
   * @param name
   */
  public get(name: string): GraphicsLayer;
  /**
   * Retrieve all layers
   */
  public get(): readonly GraphicsLayer[];
  public get(name?: string): GraphicsLayer | readonly GraphicsLayer[] {
    if (name) {
      return this._getLayer(name);
    }
    return this._layers;
  }

  public has(name: string): boolean {
    return name in this._layerMap;
  }

  private _maybeAddLayer(layer: GraphicsLayer) {
    if (this._layerMap[layer.name]) {
      // todo log warning
      return this._layerMap[layer.name];
    }
    this._layerMap[layer.name] = layer;
    this._layers.push(layer);
    this._layers.sort((a, b) => a.order - b.order);
    return layer;
  }

  private _getLayer(name: string): GraphicsLayer | undefined {
    return this._layerMap[name];
  }
}

/**
 * Component to manage drawings, using with the position component
 */
export class GraphicsComponent extends Component<'graphics'> {
  static type: 'graphics';
  readonly type = 'graphics';

  private _graphics: { [graphicName: string]: Graphic } = {};

  public layers: GraphicsLayers;

  public getGraphic(name: string): Graphic | undefined {
    return this._graphics[name];
  }

  public getGraphicNames(): string[] {
    return Object.keys(this._graphics);
  }

  public onPreDraw: (ctx: ExcaliburGraphicsContext) => void;
  public onPostDraw: (ctx: ExcaliburGraphicsContext) => void;

  /**
   * Sets or gets wether any drawing should be visible in this component
   */
  public visible: boolean = true;

  /**
   * Sets or gets wither all drawings should have an opacity applied
   */
  public opacity: number = 1;

  /**
   * Offset to apply to graphics by default
   */
  public offset: Vector = Vector.Zero;

  /**
   * Anchor to apply to graphics by default
   */
  public anchor: Vector = Vector.Half;

  /**
   * TODO: This seems bad still
   */
  public shareGraphics: boolean = true;

  constructor(options?: GraphicsComponentOptions) {
    super();
    // Defaults
    options = {
      visible: this.visible,
      ...options
    };

    const { current, opacity, visible, graphics, offset, shareGraphics } = options;

    this._graphics = graphics || {};
    this.offset = offset ?? this.offset;
    this.opacity = opacity ?? this.opacity;
    this.shareGraphics = shareGraphics ?? this.shareGraphics;
    this.visible = !!visible;

    this.layers = new GraphicsLayers(this);
    if (current && this._graphics[current]) {
      this.show(this._graphics[current]);
    }
  }

  /**
   * Returns the currently displayed graphics and their offsets, empty array if hidden
   */
  // TODO does this make sense anymore?
  public get current(): { graphic: Graphic; options: GraphicsShowOptions }[] {
    return this.layers.default.graphics;
  }

  /**
   * Returns all graphics associated with this component
   */
  public get graphics(): { [graphicName: string]: Graphic } {
    return this._graphics;
  }

  /**
   * Adds a named graphic to this component, if the name is "default" or not specified, it will be shown by default without needing to call
   * `show("default")`
   * @param graphic
   */
  public add(graphic: Graphic): Graphic;
  public add(name: string, graphic: Graphic): Graphic;
  public add(nameOrGraphic: string | Graphic, graphic?: Graphic): Graphic {
    let name = 'default';
    let graphicToSet: Graphic = null;
    if (typeof nameOrGraphic === 'string') {
      name = nameOrGraphic;
      graphicToSet = graphic;
    } else {
      graphicToSet = nameOrGraphic;
    }

    this._graphics[name] = this.shareGraphics ? graphicToSet : graphicToSet.clone();
    if (name === 'default') {
      this.show('default');
    }
    return graphicToSet;
  }

  /**
   * Show a graphic by name on the **default** layer, returns the new [[Graphic]]
   */
  public show<T extends Graphic = Graphic>(nameOrGraphic: string | T, options?: GraphicsShowOptions): T {
    return this.layers.default.show<T>(nameOrGraphic, options);
  }

  /**
   * Swap out any graphics on the **default** layer, returns the new [[Graphic]]
   * @param nameOrGraphic
   * @param options
   */
  public swap<T extends Graphic = Graphic>(nameOrGraphic: string | T, options?: GraphicsShowOptions): T {
    return this.layers.default.swap<T>(nameOrGraphic, options);
  }

  /**
   * Remove any instance(s) of a graphic currently being shown in the **default** layer
   */
  public hide(nameOrGraphic: string | Graphic): void;
  /**
   * Remove all currently shown graphics in the **default** layer
   */
  public hide(): void;
  public hide(nameOrGraphic?: string | Graphic): void {
    this.layers.default.hide(nameOrGraphic);
  }

  private _isAnimationOrGroup(graphic: Graphic): graphic is Animation | GraphicsGroup {
    return graphic instanceof Animation || graphic instanceof GraphicsGroup;
  }

  public get localBounds(): BoundingBox {
    let bb = new BoundingBox();
    for (const layer of this.layers.get()) {
      for (const {
        graphic,
        options: { offset, anchor }
      } of layer.graphics) {
        const bounds = graphic.localBounds;
        const offsetX = -bounds.width * graphic.scale.x * anchor.x + offset.x;
        const offsetY = -bounds.height * graphic.scale.y * anchor.y + offset.y;
        bb = graphic?.localBounds.translate(vec(offsetX + layer.offset.x, offsetY + layer.offset.y)).combine(bb);
      }
    }
    return bb;
  }

  /**
   * Update underlying graphics if necesary, called internally
   * @param elapsed
   * @internal
   */
  public update(elapsed: number, idempotencyToken: number = 0) {
    for (const layer of this.layers.get()) {
      for (const { graphic } of layer.graphics) {
        if (this._isAnimationOrGroup(graphic)) {
          graphic?.tick(elapsed, idempotencyToken);
        }
      }
    }
  }

  /**
   * Draws the graphics component to the screen, called internally
   * @param ctx
   * @param x
   * @param y
   * @internal
   */
  public draw(ctx: ExcaliburGraphicsContext, x: number, y: number) {
    if (this.visible) {
      // this should be moved to the graphics system
      for (const layer of this.layers.get()) {
        for (const {
          graphic,
          options: { offset, anchor }
        } of layer.graphics) {
          // See https://github.com/excaliburjs/Excalibur/pull/619 for discussion on this formula
          const bounds = graphic.localBounds;
          const offsetX = -bounds.width * graphic.scale.x * anchor.x + offset.x + x;
          const offsetY = -bounds.height * graphic.scale.y * anchor.y + offset.y + y;
          graphic?.draw(ctx, offsetX + layer.offset.x, offsetY + layer.offset.y);
        }
      }
    }
  }

  public debugDraw(ctx: ExcaliburGraphicsContext, x: number, y: number) {
    if (this.visible) {
      // this should be moved to the graphics system
      for (const layer of this.layers.get()) {
        for (const {
          graphic,
          options: { offset, anchor }
        } of layer.graphics) {
          // See https://github.com/excaliburjs/Excalibur/pull/619 for discussion on this formula
          const bounds = graphic.localBounds;
          const offsetX = -bounds.width * graphic.scale.x * anchor.x + offset.x + x;
          const offsetY = -bounds.height * graphic.scale.y * anchor.y + offset.y + y;
          graphic?.localBounds.translate(vec(offsetX + layer.offset.x, offsetY + layer.offset.y)).draw(ctx, Color.Red);
        }
      }
      this.localBounds.draw(ctx, Color.Red);
    }
  }

  /**
   * Returns a shallow copy of this component
   */
  // clone(): GraphicsComponent {
  //   return new GraphicsComponent({
  //     opacity: this.opacity
  //   });
  // }
}
