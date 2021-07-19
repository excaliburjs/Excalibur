import { Actor } from '../Actor';
import { Vector } from '../Algebra';
import { Class } from '../Class';
import * as Actors from '../Util/Actors';
import { removeItemFromArray } from '../Util/Util';
import { PointerMoveEvent, PointerDownEvent, PointerUpEvent, WheelEvent } from './PointerEvents';

export interface ActorsUnderPointer {
  [ActorId: number]: Actor;
  length: number;
}

/**
 * The type of pointer for a [[PointerEvent]].
 */
export enum PointerType {
  Touch = 'Touch',
  Mouse = 'Mouse',
  Pen = 'Pen',
  Unknown = 'Unknown'
}

/**
 * Determines the scope of handling mouse/touch events. See [[Pointers]] for more information.
 */
export enum PointerScope {
  /**
   * Handle events on the `canvas` element only. Events originating outside the
   * `canvas` will not be handled.
   */
  Canvas = 'Canvas',

  /**
   * Handles events on the entire document. All events will be handled by Excalibur.
   */
  Document = 'Document'
}

/**
 * Captures and dispatches PointerEvents
 */
export class Pointer extends Class {
  private static _MAX_ID = 0;
  public readonly id = Pointer._MAX_ID++;
  private _isDown: boolean = false;
  private _wasDown: boolean = false;

  private _actorsUnderPointer: ActorsUnderPointer = { length: 0 };

  private _actors: Actor[] = [];
  private _actorsLastFrame: Actor[] = [];
  private _actorsNoLongerUnderPointer: Actor[] = [];

  private _actorSortingFcn = (a: Actor, b: Actor) => {
    if (a.z === b.z) {
      return b.id - a.id;
    }
    return b.z - a.z;
  };

  /**
   * Whether the Pointer is currently dragging.
   */
  public get isDragging(): boolean {
    return this._isDown;
  }

  /**
   * Whether the Pointer just started dragging.
   */
  public get isDragStart(): boolean {
    return !this._wasDown && this._isDown;
  }

  /**
   * Whether the Pointer just ended dragging.
   */
  public get isDragEnd(): boolean {
    return this._wasDown && !this._isDown;
  }

  /**
   * Returns true if pointer has any actors under
   */
  public get hasActorsUnderPointer(): boolean {
    return !!this._actorsUnderPointer.length;
  }

  /**
   * The last position on the document this pointer was at. Can be `null` if pointer was never active.
   */
  public lastPagePos: Vector = null;

  /**
   * The last position on the screen this pointer was at. Can be `null` if pointer was never active.
   */
  public lastScreenPos: Vector = null;

  /**
   * The last position in the game world coordinates this pointer was at. Can be `null` if pointer was never active.
   */
  public lastWorldPos: Vector = null;

  /**
   * Returns the currently dragging target or null if it isn't exist
   */
  public dragTarget: Actor = null;

  constructor() {
    super();

    this.on('move', this._onPointerMove);
    this.on('down', this._onPointerDown);
    this.on('up', this._onPointerUp);
  }

  on(event: 'move', handler: (event: PointerMoveEvent) => void): void;
  on(event: 'down', handler: (event: PointerDownEvent) => void): void;
  on(event: 'up', handler: (event: PointerUpEvent) => void): void;
  on(event: 'wheel', handler: (event: WheelEvent) => void): void;
  on(event: string, handler: (event: any) => void): void {
    super.on(event, handler);
  }

  once(event: 'move', handler: (event: PointerMoveEvent) => void): void;
  once(event: 'down', handler: (event: PointerDownEvent) => void): void;
  once(event: 'up', handler: (event: PointerUpEvent) => void): void;
  once(event: 'wheel', handler: (event: WheelEvent) => void): void;
  once(event: string, handler: (event: any) => void): void {
    super.once(event, handler);
  }

