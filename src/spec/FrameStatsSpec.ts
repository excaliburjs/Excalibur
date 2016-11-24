/// <reference path="jasmine.d.ts" />
/// <reference path="require.d.ts" />
/// <reference path="Mocks.ts" />

describe('The engine', () => {
   var engine: ex.Engine;
   var scene: ex.Scene;   
   var mock = new Mocks.Mocker();
   var loop: Mocks.IGameLoop;
   var actor: ex.Actor;

   beforeEach(() => {
      engine = mock.engine(0, 0);   
      scene = new ex.Scene(engine);
      engine.currentScene = scene;
      actor = new ex.Actor(0, 0, 10, 10, ex.Color.Red);
      loop = mock.loop(engine);

      scene.add(actor);
   });

   it('should have current and previous frame stats defined', () => {

      expect(engine.stats.prevFrame).toBeDefined();
      expect(engine.stats.currFrame).toBeDefined();
   });

   describe('after frame is ended', () => {

      var stats: ex.IFrameStats;

      beforeAll(() => {
         loop.advance(100);

         stats = engine.stats.currFrame;
      });

      it('should collect frame delta', () => {

         expect(stats.delta).toBe(16, 'Frame stats delta is wrong');

      });

      it('should collect frame fps', () => {
         expect(stats.fps).toBe(62.5, 'Frame stats fps is wrong');
      });

      it('should collect frame actor stats', () => {
         expect(stats.actors.total).toBe(1, 'Frame actor total is wrong');      
         expect(stats.actors.alive).toBe(1, 'Frame actor alive is wrong');
         expect(stats.actors.killed).toBe(0, 'Frame actor killed is wrong');
         expect(stats.actors.remaining).toBe(1, 'Frame actor remaining is wrong');
         expect(stats.actors.ui).toBe(0, 'Frame actor ui count is wrong');
      });

      it('should collect frame duration stats', () => {
         expect(stats.duration.total).toBeCloseTo(0, 1, 'Frame duration total is wrong');
         expect(stats.duration.draw).toBeCloseTo(0, 1, 'Frame duration draw is wrong');
         expect(stats.duration.update).toBeCloseTo(0, 1, 'Frame duration update is wrong');
      });
   });

   

});