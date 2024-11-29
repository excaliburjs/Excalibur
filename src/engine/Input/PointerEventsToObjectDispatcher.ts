import { EventEmitter } from '../EventEmitter';
import { PointerEvent } from './PointerEvent';
import { GlobalCoordinates } from '../Math';
import { PointerEventReceiver } from './PointerEventReceiver';
import { RentalPool } from '../Util/RentalPool';

/**
 * Signals that an object has nested pointer events on nested objects that are not an Entity with
 * a PointerComponent. For example TileMap Tiles
 */
export interface HasNestedPointerEvents {
  _dispatchPointerEvents(receiver: PointerEventReceiver): void;
  _processPointerToObject(receiver: PointerEventReceiver): void;
}

/**
 *
 */
function hasNestedEvents(object: any): object is HasNestedPointerEvents {
  return object && object._dispatchPointerEvents && object._processPointerToObject;
}

export class PointerTargetObjectProxy<TObject extends { events: EventEmitter }> {
  public object!: TObject;
  public contains!: (point: GlobalCoordinates) => boolean;
  public active!: () => boolean;
  public get events(): EventEmitter {
    return this.object.events;
  }
  public init(object: TObject, contains: (point: GlobalCoordinates) => boolean, active: () => boolean): void {
    this.object = object;
    this.contains = contains;
    this.active = active;
  }
}

export class PointerEventsToObjectDispatcher<TObject extends { events: EventEmitter }> {
  private _proxyPool = new RentalPool(
    () => new PointerTargetObjectProxy<TObject>(),
    (p) => p,
    100
  );
  private _objectToProxy = new Map<TObject, PointerTargetObjectProxy<TObject>>();
  private _proxies: PointerTargetObjectProxy<TObject>[] = [];

  /**
   * Tracks an object to associate with pointers and their events
   * @param object
   * @param contains
   * @param active
   */
  public addObject(object: TObject, contains: (point: GlobalCoordinates) => boolean, active: () => boolean): void {
    const proxy = this._proxyPool.rent(false);
    proxy.init(object, contains, active);
    this._proxies.push(proxy);
    this._objectToProxy.set(object, proxy);
  }

  private _getProxy(object: TObject): PointerTargetObjectProxy<TObject> {
    const proxy = this._objectToProxy.get(object);
    if (proxy) {
      return proxy;
    }
    throw new Error('No PointerTargetProxy for object');
  }

  /**
   * Untracks an object associated with pointers and their events
   * @param object
   */
  public removeObject(object: TObject): void {
    const proxy = this._objectToProxy.get(object);
    if (proxy) {
      const index = this._proxies.indexOf(proxy);
      if (index > -1) {
        this._proxies.splice(index, 1);
      }
      this._proxyPool.return(proxy);
    }
  }
  private _lastFrameObjectToPointers = new Map<PointerTargetObjectProxy<any>, number[]>();
  private _currentFrameObjectToPointers = new Map<PointerTargetObjectProxy<any>, number[]>();
  private _objectCurrentlyUnderPointer(object: PointerTargetObjectProxy<any>, pointerId: number): boolean {
    return !!(this._currentFrameObjectToPointers.has(object) && this._currentFrameObjectToPointers.get(object)!.includes(pointerId));
  }

  private _objectWasUnderPointer(object: PointerTargetObjectProxy<any>, pointerId: number): boolean {
    return !!(this._lastFrameObjectToPointers.has(object) && this._lastFrameObjectToPointers.get(object)!.includes(pointerId));
  }

  private _entered(object: PointerTargetObjectProxy<any>, pointerId: number): boolean {
    return this._objectCurrentlyUnderPointer(object, pointerId) && !this._lastFrameObjectToPointers.has(object);
  }

  private _left(object: PointerTargetObjectProxy<any>, pointerId: number): boolean {
    return !this._currentFrameObjectToPointers.has(object) && this._objectWasUnderPointer(object, pointerId);
  }

  /**
   * Manually associate a pointer id with an object.
   *
   * This assumes you've checked that the pointer is indeed over the object.
   */
  public addPointerToObject(object: TObject, pointerId: number): void {
    const maybeProxy = this._objectToProxy.get(object);
    if (maybeProxy) {
      this._addPointerToProxy(maybeProxy, pointerId);
    }
  }

  private _addPointerToProxy(object: PointerTargetObjectProxy<any>, pointerId: number): void {
    if (!this._currentFrameObjectToPointers.has(object)) {
      this._currentFrameObjectToPointers.set(object, [pointerId]);
      return;
    }
    const pointers = this._currentFrameObjectToPointers.get(object)!;
    this._currentFrameObjectToPointers.set(object, pointers.concat(pointerId));
  }

  /**
   * Dispatches the appropriate pointer events in sortedObject order on tracked objects
   * @param receiver
   * @param sortedObjects
   */
  public dispatchEvents(receiver: PointerEventReceiver, sortedObjects: TObject[]) {
    const lastFrameEntities = new Set(this._lastFrameObjectToPointers.keys());
    const currentFrameEntities = new Set(this._currentFrameObjectToPointers.keys());
    // Filter preserves z order
    let lastMovePerPointer: Map<number, PointerEvent>;
    let lastUpPerPointer: Map<number, PointerEvent>;
    let lastDownPerPointer: Map<number, PointerEvent>;
    // Dispatch events in proxy z order
    for (let i = 0; i < sortedObjects.length; i++) {
      const object = sortedObjects[i];
      const proxy = this._getProxy(object);
      if (hasNestedEvents(object)) {
        object._dispatchPointerEvents(receiver);
      }
      if (lastFrameEntities.has(proxy) || currentFrameEntities.has(proxy)) {
        lastDownPerPointer = this._processDownAndEmit(receiver, proxy);

        lastUpPerPointer = this._processUpAndEmit(receiver, proxy);

        lastMovePerPointer = this._processMoveAndEmit(receiver, proxy);

        const lastUpDownMoveEvents = [...lastMovePerPointer.values(), ...lastDownPerPointer.values(), ...lastUpPerPointer.values()];
        this._processEnterLeaveAndEmit(receiver, proxy, lastUpDownMoveEvents);

        this._processCancelAndEmit(receiver, proxy);

        this._processWheelAndEmit(receiver, proxy);
      }
    }
  }

