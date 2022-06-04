import { Color } from '../../Color';
import { Matrix } from '../../Math/matrix';
import { ExcaliburGraphicsContextState } from './ExcaliburGraphicsContext';

export class DrawCall {
  public z: number = 0;
  public priority: number = 0;
  public renderer: string;
  public transform: Matrix = Matrix.identity();
  public state: ExcaliburGraphicsContextState = {
    z: 0,
    opacity: 1,
    tint: Color.White
  };
  public args: any[];
}