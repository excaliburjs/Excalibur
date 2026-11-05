import * as ex from '@excalibur';
import { TestUtils } from '../__util__/test-utils';

/**
 * A test plugin that records the order in which its lifecycle hooks are called.
 */
class TrackingPlugin extends ex.Plugin {
  override name = 'test.tracking';
  override priority = 0;

  calls: string[] = [];

  override onLoad = vi.fn((): Promise<void> => {
    this.calls.push('onLoad');
    return Promise.resolve();
  });

  override onLoadComplete = vi.fn((): Promise<void> => {
    this.calls.push('onLoadComplete');
    return Promise.resolve();
  });

  override onEnginePreConfig = vi.fn((engine: ex.Engine, options: ex.EngineOptions) => {
    this.calls.push('onEnginePreConfig');
  });

  override onEnginePostConfig = vi.fn((engine: ex.Engine, options: ex.EngineOptions) => {
    this.calls.push('onEnginePostConfig');
  });

  override onEnginePreInitialize = vi.fn((engine: ex.Engine) => {
    this.calls.push('onEnginePreInitialize');
  });

  override onEnginePostInitialize = vi.fn((engine: ex.Engine) => {
    this.calls.push('onEnginePostInitialize');
  });

  override onGraphicsPreConfig = vi.fn((context: ex.ExcaliburGraphicsContext, options: ex.ExcaliburGraphicsContextOptions) => {
    this.calls.push('onGraphicsPreConfig');
  });

  override onGraphicsPostConfig = vi.fn((context: ex.ExcaliburGraphicsContext, options: ex.ExcaliburGraphicsContextOptions) => {
    this.calls.push('onGraphicsPostConfig');
  });

  override onGraphicsPreInitialize = vi.fn((context: ex.ExcaliburGraphicsContext) => {
    this.calls.push('onGraphicsPreInitialize');
  });

  override onGraphicsPostInitialize = vi.fn((context: ex.ExcaliburGraphicsContext) => {
    this.calls.push('onGraphicsPostInitialize');
  });

  override onScenePreInitialize = vi.fn((scene: ex.Scene) => {
    this.calls.push('onScenePreInitialize');
  });

  override onScenePostInitialize = vi.fn((scene: ex.Scene) => {
    this.calls.push('onScenePostInitialize');
  });

  override onScenePreActivate = vi.fn((scene: ex.Scene) => {
    this.calls.push('onScenePreActivate');
  });

  override onScenePostActivate = vi.fn((scene: ex.Scene) => {
    this.calls.push('onScenePostActivate');
  });

  override onScenePreDeactivate = vi.fn((scene: ex.Scene) => {
    this.calls.push('onScenePreDeactivate');
  });

  override onScenePostDeactivate = vi.fn((scene: ex.Scene) => {
    this.calls.push('onScenePostDeactivate');
  });

  override dispose = vi.fn(() => {
    this.calls.push('dispose');
  });
}

