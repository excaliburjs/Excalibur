import { Class } from "../Class";
import { Engine, ScrollPreventionMode } from "../Engine";
import { GlobalCoordinates } from "../Math/global-coordinates";
import { vec, Vector } from "../Math/vector";
import { ExPointerEvent } from "./ExPointerEvent";
import { ExWheelEvent } from "./ExWheelEvent";
import { PointerAbstraction } from "./PointerAbstraction";

import { WheelDeltaMode } from "./PointerEvents";
import { PointerSystem } from "./PointerSystem";




/**
 * The PointerEventProcessor is responsible for collecting all the events from the canvas and transforming them into GlobalCoordinates
 */
export class PointerEventReceiver extends Class {
  public primary: PointerAbstraction = new PointerAbstraction();

  private _activeNativePointerIdsToNormalized = new Map<number, number>();
  public lastFramePointerPosition = new Map<number, Vector>();
  public currentFramePointerPositions = new Map<number, Vector>();

  public currentFramePointerDown = new Map<number, boolean>();
  public lastFramePointerDown = new Map<number, boolean>();

  // TODO held and drag events?
  // TODO make this private
  public currentFrameDown: ExPointerEvent[] = [];
  public currentFrameUp: ExPointerEvent[] = [];
  public currentFrameMove: ExPointerEvent[] = [];
  public currentFrameCancel: ExPointerEvent[] = [];
  public currentFrameWheel: ExWheelEvent[] = [];

  constructor(public readonly target: GlobalEventHandlers & EventTarget, public engine: Engine) {
    super();
  }

  private _pointers: PointerAbstraction[] = [this.primary];
  public at(index: number): PointerAbstraction {
    if (index >= this._pointers.length) {
      // Ensure there is a pointer to retrieve
      for (let i = this._pointers.length - 1, max = index; i < max; i++) {
        this._pointers.push(new PointerAbstraction());
      }
    }
    return this._pointers[index];
  }

  public isDown(pointerId: number) {
    return this.currentFramePointerDown.get(pointerId) ?? false
  }

  public wasDown(pointerId: number) {
    return this.lastFramePointerDown.get(pointerId) ?? false
  }

  /**
   * Whether the Pointer is currently dragging.
   */
  public isDragging(pointerId: number): boolean {
    return this.isDown(pointerId);
  }

  /**
   * Whether the Pointer just started dragging.
   */
  public isDragStart(pointerId: number): boolean {
    return this.isDown(pointerId) && !this.wasDown(pointerId);
  }

  /**
   * Whether the Pointer just ended dragging.
   */
  public isDragEnd(pointerId: number): boolean {
    return !this.isDown(pointerId) && this.wasDown(pointerId);
  }

  on(event: 'move', handler: (event: ExPointerEvent) => void): void;
  on(event: 'down', handler: (event: ExPointerEvent) => void): void;
  on(event: 'up', handler: (event: ExPointerEvent) => void): void;
  on(event: 'wheel', handler: (event: ExWheelEvent) => void): void;
  on(event: string, handler: (event: any) => void): void {
    super.on(event, handler);
  }

  once(event: 'move', handler: (event: ExPointerEvent) => void): void;
  once(event: 'down', handler: (event: ExPointerEvent) => void): void;
  once(event: 'up', handler: (event: ExPointerEvent) => void): void;
  once(event: 'wheel', handler: (event: ExWheelEvent) => void): void;
  once(event: string, handler: (event: any) => void): void {
    super.once(event, handler);
  }

  off(event: 'move', handler?: (event: ExPointerEvent) => void): void;
  off(event: 'down', handler?: (event: ExPointerEvent) => void): void;
  off(event: 'up', handler?: (event: ExPointerEvent) => void): void;
  off(event: 'wheel', handler?: (event: ExWheelEvent) => void): void;
  off(event: string, handler?: (event: any) => void): void {
    super.off(event, handler);
  }

  public update() {
    this.lastFramePointerDown = new Map(this.currentFramePointerDown);
    this.lastFramePointerPosition = new Map(this.currentFramePointerPositions);

    for (let event of this.currentFrameDown) {
      this.emit('down', event as any);
      const pointer = this.at(event.pointerId);
      pointer.emit('down', event);
      this.primary.emit('pointerdown', event as any);
    }

    for (let event of this.currentFrameUp) {
      this.emit('up', event as any);
      const pointer = this.at(event.pointerId);
      pointer.emit('up', event);
    }

    for (let event of this.currentFrameMove) {
      this.emit('move', event as any);
      const pointer = this.at(event.pointerId);
      pointer.emit('move', event);
    }

    for (let event of this.currentFrameCancel) {
      this.emit('cancel', event as any);
      const pointer = this.at(event.pointerId);
      pointer.emit('cancel', event);
    }

    for (let event of this.currentFrameWheel) {
      this.emit('wheel', event as any);
      this.primary.emit('pointerwheel', event as any);
    }
  }

