/// <reference path="MonkeyPatch.ts" />
/// <reference path="Action.ts" />
/// <reference path="Log.ts" />
/// <reference path="Events.ts" />
/// <reference path="Entities.ts" />
/// <reference path="Particles.ts" />
/// <reference path="Algebra.ts" />
/// <reference path="Drawing.ts" />
/// <reference path="Camera.ts" />
/// <reference path="Sound.ts" />
/// <reference path="Loader.ts" />
/// <reference path="Promises.ts" />
/// <reference path="Util.ts" />

module ex {
   export class Color {
      public static Black: Color = Color.fromHex('#000000');
      public static White: Color = Color.fromHex('#FFFFFF');
      public static Yellow: Color = Color.fromHex('#FFFF00');
      public static Orange: Color = Color.fromHex('#FFA500');
      public static Red: Color = Color.fromHex('#FF0000');
      public static Vermillion: Color = Color.fromHex('#FF5B31');
      public static Rose: Color = Color.fromHex('#FF007F');
      public static Magenta: Color = Color.fromHex('#FF00FF');
      public static Violet: Color = Color.fromHex('#7F00FF');
      public static Blue: Color = Color.fromHex('#0000FF');
      public static Azure: Color = Color.fromHex('#007FFF');
      public static Cyan: Color = Color.fromHex('#00FFFF');
      public static Viridian: Color = Color.fromHex('#59978F');
      public static Green: Color = Color.fromHex('#00FF00');
      public static Chartreuse: Color = Color.fromHex('#7FFF00');
      public static Transparent: Color = Color.fromHex('#FFFFFF00');

      constructor(public r: number, public g: number, public b: number, public a?: number) {
         this.a = (a != null ? a : 1);
      }

      public static fromRGB(r: number, g: number, b: number, a?: number): Color {
         return new Color(r, g, b, a);
      }

      // rgba
      public static fromHex(hex: string): Color {
         var hexRegEx: RegExp = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?$/i;
         var match = null;
         if (match = hex.match(hexRegEx)) {
            var r = parseInt(match[1], 16);
            var g = parseInt(match[2], 16);
            var b = parseInt(match[3], 16);
            var a = 1;
            if (match[4]) {
               a = parseInt(match[4], 16) / 255;
            }
            return new Color(r, g, b, a);
         } else {
            throw new Error("Invalid hex string: " + hex);
         }
      }

      public toString() {
         var result = String(this.r.toFixed(0)) + ", " + String(this.g.toFixed(0)) + ", " + String(this.b.toFixed(0));
         if (this.a) {
            return "rgba(" + result + ", " + String(this.a) + ")";
         }
         return "rgb(" + result + ")";
      }

      public clone(): Color {
         return new Color(this.r, this.g, this.b, this.a);
      }
   }

   export enum InputKey {
      Num1 = 97,
      Num2 = 98,
      Num3 = 99,
      Num4 = 100,
      Num5 = 101,
      Num6 = 102,
      Num7 = 103,
      Num8 = 104,
      Num9 = 105,
      Num0 = 96,
      Numlock = 144,
      Semicolon = 186,
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
      Shift = 16,
      Alt = 18,
      Up = 38,
      Down = 40,
      Left = 37,
      Right = 39,
      Space = 32,
      Esc = 27
   };

   // internal
   class AnimationNode {
      constructor(public animation: Animation, public x: number, public y: number) { }
   }

   export enum DisplayMode {
      FullScreen,
      Container,
      Fixed
   }

   export class Timer {
      public static id: number = 0;
      public id: number = 0;
      public interval: number = 10;
      public fcn: ()=>void = ()=>{};
      public repeats: boolean = false;
      private elapsedTime: number = 0;
      public complete: boolean = false;
      public scene: Scene = null;
      constructor(fcn:()=>void, interval: number, repeats?: boolean){
         this.id = Timer.id++;
         this.interval = interval || this.interval;
         this.fcn = fcn || this.fcn;
         this.repeats = repeats || this.repeats;
      }

      public update(delta: number){
         this.elapsedTime += delta;
         if(this.elapsedTime > this.interval){
            this.fcn.call(this);
            if(this.repeats){
               this.elapsedTime = 0;
            }else{
               this.complete = true;
            }
         }
      }

      public cancel(){
         if(this.scene){
            this.scene.cancelTimer(this);
         }
      }

   }

   export class Engine {
      public canvas: HTMLCanvasElement;
      public ctx: CanvasRenderingContext2D;
      public canvasElementId: string;

      public width: number;
      public height: number;

      private hasStarted: boolean = false;

      // Eventing
      private eventDispatcher: EventDispatcher;

