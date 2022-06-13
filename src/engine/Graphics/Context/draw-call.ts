import { AffineMatrix } from '../../Math/affine-matrix';
import { Color } from '../../Color';
import { ExcaliburGraphicsContextState } from './ExcaliburGraphicsContext';

export class DrawCall {
  public z: number = 0;
  public priority: number = 0;
  public renderer: string;
  public transform: AffineMatrix = AffineMatrix.identity();
  public state: ExcaliburGraphicsContextState = {
    z: 0,
    opacity: 1,
    tint: Color.White
  };
  public args: any[];
}