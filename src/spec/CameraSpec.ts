/// <reference path="jasmine.d.ts" />
/// <reference path="require.d.ts" />
/// <reference path="../engine/Engine.ts" />

describe("A camera", () => {
   
   var sideCamera;
   var lockedCamera;
   var actor;
   var engine;
   var scene;

   beforeEach(()=>{
      actor = new ex.Actor();
      scene = new ex.Scene();
      // mock engine    
      engine = {
         currentScene : scene,
         keys: [],
         clicks: [],
         mouseDown: [],
         mouseMove: [],
         mouseUp: [],
         touchStart: [],
         touchMove: [],
         touchEnd: [],
         touchCancel: [],
         canvas: {
            width: 0,
            height: 0,
         },
         getWidth: function(){return 0},
         getHeight: function(){return 0},
         camera: {
            getZoom: function(){return 1}
         },
         worldToScreenCoordinates: function(){
            return new ex.Point(0,0);
         },
         screenToWorldCoordinates: function(){
            return new ex.Point(0,0);
         }
      };
      engine.width = 500;
      engine.height = 500;

      actor.x = 250;
      actor.width = 10;
      actor.y = 250;
      actor.height = 10;

      sideCamera = new ex.SideCamera(engine);
      lockedCamera = new ex.LockedCamera(engine);
   });

   it("can follow an actor if it is a LockedCamera", () => {
      engine.camera = lockedCamera;
      lockedCamera.setActorToFollow(actor);

      expect(lockedCamera.getFocus().x).toBe(-255);
      expect(lockedCamera.getFocus().y).toBe(-255);

      actor.dx = 10;
      actor.dy = 15;

      actor.update(engine, 1000);

      expect(lockedCamera.getFocus().x).toBe(-265);
      expect(lockedCamera.getFocus().y).toBe(-270);
   });

   it("can follow an actor if it is a SideCamera", () => {
      engine.camera = sideCamera;
      sideCamera.setActorToFollow(actor);

      expect(sideCamera.getFocus().x).toBe(-255);
      expect(sideCamera.getFocus().y).toBe(0);

      actor.dx = 10;
      actor.dy = 15;

      actor.update(engine, 1000);

      expect(sideCamera.getFocus().x).toBe(-265);
      expect(sideCamera.getFocus().y).toBe(0);

   });

   it("should not move vertically if it is a SideCamera", () => {
      engine.camera = sideCamera;
      sideCamera.setActorToFollow(actor);
   
      actor.dx = 10;
      actor.dy = 10;

      actor.update(engine, 1000);

      expect(sideCamera.getFocus().x).toBe(-265);
      expect(sideCamera.getFocus().y).toBe(0);

   });

   it("can focus on a point", () => {
      engine.camera = lockedCamera;
      lockedCamera.setFocus(10, 20);

      expect(lockedCamera.getFocus().x).toBe(10);
      expect(lockedCamera.getFocus().y).toBe(20);

      });

   it("cannot focus on a point if it has an actor to follow", () => {
      //TODO
      // expect(true).toBe(false);
      engine.camera = lockedCamera;
      lockedCamera.setActorToFollow(actor);
      lockedCamera.setFocus(100, 150);

      expect(lockedCamera.getFocus().x).toBe(-255);
      expect(lockedCamera.getFocus().y).toBe(-255);
      });

   it("can shake", () => {
      engine.camera = sideCamera;
      sideCamera.setActorToFollow(actor);
      sideCamera.shake(5, 5, 5000);

      expect(sideCamera.isShaking).toBe(true);

   });

   it("can zoom", () => {
      engine.camera = sideCamera;
      sideCamera.zoom(2, .1);

      expect(sideCamera.isZooming).toBe(true);
   
   });

});
