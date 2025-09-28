import * as ex from '@excalibur';
import { TestUtils } from '../__util__/TestUtils';

describe('A DefaultLoader', () => {
  let engine: ex.Engine;
  beforeEach(() => {
    engine = TestUtils.engine();
  });

  afterEach(() => {
    engine.stop();
    engine.dispose();
    engine = null;
  });

  it('exists', () => {
    expect(ex.DefaultLoader).toBeDefined();
  });

  it('can be constructed', () => {
    const sut = new ex.DefaultLoader();
    expect(sut).toBeDefined();
  });

  it('is loaded when no resources', async () => {
    const loader = new ex.DefaultLoader();
    expect(loader.isLoaded()).toBe(true);
    await expect(loader.areResourcesLoaded()).resolves.toBeUndefined();
  });

  it('can be constructed with non-defaults', () => {
    const sut = new ex.DefaultLoader({
      loadables: [new ex.ImageSource('./some/image.png')]
    });
    expect(sut.resources.length).toBe(1);
    expect(sut.isLoaded()).toBe(false);
    expect(sut.progress).toBe(0);
  });

  it('@visual can draw', async () => {
    const sut = new ex.DefaultLoader({
      loadables: [, , ,]
    });
    sut.onInitialize(engine);
    sut.markResourceComplete();
    sut.onUpdate(engine, 100);
    sut.onDraw(sut.canvas.ctx);
    expect(sut.resources.length).toBe(3);
    await expect(sut.canvas.ctx).toEqualImage('/src/spec/assets/images/DefaultLoaderSpec/loading.png');
  });

  it('can load stuff', async () => {
    const img1 = new ex.ImageSource('/src/spec/assets/images/DefaultLoaderSpec/loading.png');
    const img2 = new ex.ImageSource('/src/spec/assets/images/DefaultLoaderSpec/loading.png');
    const sut = new ex.DefaultLoader({
      loadables: [img1, img2]
    });
    sut.onInitialize(engine);

    const onBeforeLoadSpy = vi.fn();
    const onAfterLoadSpy = vi.fn();
    const onUserAction = vi.fn();
    const resourceStartLoad = vi.fn();
    const resourceEndLoad = vi.fn();
    sut.on('loadresourcestart', resourceStartLoad);
    sut.on('loadresourceend', resourceEndLoad);
    sut.onBeforeLoad = onBeforeLoadSpy;
    sut.onAfterLoad = onAfterLoadSpy;
    sut.onUserAction = onUserAction;

    await sut.load();

    expect(onBeforeLoadSpy).toHaveBeenCalledTimes(1);
    expect(onAfterLoadSpy).toHaveBeenCalledTimes(1);
    expect(onUserAction).toHaveBeenCalledTimes(1);

    expect(resourceStartLoad).toHaveBeenCalledTimes(2);
    expect(resourceEndLoad).toHaveBeenCalledTimes(2);
  });
});
