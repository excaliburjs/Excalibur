module ex {

    export interface ICircleAreaOptions {
        pos?: Vector;
        radius?: number;
        actor?: Actor;
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
        public actor: Actor;
        
        contructor(options: ICircleAreaOptions) {
            this.pos = options.pos || ex.Vector.Zero.clone();
            this.radius = options.radius || 0;
            this.actor = options.actor || null;
        }
            
        /**
         * Get the center of the collision area in world coordinates
         */            
        public getCenter(): Vector {
            if (this.actor) {
                return this.pos.add(this.actor.pos);
            }
            return this.pos;
        }

        /**
         * Tests if a point is contained in this collision area
         */
        public contains(point: Vector): boolean {
            var distance = this.pos.distance(point);
            if (distance <= this.radius) {
                return true;
            }
            return false;
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
            return new BoundingBox(this.pos.x + this.actor.pos.x - this.radius,
                this.pos.y + this.actor.pos.y - this.radius,
                this.pos.y + this.actor.pos.y + this.radius,
                this.pos.x + this.actor.pos.x + this.radius);
        }

        /**
         * Get axis not implemented on circles, since their are infinite axis
         */
        public getAxis(): Vector[] {
            return null;
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
    }
}