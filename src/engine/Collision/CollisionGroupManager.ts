import { CollisionGroup } from './CollisionGroup';

export class CollisionGroupManager {
  // using bitmasking the maximum number of groups is 32, because that is the heighest 32bit integer that JS can present.
  private static _MAX_GROUPS = 32;
  private static _currentGroup = 1;
  private static _currentBit = 0b1 | 0;
  private static _groups: { [name: string]: CollisionGroup } = {};

  /**
   * Create a new named collision group
   * @param name Name for the collision group
   * @param mask Optionally provide your own 32-bit mask, if none is provide the manager will generate one
   */
  public static create(name: string, mask?: number) {
    if (this._currentGroup > this._MAX_GROUPS) {
      throw new Error('Cannot have more than 32 collision groups');
    }
    const group = new CollisionGroup(name, this._currentBit, mask !== undefined ? mask : ~this._currentBit);
    this._currentBit = (this._currentBit << 1) | 0;
    this._currentGroup++;
    this._groups[name] = group;
    return group;
  }

  public static get groups(): CollisionGroup[] {
    return Object.keys(this._groups).map((g) => this._groups[g]);
  }

  public static groupByName(name: string) {
    return this._groups[name];
  }

  /**
   * Resets the managers internal group management state
   */
  public static reset() {
    this._groups = {};
    this._currentBit = 0b1;
    this._currentGroup = 1;
  }
}
