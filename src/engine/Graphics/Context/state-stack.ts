import { Color } from '../../Color';
import { ExcaliburGraphicsContextState } from './ExcaliburGraphicsContext';
import { Material } from './material';

export class StateStack {
  public current: ExcaliburGraphicsContextState = this._getDefaultState();
  private _states: ExcaliburGraphicsContextState[] = [];

  private _getDefaultState() {
    return {
      opacity: 1,
      z: 0,
      tint: Color.White,
      material: null as Material
    };
  }

  private _cloneState() {
    return {
      opacity: this.current.opacity,
      z: this.current.z,
      tint: this.current.tint.clone(),
      material: this.current.material // TODO is this going to cause problems when cloning
    };
  }

  public save(): void {
    this._states.push(this.current);
    this.current = this._cloneState();
  }

  public restore(): void {
    this.current = this._states.pop();
  }
}
