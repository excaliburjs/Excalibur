module ex {
    export interface IPolygonAreaOptions {
        pos?: Vector;
        points?: Vector[];
        clockwiseWinding?: boolean;
        actor?: Actor;
    }

    export class PolygonArea implements ICollisionArea {
        public pos: Vector;
        public points: Vector[];
        public actor: Actor;
        
        constructor(options: IPolygonAreaOptions) {
            this.pos = options.pos || Vector.Zero.clone();
            var winding = !!options.clockwiseWinding;
            this.points = (winding ? options.points.reverse() : options.points) || [];
            this.actor = options.actor || null;
        }

        /**
         * Get the center of the collision area in world coordinates
         */
        public getCenter(): Vector {
            if (this.actor) {
                return this.actor.pos.add(this.pos);
            }
            return this.pos;
        }

        /**
         * Gets the points that make up the polygon in world space
         */
        public getTransformedPoints(): Vector[] {
            return this.points.map((p: Vector) => {
                return (this.actor ? p.add(this.actor.pos) : p);
            });
        }

        /**
         * Gets the sides of the polygon
         */
        public getSides(): Line[] {
            var lines = [];
            var points = this.getTransformedPoints();
            var len = points.length;
            for (var i = 0; i < len; i++) {
                lines.push(new Line(points[i], points[(i - 1 + len) % len]));
            }
            return lines;
        }

        /**
         * Tests if a point is contained in this collision area
         */
        public contains(point: Vector): boolean {
            // Always cast to the right, as long as we cast in a consitent fixed direction we
            // will be fine
            var testRay = new Ray(point, new Vector(1, 0));
            var intersectCount = this.getSides().reduce(function (accum, side, i, arr) {
                if (testRay.intersect(side) >= 0) {
                    return accum + 1;
                }
                return accum;
            }, 0);


            if (intersectCount % 2 === 0) {
                return false;
            }
            return true;
        }

        /**
         * Find the point on the shape furthest in the direction specified
         */
        public getFurthestPoint(direction: Vector): Vector {
            var pts = this.getTransformedPoints();
            var furthestPoint = null;
            var maxDistance = -Number.MAX_VALUE;
            for (var i = 0; i < pts.length; i++) {
                var distance = direction.dot(pts[i]);
                if (distance > maxDistance) {
                    maxDistance = distance;
                    furthestPoint = pts[i];
                }
            }
            return furthestPoint;
        }

        /**
         * Get the axis aligned bounding box for the circle area
         */
        public getBounds(): BoundingBox {
            var points = this.getTransformedPoints();

            var minX = points.reduce(function (prev, curr) {
                return Math.min(prev, curr.x);
            }, Number.MAX_VALUE);
            var maxX = points.reduce(function (prev, curr) {
                return Math.max(prev, curr.x);
            }, -Number.MAX_VALUE);

            var minY = points.reduce(function (prev, curr) {
                return Math.min(prev, curr.y);
            }, Number.MAX_VALUE);
            var maxY = points.reduce(function (prev, curr) {
                return Math.max(prev, curr.y);
            }, -Number.MAX_VALUE);

            return new BoundingBox(minX, minY, maxY, maxX);
        }

        /**
         * Get the axis associated with the edge
         */
        public getAxis(): Vector[] {
            var axes = [];
            var points = this.getTransformedPoints();
            var len = points.length;
            for (var i = 0; i < len; i++) {
                axes.push(points[i].sub(points[(i + 1) % len]).normal());
            }
            return axes;
        }

        /**
         * Project the edge along a specified axis
         */
        public project(axis: Vector): Projection {
            var scalars = [];

            var points = this.getTransformedPoints();
            var len = points.length;
            for (var i = 0; i < len; i++) {
                scalars.push(points[i].dot(axis));
            }

            return new Projection(Math.min.apply(Math, scalars), Math.max.apply(Math, scalars));
        }
    }
}