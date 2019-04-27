/**
 * CollisionGroups indicate like members that do not collide with each other. Use [[CollisionGroupManager]] to create [[CollisionGroup]]s
 *
 * For example:
 *
 * Players have collision group A
 * Enemies have collision group B
 * Blocks have collision group C
 *
 * Players don't collide with each other, but enemies and blocks. Likewise, enemies don't collide with each other but collide
 * with players and blocks.
 *
 * This is done with bitmasking, see the following pseudo-code
 *
 * PlayerGroup = `0b001`
 * PlayerGroupMask = `0b110`
 *
 * EnemyGroup = `0b010`
 * EnemyGroupMask = `0b101`
 *
 * BlockGroup = `0b100`
 * BlockGroupMask = `0b011`
 *
 * Should Players collide? No because the bitwise mask evaluates to 0
 * `(player1.group & player2.mask) === 0`
 * `(0b001 & 0b110) === 0`
 *
 * Should Players and Enemies collide? Yes because the bitwise mask is non-zero
 * `(player1.group & enemy1.mask) === 1`
 * `(0b001 & 0b101) === 1`
 *
 * Should Players and Blocks collide? Yes because the bitwise mask is non-zero
 * `(player1.group & blocks1.mask) === 1`
 * `(0b001 & 0b011) === 1`
 */
export class CollisionGroup {
  /**
   * The `All` [[CollisionGroup]] is a special group that collides with all other groups including itself,
   * it is the default collision group on colliders.
   */
  public static All = new CollisionGroup('Collide with all groups', -1, -1);

  private _name: string;
  private _category: number;
  private _mask: number;

  /**
   * **STOP!!** It is preferred that [[CollisionGroupManager.create]] is used to create collision groups
   *  unless you know how to construct the proper bitmasks. See https://github.com/excaliburjs/Excalibur/issues/1091 for more info.
   * @param name Name of the collision group
   * @param category 32 bit category for the group, should be a unique power of 2. For example `0b001` or `0b010`
   * @param mask 32 bit mask of category, or `~category` generally. For a category of `0b001`, the mask would be `0b110`
   */
  constructor(name: string, category: number, mask: number) {
    this._name = name;
    this._category = category;
    this._mask = mask;
  }

  /**
   * Get the name of the collision group
   */
  public get name() {
    return this._name;
  }

  /**
   * Get the category of the collision group, a 32 bit number which should be a unique power of 2
   */
  public get category() {
    return this._category;
  }

  /**
   * Get the mask for this collision group
   */
  public get mask() {
    return this._mask;
  }

  /**
   * Evaluates whether 2 collision groups can collide
   * @param other  CollisionGroup
   */
  public canCollide(other: CollisionGroup): boolean {
    return (this.category & other.mask) !== 0 && (other.category & this.mask) !== 0;
  }
}
