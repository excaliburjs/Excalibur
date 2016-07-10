/// <reference path="../engine/Engine.ts" />

module Mocks {

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
      
      engine(width: number, height: number, scene: ex.Scene) {
         var mockEngine;

         mockEngine = {
            collisionStrategy: 0,
            currentScene: scene,
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
            camera: {
               getZoom: function () { return 1; }
            },
            worldToScreenCoordinates: ex.Engine.prototype.worldToScreenCoordinates,
            screenToWorldCoordinates: ex.Engine.prototype.screenToWorldCoordinates
         };
         return mockEngine;
      };
      
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