      // Key Events
      public keys: number[] = [];
      public keysDown: number[] = [];
      public keysUp: number[] = [];
      // Mouse Events
      public clicks: MouseDown[] = [];
      public mouseDown: MouseDown[] = [];
      public mouseUp: MouseUp[] = [];

      public camera: ICamera;
      public currentScene: Scene;
      public rootScene: Scene;
      private sceneStack: Scene[] = [];

      private animations: AnimationNode[] = [];

      //public camera : ICamera;
      public isFullscreen: boolean = false;
      public displayMode: DisplayMode = DisplayMode.FullScreen;
      public isDebug: boolean = false;
      public debugColor: Color = new Color(255, 255, 255);
      public backgroundColor: Color = new Color(0, 0, 100);
      private logger: Logger;
      private isSmoothingEnabled: boolean = true;

      // loading
      private loader: ILoadable;
      private isLoading: boolean = false;
      private progress: number = 0;
      private total: number = 1;
      private loadingDraw: (ctx: CanvasRenderingContext2D, loaded: number, total: number) => void;

      constructor(width?: number, height?: number, canvasElementId?: string, displayMode?: DisplayMode) {

         this.logger = Logger.getInstance();
         this.logger.addAppender(new ConsoleAppender());
         this.logger.debug("Building engine...");

         this.canvasElementId = canvasElementId;

         this.eventDispatcher = new EventDispatcher(this);

         this.rootScene = this.currentScene = new Scene();
         this.sceneStack.push(this.rootScene);

         if (canvasElementId) {
            this.logger.debug("Using Canvas element specified: " + canvasElementId);
            this.canvas = <HTMLCanvasElement>document.getElementById(canvasElementId);
         } else {
            this.logger.debug("Using generated canvas element");
            this.canvas = <HTMLCanvasElement>document.createElement('canvas');
         }
         if (width && height) {
            if (displayMode == undefined) {
               this.displayMode = DisplayMode.Fixed;
            }
            this.logger.debug("Engine viewport is size " + width + " x " + height);
            this.width = this.canvas.width = width;
            this.height = this.canvas.height = height;

         } else if (!displayMode) {
            this.logger.debug("Engine viewport is fullscreen");
            this.displayMode = DisplayMode.FullScreen;
         }

         this.loader = new Loader();

         this.initialize();

      }

      public static extend(methods: any): any {
         var subclass = function () {
            this['__super'].apply(this, Array.prototype.slice.call(arguments, 0));
            if (this['init']) {
               this['init'].apply(this, Array.prototype.slice.call(arguments, 0));
            }
         };

         var __extends = function (d, b) {
            for (var p in b)
               if (b.hasOwnProperty(p))
                  d[p] = b[p];
            function __() {
               this.constructor = d;
            }
            __.prototype = b.prototype;
            d.prototype = new __();
         };
         var clazz = this;
         __extends(subclass, clazz);

         for (var method in methods) {
            subclass.prototype[method] = methods[method];
         }
         subclass.prototype["__super"] = clazz;
         subclass.prototype["super"] = clazz.prototype;

         return subclass;
      }

      public addEventListener(eventName: string, handler: (event?: GameEvent) => void) {
         this.eventDispatcher.subscribe(eventName, handler);
      }

      public playAnimation(animation: Animation, x: number, y: number) {
         this.animations.push(new AnimationNode(animation, x, y));
      }

      public addChild(actor: Actor) {
         this.currentScene.addChild(actor);
      }

      public removeChild(actor: Actor) {
         this.currentScene.removeChild(actor);
      }

      public addTimer(timer: Timer): Timer{
         return this.currentScene.addTimer(timer);
      }

      public removeTimer(timer: Timer): Timer{
         return this.currentScene.removeTimer(timer);
      }


      public pushScene(scene: Scene) {
         if (this.sceneStack.indexOf(scene) === -1) {
            this.sceneStack.push(scene);
            this.currentScene = scene;
         }
      }

      public popScene() {
         if (this.sceneStack.length > 1) {
            this.sceneStack.pop();
            this.currentScene = this.sceneStack[this.sceneStack.length - 1];
         }
      }

      getWidth(): number {
         return this.width;
      }

      getHeight(): number {
         return this.height;
      }

      private transformToCanvasCoordinates(x: number, y: number): Point {
         var newX = Math.floor(x * this.canvas.width / this.canvas.clientWidth);
         var newY = Math.floor(y * this.canvas.height / this.canvas.clientHeight);

         if (this.camera) {
            var focus = this.camera.getFocus();
            newX -= focus.x;
            newY -= focus.y;
         }
         return new Point(newX, newY);
      }

