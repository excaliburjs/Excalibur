import { Vector } from '../Algebra';
import { Graphic } from './Graphic';
import { Animation } from './Animation';
import { delay } from '../Util/Delay';
import { GraphicsGroup } from './GraphicsGroup';
import { ExcaliburGraphicsContext } from './Context/ExcaliburGraphicsContext';

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

  /**
   * Optional rotation to apply to each graphic in this component
   */
  rotation?: number;
}

export interface GraphicsLayerOptions {
  name: string;
  order: number;
  offset?: Vector;
}
export class GraphicsLayer {
  constructor(private _options: GraphicsLayerOptions, private _graphics: GraphicsComponent) {}
  public get name(): string {
    return this._options.name;
  }

  /**
   * Immediately show nothing
   */
  public hide(): Promise<void> {
    this._currentGfx = null;
    return Promise.resolve();
  }

  public show(nameOrGraphic: string | Graphic, duration?: number): Promise<Graphic> {
    let gfx: Graphic = null;
    if (nameOrGraphic instanceof Graphic) {
      gfx = nameOrGraphic;
    } else {
      gfx = this._graphics.getGraphic(nameOrGraphic);
    }
    this._currentGfx = gfx;
    return new Promise((resolve) => {
      if (!duration) {
        resolve(gfx);
      } else if (duration) {
        delay(duration).then(() => {
          resolve(gfx);
        });
      } else {
        resolve(gfx);
      }
    });
  }

  public get order(): number {
    return this._options.order;
  }

  public set order(order: number) {
    this._options.order = order;
  }

  public get offset(): Vector {
    return this._options.offset ?? Vector.Zero;
  }

  public set offset(value: Vector) {
    this._options.offset = value;
  }

  private _currentGfx: Graphic;

  public get graphic(): Graphic {
    return this._currentGfx;
  }
}

/**
 * Component to manage drawings, using with the position component
 */
export class GraphicsComponent {
  private _graphics: { [graphicName: string]: Graphic } = {};
  private _layers: GraphicsLayer[] = [];
  private _layerMap: { [layerName: string]: GraphicsLayer } = {};
  public default: GraphicsLayer = new GraphicsLayer({ name: 'default', order: 0 }, this);

  public get layers(): readonly GraphicsLayer[] {
    return this._layers;
  }

  /**
   * Creates a new graphics layer
   */
  public createLayer(options: GraphicsLayerOptions): GraphicsLayer {
    const layer = new GraphicsLayer(options, this);
    return this._maybeAddLayer(layer);
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

  public getLayer(name: string): GraphicsLayer | undefined {
    return this._layerMap[name];
  }

  public getGraphic(name: string): Graphic | undefined {
    return this._graphics[name];
  }

  /**
   * Sets or gets wether any drawing should be visible in this component
   */
  public visible: boolean = true;

  /**
   * Sets or gets wither all drawings should have an opacity, if not set drawings individual opacity is respected
   */
  public opacity?: number | null = null;

  /**
   * Offset to apply to all drawings in this component if set, if null the drawing's offset is respected
   */
  public offset?: Vector | null = null;

  /**
   * Anchor to apply to all drawings in this component if set, if null the drawing's anchor is respected
   */
  public anchor?: Vector | null = null;

  public rotation?: number | null = null;

  constructor(options?: GraphicsComponentOptions) {
    // Defaults
    options = {
      visible: this.visible,
      ...options
    };

    const { current, opacity, visible, graphics, offset, rotation } = options;

    this._graphics = graphics || {};
    this.offset = offset ?? this.offset;
    this.opacity = opacity;
    this.visible = !!visible;
    this.rotation = rotation ?? 0;

    if (current && this._graphics[current]) {
      this.show(this._graphics[current]);
    }
    this._layers.push(this.default);
  }

  /**
   * Returns the currently displayed graphic, null if hidden
   */
  public get current(): Graphic {
    return this.default.graphic;
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
   * Show a graphic by name, returns a promise that resolves when graphic has finished displaying
   */
  public show(nameOrGraphic: string | Graphic, duration?: number): Promise<Graphic> {
    return this.default.show(nameOrGraphic, duration);
  }

  /**
   * Immediately show nothing
   */
  public hide(): Promise<void> {
    return this.default.hide();
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
    if (this._isAnimationOrGroup(this.current)) {
      this.current?.tick(elapsed);
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
      this._layers.sort((a, b) => a.order - b.order);
      for (const layer of this._layers) {
        const offsetX = -layer.graphic.width * layer.graphic.scale.x * anchor.x + x;
        const offsetY = -layer.graphic.height * layer.graphic.scale.y * anchor.y + y;
        layer.graphic?.draw(ctx, offsetX + layer.offset.x, offsetY + layer.offset.y);
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
