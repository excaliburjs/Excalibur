/// <reference path="jasmine.d.ts" />
/// <reference path="require.d.ts" />
/// <reference path="Mocks.ts" />

describe('A UIActor', () => {
   var uiActor: ex.UIActor;
   var engine;
   var scene;
   var mock = new Mocks.Mocker();
   
   beforeEach(() => {
      uiActor = new ex.UIActor();
      uiActor.collisionType = ex.CollisionType.Active;
      scene = new ex.Scene(engine);

      spyOn(scene, 'draw').and.callThrough();
      spyOn(uiActor, 'draw');

      engine = mock.engine(100, 100, scene);
		
   });
	
   it('is drawn when visible', () => {
      uiActor.visible = true;

      scene.add(uiActor);
      scene.draw(engine.ctx, 100);

      expect(uiActor.draw).toHaveBeenCalled();				
   });

   it('is not drawn when not visible', () => {
      uiActor.visible = false;

      scene.add(uiActor);
      scene.draw(engine.ctx, 100);

      expect(uiActor.draw).not.toHaveBeenCalled();				
   });

});