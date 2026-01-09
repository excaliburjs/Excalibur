/**
 * Possible collision resolution strategies
 *
 * The default is {@apilink SolverStrategy.Arcade} which performs simple axis aligned arcade style physics. This is useful for things
 * like platformers or top down games.
 *
 * More advanced rigid body physics are enabled by setting {@apilink SolverStrategy.Realistic} which allows for complicated
 * simulated physical interactions.
 */
export enum SpatialPartitionStrategy {
  DynamicTree = 'dynamic-tree',
  SparseHashGrid = 'sparse-hash-grid'
}
