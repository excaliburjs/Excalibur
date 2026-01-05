import * as ex from '@excalibur';
import { TestUtils } from '../__util__/test-utils';

describe('A generic Resource', () => {
  let resource: ex.Resource<any>;

  beforeEach(() => {
    // vitest falls back to the UI page on non-existent paths
    // but doing ../ seems to properly trigger a not found error
    resource = new ex.Resource<any>('../a/path/to/a/resource.png', 'blob');

    ex.Logger.getInstance().defaultLevel = ex.LogLevel.Error;
  });

  it('should not be loaded by default', () => {
    expect(resource.isLoaded()).toBe(false);
  });

  it('should log failure when not found', () =>
    new Promise<void>((done, fail) => {
      const spy = vi.spyOn(ex.Logger.getInstance(), 'error').mockImplementation(() => void 0);

      resource.events.on('error', vi.fn());
      resource.load().then(
        () => fail(),
        () => {
          try {
            expect(spy).toHaveBeenCalled();
            done();
          } catch (e) {
            fail(e);
          }
        }
      );
    }));

  describe('without data', () => {
    it('should not fail on load', async () => {
      const emptyLoader = new ex.Loader();
      const game = TestUtils.engine();
      await game.start();
      expect(emptyLoader.isLoaded()).toBe(true);
      game.dispose();
    });
  });

  describe('with some data', () => {
    beforeEach(() => {
      resource.data = 'blob://data';
    });

    it('should be loaded immediately', () => {
      expect(resource.isLoaded()).toBe(true);
    });

    it('should return the processed data', () => {
      expect(resource.data).toBe('blob://data');
    });

    it('should not trigger an XHR when load is called', () =>
      new Promise<void>((done) => {
        resource.load().then((data) => {
          expect(data).not.toBeNull();
          done();
        });
      }));

    it('should load a text resource', () =>
      new Promise<void>((done) => {
        const text = new ex.Resource('/src/spec/assets/images/resource-spec/textresource.txt', 'text', true);
        text.load().then((data) => {
          expect(data).not.toBeNull();
          done();
        });
      }));
  });
});
