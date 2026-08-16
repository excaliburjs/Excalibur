import * as ex from '@excalibur';
import { TestUtils } from '../__util__/test-utils';

describe('A Lighting System', () => {
  let engine: ex.Engine;

  afterEach(() => {
    engine.stop();
    engine.dispose();
    engine = null;
  });

  describe('engine gating', () => {
    it('is not added to scenes by default', async () => {
      engine = TestUtils.engine({ width: 100, height: 100 });
      await engine.currentScene._initialize(engine);

      expect(engine.lighting.enabled).toBe(false);
      expect(engine.currentScene.world.systemManager.get(ex.LightingSystem)).toBeFalsy();
      expect(engine.currentScene.world.systemManager.get(ex.FlickerSystem)).toBeFalsy();
    });

    it('is added to scenes when the lighting engine option is enabled', async () => {
      engine = TestUtils.engine({ width: 100, height: 100, lighting: true });
      await engine.currentScene._initialize(engine);

      expect(engine.lighting.enabled).toBe(true);
      expect(engine.currentScene.world.systemManager.get(ex.LightingSystem)).toBeInstanceOf(ex.LightingSystem);
      expect(engine.currentScene.world.systemManager.get(ex.FlickerSystem)).toBeInstanceOf(ex.FlickerSystem);
    });

    it('can be added manually to a scene when the engine option is disabled', async () => {
      engine = TestUtils.engine({ width: 100, height: 100 });
      const lighting = new ex.LightingSystem();
      engine.currentScene.world.add(lighting);
      await engine.currentScene._initialize(engine);

      expect(engine.currentScene.world.systemManager.get(ex.LightingSystem)).toBe(lighting);
    });

    it('does not double add when a custom instance is present and the engine option is enabled', async () => {
      engine = TestUtils.engine({ width: 100, height: 100, lighting: true });
      const lighting = new ex.LightingSystem({ zIndex: 50 });
      engine.currentScene.world.add(lighting);
      await engine.currentScene._initialize(engine);

      const lightingSystems = engine.currentScene.world.systemManager.systems.filter((s) => s instanceof ex.LightingSystem);
      expect(lightingSystems).toEqual([lighting]);
    });
  });

  describe('provisioning', () => {
    it('provisions a screen-space host screen element sized to the screen resolution', async () => {
      engine = TestUtils.engine({ width: 100, height: 100, lighting: true });
      await engine.currentScene._initialize(engine);

      const [lightingEntity] = engine.currentScene.world.entityManager.getByName('lighting');
      expect(lightingEntity).toBeDefined();
      const transform = lightingEntity.get(ex.TransformComponent);
      expect(transform.coordPlane).toBe(ex.CoordPlane.Screen);
      expect(transform.z).toBe(100);

      const graphics = lightingEntity.get(ex.GraphicsComponent);
      expect(graphics.current).toBeInstanceOf(ex.Canvas);
      expect(graphics.current.width).toBe(engine.screen.resolution.width);
      expect(graphics.current.height).toBe(engine.screen.resolution.height);
    });

    it('respects a fixed size option and does not resync to the screen', async () => {
      engine = TestUtils.engine({ width: 100, height: 100 });
      const lighting = new ex.LightingSystem({ size: { width: 32, height: 16 } });
      engine.currentScene.world.add(lighting);
      await engine.currentScene._initialize(engine);

      engine.currentScene.update(engine, 16);

      const [lightingEntity] = engine.currentScene.world.entityManager.getByName('lighting');
      expect(lightingEntity.get(ex.GraphicsComponent).current.width).toBe(32);
      expect(lightingEntity.get(ex.GraphicsComponent).current.height).toBe(16);
    });

    it('renders the lighting canvas during the draw pass', async () => {
      engine = TestUtils.engine({ width: 100, height: 100, lighting: true });
      await engine.currentScene._initialize(engine);
      engine.screen.setCurrentCamera(engine.currentScene.camera);

      const darkness = new ex.Actor();
      darkness.addComponent(new ex.DarknessComponent({ intensity: 0.9 }));
      engine.currentScene.add(darkness);

      const lighting = engine.currentScene.world.systemManager.get(ex.LightingSystem);
      const renderSpy = vi.spyOn(lighting as any, '_renderLightingCanvas');

      engine.currentScene.update(engine, 16);
      engine.currentScene.draw(engine.graphicsContext, 16);

      expect(renderSpy).toHaveBeenCalled();
    });
  });

  describe('darkness and ambient light', () => {
    it('blends the darkness veil toward the ambient light color', async () => {
      engine = TestUtils.engine({ width: 100, height: 100, lighting: true });
      await engine.currentScene._initialize(engine);
      engine.screen.setCurrentCamera(engine.currentScene.camera);

      const room = new ex.Actor();
      room.addComponent(new ex.DarknessComponent({ color: ex.Color.Black, intensity: 1 }));
      room.addComponent(new ex.AmbientLightComponent({ color: ex.Color.fromRGB(0, 0, 255), intensity: 0.5 }));
      engine.currentScene.add(room);
      engine.currentScene.update(engine, 16);

      const lighting = engine.currentScene.world.systemManager.get(ex.LightingSystem);
      const raster = document.createElement('canvas');
      raster.width = 100;
      raster.height = 100;
      const ctx = raster.getContext('2d');
      (lighting as any)._renderLightingCanvas(ctx);

      const [r, g, b, a] = ctx.getImageData(50, 50, 1, 1).data;
      // Black veil blended halfway toward blue ambient at alpha 1 - 0.5
      expect(r).toBe(0);
      expect(g).toBe(0);
      expect(b).toBeCloseTo(128, -1);
      expect(a).toBeCloseTo(128, -1);
    });

    it('subtracts ambient intensity from the darkness veil opacity', async () => {
      engine = TestUtils.engine({ width: 100, height: 100, lighting: true });
      await engine.currentScene._initialize(engine);
      engine.screen.setCurrentCamera(engine.currentScene.camera);

      const room = new ex.Actor();
      room.addComponent(new ex.DarknessComponent({ color: ex.Color.Black, intensity: 0.8 }));
      room.addComponent(new ex.AmbientLightComponent({ color: ex.Color.White, intensity: 0.3 }));
      engine.currentScene.add(room);
      engine.currentScene.update(engine, 16);

      const lighting = engine.currentScene.world.systemManager.get(ex.LightingSystem);
      const raster = document.createElement('canvas');
      raster.width = 100;
      raster.height = 100;
      const ctx = raster.getContext('2d');
      (lighting as any)._renderLightingCanvas(ctx);

      const [, , , a] = ctx.getImageData(50, 50, 1, 1).data;
      expect(a / 255).toBeCloseTo(0.8 - 0.3, 1);
    });
  });

  describe('flicker', () => {
    it('forces disabled lights to zero intensity', async () => {
      engine = TestUtils.engine({ width: 100, height: 100, lighting: true });
      await engine.currentScene._initialize(engine);

      const torch = new ex.Actor({ pos: ex.vec(50, 50) });
      const pointLight = new ex.PointLightComponent({ intensity: 1.0, radius: 50, enabled: false });
      torch.addComponent(pointLight);
      engine.currentScene.add(torch);

      engine.currentScene.update(engine, 16);

      expect(pointLight.currentIntensity).toBe(0);
    });

    it('holds lights without flicker at their base intensity', async () => {
      engine = TestUtils.engine({ width: 100, height: 100, lighting: true });
      await engine.currentScene._initialize(engine);

      const torch = new ex.Actor({ pos: ex.vec(50, 50) });
      const pointLight = new ex.PointLightComponent({ intensity: 0.7 });
      torch.addComponent(pointLight);
      engine.currentScene.add(torch);

      engine.currentScene.update(engine, 16);

      expect(pointLight.currentIntensity).toBe(0.7);
    });

    it('modulates flickering lights within amplitude and never below zero', async () => {
      engine = TestUtils.engine({ width: 100, height: 100, lighting: true });
      await engine.currentScene._initialize(engine);

      const torch = new ex.Actor({ pos: ex.vec(50, 50) });
      const pointLight = new ex.PointLightComponent({
        intensity: 0.5,
        flicker: { speed: 2.5, amplitude: 0.2, secondarySpeed: 5.1 }
      });
      const spot = new ex.Actor({ pos: ex.vec(25, 25) });
      const coneLight = new ex.ConeLightComponent({
        intensity: 0.1,
        flicker: { speed: 13, amplitude: 1 }
      });
      torch.addComponent(pointLight);
      spot.addComponent(coneLight);
      engine.currentScene.add(torch);
      engine.currentScene.add(spot);

      for (let i = 0; i < 20; i++) {
        engine.currentScene.update(engine, 16);
        expect(pointLight.currentIntensity).toBeGreaterThanOrEqual(0.5 - 0.2);
        expect(pointLight.currentIntensity).toBeLessThanOrEqual(0.5 + 0.2);
        expect(coneLight.currentIntensity).toBeGreaterThanOrEqual(0);
        expect(coneLight.currentIntensity).toBeLessThanOrEqual(0.1 + 1);
      }
    });
  });

  describe('components', () => {
    it('components have the documented defaults', () => {
      engine = TestUtils.engine({ width: 100, height: 100 });
      const darkness = new ex.DarknessComponent();
      expect(darkness.color).toEqual(ex.Color.fromRGB(0, 0, 10));
      expect(darkness.intensity).toBe(0.85);
      expect(darkness.width).toBe(Infinity);
      expect(darkness.height).toBe(Infinity);

      const ambient = new ex.AmbientLightComponent();
      expect(ambient.color).toEqual(ex.Color.White);
      expect(ambient.intensity).toBe(0.05);
      expect(ambient.enabled).toBe(true);

      const point = new ex.PointLightComponent();
      expect(point.color).toEqual(ex.Color.White);
      expect(point.intensity).toBe(1.0);
      expect(point.radius).toBe(150);
      expect(point.flicker).toBeUndefined();
      expect(point.enabled).toBe(true);
      expect(point.currentIntensity).toBe(1.0);

      const cone = new ex.ConeLightComponent();
      expect(cone.radius).toBe(200);
      expect(cone.angle).toBeCloseTo(Math.PI / 3);
      expect(cone.direction).toBe(0);
      expect(cone.softness).toBe(0.25);
      expect(cone.currentIntensity).toBe(1.0);

      const occluder = new ex.LightOccluderComponent({ shape: { kind: 'circle', radius: 5 } });
      expect(occluder.castShadows).toBe(true);
      expect(occluder.offset).toEqual(ex.Vector.Zero);
    });

    it('evaluates occluder local vertices with offset applied', () => {
      engine = TestUtils.engine({ width: 100, height: 100 });
      const box = new ex.LightOccluderComponent({
        shape: { kind: 'box', width: 10, height: 20 },
        offset: ex.vec(1, 2)
      });
      expect(box.localVertices()).toEqual([ex.vec(-4, -8), ex.vec(6, -8), ex.vec(6, 12), ex.vec(-4, 12)]);

      const polygon = new ex.LightOccluderComponent({
        shape: { kind: 'polygon', vertices: [ex.vec(0, 0), ex.vec(5, 0), ex.vec(0, 5)] },
        offset: ex.vec(-1, -1)
      });
      expect(polygon.localVertices()).toEqual([ex.vec(-1, -1), ex.vec(4, -1), ex.vec(-1, 4)]);

      const circle = new ex.LightOccluderComponent({ shape: { kind: 'circle', radius: 5 }, offset: ex.vec(0, 10) });
      expect(circle.localVertices()).toEqual([]);
    });
  });

  describe('@visual', () => {
    async function setupLightingEngine(): Promise<ex.Engine> {
      const visualEngine = TestUtils.engine({ width: 100, height: 100, lighting: true });
      await visualEngine.currentScene._initialize(visualEngine);
      visualEngine.screen.setCurrentCamera(visualEngine.currentScene.camera);
      return visualEngine;
    }

    function drawFrame(visualEngine: ex.Engine): void {
      visualEngine.graphicsContext.clear();
      visualEngine.currentScene.update(visualEngine, 16);
      visualEngine.currentScene.draw(visualEngine.graphicsContext, 16);
      visualEngine.graphicsContext.flush();
    }

    it('renders a point light punching through the darkness veil', async () => {
      engine = await setupLightingEngine();

      const world = new ex.Actor();
      world.addComponent(new ex.DarknessComponent({ color: ex.Color.Black, intensity: 1 }));
      world.addComponent(new ex.AmbientLightComponent({ intensity: 0 }));
      engine.currentScene.add(world);

      const lamp = new ex.Actor({ pos: ex.vec(50, 50) });
      lamp.addComponent(new ex.PointLightComponent({ radius: 40 }));
      engine.currentScene.add(lamp);

      drawFrame(engine);
      await expect(engine.canvas).toEqualImage('/src/spec/assets/images/lighting-system-spec/point-light.png');
    });

    it('renders a cone light wedge', async () => {
      engine = await setupLightingEngine();

      const world = new ex.Actor();
      world.addComponent(new ex.DarknessComponent({ color: ex.Color.Black, intensity: 1 }));
      world.addComponent(new ex.AmbientLightComponent({ intensity: 0 }));
      engine.currentScene.add(world);

      const flashlight = new ex.Actor({ pos: ex.vec(20, 50) });
      flashlight.addComponent(new ex.ConeLightComponent({ radius: 70, angle: Math.PI / 4, direction: 0, softness: 0.25 }));
      engine.currentScene.add(flashlight);

      drawFrame(engine);
      await expect(engine.canvas).toEqualImage('/src/spec/assets/images/lighting-system-spec/cone-light.png');
    });

    it('renders occluder shadows cast by a box occluder', async () => {
      engine = await setupLightingEngine();

      const world = new ex.Actor();
      world.addComponent(new ex.DarknessComponent({ color: ex.Color.Black, intensity: 1 }));
      world.addComponent(new ex.AmbientLightComponent({ intensity: 0 }));
      engine.currentScene.add(world);

      const lamp = new ex.Actor({ pos: ex.vec(30, 50) });
      lamp.addComponent(new ex.PointLightComponent({ radius: 60 }));
      engine.currentScene.add(lamp);

      const crate = new ex.Actor({ pos: ex.vec(60, 50) });
      crate.addComponent(new ex.LightOccluderComponent({ shape: { kind: 'box', width: 10, height: 10 } }));
      engine.currentScene.add(crate);

      drawFrame(engine);
      await expect(engine.canvas).toEqualImage('/src/spec/assets/images/lighting-system-spec/box-occluder-shadow.png');
    });

    it('renders a colored ambient tint over the darkness veil', async () => {
      engine = await setupLightingEngine();

      const world = new ex.Actor();
      world.addComponent(new ex.DarknessComponent({ color: ex.Color.Black, intensity: 0.9 }));
      world.addComponent(new ex.AmbientLightComponent({ color: ex.Color.fromRGB(60, 60, 200), intensity: 0.3 }));
      engine.currentScene.add(world);

      drawFrame(engine);
      await expect(engine.canvas).toEqualImage('/src/spec/assets/images/lighting-system-spec/colored-ambient.png');
    });
  });
});
