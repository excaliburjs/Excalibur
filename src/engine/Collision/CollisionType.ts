/**
 * An enum that describes the types of collisions bodies can participate in
 */
export enum CollisionType {
  /**
   * Bodies with the `PreventCollision` setting do not participate in any
   * collisions and do not raise collision events.
   */
  PreventCollision = 'PreventCollision',
  /**
   * Bodies with the `Passive` setting only raise collision events, but are not
   * influenced or moved by other bodies and do not influence or move other bodies.
   * This is useful for use in trigger type behavior.
   */
  Passive = 'Passive',
  /**
   * Bodies with the `Active` setting raise collision events and participate
   * in collisions with other bodies and will be push or moved by bodies sharing
   * the `Active` or `Fixed` setting.
   */
  Active = 'Active',
  /**
   * Bodies with the `Fixed` setting raise collision events and participate in
   * collisions with other bodies. Actors with the `Fixed` setting will not be
   * pushed or moved by other bodies sharing the `Fixed`. Think of Fixed
   * bodies as "immovable/unstoppable" objects. If two `Fixed` bodies meet they will
   * not be pushed or moved by each other, they will not interact except to throw
   * collision events.
   */
  Fixed = 'Fixed'
}