describe('A Plugin', () => {
  let engine: ex.Engine;

  afterEach(() => {
    if (engine) {
      engine.stop();
      engine.dispose();
      engine = null as any;
    }
  });

  it('exists and is exported', () => {
    expect(ex.Plugin).toBeTruthy();
  });

  it('can be installed via constructor options', () => {
    const plugin = new TrackingPlugin('test.tracking');
    engine = TestUtils.engine({ plugins: [plugin] });

    expect(engine.plugins).toContain(plugin);
    expect(engine.hasPlugin('test.tracking')).toBe(true);
  });

  it('warns and skips duplicate plugin names via constructor', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const plugin1 = new TrackingPlugin('test.duplicate');
    plugin1.name = 'test.duplicate';
    const plugin2 = new TrackingPlugin('test.duplicate');
    plugin2.name = 'test.duplicate';

    engine = TestUtils.engine({ plugins: [plugin1, plugin2] });

    expect(engine.plugins.length).toBe(1);
    expect(engine.plugins[0]).toBe(plugin1);
    expect(warnSpy).toHaveBeenCalledWith(expect.any(String), expect.stringContaining('test.duplicate'));
    warnSpy.mockRestore();
  });

  it('calls onEnginePreConfig during construction', () => {
    const plugin = new TrackingPlugin('test.duplicate');
    engine = TestUtils.engine({ plugins: [plugin] });

    expect(plugin.onEnginePreConfig).toHaveBeenCalledTimes(1);
    expect(plugin.onEnginePreConfig).toHaveBeenCalledWith(engine, expect.any(Object));
  });

  it('calls onEnginePostConfig during construction', () => {
    const plugin = new TrackingPlugin('test.duplicate');
    engine = TestUtils.engine({ plugins: [plugin] });

    expect(plugin.onEnginePostConfig).toHaveBeenCalledTimes(1);
  });

  it('calls onGraphicsPreConfig and onGraphicsPostConfig during construction', () => {
    const plugin = new TrackingPlugin('test.duplicate');
    engine = TestUtils.engine({ plugins: [plugin] });

    expect(plugin.onGraphicsPreConfig).toHaveBeenCalledTimes(1);
    expect(plugin.onGraphicsPostConfig).toHaveBeenCalledTimes(1);
  });

  it('calls onGraphicsPreInitialize and onGraphicsPostInitialize during construction', () => {
    const plugin = new TrackingPlugin('test.duplicate');
    engine = TestUtils.engine({ plugins: [plugin] });

    expect(plugin.onGraphicsPreInitialize).toHaveBeenCalledTimes(1);
    expect(plugin.onGraphicsPostInitialize).toHaveBeenCalledTimes(1);
  });

  it('calls onEnginePreInitialize and onEnginePostInitialize during start', async () => {
    const plugin = new TrackingPlugin('test.duplicate');
    engine = TestUtils.engine({ plugins: [plugin] });

    await TestUtils.runToReady(engine);

    expect(plugin.onEnginePreInitialize).toHaveBeenCalledTimes(1);
    expect(plugin.onEnginePostInitialize).toHaveBeenCalledTimes(1);
  });

  it('calls onLoad and onLoadComplete during start', async () => {
    const plugin = new TrackingPlugin('test.duplicate');
    engine = TestUtils.engine({ plugins: [plugin] });

    await TestUtils.runToReady(engine);

    expect(plugin.calls).toContain('onLoad');
    expect(plugin.calls).toContain('onLoadComplete');
    // onLoad should come before onLoadComplete
    expect(plugin.calls.indexOf('onLoad')).toBeLessThan(plugin.calls.indexOf('onLoadComplete'));
  });

  it('calls onLoad before onLoadComplete before onEnginePreInitialize', async () => {
    const plugin = new TrackingPlugin('test.duplicate');
    engine = TestUtils.engine({ plugins: [plugin] });

    await TestUtils.runToReady(engine);

    const onLoadIdx = plugin.calls.indexOf('onLoad');
    const onLoadCompleteIdx = plugin.calls.indexOf('onLoadComplete');
    const onEnginePreInitIdx = plugin.calls.indexOf('onEnginePreInitialize');

    expect(onLoadIdx).toBeLessThan(onLoadCompleteIdx);
    expect(onLoadCompleteIdx).toBeLessThan(onEnginePreInitIdx);
  });

  it('calls onScenePreInitialize and onScenePostInitialize when a scene initializes', async () => {
    const plugin = new TrackingPlugin('test.duplicate');
    engine = TestUtils.engine({ plugins: [plugin] });

    const scene = new ex.Scene();
    engine.addScene('testScene', scene);
    engine.goToScene('testScene');
    await TestUtils.runToReady(engine);

    expect(plugin.onScenePreInitialize).toHaveBeenCalledTimes(1);
    expect(plugin.onScenePostInitialize).toHaveBeenCalledTimes(1);
  });

  it('calls onScenePreActivate and onScenePostActivate when a scene is activated', async () => {
    const plugin = new TrackingPlugin('test.duplicate');
    engine = TestUtils.engine({ plugins: [plugin] });

    const scene = new ex.Scene();
    engine.addScene('testScene', scene);
    engine.goToScene('testScene');
    await TestUtils.runToReady(engine);

    expect(plugin.onScenePreActivate).toHaveBeenCalledTimes(1);
    expect(plugin.onScenePostActivate).toHaveBeenCalledTimes(1);
  });

  it('calls onScenePreDeactivate and onScenePostDeactivate when a scene is deactivated', async () => {
    const plugin = new TrackingPlugin('test.duplicate');
    engine = TestUtils.engine({ plugins: [plugin] });

    const sceneA = new ex.Scene();
    const sceneB = new ex.Scene();
    engine.addScene('sceneA', sceneA);
    engine.addScene('sceneB', sceneB);
    engine.goToScene('sceneA');
    await TestUtils.runToReady(engine);

    // Reset call tracking before switching scenes
    plugin.onScenePreDeactivate.mockClear();
    plugin.onScenePostDeactivate.mockClear();

    await engine.goToScene('sceneB');

    expect(plugin.onScenePreDeactivate).toHaveBeenCalledTimes(1);
    expect(plugin.onScenePostDeactivate).toHaveBeenCalledTimes(1);
  });

  it('calls dispose when the engine is disposed', () => {
    const plugin = new TrackingPlugin('test.duplicate');
    engine = TestUtils.engine({ plugins: [plugin] });

    engine.dispose();
    engine = null as any;

    expect(plugin.dispose).toHaveBeenCalledTimes(1);
  });

  it('sorts plugins by priority (lower runs first)', () => {
    const plugin1 = new TrackingPlugin('test.plugin1');
    plugin1.name = 'test.plugin1';
    plugin1.priority = 10;
    const plugin2 = new TrackingPlugin('test.plugin2');
    plugin2.name = 'test.plugin2';
    plugin2.priority = 1;
    const plugin3 = new TrackingPlugin('test.plugin3');
    plugin3.name = 'test.plugin3';
    plugin3.priority = 5;

    engine = TestUtils.engine({ plugins: [plugin1, plugin2, plugin3] });

    expect(engine.plugins[0]).toBe(plugin2); // priority 1
    expect(engine.plugins[1]).toBe(plugin3); // priority 5
    expect(engine.plugins[2]).toBe(plugin1); // priority 10
  });

  describe('addPlugin', () => {
    it('can add a plugin after construction', () => {
      engine = TestUtils.engine();
      const plugin = new TrackingPlugin('test.plugin');

      const added = engine.addPlugin(plugin);

      expect(added).toBe(true);
      expect(engine.hasPlugin('test.tracking')).toBe(true);
      expect(engine.plugins).toContain(plugin);
    });

    it('warns and returns false for a duplicate name', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const plugin1 = new TrackingPlugin('test.dup');
      plugin1.name = 'test.dup';
      const plugin2 = new TrackingPlugin('test.dup');
      plugin2.name = 'test.dup';

      engine = TestUtils.engine({ plugins: [plugin1] });
      const added = engine.addPlugin(plugin2);

      expect(added).toBe(false);
      expect(engine.plugins.length).toBe(1);
      expect(warnSpy).toHaveBeenCalledWith(expect.any(String), expect.stringContaining('test.dup'));
      warnSpy.mockRestore();
    });

    it('catches up on passed lifecycle hooks for late-added plugins', () => {
      engine = TestUtils.engine();
      // Engine construction has already happened, so onEnginePreConfig, onEnginePostConfig,
      // onGraphicsPreConfig, onGraphicsPostConfig, onGraphicsPreInitialize, onGraphicsPostInitialize
      // should all be called when addPlugin is invoked.
      const plugin = new TrackingPlugin('test.dup');

      engine.addPlugin(plugin);

      expect(plugin.onEnginePreConfig).toHaveBeenCalledTimes(1);
      expect(plugin.onEnginePostConfig).toHaveBeenCalledTimes(1);
      expect(plugin.onGraphicsPreConfig).toHaveBeenCalledTimes(1);
      expect(plugin.onGraphicsPostConfig).toHaveBeenCalledTimes(1);
      expect(plugin.onGraphicsPreInitialize).toHaveBeenCalledTimes(1);
      expect(plugin.onGraphicsPostInitialize).toHaveBeenCalledTimes(1);
    });

    it('catches up on engine init hooks if engine is already initialized', async () => {
      engine = TestUtils.engine();
      await TestUtils.runToReady(engine);

      const plugin = new TrackingPlugin('test.dup');
      engine.addPlugin(plugin);

      expect(plugin.onEnginePreInitialize).toHaveBeenCalledTimes(1);
      expect(plugin.onEnginePostInitialize).toHaveBeenCalledTimes(1);
    });

    it('maintains priority sort order after adding', () => {
      engine = TestUtils.engine();
      const lowPriority = new TrackingPlugin('test.low');
      lowPriority.name = 'test.low';
      lowPriority.priority = 1;
      const highPriority = new TrackingPlugin('test.high');
      highPriority.name = 'test.high';
      highPriority.priority = 10;

      engine.addPlugin(highPriority);
      engine.addPlugin(lowPriority);

      expect(engine.plugins[0]).toBe(lowPriority);
      expect(engine.plugins[1]).toBe(highPriority);
    });
  });

  describe('removePlugin', () => {
    it('can remove a plugin by name', () => {
      const plugin = new TrackingPlugin('test.tracking');
      engine = TestUtils.engine({ plugins: [plugin] });

      const removed = engine.removePlugin('test.tracking');

      expect(removed).toBe(true);
      expect(engine.hasPlugin('test.tracking')).toBe(false);
    });

    it('calls dispose when removing a plugin', () => {
      const plugin = new TrackingPlugin('test.tracking');
      engine = TestUtils.engine({ plugins: [plugin] });

      engine.removePlugin('test.tracking');

      expect(plugin.dispose).toHaveBeenCalledTimes(1);
    });

    it('returns false if the plugin is not found', () => {
      engine = TestUtils.engine();

      const removed = engine.removePlugin('nonexistent');

      expect(removed).toBe(false);
    });
  });

  describe('hasPlugin', () => {
    it('returns true for an installed plugin', () => {
      const plugin = new TrackingPlugin('test.tracking');
      engine = TestUtils.engine({ plugins: [plugin] });

      expect(engine.hasPlugin('test.tracking')).toBe(true);
    });

    it('returns false for a non-installed plugin', () => {
      engine = TestUtils.engine();

      expect(engine.hasPlugin('nonexistent')).toBe(false);
    });
  });

  describe('graphics context hooks', () => {
    it('receives the graphics context in onGraphicsPostInitialize', () => {
      const plugin = new TrackingPlugin('test.tracking');
      engine = TestUtils.engine({ plugins: [plugin] });

      expect(plugin.onGraphicsPostInitialize).toHaveBeenCalledWith(engine.graphicsContext);
    });

    it('can register a custom renderer via onGraphicsPostInitialize', () => {
      class CustomRenderer extends ex.Plugin {}
      const plugin = new CustomRenderer('test.renderer');
      plugin.onGraphicsPostInitialize = (context: ex.ExcaliburGraphicsContext) => {
        context.lazyRegister('test.custom-renderer', () => new TestRenderer());
      };

      engine = TestUtils.engine({ plugins: [plugin] });

      // The renderer should be lazily registered and available via get()
      const renderer = engine.graphicsContext.get('test.custom-renderer');
      expect(renderer).toBeDefined();
      expect(renderer).toBeInstanceOf(TestRenderer);
    });
  });

  describe('Flags can be modified in onEnginePreConfig', () => {
    it('allows plugins to enable feature flags before Flags.freeze()', () => {
      class CustomRenderer extends ex.Plugin {}
      const plugin = new CustomRenderer('test.flags');
      plugin.onEnginePreConfig = () => {
        ex.Flags.enable('test-custom-flag');
      };

      engine = TestUtils.engine({ plugins: [plugin] });

      expect(ex.Flags.isEnabled('test-custom-flag')).toBe(true);
    });
  });
});

/**
 * A minimal test renderer that implements the RendererPlugin interface.
 */
class TestRenderer implements ex.RendererPlugin {
  readonly type = 'test.custom-renderer';
  priority = 0;

  initialize(_gl: WebGL2RenderingContext, _context: ex.ExcaliburGraphicsContextWebGL): void {
    // no-op
  }

  draw(..._args: any[]): void {
    // no-op
  }

  get hasPendingDraws(): boolean {
    return false;
  }

  flush(): void {
    // no-op
  }

  dispose(): void {
    // no-op
  }
}
