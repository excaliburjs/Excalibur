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

	update (engine: Engine, delta: number){
		this.children.forEach((actor)=>{
			actor.update(engine, delta);
		});
	}

	draw (ctx: CanvasRenderingContext2D, delta: number){
		this.children.forEach((actor)=>{
			actor.draw(ctx, delta);
		});
	}

	addChild(actor: SceneNode){
		this.children.push(actor);
	}

	removeChild(actor: SceneNode){
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
class Action{
	constructor(){}
}

class Actor extends SceneNode {
	public x: number = 0;
	public y: number = 0;
	public height : number = 0;
	public width : number = 0;

	public dx: number = 0;
	public dy: number = 0;
	public ax: number = 0;
	public ay: number = 0;

	private actionQueue : Action = [];

	public fixed = true;

	public animations : {[key:string]:Drawing.Animation;} = {};
	public currentAnimation: Drawing.Animation = null;

	public color: Color;
	constructor (x? : number,  y? : number,  width? : number, height? : number, color? : Color){
		super();
		this.x = x || 0;
		this.y = y || 0;
		this.width = width || 0;
		this.height = height || 0;
		this.color = color;
	}

	// Play animation in Actor's list
	playAnimation(key){
		this.currentAnimation = this.animations[<string>key];
	}

	addEventListener(eventName: string, handler : (data: any) => void){
		EventDispatcher.getInstance().subscribe(eventName, handler);
	}

	getLeft() {
		return this.x;
	}
	getRight() {
		return this.x + this.width;
	}
	getTop() {
		return this.y;
	}
	getBottom() {
		return this.y + this.height;
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
		var w = 0.5 * (this.width + box.width);
		var h = 0.5 * (this.height + box.height);

		var dx = (this.x + this.width/2.0) - (box.x + box.width/2.0);
		var dy = (this.y + this.height/2.0) - (box.y + box.height/2.0);

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

		return this;
	}

	public moveBy(x : number, y : number, time : number) : Actor {

		return this;
	}
	

	public update(engine: Engine, delta: number){
		super.update(engine, delta);
		// Update action queue

		
		// Update placements based on linear algebra
		this.x += this.dx * delta;
		this.y += this.dy * delta;

		this.dx += this.ax;
		this.dy += this.ay;

		// Publish collision events
		for(var i = 0; i < engine.currentScene.children.length; i++){
			var other = engine.currentScene.children[i];
			var side : Side = Side.NONE;
			if(other !== this &&
				(side = this.collides(<Actor>other)) !== Side.NONE){
				var overlap = this.getOverlap(<Actor>other);
				EventDispatcher.getInstance().publish(EventType[EventType.COLLISION], {actor: this, side: side});
				if(!this.fixed){
					if(Math.abs(overlap.y) < Math.abs(overlap.x)){ 
						this.y += overlap.y; 
						this.dy = 0;
					} else { 
						this.x += overlap.x; 
						this.dx = 0;
					}
				}
			}
		}

	}
	draw(ctx: CanvasRenderingContext2D, delta: number){
		super.draw(ctx, delta);

		if(this.currentAnimation){
			this.currentAnimation.draw(ctx, this.x, this.y);
		}else{

			ctx.fillStyle = this.color?this.color.toString():(new Color(0,0,0)).toString();
			ctx.fillRect(this.x,this.y,this.width,this.height);				
		}

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
	log(message: string, level: Log);
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
	constructor(){
		this.canvas = <HTMLCanvasElement>document.createElement('canvas');
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
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
	KEY_DOWN,
	KEY_UP,
	KEY_HOLD,
	MOUSE_DOWN,
	MOUSE_UP,
	MOUSE_CLICK,
	USER_EVENT,
	COLLISION,
	WINDOW_BLUR,
	UPDATE
}


class EventDispatcher {
	private static _instance : EventDispatcher;
	private _handlers : {[key:string] : { (data: any):void}[];} = {};
	constructor(){
		if(EventDispatcher._instance){
			throw new Error("EventDispatcher is a singleton");
		}
		EventDispatcher._instance = this;
	}

	public publish(eventName: string, data: any){
		if(this._handlers[eventName]){
			this._handlers[eventName].forEach(function(callback){
				callback(data);
			});
		}else{
			//Logger.getInstance().log("No handler registered for event " + eventName, Log.WARN);
		}
	}

	public subscribe(eventName: string, handler: (data: any)=>void){
		if(!this._handlers[eventName]){
			this._handlers[eventName] = [];
		}
		this._handlers[eventName].push(handler);
	}

	public static getInstance() : EventDispatcher{
		if(EventDispatcher._instance == null){
			EventDispatcher._instance = new EventDispatcher();
		}
		return EventDispatcher._instance;
	}
}

class Engine {
	public canvas : HTMLCanvasElement;
	public ctx : CanvasRenderingContext2D;
	public width : number;
	public height : number;

	private hasStarted : boolean = false;

	
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
			this.width = width;
			this.height = height;	
		} else {
			this.logger.log("Engine viewport is fullscreen", Log.DEBUG);
			this.isFullscreen = true;
		}

		this.init();

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
		});

		window.addEventListener('keydown', (ev: KeyboardEvent) => {
			if(this.keys.indexOf(ev.keyCode)=== -1){
				this.keys.push(ev.keyCode);
			}
		});

		window.addEventListener('mousedown', ()=>{
			// TODO: Collect events
		});

		window.addEventListener('mouseup', ()=>{
			// TODO: Collect events
		});


		this.ctx = this.canvas.getContext('2d');
		document.body.appendChild(this.canvas);
	}

	private update(delta: number){
		this.currentScene.update(this, delta/1000);

		// Publish events
		this.keys.forEach(function(key){
			EventDispatcher.getInstance().publish(Keys[key], key);
		});

		EventDispatcher.getInstance().publish(EventType[EventType.UPDATE], delta/1000);
	}

	private draw(delta: number){
		var ctx = this.ctx;
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

		this.ctx.restore();
	}

	public start(){
		if(!this.hasStarted){
			this.hasStarted = true;
			this.logger.log("Starting mainloop...", Log.DEBUG);
			// Mainloop
			var lastTime =  Date.now();
	    	var game = this;
	    	(function mainloop(){
				window.requestAnimationFrame(mainloop);

				// Get the time to calculate time-elapsed
				var now = Date.now();
        		var elapsed = Math.floor(now - lastTime);

				game.update(elapsed); 
				game.draw(elapsed);

				lastTime = now;
			})();
			this.logger.log("Mainloop started", Log.DEBUG);
		}else{
			// Game already started;
			throw new Error("Engine already started");
		}

	}

};

