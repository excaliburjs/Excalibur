import { AffineMatrix } from '../../math/affine-matrix';
import { RentalPool } from '../../util/rental-pool';

export class TransformStack {
  private _pool = new RentalPool(
    () => AffineMatrix.identity(),
    (mat) => mat.reset(),
    100
  );
  private _transforms: AffineMatrix[] = [];

  private _currentTransform: AffineMatrix = this._pool.rent(true);

  public save(): void {
    this._transforms.push(this._currentTransform);
    this._currentTransform = this._currentTransform.clone(this._pool.rent());
  }

  public restore(): void {
    this._pool.return(this._currentTransform);
    this._currentTransform = this._transforms.pop()!;
  }

  public translate(x: number, y: number): AffineMatrix {
    return this._currentTransform.translate(x, y);
  }

  public rotate(angle: number): AffineMatrix {
    return this._currentTransform.rotate(angle);
  }

  public scale(x: number, y: number): AffineMatrix {
    return this._currentTransform.scale(x, y);
  }

  public reset(): void {
    this._currentTransform.reset();
  }

  public set current(matrix: AffineMatrix) {
    this._currentTransform = matrix;
  }

  public get current(): AffineMatrix {
    return this._currentTransform;
  }
}