      private setHeightByDisplayMode(parent: any) {
         if (this.displayMode === DisplayMode.Container) {
            this.width = this.canvas.width = parent.clientWidth;
            this.height = this.canvas.height = parent.clientHeight
      }

         if (this.displayMode === DisplayMode.FullScreen) {
            document.body.style.margin = '0px';
            document.body.style.overflow = 'hidden';
            this.width = this.canvas.width = parent.innerWidth;
            this.height = this.canvas.height = parent.innerHeight
      }
      }

      private initialize() {
         if (this.displayMode === DisplayMode.FullScreen || this.displayMode === DisplayMode.Container) {


            var parent = <any>(this.displayMode === DisplayMode.Container ? <any>(this.canvas.parentElement || document.body) : <any>window);

            this.setHeightByDisplayMode(parent);

            window.addEventListener('resize', (ev: UIEvent) => {
               this.logger.debug("View port resized");
               this.setHeightByDisplayMode(parent);
               this.logger.info("parent.clientHeight " + parent.clientHeight);
               this.setAntialiasing(this.isSmoothingEnabled);
            });
         }

         window.addEventListener('blur', (ev: UIEvent) => {
            this.keys.length = 0; // empties array efficiently
         });

         // key up is on window because canvas cannot have focus
         window.addEventListener('keyup', (ev: KeyboardEvent) => {
            var key = this.keys.indexOf(ev.keyCode);
            this.keys.splice(key, 1);
            this.keysUp.push(ev.keyCode);
            var keyEvent = new KeyUp(ev.keyCode);
            this.eventDispatcher.publish(EventType[EventType.KeyUp], keyEvent);
            this.currentScene.publish(EventType[EventType.KeyUp], keyEvent);

         });

         // key down is on window because canvas cannot have focus
         window.addEventListener('keydown', (ev: KeyboardEvent) => {
            if (this.keys.indexOf(ev.keyCode) === -1) {
               this.keys.push(ev.keyCode);
               this.keysDown.push(ev.keyCode);
               var keyEvent = new KeyDown(ev.keyCode);
               this.eventDispatcher.publish(EventType[EventType.KeyDown], keyEvent);
               this.currentScene.publish(EventType[EventType.KeyDown], keyEvent);

            }
         });

         window.addEventListener('blur', () => {
            this.eventDispatcher.publish(EventType[EventType.Blur]);
            this.eventDispatcher.update();
         });

         window.addEventListener('focus', () => {
            this.eventDispatcher.publish(EventType[EventType.Focus]);
            this.eventDispatcher.update();
         });

         this.canvas.addEventListener('mousedown', (e: MouseEvent) => {
            var x: number = e.pageX - this.canvas.offsetLeft;
            var y: number = e.pageY - this.canvas.offsetTop;
            var transformedPoint = this.transformToCanvasCoordinates(x, y);
            var mousedown = new MouseDown(transformedPoint.x, transformedPoint.y)
         this.clicks.push(mousedown);
            this.eventDispatcher.publish(EventType[EventType.MouseDown], mousedown);
         });

         this.canvas.addEventListener('mouseup', (e: MouseEvent) => {
            var x: number = e.pageX - this.canvas.offsetLeft;
            var y: number = e.pageY - this.canvas.offsetTop;
            var transformedPoint = this.transformToCanvasCoordinates(x, y);
            var mouseup = new MouseUp(transformedPoint.x, transformedPoint.y);
            this.mouseUp.push(mouseup);
            this.eventDispatcher.publish(EventType[EventType.MouseUp], mouseup);
         });


         this.ctx = this.canvas.getContext('2d');
         if (!this.canvasElementId) {
            document.body.appendChild(this.canvas);
         }

      }

      public setAntialiasing(isSmooth: boolean) {
         this.isSmoothingEnabled = isSmooth;
         (<any>this.ctx).imageSmoothingEnabled = isSmooth;
         (<any>this.ctx).webkitImageSmoothingEnabled = isSmooth;
         (<any>this.ctx).mozImageSmoothingEnabled = isSmooth;
         (<any>this.ctx).msImageSmoothingEnabled = isSmooth;
      }

      public getAntialiasing(): boolean {
         return (<any>this.ctx).imageSmoothingEnabled || (<any>this.ctx).webkitImageSmoothingEnabled || (<any>this.ctx).mozImageSmoothingEnabled || (<any>this.ctx).msImageSmoothingEnabled;
      }

      public isKeyDown(key: InputKey): boolean {
         return this.keysDown.indexOf(key) > -1;
      }

      public isKeyPressed(key: InputKey): boolean {
         return this.keys.indexOf(key) > -1;
      }

