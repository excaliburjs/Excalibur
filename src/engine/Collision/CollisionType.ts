/**
 * An enum that describes the types of collisions actors can participate in
 */
export enum CollisionType {
  /**
   * Actors with the `PreventCollision` setting do not participate in any
   * collisions and do not raise collision events.
   */
  PreventCollision,
  /**
   * Actors with the `Passive` setting only raise collision events, but are not
   * influenced or moved by other actors and do not influence or move other actors.
   */
  Passive,
  /**
   * Actors with the `Active` setting raise collision events and participate
   * in collisions with other actors and will be push or moved by actors sharing
   * the `Active` or `Fixed` setting.
   */
  Active,
  /**
   * Actors with the `Fixed` setting raise collision events and participate in
   * collisions with other actors. Actors with the `Fixed` setting will not be
   * pushed or moved by other actors sharing the `Fixed`. Think of Fixed
   * actors as "immovable/onstoppable" objects. If two `Fixed` actors meet they will
   * not be pushed or moved by each other, they will not interact except to throw
   * collision events.
   */
  Fixed
}
