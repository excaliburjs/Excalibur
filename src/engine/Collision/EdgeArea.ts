module ex {

    export interface IEdgeAreaOptions {
        begin?: Vector;
        end?: Vector;
        actor?: Actor;
    }

    export class EdgeArea implements ICollisionArea {
        actor: Actor;
        pos: Vector;
        begin: Vector;
        end: Vector;

        constructor(options: IEdgeAreaOptions) {
            this.begin = options.begin || Vector.Zero.clone();
            this.end = options.end || Vector.Zero.clone();
            this.actor = options.actor || null;

            this.pos = this.getCenter();
        }
        
        /**
         * Get the center of the collision area in world coordinates
         */
        public getCenter(): Vector {
            var pos = this.begin.add(this.end).scale(.5);
            if (this.actor) {
                return this.actor.pos.add(pos);
            }
            return pos;
        }

        /**
         * Tests if a point is contained in this collision area
         */
        public contains(point: Vector): boolean {
            return false;
        }


        public castRay(ray: Ray): Vector {
            // todo 
            throw new Error('not implemented');
        }

        public collide(area: ICollisionArea): CollisionContact {
            if (area instanceof CircleArea) {
                return CollisionJumpTable.CollideCircleEdge(area, this);
            } else if (area instanceof PolygonArea) {
                return CollisionJumpTable.CollidePolygonEdge(area, this);
            } else if (area instanceof EdgeArea) {
                return CollisionJumpTable.CollideEdgeEdge(this, area);
            } else {
                throw new Error(`Circle could not collide with unknown ICollisionArea ${typeof area}`);
            }
        }

        /**
         * Find the point on the shape furthest in the direction specified
         */
        public getFurthestPoint(direction: Vector): Vector {
            if (direction.dot(this.begin) > 0) {
                return this.begin;
            } else {
                return this.end;
            }
        }

        /**
         * Get the axis aligned bounding box for the circle area
         */
        public getBounds(): BoundingBox {
            return new BoundingBox(Math.min(this.begin.x, this.end.x),
                Math.min(this.begin.y, this.end.y),
                Math.max(this.begin.y, this.end.y),
                Math.max(this.begin.x, this.end.x));
        }

        /**
         * Get the axis associated with the edge
         */
        public getAxes(): Vector[] {
            var e = this.end.sub(this.begin);
            var edgeNormal = e.normal();

            var axes = [];
            axes.push(edgeNormal);
            axes.push(edgeNormal.negate());
            axes.push(edgeNormal.normal());
            axes.push(edgeNormal.normal().negate());
            return axes;            
        }

        /**
         * Project the edge along a specified axis
         */
        public project(axis: Vector): Projection {
            var scalars = [];

            var points = [this.begin, this.end];
            var len = points.length;
            for (var i = 0; i < len; i++) {
                scalars.push(points[i].dot(axis));
            }

            return new Projection(Math.min.apply(Math, scalars), Math.max.apply(Math, scalars));
        }

        public debugDraw(ctx: CanvasRenderingContext2D, debugFlags: IDebugFlags) {
           ctx.strokeStyle = 'red';
           var old = ctx.lineWidth;
           ctx.lineWidth = 5;
           ctx.beginPath();
           ctx.moveTo(this.begin.x, this.begin.y);
           ctx.lineTo(this.end.x, this.end.y);
           ctx.closePath();
           ctx.stroke();
           ctx.lineWidth = old;
        }
    }
}