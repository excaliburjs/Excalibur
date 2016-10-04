/// <reference path="jasmine.d.ts" />
/// <reference path="require.d.ts" />
/// <reference path="Mocks.ts" />

describe('A camera', () => {
   
   var sideCamera;
   var lockedCamera;
   var baseCamera;   
   var actor: ex.Actor;
   var engine: ex.Engine;
   var scene: ex.Scene;
   var mock = new Mocks.Mocker();

   beforeEach(() => {
      actor = new ex.Actor();

      // mock engine    
      engine = mock.engine(500, 500);

      actor.pos.x = 250;
      actor.setWidth(10);
      actor.pos.y = 250;
      actor.setHeight(10);
      scene = new ex.Scene(engine);
      engine.currentScene = scene;

      sideCamera = new ex.SideCamera();
      lockedCamera = new ex.LockedCamera();
      baseCamera = new ex.BaseCamera();
   });

   it('can follow an actor if it is a lockedCamera', () => {
      engine.currentScene.camera = lockedCamera;
      lockedCamera.setActorToFollow(actor);

      expect(lockedCamera.getFocus().x).toBe(255);
      expect(lockedCamera.getFocus().y).toBe(255);

      actor.vel.x = 10;
      actor.vel.y = 15;

      actor.update(engine, 1000);

      expect(lockedCamera.getFocus().x).toBe(265);
      expect(lockedCamera.getFocus().y).toBe(270);
   });

   it('can follow an actor if it is a SideCamera', () => {
      engine.currentScene.camera = sideCamera;
      sideCamera.setActorToFollow(actor);

      expect(sideCamera.getFocus().x).toBe(255);
      expect(sideCamera.getFocus().y).toBe(0);

      actor.vel.x = 10;
      actor.vel.y = 15;

      actor.update(engine, 1000);

      expect(sideCamera.getFocus().x).toBe(265);
      expect(sideCamera.getFocus().y).toBe(0);

   });

   it('should not move vertically if it is a SideCamera', () => {
      engine.currentScene.camera = sideCamera;
      sideCamera.setActorToFollow(actor);
   
      actor.vel.x = 10;
      actor.vel.y = 10;

      actor.update(engine, 1000);

      expect(sideCamera.getFocus().x).toBe(265);
      expect(sideCamera.getFocus().y).toBe(0);

   });

   it('can focus on a point', () => {
      // set the focus with positional attributes
      baseCamera.x = 10;
      baseCamera.y = 20;

      expect(baseCamera.getFocus().x).toBe(10);
      expect(baseCamera.getFocus().y).toBe(20);

      baseCamera.x = 20;
      baseCamera.y = 10;

      expect(baseCamera.getFocus().x).toBe(20);
      expect(baseCamera.getFocus().y).toBe(10);

   });

   it('can move to a point', () => {
      baseCamera.x = 10;
      baseCamera.y = 20;

      // verify initial position
      expect(baseCamera.getFocus().x).toBe(10);
      expect(baseCamera.getFocus().y).toBe(20);

      // move (1000ms)
      baseCamera.move(new ex.Vector(20, 10), 1000);

      // shouldn't have moved already
      expect(baseCamera.getFocus().x).toBe(10);
      expect(baseCamera.getFocus().y).toBe(20);

      // wait 11 frames (1100ms)
      for (let i = 0; i < 11; i++) {
         baseCamera.update(engine, 100);
      }

      // should be at new position
      expect(baseCamera.getFocus().x).toBe(20);
      expect(baseCamera.getFocus().y).toBe(10);
   });

   it('cannot focus on a point if it has an actor to follow', () => {
      //TODO
      // expect(true).toBe(false);
      engine.currentScene.camera = lockedCamera;
      lockedCamera.setActorToFollow(actor);
      lockedCamera.x = 100;
      lockedCamera.y = 150;

      expect(lockedCamera.getFocus().x).toBe(255);
      expect(lockedCamera.getFocus().y).toBe(255);
      });

   it('can shake', () => {
      engine.currentScene.camera = sideCamera;
      sideCamera.setActorToFollow(actor);
      sideCamera.shake(5, 5, 5000);

      expect(sideCamera._isShaking).toBe(true);

   });

   it('can zoom', () => {
      engine.currentScene.camera = sideCamera;
      sideCamera.zoom(2, .1);

      expect(sideCamera._isZooming).toBe(true);
   
   });

});
