module ex {

    export interface ICircleAreaOptions {
        pos?: Vector;
        radius?: number;
        body?: Body;
    }

    /**
     * This is a circle collision area for the excalibur rigid body physics simulation
     */
    export class CircleArea implements ICollisionArea {
        /**
         * This is the center position of the circle, relative to the actor position
         */
        public pos: Vector = ex.Vector.Zero.clone();
        /**
         * This is the radius of the circle
         */
        public radius: number;
        /**
         * The actor associated with this collision area
         */
        public body: Body;
        
        constructor(options: ICircleAreaOptions) {
            this.pos = options.pos || ex.Vector.Zero.clone();
            this.radius = options.radius || 0;
            this.body = options.body || null;
        }
            
        /**
         * Get the center of the collision area in world coordinates
         */            
        public getCenter(): Vector {
            if (this.body) {
                return this.pos.add(this.body.pos);
            }
            return this.pos;
        }

        /**
         * Tests if a point is contained in this collision area
         */
        public contains(point: Vector): boolean {
            var distance = this.body.pos.distance(point);
            if (distance <= this.radius) {
                return true;
            }
            return false;
        }

        /**
         * Casts a ray at the CircleArea and returns the nearest point of collision
         * @param ray 
         */
        public castRay(ray: Ray): Vector {
            throw new Error('not implemented');
        }
                
        public collide(area: ICollisionArea): CollisionContact {
            if (area instanceof CircleArea) {
                return CollisionJumpTable.CollideCircleCircle(this, area);
            } else if (area instanceof PolygonArea) {
                return CollisionJumpTable.CollideCirclePolygon(this, area);
            } else if (area instanceof EdgeArea) {
                return CollisionJumpTable.CollideCircleEdge(this, area);
            } else {
                throw new Error(`Circle could not collide with unknown ICollisionArea ${typeof area}`);
            }
        }


        /**
         * Find the point on the shape furthest in the direction specified
         */
        public getFurthestPoint(direction: Vector): Vector {
            return this.pos.add(direction.normalize().scale(this.radius));
        }

        /**
         * Get the axis aligned bounding box for the circle area
         */
        public getBounds(): BoundingBox {
            return new BoundingBox(this.pos.x + this.body.pos.x - this.radius,
                this.pos.y + this.body.pos.y - this.radius,
                this.pos.y + this.body.pos.y + this.radius,
                this.pos.x + this.body.pos.x + this.radius);
        }

        /**
         * Get axis not implemented on circles, since their are infinite axis
         */
        public getAxes(): Vector[] {
            return null;
        }

        /**
         * Returns the moment of intertia of a circle given it's mass
         * https://en.wikipedia.org/wiki/List_of_moments_of_inertia
         * @param mass
         */
        public getMomentOfInertia(): number {
           var mass = this.body ? this.body.mass : Physics.defaultMass;
           return (mass * this.radius * this.radius) / 2;
        }

        public testSeparatingAxisTheorem(polygon: PolygonArea): Vector {

            var axes = polygon.getAxes();
            var pc = polygon.getCenter();
            // Special SAT with circles
            var closestPointOnPoly = polygon.getFurthestPoint(this.pos.sub(pc));
            axes.push(this.pos.sub(closestPointOnPoly).normalize());
            
            var minOverlap = Number.MAX_VALUE;
            var minAxis = null;
            var minIndex = -1;
            for (var i = 0; i < axes.length; i++) {
                var proj1 = polygon.project(axes[i]);
                var proj2 = this.project(axes[i]);
                var overlap = proj1.overlap(proj2);
                if (overlap <= 0) {
                    return null;
                } else {
                    if (overlap < minOverlap) {
                        minOverlap = overlap;
                        minAxis = axes[i];
                        minIndex = i;
                    }
                }
            }
            if (minIndex < 0) {
                return null;
            }
            return minAxis.normalize().scale(minOverlap);
        }

        public recalc(): void {
            // circles don't cache
        }

        /**
         * Project the circle along a specified axis
         */
        public project(axis: Vector): Projection {
            var scalars = [];
            var point = this.getCenter();
            var dotProduct = point.dot(axis);
            scalars.push(dotProduct);
            scalars.push(dotProduct + this.radius);
            scalars.push(dotProduct - this.radius);
            return new Projection(Math.min.apply(Math, scalars), Math.max.apply(Math, scalars));
        }

        public debugDraw(ctx: CanvasRenderingContext2D, debugFlags: IDebugFlags) {
           var pos = this.body ? this.body.pos.add(this.pos) : this.pos;
           var rotation = this.body ? this.body.rotation : 0;
           ctx.strokeStyle = 'lime';
           ctx.beginPath();
           ctx.arc(pos.x, pos.y, this.radius, 0, Math.PI * 2);
           ctx.closePath();
           ctx.stroke();
           ctx.beginPath();
           ctx.moveTo(pos.x, pos.y);
           ctx.lineTo(Math.cos(rotation) * this.radius + pos.x, Math.sin(rotation) * this.radius + pos.y);
           ctx.closePath();
           ctx.stroke();
        }
    }
}