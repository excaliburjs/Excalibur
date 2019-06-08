import * as ex from '../../build/dist/excalibur';

describe('The BrowserEvents facade', () => {
  let browser: ex.BrowserEvents;
  beforeEach(() => {
    browser = new ex.BrowserEvents(window, document);
  });

  afterEach(() => {
    browser.clear();
  });

  it('should exist', () => {
    expect(ex.BrowserEvents).toBeDefined();
  });

  it('can be created', () => {
    expect(browser).toBeDefined();
  });

  it('can register handlers on window', (done) => {
    browser.window.on('someevent', () => {
      done();
    });

    window.dispatchEvent(new Event('someevent'));
  });

  it('can pause handlers on window', () => {
    browser.window.on('somewindowevent', () => {
      fail();
    });

    browser.pause();
    window.dispatchEvent(new Event('somewindowevent'));
  });

  it('can register handlers on document', (done) => {
    browser.document.on('someevent', () => {
      done();
    });

    document.dispatchEvent(new Event('someevent'));
  });

  it('can pause handlers on document', () => {
    browser.document.on('somedocumentevent', () => {
      fail();
    });

    browser.pause();
    window.dispatchEvent(new Event('somedocumentevent'));
  });

  it('can clear handlers on window', () => {
    browser.window.on('somewindowevent2', () => {
      fail();
    });

    browser.clear();
    window.dispatchEvent(new Event('somewindowevent2'));
  });

  it('can clear handlers on window', () => {
    browser.document.on('somedocevent2', () => {
      fail();
    });

    browser.clear();
    document.dispatchEvent(new Event('somedocevent2'));
  });

  it('can only have 1 handler per event name at a time', (done) => {
    browser.window.on('couldfailevent', () => {
      fail();
    });

    browser.window.on('couldfailevent', () => {
      done();
    });

    window.dispatchEvent(new Event('couldfailevent'));
  });

  it('can resume handlers', () => {
    const spy = jasmine.createSpy();
    browser.document.on('somedocumentevent', spy);

    browser.pause();
    document.dispatchEvent(new Event('somedocumentevent'));

    browser.resume();
    document.dispatchEvent(new Event('somedocumentevent'));

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