  off(event: 'move', handler?: (event: PointerMoveEvent) => void): void;
  off(event: 'down', handler?: (event: PointerDownEvent) => void): void;
  off(event: 'up', handler?: (event: PointerUpEvent) => void): void;
  off(event: 'wheel', handler?: (event: WheelEvent) => void): void;
  off(event: string, handler?: (event: any) => void): void {
    super.off(event, handler);
  }

  /**
   * Update the state of current pointer, meant to be called a the end of frame
   */
  public update(): void {
    if (this._wasDown && !this._isDown) {
      this._wasDown = false;
    } else if (!this._wasDown && this._isDown) {
      this._wasDown = true;
    }
    this._actorsLastFrame = [...this._actors];
    this._actorsNoLongerUnderPointer = [];
  }

  /**
   * Adds an Actor to actorsUnderPointer object.
   * @param actor An Actor to be added;
   */
  public addActorUnderPointer(actor: Actor): void {
    if (!this.isActorAliveUnderPointer(actor)) {
      this._actorsUnderPointer[actor.id] = actor;
      this._actorsUnderPointer.length += 1;
      this._actors.push(actor);
    }

    // Actors are processed in z-order highest z to lowest
    // ties are broken by id highest id (newest) to lowest id (oldest)
    this._actors.sort(this._actorSortingFcn);
  }

  /**
   * Removes an Actor from actorsUnderPointer object.
   * @param actor An Actor to be removed;
   */
  public removeActorUnderPointer(actor: Actor): void {
    if (this.isActorAliveUnderPointer(actor)) {
      delete this._actorsUnderPointer[actor.id];
      this._actorsUnderPointer.length -= 1;
      removeItemFromArray(actor, this._actors);
      this._actorsNoLongerUnderPointer.push(actor);
    }
  }

  /**
   * Returns all actors under this pointer this frame
   */
  public getActorsUnderPointer(): Actor[] {
    return this._actors;
  }

  /**
   * Returns all actors that are no longer under the pointer this frame
   */
  public getActorsUnderPointerLastFrame(): Actor[] {
    return this._actorsLastFrame;
  }

  /**
   * Returns all actors relevant for events to pointer this frame
   */
  public getActorsForEvents(): Actor[] {
    return this._actors.concat(this._actorsLastFrame).filter((actor, i, self) => {
      return self.indexOf(actor) === i; // de-dup
    }).sort(this._actorSortingFcn); // sort by z
  }

  /**
   * Checks if Pointer location has a specific Actor bounds contained underneath.
   * @param actor An Actor for check;
   */
  public checkActorUnderPointer(actor: Actor): boolean {
    if (this.lastWorldPos) {
      return actor.contains(this.lastWorldPos.x, this.lastWorldPos.y, !Actors.isScreenElement(actor));
    }
    return false;
  }

  /**
   * Checks if an actor was under the pointer last frame
   * @param actor
   */
  public wasActorUnderPointer(actor: Actor): boolean {
    return this._actorsLastFrame.indexOf(actor) > -1;
  }

  /**
   * Checks if Pointer has a specific Actor in ActorsUnderPointer list.
   * @param actor An Actor for check;
   */
  public isActorAliveUnderPointer(actor: Actor): boolean {
    return !!(!actor.isKilled() && actor.scene && this._actorsUnderPointer.hasOwnProperty(actor.id.toString()));
  }

  private _onPointerMove(ev: PointerMoveEvent): void {
    this.lastPagePos = new Vector(ev.pagePos.x, ev.pagePos.y);
    this.lastScreenPos = new Vector(ev.screenPos.x, ev.screenPos.y);
    this.lastWorldPos = new Vector(ev.worldPos.x, ev.worldPos.y);
  }

  private _onPointerDown(ev: PointerDownEvent): void {
    this.lastPagePos = new Vector(ev.pagePos.x, ev.pagePos.y);
    this.lastScreenPos = new Vector(ev.screenPos.x, ev.screenPos.y);
    this.lastWorldPos = new Vector(ev.worldPos.x, ev.worldPos.y);
    this._isDown = true;
  }

  private _onPointerUp(_ev: PointerUpEvent): void {
    this._isDown = false;
    this.dragTarget = null;
  }
}
