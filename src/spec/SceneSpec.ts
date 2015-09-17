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

});