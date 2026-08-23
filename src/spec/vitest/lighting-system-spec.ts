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

    it('still adds a FlickerSystem when a custom LightingSystem instance is pre-added', async () => {
      engine = TestUtils.engine({ width: 100, height: 100, lighting: true });
      engine.currentScene.world.add(new ex.LightingSystem({ zIndex: 50 }));
      await engine.currentScene._initialize(engine);

      expect(engine.currentScene.world.systemManager.get(ex.FlickerSystem)).toBeInstanceOf(ex.FlickerSystem);
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
      engine.screen.setCurrentCamera(engine.currentScene.camera);

      engine.currentScene.update(engine, 16);
      engine.currentScene.draw(engine.graphicsContext, 16);

      const [lightingEntity] = engine.currentScene.world.entityManager.getByName('lighting');
      expect(lightingEntity.get(ex.GraphicsComponent).current.width).toBe(32);
      expect(lightingEntity.get(ex.GraphicsComponent).current.height).toBe(16);
    });

    it('respects a fixed pos option and does not resync to the screen unsafe area', async () => {
      engine = TestUtils.engine({ width: 100, height: 100 });
      const lighting = new ex.LightingSystem({ pos: ex.vec(5, 5) });
      engine.currentScene.world.add(lighting);
      await engine.currentScene._initialize(engine);
      engine.screen.setCurrentCamera(engine.currentScene.camera);

      engine.currentScene.update(engine, 16);
      engine.currentScene.draw(engine.graphicsContext, 16);

      const [lightingEntity] = engine.currentScene.world.entityManager.getByName('lighting');
      expect(lightingEntity.get(ex.TransformComponent).pos).toBeVector(ex.vec(5, 5));
    });

    it('uses a provided ScreenElement host instead of provisioning its own', async () => {
      engine = TestUtils.engine({ width: 100, height: 100 });
      const customHost = new ex.ScreenElement({ name: 'custom-lighting-host', width: 100, height: 100 });
      engine.currentScene.add(customHost);
      const lighting = new ex.LightingSystem({ screenElement: customHost });
      engine.currentScene.world.add(lighting);
      await engine.currentScene._initialize(engine);
      engine.screen.setCurrentCamera(engine.currentScene.camera);

      expect(engine.currentScene.world.entityManager.getByName('lighting').length).toBe(0);
      expect(customHost.graphics.current).toBeInstanceOf(ex.Canvas);
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
      engine = TestUtils.engine({
        width: 100,
        height: 100,
        lighting: { enabled: true, ambientColor: ex.Color.fromRGB(0, 0, 255), ambientIntensity: 0.5 }
      });
      await engine.currentScene._initialize(engine);
      engine.screen.setCurrentCamera(engine.currentScene.camera);

      const room = new ex.Actor();
      room.addComponent(new ex.DarknessComponent({ color: ex.Color.Black, intensity: 1 }));
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
      engine = TestUtils.engine({
        width: 100,
        height: 100,
        lighting: { enabled: true, ambientColor: ex.Color.White, ambientIntensity: 0.3 }
      });
      await engine.currentScene._initialize(engine);
      engine.screen.setCurrentCamera(engine.currentScene.camera);

      const room = new ex.Actor();
      room.addComponent(new ex.DarknessComponent({ color: ex.Color.Black, intensity: 0.8 }));
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

    it('overrides the engine ambient config with a per-instance ambientIntensity/ambientColor', async () => {
      engine = TestUtils.engine({
        width: 100,
        height: 100,
        lighting: { enabled: true, ambientColor: ex.Color.White, ambientIntensity: 0 }
      });
      const lighting = new ex.LightingSystem({ ambientColor: ex.Color.fromRGB(0, 0, 255), ambientIntensity: 0.5 });
      engine.currentScene.world.add(lighting);
      await engine.currentScene._initialize(engine);
      engine.screen.setCurrentCamera(engine.currentScene.camera);

      const room = new ex.Actor();
      room.addComponent(new ex.DarknessComponent({ color: ex.Color.Black, intensity: 1 }));
      engine.currentScene.add(room);
      engine.currentScene.update(engine, 16);

      const raster = document.createElement('canvas');
      raster.width = 100;
      raster.height = 100;
      const ctx = raster.getContext('2d');
      (lighting as any)._renderLightingCanvas(ctx);

      const [r, g, b, a] = ctx.getImageData(50, 50, 1, 1).data;
      // Black veil blended halfway toward blue ambient at alpha 1 - 0.5, per the instance override
      expect(r).toBe(0);
      expect(g).toBe(0);
      expect(b).toBeCloseTo(128, -1);
      expect(a).toBeCloseTo(128, -1);
    });
  });

  describe('camera rotation', () => {
    it('rotates a cone light wedge along with the camera', async () => {
      engine = TestUtils.engine({ width: 100, height: 100, lighting: { enabled: true, ambientIntensity: 0 } });
      await engine.currentScene._initialize(engine);
      engine.screen.setCurrentCamera(engine.currentScene.camera);
      engine.currentScene.camera.pos = ex.vec(50, 50);

      const world = new ex.Actor();
      world.addComponent(new ex.DarknessComponent({ color: ex.Color.Black, intensity: 1 }));
      engine.currentScene.add(world);

      const flashlight = new ex.Actor({ pos: ex.vec(50, 50) });
      // Half-angle 45deg pointing right (direction 0) - "right" and "down" probes sit squarely
      // inside/outside the wedge so a 90deg camera rotation flips which one is lit.
      flashlight.addComponent(new ex.ConeLightComponent({ radius: 40, angle: Math.PI / 2, direction: 0, softness: 0 }));
      engine.currentScene.add(flashlight);

      const lighting = engine.currentScene.world.systemManager.get(ex.LightingSystem);
      const raster = document.createElement('canvas');
      raster.width = 100;
      raster.height = 100;
      const ctx = raster.getContext('2d');

      engine.currentScene.update(engine, 16);
      (lighting as any)._renderLightingCanvas(ctx);
      const rightAtRotation0 = ctx.getImageData(75, 50, 1, 1).data[3];
      const downAtRotation0 = ctx.getImageData(50, 75, 1, 1).data[3];
      expect(rightAtRotation0).toBeLessThan(200);
      expect(downAtRotation0).toBeGreaterThan(200);

      engine.currentScene.camera.rotation = Math.PI / 2;
      engine.currentScene.update(engine, 16);
      (lighting as any)._renderLightingCanvas(ctx);
      const rightAtRotation90 = ctx.getImageData(75, 50, 1, 1).data[3];
      const downAtRotation90 = ctx.getImageData(50, 75, 1, 1).data[3];
      expect(rightAtRotation90).toBeGreaterThan(200);
      expect(downAtRotation90).toBeLessThan(200);
    });

    it('rotates a finite darkness room rect along with the camera', async () => {
      engine = TestUtils.engine({ width: 100, height: 100, lighting: { enabled: true, ambientIntensity: 0 } });
      await engine.currentScene._initialize(engine);
      engine.screen.setCurrentCamera(engine.currentScene.camera);
      engine.currentScene.camera.pos = ex.vec(50, 50);
      engine.currentScene.camera.rotation = Math.PI / 2;

      // A wide, short room - at 90deg rotation this becomes narrow and tall on screen
      const room = new ex.Actor({ pos: ex.vec(50, 50) });
      room.addComponent(new ex.DarknessComponent({ color: ex.Color.Black, intensity: 1, width: 60, height: 20 }));
      engine.currentScene.add(room);
      engine.currentScene.update(engine, 16);

      const lighting = engine.currentScene.world.systemManager.get(ex.LightingSystem);
      const raster = document.createElement('canvas');
      raster.width = 100;
      raster.height = 100;
      const ctx = raster.getContext('2d');
      (lighting as any)._renderLightingCanvas(ctx);

      // Was inside the unrotated (wide) rect, now outside the rotated (narrow) one
      expect(ctx.getImageData(75, 50, 1, 1).data[3]).toBe(0);
      // Was outside the unrotated (short) rect, now inside the rotated (tall) one
      expect(ctx.getImageData(50, 75, 1, 1).data[3]).toBeGreaterThan(200);
    });

    it('clips a light to its containing room rect using the rotated geometry, not the unrotated one', async () => {
      engine = TestUtils.engine({ width: 100, height: 100, lighting: { enabled: true, ambientIntensity: 0 } });
      await engine.currentScene._initialize(engine);
      engine.screen.setCurrentCamera(engine.currentScene.camera);
      engine.currentScene.camera.pos = ex.vec(50, 50);
      engine.currentScene.camera.rotation = Math.PI / 2;

      const veil = new ex.Actor();
      veil.addComponent(new ex.DarknessComponent({ color: ex.Color.Black, intensity: 1 }));
      engine.currentScene.add(veil);

      // A wide, short room - at 90deg rotation this becomes narrow (x) and tall (y) on screen
      const room = new ex.Actor({ pos: ex.vec(50, 50) });
      room.addComponent(new ex.DarknessComponent({ color: ex.Color.Black, intensity: 1, width: 60, height: 20 }));
      engine.currentScene.add(room);

      const lamp = new ex.Actor({ pos: ex.vec(50, 50) });
      lamp.addComponent(new ex.PointLightComponent({ radius: 25 }));
      engine.currentScene.add(lamp);
      engine.currentScene.update(engine, 16);

      const lighting = engine.currentScene.world.systemManager.get(ex.LightingSystem);
      const raster = document.createElement('canvas');
      raster.width = 100;
      raster.height = 100;
      const ctx = raster.getContext('2d');
      (lighting as any)._renderLightingCanvas(ctx);

      // Within the light's raw radius but outside the rotated (narrow) room - must stay clipped/dark
      expect(ctx.getImageData(65, 50, 1, 1).data[3]).toBeGreaterThan(200);
      // Within the light's raw radius and inside the rotated (tall) room - should be lit
      expect(ctx.getImageData(50, 70, 1, 1).data[3]).toBeLessThan(200);
    });

    it('casts a polygon occluder shadow on the correct side when the occluder lands due-left of the light', async () => {
      // Regression test: at camera.rotation = PI, an occluder positioned to the world-right of a light
      // ends up screen-left of it - exactly the atan2 branch cut (+-PI) shadowPolygon's silhouette
      // min/max angle tracking must unwrap correctly across, or it picks the wrong pair of "extreme"
      // vertices and the shadow lands on the wrong side entirely.
      engine = TestUtils.engine({ width: 100, height: 100, lighting: { enabled: true, ambientIntensity: 0 } });
      await engine.currentScene._initialize(engine);
      engine.screen.setCurrentCamera(engine.currentScene.camera);
      engine.currentScene.camera.pos = ex.vec(50, 50);
      engine.currentScene.camera.rotation = Math.PI;

      const veil = new ex.Actor();
      veil.addComponent(new ex.DarknessComponent({ color: ex.Color.Black, intensity: 1 }));
      engine.currentScene.add(veil);

      const lamp = new ex.Actor({ pos: ex.vec(50, 50) });
      lamp.addComponent(new ex.PointLightComponent({ radius: 90 }));
      engine.currentScene.add(lamp);

      // World-right of the light -> screen-left of it once rotated by PI
      const crate = new ex.Actor({ pos: ex.vec(80, 50) });
      crate.addComponent(new ex.LightOccluderComponent({ shape: { kind: 'box', width: 10, height: 10 } }));
      engine.currentScene.add(crate);
      engine.currentScene.update(engine, 16);

      const lighting = engine.currentScene.world.systemManager.get(ex.LightingSystem);
      const raster = document.createElement('canvas');
      raster.width = 100;
      raster.height = 100;
      const ctx = raster.getContext('2d');
      (lighting as any)._renderLightingCanvas(ctx);

      // Between the light and the occluder's near edge - nothing blocks it, should be lit
      expect(ctx.getImageData(35, 50, 1, 1).data[3]).toBeLessThan(200);
      // Beyond the occluder's far edge, in its shadow - should stay dark
      expect(ctx.getImageData(10, 50, 1, 1).data[3]).toBeGreaterThan(200);
    });
  });

  describe('occluder shadows', () => {
    it('casts a shadow behind a circle occluder', async () => {
      engine = TestUtils.engine({ width: 100, height: 100, lighting: { enabled: true, ambientIntensity: 0 } });
      await engine.currentScene._initialize(engine);
      engine.screen.setCurrentCamera(engine.currentScene.camera);

      const veil = new ex.Actor();
      veil.addComponent(new ex.DarknessComponent({ color: ex.Color.Black, intensity: 1 }));
      engine.currentScene.add(veil);

      const lamp = new ex.Actor({ pos: ex.vec(30, 50) });
      lamp.addComponent(new ex.PointLightComponent({ radius: 90 }));
      engine.currentScene.add(lamp);

      const pillar = new ex.Actor({ pos: ex.vec(60, 50) });
      pillar.addComponent(new ex.LightOccluderComponent({ shape: { kind: 'circle', radius: 8 } }));
      engine.currentScene.add(pillar);
      engine.currentScene.update(engine, 16);

      const lighting = engine.currentScene.world.systemManager.get(ex.LightingSystem);
      const raster = document.createElement('canvas');
      raster.width = 100;
      raster.height = 100;
      const ctx = raster.getContext('2d');
      (lighting as any)._renderLightingCanvas(ctx);

      expect(ctx.getImageData(45, 50, 1, 1).data[3]).toBeLessThan(200); // before the pillar - lit
      expect(ctx.getImageData(90, 50, 1, 1).data[3]).toBeGreaterThan(200); // behind the pillar - shadowed
    });

    it('does not throw and still lights the scene when a circle occluder contains the light itself', async () => {
      engine = TestUtils.engine({ width: 100, height: 100, lighting: { enabled: true, ambientIntensity: 0 } });
      await engine.currentScene._initialize(engine);
      engine.screen.setCurrentCamera(engine.currentScene.camera);

      const veil = new ex.Actor();
      veil.addComponent(new ex.DarknessComponent({ color: ex.Color.Black, intensity: 1 }));
      engine.currentScene.add(veil);

      const lamp = new ex.Actor({ pos: ex.vec(50, 50) });
      lamp.addComponent(new ex.PointLightComponent({ radius: 40 }));
      engine.currentScene.add(lamp);

      const bubble = new ex.Actor({ pos: ex.vec(50, 50) });
      bubble.addComponent(new ex.LightOccluderComponent({ shape: { kind: 'circle', radius: 30 } }));
      engine.currentScene.add(bubble);
      engine.currentScene.update(engine, 16);

      const lighting = engine.currentScene.world.systemManager.get(ex.LightingSystem);
      const raster = document.createElement('canvas');
      raster.width = 100;
      raster.height = 100;
      const ctx = raster.getContext('2d');

      expect(() => (lighting as any)._renderLightingCanvas(ctx)).not.toThrow();
      expect(ctx.getImageData(50, 50, 1, 1).data[3]).toBeLessThan(200);
    });

    it('skips shadow casting for an occluder with castShadows disabled', async () => {
      engine = TestUtils.engine({ width: 100, height: 100, lighting: { enabled: true, ambientIntensity: 0 } });
      await engine.currentScene._initialize(engine);
      engine.screen.setCurrentCamera(engine.currentScene.camera);

      const veil = new ex.Actor();
      veil.addComponent(new ex.DarknessComponent({ color: ex.Color.Black, intensity: 1 }));
      engine.currentScene.add(veil);

      const lamp = new ex.Actor({ pos: ex.vec(30, 50) });
      lamp.addComponent(new ex.PointLightComponent({ radius: 100 }));
      engine.currentScene.add(lamp);

      const crate = new ex.Actor({ pos: ex.vec(60, 50) });
      crate.addComponent(new ex.LightOccluderComponent({ shape: { kind: 'box', width: 10, height: 10 }, castShadows: false }));
      engine.currentScene.add(crate);
      engine.currentScene.update(engine, 16);

      const lighting = engine.currentScene.world.systemManager.get(ex.LightingSystem);
      const raster = document.createElement('canvas');
      raster.width = 100;
      raster.height = 100;
      const ctx = raster.getContext('2d');
      (lighting as any)._renderLightingCanvas(ctx);

      // Beyond the (shadow-disabled) crate - should still be lit since it casts no shadow
      expect(ctx.getImageData(75, 50, 1, 1).data[3]).toBeLessThan(200);
    });
  });

  describe('colored light tint', () => {
    it('paints an additive colored tint for a non-white point light', async () => {
      engine = TestUtils.engine({ width: 100, height: 100, lighting: { enabled: true, ambientIntensity: 0 } });
      await engine.currentScene._initialize(engine);
      engine.screen.setCurrentCamera(engine.currentScene.camera);

      const lamp = new ex.Actor({ pos: ex.vec(50, 50) });
      lamp.addComponent(new ex.PointLightComponent({ color: ex.Color.fromRGB(255, 0, 0), radius: 40 }));
      engine.currentScene.add(lamp);
      engine.currentScene.update(engine, 16);

      const lighting = engine.currentScene.world.systemManager.get(ex.LightingSystem);
      const raster = document.createElement('canvas');
      raster.width = 100;
      raster.height = 100;
      const ctx = raster.getContext('2d');
      (lighting as any)._renderLightingCanvas(ctx);

      const [r, g, b, a] = ctx.getImageData(50, 50, 1, 1).data;
      expect(r).toBeGreaterThan(200);
      expect(g).toBe(0);
      expect(b).toBe(0);
      expect(a).toBeGreaterThan(0);
    });

    it('paints an additive colored wedge tint for a non-white cone light', async () => {
      engine = TestUtils.engine({ width: 100, height: 100, lighting: { enabled: true, ambientIntensity: 0 } });
      await engine.currentScene._initialize(engine);
      engine.screen.setCurrentCamera(engine.currentScene.camera);

      const flashlight = new ex.Actor({ pos: ex.vec(50, 50) });
      flashlight.addComponent(
        new ex.ConeLightComponent({ color: ex.Color.fromRGB(0, 0, 255), radius: 40, angle: Math.PI / 2, direction: 0, softness: 0 })
      );
      engine.currentScene.add(flashlight);
      engine.currentScene.update(engine, 16);

      const lighting = engine.currentScene.world.systemManager.get(ex.LightingSystem);
      const raster = document.createElement('canvas');
      raster.width = 100;
      raster.height = 100;
      const ctx = raster.getContext('2d');
      (lighting as any)._renderLightingCanvas(ctx);

      // Inside the wedge (direction 0 = right)
      const [r, g, b, a] = ctx.getImageData(70, 50, 1, 1).data;
      expect(r).toBe(0);
      expect(g).toBe(0);
      expect(b).toBeGreaterThan(200);
      expect(a).toBeGreaterThan(0);
    });
  });

  describe('culling and lifecycle', () => {
    it('does not throw and leaves the scene unlit when the only light is far outside the culled camera view', async () => {
      engine = TestUtils.engine({ width: 100, height: 100, lighting: { enabled: true, ambientIntensity: 0 } });
      await engine.currentScene._initialize(engine);
      engine.screen.setCurrentCamera(engine.currentScene.camera);
      engine.currentScene.camera.pos = ex.vec(50, 50);

      const veil = new ex.Actor();
      veil.addComponent(new ex.DarknessComponent({ color: ex.Color.Black, intensity: 1 }));
      engine.currentScene.add(veil);

      const farAway = new ex.Actor({ pos: ex.vec(10_000, 10_000) });
      farAway.addComponent(new ex.PointLightComponent({ radius: 10 }));
      engine.currentScene.add(farAway);
      engine.currentScene.update(engine, 16);

      const lighting = engine.currentScene.world.systemManager.get(ex.LightingSystem);
      const raster = document.createElement('canvas');
      raster.width = 100;
      raster.height = 100;
      const ctx = raster.getContext('2d');

      expect(() => (lighting as any)._renderLightingCanvas(ctx)).not.toThrow();
      expect(ctx.getImageData(50, 50, 1, 1).data[3]).toBeGreaterThan(200);
    });

    it('skips a disabled light at render time even when its currentIntensity has not been zeroed', async () => {
      // No FlickerSystem in this scene (LightingSystem added manually), so currentIntensity stays at its
      // constructor default - isolates the render-time `!light.enabled` check from FlickerSystem's own
      // zeroing of currentIntensity for disabled lights.
      engine = TestUtils.engine({ width: 100, height: 100 });
      const lighting = new ex.LightingSystem();
      engine.currentScene.world.add(lighting);
      await engine.currentScene._initialize(engine);
      engine.screen.setCurrentCamera(engine.currentScene.camera);

      const veil = new ex.Actor();
      veil.addComponent(new ex.DarknessComponent({ color: ex.Color.Black, intensity: 1 }));
      engine.currentScene.add(veil);

      const torch = new ex.Actor({ pos: ex.vec(50, 50) });
      const light = new ex.PointLightComponent({ enabled: false, radius: 40 });
      torch.addComponent(light);
      engine.currentScene.add(torch);
      engine.currentScene.update(engine, 16);
      expect(light.currentIntensity).toBe(1); // never zeroed - no FlickerSystem ran

      const raster = document.createElement('canvas');
      raster.width = 100;
      raster.height = 100;
      const ctx = raster.getContext('2d');
      (lighting as any)._renderLightingCanvas(ctx);

      expect(ctx.getImageData(50, 50, 1, 1).data[3]).toBeGreaterThan(200);
    });

    it('stops rendering a light once its component is removed', async () => {
      engine = TestUtils.engine({ width: 100, height: 100, lighting: { enabled: true, ambientIntensity: 0 } });
      await engine.currentScene._initialize(engine);
      engine.screen.setCurrentCamera(engine.currentScene.camera);

      const veil = new ex.Actor();
      veil.addComponent(new ex.DarknessComponent({ color: ex.Color.Black, intensity: 1 }));
      engine.currentScene.add(veil);

      const torch = new ex.Actor({ pos: ex.vec(50, 50) });
      torch.addComponent(new ex.PointLightComponent({ radius: 40 }));
      engine.currentScene.add(torch);
      engine.currentScene.update(engine, 16);

      const lighting = engine.currentScene.world.systemManager.get(ex.LightingSystem);
      const raster = document.createElement('canvas');
      raster.width = 100;
      raster.height = 100;
      const ctx = raster.getContext('2d');
      (lighting as any)._renderLightingCanvas(ctx);
      expect(ctx.getImageData(50, 50, 1, 1).data[3]).toBeLessThan(200);

      torch.removeComponent(ex.PointLightComponent, true);
      engine.currentScene.update(engine, 16);
      (lighting as any)._renderLightingCanvas(ctx);
      expect(ctx.getImageData(50, 50, 1, 1).data[3]).toBeGreaterThan(200);
    });

    it('resizes the lighting canvas and offscreen buffer when the screen resolution changes', async () => {
      engine = TestUtils.engine({ width: 100, height: 100, lighting: true });
      await engine.currentScene._initialize(engine);
      engine.screen.setCurrentCamera(engine.currentScene.camera);

      const [lightingEntity] = engine.currentScene.world.entityManager.getByName('lighting');
      expect(lightingEntity.get(ex.GraphicsComponent).current.width).toBe(100);

      engine.screen.resolution = { width: 150, height: 80 };
      engine.currentScene.update(engine, 16);
      engine.currentScene.draw(engine.graphicsContext, 16);

      expect(lightingEntity.get(ex.GraphicsComponent).current.width).toBe(150);
      expect(lightingEntity.get(ex.GraphicsComponent).current.height).toBe(80);
    });

    it('reuses cached room/occluder geometry when rendered twice with nothing changed', async () => {
      engine = TestUtils.engine({ width: 100, height: 100, lighting: { enabled: true, ambientIntensity: 0 } });
      await engine.currentScene._initialize(engine);
      engine.screen.setCurrentCamera(engine.currentScene.camera);

      const room = new ex.Actor({ pos: ex.vec(50, 50) });
      room.addComponent(new ex.DarknessComponent({ color: ex.Color.Black, intensity: 1, width: 60, height: 40 }));
      engine.currentScene.add(room);

      const lamp = new ex.Actor({ pos: ex.vec(30, 50) });
      lamp.addComponent(new ex.PointLightComponent({ radius: 40 }));
      engine.currentScene.add(lamp);

      const crate = new ex.Actor({ pos: ex.vec(60, 50) });
      crate.addComponent(new ex.LightOccluderComponent({ shape: { kind: 'box', width: 10, height: 10 } }));
      engine.currentScene.add(crate);
      engine.currentScene.update(engine, 16);

      const lighting = engine.currentScene.world.systemManager.get(ex.LightingSystem);
      const raster = document.createElement('canvas');
      raster.width = 100;
      raster.height = 100;
      const ctx = raster.getContext('2d');
      (lighting as any)._renderLightingCanvas(ctx);
      const first = Array.from(ctx.getImageData(0, 0, 100, 100).data);

      (lighting as any)._renderLightingCanvas(ctx);
      const second = Array.from(ctx.getImageData(0, 0, 100, 100).data);

      expect(second).toEqual(first);
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
        flicker: { frequency: 2.5, amplitude: 0.2, secondaryFrequency: 5.1 }
      });
      const spot = new ex.Actor({ pos: ex.vec(25, 25) });
      const coneLight = new ex.ConeLightComponent({
        intensity: 0.1,
        flicker: { frequency: 13, amplitude: 1 }
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
    it('lighting config has the documented ambient defaults', () => {
      engine = TestUtils.engine({ width: 100, height: 100 });
      expect(engine.lighting.ambientIntensity).toBe(0.05);
      expect(engine.lighting.ambientColor).toBe(null);
    });

    it('components have the documented defaults', () => {
      engine = TestUtils.engine({ width: 100, height: 100 });
      const darkness = new ex.DarknessComponent();
      expect(darkness.color).toEqual(ex.Color.fromRGB(0, 0, 10));
      expect(darkness.intensity).toBe(0.85);
      expect(darkness.width).toBe(Infinity);
      expect(darkness.height).toBe(Infinity);

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

    it('can clone an entity carrying a LightOccluderComponent', () => {
      engine = TestUtils.engine({ width: 100, height: 100 });
      const wall = new ex.Actor({ pos: ex.vec(10, 10), color: ex.Color.Gray });
      wall.addComponent(new ex.LightOccluderComponent({ shape: { kind: 'box', width: 10, height: 10 }, offset: ex.vec(1, 2) }));

      expect(() => wall.clone()).not.toThrow();
      const clonedOccluder = wall.clone().get(ex.LightOccluderComponent);
      expect(clonedOccluder.shape).toEqual({ kind: 'box', width: 10, height: 10 });
      expect(clonedOccluder.offset).toEqual(ex.vec(1, 2));
    });
  });

  describe('@visual', () => {
    async function setupLightingEngine(lighting?: Partial<ex.LightingConfig>): Promise<ex.Engine> {
      const visualEngine = TestUtils.engine({ width: 100, height: 100, lighting: { enabled: true, ...lighting } });
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
      engine = await setupLightingEngine({ ambientIntensity: 0 });

      const world = new ex.Actor();
      world.addComponent(new ex.DarknessComponent({ color: ex.Color.Black, intensity: 1 }));
      engine.currentScene.add(world);

      const lamp = new ex.Actor({ pos: ex.vec(50, 50) });
      lamp.addComponent(new ex.PointLightComponent({ radius: 40 }));
      engine.currentScene.add(lamp);

      drawFrame(engine);
      await expect(engine.canvas).toEqualImage('/src/spec/assets/images/lighting-system-spec/point-light.png');
    });

    it('renders a cone light wedge', async () => {
      engine = await setupLightingEngine({ ambientIntensity: 0 });

      const world = new ex.Actor();
      world.addComponent(new ex.DarknessComponent({ color: ex.Color.Black, intensity: 1 }));
      engine.currentScene.add(world);

      const flashlight = new ex.Actor({ pos: ex.vec(20, 50) });
      flashlight.addComponent(new ex.ConeLightComponent({ radius: 70, angle: Math.PI / 4, direction: 0, softness: 0.25 }));
      engine.currentScene.add(flashlight);

      drawFrame(engine);
      await expect(engine.canvas).toEqualImage('/src/spec/assets/images/lighting-system-spec/cone-light.png');
    });

    it('renders occluder shadows cast by a box occluder', async () => {
      engine = await setupLightingEngine({ ambientIntensity: 0 });

      const world = new ex.Actor();
      world.addComponent(new ex.DarknessComponent({ color: ex.Color.Black, intensity: 1 }));
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
      engine = await setupLightingEngine({ ambientColor: ex.Color.fromRGB(60, 60, 200), ambientIntensity: 0.3 });

      const world = new ex.Actor();
      world.addComponent(new ex.DarknessComponent({ color: ex.Color.Black, intensity: 0.9 }));
      engine.currentScene.add(world);

      drawFrame(engine);
      await expect(engine.canvas).toEqualImage('/src/spec/assets/images/lighting-system-spec/colored-ambient.png');
    });
  });
});
