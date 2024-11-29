import { Vector } from '../Math/vector';
import { PointerEvent } from './PointerEvent';
import { EventEmitter, EventKey, Handler, Subscription } from '../EventEmitter';
import { PointerEvents } from './PointerEventReceiver';
import { GlobalCoordinates } from '../Math/global-coordinates';
import { Engine } from '../Engine';

export class PointerAbstraction {
  public events = new EventEmitter<PointerEvents>();
  /**
   * The last position on the document this pointer was at. Can be `null` if pointer was never active.
   */
  public lastPagePos: Vector = Vector.Zero;

  /**
   * The last position on the screen this pointer was at. Can be `null` if pointer was never active.
   */
  public lastScreenPos: Vector = Vector.Zero;

  /**
   * The last position in the game world coordinates this pointer was at. Can be `null` if pointer was never active.
   */
  public lastWorldPos: Vector = Vector.Zero;

  constructor() {
    this.on('move', this._onPointerMove);
    this.on('down', this._onPointerDown);
  }

  public emit<TEventName extends EventKey<PointerEvents>>(eventName: TEventName, event: PointerEvents[TEventName]): void;
  public emit(eventName: string, event?: any): void;
  public emit<TEventName extends EventKey<PointerEvents> | string>(eventName: TEventName, event?: any): void {
    this.events.emit(eventName, event);
  }

  public on<TEventName extends EventKey<PointerEvents>>(eventName: TEventName, handler: Handler<PointerEvents[TEventName]>): Subscription;
  public on(eventName: string, handler: Handler<unknown>): Subscription;
  public on<TEventName extends EventKey<PointerEvents> | string>(eventName: TEventName, handler: Handler<any>): Subscription {
    return this.events.on(eventName, handler);
  }

  public once<TEventName extends EventKey<PointerEvents>>(eventName: TEventName, handler: Handler<PointerEvents[TEventName]>): Subscription;
  public once(eventName: string, handler: Handler<unknown>): Subscription;
  public once<TEventName extends EventKey<PointerEvents> | string>(eventName: TEventName, handler: Handler<any>): Subscription {
    return this.events.once(eventName, handler);
  }

  public off<TEventName extends EventKey<PointerEvents>>(eventName: TEventName, handler: Handler<PointerEvents[TEventName]>): void;
  public off(eventName: string, handler: Handler<unknown>): void;
  public off(eventName: string): void;
  public off<TEventName extends EventKey<PointerEvents> | string>(eventName: TEventName, handler?: Handler<any>): void {
    this.events.off(eventName, handler);
  }

  /**
   * Called internally by excalibur to keep pointers up to date
   * @internal
   * @param engine
   */
  public _updateWorldPosition(engine: Engine) {
    const coord = GlobalCoordinates.fromPagePosition(this.lastPagePos, engine);
    this.lastScreenPos = coord.screenPos;
    this.lastWorldPos = coord.worldPos;
  }

  private _onPointerMove = (ev: PointerEvent): void => {
    this.lastPagePos = new Vector(ev.pagePos.x, ev.pagePos.y);
    this.lastScreenPos = new Vector(ev.screenPos.x, ev.screenPos.y);
    this.lastWorldPos = new Vector(ev.worldPos.x, ev.worldPos.y);
  };

  private _onPointerDown = (ev: PointerEvent): void => {
    this.lastPagePos = new Vector(ev.pagePos.x, ev.pagePos.y);
    this.lastScreenPos = new Vector(ev.screenPos.x, ev.screenPos.y);
    this.lastWorldPos = new Vector(ev.worldPos.x, ev.worldPos.y);
  };
}
