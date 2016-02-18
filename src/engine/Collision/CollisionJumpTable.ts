module ex {
    export var CollisionJumpTable = {

        CollideCircleCircle(circleA: CircleArea, circleB: CircleArea): CollisionContact {
           
            var radius = circleA.radius + circleB.radius;
            if (circleA.pos.distance(circleB.pos) > radius) {
                return null;
            }

            var axisOfCollision = circleB.pos.sub(circleA.pos).normalize();
            var mvt = axisOfCollision.scale(radius - circleB.pos.distance(circleA.pos));
            
            var pointOfCollision = circleA.getFurthestPoint(axisOfCollision);

            return new CollisionContact(circleA, circleB, mvt, pointOfCollision, axisOfCollision);	
        },

        CollideCirclePolygon(circle: CircleArea, polygon: PolygonArea): CollisionContact {
            
            var axes = polygon.getAxes();
            var cc = circle.getCenter();

            var pc = polygon.getCenter();

            var minAxis = circle.testSeparatingAxisTheorem(polygon);
            if (!minAxis) {
                return null;
            }
   
            // make sure that the minAxis is pointing away from circle
            var samedir = minAxis.dot(polygon.getCenter().sub(circle.getCenter()));
            minAxis = samedir < 0 ? minAxis.negate() : minAxis;

            var verts = [];

            var point1 = polygon.getFurthestPoint(minAxis.negate());
            var point2 = circle.getFurthestPoint(minAxis);
            if (circle.contains(point1)) {
                verts.push(point1)
            }
            if (polygon.contains(point2)) {
                verts.push(point2);
            }
            if (verts.length === 0) {
                verts.push(point2);
            }


            return new CollisionContact(circle, polygon, minAxis, verts.length === 2 ? verts[0].average(verts[1]) : verts[0], minAxis.normalize());   
        },

        CollideCircleEdge(circle: CircleArea, edge: EdgeArea): CollisionContact {
            // center of the circle
            var cc = circle.pos;
            // vector in the direction of the edge
            var e = edge.end.sub(edge.begin);

            // amount of overlap with the circle's center along the edge direction
            var u = e.dot(edge.end.sub(cc));
            var v = e.dot(cc.sub(edge.begin));

            // Potential region A collision (circle is on the left side of the edge, before the beginning)
            if (v <= 0) {
                var d = cc.sub(edge.begin);
                var dd = d.dot(d); // quick and dirty way of calc'n distance in r^2 terms saves some sqrts
                // save some sqrts
                if (dd > circle.radius * circle.radius) {
                    return null; // no collision
                }
                return new CollisionContact(circle, edge, d.normalize().scale(circle.radius - Math.sqrt(dd)), edge.begin, d.normalize());
            }

            // Potential region B collision (circle is on the right side of the edge, after the end)
            if (u <= 0) {
                var d = cc.sub(edge.end);
                var dd = d.dot(d);
                if (dd > circle.radius * circle.radius) {
                    return null;
                }
                return new CollisionContact(circle, edge, d.normalize().scale(circle.radius - Math.sqrt(dd)), edge.begin, d.normalize());
            }

            // Otherwise potential region AB collision (circle is in the middle of the edge between the beginning and end)
            var den = e.dot(e);
            var pointOnEdge = (edge.begin.scale(u).add(edge.end.scale(v))).scale(1 / den);
            var d = cc.sub(pointOnEdge);

            var dd = d.dot(d);
            if (dd > circle.radius * circle.radius) {
                return null; // no collision
            }

            var n = e.perpendicular();
            // flip correct direction
            if (n.dot(cc.sub(edge.begin)) < 0) {
                n.x = -n.x;
                n.y = -n.y;
            }

            n = n.normalize();

            var mvt = n.scale(Math.abs(circle.radius - Math.sqrt(dd)));
            return new CollisionContact(circle, edge, mvt.negate(), pointOnEdge, n.negate());

        },
                
        CollideEdgeEdge(edgeA: EdgeArea, edgeB: EdgeArea): CollisionContact {
            // Edge-edge collision doesn't make sense
            return null;
        },

        CollidePolygonEdge(polygon: PolygonArea, edge: EdgeArea): CollisionContact {
            var center = polygon.getCenter();
            var e = edge.end.sub(edge.begin);
            var edgeNormal = e.normal();

            var u = e.dot(edge.end.sub(center));
            var v = e.dot(center.sub(edge.begin));

            var den = e.dot(e);
            var pointOnEdge = (edge.begin.scale(u).add(edge.end.scale(v))).scale(1 / den);
            var d = center.sub(pointOnEdge);

            // build a temporary polygon from the edge to use SAT
            var pos = edge.getCenter();
            var linePoly = new PolygonArea({
                points: [
                    edge.begin.sub(pos),
                    edge.end.sub(pos),
                    edge.end.sub(edgeNormal.scale(10)),
                    edge.begin.sub(edgeNormal.scale(10))]
            });

            var minAxis = polygon.testSeparatingAxisTheorem(linePoly);

            // no minAxis, no overlap, no collision
            if (!minAxis) {
                return null;
            }
            
            return new CollisionContact(polygon, edge, minAxis, polygon.getFurthestPoint(edgeNormal.negate()), edgeNormal.negate());
        },

        CollidePolygonPolygon(polyA: PolygonArea, polyB: PolygonArea): CollisionContact {
            // get all axes from both polys
            var axes = polyA.getAxes().concat(polyB.getAxes());
            // get all points from both polys
            var points = polyA.getTransformedPoints().concat(polyB.getTransformedPoints());
            
            // do a SAT test to find a min axis if it exists
            var minAxis = polyA.testSeparatingAxisTheorem(polyB);

            // no overlap, no collision return null
            if (!minAxis) {
                return null
            }

            // make sure that minAxis is pointing from A -> B
            var sameDir = minAxis.dot(polyB.getCenter().sub(polyA.getCenter()));
            minAxis = sameDir < 0 ? minAxis.negate() : minAxis;

            // find rough point of collision
            // todo this could be better
            var verts: Vector[] = [];
            var pointA = polyA.getFurthestPoint(minAxis);
            var pointB = polyB.getFurthestPoint(minAxis.negate());

            if (polyB.contains(pointA)) {
                verts.push(pointA);
            }

            if (polyA.contains(pointB)) {
                verts.push(pointB);
            }
            // no candidates, pick something
            if (verts.length === 0) {
                verts.push(pointB);
            }

            var contact = verts.length === 2 ? verts[0].add(verts[1]).scale(.5) : verts[0];

            return new CollisionContact(polyA, polyB, minAxis, contact, minAxis.normalize());
        },
    }
}