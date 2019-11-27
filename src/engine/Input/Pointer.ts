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
  private _isDown: boolean = false;
  private _wasDown: boolean = false;

  private _actorsUnderPointer: ActorsUnderPointer = { length: 0 };
  private _actorsUnderPointerLastFrame: ActorsUnderPointer = { length: 0 };

  private _actors: Actor[] = [];

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
   * Update the state of current pointer
   */
  public update(): void {
    if (this._wasDown && !this._isDown) {
      this._wasDown = false;
    } else if (!this._wasDown && this._isDown) {
      this._wasDown = true;
    }
    this._actorsUnderPointerLastFrame = { ...this._actorsUnderPointer };

    // Actors under the pointer are sorted by z, ties are broken by id
    this._actors.sort((a, b) => {
      if (a.z === b.z) {
        return a.id - b.id;
      }
      return a.z - b.z;
    });
  }

  /**
   * Adds an Actor to actorsUnderPointer object.
   * @param actor An Actor to be added;
   */
  public addActorUnderPointer(actor: Actor): void {
    if (!this.hasActorUnderPointerInList(actor)) {
      this._actorsUnderPointer[actor.id] = actor;
      this._actorsUnderPointer.length += 1;
      this._actors.push(actor);
    }
  }

  /**
   * Removes an Actor from actorsUnderPointer object.
   * @param actor An Actor to be removed;
   */
  public removeActorUnderPointer(actor: Actor): void {
    if (this.hasActorUnderPointerInList(actor)) {
      delete this._actorsUnderPointer[actor.id];
      this._actorsUnderPointer.length -= 1;
      removeItemFromArray(actor, this._actors);
    }
  }

  /**
   * Returns an Actor from actorsUnderPointer object.
   * @param actor An Actor to be ;
   */
  public getActorsUnderPointer(): Actor[] {
    return this._actors;
  }

  /**
   * Checks if Pointer has a specific Actor under.
   * @param actor An Actor for check;
   */
  public isActorUnderPointer(actor: Actor): boolean {
    if (this.lastWorldPos) {
      return actor.contains(this.lastWorldPos.x, this.lastWorldPos.y, !Actors.isScreenElement(actor));
    }
    return false;
  }

  public wasActorUnderPointerLastFrame(actor: Actor): boolean {
    return this._actorsUnderPointerLastFrame.hasOwnProperty(actor.id.toString());
  }

  /**
   * Checks if Pointer has a specific Actor in ActorsUnderPointer list.
   * @param actor An Actor for check;
   */
  public hasActorUnderPointerInList(actor: Actor): boolean {
    return this._actorsUnderPointer.hasOwnProperty(actor.id.toString());
  }

  public captureOldActorUnderPointer() {
    this._actorsUnderPointerLastFrame = { ...this._actorsUnderPointer };
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
