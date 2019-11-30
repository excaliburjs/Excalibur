import { Actor } from '../Actor';
import { Vector } from '../Algebra';
import { Class } from '../Class';
import * as Actors from '../Util/Actors';
import { removeItemFromArray } from '../Util/Util';
import { PointerEvent } from './PointerEvents';

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
    if (!this.isActorUnderPointer(actor)) {
      this._actorsUnderPointer[actor.id] = actor;
      this._actorsUnderPointer.length += 1;
      this._actors.push(actor);
    }

    // Actors under the pointer are sorted by z, ties are broken by id
    this._actors.sort((a, b) => {
      if (a.z === b.z) {
        return a.id - b.id;
      }
      return a.z - b.z;
    });
  }

  /**
   * Removes an Actor from actorsUnderPointer object.
   * @param actor An Actor to be removed;
   */
  public removeActorUnderPointer(actor: Actor): void {
    if (this.isActorUnderPointer(actor)) {
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
      return self.indexOf(actor) === i;
    });
  }

  /**
   * Checks if Pointer has a specific Actor under.
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
    return this._actorsLastFrame.indexOf(actor) > -1; // || !!this._actorsUnderPointerLastFrame.hasOwnProperty(actor.id.toString());
  }

  /**
   * Checks if Pointer has a specific Actor in ActorsUnderPointer list.
   * @param actor An Actor for check;
   */
  public isActorUnderPointer(actor: Actor): boolean {
    return this._actorsUnderPointer.hasOwnProperty(actor.id.toString());
  }

  private _onPointerMove(ev: PointerEvent): void {
    this.lastPagePos = new Vector(ev.pagePos.x, ev.pagePos.y);
    this.lastScreenPos = new Vector(ev.screenPos.x, ev.screenPos.y);
    this.lastWorldPos = new Vector(ev.worldPos.x, ev.worldPos.y);
  }

  private _onPointerDown(ev: PointerEvent): void {
    this.lastPagePos = new Vector(ev.pagePos.x, ev.pagePos.y);
    this.lastScreenPos = new Vector(ev.screenPos.x, ev.screenPos.y);
    this.lastWorldPos = new Vector(ev.worldPos.x, ev.worldPos.y);
    this._isDown = true;
  }

  private _onPointerUp(): void {
    this._isDown = false;
    this.dragTarget = null;
  }
}
