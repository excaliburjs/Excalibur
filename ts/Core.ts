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
/// <reference path="Loader.ts" />
/// <reference path="Promises.ts" />


class Color {
   public static Black : Color = Color.fromHex('#000000');
   public static White : Color = Color.fromHex('#FFFFFF');
   public static Yellow : Color = Color.fromHex('#00FFFF');
   public static Orange : Color  = Color.fromHex('#FFA500');
   public static Red : Color  = Color.fromHex('#FF0000');
   public static Vermillion : Color  = Color.fromHex('#FF5B31');
   public static Rose : Color  = Color.fromHex('#FF007F');
   public static Magenta : Color  = Color.fromHex('#FF00FF');
   public static Violet : Color  = Color.fromHex('#7F00FF');
   public static Blue : Color  = Color.fromHex('#0000FF');
   public static Azure : Color  = Color.fromHex('#007FFF');
   public static Cyan : Color  = Color.fromHex('#00FFFF');
   public static Viridian : Color  = Color.fromHex('#59978F');
   public static Green : Color  = Color.fromHex('#00FF00');
   public static Chartreuse : Color  = Color.fromHex('#7FFF00');
   public static Transparent : Color = Color.fromHex('#FFFFFF00');

   constructor(public r: number, public g: number, public b: number, public a? : number){
      this.a = (a != null ? a : 1);
   }

   public static fromRGB(r : number, g : number, b : number, a? : number) : Color {
      return new Color(r, g, b, a);
   }

