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

/// <reference path="Common.ts" />

module Physics {
	export class Overlap implements Common.IOverlap{
		constructor(public x: number, public y: number){}
	}

	export class Box implements Common.IBox{
			
		constructor (public x: number, public y: number, public width : number, public height:number){
			
		}

		getLeft() {
			return this.x;
		}

		setLeft(left: number){
			this.x = left;
		}

		getRight(){
			return this.x + this.width;
		}

		setRight(right: number){
			this.width = right - this.x;
		}

		getTop(){
			return this.y;
		}

		setTop(top: number){
			this.y = top;
		}

		getBottom(){
			return this.y + this.height;
		}

		setBottom(bottom: number){
			this.height = bottom - this.y;
		}

		getOverlap(box: Box): Overlap{
			var xover = 0;
			var yover = 0;
			if(this.collides(box)){
				if(this.getLeft() < box.getRight()){
					xover = box.getRight() - this.getLeft();
				}
				if(box.getLeft() < this.getRight()){
					var tmp =  box.getLeft() - this.getRight();
					if(Math.abs(xover) > Math.abs(tmp)){
						xover = tmp;
					}
				}

				if(this.getBottom() > box.getTop()){
					yover = box.getTop() - this.getBottom();
				}

				if(box.getBottom() > this.getTop()){
					var tmp = box.getBottom() - this.getTop();
					if(Math.abs(yover) > Math.abs(tmp)){
						yover = tmp;
					}
				}

			}
			return new Overlap(xover,yover);
		}
		
		collides(box : Box){
			var w = 0.5 * (this.width + box.width);
			var h = 0.5 * (this.height + box.height);

			var dx = (this.x + this.width/2.0) - (box.x + box.width/2.0);
			var dy = (this.y + this.height/2.0) - (box.y + box.height/2.0);

			if (Math.abs(dx) < w && Math.abs(dy) < h)
			{
			    return true;
			}
		}
			
	}

		// Side scroller physics implementation w/o inertia
	export class SideScrollerPhysics implements Common.IPhysicsSystem {

		private gravity: number = 4;
		private onGround : boolean = false;
		private actors : Common.IActor[] = [];

		constructor(public actor: Common.IActor, public engine: Common.IEngine){
			actor.setPhysicsSystem(this);
		}

		addActor(actor: Common.IActor){
			this.actors.push(actor);
			actor.setPhysicsSystem(this);
		}

		removeActor(actor: Common.IActor){
			var index = this.actors.indexOf(actor);
			this.actors.splice(index,1);
		}

		getProperty(key: string): any{
			if(key == "onGround"){
				return this.onGround;
			}else{
				return "invalid property";
			}

		}

		setProperty(key: string, value: any){
			if(key == "onGround"){
				this.onGround = <boolean>value;
			}
		}


		setGravity(gravity: number){
			this.gravity = gravity;
		}

		update(delta: number){
			this.actor.setAy(this.gravity);

			this.setProperty("onGround", false);
			

			// Pseudo-Friction
			this.actor.setDx(0);

			// Test Collision
			for(var i = 0; i < this.engine.getLevel().length; i++){
				var levelBox = this.engine.getLevel()[i].getBox();
				
				if(this.actor.getBox().collides(levelBox)){

					var overlap = this.actor.getBox().getOverlap(levelBox);
					if(Math.abs(overlap.y) < Math.abs(overlap.x)){ 
						this.actor.adjustY(overlap.y); 
						this.actor.setDy(0);
						/// TODO: This isn't quite right since if we collide on the y we are considered "on the ground"
						this.setProperty("onGround", true);
					} else { 
						this.actor.adjustX(overlap.x); 
						this.actor.setDx(0);
					}
				}
			}
		}

	}

	// Side scroller physics implementation w inertia
	export class SideScrollerInertiaPhysics implements Common.IPhysicsSystem {

		private actors : Common.IActor[] = [];
		constructor(){

		}
		addActor(actor: Common.IActor){
			this.actors.push(actor);
			actor.setPhysicsSystem(this);
		}

		removeActor(actor: Common.IActor){
			var index = this.actors.indexOf(actor);
			this.actors.splice(index,1);
		}
		getProperty(key:string):any {
			return false;
		}
		setProperty(key:string, value: any){

		}
		update(delta: number){

		}		
	}

	// Top down game physics implementation
	export class TopDownPhysics implements Common.IPhysicsSystem {
		private friction : number = 0;
		private actors : Common.IActor[] = [];
		constructor(public engine: Common.IEngine){

		}

		addActor(actor: Common.IActor){
			this.actors.push(actor);
			actor.setPhysicsSystem(this);
		}

		removeActor(actor: Common.IActor){
			var index = this.actors.indexOf(actor);
			this.actors.splice(index,1);
		}

		setFriction(friction:number){
			this.friction = friction;
		}
		getProperty(key: string): any{
			return false;
		}

		setProperty(key: string, value: any){

		}

		update(delta: number){
			// Pseudo-Friction
			for(var id in this.actors){
				var actor = this.actors[id];
				if(actor.getDx() != 0){
					if(Math.abs(actor.getDx()) <= this.friction){
						actor.setDx(0);
					}else{
						actor.setDx(actor.getDx() + (actor.getDx()>0?-1:1)*this.friction);	
					}
				}

				if(actor.getDy() != 0){
					if(Math.abs(actor.getDy()) <= this.friction){
						actor.setDy(0);
					}else{
						actor.setDy(actor.getDy() + (actor.getDy()>0?-1:1)*this.friction);	
					}
				}

				//this.actor.dx = 0;
				//this.actor.dy = 0;

				// Test Collision
				for(var i = 0; i < this.engine.getLevel().length; i++){
					var levelBox = this.engine.getLevel()[i].getBox();
					
					if(actor.getBox().collides(levelBox)){

						var overlap = actor.getBox().getOverlap(levelBox);
						if(Math.abs(overlap.y) < Math.abs(overlap.x)){ 
							actor.adjustY(overlap.y); 
							actor.setDy(0);
						} else { 
							actor.adjustX(overlap.x); 
							actor.setDy(0);
						}
					}
				}
			}
		}
	}

}
