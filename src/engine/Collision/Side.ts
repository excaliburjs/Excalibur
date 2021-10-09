import { Vector } from '../Math/vector';

/**
 * An enum that describes the sides of an axis aligned box for collision
 */
export enum Side {
  None = 'None',
  Top = 'Top',
  Bottom = 'Bottom',
  Left = 'Left',
  Right = 'Right'
}

export module Side {
  /**
   * Returns the opposite side from the current
   */
  export function getOpposite(side: Side): Side {
    if (side === Side.Top) {
      return Side.Bottom;
    }
    if (side === Side.Bottom) {
      return Side.Top;
    }
    if (side === Side.Left) {
      return Side.Right;
    }
    if (side === Side.Right) {
      return Side.Left;
    }

    return Side.None;
  }

  /**
   * Given a vector, return the Side most in that direction (via dot product)
   */
  export function fromDirection(direction: Vector): Side {
    const directions = [Vector.Left, Vector.Right, Vector.Up, Vector.Down];
    const directionEnum = [Side.Left, Side.Right, Side.Top, Side.Bottom];

    let max = -Number.MAX_VALUE;
    let maxIndex = -1;
    for (let i = 0; i < directions.length; i++) {
      if (directions[i].dot(direction) > max) {
        max = directions[i].dot(direction);
        maxIndex = i;
      }
    }
    return directionEnum[maxIndex];
  }
}
