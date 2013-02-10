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


/// <reference path="Algebra.ts" />
module Engine {

	export class Key {
		constructor(public keyName:string, public keyCode:number){

		}
	}

	export class Sound {
		sound : HTMLAudioElement;
		constructor(public path: string){
			this.sound = new Audio(path);
			this.sound.preload = "false";
		}


		play() {
			//document.body.appendChild(this.sound);
			this.sound.play();
			//this.sound.play();
		}
	}


	export interface Actor {
		update(engine: SimpleGame, delta: number);
		draw(ctx: CanvasRenderingContext2D, delta: number);
	}

	export class Color {
		constructor(public r: number, public g: number, public b: number){

		}

		toString(){
			return "rgb(" + String(this.r.toFixed(0)) + ", " + String(this.g.toFixed(0)) + ", " + String(this.b.toFixed(0)) + ")";
		}
	}

	export class Player implements Actor {
		
		box : Box;
		gravity : number = 4;

		// Initial velocity is 0
		dx: number = 0;
		dy: number = 0;
		
		// Initial acceleartion is 0;
		ax: number = 0;
		ay: number = 0;
		onGround : bool;

		// List of key handlers for a player
		// (player:Player => void) [];
		handlers : any [];

		constructor (public x: number, public y: number, public width : number, public height:number){
			this.onGround = false;
			this.box = new Box(x,y,width,height);
			
			this.ay = this.gravity;
		}

		addKeyHandler(key:Key, handler: (player:Player) => void){
			this.handlers.push(handler);
		}

		update(engine: SimpleGame, delta: number){
			
			// Key Input
			var keys = engine.keys;

			// Left key
			if(keys.indexOf(37)>-1){
				this.dx -= 6;
			}
			
			// Right key
			if(keys.indexOf(39)>-1){
				this.dx += 6;
			}

			// Up key
			if(keys.indexOf(38)>-1 && this.onGround){
				this.dy = -30;
				this.onGround = false;
			}

			// Update placements based on physics
			this.box.x += this.dx;
			this.box.y += this.dy;

			this.dx += this.ax;
			this.dy += this.ay;
			
			this.onGround = false;

			// Pseudo-Friction
			this.dx = 0;

			// Test Collision
			for(var i = 0; i < engine.level.length; i++){
				var levelBox = engine.level[i].boundingBox;
				
				if(this.box.collides(levelBox)){

					// Collision is on the bottom
					if(this.box.getBottom() > levelBox.getTop()){
						this.dy = 0;
						this.box.y = levelBox.getTop() - this.height;
						this.onGround = true;	
					}else{
						// Collision is left 
						if(this.box.getLeft() + this.dx < levelBox.getRight()){
							alert();
							this.dx = 0;
							this.box.x = levelBox.getRight();
						// Collision is right
						}else	if(this.box.getRight() + this.dx > levelBox.getLeft()){
							alert();
							this.dx = 0;
							this.box.x = levelBox.getLeft() - this.width;
						}
					}

				}
			}



			
		}
		
		draw(ctx : CanvasRenderingContext2D, delta: number){
			ctx.fillStyle = "rgb(" + String(245) + ", " + String(110) + ", " + String(148) + ")";
			ctx.fillRect(this.box.x,this.box.y,this.box.width,this.box.height);
		}
	}
	export class Block implements Actor {
		color : Color;
		constructor(public boundingBox:Box, color: Color){
			this.color = color;	
		}
		
		toString(){
			return "[x:" + this.boundingBox.x + ", y:" + this.boundingBox.y + ", w:" + this.boundingBox.width + ", h:" + this.boundingBox.height +"]";
		}
		
		update(engine: SimpleGame, delta: number){
			
		}
		draw(ctx: CanvasRenderingContext2D, delta: number){
			
			ctx.fillStyle = this.color.toString();			
			ctx.fillRect(this.boundingBox.x,this.boundingBox.y,this.boundingBox.width,this.boundingBox.height);
		}
	}

	export class Box {
		
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

