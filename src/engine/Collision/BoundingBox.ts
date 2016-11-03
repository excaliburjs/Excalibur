/// <reference path="../Algebra.ts" />

module ex {

    /**
     * Interface all collidable objects must implement
     */
    export interface ICollidable {
        /** 
         * Test whether this bounding box collides with another one.
         *
         * @param collidable  Other collidable to test
         * @returns Vector The intersection vector that can be used to resolve the collision. 
         * If there is no collision, `null` is returned.
         */
        collides(collidable: ICollidable): Vector;
        /**
         * Tests wether a point is contained within the collidable
         * @param point  The point to test
         */
        contains(point: Vector): boolean;

        debugDraw(ctx: CanvasRenderingContext2D): void;

    }

    /**
     * Axis Aligned collision primitive for Excalibur. 
     */
    export class BoundingBox implements ICollidable {

        /**
         * @param left    x coordinate of the left edge
         * @param top     y coordinate of the top edge
         * @param right   x coordinate of the right edge
         * @param bottom  y coordinate of the bottom edge
         */
        constructor(public left: number = 0, public top: number = 0, public right: number = 0, public bottom: number = 0) { }
        /**
         * Returns the calculated width of the bounding box
         */
        public getWidth() {
            return this.right - this.left;
        }

        /**
         * Returns the calculated height of the bounding box
         */
        public getHeight() {
            return this.bottom - this.top;
        }

        /**
         * Returns the perimeter of the bounding box
         */
        public getPerimeter(): number {
            var wx = this.getWidth();
            var wy = this.getHeight();
            return 2 * (wx + wy);
        }

        public getPoints(): Vector[] {
            var results = [];
            results.push(new Vector(this.left, this.top));
            results.push(new Vector(this.right, this.top));
            results.push(new Vector(this.right, this.bottom));
            results.push(new Vector(this.left, this.bottom));
            return results;
        }

        /**
         * Creates a Polygon collision area from the points of the bounding box
         */
        public toPolygon(actor?: Actor): PolygonArea {
            return new PolygonArea({
                body: actor ? actor.body : null,
                points: this.getPoints(),
                pos: Vector.Zero.clone()
            });
        }

        /**
         * Tests whether a point is contained within the bounding box
         * @param p  The point to test
         */
        public contains(p: Vector): boolean;

        /**
         * Tests whether another bounding box is totally contained in this one
         * @param bb  The bounding box to test
         */
        public contains(bb: BoundingBox): boolean;
        public contains(val: any): boolean {
            if (val instanceof Vector) {
                return (this.left <= val.x && this.top <= val.y && this.bottom >= val.y && this.right >= val.x);
            } else if (val instanceof BoundingBox) {
                if (this.left < val.left &&
                    this.top < val.top &&
                    val.bottom < this.bottom &&
                    val.right < this.right) {
                    return true;
                }
                return false;
            }
            return false;
        }

        /**
         * Combines this bounding box and another together returning a new bounding box
         * @param other  The bounding box to combine
         */
        public combine(other: BoundingBox): BoundingBox {
            var compositeBB = new BoundingBox(Math.min(this.left, other.left),
                Math.min(this.top, other.top),
                Math.max(this.right, other.right),
                Math.max(this.bottom, other.bottom));
            return compositeBB;
        }

        /** 
         * Test wether this bounding box collides with another returning,
         * the intersection vector that can be used to resolve the collision. If there
         * is no collision null is returned.
         * @param collidable  Other collidable to test
         */
        public collides(collidable: ICollidable): Vector {
            if (collidable instanceof BoundingBox) {
                var other: BoundingBox = <BoundingBox>collidable;
                var totalBoundingBox = this.combine(other);

                // If the total bounding box is less than the sum of the 2 bounds then there is collision
                if (totalBoundingBox.getWidth() < other.getWidth() + this.getWidth() &&
                    totalBoundingBox.getHeight() < other.getHeight() + this.getHeight()) {
                    // collision
                    var overlapX = 0;
                    if (this.right >= other.left && this.right <= other.right) {
                        overlapX = other.left - this.right;
                    } else {
                        overlapX = other.right - this.left;
                    }

                    var overlapY = 0;
                    if (this.top <= other.bottom && this.top >= other.top) {
                        overlapY = other.bottom - this.top;
                    } else {
                        overlapY = other.top - this.bottom;
                    }

                    if (Math.abs(overlapX) < Math.abs(overlapY)) {
                        return new Vector(overlapX, 0);
                    } else {
                        return new Vector(0, overlapY);
                    }
                } else {
                    return null;
                }

            }

            return null;
        }
        
        /* istanbul ignore next */
        public debugDraw(ctx: CanvasRenderingContext2D, color: Color = Color.Yellow) {
           ctx.strokeStyle = color.toString();
           ctx.strokeRect(this.left, this.top, this.getWidth(), this.getHeight());
        }
    }
}