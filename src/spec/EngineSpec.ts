/// <reference path="jasmine.d.ts" />
/// <reference path="Mocks.ts" />

describe('The engine', () => {
   var engine: ex.Engine;
   var scene: ex.Scene;   
   var mock = new Mocks.Mocker();
   var loop: Mocks.IGameLoop;
   var initHiDpiSpy: jasmine.Spy;

   beforeEach(() => {  
      
      initHiDpiSpy = spyOn(ex.Engine.prototype, '_initializeHiDpi');
      
      engine = TestUtils.engine();
      scene = new ex.Scene(engine);
      engine.currentScene = scene;
      loop = mock.loop(engine);
      

      engine.start();
   });

   afterEach(() => {
      initHiDpiSpy.calls.reset();
      engine.stop();
      engine = null;
      (<any>window).devicePixelRatio = 1;
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

   it('should emit a predraw event', () => {
      var fired = false;
      engine.on('predraw', () => fired = true);

      loop.advance(100);

      expect(fired).toBe(true);
   });

   it ('should emit a postdraw event', () => {
      var fired = false;
      engine.on('postdraw', () => fired = true);

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

   it('should return screen dimensions', () => {
      engine.start();
      var left = engine.screenToWorldCoordinates(ex.Vector.Zero).x;
      var top = engine.screenToWorldCoordinates(ex.Vector.Zero).y;
      var right = left + engine.drawWidth;
      var bottom = top + engine.drawHeight;
      var localBoundingBox = new ex.BoundingBox(left, top, right, bottom);
      expect(engine.getWorldBounds()).toEqual(localBoundingBox);
   });

   it('should return correct scren dimensions if zoomed in', () => {
      engine.start();
      engine.currentScene.camera.z = 2;

      expect(engine.drawHeight).toBe(250);
      expect(engine.drawWidth).toBe(250);
      expect(engine.halfDrawHeight).toBe(125);
      expect(engine.halfDrawWidth).toBe(125);

      expect(engine.canvasHeight).toBe(500);
      expect(engine.canvasWidth).toBe(500);
      expect(engine.halfCanvasHeight).toBe(250);
      expect(engine.halfCanvasWidth).toBe(250);

   });
   
   it('should accept a displayMode of Position', () => {
     expect(engine.displayMode).toEqual(ex.DisplayMode.Position);
   });
   
   it('should accept strings to position the window', () => {
     expect(engine.canvas.style.top).toEqual('0px');
   });
   
   it('should accept AbsolutePosition Interfaces to position the window', () => {
     var game = new ex.Engine({
       height: 600,
       width: 800,
       suppressConsoleBootMessage: true,
       suppressMinimumBrowserFeatureDetection: true,
       displayMode: ex.DisplayMode.Position,
       position: {top: 1, left: '5em'}
     });
     
     expect(game.canvas.style.top).toEqual('1px');
   });
   
   it('should accept backgroundColor', () => {
      var game = new ex.Engine({
        height: 600,
        width: 800,
        suppressConsoleBootMessage: true,
        suppressMinimumBrowserFeatureDetection: true,
        backgroundColor: ex.Color.White
      });

      expect(game.backgroundColor.toString()).toEqual(ex.Color.White.toString());
   });

   it('should accept default backgroundColor #2185d0', () => {
      var game = new ex.Engine({
         height: 600,
         width: 800,
         suppressConsoleBootMessage: true,
         suppressMinimumBrowserFeatureDetection: true
      });

      expect(game.backgroundColor.toString()).toEqual(ex.Color.fromHex('#2185d0').toString());
   });

   it('should detect hidpi when the device pixel ratio is greater than 1', (done) => {
      
      // Arrange
      var oldWidth = 100;
      var oldHeight = 100;

      (<any>window).devicePixelRatio = 2;
      var newWidth = oldWidth * (<any>window).devicePixelRatio;
      var newHeight = oldHeight * (<any>window).devicePixelRatio;
      
      engine = TestUtils.engine({width: 100, height: 100, suppressHiDPIScaling: false});
      // Act
      engine.start().then(() => {

         // Assert
         expect(engine.isHiDpi).toBe(true);
         expect((<any>engine)._initializeHiDpi).toHaveBeenCalled();
         (<any>window).devicePixelRatio = 1;
         
         done();
      });

      


   });

   it('should not detect hidpi with a device pixel ratio equal to 1', (done) => {
      // Arrange
      var oldWidth = 100;
      var oldHeight = 100;

      (<any>window).devicePixelRatio = 1;
      var newWidth = oldWidth * (<any>window).devicePixelRatio;
      var newHeight = oldHeight * (<any>window).devicePixelRatio;
      
      // Act
      engine = TestUtils.engine({width: 100, height: 100, suppressHiDPIScaling: false});
      
      engine.start().then(() => {
         // Assert
         expect(engine.isHiDpi).toBe(false);
         done();
      });
   });

   it('should respect a hidpi suppression flag even if the pixel ratio is greater than 1', (done) => {
      // Arrange
      var oldWidth = 100;
      var oldHeight = 100;

      (<any>window).devicePixelRatio = 2;
      var newWidth = oldWidth * (<any>window).devicePixelRatio;
      var newHeight = oldHeight * (<any>window).devicePixelRatio;
      // Act
      
      (<any>ex.Engine.prototype)._initializeHiDpi.calls.reset();
      engine = TestUtils.engine({width: 100, height: 100, suppressHiDPIScaling: true});

      engine.start().then(() => {
         // Assert
         expect(engine.isHiDpi).toBe(false);
         expect((<any>engine)._initializeHiDpi).not.toHaveBeenCalled();
         (<any>window).devicePixelRatio = 1;
         done();
      });

      
   });


   describe('lifecycle overrides', () => {
      let engine: ex.Engine;
      beforeEach(() => {
         engine = TestUtils.engine({width: 400, height: 400});

      });

      afterEach(() => {
         engine.stop();
         engine = null;
      });
      
      it('can have onInitialize overriden safely', () => {
         let initCalled = false;
         engine.onInitialize = (engine) => { expect(engine).not.toBe(null); };

         engine.on('initialize', () => { initCalled = true; });

         spyOn(engine, 'onInitialize').and.callThrough();

         (<any>engine)._update(100);
            
         expect(initCalled).toBe(true);
         expect(engine.onInitialize).toHaveBeenCalledTimes(1);
      });

      it('can have onPostUpdate overriden safely', () => {
         engine.onPostUpdate = (engine, delta) => {
            expect(engine).not.toBe(null);
            expect(delta).toBe(100);
         };

         spyOn(engine, 'onPostUpdate').and.callThrough();
         spyOn(engine, '_postupdate').and.callThrough();

         (<any>engine)._update(100);
         (<any>engine)._update(100);

         expect(engine._postupdate).toHaveBeenCalledTimes(2);
         expect(engine.onPostUpdate).toHaveBeenCalledTimes(2);
      });
   
      it('can have onPreUpdate overriden safely', () => {
         engine.onPreUpdate = (engine, delta) => {
            expect(engine).not.toBe(null);
            expect(delta).toBe(100);
         };

         spyOn(engine, 'onPreUpdate').and.callThrough();
         spyOn(engine, '_preupdate').and.callThrough();

         (<any>engine)._update(100);
         (<any>engine)._update(100);
         
         expect(engine._preupdate).toHaveBeenCalledTimes(2);
         expect(engine.onPreUpdate).toHaveBeenCalledTimes(2);
      });


      it('can have onPreDraw overriden safely', () => {
         engine.onPreDraw = (ctx, delta) => {
            expect(<any>ctx).not.toBe(null);
            expect(delta).toBe(100);
         };

         spyOn(engine, 'onPreDraw').and.callThrough();
         spyOn(engine, '_predraw').and.callThrough();

         (<any>engine)._draw(100);
         (<any>engine)._draw(100);

         expect(engine._predraw).toHaveBeenCalledTimes(2);
         expect(engine.onPreDraw).toHaveBeenCalledTimes(2);
      });

      it('can have onPostDraw overriden safely', () => {
         engine.onPostDraw = (ctx, delta) => {
            expect(<any>ctx).not.toBe(null);
            expect(delta).toBe(100);
         };

         spyOn(engine, 'onPostDraw').and.callThrough();
         spyOn(engine, '_postdraw').and.callThrough();

         (<any>engine)._draw(100);
         (<any>engine)._draw(100);

         expect(engine._postdraw).toHaveBeenCalledTimes(2);
         expect(engine.onPostDraw).toHaveBeenCalledTimes(2);
      });


   });

});