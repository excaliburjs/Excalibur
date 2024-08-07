import { Vector, vec } from "./excalibur";

export class Anchor {
  /**
   * get TopLeft Anchor Vector
   */
  public static get TopLeft(): Vector {
    return vec(0, 0)
  }
  /**
   * get TopCenter Anchor Vector
   */
  public static get TopCenter(): Vector {
    return vec(0.5, 0)
  }
  /**
   * get TopRight Anchor Vector
   */
  public static get TopRight(): Vector {
    return vec(1, 0)
  }
  /**
   * get LeftCenter Anchor Vector
   */
  public static get LeftCenter(): Vector {
    return vec(0, 0.5)
  }
  /**
   * get Center Anchor Vector
   */
  public static get Center(): Vector {
    return vec(0.5, 0.5)
  }
   /**
   * get RightCenter Anchor Vector
   */
  public static get RightCenter(): Vector {
    return vec(1, 0.5)
  }
  /**
   * get BottomLeft Anchor Vector
   */
  public static get BottomLeft(): Vector {
    return vec(0, 1)
  }
  /**
   * get BottomCenter Anchor Vector
   */
  public static get BottomCenter(): Vector {
    return vec(0.5, 1)
  }
  /**
   * get BottomRight Anchor Vector
   */
  public static get BottomRight(): Vector {
    return vec(1, 1)
  }
}