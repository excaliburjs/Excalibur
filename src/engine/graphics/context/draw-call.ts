import { AffineMatrix } from '../../math/affine-matrix';
import { Color } from '../../color';
import type { ExcaliburGraphicsContextState } from './excalibur-graphics-context';

export class DrawCall {
  public z: number = 0;
  public priority: number = 0;
  public renderer: string = '';
  public transform: AffineMatrix = AffineMatrix.identity();
  public state: ExcaliburGraphicsContextState = {
    z: 0,
    opacity: 1,
    tint: Color.White,
    material: null
  };
  public args: any[] = new Array(10);
}
