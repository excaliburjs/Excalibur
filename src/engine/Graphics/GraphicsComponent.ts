import { Vector } from '../Algebra';
import { Graphic } from './Graphic';
import { Animation } from './Animation';
import { delay } from '../Util/Delay';
import { GraphicsGroup } from './GraphicsGroup';
import { ExcaliburGraphicsContext } from './ExcaliburGraphicsContext';

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
  offset?: ex.Vector;

  /**
   * Optional origin
   */
  origin?: ex.Vector;

  /**
   * Optional rotation to apply to each graphic in this component
   */
  rotation?: number;
}

/**
 * Component to manage drawings, using with the position component
 */
export class GraphicsComponent {
  private _currentGfx: Graphic;
  private _graphics: { [graphicName: string]: Graphic } = {};

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
      this._currentGfx = this._graphics[current];
    }
  }

  /**
   * Returns the currently displayed graphic, null if hidden
   */
  public get current(): Graphic {
    return this._currentGfx;
  }

  /**
   * Returns all graphics associated with this component
   */
  public get graphics(): { [graphicName: string]: Graphic } {
    return this._graphics;
  }

  /**
   * Adds a graphic to this component, if the name is "default" or not specified, it will be shown by default without needing to call
   * `show("default")`
   * @param graphic
   */
  public add(graphic: Graphic): Graphic;
  public add(name: string, graphic: Graphic): Graphic;
  public add(nameOrDrawable: string | Graphic, graphic?: Graphic): Graphic {
    let name = 'default';
    let graphicToSet: Graphic = null;
    if (typeof nameOrDrawable === 'string') {
      name = nameOrDrawable;
      graphicToSet = graphic;
    } else {
      graphicToSet = nameOrDrawable;
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
  public show(graphicName: string | number, duration?: number): Promise<Graphic> {
    const gfx: Graphic = this._graphics[graphicName.toString()];
    this._currentGfx = gfx;
    return new Promise((resolve) => {
      if (!duration) {
        resolve(gfx);
      } else if (duration) {
        delay(duration).then(() => {
          resolve(gfx);
        });
      } else {
        gfx.finished.then(() => {
          resolve(gfx);
        });
      }
    });
  }

  /**
   * Immediately show nothing
   */
  public hide(): Promise<void> {
    this._currentGfx = null;
    return Promise.resolve();
  }

  /**
   * Returns the current drawings width in pixels, as it would appear on screen factoring width.
   * If there isn't a current drawing returns [[DrawingComponent.noDrawingWidth]].
   */
  public get width(): number {
    return this._currentGfx?.width ?? 0;
  }

  /**
   * Returns the current drawings height in pixels, as it would appear on screen factoring height.
   * If there isn't a current drawing returns [[DrawingComponent.noDrawingHeight]].
   */
  public get height(): number {
    return this._currentGfx?.height ?? 0;
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
   * @param options
   * @internal
   */
  public draw(ctx: ExcaliburGraphicsContext, x: number, y: number) {
    if (this.current) {
      // See https://github.com/excaliburjs/Excalibur/pull/619 for discussion on this formula
      const anchor = this.anchor ?? Vector.Zero;
      const offsetX = -this.current.width * this.current.scale.x * anchor.x + x;
      const offsetY = -this.current.height * this.current.scale.y * anchor.y + y;

      // This implementation will
      this.current.draw(ctx, offsetX, offsetY);
      // ctx.drawImage(this.current, offsetX, offsetY);
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
