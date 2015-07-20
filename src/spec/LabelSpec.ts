/// <reference path="jasmine.d.ts" />
/// <reference path="require.d.ts" />
/// <reference path="../engine/Engine.ts" />

describe("A label",() => {
   var label: ex.Label;
   var engine;
   var scene; 

   beforeEach(() => {
      label = new ex.Label("Test string", 10, 10);
      scene = new ex.Scene(engine);

      scene.add(label);
      spyOn(scene, 'draw').andCallThrough();
      spyOn(label, 'draw');

      // mock engine		
      engine = {
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
         width: 100,
         height: 100,
         canvas: {
            width: 100,
            clientWidth: 100,
            height: 100,
            clientHeight: 100
         },
         ctx: {
            canvas: {
               width: 100,
               height: 100
            },
            save: function () { },
            restore: function () { },
            translate: function () { },
            rotate: function () { },
            scale: function () { }
         },
         getWidth: function () { return 100; },
         getHeight: function () { return 100; },
         camera: {
            getZoom: function () { return 1; }
         },
         worldToScreenCoordinates: ex.Engine.prototype.worldToScreenCoordinates,
         screenToWorldCoordinates: ex.Engine.prototype.screenToWorldCoordinates
      };
   });

   it("should be loaded", () => {
      expect(ex.Label).toBeTruthy();
   });

   it("should be loaded", () => {
      expect(ex.Label).toBeTruthy();
   });

   it("should have text", () => {
      expect(label.text).toBe("Test string");
   });

   it("should default to black", () => {
      expect(label.color.toString()).toBe(ex.Color.Black.toString());
   });

   it("can change color", () => {
      label.color = ex.Color.Blue.clone();

      expect(label.color.toString()).toBe(ex.Color.Blue.toString());

      label.update(engine, 100);
      label.draw(engine.ctx, 100);
      expect(label.color.toString()).toBe(ex.Color.Blue.toString());

   });
});