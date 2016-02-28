/// <reference path="../Algebra.ts" />
/// <reference path="../Actor.ts" />
/// <reference path="ICollisionArea.ts" />
module ex {
   /**
    * Collision contacts are used internally by Excalibur to resolve collision between actors. This
    * Pair prevents collisions from being evaluated more than one time
    */
   export class CollisionContact {
      /**
       * The id of this collision contact
       */
      id: string;
      /**
       * The first rigid body in the collision
       */
      bodyA: ICollisionArea;
      /**
       * The second rigid body in the collision
       */
      bodyB: ICollisionArea;
      /**
       * The minimum translation vector to resolve penetration, pointing away from bodyA
       */
      mtv: Vector;
      /**
       * The point of collision shared between bodyA and bodyB
       */
      point: Vector;
      /**
       * The collision normal, pointing away from bodyA
       */
      normal: Vector;
      
      
      constructor(bodyA: ICollisionArea, bodyB: ICollisionArea, mtv: Vector, point: Vector, normal: Vector) {
         this.bodyA = bodyA;
         this.bodyB = bodyB;
         this.mtv = mtv;
         this.point = point;
         this.normal = normal;
      }
      
      resolve(delta: number) {
         // perform collison on bounding areas
         var bodyA: Actor = this.bodyA.actor;
         var bodyB: Actor = this.bodyB.actor;
         var mtv = this.mtv; // normal pointing away from bodyA
         var point = this.point; // world space collision point
         var normal = this.normal; // normal pointing away from bodyA
         if(bodyA === bodyB) { // sanity check for existing pairs
            return;
         }
         
         var invMassA = bodyA.collisionType === ex.CollisionType.Fixed ? 0 : 1 / bodyA.mass;
         var invMassB = bodyB.collisionType === ex.CollisionType.Fixed ? 0 : 1 / bodyB.mass;
         
         var invMoiA = bodyA.collisionType === ex.CollisionType.Fixed ? 0 : 1 / bodyA.moi;
         var invMoiB = bodyB.collisionType === ex.CollisionType.Fixed ? 0 : 1 / bodyB.moi;
         
         // average restitution more relistic
         var coefRestitution = Math.min(bodyA.restitution, bodyB.restitution);
         
         var coefFriction = Math.min(bodyA.friction, bodyB.friction);
         
         normal = normal.normalize();
         var tangent = normal.normal().normalize();
         
         var ra = this.point.sub(this.bodyA.getCenter()); // point relative to bodyA position
         var rb = this.point.sub(this.bodyB.getCenter()); /// point relative to bodyB
         
         // Relative velocity in linear terms
         // Angular to linear velocity formula -> omega = v/r
         var rv = bodyB.vel.add(rb.cross(-bodyB.rx)).sub(bodyA.vel.sub(ra.cross(bodyA.rx)));
         var rvNormal = rv.dot(normal);
         var rvTangent = rv.dot(tangent);
         
         var raTangent = ra.dot(tangent);   
         var raNormal = ra.dot(normal);
         
         var rbTangent = rb.dot(tangent);   
         var rbNormal = rb.dot(normal);
         
         
         // If objects are moving away ignore
         if(rvNormal >=  0) {
            return;   
         }
         
         // Collision impulse formula from Chris Hecker
         // https://en.wikipedia.org/wiki/Collision_response
         var impulse = - ((1 + coefRestitution) * rvNormal) /
            ((invMassA + invMassB) + invMoiA * raTangent * raTangent + invMoiB * rbTangent * rbTangent); 
         
         
         if(bodyA.collisionType === ex.CollisionType.Fixed) {
            bodyB.vel = bodyB.vel.add(normal.scale(impulse * invMassB));
            bodyB.rx -= impulse * invMoiB * -rb.cross(normal);
            bodyB.addMtv(mtv);
         }else if (bodyB.collisionType === ex.CollisionType.Fixed) {
            bodyA.vel = bodyA.vel.sub(normal.scale(impulse * invMassA));
            bodyA.rx += impulse * invMoiA * -ra.cross(normal);
            bodyA.addMtv(mtv.negate());
         }else {
            bodyB.vel = bodyB.vel.add(normal.scale(impulse * invMassB));      
            bodyB.rx -= impulse * invMoiB * -rb.cross(normal);
            
            bodyA.vel = bodyA.vel.sub(normal.scale(impulse * invMassA));
            bodyA.rx += impulse * invMoiA * -ra.cross(normal);
            
            // Split the mtv in half for the two bodies, potentially we could do something smarter here
            bodyB.addMtv(mtv.scale(.5));
            bodyA.addMtv(mtv.scale(-.5));
         }
         
         if(coefFriction && rvTangent) {
            // Columb model of friction, formula for impulse due to friction from  
            // https://en.wikipedia.org/wiki/Collision_response
            
            // tangent force exerted by body on another in contact
            var t = rv.sub(normal.scale(rv.dot(normal))).normalize();
                  
            // impulse in the direction of tangent force
            var jt = rv.dot(t) / (invMassA + invMassB + raNormal * raNormal * invMoiA + rbNormal * rbNormal * invMoiB);
            
            var frictionImpulse = new Vector(0, 0);
            if(Math.abs(jt) <= impulse * coefFriction) {
               frictionImpulse = t.scale(jt).negate();
            } else {
               frictionImpulse = t.scale(-impulse * coefFriction);
            }
            
                           
            if ( bodyA.collisionType === ex.CollisionType.Fixed ) {

                  // apply frictional impulse
                  bodyB.vel = bodyB.vel.add(frictionImpulse.scale(invMassB));
                  
                  bodyB.rx += frictionImpulse.dot(t) * invMoiB * rb.cross(t);
                  

            } else if ( bodyB.collisionType === ex.CollisionType.Fixed ) {

                  // apply frictional impulse
                  bodyA.vel = bodyA.vel.sub(frictionImpulse.scale(invMassA));
                  
                  bodyA.rx -= frictionImpulse.dot(t) * invMoiA * ra.cross(t);
                  

            } else {
                  // apply frictional impulse
                  bodyB.vel = bodyB.vel.add(frictionImpulse.scale(invMassB));
                  
                  bodyB.rx += frictionImpulse.dot(t) * invMoiB * rb.cross(t);
                  
                  // apply frictional impulse
                  bodyA.vel = bodyA.vel.sub(frictionImpulse.scale(invMassA));
                  
                  bodyA.rx -= frictionImpulse.dot(t) * invMoiA * ra.cross(t);
                  
            }
         }
         
         if(bodyA.sleeping && bodyA.collisionType !== ex.CollisionType.Fixed) {
            bodyA.setAwake(true);
            bodyA.sleepCheck(delta);
         }
         if(bodyB.sleeping && bodyB.collisionType !== ex.CollisionType.Fixed) {
            bodyB.setAwake(true);
            bodyB.sleepCheck(delta);
         }
      }      
   }
}