      public isKeyUp(key: InputKey): boolean {
         return this.keysUp.indexOf(key) > -1;
      }

      private update(delta: number) {
         if (this.isLoading) {
            // suspend updates untill loading is finished
            return;
         }
         // process engine level events
         this.eventDispatcher.update();
         this.currentScene.update(this, delta);

         var eventDispatcher = this.eventDispatcher;
         this.keys.forEach(function (key) {
            eventDispatcher.publish(InputKey[key], new KeyEvent(this, key));
         });

         // update animations
         this.animations = this.animations.filter(function (a) {
            return !a.animation.isDone();
         });

         // Reset keysDown and keysUp after update is complete
         this.keysDown.length = 0;
         this.keysUp.length = 0;

         // Reset clicks
         this.clicks.length = 0;

         // Publish update event
         this.eventDispatcher.publish(EventType[EventType.Update], new UpdateEvent(delta));
      }

      private draw(delta: number) {
         var ctx = this.ctx;

         if (this.isLoading) {
            ctx.fillStyle = 'black'
         ctx.fillRect(0, 0, this.width, this.height);
            this.drawLoadingBar(ctx, this.progress, this.total);
            // Drawing nothing else while loading
            return;
         }

         ctx.clearRect(0, 0, this.width, this.height);
         ctx.fillStyle = this.backgroundColor.toString();
         ctx.fillRect(0, 0, this.width, this.height);


         // Draw debug information
         if (this.isDebug) {

            this.ctx.font = "Consolas";
            this.ctx.fillStyle = this.debugColor.toString();
            for (var j = 0; j < this.keys.length; j++) {
               this.ctx.fillText(this.keys[j].toString() + " : " + (InputKey[this.keys[j]] ? InputKey[this.keys[j]] : "Not Mapped"), 100, 10 * j + 10);
            }

            var fps = 1.0 / (delta / 1000);
            this.ctx.fillText("FPS:" + fps.toFixed(2).toString(), 10, 10);


         }

         this.ctx.save();

         if (this.camera) {
            this.camera.applyTransform(delta);
         }


         this.currentScene.draw(this.ctx, delta);

         this.animations.forEach(function (a) {
            a.animation.draw(ctx, a.x, a.y);
         });

         if (this.isDebug) {
            this.ctx.strokeStyle = 'yellow'
         this.currentScene.debugDraw(this.ctx);
         }


         this.ctx.restore();
      }

      public start() {
         if (!this.hasStarted) {
            this.hasStarted = true;
            this.logger.debug("Starting game...");
            // Mainloop
            var lastTime = Date.now();
            var game = this;
            (function mainloop() {
               if (!game.hasStarted) {
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
            this.logger.debug("Game started");
         } else {
            // Game already started;
         }

      }
      // Test
      public stop() {
         if (this.hasStarted) {
            this.hasStarted = false;
            this.logger.debug("Game stopped");
         }
      }

      private drawLoadingBar(ctx: CanvasRenderingContext2D, loaded: number, total: number) {
         if (this.loadingDraw) {
            this.loadingDraw(ctx, loaded, total);
            return;
         }

         var y = this.canvas.height / 2;
         var width = this.canvas.width / 3;
         var x = width;

         // loading image
         var image = new Image();
         image.src = 'data:image/png;base64,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';

         var imageHeight = width * 3 / 8;
         var oldAntialias = this.getAntialiasing();
         this.setAntialiasing(true);
         ctx.drawImage(image, 0, 0, 800, 300, x, y - imageHeight - 20, width, imageHeight);

         // loading box
         ctx.strokeStyle = 'white';
         ctx.lineWidth = 2;
         ctx.strokeRect(x, y, width, 20);

         var progress = width * (loaded / total);
         ctx.fillStyle = 'white';
         var margin = 5;
         var width = progress - margin * 2;
         var height = 20 - margin * 2;
         ctx.fillRect(x + margin, y + margin, width > 0 ? width : 0, height);
         this.setAntialiasing(oldAntialias);
      }

      public setLoadingDrawFunction(fcn: (ctx: CanvasRenderingContext2D, loaded: number, total: number) => void) {
         this.loadingDraw = fcn;
      }

      public load(loader: ILoadable): Promise<any> {
         var complete = new Promise<any>();

         this.isLoading = true;

         loader.load();
         loader.onprogress = (e) => {
            this.progress = <number>e.loaded;
            this.total = <number>e.total;
            this.logger.info('Loading ' + (100 * this.progress / this.total).toFixed(0));
         };
         loader.oncomplete = () => {
            setTimeout(() => {
               this.isLoading = false;
               complete.resolve();
            }, 500);
         };

         return complete;
      }

   };

}