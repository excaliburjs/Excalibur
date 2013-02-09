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
<<<<<<< HEAD

=======
>>>>>>> 1888beb0124c584685a7fe69ea5ad7bf5b7c9b6c
class Point2D {
	
	constructor (public x: number = 0, public y: number =0){
		
	}
	
	distance(p :Point2D){
		return Math.sqrt(Math.pow(this.x-p.x,2) + Math.pow(this.y -p.y,2));
	}
	
	toString(){
		return "(" + this.x + "," + this.y + ")";
	}
}

class Point3D extends Point2D {
	constructor (x :number = 0, y:number =0 , public z:number = 0){
		super(x,y);
	}
	
	distance(p : Point3D){
		return Math.sqrt(Math.pow(this.x-p.x,2)+Math.pow(this.y-p.y,2)+Math.pow(this.z-p.z,2));
	}
	
	toString(){
		return "(" + this.x + "," + this.y + "," + this.z + ")";
	}
}

var p1: Point2D = new Point2D();
var p2: Point2D = new Point2D(0,5);

var dis: number = p1.distance(p2);


var p3: Point3D = new Point3D();
var p4: Point3D = new Point3D(0,0,5);

var dis2: number = p3.distance(p4);

alert("First:" + p1.toString() + ":" + dis.toString());
alert("Second:" + p3.toString() + ":" + dis2.toString());