  /**
   * Given the tracked objects, update pointer containment given the provided contains()
   * @param receiver
   * @param objects
   */
  public processPointerToObject(receiver: PointerEventReceiver, objects: TObject[]) {
    // Pre-process find entities under pointers
    for (let objectIndex = 0; objectIndex < objects.length; objectIndex++) {
      const object = objects[objectIndex];
      const proxy = this._getProxy(object);
      if (hasNestedEvents(object)) {
        object._processPointerToObject(receiver);
      }
      for (const [pointerId, pos] of receiver.currentFramePointerCoords.entries()) {
        if (proxy.contains(pos)) {
          this._addPointerToProxy(proxy, pointerId);
        }
      }
    }
  }

  /**
   * Clear current frames pointer-object associations and track last frame pointer-object associations
   */
  public clear() {
    this._lastFrameObjectToPointers.clear();
    this._lastFrameObjectToPointers = new Map<PointerTargetObjectProxy<any>, number[]>(this._currentFrameObjectToPointers);
    this._currentFrameObjectToPointers.clear();
  }

  private _processDownAndEmit(receiver: PointerEventReceiver, object: PointerTargetObjectProxy<any>): Map<number, PointerEvent> {
    const lastDownPerPointer = new Map<number, PointerEvent>();
    // Loop through down and dispatch to entities
    for (const event of receiver.currentFrameDown) {
      if (event.active && this._objectCurrentlyUnderPointer(object, event.pointerId)) {
        object.events.emit('pointerdown', event as any);
        if (receiver.isDragStart(event.pointerId)) {
          object.events.emit('pointerdragstart', event as any);
        }
      }
      lastDownPerPointer.set(event.pointerId, event);
    }
    return lastDownPerPointer;
  }

  private _processUpAndEmit(receiver: PointerEventReceiver, object: PointerTargetObjectProxy<any>): Map<number, PointerEvent> {
    const lastUpPerPointer = new Map<number, PointerEvent>();
    // Loop through up and dispatch to entities
    for (const event of receiver.currentFrameUp) {
      if (event.active && this._objectCurrentlyUnderPointer(object, event.pointerId)) {
        object.events.emit('pointerup', event as any);
        if (receiver.isDragEnd(event.pointerId)) {
          object.events.emit('pointerdragend', event as any);
        }
      }
      lastUpPerPointer.set(event.pointerId, event);
    }
    return lastUpPerPointer;
  }

  private _processMoveAndEmit(receiver: PointerEventReceiver, object: PointerTargetObjectProxy<any>): Map<number, PointerEvent> {
    const lastMovePerPointer = new Map<number, PointerEvent>();
    // Loop through move and dispatch to entities
    for (const event of receiver.currentFrameMove) {
      if (event.active && object.active() && this._objectCurrentlyUnderPointer(object, event.pointerId)) {
        // move
        object.events.emit('pointermove', event as any);

        if (receiver.isDragging(event.pointerId)) {
          object.events.emit('pointerdragmove', event as any);
        }
      }
      lastMovePerPointer.set(event.pointerId, event);
    }
    return lastMovePerPointer;
  }

  private _processEnterLeaveAndEmit(
    receiver: PointerEventReceiver,
    object: PointerTargetObjectProxy<any>,
    lastUpDownMoveEvents: PointerEvent[]
  ) {
    // up, down, and move are considered for enter and leave
    for (const event of lastUpDownMoveEvents) {
      // enter
      if (event.active && object.active() && this._entered(object, event.pointerId)) {
        object.events.emit('pointerenter', event as any);
        if (receiver.isDragging(event.pointerId)) {
          object.events.emit('pointerdragenter', event as any);
        }
        break;
      }
      if (
        event.active &&
        object.active() &&
        // leave can happen on move
        (this._left(object, event.pointerId) ||
          // or leave can happen on pointer up
          (this._objectCurrentlyUnderPointer(object, event.pointerId) && event.type === 'up'))
      ) {
        object.events.emit('pointerleave', event as any);
        if (receiver.isDragging(event.pointerId)) {
          object.events.emit('pointerdragleave', event as any);
        }
        break;
      }
    }
  }

  private _processCancelAndEmit(receiver: PointerEventReceiver, object: PointerTargetObjectProxy<any>) {
    // cancel
    for (const event of receiver.currentFrameCancel) {
      if (event.active && object.active() && this._objectCurrentlyUnderPointer(object, event.pointerId)) {
        object.events.emit('pointercancel', event as any);
      }
    }
  }

  private _processWheelAndEmit(receiver: PointerEventReceiver, object: PointerTargetObjectProxy<any>) {
    // wheel
    for (const event of receiver.currentFrameWheel) {
      // Currently the wheel only fires under the primary pointer '0'
      if (event.active && object.active() && this._objectCurrentlyUnderPointer(object, 0)) {
        object.events.emit('pointerwheel', event as any);
      }
    }
  }
}
