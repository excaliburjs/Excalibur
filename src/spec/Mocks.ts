/// <reference path="../engine/Engine.ts" />

module Mocks {

   export class Mocker {

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
      }
   }
}