import * as ex from '@excalibur';
import { TestUtils } from './util/TestUtils';
import { Mocks } from './util/Mocks';

describe('A generic Resource', () => {
  let resource: ex.Resource<any>;
  const mocker = new Mocks.Mocker();

  beforeEach(() => {
    resource = new ex.Resource<any>('a/path/to/a/resource.png', 'blob');

    ex.Logger.getInstance().defaultLevel = ex.LogLevel.Error;
  });

  it('should not be loaded by default', () => {
    expect(resource.isLoaded()).toBe(false);
  });

  it('should log failure when not found', (done) => {
    const spy = jasmine.createSpy();
    spyOn(ex.Logger.getInstance(), 'error').and.callFake(spy);

    resource.events.on('error', jasmine.createSpy());
    resource.load().then(
      () => fail(),
      () => {
        expect(spy).toHaveBeenCalled();
        done();
      }
    );
  });

  describe('without data', () => {
    it('should not fail on load', (done) => {
      const emptyLoader = new ex.Loader();
      const game = TestUtils.engine();
      game.start(emptyLoader).then(() => {
        expect(emptyLoader.isLoaded()).toBe(true);
        game.stop();
        done();
      });
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

    it('should not trigger an XHR when load is called', (done) => {
      resource.load().then((data) => {
        expect(data).not.toBeNull();
        done();
      });
    });


    it('should load a text resource', (done) => {
      const text = new ex.Resource('base/src/spec/images/ResourceSpec/textresource.txt', 'text', true);
      text.load().then((data) => {
        expect(data).not.toBeNull();
        done();
      });
    });
  });
});
