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
   This product includes software developed by the ExcaliburJS Team.
4. Neither the name of the creator nor the
   names of its contributors may be used to endorse or promote products
   derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE EXCALIBURJS TEAM ''AS IS'' AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE EXCALIBURJS TEAM BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSIENSS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/// <reference path="Core.ts" />
/// <reference path="Algebra.ts" />

class Overlap {
	constructor(public x: number, public y: number){}
}

class SceneNode {
	public children : Actor[];
	constructor(actors?:Actor[]){
		this.children = actors || [];
	}

	update (engine : Engine, delta : number){
		this.children.forEach((actor)=>{
			actor.update(engine, delta);
		});
	}

	draw(ctx : CanvasRenderingContext2D, delta: number){
		this.children.forEach((actor)=>{
			actor.draw(ctx, delta);
		});
	}

	debugDraw(ctx : CanvasRenderingContext2D){
		this.children.forEach((actor)=>{
			actor.debugDraw(ctx);
		})
	}

	addChild(actor : Actor){
		this.children.push(actor);
	}

	removeChild(actor : Actor){
		var index = this.children.indexOf(actor);
		this.children.splice(index,1);
	}
};

enum Side {
	TOP,
	BOTTOM,
	LEFT,
	RIGHT,
	NONE
}


class Actor {
	public x: number = 0;
	public y: number = 0;
	private height : number = 0;
	private width : number = 0;
	public rotation : number = 0; // radians
	public rx : number = 0; //radions/sec

	public scale : number = 1;
	public sx : number = 0; //scale/sec

	public dx : number = 0; // pixels/sec
	public dy : number = 0;
	public ax : number = 0; // pixels/sec/sec
	public ay : number = 0;

	public invisible : boolean = false;

	private actionQueue : ActionQueue;

	private eventDispatcher : EventDispatcher;

	private sceneNode : SceneNode;

	public solid = true;

	public animations : {[key : string] : Drawing.Animation;} = {};
	public currentAnimation: Drawing.Animation = null;

	public color: Color;
	constructor (x? : number,  y? : number,  width? : number, height? : number, color? : Color){
		this.x = x || 0;
		this.y = y || 0;
		this.width = width || 0;
		this.height = height || 0;
		this.color = color;
		this.actionQueue = new ActionQueue(this);
		this.eventDispatcher = new EventDispatcher(this);
		this.sceneNode = new SceneNode();
	}

	public addChild(actor : Actor){
		this.sceneNode.addChild(actor);
	}

	public removeChild(actor : Actor){
		this.sceneNode.removeChild(actor);
	}

	// Play animation in Actor's list
	public playAnimation(key){

		if(this.currentAnimation != this.animations[<string>key]){
			this.animations[<string>key].reset();
		}
		this.currentAnimation = this.animations[<string>key];		
	}

	public addEventListener(eventName : string, handler : (event?: ActorEvent) => void){
		this.eventDispatcher.subscribe(eventName, handler);
	}

	public triggerEvent(eventName : string, event? : ActorEvent){
		this.eventDispatcher.publish(eventName, event);
	}

	public getCenter() : Vector {
		return new Vector(this.x + this.getWidth()/2, this.y + this.getHeight()/2);
	}

	public getWidth() {
		return this.width * this.scale;
	}

	public getHeight(){
		return this.height * this.scale;
	}

	public getLeft() {
		return this.x;
	}
	public getRight() {
		return this.x + this.getWidth();
	}
	public getTop() {
		return this.y;
	}
	public getBottom() {
		return this.y + this.getHeight();
	}

