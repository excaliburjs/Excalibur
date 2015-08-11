/// <reference path="jasmine.d.ts" />
/// <reference path="require.d.ts" />
/// <reference path="../engine/Engine.ts" />

describe('A camera', () => {
   
   var sideCamera;
   var lockedCamera;
   var actor;
   var engine;
   var scene;
   var mock = new Mocks.Mocker();

   beforeEach(() => {
      actor = new ex.Actor();

      // mock engine    
      engine = mock.engine(500, 500, scene);

      actor.x = 250;
      actor._width = 10;
      actor.y = 250;
      actor._height = 10;
      scene = new ex.Scene(engine);

      sideCamera = new ex.SideCamera();
      lockedCamera = new ex.LockedCamera();
   });

   it('can follow an actor if it is a lockedCamera', () => {
      engine.camera = lockedCamera;
      lockedCamera.setActorToFollow(actor);

      expect(lockedCamera.getFocus().x).toBe(255);
      expect(lockedCamera.getFocus().y).toBe(255);

      actor.dx = 10;
      actor.dy = 15;

      actor.update(engine, 1000);

      expect(lockedCamera.getFocus().x).toBe(265);
      expect(lockedCamera.getFocus().y).toBe(270);
   });

   it('can follow an actor if it is a SideCamera', () => {
      engine.camera = sideCamera;
      sideCamera.setActorToFollow(actor);

      expect(sideCamera.getFocus().x).toBe(255);
      expect(sideCamera.getFocus().y).toBe(0);

      actor.dx = 10;
      actor.dy = 15;

      actor.update(engine, 1000);

      expect(sideCamera.getFocus().x).toBe(265);
      expect(sideCamera.getFocus().y).toBe(0);

   });

   it('should not move vertically if it is a SideCamera', () => {
      engine.camera = sideCamera;
      sideCamera.setActorToFollow(actor);
   
      actor.dx = 10;
      actor.dy = 10;

      actor.update(engine, 1000);

      expect(sideCamera.getFocus().x).toBe(265);
      expect(sideCamera.getFocus().y).toBe(0);

   });

   it('can focus on a point', () => {
      engine.camera = lockedCamera;
      lockedCamera.setFocus(10, 20);

      expect(lockedCamera.getFocus().x).toBe(10);
      expect(lockedCamera.getFocus().y).toBe(20);

      });

   it('cannot focus on a point if it has an actor to follow', () => {
      //TODO
      // expect(true).toBe(false);
      engine.camera = lockedCamera;
      lockedCamera.setActorToFollow(actor);
      lockedCamera.setFocus(100, 150);

      expect(lockedCamera.getFocus().x).toBe(255);
      expect(lockedCamera.getFocus().y).toBe(255);
      });

   it('can shake', () => {
      engine.camera = sideCamera;
      sideCamera.setActorToFollow(actor);
      sideCamera.shake(5, 5, 5000);

      expect(sideCamera._isShaking).toBe(true);

   });

   it('can zoom', () => {
      engine.camera = sideCamera;
      sideCamera.zoom(2, .1);

      expect(sideCamera._isZooming).toBe(true);
   
   });

});
