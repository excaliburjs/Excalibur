/**
 * A 1 dimensional projection on an axis, used to test overlaps
 */

export class Projection {
  constructor(public min: number, public max: number) {}
  public overlaps(projection: Projection): boolean {
    return this.max > projection.min && projection.max > this.min;
  }

  public getOverlap(projection: Projection): number {
    if (this.overlaps(projection)) {
      if (this.max > projection.max) {
        return projection.max - this.min;
      } else {
        return this.max - projection.min;
      }
    }
    return 0;
  }
}
