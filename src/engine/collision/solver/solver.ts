import type { CollisionContact } from '../detection/collision-contact';

/**
 * A collision solver figures out how to position colliders such that they are no longer overlapping
 *
 * Solvers are executed in the order
 *
 * 1. preSolve
 * 2. solveVelocity
 * 3. solvePosition
 * 4. postSolve
 */
export interface CollisionSolver {

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
  solve(contacts: CollisionContact[], duration?: number): CollisionContact[];
}
