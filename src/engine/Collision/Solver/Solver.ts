import { CollisionContact } from '../Detection/CollisionContact';

/**
 * A collision solver figures out how to position colliders such that they are no longer overlapping
 *
 * Solvers are executed in the order
 *
 * 1. preSolve
 * 2. solveVelocity
 * 3. solvePosition
 * 4. postSolve
 * @inheritdoc
 */
export interface CollisionSolver {
  // /**
  //  * Pre-solve is fired on contacts before any resolution is started. It is used for any setup work before collision resolution
  //  * can proceed. Optionally contacts can be "opted out" of any collision processing by calling `contact.cancel()`
  //  * @param contacts
  //  * @inheritdoc
  //  */
  // abstract preSolve(contacts: CollisionContact[]): void;

  // /**
  //  * Post-solve is fired after all resolution is complete
  //  * @param contacts
  //  * @inheritdoc
  //  */
  // abstract postSolve(contacts: CollisionContact[]): void;

  // /**
  //  * Solve velocity adjusts the velocity of colliders so that they are not overlapping or will not be overlapping from velocity
  //  * @param contacts
  //  * @inheritdoc
  //  */
  // abstract solveVelocity(contacts: CollisionContact[]): void;

  // /**
  //  * Solve position adjust the position of colliders so that they are not overlapping
  //  * @param contacts
  //  * @inheritdoc
  //  */
  // abstract solvePosition(contacts: CollisionContact[]): void;

  /**
   * Solves overlapping contact in
   *
   * Solvers are executed in the order
   * 1. preSolve
   * 2. solveVelocity
   * 3. solvePosition
   * 4. postSolve
   * @param contacts
   */
  solve(contacts: CollisionContact[]): CollisionContact[]
}