import { Engine, ScrollPreventionMode } from '../Engine';
import { GlobalCoordinates } from '../Math/global-coordinates';
import { vec, Vector } from '../Math/vector';
import { PointerEvent } from './PointerEvent';
import { WheelEvent } from './WheelEvent';
import { PointerAbstraction } from './PointerAbstraction';

import { WheelDeltaMode } from './WheelDeltaMode';
import { PointerSystem } from './PointerSystem';
import { NativePointerButton } from './NativePointerButton';
import { PointerButton } from './PointerButton';
import { fail } from '../Util/Util';
import { PointerType } from './PointerType';
import { isCrossOriginIframe } from '../Util/IFrame';
import { EventEmitter, EventKey, Handler, Subscription } from '../EventEmitter';

export type NativePointerEvent = globalThis.PointerEvent;
export type NativeMouseEvent = globalThis.MouseEvent;
export type NativeTouchEvent = globalThis.TouchEvent;
export type NativeWheelEvent = globalThis.WheelEvent;

export type PointerEvents = {
  move: PointerEvent;
  down: PointerEvent;
  up: PointerEvent;
  wheel: WheelEvent;
};

export const PointerEvents = {
  Move: 'move',
  Down: 'down',
  Up: 'up',
  Wheel: 'wheel'
};

/**
 * Is this event a native touch event?
 */
function isTouchEvent(value: any): value is NativeTouchEvent {
  // Guard for Safari <= 13.1
  return globalThis.TouchEvent && value instanceof globalThis.TouchEvent;
}

/**
 * Is this event a native pointer event
 */
function isPointerEvent(value: any): value is NativePointerEvent {
  // Guard for Safari <= 13.1
  return globalThis.PointerEvent && value instanceof globalThis.PointerEvent;
}

export interface PointerInitOptions {
  grabWindowFocus?: boolean;
}

/**
 * The PointerEventProcessor is responsible for collecting all the events from the canvas and transforming them into GlobalCoordinates
 */
export class PointerEventReceiver {
  public events = new EventEmitter<PointerEvents>();
  public primary: PointerAbstraction = new PointerAbstraction();

  private _activeNativePointerIdsToNormalized = new Map<number, number>();
  public lastFramePointerCoords = new Map<number, GlobalCoordinates>();
  public currentFramePointerCoords = new Map<number, GlobalCoordinates>();

  public currentFramePointerDown = new Map<number, boolean>();
  public lastFramePointerDown = new Map<number, boolean>();

  public currentFrameDown: PointerEvent[] = [];
  public currentFrameUp: PointerEvent[] = [];
  public currentFrameMove: PointerEvent[] = [];
  public currentFrameCancel: PointerEvent[] = [];
  public currentFrameWheel: WheelEvent[] = [];

  private _enabled = true;

  constructor(
    public readonly target: GlobalEventHandlers & EventTarget,
    public engine: Engine
  ) {}

  public toggleEnabled(enabled: boolean) {
    this._enabled = enabled;
  }

  /**
   * Creates a new PointerEventReceiver with a new target and engine while preserving existing pointer event
   * handlers.
   * @param target
   * @param engine
   */
  public recreate(target: GlobalEventHandlers & EventTarget, engine: Engine) {
    const eventReceiver = new PointerEventReceiver(target, engine);
    eventReceiver.primary = this.primary;
    eventReceiver._pointers = this._pointers;
    return eventReceiver;
  }

  private _pointers: PointerAbstraction[] = [this.primary];
  /**
   * Locates a specific pointer by id, creates it if it doesn't exist
   * @param index
   */
  public at(index: number): PointerAbstraction {
    if (index >= this._pointers.length) {
      // Ensure there is a pointer to retrieve
      for (let i = this._pointers.length - 1, max = index; i < max; i++) {
        this._pointers.push(new PointerAbstraction());
      }
    }
    return this._pointers[index];
  }

  /**
   * The number of pointers currently being tracked by excalibur
   */
  public count(): number {
    return this._pointers.length;
  }

  /**
   * Is the specified pointer id down this frame
   * @param pointerId
   */
  public isDown(pointerId: number) {
    if (!this._enabled) {
      return false;
    }
    return this.currentFramePointerDown.get(pointerId) ?? false;
  }

  /**
   * Was the specified pointer id down last frame
   * @param pointerId
   */
  public wasDown(pointerId: number) {
    if (!this._enabled) {
      return false;
    }
    return this.lastFramePointerDown.get(pointerId) ?? false;
  }

  /**
   * Whether the Pointer is currently dragging.
   */
  public isDragging(pointerId: number): boolean {
    if (!this._enabled) {
      return false;
    }
    return this.isDown(pointerId);
  }

