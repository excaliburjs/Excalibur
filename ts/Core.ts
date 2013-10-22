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
/// <reference path="Log.ts" />
/// <reference path="Events.ts" />
/// <reference path="Entities.ts" />
/// <reference path="Algebra.ts" />
/// <reference path="Drawing.ts" />
/// <reference path="Camera.ts" />
/// <reference path="Common.ts" />
/// <reference path="Sound.ts" />



class Color {
	public static RED = 'red';
	public static BLUE = 'blue';
	public static GREEN = 'green';


	constructor(public r: number, public g: number, public b: number, public a?: number){
	}

	public static fromRGB(r : number, g : number, b : number) : string{
		return new Color(r,g,b).toString();
	}

	public static fromHex(hex : string) : string {
		if(/^#?[0-9a-f]{6}$/i.test(hex)){
			return hex;
		}
	}

	public toString(){
		var result =  String(this.r.toFixed(0)) + ", " + String(this.g.toFixed(0)) + ", " + String(this.b.toFixed(0));
		if(this.a){
			return "rgba(" + result + ", "+ String(this.a) + ")";
		}
		return "rgb(" + result + ")";
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


class Engine {
	public canvas : HTMLCanvasElement;
	public ctx : CanvasRenderingContext2D;
	public width : number;
	public height : number;

	private hasStarted : boolean = false;

	private eventDispatcher : EventDispatcher;
	
	public keys : number[] = [];
	public keysDown : number[] = [];
	public keysUp : number[] = [];

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
			this.keysUp.push(ev.keyCode);
			var keyEvent = new KeyUp(ev.keyCode);
			this.eventDispatcher.publish(EventType[EventType.KEYUP], keyEvent);
			this.currentScene.publish(EventType[EventType.KEYUP], keyEvent);

		});

		window.addEventListener('keydown', (ev: KeyboardEvent) => {
			if(this.keys.indexOf(ev.keyCode)=== -1){
				this.keys.push(ev.keyCode);
				this.keysDown.push(ev.keyCode);
				var keyEvent = new KeyDown(ev.keyCode);
				this.eventDispatcher.publish(EventType[EventType.KEYDOWN], keyEvent);
				this.currentScene.publish(EventType[EventType.KEYDOWN], keyEvent)

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

	public isKeyDown(key : Keys) : boolean {
		return this.keysDown.indexOf(key) > -1;
	}

	public isKeyPressed(key : Keys) : boolean {
		return this.keys.indexOf(key) > -1;
	}

	public isKeyUp(key : Keys) : boolean {
		return this.keysUp.indexOf(key) > -1;
	}

	private update(delta: number){
		this.eventDispatcher.update();
		this.currentScene.update(this, delta);

		var eventDispatcher = this.eventDispatcher;
		this.keys.forEach(function(key){
			eventDispatcher.publish(Keys[key], new KeyEvent(this, key));
		});
		// Reset keysDown and keysUp after update is complete
		this.keysDown.length = 0;
		this.keysUp.length = 0;
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
	// Test
	public stop(){
		if(this.hasStarted){
			this.hasStarted = false;
			this.logger.log("Game stopped", Log.DEBUG);
		}
	}

};

