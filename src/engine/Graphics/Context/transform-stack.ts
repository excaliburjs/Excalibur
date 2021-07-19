import { Matrix } from '../../Math/matrix';

export class TransformStack {
  private _transforms: Matrix[] = [];
  private _currentTransform: Matrix = Matrix.identity();

  public save(): void {
    this._transforms.push(this._currentTransform);
    this._currentTransform = this._currentTransform.clone();
  }

  public restore(): void {
    this._currentTransform = this._transforms.pop();
  }

  public translate(x: number, y: number): Matrix {
    return this._currentTransform.translate(x, y);
  }

  public rotate(angle: number): Matrix {
    return this._currentTransform.rotate(angle);
  }

  public scale(x: number, y: number): Matrix {
    return this._currentTransform.scale(x, y);
  }

  public set current(matrix: Matrix) {
    this._currentTransform = matrix;
  }

  public get current(): Matrix {
    return this._currentTransform;
  }
}
