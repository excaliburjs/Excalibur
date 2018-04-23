/// <reference path="jasmine.d.ts" />

/// <reference path="Mocks.ts" />import { BaseCamera } from "../../build/dist/excalibur";



describe('A camera', () => {
   
   var baseCamera;   
   var actor: ex.Actor;
   var engine: ex.Engine;
   var scene: ex.Scene;
   var mock = new Mocks.Mocker();

   beforeEach(() => {
      jasmine.addMatchers(imagediff.jasmine);
      actor = new ex.Actor();

      // mock engine    
      engine = TestUtils.engine({
        width: 500,
        height: 500 
      });

      engine.setAntialiasing(false);

      engine.backgroundColor = ex.Color.Blue;

      actor.pos.x = 250;
      actor.setWidth(10);
      actor.pos.y = 250;
      actor.setHeight(10);
      actor.color = ex.Color.Red;
      scene = new ex.Scene(engine);
      scene.add(actor);
      engine.currentScene = scene;

      baseCamera = new ex.BaseCamera();
   });
   
   afterEach(() => {
      engine.stop();
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

   it('can chain moves from various points', () => {
      baseCamera.x = 10;
      baseCamera.y = 20;

      // verify initial position
      expect(baseCamera.x).toBe(10);
      expect(baseCamera.y).toBe(20);

      baseCamera.move(new ex.Vector(20, 10), 1000).then(() => {
         baseCamera.move(new ex.Vector(0, 0), 1000).then(() => {
            baseCamera.move(new ex.Vector(100, 100), 1000);
         });
      });

      // wait 11 frames (1100ms)
      for (let i = 0; i < 11; i++) {
         baseCamera.update(engine, 100);
      }

       // should be at new position
       expect(baseCamera.x).toBe(20);
       expect(baseCamera.y).toBe(10);


       // wait 11 frames (1100ms)
      for (let i = 0; i < 11; i++) {
         baseCamera.update(engine, 100);
      }

       // should be at new position
       expect(baseCamera.x).toBe(0);
       expect(baseCamera.y).toBe(0);

       // wait 11 frames (1100ms)
      for (let i = 0; i < 11; i++) {
         baseCamera.update(engine, 100);
      }

       // should be at new position
       expect(baseCamera.x).toBe(100);
       expect(baseCamera.y).toBe(100);
   });

   it('can shake', () => {
      engine.currentScene.camera = baseCamera;
      engine.currentScene.camera.strategy.lockToActor(actor);
      baseCamera.shake(5, 5, 5000);

      expect(baseCamera._isShaking).toBe(true);

   });

   it('can zoom', () => {
      engine.currentScene.camera = baseCamera;
      baseCamera.zoom(2, .1);

      expect(baseCamera._isZooming).toBe(true);
   
   });

   it('can use built-in locked camera strategy', () => {
      engine.currentScene.camera = new ex.BaseCamera();
      let actor = new ex.Actor(0, 0);

      engine.currentScene.camera.strategy.lockToActor(actor);

      engine.currentScene.camera.update(engine, 100);
      expect(engine.currentScene.camera.x).toBe(0);
      expect(engine.currentScene.camera.y).toBe(0);

      actor.pos.setTo(100, 100);
      engine.currentScene.camera.update(engine, 100);
      expect(engine.currentScene.camera.x).toBe(100);
      expect(engine.currentScene.camera.y).toBe(100);
   });

   it('can use built-in locked camera x axis strategy', () => {
      engine.currentScene.camera = new ex.BaseCamera();
      let actor = new ex.Actor(0, 0);

      engine.currentScene.camera.strategy.lockToActorAxis(actor, ex.Axis.X);

      engine.currentScene.camera.update(engine, 100);
      expect(engine.currentScene.camera.x).toBe(0);
      expect(engine.currentScene.camera.y).toBe(0);

      actor.pos.setTo(100, 100);
      engine.currentScene.camera.update(engine, 100);
      expect(engine.currentScene.camera.x).toBe(100);
      expect(engine.currentScene.camera.y).toBe(0);
   });

   it('can use built-in locked camera y axis strategy', () => {
      engine.currentScene.camera = new ex.BaseCamera();
      let actor = new ex.Actor(0, 0);

      engine.currentScene.camera.strategy.lockToActorAxis(actor, ex.Axis.Y);

      engine.currentScene.camera.update(engine, 100);
      expect(engine.currentScene.camera.x).toBe(0);
      expect(engine.currentScene.camera.y).toBe(0);

      actor.pos.setTo(100, 100);
      engine.currentScene.camera.update(engine, 100);
      expect(engine.currentScene.camera.x).toBe(0);
      expect(engine.currentScene.camera.y).toBe(100);
   });

   it('can use built-in radius around actor strategy', () => {
      engine.currentScene.camera = new ex.BaseCamera();
      let actor = new ex.Actor(0, 0);

      engine.currentScene.camera.strategy.radiusAroundActor(actor, 15);

      engine.currentScene.camera.update(engine, 100);
      expect(engine.currentScene.camera.x).toBe(0);
      expect(engine.currentScene.camera.y).toBe(0);

      actor.pos.setTo(100, 100);
      engine.currentScene.camera.update(engine, 100);
      let distance = engine.currentScene.camera.pos.distance(actor.pos);
      expect(distance).toBeCloseTo(15, .01);
   });

   it('can use built-in elastic around actor strategy', () => {
      engine.currentScene.camera = new ex.BaseCamera();
      engine.currentScene.camera.pos.setTo(0, 0);
      let actor = new ex.Actor(0, 0);

      engine.currentScene.camera.strategy.elasticToActor(actor, .05, .1);

      engine.currentScene.camera.update(engine, 100);
      expect(engine.currentScene.camera.x).toBe(0);
      expect(engine.currentScene.camera.y).toBe(0);

      actor.pos.setTo(100, 100);
      engine.currentScene.camera.update(engine, 100);
      engine.currentScene.camera.update(engine, 100);
      engine.currentScene.camera.update(engine, 100);
      let distance = engine.currentScene.camera.pos.distance(actor.pos);
      expect(distance).toBeLessThan((new ex.Vector(100, 100).distance()));

      engine.currentScene.camera.update(engine, 100);
      engine.currentScene.camera.update(engine, 100);
      engine.currentScene.camera.update(engine, 100);
      let distance2 = engine.currentScene.camera.pos.distance(actor.pos);
      expect(distance2).toBeLessThan(distance);
   });

   xit('can zoom in over time', (done) => {
      engine.start().then(() => {
         engine.currentScene.camera.zoom(5, 1000).then(() => {
            imagediff.expectCanvasImageMatches('CameraSpec/zoomin.png', engine.canvas, done);
         });
      });
   });

   xit('can zoom out over time', (done) => {
      engine.start().then(() => {
         engine.currentScene.camera.zoom(.2, 1000).then(() => {
            imagediff.expectCanvasImageMatches('CameraSpec/zoomout.png', engine.canvas, done);
         });
      });
   });


   describe('lifecycle overrides', () => {
      let camera: ex.BaseCamera;

      beforeEach(() => {
         camera = new ex.BaseCamera();
      });

      it('can have onInitialize overriden safely', () => {
         let initCalled = false;
         camera.onInitialize = (engine) => { expect(engine).not.toBe(null); };

         camera.on('initialize', () => { initCalled = true; });

         spyOn(camera, 'onInitialize').and.callThrough();

         camera.update(engine, 100);
            
         expect(initCalled).toBe(true);
         expect(camera.onInitialize).toHaveBeenCalledTimes(1);
      });

      it('can have onPostUpdate overriden safely', () => {
         camera.onPostUpdate = (engine, delta) => {
            expect(engine).not.toBe(null);
            expect(delta).toBe(100);
         };

         spyOn(camera, 'onPostUpdate').and.callThrough();
         spyOn(camera, '_postupdate').and.callThrough();

         camera.update(engine, 100);
         camera.update(engine, 100);


         expect(camera._postupdate).toHaveBeenCalledTimes(2);
         expect(camera.onPostUpdate).toHaveBeenCalledTimes(2);
      });
   
      it('can have onPreUpdate overriden safely', () => {
         camera.onPreUpdate = (engine, delta) => {
            expect(engine).not.toBe(null);
            expect(delta).toBe(100);
         };

         spyOn(camera, 'onPreUpdate').and.callThrough();
         spyOn(camera, '_preupdate').and.callThrough();

         camera.update(engine, 100);
         camera.update(engine, 100);
         
         expect(camera._preupdate).toHaveBeenCalledTimes(2);
         expect(camera.onPreUpdate).toHaveBeenCalledTimes(2);
      });
   });

});