		collidesLeftRightWithVel(box: Box, dx: number, dy: number){
			return ((this.getLeft() + dx < box.getRight() && box.getRight() < this.getRight() + dx) ||
					 (this.getLeft() + dx < box.getLeft() && box.getLeft() < this.getRight() + dx )) &&
					 ((this.getTop() + dy < box.getBottom() && box.getBottom() < this.getBottom() + dy) ||
					 (this.getTop()  + dy < box.getTop() && box.getTop() < this.getBottom() + dy));
		}
		
		collides(box : Box){
			return ((this.getLeft() < box.getRight() && box.getRight() < this.getRight()) ||
					 (this.getLeft() < box.getLeft() && box.getLeft() < this.getRight())) &&
					 ((this.getTop() < box.getBottom() && box.getBottom() < this.getBottom()) ||
					 (this.getTop() < box.getTop() && box.getTop() < this.getBottom()));
		}
		
		collidesLeft(box: Box){
			var result: bool;
			result = ((this.getLeft() < box.getRight() && box.getRight() < this.getRight()) ||
					   (this.getLeft() < box.getLeft() && box.getLeft() < this.getRight()))
			return result;
		}
		
		// TODO: Implement
		collidesTop(box: Box){
			return false;
		}
		
		collidesBottom(box: Box){
			var result: bool;
			result = ((this.getTop() < box.getBottom() && box.getBottom() < this.getBottom()) ||
					 (this.getTop() < box.getTop() && box.getTop() < this.getBottom()));

			return result;
		}
		
		collidesRight(box: Box){
			return (Algebra.Util.Equals(this.getRight(),box.getLeft(),.1) && this.collides(box));
		}
			
	}

	export class Image {
		constructor (public path: string){
			
		}
		
		draw(){
			
		}
	}

	export class Sprite {
		constructor (public images: Image[], public duration: number){
			
		}
		
		draw(){
			
		}
	}

	export class SimpleGame {
		
		debugFontSize = 50;
		actors: Actor[] = [];
		level: Block[] = [];
		keys = [];
		canv = <HTMLCanvasElement>document.createElement("canvas");
		ctx: CanvasRenderingContext2D;
		constructor(public width : number, public height : number, public fullscreen? : bool, public backgroundColor?: Color){
			this.actors = [];
		}
		
		update(engine: SimpleGame, delta: number){
			for(var i = 0; i< this.actors.length; i++){
				this.actors[i].update(engine, delta);
			}
		}
		
		draw(ctx, delta: number){
			if(!this.backgroundColor){
				this.backgroundColor = new Color(0,0,0);
			}
			// Draw Background color
			this.ctx.fillStyle = this.backgroundColor.toString();
			this.ctx.fillRect(0,0,this.width,this.height);
			
			// Draw debug information
			this.ctx.fillStyle = new Color(250,0,0).toString();
			for (var j = 0; j < this.keys.length; j++){
				this.ctx.fillText(this.keys[j],10, 10*j+10)
			}
			
			// Draw level
			for(var k = 0; k< this.level.length; k++){
				this.level[k].draw(ctx, delta);
			}

			// Draw actors
			for(var i = 0; i< this.actors.length; i++){
				this.actors[i].draw(ctx, delta);
			}
		}
		
		addActor(actor: Actor){
			this.actors.push(actor);
		}
		
		addBlock(block: Block){
			this.level.push(block);
		}
		
		start(){
			// Mainloop
			window.setInterval(()=> {
				this.update(this, 20); 
				this.draw(this.ctx,20);
			},20);

			// Capture key events
			window.onkeydown = (ev)=>{if(this.keys.indexOf(ev.keyCode)<0){this.keys.push(ev.keyCode)}};
			window.onkeyup = (ev)=>{var key = this.keys.indexOf(ev.keyCode); this.keys.splice(key,1);};

			// Setup canvas drawing surface in DOM
			this.canv.width = this.width;
	    	this.canv.height = this.height;
	    	if(this.fullscreen){
		    	document.body.style.margin = "0";
		    	this.canv.style.width = "100%";
		    	this.canv.style.height = "100%";
	    	}
	    	document.body.appendChild(this.canv);
	    	this.ctx = this.canv.getContext("2d");
		}
		
	}

}