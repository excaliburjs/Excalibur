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
   * @param duration length of the (sub)step in ms
   * @param substep index of the substep within the current frame, starting at 0
   * @param substepCount total number of substeps in the current frame
   */
  solve(contacts: CollisionContact[], duration?: number, substep?: number, substepCount?: number): CollisionContact[];
}
