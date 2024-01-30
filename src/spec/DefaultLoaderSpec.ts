import * as ex from '@excalibur';
import { TestUtils } from './util/TestUtils';
import { ExcaliburAsyncMatchers, ExcaliburMatchers } from 'excalibur-jasmine';

describe('A DefaultLoader', () => {

  let engine: ex.Engine;
  beforeEach(() => {
    jasmine.addMatchers(ExcaliburMatchers);
    jasmine.addAsyncMatchers(ExcaliburAsyncMatchers);
    engine = TestUtils.engine();
  });

  it('exists', () => {
    expect(ex.DefaultLoader).toBeDefined();
  });

  it('can be constructed', () => {
    const sut = new ex.DefaultLoader();
    expect(sut).toBeDefined();
  });

  it('can be constructed with non-defaults', () => {
    const sut = new ex.DefaultLoader({
      loadables: [new ex.ImageSource('./some/image.png')]
    });
    expect(sut.resources.length).toBe(1);
    expect(sut.isLoaded()).toBe(false);
    expect(sut.progress).toBe(0);
  });

  it('can draw', async () => {
    const sut = new ex.DefaultLoader({
      loadables: [ , , , ]
    });
    sut.onInitialize(engine);
    sut.markResourceComplete();
    sut.onUpdate(engine, 100);
    sut.onDraw(sut.canvas.ctx);
    expect(sut.resources.length).toBe(3);
    await expectAsync(sut.canvas.ctx).toEqualImage('src/spec/images/DefaultLoaderSpec/loading.png');
  });

  it('can load stuff', async () => {
    const img1 = new ex.ImageSource('src/spec/images/DefaultLoaderSpec/loading.png');
    const img2 = new ex.ImageSource('src/spec/images/DefaultLoaderSpec/loading.png');
    const sut = new ex.DefaultLoader({
      loadables: [ img1, img2 ]
    });
    sut.onInitialize(engine);

    const onBeforeLoadSpy = jasmine.createSpy('onBeforeLoad');
    const onAfterLoadSpy = jasmine.createSpy('onBeforeLoad');
    const onUserAction = jasmine.createSpy('onUserAction');
    const resourceStartLoad = jasmine.createSpy('resourceStartLoad');
    const resourceEndLoad = jasmine.createSpy('resourceStartLoad');
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