/// <reference path="jasmine.d.ts" />
/// <reference path="require.d.ts" />
/// <reference path="Mocks.ts" />

describe('The engine', () => {
   var engine: ex.Engine;
   var scene: ex.Scene;   
   var mock = new Mocks.Mocker();
   var loop: Mocks.IGameLoop;

   beforeEach(() => {
      engine = TestUtils.engine();
      scene = new ex.Scene(engine);
      engine.currentScene = scene;
      loop = mock.loop(engine);

      engine.start();
   });

   afterEach(() => {
      engine.stop();
   });

   it('should emit a preframe event', () => {
      var fired = false;
      engine.on('preframe', () => fired = true);

      loop.advance(100);

      expect(fired).toBe(true);
   });

   it('should emit a postframe event', () => {
      var fired = false;
      engine.on('postframe', () => fired = true);

      loop.advance(100);

      expect(fired).toBe(true);
   });

   it('should emit a preupdate event', () => {
      var fired = false;
      engine.on('preupdate', () => fired = true);

      loop.advance(100);

      expect(fired).toBe(true);
   });

   it('should emit a postupdate event', () => {
      var fired = false;
      engine.on('postupdate', () => fired = true);

      loop.advance(100);

      expect(fired).toBe(true);
   });
   
   it('should tell engine is running', () => {
      var status = engine.isPaused();
      expect(status).toBe(false);
   });
   
   it('should tell engine is paused', () => {
      engine.stop();
      var status = engine.isPaused();
      expect(status).toBe(true);
   });
   
   it('should again tell engine is running', () => {
      engine.start();
      var status = engine.isPaused();
      expect(status).toBe(false);
   });
   
});