  public clear() {
    for (let event of this.currentFrameUp) {
      this.currentFramePointerPositions.delete(event.pointerId);
      const ids = this._activeNativePointerIdsToNormalized.entries();
      for (let [native, normalized] of ids) {
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
  public attach() {
    // Disabling the touch action avoids browser/platform gestures from firing on the canvas
    this.engine.canvas.style.touchAction = 'none';
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
   * @returns 
   */
  private _normalizePointerId(nativePointerId: number) {
    // Add to the the native pointer set id
    this._activeNativePointerIdsToNormalized.set(nativePointerId, -1);

    // Native pointer ids in ascending order
    let currentPointerIds = Array.from(this._activeNativePointerIdsToNormalized.keys()).sort((a, b) => a - b);
  
    // The index into sorted ids will be the new id, will always have an id
    let id = currentPointerIds.findIndex(p => p === nativePointerId);

    // Save the mapping so we can reverse it later
    this._activeNativePointerIdsToNormalized.set(nativePointerId, id);

    // ignore pointer because game isn't watching
    return id;
  }

  /**
   * Responsible for handling and parsing pointer events
   */
  private _handle(ev: TouchEvent | PointerEvent | MouseEvent) {
    ev.preventDefault();
    let eventCoords = new Map<number, GlobalCoordinates>();
    if (ev instanceof TouchEvent) {
      // https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent
      for (let i = 0; i < ev.changedTouches.length; i++) {
        const touch = ev.changedTouches[i];
        const coordinates = GlobalCoordinates.fromPagePosition(touch.pageX, touch.pageY, this.engine);
        const nativePointerId = i + 1;
        const pointerId = this._normalizePointerId(nativePointerId);
        this.currentFramePointerPositions.set(pointerId, coordinates.worldPos);
        eventCoords.set(pointerId, coordinates);
      }
    } else {
      const coordinates = GlobalCoordinates.fromPagePosition(ev.pageX, ev.pageY, this.engine);
      let nativePointerId = 1;
      if (ev instanceof PointerEvent) {
        nativePointerId = ev.pointerId;
      }
      const pointerId = this._normalizePointerId(nativePointerId);
      this.currentFramePointerPositions.set(pointerId, coordinates.worldPos);
      eventCoords.set(pointerId, coordinates);
    }

    for (let [pointerId, coord] of eventCoords.entries()) {
      switch(ev.type) {
        case 'mousedown':
        case 'pointerdown':
        case 'touchstart':
          this.currentFrameDown.push(new ExPointerEvent('down', pointerId, coord, ev))
          this.currentFramePointerDown.set(pointerId, true);
          break;
        case 'mouseup':
        case 'pointerup':
        case 'touchend':
          this.currentFrameUp.push(new ExPointerEvent('up', pointerId, coord, ev))
          this.currentFramePointerDown.set(pointerId, false);
          break;
        case 'mousemove':
        case 'pointermove':
        case 'touchmove':
          this.currentFrameMove.push(new ExPointerEvent('move', pointerId, coord, ev))
          break;
        case 'touchcancel':
        case 'pointercance':
          this.currentFrameCancel.push(new ExPointerEvent('cancel', pointerId, coord, ev))
          break;
      }
    }
  }

  private _handleWheel(ev: WheelEvent) {
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
     * This normalization factor is pulled from https://developer.mozilla.org/en-US/docs/Web/Events/wheel#Listening_to_this_event_across_browser
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

      const we = new ExWheelEvent(world.x, world.y, ev.pageX, ev.pageY, screen.x, screen.y, 0, deltaX, deltaY, deltaZ, deltaMode, ev);
      this.currentFrameWheel.push(we);
  }

  /**
   * Triggers an excalibur pointer event in a world space pos
   * @param type 
   * @param pos 
   */
  public triggerEvent(type: 'down' | 'up' | 'move' | 'cancel', pos: Vector) {
    const page = this.engine.screen.worldToPageCoordinates(pos);
    // Send an event to the event receiver
    this._handle(new PointerEvent('pointer' + type, {
      pointerId: 0,
      clientX: page.x,
      clientY: page.y
    }));

    // Force update pointer system
    const pointerSystem = this.engine.currentScene.world.systemManager.get(PointerSystem);
    const transformEntities = this.engine.currentScene.world.queryManager.createQuery(pointerSystem.types);
    pointerSystem.update(transformEntities.getEntities());
  }
  
  public dispatchEvent(type: 'pointerdown', opts?: PointerEventInit) {
    this.simulate(new PointerEvent(type, opts))

  }

  public simulate(ev: TouchEvent | PointerEvent | MouseEvent) {
    this.target.dispatchEvent(ev);
  }
}