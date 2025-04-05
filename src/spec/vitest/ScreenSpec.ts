import * as ex from '@excalibur';

import { Camera } from '@excalibur';

describe('A Screen', () => {
  let canvas: HTMLCanvasElement;
  let context: ex.ExcaliburGraphicsContext;
  let browser: ex.BrowserEvents;

  beforeEach(() => {
    // It's important nothing else is hanging out in the dom
    Array.from(document.body.children).forEach((element) => {
      document.body.removeChild(element);
    });
    document.body.style.margin = '0';
    canvas = document.createElement('canvas');
    context = new ex.ExcaliburGraphicsContext2DCanvas({
      canvasElement: canvas
    });
    document.body.appendChild(canvas);
    browser = new ex.BrowserEvents(window, document);
  });

  afterEach(() => {
    Array.from(document.body.children).forEach((element) => {
      document.body.removeChild(element);
    });
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

  it('can calculate the aspect ratio', () => {
    const sut = new ex.Screen({
      canvas,
      context,
      browser,
      viewport: { width: 800, height: 600 }
    });

    expect(sut.aspectRatio).toBe(800 / 600);
  });

  it('can use fit screen display mode, the viewport will adjust to it width', () => {
    const sut = new ex.Screen({
      canvas,
      context,
      browser,
      displayMode: ex.DisplayMode.FitScreen,
      viewport: { width: 800, height: 600 }
    });

    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1000 });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 800 });

    window.dispatchEvent(new Event('resize'));

    expect(sut.resolution.width).toBe(800);
    expect(sut.resolution.height).toBe(600);
    expect(sut.contentArea.width).toBe(800);
    expect(sut.contentArea.height).toBe(600);
    expect(sut.viewport.width).toBe(1000);
    expect(sut.viewport.height).toBe(1000 / sut.aspectRatio);
  });

  it('can use fit screen display mode, the viewport will adjust to it height', () => {
    const sut = new ex.Screen({
      canvas,
      context,
      browser,
      displayMode: ex.DisplayMode.FitScreen,
      viewport: { width: 800, height: 600 }
    });

    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1300 });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 800 });

    window.dispatchEvent(new Event('resize'));

    expect(sut.resolution.width).toBe(800);
    expect(sut.resolution.height).toBe(600);
    expect(sut.contentArea.width).toBe(800);
    expect(sut.contentArea.height).toBe(600);
    expect(sut.viewport.width).toBe(800 * sut.aspectRatio);
    expect(sut.viewport.height).toBe(800);
  });

  it('can use the FitScreenAndFill display mode, screen aspectRatio > window aspect ratio', () => {
    const sut = new ex.Screen({
      canvas,
      context,
      browser,
      displayMode: ex.DisplayMode.FitScreenAndFill,
      viewport: { width: 800, height: 600 }
    });

    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1300 });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 1300 });

    window.dispatchEvent(new Event('resize'));

    expect(sut.resolution.width).toBe(800);
    expect(sut.resolution.height).toBe(800);
    expect(sut.contentArea.width).toBe(800);
    expect(sut.contentArea.height).toBe(600);
    expect(sut.viewport.width).toBe(1300);
    expect(sut.viewport.height).toBe(1300);
  });

  it('can use the FitScreenAndFill display mode, screen aspectRatio < window aspect ratio', () => {
    const sut = new ex.Screen({
      canvas,
      context,
      browser,
      displayMode: ex.DisplayMode.FitScreenAndFill,
      viewport: { width: 800, height: 600 }
    });

    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1300 });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 800 });

    window.dispatchEvent(new Event('resize'));

    expect(sut.resolution.width).toBe(975);
    expect(sut.resolution.height).toBe(600);
    expect(sut.contentArea.width).toBe(800);
    expect(sut.contentArea.height).toBe(600);
    expect(sut.viewport.width).toBe(1300);
    expect(sut.viewport.height).toBe(800);
  });

  it('can use the FitContainerAndFill display mode, screen aspectRatio > container aspect ratio', () => {
    const parentEl = document.createElement('div');
    document.body.removeChild(canvas);
    parentEl.appendChild(canvas);
    document.body.appendChild(parentEl);

    const sut = new ex.Screen({
      canvas,
      context,
      browser,
      displayMode: ex.DisplayMode.FitContainerAndFill,
      viewport: { width: 800, height: 600 }
    });

    parentEl.style.width = '1300px';
    parentEl.style.height = '1300px';
    parentEl.dispatchEvent(new Event('resize'));

    expect(sut.parent).toBe(parentEl);
    expect(sut.resolution.width).toBe(800);
    expect(sut.resolution.height).toBe(800);
    expect(sut.contentArea.width).toBe(800);
    expect(sut.contentArea.height).toBe(600);
    expect(sut.viewport.width).toBe(100);
    expect(sut.viewport.widthUnit).toBe('percent');
    expect(sut.viewport.height).toBe(100);
    expect(sut.viewport.heightUnit).toBe('percent');
    expect(sut.canvas.offsetWidth).toBe(1300);
    expect(sut.canvas.offsetHeight).toBe(1300);
  });

  it('can use the FitContainerAndFill display mode, screen aspectRatio < container aspect ratio', () => {
    const parentEl = document.createElement('div');
    document.body.removeChild(canvas);
    parentEl.appendChild(canvas);
    document.body.appendChild(parentEl);

    const sut = new ex.Screen({
      canvas,
      context,
      browser,
      displayMode: ex.DisplayMode.FitContainerAndFill,
      viewport: { width: 800, height: 600 }
    });

    parentEl.style.width = '1300px';
    parentEl.style.height = '800px';
    parentEl.dispatchEvent(new Event('resize'));

    expect(sut.parent).toBe(parentEl);
    expect(sut.resolution.width).toBe(975);
    expect(sut.resolution.height).toBe(600);
    expect(sut.contentArea.width).toBe(800);
    expect(sut.contentArea.height).toBe(600);
    expect(sut.viewport.width).toBe(100);
    expect(sut.viewport.widthUnit).toBe('percent');
    expect(sut.viewport.height).toBe(100);
    expect(sut.viewport.heightUnit).toBe('percent');
    expect(sut.canvas.offsetWidth).toBe(1300);
    expect(sut.canvas.offsetHeight).toBe(800);
  });

  it('can use the FitScreenAndZoom display mode, screen aspect ratio < window aspect ratio', () => {
    const sut = new ex.Screen({
      canvas,
      context,
      browser,
      displayMode: ex.DisplayMode.FitScreenAndZoom,
      viewport: { width: 800, height: 600 }
    });

    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1300 });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 800 });

    window.dispatchEvent(new Event('resize'));

    expect(sut.resolution.width).toBe(800);
    expect(sut.resolution.height).toBe(600);
    expect(sut.contentArea.width).toBe(800);
    expect(sut.contentArea.height).toBeCloseTo(492.3, 1);
    expect(sut.viewport.width).toBe(1300);
    expect(sut.viewport.height).toBeCloseTo(975);
  });

  it('can use the FitScreenAndZoom display mode, screen aspect ratio > window aspect ratio', () => {
    const sut = new ex.Screen({
      canvas,
      context,
      browser,
      displayMode: ex.DisplayMode.FitScreenAndZoom,
      viewport: { width: 800, height: 600 }
    });

    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1300 });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 1300 });

    window.dispatchEvent(new Event('resize'));

    expect(sut.resolution.width).toBe(800);
    expect(sut.resolution.height).toBe(600);
    expect(sut.contentArea.width).toBe(600);
    expect(sut.contentArea.height).toBe(600);
    expect(sut.viewport.width).toBeCloseTo(1733.3, 1);
    expect(sut.viewport.height).toBe(1300);
  });

  it('can use the FitContainerAndZoom display mode, screen aspect ratio < container aspect ratio', () => {
    const parentEl = document.createElement('div');
    document.body.removeChild(canvas);
    parentEl.appendChild(canvas);
    document.body.appendChild(parentEl);

    const sut = new ex.Screen({
      canvas,
      context,
      browser,
      displayMode: ex.DisplayMode.FitContainerAndZoom,
      viewport: { width: 800, height: 600 }
    });

    parentEl.style.width = '1300px';
    parentEl.style.height = '800px';
    parentEl.dispatchEvent(new Event('resize'));

    expect(sut.resolution.width).toBe(800);
    expect(sut.resolution.height).toBe(600);
    expect(sut.contentArea.width).toBe(800);
    expect(sut.contentArea.height).toBeCloseTo(492.3, 1);
    expect(sut.viewport.width).toBe(1300);
    expect(sut.viewport.height).toBeCloseTo(975);
  });

  it('can use the FitContainerAndZoom display mode, screen aspect ratio > container aspect ratio', () => {
    const parentEl = document.createElement('div');
    document.body.removeChild(canvas);
    parentEl.appendChild(canvas);
    document.body.appendChild(parentEl);

    const sut = new ex.Screen({
      canvas,
      context,
      browser,
      displayMode: ex.DisplayMode.FitContainerAndZoom,
      viewport: { width: 800, height: 600 }
    });

    parentEl.style.width = '1300px';
    parentEl.style.height = '1300px';
    parentEl.dispatchEvent(new Event('resize'));

    expect(sut.resolution.width).toBe(800);
    expect(sut.resolution.height).toBe(600);
    expect(sut.contentArea.width).toBe(600);
    expect(sut.contentArea.height).toBe(600);
    expect(sut.viewport.width).toBeCloseTo(1733.3, 1);
    expect(sut.viewport.height).toBe(1300);
  });

  describe('can use fit container display mode, the viewport', () => {
    it('will adjust to height', () => {
      const parentEl = document.createElement('div');
      parentEl.appendChild(canvas);
      document.body.appendChild(parentEl);

      const sut = new ex.Screen({
        canvas,
        context,
        browser,
        displayMode: ex.DisplayMode.FitContainer,
        viewport: { width: 800, height: 600 }
      });

      parentEl.style.width = '1300px';
      parentEl.style.height = '800px';
      parentEl.dispatchEvent(new Event('resize'));

      expect(sut.parent).toBe(parentEl);
      expect(sut.resolution.width).toBe(800);
      expect(sut.resolution.height).toBe(600);
      expect(sut.viewport.width).toBe(800 * sut.aspectRatio);
      expect(sut.viewport.height).toBe(100);
      expect(sut.viewport.heightUnit).toBe('percent');
      expect(sut.canvas.offsetHeight).toBe(800);
      expect(sut.canvas.offsetWidth).toBe(Math.ceil(800 * sut.aspectRatio));
    });

    it('will adjust to width', () => {
      const parentEl = document.createElement('div');
      parentEl.appendChild(canvas);
      document.body.appendChild(parentEl);

      const sut = new ex.Screen({
        canvas,
        context,
        browser,
        displayMode: ex.DisplayMode.FitContainer,
        viewport: { width: 800, height: 600 }
      });

      parentEl.style.width = '1000px';
      parentEl.style.height = '800px';
      parentEl.dispatchEvent(new Event('resize'));

      expect(sut.parent).toBe(parentEl);
      expect(sut.resolution.width).toBe(800);
      expect(sut.resolution.height).toBe(600);
      expect(sut.viewport.width).toBe(100);
      expect(sut.viewport.widthUnit).toBe('percent');
      expect(sut.viewport.height).toBe(1000 / sut.aspectRatio);
      expect(sut.canvas.offsetHeight).toBe(1000 / sut.aspectRatio);
      expect(sut.canvas.offsetWidth).toBe(1000);
    });
  });

  it('can use fill screen display mode, the viewport and resolution adjust to match', () => {
    const sut = new ex.Screen({
      canvas,
      context,
      browser,
      displayMode: ex.DisplayMode.FillScreen,
      viewport: { width: 800, height: 600 }
    });

    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1300 });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 800 });

    window.dispatchEvent(new Event('resize'));

    expect(sut.resolution.width).toBe(1300);
    expect(sut.resolution.height).toBe(800);
    expect(sut.viewport.width).toBe(1300);
    expect(sut.viewport.height).toBe(800);
  });

  it('adjusts coordinates by height when using fullscreen api', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1000 });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 800 });
    const sut = new ex.Screen({
      canvas,
      context,
      browser,
      displayMode: ex.DisplayMode.Fixed,
      viewport: { width: 800, height: 600 }
    });

    expect(sut.isFullScreen).toBe(false);

    const nonFullScreenPage = sut.screenToPageCoordinates(ex.vec(800, 600));
    expect(nonFullScreenPage).toBeVector(ex.vec(800, 600));
    const nonFullScreenScreen = sut.pageToScreenCoordinates(nonFullScreenPage);
    expect(nonFullScreenScreen).toBeVector(ex.vec(800, 600));

    canvas.dispatchEvent(new Event('fullscreenchange'));
    expect(sut.isFullScreen).toBe(true);

    const page = sut.screenToPageCoordinates(ex.vec(800, 600));
    expect(page).toBeVector(ex.vec(1000, 775));
    const screen = sut.pageToScreenCoordinates(page);
    expect(screen).toBeVector(ex.vec(800, 600));
  });

  it('adjusts coordinates by width when using fullscreen api', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1300 });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 800 });
    const sut = new ex.Screen({
      canvas,
      context,
      browser,
      displayMode: ex.DisplayMode.Fixed,
      viewport: { width: 800, height: 600 }
    });

    expect(sut.isFullScreen).toBe(false);
    const nonFullScreenPage = sut.screenToPageCoordinates(ex.vec(800, 600));
    expect(nonFullScreenPage).toBeVector(ex.vec(800, 600));
    const nonFullScreenScreen = sut.pageToScreenCoordinates(nonFullScreenPage);
    expect(nonFullScreenScreen).toBeVector(ex.vec(800, 600));

    canvas.dispatchEvent(new Event('fullscreenchange'));
    expect(sut.isFullScreen).toBe(true);

    const page = sut.screenToPageCoordinates(ex.vec(800, 600));
    expect(page).toBeVector(ex.vec(1183.33, 800));
    const screen = sut.pageToScreenCoordinates(page);
    expect(screen).toBeVector(ex.vec(800, 600));
  });

  it('will go fullscreen with the canvas element by default', () => {
    const mockCanvas = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      requestFullscreen: vi.fn(),
      style: {}
    } as any;
    const sut = new ex.Screen({
      canvas: mockCanvas,
      context,
      browser,
      displayMode: ex.DisplayMode.Fixed,
      viewport: { width: 800, height: 600 }
    });

    sut.enterFullscreen();

    expect(mockCanvas.requestFullscreen).toHaveBeenCalled();
  });

  it('will go fullscreen given an element id', () => {
    const container = document.createElement('div');
    container.id = 'some-id';
    container.appendChild(canvas);
    document.body.appendChild(container);

    const sut = new ex.Screen({
      canvas,
      context,
      browser,
      displayMode: ex.DisplayMode.Fixed,
      viewport: { width: 800, height: 600 }
    });

    const fakeElement = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      requestFullscreen: vi.fn(),
      getAttribute: vi.fn(),
      setAttribute: vi.fn()
    };
    vi.spyOn(document, 'getElementById').mockImplementation(() => fakeElement as any);

    sut.enterFullscreen('some-id');

    expect(document.getElementById).toHaveBeenCalledWith('some-id');
    expect(fakeElement.getAttribute).toHaveBeenCalledWith('ex-fullscreen-listener');
    expect(fakeElement.setAttribute).toHaveBeenCalledWith('ex-fullscreen-listener', 'true');
    expect(fakeElement.addEventListener).toHaveBeenCalled();
    expect(fakeElement.requestFullscreen).toHaveBeenCalled();
  });

  it('can round trip convert coordinates', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1300 });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 800 });
    const sut = new ex.Screen({
      canvas,
      context,
      browser,
      displayMode: ex.DisplayMode.FitScreen,
      viewport: { width: 800, height: 600 }
    });

    const page = new ex.Vector(100, 200);
    const screen = sut.pageToScreenCoordinates(page);

    const world = sut.screenToWorldCoordinates(screen);

    const screen2 = sut.worldToScreenCoordinates(world);

    const page2 = sut.screenToPageCoordinates(screen2);

    const world2 = sut.pageToWorldCoordinates(page);

    const page3 = sut.worldToPageCoordinates(world2);

    expect(page).toBeVector(page2);
    expect(page).toBeVector(page3);
    expect(screen).toBeVector(screen2);
    expect(world).toBeVector(world2);
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
      canvasImageRendering: 'pixelated',
      browser,
      viewport: { width: 800, height: 600 },
      pixelRatio: 2,
      antialiasing: false
    });

    sut.applyResolutionAndViewport();

    expect(context.smoothing).toBe(false);
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
    canvasStub.addEventListener = () => {
      /* nothing */
    };

    const sut = new ex.Screen({
      canvas: canvasStub,
      context,
      browser,
      canvasImageRendering: 'pixelated',
      viewport: { width: 800, height: 600 },
      pixelRatio: 2,
      antialiasing: false
    });

    sut.applyResolutionAndViewport();

    expect(context.smoothing).toBe(false);
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

    expect(context.smoothing).toBe(true);
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
    // The absence of a camera is treated like a camera at (0, 0) in world space
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
    // The absence of a camera is treated like a camera at (0, 0) in world space
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
    camera.zoom = 2;

    sut.setCurrentCamera(camera);

    sut.applyResolutionAndViewport();
    camera._initialize({ screen: sut, clock: { elapsed: () => 16 } } as ex.Engine);

    // The camera is always center screen
    // The absence of a camera is treated like a camera at (0, 0) in world space
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
    camera.zoom = 2;

    sut.setCurrentCamera(camera);

    sut.applyResolutionAndViewport();
    camera._initialize({ screen: sut, clock: { elapsed: () => 16 } } as ex.Engine);

    // The camera is always center screen
    // The absence of a camera is treated like a camera at (0, 0) in world space
    expect(sut.worldToScreenCoordinates(ex.vec(400, 300))).toBeVector(ex.vec(400, 300));
    expect(sut.worldToScreenCoordinates(ex.vec(200, 150))).toBeVector(ex.vec(0, 0));
    expect(sut.worldToScreenCoordinates(ex.vec(600, 150))).toBeVector(ex.vec(800, 0));
    expect(sut.worldToScreenCoordinates(ex.vec(200, 450))).toBeVector(ex.vec(0, 600));
    expect(sut.worldToScreenCoordinates(ex.vec(600, 450))).toBeVector(ex.vec(800, 600));
  });

  it('can calculate the excalibur worldToPagePixelRatio 2x', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1600 });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 1200 });
    const sut = new ex.Screen({
      canvas,
      context,
      browser,
      displayMode: ex.DisplayMode.FitScreen,
      viewport: { width: 800, height: 600 },
      pixelRatio: 2
    });

    expect(sut.worldToPagePixelRatio).toBe(2);
    expect(document.documentElement.style.getPropertyValue('--ex-pixel-ratio')).toBe('2');
  });

  it('can calculate the excalibur worldToPagePixelRatio .5x', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 400 });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 300 });
    const sut = new ex.Screen({
      canvas,
      context,
      browser,
      displayMode: ex.DisplayMode.FitScreen,
      viewport: { width: 800, height: 600 },
      pixelRatio: 2
    });

    expect(sut.worldToPagePixelRatio).toBe(0.5);
    expect(document.documentElement.style.getPropertyValue('--ex-pixel-ratio')).toBe('0.5');
  });

  it('can calculate the excalibur worldToPagePixelRatio 1.5x', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1200 });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 1000 });
    const sut = new ex.Screen({
      canvas,
      context,
      browser,
      displayMode: ex.DisplayMode.FitScreen,
      viewport: { width: 800, height: 600 },
      pixelRatio: 2
    });

    expect(sut.worldToPagePixelRatio).toBe(1.5);
    expect(document.documentElement.style.getPropertyValue('--ex-pixel-ratio')).toBe('1.5');
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
    camera.zoom = 2;

    sut.setCurrentCamera(camera);
    sut.applyResolutionAndViewport();
    camera._initialize({ screen: sut, clock: { elapsed: () => 16 } } as ex.Engine);

    const bounds = sut.getWorldBounds();

    expect(bounds.left).toBe(200);
    expect(bounds.right).toBe(600);
    expect(bounds.bottom).toBe(450);
    expect(bounds.top).toBe(150);
  });

  it('can return world bounds with camera rotation', () => {
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
    camera.rotation = Math.PI / 2;
    camera.zoom = 2;

    sut.setCurrentCamera(camera);
    sut.applyResolutionAndViewport();
    camera._initialize({ screen: sut, clock: { elapsed: () => 16 } } as ex.Engine);

    const bounds = sut.getWorldBounds();

    expect(bounds.left).toBe(250);
    expect(bounds.right).toBe(550);
    expect(bounds.bottom).toBe(500);
    expect(bounds.top).toBe(100);
  });

  it('can calculate screen center without a camera and no relevant pixel ratio', () => {
    const sut = new ex.Screen({
      canvas,
      context,
      browser,
      viewport: { width: 800, height: 600 }
    });

    expect(sut.center).toBeVector(ex.vec(400, 300));
  });

  it('can calculate screen center with a camera with zoom and no relevant pixel ratio', () => {
    const sut = new ex.Screen({
      canvas,
      context,
      browser,
      viewport: { width: 800, height: 600 }
    });

    const camera = new Camera();
    camera.x = 400;
    camera.y = 300;
    camera.zoom = 2;

    sut.setCurrentCamera(camera);

    expect(sut.center).toBeVector(ex.vec(200, 150));
  });

  it('can calculate screen center without a camera and relevant pixel ratio', () => {
    const sut = new ex.Screen({
      canvas,
      context,
      browser,
      viewport: { width: 800, height: 600 },
      pixelRatio: 2
    });

    expect(sut.center).toBeVector(ex.vec(400, 300));
  });

  it('can calculate screen center with a camera with zoom and relevant pixel ratio', () => {
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
    camera.zoom = 2;

    sut.setCurrentCamera(camera);

    expect(sut.center).toBeVector(ex.vec(200, 150));
  });

  it('will warn if the resolution is too large', () => {
    const logger = ex.Logger.getInstance();
    vi.spyOn(logger, 'warnOnce');

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;

    const context = new ex.ExcaliburGraphicsContextWebGL({
      canvasElement: canvasElement,
      enableTransparency: false,
      snapToPixel: true,
      backgroundColor: ex.Color.White
    });

    const sut = new ex.Screen({
      canvas,
      context,
      browser,
      viewport: { width: 800, height: 600 },
      pixelRatio: 2
    });

    vi.spyOn(context, 'checkIfResolutionSupported').mockImplementation(() => false);
    sut.resolution = { width: 3000, height: 3000 };
    sut.applyResolutionAndViewport();
    expect(context.checkIfResolutionSupported).toHaveBeenCalled();
    expect(logger.warnOnce).toHaveBeenCalledExactlyOnceWith(
      `The currently configured resolution (${sut.resolution.width}x${sut.resolution.height}) and pixel ratio (${sut.pixelRatio})` +
        ' are too large for the platform WebGL implementation, this may work but cause WebGL rendering to behave oddly.' +
        ' Try reducing the resolution or disabling Hi DPI scaling to avoid this' +
        ' (read more here https://excaliburjs.com/docs/screens#understanding-viewport--resolution).'
    );
  });

  it('will warn if the resolution is too large and attempt to recover', () => {
    const logger = ex.Logger.getInstance();
    const warnOnce = vi.spyOn(logger, 'warnOnce');

    const canvasElement = document.createElement('canvas');
    canvasElement.width = 100;
    canvasElement.height = 100;

    const context = new ex.ExcaliburGraphicsContextWebGL({
      canvasElement: canvasElement,
      enableTransparency: false,
      snapToPixel: true,
      backgroundColor: ex.Color.White
    });

    const sut = new ex.Screen({
      canvas,
      context,
      browser,
      viewport: { width: 800, height: 600 }
    });

    vi.spyOn(context, 'checkIfResolutionSupported');
    sut.resolution = { width: 2000, height: 2000 };
    (sut as any)._devicePixelRatio = 3;
    sut.applyResolutionAndViewport();
    expect(context.checkIfResolutionSupported).toHaveBeenCalled();
    expect(warnOnce.mock.calls[0]).toEqual([
      `The currently configured resolution (${sut.resolution.width}x${sut.resolution.height}) and pixel ratio (3)` +
        ' are too large for the platform WebGL implementation, this may work but cause WebGL rendering to behave oddly.' +
        ' Try reducing the resolution or disabling Hi DPI scaling to avoid this' +
        ' (read more here https://excaliburjs.com/docs/screens#understanding-viewport--resolution).'
    ]);
    expect(warnOnce.mock.calls[1]).toEqual([
      'Scaled resolution too big attempted recovery!' +
        ` Pixel ratio was automatically reduced to (2) to avoid 4k texture limit.` +
        ' Setting `ex.Engine({pixelRatio: ...}) will override any automatic recalculation, do so at your own risk.` ' +
        ' (read more here https://excaliburjs.com/docs/screens#understanding-viewport--resolution).'
    ]);
  });
});
