import { Matrix } from "../../excalibur";
import { ExcaliburGraphicsContextState } from "./ExcaliburGraphicsContext";

export class DrawCall {
  public z: number = 0;
  public priority: number = 0;
  public renderer: string;
  public transform: Matrix;
  public state: ExcaliburGraphicsContextState;
  public args: any[];
}