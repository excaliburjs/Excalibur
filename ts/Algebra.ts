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

class Util {
   static Equals(x: number, y: number, delta: number){
      return (((x-delta) <= y) && (y <= (x+delta)));
   }
}

class Vector {
   constructor(public x: number, public y: number){}

   public distance(v?: Vector) : number {
      if(!v){
         v = new Vector(0.0, 0.0);
      }
      return Math.sqrt(Math.pow(this.x - v.x,2) + Math.pow(this.y - v.y,2));
   }

   public normalize() : Vector {
      var d = this.distance();
      if(d > 0) {
         return new Vector(this.x/d, this.y/d);
      }else{
         return new Vector(0,1);
      }        
   }

   public scale(size) : Vector {
      return new Vector(this.x * size, this.y * size);
   }

   public add (v: Vector) : Vector {
      return new Vector(this.x + v.x, this.y + v.y);
   }

   public minus(v: Vector) : Vector {
      return new Vector(this.x - v.x, this.y - v.y);
   }

   public dot (v: Vector): number {
      return this.x * v.x + this.y * v.y;
   }

   // 2d cross product returns a scalar
   public cross(v: Vector): number {
      return this.x * v.y - this.y * v.x;
   }

}

