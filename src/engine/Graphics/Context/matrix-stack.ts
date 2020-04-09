import { Matrix } from '../../Math/matrix';

export class MatrixStack {
  private _transforms: Matrix[] = [];
  private _currentTransform: Matrix = Matrix.identity();

  public save(): void {
    this._transforms.push(this._currentTransform);
  }

  public restore(): void {
    this._currentTransform = this._transforms.pop();
  }

  public translate(x: number, y: number): Matrix {
    return (this._currentTransform = this._currentTransform.multm(Matrix.translation(x, y)));
  }

  public rotate(angle: number): Matrix {
    return (this._currentTransform = this._currentTransform.multm(Matrix.rotation(angle)));
  }

  public scale(x: number, y: number): Matrix {
    return (this._currentTransform = this._currentTransform.multm(Matrix.scale(x, y)));
  }

  public set transform(matrix: Matrix) {
    this._currentTransform = matrix;
  }

  public get transform(): Matrix {
    return this._currentTransform;
  }
}
