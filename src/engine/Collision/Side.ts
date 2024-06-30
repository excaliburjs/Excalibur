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
   * Given a vector, return the Side most in that direction
   */
  export function fromDirection(direction: Vector): Side {
    if (Math.abs(direction.x) >= Math.abs(direction.y)) {
      if (direction.x <= 0) {
        return Side.Left;
      }

      return Side.Right;
    }

    if (direction.y <= 0) {
      return Side.Top;
    }

    return Side.Bottom;
  }
}
