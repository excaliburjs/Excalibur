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

THIS SOFTWARE IS PROVIDED BY ERIK ONARHEIM ''AS IS'' AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL ERIK ONARHEIM BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

module Engine.Test{
	
}

module Algebra {
	export class Util {
		static Equals(x: number, y: number, delta: number){
			return (((x-delta) <= y) && (y <= (x+delta)));
		}
	}
}


module Engine {

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
		
		dx: number = 0;
		dy: number = 0;
		
		jumping : bool;
		onGround : bool;
		jumpFrames =0;
		jumpVel = -8;

		jumpSound : Sound;
		
		constructor (public x: number, public y: number, public width : number, public height:number){
			this.jumping = false;
			this.onGround = true;
			this.box = new Box(x,y,width,height);
			this.jumpSound = new Sound("../assets/smb_jump-small.wav");
		}
		update(engine: SimpleGame, delta: number){
			
		
			var keys = engine.keys;
			// Up key
			if(keys.indexOf(38)>-1 && this.onGround){
				//this.y += this.jumpVel;
				this.jumping = true;
				this.onGround = false;
				this.jumpSound.play();
			}
			
			if(this.jumping && this.jumpFrames < 10){
				this.dy += this.jumpVel;
				this.jumpFrames++;
			}
			
			if(!this.onGround){
				this.dy += this.gravity;
			}
			
			
			
			// Left key
			if(keys.indexOf(37)>-1){
				this.dx -= 6;
			}
			
			// Right key
			if(keys.indexOf(39)>-1){
				this.dx += 6;
			}
			this.box.x += this.dx;
			this.box.y += this.dy;
			for(var i = 0; i < engine.level.length; i++){
				var tmpBox = engine.level[i].boundingBox;
				
				
				if(this.box.collides(tmpBox)){				
					
					//this.box.y = tmpBox.y - this.box.height;
					this.jumping = false;
					this.onGround = true;
					this.jumpFrames = 0;
					
					this.box.x -= this.dx;
					this.box.y -= this.dy;
					break;
				}else if(!this.box.collidesBottom(tmpBox)){
					if(Algebra.Util.Equals(this.box.x,tmpBox.x+tmpBox.width,.1)){
						this.dx = 0;
						//this.box.x = tmpBox.x + tmpBox.width
						//break;
					}
									
					if(Algebra.Util.Equals(this.box.x+this.box.width,tmpBox.x,.1)){
						this.dy = 0;
						//this.box.x = tmpBox.x - this.box.width
						//break;
					}									
				
					this.onGround = false;
					
				}
			}
			
			this.dx = 0;
			this.dy = 0;
			
			
			//if(this.y > 100){
			//	this.y = 100;
			//	this.jumping = false;
			//	this.jumpFrames = 0;
			//}
		}
		
		draw(ctx : CanvasRenderingContext2D, delta: number){
			ctx.fillStyle = "rgb(" + String(200) + ", " + String(200) + ", " + String(200) + ")";
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
		
		collides(box : Box){
			return !((this.x + this.width < box.x) ||  
			   		 (this.x > box.x + box.width) ||
			   		 (this.y + this.height < box.y) ||
			   		 (this.y > box.y + box.height));
		}
		
		collidesBottom(box: Box){
			return (Algebra.Util.Equals(this.y+this.height,box.y,.1) && this.collides(box));
		}
		
		collidesTop(box: Box){
			
		}
		
		collidesLeft(box: Box){
			return (Algebra.Util.Equals(this.x,box.x+box.width,.1) && this.collides(box));
		}
		
		collidesRight(box: Box){
			return (Algebra.Util.Equals(this.x+this.width,box.x,.1) && this.collides(box));
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
		constructor(public width : number, public height : number, public fullscreen? : bool){
			this.actors = [];
		}
		
		update(engine: SimpleGame, delta: number){
			for(var i = 0; i< this.actors.length; i++){
				this.actors[i].update(engine, delta);
			}
		}
		
		draw(ctx, delta: number){
			// Draw Background color
			this.ctx.fillStyle = new Color(0,0,0).toString();
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

/*
// Create an start the game
var game = new Engine.SimpleGame(1000,500);

for(var i = 0; i< 5; i++){
	var color = new Engine.Color(Math.random()*255,Math.random()*255,Math.random()*255);
	//alert(color.toString());
	game.addBlock(new Engine.Block(new Engine.Box(100*i+10,200+Math.random()*100,50,50),color));
}
game.addActor(new Engine.Player(100,100,100,100));

//var box1 = new Engine.Box(0,0,10,10);
//var box2 = new Engine.Box(0,1,10,10);
//alert(String(box1.collides(box2)));
//alert(String(box1.collides(new Engine.Box(100,100,10,10))));

//alert(String(Algebra.Util.Equals(1,1.2,.1)));

game.start();
*/