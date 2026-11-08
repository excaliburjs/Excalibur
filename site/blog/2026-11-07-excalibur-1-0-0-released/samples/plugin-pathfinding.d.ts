// Type stub for the pathfinding plugin imported by URL in astar.ts. The playground resolves the
// plugin's own `import { TileMap } from 'excalibur'` through its import map, this file only
// exists so `npm run typecheck:samples` knows the shape of what comes back.
declare module 'https://unpkg.com/@excaliburjs/plugin-pathfinding@0.32.0/dist/excalibur-pathfinding.js' {
  import type { TileMap } from 'excalibur';

  export interface AStarNode {
    id: number;
    x: number;
    y: number;
    collider: boolean;
    gCost: number;
    hCost: number;
    fCost: number;
    parent: AStarNode | null;
  }

  export interface GridInput {
    cols: number;
    rows: number;
    tiles: { collider: boolean }[];
  }

  export class ExcaliburAStar {
    constructor(grid: TileMap | GridInput);
    /** Milliseconds the last search took */
    duration: number;
    astar(start: AStarNode, end: AStarNode, diagonal?: boolean): AStarNode[];
    getNodeByCoord(x: number, y: number): AStarNode;
    getNodeByIndex(index: number): AStarNode;
    resetGrid(): void;
  }
}
