/**
Copyright (c) 2013 Erik Onarheim
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
1. Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.
3. All advertising materials mentioning features or use of this software
   must display the following acknowledgement:
   This product includes software developed by the GameTS Team.
4. Neither the name of the creator nor the
   names of its contributors may be used to endorse or promote products
   derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE GAMETS TEAM ''AS IS'' AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE GAMETS TEAM BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/// <reference path='../../js/Engine.d.ts' />

// Create an the game container
var game = new Engine();

// Set background color
game.backgroundColor = new Color(0,0,0);

// Turn on debug diagnostics
game.isDebug = true;

// Implement planetary physics
class PlanetaryPhysics implements Common.IPhysicsSystem {
   private actors : Common.IActor[] = [];
   constructor(){}

   addActor(actor: Common.IActor){
      this.actors.push(actor);
      actor.setPhysicsSystem(this);
   }

   removeActor(actor: Common.IActor){
      var index = this.actors.indexOf(actor);
      this.actors.splice(index,1);
   }

   getProperty(key: string): any{
      return false;
   }

   setProperty(key: string, value: any){
      
   }

   gravity(a: Common.IActor, b: Common.IActor): number{
      var dx = a.getX() - b.getX();
      var dy = a.getY() - b.getY();

      var distance = Math.sqrt(dx*dx + dy*dy);
      return 1.0/(distance*distance);
   }

   clamp(val, min, max){
      if(val > max){
         return max;
      }
      if(val < min){
         return min;
      }
      return val;
   }

   update(delta: number){
      

      for(var i = 0; i < this.actors.length; i++){
         var actor1 = this.actors[i];
         // j=i+1 will update the upper diagonal
         for(var j = 0; j < this.actors.length; j++){
            var actor2 = this.actors[j];

            var dx = Math.abs(actor2.getX() - actor1.getX());
            var dy = Math.abs(actor2.getY() - actor1.getY());

            var distance = Math.sqrt(dx*dx + dy*dy);
            if(distance > .02){
               var force = 1/(distance*distance);

               var ux = (actor1.getX() - actor2.getX())/distance;
               var uy = (actor1.getY() - actor2.getY())/distance;

               actor2.setAx(this.clamp(actor2.getAx(), -5, 5));
               actor2.setAy(this.clamp(actor2.getAy(), -5, 5));

               actor2.setAx(actor2.getAx() + ux*force);
               actor2.setAy(actor2.getAy() + uy*force);
            }
         }
      }

   }
}

// Create physics
var physics = new PlanetaryPhysics();

var camera = new Camera.TopCamera();
// Create the level
for(var i = 0; i< 10; i++){
   for(var j = 0; j< 10; j++){
   	var color = new Color(Math.random()*255,Math.random()*255,Math.random()*255);
   	var block = new Actor(100+i*100,100+j*100,15,15,color);  

      game.addChild(block);
      //physics.addActor(block);
   }

}


// Add physics system to the game
//game.addPhysics(physics);

// Run the mainloop
game.start();