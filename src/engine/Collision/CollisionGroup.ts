/**
 * CollisionGroups indicate like members that do not collide with each other. Use [[CollisionGroupManager]] to create [[CollisionGroups]]
 *
 * For example:
 *
 * Players have collision group A
 * Enemies have collision group B
 * Blocks have collision group C
 *
 * Players don't collide with each other, but enemies and blocks. Likewise, enemies don't collide with each other but collide
 * with players and blocks.
 */
export class CollisionGroup {
  public static All = new CollisionGroup('Collide with all groups', -1, -1);

  private _name: string;
  private _category: number;
  private _mask: number;

  constructor(name: string, category: number, mask: number) {
    this._name = name;
    this._category = category;
    this._mask = mask;
  }

  public get name() {
    return this._name;
  }

  public get category() {
    return this._category;
  }

  public get mask() {
    return this._mask;
  }

  public shouldCollide(other: CollisionGroup): boolean {
    return (this.category & other.mask) !== 0 && (other.category & this.mask) !== 0;
  }
}
