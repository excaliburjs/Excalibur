/// <reference path="../Algebra.ts" />
/// <reference path="../Actor.ts" />
/// <reference path="../Physics.ts" />
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
      
      resolve(delta: number, strategy: CollisionResolutionStrategy) {
         if (strategy === CollisionResolutionStrategy.RigidBody) {
            this._resolveRigidBodyCollision(delta);
         } else if (strategy === CollisionResolutionStrategy.Box) {
            this._resolveBoxCollision(delta);   
         } else {
            throw new Error('Unknown collision resolution strategy');
         }
      }

      private _applyBoxImpluse(bodyA: Actor, bodyB: Actor, mtv: Vector, side: Side) {
         if ((bodyA.collisionType === CollisionType.Active || 
              bodyA.collisionType === CollisionType.Elastic) && 
              bodyB.collisionType !== CollisionType.Passive) {

            // Resolve overlaps
            if (bodyA.collisionType === CollisionType.Active && 
               bodyB.collisionType === CollisionType.Active) {
               // split overlaps if both are Active
               mtv = mtv.scale(.5);
            }
            // Apply mtv
            bodyA.pos.y += mtv.y;
            bodyA.pos.x += mtv.x;
                        
            // Naive elastic bounce
            if (bodyA.collisionType === CollisionType.Elastic) {
               if (side === Side.Left) {
                  bodyA.vel.x = Math.abs(bodyA.vel.x);
               } else if (side === Side.Right) {
                  bodyA.vel.x = -Math.abs(bodyA.vel.x);
               } else if (side === Side.Top) {
                  bodyA.vel.y = Math.abs(bodyA.vel.y);
               } else if (side === Side.Bottom) {
                  bodyA.vel.y = -Math.abs(bodyA.vel.y);
               }
            } else {
               

               // non-zero intersection on the y axis
               if (this.mtv.x !== 0) {
                  var velX = 0;
                  // both bodies are traveling in the same direction (negative or positve)
                  if (bodyA.vel.x <= 0 && bodyB.vel.x <= 0) {
                     velX = Math.min(bodyA.vel.x, bodyB.vel.x);
                     velX = bodyA.vel.x + bodyA.vel.x;
                  } else if (bodyA.vel.x >= 0 && bodyB.vel.x >= 0) {
                     velX = Math.max(bodyA.vel.x, bodyB.vel.x);
                     velX = bodyA.vel.x + bodyA.vel.x;
                  }else {
                     // bodies are traveling in opposite directions
                     velX = 0;
                  }
                  bodyA.vel.x = velX;
               }
               
               
               if (this.mtv.y !== 0) {
                  var velY = 0;
                  // both bodies are traveling in the same direction (negative or positive)
                  if (bodyA.vel.y <= 0 && bodyB.vel.y <= 0) {
                     velY = Math.min(bodyA.vel.y, bodyB.vel.y);
                  } else if (bodyA.vel.y >= 0 && bodyB.vel.y >= 0) {
                     velY = Math.max(bodyA.vel.y, bodyB.vel.y);
                  } else {
                     // bodies are traveling in opposite directions
                     velY = 0;
                  }
                  
                  bodyA.vel.y = velY;
               }
            }                 
         }
      }

      private _resolveBoxCollision(delta: number) {
         var bodyA = this.bodyA.body.actor;
         var bodyB = this.bodyB.body.actor;
         var side = ex.Util.getSideFromVector(this.mtv);
         var mtv = this.mtv.negate();
         // Publish collision events on both participants
         bodyA.emit('collision', new CollisionEvent(bodyA, bodyB, side, mtv));
         bodyB.emit('collision', 
            new CollisionEvent(bodyB, bodyA, ex.Util.getOppositeSide(side), mtv.negate()));

         this._applyBoxImpluse(bodyA, bodyB, mtv, side);
         this._applyBoxImpluse(bodyB, bodyA, mtv.negate(), ex.Util.getOppositeSide(side));
      }
      
      private _resolveRigidBodyCollision(delta: number) {
                  
         // perform collison on bounding areas
         var bodyA: Actor = this.bodyA.body.actor;
         var bodyB: Actor = this.bodyB.body.actor;
         var mtv = this.mtv; // normal pointing away from bodyA
         var point = this.point; // world space collision point
         var normal = this.normal; // normal pointing away from bodyA
         if (bodyA === bodyB) { // sanity check for existing pairs
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
         if (rvNormal >  0) {
            return;   
         }
         
         // Publish collision events on both participants
         var side = ex.Util.getSideFromVector(this.mtv);
         bodyA.emit('collision', new CollisionEvent(this.bodyA.body.actor, 
                                                                    this.bodyB.body.actor, 
                                                                    side, 
                                                                    this.mtv));
         bodyB.emit('collision', new CollisionEvent(this.bodyB.body.actor, 
                                                                    this.bodyA.body.actor, 
                                                                    ex.Util.getOppositeSide(side), 
                                                                    this.mtv.negate()));
         
         // Collision impulse formula from Chris Hecker
         // https://en.wikipedia.org/wiki/Collision_response
         var impulse = - ((1 + coefRestitution) * rvNormal) /
            ((invMassA + invMassB) + invMoiA * raTangent * raTangent + invMoiB * rbTangent * rbTangent); 
         
         
         if (bodyA.collisionType === ex.CollisionType.Fixed) {
            bodyB.vel = bodyB.vel.add(normal.scale(impulse * invMassB));
            if (Physics.allowRigidBodyRotation) {
               bodyB.rx -= impulse * invMoiB * -rb.cross(normal);
            }
            bodyB.addMtv(mtv);
         } else if (bodyB.collisionType === ex.CollisionType.Fixed) {
            bodyA.vel = bodyA.vel.sub(normal.scale(impulse * invMassA));
            if (Physics.allowRigidBodyRotation) {
               bodyA.rx += impulse * invMoiA * -ra.cross(normal);
            }
            bodyA.addMtv(mtv.negate());
         } else {
            bodyB.vel = bodyB.vel.add(normal.scale(impulse * invMassB));
            bodyA.vel = bodyA.vel.sub(normal.scale(impulse * invMassA));
            
            if (Physics.allowRigidBodyRotation) {      
               bodyB.rx -= impulse * invMoiB * -rb.cross(normal);
               bodyA.rx += impulse * invMoiA * -ra.cross(normal);
            }
            
            
            // Split the mtv in half for the two bodies, potentially we could do something smarter here
            bodyB.addMtv(mtv.scale(.5));
            bodyA.addMtv(mtv.scale(-.5));
         }
         
         // Friction portion of impulse
         if (coefFriction && rvTangent) {
            // Columb model of friction, formula for impulse due to friction from  
            // https://en.wikipedia.org/wiki/Collision_response
            
            // tangent force exerted by body on another in contact
            var t = rv.sub(normal.scale(rv.dot(normal))).normalize();
                  
            // impulse in the direction of tangent force
            var jt = rv.dot(t) / (invMassA + invMassB + raNormal * raNormal * invMoiA + rbNormal * rbNormal * invMoiB);
            
            var frictionImpulse = new Vector(0, 0);
            if (Math.abs(jt) <= impulse * coefFriction) {
               frictionImpulse = t.scale(jt).negate();
            } else {
               frictionImpulse = t.scale(-impulse * coefFriction);
            }
            
            if ( bodyA.collisionType === ex.CollisionType.Fixed ) {
                  // apply frictional impulse
                  bodyB.vel = bodyB.vel.add(frictionImpulse.scale(invMassB));
                  if (Physics.allowRigidBodyRotation) {      
                     bodyB.rx += frictionImpulse.dot(t) * invMoiB * rb.cross(t);
                  }
            } else if ( bodyB.collisionType === ex.CollisionType.Fixed ) {
                  // apply frictional impulse
                  bodyA.vel = bodyA.vel.sub(frictionImpulse.scale(invMassA));
                  if (Physics.allowRigidBodyRotation) {      
                     bodyA.rx -= frictionImpulse.dot(t) * invMoiA * ra.cross(t);
                  }
            } else {
                // apply frictional impulse
                bodyB.vel = bodyB.vel.add(frictionImpulse.scale(invMassB));
                bodyA.vel = bodyA.vel.sub(frictionImpulse.scale(invMassA));
                
                // apply frictional impulse
                if (Physics.allowRigidBodyRotation) {      
                  bodyB.rx += frictionImpulse.dot(t) * invMoiB * rb.cross(t);
                  bodyA.rx -= frictionImpulse.dot(t) * invMoiA * ra.cross(t);
                }                
            }
         }
      }      
   }
}