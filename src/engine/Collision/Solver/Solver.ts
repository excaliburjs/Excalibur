import { CollisionContact } from "../Detection/CollisionContact";

export interface CollisionSolver {
  preSolve(contact: CollisionContact[]): void;
  postSolve(contact: CollisionContact[]): void;

  solveVelocity(contact: CollisionContact[]): void;
  solvePosition(contact: CollisionContact[]): void;
}