	private getOverlap(box: Actor): Overlap {
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
		
	public collides(box : Actor) : Side{
		var w = 0.5 * (this.getWidth() + box.getWidth());
		var h = 0.5 * (this.getHeight() + box.getHeight());

		var dx = (this.x + this.getWidth()/2.0) - (box.x + box.getWidth()/2.0);
		var dy = (this.y + this.getHeight()/2.0) - (box.y + box.getHeight()/2.0);

		if (Math.abs(dx) < w && Math.abs(dy) < h){
			// collision detected
		   var wy = w * dy;
		   var hx = h * dx;

		   if(wy > hx){
		    	if(wy > -hx){
		    		return Side.TOP;
	    		}else{
	    			return Side.LEFT
	    		}		   
		   }else{
		   	if(wy > -hx){
		   		return Side.RIGHT;
		   	}else{
		   		return Side.BOTTOM;
		   	}
		   }
		}

		return Side.NONE;
	}

	public within(actor: Actor, distance : number): boolean{
		return Math.sqrt(Math.pow(this.x - actor.x, 2) + Math.pow(this.y - actor.y, 2)) <= distance;
	}
	

	// Add an animation to Actor's list
	public addAnimation(key:any, animation: Drawing.Animation){
		this.animations[<string>key] = animation;
		if(!this.currentAnimation){
			this.currentAnimation = animation;
		}
	}

	// Actions
	public moveTo(x : number, y : number, speed : number) : Actor {
		this.actionQueue.add(new MoveTo(this, x, y, speed));
		return this;
	}

	public moveBy(x : number, y : number, time : number) : Actor {
		this.actionQueue.add(new MoveBy(this, x, y, time));
		return this;
	}

	public rotateTo(angleRadians: number, speed : number) : Actor {
		this.actionQueue.add(new RotateTo(this, angleRadians, speed));
		return this;
	}

	public rotateBy(angleRadians: number, time : number) : Actor {
		this.actionQueue.add(new RotateBy(this, angleRadians, time));
		return this;
	}

	public scaleTo(size: number, speed: number) : Actor {
		this.actionQueue.add(new ScaleTo(this, size, speed));
		return this;
	}

	public scaleBy(size: number, time: number) : Actor {
		this.actionQueue.add(new ScaleBy(this, size, time));
		return this;
	}

	public blink(frequency : number, duration : number) : Actor {
		this.actionQueue.add(new Blink(this, frequency, duration));
		return this;
	}

	public delay(seconds: number) : Actor {
		this.actionQueue.add(new Delay(this, seconds));
		return this;
	}

	public repeat(times?: number) : Actor {
		if(!times){
			this.repeatForever();
			return this;
		}
		this.actionQueue.add(new Repeat(this, times, this.actionQueue.getActions()));

		return this;
	}

	public repeatForever() : Actor{
		this.actionQueue.add(new RepeatForever(this, this.actionQueue.getActions()));
		return this;
	}
	

	public update(engine: Engine, delta: number){
		this.sceneNode.update(engine, delta);
		var eventDispatcher = this.eventDispatcher;

		// Update event dispatcher
		eventDispatcher.update();

		// Update action queue
		this.actionQueue.update(delta);
		
		// Update placements based on linear algebra
		this.x += this.dx * delta/1000;
		this.y += this.dy * delta/1000;

		//this.dx += this.ax * delta/1000;
		//this.dy += this.ay * delta/1000;
		//this.dx = 0;
		//this.dy = 0;

		this.rotation += this.rx * delta/1000;

		this.scale += this.sx * delta/1000;


		// Publish collision events
		for(var i = 0; i < engine.currentScene.children.length; i++){
			var other = engine.currentScene.children[i];
			var side : Side = Side.NONE;
			if(other !== this &&
				(side = this.collides(<Actor>other)) !== Side.NONE){
				var overlap = this.getOverlap(<Actor>other);
				eventDispatcher.publish(EventType[EventType.COLLISION], new CollisonEvent(this, (<Actor>other), side));
				if(!this.solid){
					if(Math.abs(overlap.y) < Math.abs(overlap.x)){ 
						this.y += overlap.y; 
						//this.dy = 0;
						//this.dx += (<Actor>other).dx;
					} else { 
						this.x += overlap.x; 
						//this.dx = 0;
						//this.dy += (<Actor>other).dy;
					}

				}
			}
		}		

		// Publish other events
		engine.keys.forEach(function(key){
			eventDispatcher.publish(Keys[key], new KeyEvent(this, key));
		});

		eventDispatcher.publish(EventType[EventType.UPDATE], new UpdateEvent(delta));
	}

	public draw(ctx: CanvasRenderingContext2D, delta: number){

      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.scale(this.scale, this.scale);

		this.sceneNode.draw(ctx, delta);

		if(!this.invisible){
			if(this.currentAnimation){
				this.currentAnimation.draw(ctx, 0, 0);
			}else{
				ctx.fillStyle = this.color ? this.color.toString() : (new Color(0, 0, 0)).toString();
				ctx.fillRect(0, 0, this.width, this.height);				
			}
		}
		ctx.restore();
	}

	public debugDraw(ctx: CanvasRenderingContext2D){
		// Meant to draw debug information about actors
		ctx.save();
		ctx.translate(this.x, this.y);

		
		ctx.scale(this.scale, this.scale);
		// Currently collision primitives cannot rotate 
		// ctx.rotate(this.rotation);

		this.sceneNode.debugDraw(ctx);

		ctx.beginPath();
		ctx.rect(0, 0, this.width, this.height);
		ctx.stroke();

		ctx.restore();
	}
}

class Label extends Actor {
	public text : string;
	public spriteFont : Drawing.SpriteFont;
	constructor(text? : string, x? : number, y? : number, spriteFont? : Drawing.SpriteFont){
		super(x, y);
		this.text = text || "";
		this.spriteFont = spriteFont;
	}

	public update(engine: Engine, delta: number){
		super.update(engine, delta);
	}

	public draw(ctx: CanvasRenderingContext2D, delta: number){

		ctx.save();
      ctx.translate(this.x, this.y);
      ctx.scale(this.scale, this.scale);
      ctx.rotate(this.rotation);
		if(this.spriteFont){
			this.spriteFont.draw(ctx, 0, 0, this.text);	
		}else{
			ctx.fillStyle = 'black';
			ctx.fillText(this.text, 0, 0);
		}
		
		super.draw(ctx, delta);
		ctx.restore();
	}

	public debugDraw(ctx: CanvasRenderingContext2D){
		super.debugDraw(ctx);
	}

}