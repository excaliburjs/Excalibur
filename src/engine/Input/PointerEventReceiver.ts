import { Engine, GlobalCoordinates, ScrollPreventionMode, vec, Vector } from "..";
import { WheelDeltaMode } from "./PointerEvents";

export class ExPointerEvent {
  public active = true;
  public cancel() {
    this.active = false;
  }
  constructor(public type: 'down' | 'up' | 'move' | 'cancel', public pointerId: number, public coordinates: GlobalCoordinates, public nativeEvent: Event){};
}

export class ExWheelEvent {
  public active = true;
  public cancel() {
    this.active = false;
  }
  constructor(
    public x: number,
    public y: number,
    public pageX: number,
    public pageY: number,
    public screenX: number,
    public screenY: number,
    public index: number,
    public deltaX: number,
    public deltaY: number,
    public deltaZ: number,
    public deltaMode: WheelDeltaMode,
    public ev: Event
  ) {}
}

/**
 * A constant used to normalize wheel events across different browsers
 *
 * This normalization factor is pulled from https://developer.mozilla.org/en-US/docs/Web/Events/wheel#Listening_to_this_event_across_browser
 */
 const ScrollWheelNormalizationFactor = -1 / 40;


/**
 * The PointerEventProcessor is responsible for collecting all the events from the canvas and transforming them into GlobalCoordinates
 */
export class PointerEventReceiver {
  // TODO pointers type
  public lastFramePointerPosition = new Map<number, Vector>();
  public currentFramePointerPositions = new Map<number, Vector>();
  public pointerDown = new Map<number, boolean>();

  public down: ExPointerEvent[] = [];
  public up: ExPointerEvent[] = [];
  public move: ExPointerEvent[] = [];
  public cancel: ExPointerEvent[] = [];
  public wheel: ExWheelEvent[] = [];
  // TODO held and drag events?

  constructor(public readonly target: GlobalEventHandlers & EventTarget, public engine: Engine) {}

  // public get pointerPositions(): Map<number, Vector> {
  //   return new Map([...this.lastFramePointerPosition, ...this.currentFramePointerPositions])
  // }

  public update() {
    this.lastFramePointerPosition = new Map(this.currentFramePointerPositions);
    // this.currentFramePointerPositions.clear();
  }

  public clear() {
    for (let event of this.up) {
      this.currentFramePointerPositions.delete(event.pointerId);
    }
    this.down.length = 0;
    this.up.length = 0;
    this.move.length = 0;
    this.cancel.length = 0;
    this.wheel.length = 0;
  }

  public attach() {
    // Touch Events
    this.target.addEventListener('touchstart', this._handle.bind(this));
    this.target.addEventListener('touchend', this._handle.bind(this));
    this.target.addEventListener('touchmove', this._handle.bind(this));
    this.target.addEventListener('touchcancel', this._handle.bind(this));

    // this._engine.canvas.style.touchAction = 'none';
    if (window.PointerEvent) {
      this.target.addEventListener('pointerdown', this._handle.bind(this));
      this.target.addEventListener('pointerup', this._handle.bind(this));
      this.target.addEventListener('pointermove', this._handle.bind(this));
      this.target.addEventListener('pointercancel', this._handle.bind(this));
    } else {
      // Mouse Events
      this.target.addEventListener('mousedown', this._handle.bind(this));
      this.target.addEventListener('mouseup', this._handle.bind(this));
      this.target.addEventListener('mousemove', this._handle.bind(this));
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
      this.target.addEventListener('wheel', this._handleWheel.bind(this), wheelOptions);
    } else if (document.onmousewheel !== undefined) {
      // Webkit and IE
      this.target.addEventListener('mousewheel', this._handleWheel.bind(this), wheelOptions);
    } else {
      // Remaining browser and older Firefox
      this.target.addEventListener('MozMousePixelScroll', this._handleWheel.bind(this), wheelOptions);
    }
  }

  public detach() {
    // Touch Events
    this.target.removeEventListener('touchstart', this._handle);
    this.target.removeEventListener('touchend', this._handle);
    this.target.removeEventListener('touchmove', this._handle);
    this.target.removeEventListener('touchcancel', this._handle);

    if (window.PointerEvent) {
      this.target.removeEventListener('pointerdown', this._handle);
      this.target.removeEventListener('pointerup', this._handle);
      this.target.removeEventListener('pointermove', this._handle);
      this.target.removeEventListener('pointercancel', this._handle);
    } else {
      // Mouse Events
      this.target.removeEventListener('mousedown', this._handle);
      this.target.removeEventListener('mouseup', this._handle);
      this.target.removeEventListener('mousemove', this._handle);
    }
  }

  private _handle(ev: TouchEvent | PointerEvent | MouseEvent) {
    ev.preventDefault();
    let eventCoords = new Map<number, GlobalCoordinates>();
    if (ev instanceof TouchEvent) {
      // https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent
      for (let i = 0; i < ev.changedTouches.length; i++) {
        const touch = ev.changedTouches[i];
        const coordinates = GlobalCoordinates.fromPagePosition(touch.pageX, touch.pageY, this.engine);
        this.currentFramePointerPositions.set(i + 1, coordinates.worldPos);
        eventCoords.set(i + 1, coordinates);
      }
    } else {
      const coordinates = GlobalCoordinates.fromPagePosition(ev.pageX, ev.pageY, this.engine);
      let pointerId = 0;
      if (ev instanceof PointerEvent) {
        pointerId = ev.pointerId;
      }
      this.currentFramePointerPositions.set(pointerId, coordinates.worldPos);
      eventCoords.set(pointerId, coordinates);
      console.log(pointerId);
    }

    for (let [pointerId, coord] of eventCoords.entries()) {
      switch(ev.type) {
        case 'mousedown':
        case 'pointerdown':
        case 'touchstart':
          this.down.push(new ExPointerEvent('down', pointerId, coord, ev))
          this.pointerDown.set(pointerId, true);
          break;
        case 'mouseup':
        case 'pointerup':
        case 'touchend':
          this.up.push(new ExPointerEvent('up', pointerId, coord, ev))
          this.pointerDown.set(pointerId, false);
          break;
        case 'mousemove':
        case 'pointermove':
        case 'touchmove':
          this.move.push(new ExPointerEvent('move', pointerId, coord, ev))
          break;
        case 'touchcancel':
        case 'pointercance':
          this.cancel.push(new ExPointerEvent('cancel', pointerId, coord, ev))
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
      this.wheel.push(we);
  }

  public sendPointer(type: 'pointerdown', opts?: PointerEventInit) {
    this.simulate(new PointerEvent(type, opts))
  }

  public simulate(ev: TouchEvent | PointerEvent | MouseEvent) {
    this.target.dispatchEvent(ev);
  }
}