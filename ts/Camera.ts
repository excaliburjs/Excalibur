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

/// <reference path="Core.ts" />
/// <reference path="Common.ts" />

module Camera {
   export interface ICamera {
      applyTransform(engine: Engine, delta: number): void;
   }  

   export class SideCamera implements ICamera {
      follow : Actor;
      constructor(){
      }
      setActorToFollow(actor: Actor){
         this.follow = actor;
      }

      applyTransform(engine:Engine, delta: number){

         engine.ctx.translate(-this.follow.x + engine.width/2.0,0);
      }
   }

   export class TopCamera implements ICamera {
      follow : Actor;
      constructor(){
      }
      setActorToFollow(actor : Actor){
         this.follow = actor;
      }

      applyTransform(engine : Engine, delta : number){

         engine.ctx.translate(-this.follow.x + engine.width/2.0, 0);
         engine.ctx.translate(0, -this.follow.y + engine.height/2.0);
      }
   }
}