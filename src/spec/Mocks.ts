/// <reference path="../../build/dist/excalibur.d.ts" />

module Mocks {

   export interface ITime {
      now(): number;
      add(value: number): void;
      sub(value: number): void;
   }

   export interface IGameLoop {
      advance(duration: number): void;
      advance(duration: number, fps: number): void;
   }

   export class Mocker {
      navigator() {
         var _internalGamePads = { 0: undefined, 
                                   1: undefined, 
                                   2: undefined, 
                                   3: undefined,
                                   length: 4 };
         var mockNavigator = {
            
            setGamepads: function(index: number, numAxis: number, numButtons: number) {
               _internalGamePads[index] = {
                  axes: Array.apply(null, Array(numAxis).map(function() { return undefined; })),
                  buttons: Array.apply(null, Array(numButtons).map(function() { return { pressed: false, value: 0 }; })),
                  connected: true,
                  index: index,
                  id: 'Mock Gamepad',
                  mapping: 'standard',
                  timing: 15335
               };
            },
            
            deleteGamepad: function(index: number) {
               _internalGamePads[index] = undefined;
            },
            
            setGamepadAxis: function(gamepadIndex: number, axisIndex: number, value: number) {
               _internalGamePads[gamepadIndex].axes[axisIndex] = value;
            },
            
            setGamepadButton: function(gamepadIndex: number, buttonIndex: number, value: number){
               _internalGamePads[gamepadIndex].buttons[buttonIndex] = { pressed: value > 0 ? true : false, value: value };
            },
            
            getGamepads: function() {
               return _internalGamePads;
            }
            
         };
         
         return mockNavigator;
      };

      realengine() {
         navigator = <any>this.navigator();
         
         return new ex.Engine({
            width: 500,
            height: 500,
            suppressConsoleBootMessage: true,
            suppressMinimumBrowserFeatureDetection: true
         });
      }
            
      engine(width: number, height: number) {
         var mockEngine;

         navigator = <any>this.navigator();

         mockEngine = {
            collisionStrategy: 0,
            timescale: 1,
            currentScene: null,
            keys: [],
            clicks: [],
            mouseDown: [],
            mouseMove: [],
            mouseUp: [],
            touchStart: [],
            touchMove: [],
            touchEnd: [],
            touchCancel: [],
            width: width,
            height: height,
            scenes: {},
            _animations: [],
            _logger : {
               debug : function () { /* do nothing */ },
               info : function () { /* do nothing */ },
               warn : function () { /* do nothing */ },
               error : function () { /* do nothing */ }
            },
            debug: {
               
            },
            currFrameStats: new ex.FrameStats(),
            prevFrameStats: new ex.FrameStats(),
            input: {
               keyboard: {
                  update: function () { /* do nothing */ }
               },
               pointers: new ex.Input.Pointers(<any>this),
               gamepads: {
                  update: function () { /* do nothing */ }
               }
            },
            canvas: {
               width: width,
               clientWidth: width,
               height: height,
               clientHeight: height
            },
            ctx: {
               canvas: {
                  width: width,
                  height: height
               },
               save: function () { /* do nothing */ },
               restore: function () { /* do nothing */ },
               translate: function () { /* do nothing */ },
               rotate: function () { /* do nothing */ },
               scale: function () { /* do nothing */ }
            },
            getWidth: function () { return width; },
            getHeight: function () { return height; },
            worldToScreenCoordinates: ex.Engine.prototype.worldToScreenCoordinates,
            screenToWorldCoordinates: ex.Engine.prototype.screenToWorldCoordinates,
            addScene: ex.Engine.prototype.addScene,
            goToScene: ex.Engine.prototype.goToScene,
            emit: function () { /* do nothing */  },
            eventDispatcher: {
               emit: function () { /* do nothing */  }
            },
            _hasStarted: true,
            _update: (<any>ex.Engine.prototype)._update,
            _draw: function () { /* do nothing */ }
         };
         return mockEngine;
      };

      /**
       * Get a game loop mock that allows you to control the frame advancement
       * of the main loop.
       */
      loop(game: ex.Engine): IGameLoop {
         var time = new Mocker().time();
         var loop = ex.Engine.createMainLoop(game, () => 0, time.now);

         return {

            /**
             * Advance the engine update loop by the given duration (in milliseconds). 
             * By default, the FPS is set to 60 which means ~16ms per frame for 1 second duration.
             */
            advance: function (duration: number, fps: number = 60) {
               var times = Math.floor((duration / 1000) * fps);
               var delta = duration / times;

               for (var i = 0; i < times; i++) {
                  time.add(delta);
                  loop();
               }
            }
         };
      }

      /**
       * Get a time mock. Allows you to mock a now function and increment/decrement the value.
       */
      time(): ITime {
         var now = 0;

         return {
            add: function (value) {
               now += value;
            },
            sub: function (value) {
               now -= value;
            },
            now: function () {
               return now;
            }
         };
      }
      
      window() {         
         var _handlers = {};
         
         var mockWindow = {
            addEventListener: function(name, handler) {
               _handlers[name] = handler;
            },            
            emit: function(name, eventObject) {
               _handlers[name](eventObject);
            }
         };
         
         return mockWindow;
      };
      
      URL() {
         return {
            createObjectURL(data: any) {
               return 'blob://' + data;
            }
         };
      }
      
   }
}