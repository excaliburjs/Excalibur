import { CollisionGroup } from './CollisionGroup';

/**
 * Static class for managing collision groups in excalibur, there is a maximum of 32 collision groups possible in excalibur
 */
export class CollisionGroupManager {
  // using bitmasking the maximum number of groups is 32, because that is the highest 32bit integer that JS can present.
  private static _STARTING_BIT = 0b1 | 0;
  private static _MAX_GROUPS = 32;
  private static _CURRENT_GROUP = 1;
  private static _CURRENT_BIT = CollisionGroupManager._STARTING_BIT;
  private static _GROUPS: Map<string, CollisionGroup> = new Map<string, CollisionGroup>();

  /**
   * Create a new named collision group up to a max of 32.
   * @param name Name for the collision group
   * @param mask Optionally provide your own 32-bit mask, if none is provide the manager will generate one
   */
  public static create(name: string, mask?: number) {
    if (this._CURRENT_GROUP > this._MAX_GROUPS) {
      throw new Error(`Cannot have more than ${this._MAX_GROUPS} collision groups`);
    }
    if (this._GROUPS.get(name)) {
      throw new Error(`Collision group ${name} already exists`);
    }
    const group = new CollisionGroup(name, this._CURRENT_BIT, mask !== undefined ? mask : ~this._CURRENT_BIT);
    this._CURRENT_BIT = (this._CURRENT_BIT << 1) | 0;
    this._CURRENT_GROUP++;
    this._GROUPS.set(name, group);
    return group;
  }

  /**
   * Get all collision groups currently tracked by excalibur
   */
  public static get groups(): CollisionGroup[] {
    return Array.from(this._GROUPS.values());
  }

  /**
   * Get a collision group by it's name
   * @param name
   */
  public static groupByName(name: string) {
    return this._GROUPS.get(name);
  }

  /**
   * Resets the managers internal group management state
   */
  public static reset() {
    this._GROUPS = new Map<string, CollisionGroup>();
    this._CURRENT_BIT = this._STARTING_BIT;
    this._CURRENT_GROUP = 1;
  }
}
