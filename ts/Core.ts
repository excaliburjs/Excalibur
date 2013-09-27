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
LOSS OF USE, DATA, OR PROFITS; OR BUSIENSS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/// <reference path="MonkeyPatch.ts" />
/// <reference path="Action.ts" />
/// <reference path="Algebra.ts" />
/// <reference path="Drawing.ts" />
/// <reference path="Camera.ts" />
/// <reference path="Common.ts" />
/// <reference path="Physics.ts" />
/// <reference path="Sound.ts" />



class Color {
	constructor(public r: number, public g: number, public b: number, public a?: number){}
	toString(){
		var result =  String(this.r.toFixed(0)) + ", " + String(this.g.toFixed(0)) + ", " + String(this.b.toFixed(0));
		if(this.a){
			return "rgba(" + result + ", "+ String(this.a) + ")";
		}
		return "rgb(" + result + ")";
	}
}	


class Overlap {
	constructor(public x: number, public y: number){}
}

class SceneNode {
	public children : SceneNode[];
	constructor(actors?:SceneNode[]){
		this.children = actors || [];
	}

	update (engine : Engine, delta : number){
		this.children.forEach((actor)=>{
			actor.update(engine, delta);
		});
	}

	draw (ctx : CanvasRenderingContext2D, delta: number){
		this.children.forEach((actor)=>{
			actor.draw(ctx, delta);
		});
	}

	debugDraw(ctx : CanvasRenderingContext2D){
		this.children.forEach((actor)=>{
			actor.debugDraw(ctx);
		})
	}

	addChild(actor : SceneNode){
		this.children.push(actor);
	}

