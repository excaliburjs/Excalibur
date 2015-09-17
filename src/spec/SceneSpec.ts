/// <reference path="jasmine.d.ts" />
/// <reference path="require.d.ts" />
/// <reference path="Mocks.ts" />

describe('A scene', () => {

   var actor: ex.Actor;
   var engine;
   var scene;
   var mock = new Mocks.Mocker();

   beforeEach(() => {
      actor = new ex.Actor();
      scene = new ex.Scene(engine);

      spyOn(scene, 'draw').andCallThrough();
      spyOn(actor, 'draw');

      engine = mock.engine(100, 100, scene);
   });

   it('should be loaded', () => {
      expect(ex.Scene).toBeTruthy();
   });

   it('cannot have the same UIActor added to it more than once', () => {
      var uiActor = new ex.UIActor();
      scene.add(uiActor);
      expect(scene.uiActors.length).toBe(1);
      scene.add(uiActor);
      expect(scene.uiActors.length).toBe(1);
   });

   it('cannot have the same Actor added to it more than once', () => {
      scene.add(actor);
      expect(scene.children.length).toBe(1);
      scene.add(actor);
      expect(scene.children.length).toBe(1);
   });

   it('cannot have the same TileMap added to it more than once', () => {
      var tileMap = new ex.TileMap(1, 1, 1, 1, 1, 1);
      scene.add(tileMap);
      expect(scene.tileMaps.length).toBe(1);
      scene.add(tileMap);
      expect(scene.tileMaps.length).toBe(1);
   });

   it('draws onscreen Actors', () => {
      actor.traits.length = 0;
      actor.traits.push(new ex.Traits.OffscreenCulling());
      actor.x = 0;
      actor.y = 0;
      actor.setWidth(10);
      actor.setHeight(10);

      scene.add(actor);
      scene.update(engine, 100);
      scene.draw(engine.ctx, 100);

      expect(actor.isOffScreen).toBeFalsy();
      expect(actor.draw).toHaveBeenCalled();
   });

   it('does not draw offscreen Actors', () => {
      actor.x = 1000;
      actor.y = 1000;
      scene.update(engine, 100);
      expect(actor.isOffScreen).toBeFalsy();

      actor.x = 1010;
      actor.y = 1010;
      actor.setWidth(5);
      actor.setHeight(5);

      scene.add(actor);
      scene.update(engine, 100);
      scene.draw(engine.ctx, 100);

      expect(scene.camera.getFocus().x).toBe(50);
      expect(scene.camera.getFocus().y).toBe(50);
      expect(engine.worldToScreenCoordinates(new ex.Point(50, 50)).x).toBe(50);
      expect(engine.worldToScreenCoordinates(new ex.Point(50, 50)).y).toBe(50);
      expect(engine.getWidth()).toBe(100);
      expect(engine.getHeight()).toBe(100);

      expect(actor.isOffScreen).toBeTruthy();
      expect(actor.draw).not.toHaveBeenCalled();
   });

   it('draws visible Actors', () => {
      actor.visible = true;

      scene.add(actor);
      scene.draw(engine.ctx, 100);

      expect(actor.draw).toHaveBeenCalled();
   });
   
   it('does not draw non-visible actors', () => {
      actor.visible = false;

      scene.add(actor);
      scene.draw(engine.ctx, 100);

      expect(actor.draw).not.toHaveBeenCalled();
   });

});