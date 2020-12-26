import * as ex from '@excalibur';
import { ExcaliburMatchers } from 'excalibur-jasmine';
import { Camera } from '@excalibur';
describe('A Screen', () => {
  let canvas: HTMLCanvasElement;
  let context: CanvasRenderingContext2D;
  let browser: ex.BrowserEvents;
  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    canvas = document.createElement('canvas');
    context = canvas.getContext('2d');
    document.body.appendChild(canvas);
    browser = new ex.BrowserEvents(window, document);
  });

  afterEach(() => {
    document.body.removeChild(canvas);
  });

  it('should exist', () => {
    expect(ex.Screen).toBeDefined();
  });

  it('can be constructed', () => {
    const sut = new ex.Screen({
      canvas,
      context,
      browser,
      viewport: { width: 400, height: 400 }
    });
    expect(sut).toBeDefined();
  });

  it('will use the current pixel ratio', () => {
    const sut = new ex.Screen({
      canvas,
      context,
      browser,
      viewport: { width: 400, height: 400 }
    });

    expect(sut.pixelRatio).toEqual(window.devicePixelRatio);
  });

  it('can override pixel ratio', () => {
    const sut = new ex.Screen({
      canvas,
      context,
      browser,
      viewport: { width: 400, height: 400 },
      pixelRatio: 10
    });

    expect(sut.pixelRatio).not.toEqual(window.devicePixelRatio);
  });

  it('can specify a non-scaled resolution', () => {
    const sut = new ex.Screen({
      canvas,
      context,
      browser,
      viewport: { width: 800, height: 600 },
      pixelRatio: 1
    });
    sut.applyResolutionAndViewport();
    expect(sut.canvas.width).toBe(800);
    expect(sut.canvas.height).toBe(600);
    expect(sut.scaledWidth).toBe(800);
    expect(sut.scaledHeight).toBe(600);
    expect(sut.canvas.style.width).toBe('800px');
    expect(sut.canvas.style.height).toBe('600px');
    expect(sut.viewport.width).toBe(800);
    expect(sut.viewport.height).toBe(600);
  });

  it('can specify a scaled resolution', () => {
    const sut = new ex.Screen({
      canvas,
      context,
      browser,
      viewport: { width: 800, height: 600 },
      pixelRatio: 2
    });
    sut.applyResolutionAndViewport();
    // Internal resolution is scaled for hi dpi
    expect(sut.canvas.width).toBe(1600);
    expect(sut.canvas.height).toBe(1200);
    expect(sut.scaledWidth).toBe(1600);
    expect(sut.scaledHeight).toBe(1200);

    // Viewport remains the same
    expect(sut.canvas.style.width).toBe('800px');
    expect(sut.canvas.style.height).toBe('600px');
    expect(sut.viewport.width).toBe(800);
    expect(sut.viewport.height).toBe(600);
  });

  it('can specify anti-aliasing off', () => {
    const sut = new ex.Screen({
      canvas,
      context,
      browser,
      viewport: { width: 800, height: 600 },
      pixelRatio: 2,
      antialiasing: false
    });

    sut.applyResolutionAndViewport();

    expect(context.imageSmoothingEnabled).toBeFalse();
    expect(canvas.style.imageRendering).toBe('pixelated');
  });

  it('can specify anti-aliasing off will fall back to crisp-edges if pixelated not supported', () => {
    // Using some proxy trickery we can simulate the behavior of firefox not supporting pixelated
    const styleProxy = new Proxy(
      {},
      {
        set: function (object, property, value) {
          if (property === 'imageRendering' && value === 'pixelated') {
            object[property] = '';
            return true;
          }

          object[property] = value;

          return true;
        }
      }
    );
    const canvasStub = { ...canvas, style: styleProxy } as HTMLCanvasElement;

    const sut = new ex.Screen({
      canvas: canvasStub,
      context,
      browser,
      viewport: { width: 800, height: 600 },
      pixelRatio: 2,
      antialiasing: false
    });

    sut.applyResolutionAndViewport();

    expect(context.imageSmoothingEnabled).toBeFalse();
    expect(canvasStub.style.imageRendering).toBe('crisp-edges');
  });

  it('can specify anti-aliasing on', () => {
    const sut = new ex.Screen({
      canvas,
      context,
      browser,
      viewport: { width: 800, height: 600 },
      pixelRatio: 2,
      antialiasing: true
    });

    sut.applyResolutionAndViewport();

    expect(context.imageSmoothingEnabled).toBeTrue();
    expect(canvas.style.imageRendering).toBe('auto');
  });

  it('can push and pop screen resolution', () => {
    const sut = new ex.Screen({
      canvas,
      context,
      browser,
      viewport: { width: 800, height: 600 },
      pixelRatio: 2
    });
    sut.pushResolutionAndViewport();
    sut.resolution = { width: 200, height: 100 };
    sut.applyResolutionAndViewport();

    expect(sut.resolution.width).toBe(200);
    expect(sut.resolution.height).toBe(100);
    expect(sut.scaledWidth).toBe(400);
    expect(sut.scaledHeight).toBe(200);

    sut.popResolutionAndViewport();
    sut.applyResolutionAndViewport();

    expect(sut.resolution.width).toBe(800);
    expect(sut.resolution.height).toBe(600);
    expect(sut.scaledWidth).toBe(1600);
    expect(sut.scaledHeight).toBe(1200);
  });

  it('can calculate world coordinates from screen coordinates without a camera', () => {
    const sut = new ex.Screen({
      canvas,
      context,
      browser,
      viewport: { width: 800, height: 600 },
      pixelRatio: 2
    });
    sut.applyResolutionAndViewport();

    // The camera is always center screen
    // The absense of a camera is treated like a camera at (0, 0) in world space
    expect(sut.screenToWorldCoordinates(ex.vec(400, 300))).toBeVector(ex.vec(0, 0));
    expect(sut.screenToWorldCoordinates(ex.vec(0, 0))).toBeVector(ex.vec(-400, -300));
    expect(sut.screenToWorldCoordinates(ex.vec(800, 0))).toBeVector(ex.vec(400, -300));
    expect(sut.screenToWorldCoordinates(ex.vec(0, 600))).toBeVector(ex.vec(-400, 300));
    expect(sut.screenToWorldCoordinates(ex.vec(800, 600))).toBeVector(ex.vec(400, 300));
  });

  it('can calculate screen coordinates from world coordinates without a camera', () => {
    const sut = new ex.Screen({
      canvas,
      context,
      browser,
      viewport: { width: 800, height: 600 },
      pixelRatio: 2
    });
    sut.applyResolutionAndViewport();

    // The camera is always center screen
    // The absense of a camera is treated like a camera at (0, 0) in world space
    expect(sut.worldToScreenCoordinates(ex.vec(0, 0))).toBeVector(ex.vec(400, 300));
    expect(sut.worldToScreenCoordinates(ex.vec(-400, -300))).toBeVector(ex.vec(0, 0));
    expect(sut.worldToScreenCoordinates(ex.vec(400, -300))).toBeVector(ex.vec(800, 0));
    expect(sut.worldToScreenCoordinates(ex.vec(-400, 300))).toBeVector(ex.vec(0, 600));
    expect(sut.worldToScreenCoordinates(ex.vec(400, 300))).toBeVector(ex.vec(800, 600));
  });

  it('can calculate world coordinates from screen coordinates with a camera', () => {
    const sut = new ex.Screen({
      canvas,
      context,
      browser,
      viewport: { width: 800, height: 600 },
      pixelRatio: 2
    });
    const camera = new Camera();
    camera.x = 400;
    camera.y = 300;
    camera.z = 2;

    sut.setCurrentCamera(camera);

    sut.applyResolutionAndViewport();

    // The camera is always center screen
    // The absense of a camera is treated like a camera at (0, 0) in world space
    expect(sut.screenToWorldCoordinates(ex.vec(400, 300))).toBeVector(ex.vec(400, 300));
    expect(sut.screenToWorldCoordinates(ex.vec(0, 0))).toBeVector(ex.vec(200, 150));
    expect(sut.screenToWorldCoordinates(ex.vec(800, 0))).toBeVector(ex.vec(600, 150));
    expect(sut.screenToWorldCoordinates(ex.vec(0, 600))).toBeVector(ex.vec(200, 450));
    expect(sut.screenToWorldCoordinates(ex.vec(800, 600))).toBeVector(ex.vec(600, 450));
  });

  it('can calculate screen coordinates from world coordinates with a camera', () => {
    const sut = new ex.Screen({
      canvas,
      context,
      browser,
      viewport: { width: 800, height: 600 },
      pixelRatio: 2
    });
    const camera = new Camera();
    camera.x = 400;
    camera.y = 300;
    camera.z = 2;

    sut.setCurrentCamera(camera);

    sut.applyResolutionAndViewport();

    // The camera is always center screen
    // The absense of a camera is treated like a camera at (0, 0) in world space
    expect(sut.worldToScreenCoordinates(ex.vec(400, 300))).toBeVector(ex.vec(400, 300));
    expect(sut.worldToScreenCoordinates(ex.vec(200, 150))).toBeVector(ex.vec(0, 0));
    expect(sut.worldToScreenCoordinates(ex.vec(600, 150))).toBeVector(ex.vec(800, 0));
    expect(sut.worldToScreenCoordinates(ex.vec(200, 450))).toBeVector(ex.vec(0, 600));
    expect(sut.worldToScreenCoordinates(ex.vec(600, 450))).toBeVector(ex.vec(800, 600));
  });

  it('can return world bounds', () => {
    const sut = new ex.Screen({
      canvas,
      context,
      browser,
      viewport: { width: 800, height: 600 },
      pixelRatio: 2
    });
    const camera = new Camera();
    camera.x = 400;
    camera.y = 300;
    camera.z = 2;

    sut.setCurrentCamera(camera);
    sut.applyResolutionAndViewport();

    const bounds = sut.getWorldBounds();

    expect(bounds.left).toBe(200);
    expect(bounds.right).toBe(600);
    expect(bounds.bottom).toBe(450);
    expect(bounds.top).toBe(150);
  });
});