   // rgba
   public static fromHex(hex : string) : Color {
      var hexRegEx : RegExp = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?$/i;
      var match = null;
      if(match = hex.match(hexRegEx)){
         var r = parseInt(match[1], 16);
         var g = parseInt(match[2], 16);
         var b = parseInt(match[3], 16);
         var a = 1;
         if(match[4]){
            a = parseInt(match[4], 16)/255;
         }
         return new Color(r, g, b, a);
      }else{
         throw new Error("Invalid hex string: " + hex);
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
class AnimationNode {
   constructor(public animation : Drawing.Animation, public x : number, public y : number){}
}

class Engine {
   public canvas : HTMLCanvasElement;
   public ctx : CanvasRenderingContext2D;
   public width : number;
   public height : number;

   private hasStarted : boolean = false;

   // Eventing
   private eventDispatcher : EventDispatcher;
   
   // Key Events
   public keys : number[] = [];
   public keysDown : number[] = [];
   public keysUp : number[] = [];
   // Mouse Events
   public clicks : MouseDown[] = [];
   public mouseDown : MouseDown[] = [];
   public mouseUp : MouseUp[] = [];


   public camera : Camera.ICamera;

   public currentScene : SceneNode;
   public rootScene : SceneNode;
   private sceneStack : SceneNode[] = [];


   private animations : AnimationNode[] = [];

   //public camera : ICamera;
   public isFullscreen : boolean = false;
   public isDebug : boolean = false;
   public debugColor : Color = new Color(255,255,255);
   public backgroundColor : Color = new Color(0,0,100);
   private logger : Logger;

   // loading
   private loader : ILoadable;
   private isLoading : boolean = false;
   private progress : number = 0;
   private total : number = 1;
   private loadingDraw : (ctx : CanvasRenderingContext2D, loaded : number, total : number)  => void;

   constructor(width?:number, height?:number, canvasElementId?:string){
      this.logger = Logger.getInstance();
      this.logger.addAppender(new ConsoleAppender());
      this.logger.log("Building engine...", Log.DEBUG);

      this.eventDispatcher = new EventDispatcher(this);

      this.rootScene = this.currentScene = new SceneNode();
      this.sceneStack.push(this.rootScene);

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

      this.loader = new Loader();

      this.init();

   }

   public addEventListener(eventName : string,  handler: (event?: ActorEvent) => void){
      this.eventDispatcher.subscribe(eventName, handler);
   }

   public playAnimation(animation : Drawing.Animation, x : number, y : number){
      this.animations.push(new AnimationNode(animation, x, y));
   }
   
   public addChild(actor: Actor){
      this.currentScene.addChild(actor);
   }

   public removeChild(actor: Actor){
      this.currentScene.removeChild(actor);
   }

   public pushScene(scene : SceneNode){
      if(this.sceneStack.indexOf(scene) === -1){
         this.sceneStack.push(scene);
         this.currentScene = scene;
      }
   }

   public popScene(){
      if(this.sceneStack.length > 1){
         this.sceneStack.pop();
         this.currentScene = this.sceneStack[this.sceneStack.length-1];
      }
   }

   getWidth() : number {
      return this.width;
   }

   getHeight() : number {
      return this.height;
   }

   private transformToCanvasCoordinates(x : number, y : number) : Point {
      var newX = Math.floor(x * this.canvas.width/this.canvas.clientWidth);
      var newY = Math.floor(y * this.canvas.height/this.canvas.clientHeight);

      if(this.camera){
         var focus = this.camera.getFocus();
         newX -= focus.x;
         newY -= focus.y;
      }
      return new Point(newX, newY);      
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

      // key up is on window because canvas cannot have focus
      window.addEventListener('keyup', (ev: KeyboardEvent) => {
         var key = this.keys.indexOf(ev.keyCode);
         this.keys.splice(key,1);
         this.keysUp.push(ev.keyCode);
         var keyEvent = new KeyUp(ev.keyCode);
         this.eventDispatcher.publish(EventType[EventType.KEYUP], keyEvent);
         this.currentScene.publish(EventType[EventType.KEYUP], keyEvent);

      });

      // key down is on window because canvas cannot have focus
      window.addEventListener('keydown', (ev: KeyboardEvent) => {
         if(this.keys.indexOf(ev.keyCode)=== -1){
            this.keys.push(ev.keyCode);
            this.keysDown.push(ev.keyCode);
            var keyEvent = new KeyDown(ev.keyCode);
            this.eventDispatcher.publish(EventType[EventType.KEYDOWN], keyEvent);
            this.currentScene.publish(EventType[EventType.KEYDOWN], keyEvent)

         }
      });

      window.addEventListener('blur', ()=>{
         this.eventDispatcher.publish(EventType[EventType.BLUR]);
         this.eventDispatcher.update()
      });

      window.addEventListener('focus', ()=>{
         this.eventDispatcher.publish(EventType[EventType.FOCUS]);
         this.eventDispatcher.update()
      });

      this.canvas.addEventListener('mousedown', (e : MouseEvent)=>{
         var x : number = e.pageX - this.canvas.offsetLeft;
         var y : number = e.pageY - this.canvas.offsetTop;
         var transformedPoint = this.transformToCanvasCoordinates(x, y);
         var mousedown = new MouseDown(transformedPoint.x,transformedPoint.y)
         this.clicks.push(mousedown);
         this.eventDispatcher.publish(EventType[EventType.MOUSEDOWN], mousedown);
      });

      this.canvas.addEventListener('mouseup', (e : MouseEvent)=>{
         var x : number = e.pageX - this.canvas.offsetLeft;
         var y : number = e.pageY - this.canvas.offsetTop;
         var transformedPoint = this.transformToCanvasCoordinates(x, y);
         var mouseup = new MouseUp(transformedPoint.x,transformedPoint.y);
         this.mouseUp.push(mouseup);
         this.eventDispatcher.publish(EventType[EventType.MOUSEUP], mouseup);
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
      if(this.isLoading){
         // suspend updates untill loading is finished
         return;
      }

      this.eventDispatcher.update();
      this.currentScene.update(this, delta);

      var eventDispatcher = this.eventDispatcher;
      this.keys.forEach(function(key){
         eventDispatcher.publish(Keys[key], new KeyEvent(this, key));
      });

      // update animations
      this.animations = this.animations.filter(function(a){
         return !a.animation.isDone();
      });

      // Reset keysDown and keysUp after update is complete
      this.keysDown.length = 0;
      this.keysUp.length = 0;

      // Reset clicks
      this.clicks.length = 0;
   }

   private draw(delta: number){
      var ctx = this.ctx;
      
      if(this.isLoading){
         ctx.fillStyle = 'black'
         ctx.fillRect(0,0,this.width,this.height);
         this.drawLoadingBar(ctx, this.progress, this.total);
         // Drawing nothing else while loading
         return;
      }

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
         this.camera.applyTransform(delta);  
      }

      
      this.currentScene.draw(this.ctx, delta);

      this.animations.forEach(function(a){
         a.animation.draw(ctx, a.x, a.y);
      });

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

   private drawLoadingBar (ctx : CanvasRenderingContext2D, loaded : number, total : number){
      if(this.loadingDraw){
         this.loadingDraw(ctx, loaded, total);
         return;
      }

      var y = this.canvas.height/2;
      var width = this.canvas.width/3;
      var x = width;

      // loading box
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, 20);

      var progress = width * (loaded/total);
      ctx.fillStyle = 'white';
      var margin = 5;
      var width = progress - margin*2;
      var height = 20 - margin*2;
      ctx.fillRect(x + margin, y + margin, width>0?width:0, height);
   }

   public setLoadingDrawFunction (fcn : (ctx : CanvasRenderingContext2D, loaded : number, total : number) => void){
      this.loadingDraw = fcn;
   }

   public load(loader : ILoadable) : Promise<any> {
      var complete = new Promise<any>();

      this.isLoading = true;

      loader.load();
      loader.onprogress = (e) => {
         this.progress = <number>e.loaded;
         this.total = <number>e.total;
         this.logger.log('Loading ' + (100*this.progress/this.total).toFixed(0));
      };
      loader.oncomplete = () => {
         setTimeout(()=>{
            this.isLoading = false;
            complete.resolve();
         },500);
      };

      return complete;
   }

};

