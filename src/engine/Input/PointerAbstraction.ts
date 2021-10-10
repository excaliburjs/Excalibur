import { Class } from "../Class";
import { Vector } from "../Math/vector";
import { ExWheelEvent } from "./ExWheelEvent";
import { ExPointerEvent } from "./ExPointerEvent";

export class PointerAbstraction extends Class {

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
    super();

    this.on('move', this._onPointerMove);
    this.on('down', this._onPointerDown);
    this.on('up', this._onPointerUp);
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


  private _onPointerMove(ev: ExPointerEvent): void {
    this.lastPagePos = new Vector(ev.pagePos.x, ev.pagePos.y);
    this.lastScreenPos = new Vector(ev.screenPos.x, ev.screenPos.y);
    this.lastWorldPos = new Vector(ev.worldPos.x, ev.worldPos.y);
  }

  private _onPointerDown(ev: ExPointerEvent): void {
    this.lastPagePos = new Vector(ev.pagePos.x, ev.pagePos.y);
    this.lastScreenPos = new Vector(ev.screenPos.x, ev.screenPos.y);
    this.lastWorldPos = new Vector(ev.worldPos.x, ev.worldPos.y);
  }

  private _onPointerUp(_ev: ExPointerEvent): void {
  }
}
