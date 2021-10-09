import { Engine } from '../Engine';
import { Vector } from './vector';

export class GlobalCoordinates {
  public static fromPagePosition(x: number, y: number, engine: Engine): GlobalCoordinates;
  public static fromPagePosition(pos: Vector, engine: Engine): GlobalCoordinates;
  public static fromPagePosition(xOrPos: number | Vector, yOrEngine: number | Engine, engineOrUndefined?: Engine): GlobalCoordinates {
    let pageX: number;
    let pageY: number;
    let pagePos: Vector;
    let engine: Engine;

    if (arguments.length === 3) {
      pageX = <number>xOrPos;
      pageY = <number>yOrEngine;
      pagePos = new Vector(pageX, pageY);
      engine = engineOrUndefined;
    } else {
      pagePos = <Vector>xOrPos;
      pageX = pagePos.x;
      pageY = pagePos.y;
      engine = <Engine>yOrEngine;
    }

    const screenPos = engine.screen.pageToScreenCoordinates(pagePos);
    const worldPos = engine.screen.screenToWorldCoordinates(screenPos);

    return new GlobalCoordinates(worldPos, pagePos, screenPos);
  }

  constructor(public worldPos: Vector, public pagePos: Vector, public screenPos: Vector) {}
}