	removeChild(actor : SceneNode){
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


class Actor extends SceneNode {
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

	public solid = true;

	public animations : {[key : string] : Drawing.Animation;} = {};
	public currentAnimation: Drawing.Animation = null;

	public color: Color;
	constructor (x? : number,  y? : number,  width? : number, height? : number, color? : Color){
		super();
		this.x = x || 0;
		this.y = y || 0;
		this.width = width || 0;
		this.height = height || 0;
		this.color = color;
		this.actionQueue = new ActionQueue(this);
		this.eventDispatcher = new EventDispatcher(this);
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
		super.update(engine, delta);
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
      ctx.scale(this.scale, this.scale);
      ctx.rotate(this.rotation);

		super.draw(ctx, delta);

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

		super.debugDraw(ctx);

		ctx.beginPath();
		ctx.rect(0, 0, this.width, this.height);
		ctx.stroke();

		ctx.restore();
	}
}

class TextActor extends Actor {
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
	
enum Keys {
	NUM_1 = 97,
	NUM_2 = 98,
	NUM_3 = 99,
	NUM_4 = 100,
	NUM_5 = 101,
	NUM_6 = 102,
	NUM_7 = 103,
	NUM_8 = 104,
	NUM_9 = 105,
	NUM_0 = 96,
	NUM_LOCK = 144,
	SEMICOLON = 186,
	A = 65,
	B = 66,
	C = 67,
	D = 68,
	E = 69,
	F = 70,
	G = 71,
	H = 72,
	I = 73,
	J = 74,
	K = 75,
	L = 76,
	M = 77,
	N = 78,
	O = 79,
	P = 80,
	Q = 81,
	R = 82,
	S = 83,
	T = 84,
	U = 85,
	V = 86,
	W = 87,
	X = 88,
	Y = 89,
	Z = 90,
	SHIFT = 16,
	ALT = 18,
	UP = 38,
	DOWN = 40,
	LEFT = 37,
	RIGHT = 39,
	SPACE = 32,
	ESC = 27
};


enum Log {
	DEBUG,
	INFO,
	WARN,
	ERROR,
	FATAL
}

interface IAppender {
	log(message : string, level : Log);
}

class ConsoleAppender implements IAppender {
	constructor(){}
	public log(message: string, level: Log){
		if (level < Log.WARN){
			console.log("["+Log[level]+"] : " + message);
		} else if (level < Log.ERROR){
			console.warn("["+Log[level]+"] : " + message);
		} else {
			console.error("["+Log[level]+"] : " + message);
		}
	}
}

class ScreenAppender implements IAppender {
	
	private _messages : string[] = [];
	private canvas : HTMLCanvasElement;
	private ctx : CanvasRenderingContext2D;
	constructor(width? : number, height? : number){
		this.canvas = <HTMLCanvasElement>document.createElement('canvas');
		this.canvas.width = width || window.innerWidth;
		this.canvas.height = height || window.innerHeight;
		this.canvas.style.position = 'absolute';
		this.ctx = this.canvas.getContext('2d');
		document.body.appendChild(this.canvas);
	}

	public log(message: string, level: Log){
		//this.ctx.fillStyle = 'rgba(0,0,0,1.0)';
		this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);


		this._messages.unshift("["+Log[level]+"] : " + message);

		var pos = 10;
		var opacity = 1.0;
		for(var i = 0; i < this._messages.length; i++){
			this.ctx.fillStyle = 'rgba(255,255,255,'+opacity.toFixed(2)+')';
			var message = this._messages[i];
			this.ctx.fillText(message, 200, pos);
			pos += 10;
			opacity = opacity>0?opacity-.05:0;
		}
	}

}

class Logger {
	private static _instance : Logger = null;
	private appenders : IAppender[] = [];
	public defaultLevel : Log = Log.INFO;

	constructor(){
		if(Logger._instance){
			throw new Error("Logger is a singleton");
		}
		Logger._instance = this;
	}

	public static getInstance() : Logger {
		if(Logger._instance == null){
			Logger._instance = new Logger();
		}
		return Logger._instance;
	}

	public addAppender(appender: IAppender){
		this.appenders.push(appender);
	}

	public log(message: string, level?: Log){
		if(level == null){
			level = this.defaultLevel;
		}
		var defaultLevel = this.defaultLevel;
		this.appenders.forEach(function(appender){
			if(level >= defaultLevel){
				appender.log(message, level);
			}
		});
	}
}


enum EventType {
	KEYDOWN,
	KEYUP,
	KEYPRESS,
	MOUSEDOWN,
	MOUSEUP,
	MOUSECLICK,
	USEREVENT,
	COLLISION,
	BLUR,
	FOCUS,
	UPDATE
}

class ActorEvent {
	constructor(){}
}

class CollisonEvent extends ActorEvent {
	constructor(public actor : Actor, public other : Actor, public side : Side) {
		super();
	}
}

class UpdateEvent extends ActorEvent {
	constructor(public delta : number){
		super();
	}
}

class KeyEvent extends ActorEvent {
	constructor(public actor : Actor, public key : Keys){
		super();
	}
}

class KeyDown extends ActorEvent {
	constructor(public key : Keys){
		super();
	}
}

class KeyUp extends ActorEvent {
	constructor(public key : Keys){
		super();
	}
}

class KeyPress extends ActorEvent {
	constructor(public key : Keys){
		super();
	}
}

class EventDispatcher {
	private _handlers : {[key : string] : { (event?: ActorEvent) : void}[]; } = {};
	private queue : {(any: void):void}[] = [];
	private target : any;
	constructor(target){
		this.target = target;
	}

	public publish(eventName: string, event?: ActorEvent){
		eventName = eventName.toLowerCase();
		var queue = this.queue;
		var target = this.target;
		if(this._handlers[eventName]){
			this._handlers[eventName].forEach(function(callback){
				queue.push(function(){
					callback.call(target, event);
				});
			});
		}
	}

	public subscribe(eventName: string, handler: (event?: ActorEvent) => void){
		eventName = eventName.toLowerCase();
		if(!this._handlers[eventName]){
			this._handlers[eventName] = [];
		}
		this._handlers[eventName].push(handler);
	}

	public update(){
		var callback;
		while(callback = this.queue.shift()){
			callback();
		}
	}

}

class Engine {
	public canvas : HTMLCanvasElement;
	public ctx : CanvasRenderingContext2D;
	public width : number;
	public height : number;

	private hasStarted : boolean = false;

	private eventDispatcher : EventDispatcher;
	
	public keys : number[] = [];
	public camera : Camera.ICamera;

	public currentScene : SceneNode;
	public rootScene : SceneNode;
	//public camera : ICamera;
	public isFullscreen : boolean = false;
	public isDebug : boolean = false;
	public debugColor : Color = new Color(255,255,255);
	public backgroundColor : Color = new Color(0,0,100);
	private logger : Logger;
	constructor(width?:number, height?:number, canvasElementId?:string){
		this.logger = Logger.getInstance();
		this.logger.addAppender(new ConsoleAppender);
		this.logger.log("Building engine...", Log.DEBUG);

		this.eventDispatcher = new EventDispatcher(this);

		this.rootScene = this.currentScene = new SceneNode();
		if(canvasElementId){
			this.logger.log("Using Canvas element specified: " + canvasElementId, Log.DEBUG);
			this.canvas = <HTMLCanvasElement>document.getElementById(canvasElementId);
		} else{
			this.logger.log("Using generated canvas element", Log.DEBUG);
			this.canvas = <HTMLCanvasElement>document.createElement('canvas');
		}
		if(width && height){
			this.logger.log("Engine viewport is size " + width + " x " + height, Log.DEBUG);
			this.width = this.canvas.width = width;
			this.height = this.canvas.height = height;	
		} else {
			this.logger.log("Engine viewport is fullscreen", Log.DEBUG);
			this.isFullscreen = true;
		}

		this.init();

	}

	public addEventListener(eventName : string,  handler: (event?: ActorEvent) => void){
		this.eventDispatcher.subscribe(eventName, handler);
	}
	
	public addChild(actor: Actor){
		this.currentScene.addChild(actor);
	}

	public removeChild(actor: Actor){
		this.currentScene.removeChild(actor);
	}

	getWidth() : number {
		return this.width;
	}

	getHeight() : number {
		return this.height;
	}
	
	private init(){
		if(this.isFullscreen){
			document.body.style.margin = '0px';
			document.body.style.overflow = 'hidden';
			this.width = this.canvas.width = window.innerWidth;
			this.height = this.canvas.height = window.innerHeight;

			window.addEventListener('resize', (ev: UIEvent) => {
				this.logger.log("View port resized", Log.DEBUG);
				this.width = this.canvas.width = window.innerWidth;
				this.height = this.canvas.height = window.innerHeight;
			});
		}

		window.addEventListener('blur', (ev: UIEvent) => {
			this.keys.length = 0; // empties array efficiently
		});

		window.addEventListener('keyup', (ev: KeyboardEvent) => {
			var key = this.keys.indexOf(ev.keyCode);
			this.keys.splice(key,1);
			this.eventDispatcher.publish(EventType[EventType.KEYUP], new KeyUp(ev.keyCode));

		});

		window.addEventListener('keydown', (ev: KeyboardEvent) => {
			if(this.keys.indexOf(ev.keyCode)=== -1){
				this.keys.push(ev.keyCode);
				this.eventDispatcher.publish(EventType[EventType.KEYDOWN], new KeyDown(ev.keyCode));
			}
		});

		window.addEventListener('mousedown', ()=>{
			// TODO: Collect events
			this.eventDispatcher.update();
		});

		window.addEventListener('mouseup', ()=>{
			// TODO: Collect events
			this.eventDispatcher.update();
		});

		window.addEventListener('blur', ()=>{
			this.eventDispatcher.publish(EventType[EventType.BLUR]);
			this.eventDispatcher.update()
		});

		window.addEventListener('focus', ()=>{
			this.eventDispatcher.publish(EventType[EventType.FOCUS]);
			this.eventDispatcher.update()
		});


		this.ctx = this.canvas.getContext('2d');
		document.body.appendChild(this.canvas);
	}

	private update(delta: number){
		this.eventDispatcher.update();
		this.currentScene.update(this, delta);

		var eventDispatcher = this.eventDispatcher;
		this.keys.forEach(function(key){
			eventDispatcher.publish(Keys[key], new KeyEvent(this, key));
		});
	}

	private draw(delta: number){
		var ctx = this.ctx;
		ctx.clearRect(0,0,this.width,this.height);
		ctx.fillStyle =  this.backgroundColor.toString();
		ctx.fillRect(0,0,this.width,this.height);

		// Draw debug information
		if(this.isDebug){

			this.ctx.font = "Consolas";
			this.ctx.fillStyle = this.debugColor.toString();
			for (var j = 0; j < this.keys.length; j++){
				this.ctx.fillText(this.keys[j].toString() + " : " + (Keys[this.keys[j]]?Keys[this.keys[j]]:"Not Mapped"),100, 10*j+10);
			}

			var fps = 1.0/(delta/1000);
			this.ctx.fillText("FPS:" + fps.toFixed(2).toString(), 10, 10);


		}

		this.ctx.save();

		if(this.camera){
			this.camera.applyTransform(this, delta);	
		}

		
		this.currentScene.draw(this.ctx, delta);

		if(this.isDebug){
			this.ctx.strokeStyle = 'yellow'
			this.currentScene.debugDraw(this.ctx);
		}


		this.ctx.restore();
	}

	public start(){
		if(!this.hasStarted){
			this.hasStarted = true;
			this.logger.log("Starting game...", Log.DEBUG);
			// Mainloop
			var lastTime =  Date.now();
	    	var game = this;
	    	(function mainloop(){
	    		if(!game.hasStarted){
	    			return;
	    		}

				window.requestAnimationFrame(mainloop);

				// Get the time to calculate time-elapsed
				var now = Date.now();
        		var elapsed = Math.floor(now - lastTime) || 1;

				game.update(elapsed);



				game.draw(elapsed);

				lastTime = now;
			})();
			this.logger.log("Game started", Log.DEBUG);
		}else{
			// Game already started;
		}

	}

	public stop(){
		if(this.hasStarted){
			this.hasStarted = false;
			this.logger.log("Game stopped", Log.DEBUG);
		}
	}

};