  /**
   * Whether the Pointer just started dragging.
   */
  public isDragStart(pointerId: number): boolean {
    if (!this._enabled) {
      return false;
    }
    return this.isDown(pointerId) && !this.wasDown(pointerId);
  }

  /**
   * Whether the Pointer just ended dragging.
   */
  public isDragEnd(pointerId: number): boolean {
    if (!this._enabled) {
      return false;
    }
    return !this.isDown(pointerId) && this.wasDown(pointerId);
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
   * Called internally by excalibur
   *
   * Updates the current frame pointer info and emits raw pointer events
   *
   * This does not emit events to entities, see PointerSystem
   * @internal
   */
  public update() {
    this.lastFramePointerDown = new Map(this.currentFramePointerDown);
    this.lastFramePointerCoords = new Map(this.currentFramePointerCoords);

    for (const event of this.currentFrameDown) {
      if (!event.active) {
        continue;
      }
      this.emit('down', event);
      const pointer = this.at(event.pointerId);
      pointer.emit('down', event);
      this.primary.emit('pointerdown', event);
    }

    for (const event of this.currentFrameUp) {
      if (!event.active) {
        continue;
      }
      this.emit('up', event);
      const pointer = this.at(event.pointerId);
      pointer.emit('up', event);
    }

    for (const event of this.currentFrameMove) {
      if (!event.active) {
        continue;
      }
      this.emit('move', event);
      const pointer = this.at(event.pointerId);
      pointer.emit('move', event);
    }

    for (const event of this.currentFrameCancel) {
      if (!event.active) {
        continue;
      }
      this.emit('cancel', event);
      const pointer = this.at(event.pointerId);
      pointer.emit('cancel', event);
    }

    for (const event of this.currentFrameWheel) {
      if (!event.active) {
        continue;
      }
      this.emit('pointerwheel', event);
      this.emit('wheel', event);
      this.primary.emit('pointerwheel', event);
      this.primary.emit('wheel', event);
    }

    if (this.engine.currentScene.camera.hasChanged()) {
      for (const pointer of this._pointers) {
        pointer._updateWorldPosition(this.engine);
      }
    }
  }

  /**
   * Clears the current frame event and pointer data
   */
  public clear() {
    for (const event of this.currentFrameUp) {
      this.currentFramePointerCoords.delete(event.pointerId);
      const ids = this._activeNativePointerIdsToNormalized.entries();
      for (const [native, normalized] of ids) {
        if (normalized === event.pointerId) {
          this._activeNativePointerIdsToNormalized.delete(native);
        }
      }
    }
    this.currentFrameDown.length = 0;
    this.currentFrameUp.length = 0;
    this.currentFrameMove.length = 0;
    this.currentFrameCancel.length = 0;
    this.currentFrameWheel.length = 0;
  }

  private _boundHandle = this._handle.bind(this);
  private _boundWheel = this._handleWheel.bind(this);
  /**
   * Initializes the pointer event receiver so that it can start listening to native
   * browser events.
   */
  public init(options?: PointerInitOptions) {
    if (this.engine.isDisposed()) {
      return;
    }
    // Disabling the touch action avoids browser/platform gestures from firing on the canvas
    // It is important on mobile to have touch action 'none'
    // https://stackoverflow.com/questions/48124372/pointermove-event-not-working-with-touch-why-not
    if (this.target === this.engine.canvas) {
      this.engine.canvas.style.touchAction = 'none';
    } else {
      document.body.style.touchAction = 'none';
    }
    // Preferred pointer events
    if (window.PointerEvent) {
      this.target.addEventListener('pointerdown', this._boundHandle);
      this.target.addEventListener('pointerup', this._boundHandle);
      this.target.addEventListener('pointermove', this._boundHandle);
      this.target.addEventListener('pointercancel', this._boundHandle);
    } else {
      // Touch Events
      this.target.addEventListener('touchstart', this._boundHandle);
      this.target.addEventListener('touchend', this._boundHandle);
      this.target.addEventListener('touchmove', this._boundHandle);
      this.target.addEventListener('touchcancel', this._boundHandle);

      // Mouse Events
      this.target.addEventListener('mousedown', this._boundHandle);
      this.target.addEventListener('mouseup', this._boundHandle);
      this.target.addEventListener('mousemove', this._boundHandle);
    }

    // MDN MouseWheelEvent
    const wheelOptions = {
      passive: !(
        this.engine.pageScrollPreventionMode === ScrollPreventionMode.All ||
        this.engine.pageScrollPreventionMode === ScrollPreventionMode.Canvas
      )
    };
    if ('onwheel' in document.createElement('div')) {
      // Modern Browsers
      this.target.addEventListener('wheel', this._boundWheel, wheelOptions);
    } else if (document.onmousewheel !== undefined) {
      // Webkit and IE
      this.target.addEventListener('mousewheel', this._boundWheel, wheelOptions);
    } else {
      // Remaining browser and older Firefox
      this.target.addEventListener('MozMousePixelScroll', this._boundWheel, wheelOptions);
    }

    const grabWindowFocus = options?.grabWindowFocus ?? true;
    // Handle cross origin iframe
    if (grabWindowFocus && isCrossOriginIframe()) {
      const grabFocus = () => {
        window.focus();
      };
      // Preferred pointer events
      if (window.PointerEvent) {
        this.target.addEventListener('pointerdown', grabFocus);
      } else {
        // Touch Events
        this.target.addEventListener('touchstart', grabFocus);

        // Mouse Events
        this.target.addEventListener('mousedown', grabFocus);
      }
    }
  }

  public detach() {
    // Preferred pointer events
    if (window.PointerEvent) {
      this.target.removeEventListener('pointerdown', this._boundHandle);
      this.target.removeEventListener('pointerup', this._boundHandle);
      this.target.removeEventListener('pointermove', this._boundHandle);
      this.target.removeEventListener('pointercancel', this._boundHandle);
    } else {
      // Touch Events
      this.target.removeEventListener('touchstart', this._boundHandle);
      this.target.removeEventListener('touchend', this._boundHandle);
      this.target.removeEventListener('touchmove', this._boundHandle);
      this.target.removeEventListener('touchcancel', this._boundHandle);

      // Mouse Events
      this.target.removeEventListener('mousedown', this._boundHandle);
      this.target.removeEventListener('mouseup', this._boundHandle);
      this.target.removeEventListener('mousemove', this._boundHandle);
    }

    if ('onwheel' in document.createElement('div')) {
      // Modern Browsers
      this.target.removeEventListener('wheel', this._boundWheel);
    } else if (document.onmousewheel !== undefined) {
      // Webkit and IE
      this.target.addEventListener('mousewheel', this._boundWheel);
    } else {
      // Remaining browser and older Firefox
      this.target.addEventListener('MozMousePixelScroll', this._boundWheel);
    }
  }

  /**
   * Take native pointer id and map it to index in active pointers
   * @param nativePointerId
   */
  private _normalizePointerId(nativePointerId: number) {
    // Add to the the native pointer set id
    this._activeNativePointerIdsToNormalized.set(nativePointerId, -1);

    // Native pointer ids in ascending order
    const currentPointerIds = Array.from(this._activeNativePointerIdsToNormalized.keys()).sort((a, b) => a - b);

    // The index into sorted ids will be the new id, will always have an id
    const id = currentPointerIds.findIndex((p) => p === nativePointerId);

    // Save the mapping so we can reverse it later
    this._activeNativePointerIdsToNormalized.set(nativePointerId, id);

    // ignore pointer because game isn't watching
    return id;
  }

  /**
   * Responsible for handling and parsing pointer events
   */
  private _handle(ev: NativeTouchEvent | NativePointerEvent | NativeMouseEvent) {
    if (!this._enabled) {
      return;
    }
    ev.preventDefault();
    const eventCoords = new Map<number, GlobalCoordinates>();
    let button: PointerButton;
    let pointerType: PointerType;
    if (isTouchEvent(ev)) {
      button = PointerButton.Unknown;
      pointerType = PointerType.Touch;
      // https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent
      for (let i = 0; i < ev.changedTouches.length; i++) {
        const touch = ev.changedTouches[i];
        const coordinates = GlobalCoordinates.fromPagePosition(touch.pageX, touch.pageY, this.engine);
        const nativePointerId = i + 1;
        const pointerId = this._normalizePointerId(nativePointerId);
        this.currentFramePointerCoords.set(pointerId, coordinates);
        eventCoords.set(pointerId, coordinates);
      }
    } else {
      button = this._nativeButtonToPointerButton(ev.button);
      pointerType = PointerType.Mouse;
      const coordinates = GlobalCoordinates.fromPagePosition(ev.pageX, ev.pageY, this.engine);
      let nativePointerId = 1;
      if (isPointerEvent(ev)) {
        nativePointerId = ev.pointerId;
        pointerType = this._stringToPointerType(ev.pointerType);
      }
      const pointerId = this._normalizePointerId(nativePointerId);
      this.currentFramePointerCoords.set(pointerId, coordinates);
      eventCoords.set(pointerId, coordinates);
    }

    for (const [pointerId, coord] of eventCoords.entries()) {
      switch (ev.type) {
        case 'mousedown':
        case 'pointerdown':
        case 'touchstart':
          this.currentFrameDown.push(new PointerEvent('down', pointerId, button, pointerType, coord, ev));
          this.currentFramePointerDown.set(pointerId, true);
          break;
        case 'mouseup':
        case 'pointerup':
        case 'touchend':
          this.currentFrameUp.push(new PointerEvent('up', pointerId, button, pointerType, coord, ev));
          this.currentFramePointerDown.set(pointerId, false);
          break;
        case 'mousemove':
        case 'pointermove':
        case 'touchmove':
          this.currentFrameMove.push(new PointerEvent('move', pointerId, button, pointerType, coord, ev));
          break;
        case 'touchcancel':
        case 'pointercancel':
          this.currentFrameCancel.push(new PointerEvent('cancel', pointerId, button, pointerType, coord, ev));
          break;
      }
    }
  }

  private _handleWheel(ev: NativeWheelEvent) {
    if (!this._enabled) {
      return;
    }
    // Should we prevent page scroll because of this event
    if (
      this.engine.pageScrollPreventionMode === ScrollPreventionMode.All ||
      (this.engine.pageScrollPreventionMode === ScrollPreventionMode.Canvas && ev.target === this.engine.canvas)
    ) {
      ev.preventDefault();
    }
    const screen = this.engine.screen.pageToScreenCoordinates(vec(ev.pageX, ev.pageY));
    const world = this.engine.screen.screenToWorldCoordinates(screen);

    /**
     * A constant used to normalize wheel events across different browsers
     *
     * This normalization factor is pulled from
     * https://developer.mozilla.org/en-US/docs/Web/Events/wheel#Listening_to_this_event_across_browser
     */
    const ScrollWheelNormalizationFactor = -1 / 40;

    const deltaX = ev.deltaX || ev.wheelDeltaX * ScrollWheelNormalizationFactor || 0;
    const deltaY =
      ev.deltaY || ev.wheelDeltaY * ScrollWheelNormalizationFactor || ev.wheelDelta * ScrollWheelNormalizationFactor || ev.detail || 0;
    const deltaZ = ev.deltaZ || 0;
    let deltaMode = WheelDeltaMode.Pixel;

    if (ev.deltaMode) {
      if (ev.deltaMode === 1) {
        deltaMode = WheelDeltaMode.Line;
      } else if (ev.deltaMode === 2) {
        deltaMode = WheelDeltaMode.Page;
      }
    }

    const we = new WheelEvent(world.x, world.y, ev.pageX, ev.pageY, screen.x, screen.y, 0, deltaX, deltaY, deltaZ, deltaMode, ev);
    this.currentFrameWheel.push(we);
  }

  /**
   * Triggers an excalibur pointer event in a world space pos
   *
   * Useful for testing pointers in excalibur
   * @param type
   * @param pos
   */
  public triggerEvent(type: 'down' | 'up' | 'move' | 'cancel', pos: Vector) {
    const page = this.engine.screen.worldToPageCoordinates(pos);
    // Send an event to the event receiver
    if (window.PointerEvent) {
      this._handle(
        new window.PointerEvent('pointer' + type, {
          pointerId: 0,
          clientX: page.x,
          clientY: page.y
        })
      );
    } else {
      // Safari hack
      this._handle(
        new window.MouseEvent('mouse' + type, {
          clientX: page.x,
          clientY: page.y
        })
      );
    }

    // Force update pointer system
    const pointerSystem = this.engine.currentScene.world.get(PointerSystem);
    pointerSystem.preupdate(this.engine.currentScene, 1);
    pointerSystem.update(1);
  }

  private _nativeButtonToPointerButton(s: NativePointerButton): PointerButton {
    switch (s) {
      case NativePointerButton.NoButton:
        return PointerButton.NoButton;
      case NativePointerButton.Left:
        return PointerButton.Left;
      case NativePointerButton.Middle:
        return PointerButton.Middle;
      case NativePointerButton.Right:
        return PointerButton.Right;
      case NativePointerButton.Unknown:
        return PointerButton.Unknown;
      default:
        return fail(s);
    }
  }

  private _stringToPointerType(s: string) {
    switch (s) {
      case 'touch':
        return PointerType.Touch;
      case 'mouse':
        return PointerType.Mouse;
      case 'pen':
        return PointerType.Pen;
      default:
        return PointerType.Unknown;
    }
  }
}
