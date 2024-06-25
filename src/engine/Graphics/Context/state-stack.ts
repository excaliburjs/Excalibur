import { Color } from '../../Color';
import { RentalPool } from '../../Util/RentalPool';
import { ExcaliburGraphicsContextState } from './ExcaliburGraphicsContext';
import { Material } from './material';

export class ContextState implements ExcaliburGraphicsContextState {
  opacity: number = 1;
  z: number = 0;
  tint: Color = Color.White;
  material: Material = null;
}

export class StateStack {
  private _pool = new RentalPool<ContextState>(
    () => new ContextState(),
    (s) => {
      s.opacity = 1;
      s.z = 0;
      s.tint = Color.White;
      s.material = null;
      return s;
    },
    100
  );
  public current: ExcaliburGraphicsContextState = this._pool.rent(true);
  private _states: ExcaliburGraphicsContextState[] = [];

  private _cloneState(dest: ContextState) {
    dest.opacity = this.current.opacity;
    dest.z = this.current.z;
    dest.tint = this.current.tint.clone(); // TODO remove color alloc
    dest.material = this.current.material; // TODO is this going to cause problems when cloning
    return dest;
  }

  public save(): void {
    this._states.push(this.current);
    this.current = this._cloneState(this._pool.rent());
  }

  public restore(): void {
    this._pool.return(this.current);
    this.current = this._states.pop();
  }
}
