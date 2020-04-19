import { Vector } from '../Algebra';
import { Graphic } from './Graphic';
import { Animation } from './Animation';
import { GraphicsGroup } from './GraphicsGroup';
import { ExcaliburGraphicsContext } from './Context/ExcaliburGraphicsContext';
import { Component } from '../Component';

export interface GraphicsComponentOptions {
  /**
   * Name of current graphic to use
   */
  current?: string;

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
  public graphics: { graphic: Graphic; offset: Vector }[] = [];
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
   * @param offset
   */
  public show(nameOrGraphic: string | Graphic, offset: Vector = Vector.Zero): Graphic {
    let gfx: Graphic = null;
    if (nameOrGraphic instanceof Graphic) {
      gfx = nameOrGraphic;
    } else {
      gfx = this._graphics.getGraphic(nameOrGraphic);
    }
    if (gfx) {
      if (!this.allowMultipleGraphics) this.hide();
      this.graphics.push({ graphic: gfx, offset });
      return gfx;
    } else {
      return null;
    }
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
export class GraphicsComponent implements Component<'graphics'> {
  static type: 'graphics';
  readonly type = 'graphics';
  public __debug: { graphicBounds: Graphic; colliderBounds: Graphic } = {
    graphicBounds: null,
    colliderBounds: null
  };
  private _graphics: { [graphicName: string]: Graphic } = {};

  public layers: GraphicsLayers;

  public getGraphic(name: string): Graphic | undefined {
    return this._graphics[name];
  }

  /**
   * Sets or gets wether any drawing should be visible in this component
   */
  public visible: boolean = true;

  /**
   * Sets or gets wither all drawings should have an opacity applied
   */
  public opacity: number = 1;

  /**
   * Offset to apply to all drawings in this component if set, if null the drawing's offset is respected
   */
  public offset?: Vector | null = null;

  /**
   * Anchor to apply to all drawings in this component if set, if null the drawing's anchor is respected
   */
  public anchor?: Vector | null = null;

  constructor(options?: GraphicsComponentOptions) {
    // Defaults
    options = {
      visible: this.visible,
      ...options
    };

    const { current, opacity, visible, graphics, offset } = options;

    this._graphics = graphics || {};
    this.offset = offset ?? this.offset;
    this.opacity = opacity ?? this.opacity;
    this.visible = !!visible;

    this.layers = new GraphicsLayers(this);
    if (current && this._graphics[current]) {
      this.show(this._graphics[current]);
    }
  }

  /**
   * Returns the currently displayed graphics and their offsets, empty array if hidden
   */
  public get current(): { graphic: Graphic; offset: Vector }[] {
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

    this._graphics[name] = graphicToSet;
    if (name === 'default') {
      this.show('default');
    }
    return graphicToSet;
  }

  /**
   * Show a graphic by name on the **default** layer, returns a promise that resolves when graphic has finished displaying
   */
  public show(nameOrGraphic: string | Graphic, offset: Vector = Vector.Zero): Graphic {
    return this.layers.default.show(nameOrGraphic, offset);
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

  /**
   * Update underlying graphics if necesary, called internally
   * @param elapsed
   * @internal
   */
  public update(elapsed: number) {
    for (const layer of this.layers.get()) {
      for (const { graphic } of layer.graphics) {
        if (this._isAnimationOrGroup(graphic)) {
          graphic?.tick(elapsed);
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
      // See https://github.com/excaliburjs/Excalibur/pull/619 for discussion on this formula
      const anchor = this.anchor ?? Vector.Zero;

      // this should be moved to the graphics system
      for (const layer of this.layers.get()) {
        for (const { graphic, offset } of layer.graphics) {
          const offsetX = -graphic.width * graphic.scale.x * anchor.x + x + offset.x;
          const offsetY = -graphic.height * graphic.scale.y * anchor.y + y + offset.y;
          graphic?.draw(ctx, offsetX + layer.offset.x, offsetY + layer.offset.y);
        }
      }
    }
  }

  /**
   * Returns a shallow copy of this component
   */
  clone(): GraphicsComponent {
    return new GraphicsComponent({
      opacity: this.opacity
    });
  }
}
