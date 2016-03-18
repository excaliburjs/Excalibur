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
      
      resolve(delta: number, strategy: CollisionResolutionStrategy){
         if(strategy === CollisionResolutionStrategy.RigidBody){
            this._resolveRigidBody(delta);
         }else if (strategy === CollisionResolutionStrategy.AABB){
            this._resolveAABB(delta);   
         }else {
            throw new Error("Unknown collision resolution strategy");
         }
      }
      
      private _resolveAABB(delta: number){
         var bodyA = this.bodyA.actor;
         var bodyB = this.bodyB.actor;
         var side = ex.Util.getSideFromVector(this.mtv);
         var mtv = this.mtv.negate();
         // Publish collision events on both participants
         bodyA.eventDispatcher.emit('collision', new CollisionEvent(bodyA, bodyB, side, mtv));
         bodyB.eventDispatcher.emit('collision', 
            new CollisionEvent(bodyB, bodyA, ex.Util.getOppositeSide(side), mtv.scale(-1.0)));

         // If the actor is active push the actor out if its not passive
         var leftSide = side;
         if ((bodyA.collisionType === CollisionType.Active || 
            bodyA.collisionType === CollisionType.Elastic) && 
            bodyB.collisionType !== CollisionType.Passive) {
            bodyA.pos.y += mtv.y;
            bodyA.pos.x += mtv.x;
            
            // Naive elastic bounce
            if (bodyA.collisionType === CollisionType.Elastic) {
               if (leftSide === Side.Left) {
                  bodyA.vel.x = Math.abs(bodyA.vel.x);
               } else if(leftSide === Side.Right) {
                  bodyA.vel.x = -Math.abs(bodyA.vel.x);
               } else if(leftSide === Side.Top) {
                  bodyA.vel.y = Math.abs(bodyA.vel.y);
               } else if(leftSide === Side.Bottom) {
                  bodyA.vel.y = -Math.abs(bodyA.vel.y);
               }
            } else {
               // Cancel velocities along intersection
               if (this.mtv.x !== 0) {
                  
                  if (bodyA.vel.x <= 0 && bodyB.vel.x <= 0) {
                     bodyA.vel.x = Math.max(bodyA.vel.x, bodyB.vel.x);
                  } else if (bodyA.vel.x >= 0 && bodyB.vel.x >= 0) {
                     bodyA.vel.x = Math.min(bodyA.vel.x, bodyB.vel.x);
                  }else {
                     bodyA.vel.x = 0;
                  }
                  
               }
               
               if (this.mtv.y !== 0) {
                  
                  if (bodyA.vel.y <= 0 && bodyB.vel.y <= 0) {
                     bodyA.vel.y = Math.max(bodyA.vel.y, bodyB.vel.y);
                  } else if (bodyA.vel.y >= 0 && bodyB.vel.y >= 0) {
                     bodyA.vel.y = Math.min(bodyA.vel.y, bodyB.vel.y);
                  } else {
                     bodyA.vel.y = 0;
                  }
                  
               }
            }                 
         }

         var rightSide = ex.Util.getOppositeSide(side);
         var rightIntersect = mtv.scale(-1.0);
         if ((bodyB.collisionType === CollisionType.Active || 
            bodyB.collisionType === CollisionType.Elastic) && 
            bodyA.collisionType !== CollisionType.Passive) {
            bodyB.pos.y += rightIntersect.y;
            bodyB.pos.x += rightIntersect.x;
           
            // Naive elastic bounce
            if (bodyB.collisionType === CollisionType.Elastic) {
               if (rightSide === Side.Left) {
                  bodyB.vel.x = Math.abs(bodyB.vel.x);
               } else if(rightSide === Side.Right) {
                  bodyB.vel.x = -Math.abs(bodyB.vel.x);
               } else if(rightSide === Side.Top) {
                  bodyB.vel.y = Math.abs(bodyB.vel.y);
               } else if(rightSide === Side.Bottom) {
                  bodyB.vel.y = -Math.abs(bodyB.vel.y);
               }
            } else {
                // Cancel velocities along intersection
               if(rightIntersect.x !== 0) {
                  if (bodyB.vel.x <= 0 && bodyA.vel.x <= 0) {
                     bodyB.vel.x = Math.max(bodyA.vel.x, bodyB.vel.x);
                  } else if (bodyA.vel.x >= 0 && bodyB.vel.x >= 0) {
                     bodyB.vel.x = Math.min(bodyA.vel.x, bodyB.vel.x);
                  }else {
                     bodyB.vel.x = 0;
                  }
               }
               
               if(rightIntersect.y !== 0) {
                  if (bodyB.vel.y <= 0 && bodyA.vel.y <= 0) {
                     bodyB.vel.y = Math.max(bodyA.vel.y, bodyB.vel.y);
                  } else if (bodyA.vel.y >= 0 && bodyB.vel.y >= 0) {
                     bodyB.vel.y = Math.min(bodyA.vel.y, bodyB.vel.y);
                  }else {
                     bodyB.vel.y = 0;
                  }
               }
            }
         }
      }
      
      private _resolveRigidBody(delta: number) {
                  
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
         if(rvNormal >  0) {
            return;   
         }
         
         // Publish collision events on both participants
         var side = ex.Util.getSideFromVector(this.mtv);
         this.bodyA.actor.emit('collision', new CollisionEvent(this.bodyA.actor, this.bodyB.actor, side, this.mtv));
         this.bodyB.actor.emit('collision', new CollisionEvent(this.bodyB.actor, this.bodyA.actor, ex.Util.getOppositeSide(side), this.mtv.negate()));
         
         // Collision impulse formula from Chris Hecker
         // https://en.wikipedia.org/wiki/Collision_response
         var impulse = - ((1 + coefRestitution) * rvNormal) /
            ((invMassA + invMassB) + invMoiA * raTangent * raTangent + invMoiB * rbTangent * rbTangent); 
         
         
         if(bodyA.collisionType === ex.CollisionType.Fixed) {
            bodyB.vel = bodyB.vel.add(normal.scale(impulse * invMassB));
            if(Engine.physics.allowRotation) {
               bodyB.rx -= impulse * invMoiB * -rb.cross(normal);
            }
            bodyB.addMtv(mtv);
         }else if (bodyB.collisionType === ex.CollisionType.Fixed) {
            bodyA.vel = bodyA.vel.sub(normal.scale(impulse * invMassA));
            if(Engine.physics.allowRotation) {
               bodyA.rx += impulse * invMoiA * -ra.cross(normal);
            }
            bodyA.addMtv(mtv.negate());
         }else {
            bodyB.vel = bodyB.vel.add(normal.scale(impulse * invMassB));
            bodyA.vel = bodyA.vel.sub(normal.scale(impulse * invMassA));
            
            if(Engine.physics.allowRotation) {      
               bodyB.rx -= impulse * invMoiB * -rb.cross(normal);
               bodyA.rx += impulse * invMoiA * -ra.cross(normal);
            }
            
            
            // Split the mtv in half for the two bodies, potentially we could do something smarter here
            bodyB.addMtv(mtv.scale(.5));
            bodyA.addMtv(mtv.scale(-.5));
         }
         
         // Friction portion of impulse
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
                  if(Engine.physics.allowRotation) {      
                     bodyB.rx += frictionImpulse.dot(t) * invMoiB * rb.cross(t);
                  }
            } else if ( bodyB.collisionType === ex.CollisionType.Fixed ) {
                  // apply frictional impulse
                  bodyA.vel = bodyA.vel.sub(frictionImpulse.scale(invMassA));
                  if(Engine.physics.allowRotation) {      
                     bodyA.rx -= frictionImpulse.dot(t) * invMoiA * ra.cross(t);
                  }
            } else {
                // apply frictional impulse
                bodyB.vel = bodyB.vel.add(frictionImpulse.scale(invMassB));
                bodyA.vel = bodyA.vel.sub(frictionImpulse.scale(invMassA));
                
                // apply frictional impulse
                if(Engine.physics.allowRotation) {      
                  bodyB.rx += frictionImpulse.dot(t) * invMoiB * rb.cross(t);
                  bodyA.rx -= frictionImpulse.dot(t) * invMoiA * ra.cross(t);
                }                
            }
         }
         
         if(bodyA.sleeping && bodyA.collisionType !== ex.CollisionType.Fixed) {
            bodyA.setSleep(false);
         }
         if(bodyB.sleeping && bodyB.collisionType !== ex.CollisionType.Fixed) {
            bodyB.setSleep(false);
         }
      }      
   }
}