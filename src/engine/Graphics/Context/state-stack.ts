import { Color } from '../../Color';
import { ExcaliburGraphicsContextState } from './ExcaliburGraphicsContext';

export class StateStack {
  private _states: ExcaliburGraphicsContextState[] = [];
  private _currentState: ExcaliburGraphicsContextState = this._getDefaultState();

  private _getDefaultState() {
    return {
      opacity: 1,
      z: 0,
      tint: Color.White
    };
  }

  private _cloneState() {
    return {
      opacity: this._currentState.opacity,
      z: this._currentState.z,
      tint: this._currentState.tint.clone()
    };
  }

  public save(): void {
    this._states.push(this._currentState);
    this._currentState = this._cloneState();
  }

  public restore(): void {
    this._currentState = this._states.pop();
  }

  public get current(): ExcaliburGraphicsContextState {
    return this._currentState;
  }

  public set current(val: ExcaliburGraphicsContextState) {
    this._currentState = val;
  }
}
