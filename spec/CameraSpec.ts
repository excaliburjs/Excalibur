/// <reference path="jasmine.d.ts" />
/// <reference path="require.d.ts" />
/// <reference path="../ts/Core.ts" />

describe("A camera", () => {
   
   var sideCamera;
   var topCamera;
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
         touchCancel: []
      };
      engine.width = 500;
      engine.height = 500;

      actor.x = 250;
      actor.y = 250;

      sideCamera = new ex.SideCamera(engine);
      topCamera = new ex.TopCamera(engine);
   });

   it("can follow an actor if it is a TopCamera", () => {
      topCamera.setActorToFollow(actor);

      expect(topCamera.getFocus().x).toBe(0);
      expect(topCamera.getFocus().y).toBe(0);

      actor.dx = 10;
      actor.dy = 15;

      actor.update(engine, 1000);

      expect(topCamera.getFocus().x).toBe(-10);
      expect(topCamera.getFocus().y).toBe(-15);
   });

   it("can follow an actor if it is a SideCamera", () => {
      sideCamera.setActorToFollow(actor);

      expect(sideCamera.getFocus().x).toBe(0);
      expect(sideCamera.getFocus().y).toBe(0);

      actor.dx = 10;
      actor.dy = 15;

      actor.update(engine, 1000);

      expect(sideCamera.getFocus().x).toBe(-10);
      expect(sideCamera.getFocus().y).toBe(0);

   });

   it("should not move vertically if it is a SideCamera", () => {
      sideCamera.setActorToFollow(actor);
   
      actor.dx = 10;
      actor.dy = 10;

      actor.update(engine, 1000);

      expect(sideCamera.getFocus().x).toBe(-10);
      expect(sideCamera.getFocus().y).toBe(0);

   });

   it("can focus on a point", () => {
      topCamera.setFocus(10, 20);

      expect(topCamera.getFocus().x).toBe(10);
      expect(topCamera.getFocus().y).toBe(20);

      });

   it("cannot focus on a point if it has an actor to follow", () => {
      //TODO
      // expect(true).toBe(false);
      topCamera.setActorToFollow(actor);
      topCamera.setFocus(100, 150);

      expect(topCamera.getFocus().x).toBe(0);
      expect(topCamera.getFocus().y).toBe(0);
      });

   it("can shake", () => {
      sideCamera.setActorToFollow(actor);
      sideCamera.shake(5, 5, 5000);

      expect(sideCamera.isShaking).toBe(true);

   });

   it("can zoom", () => {
      sideCamera.zoom(2);

      expect(sideCamera.isZooming).toBe(true);
   
   });

});
