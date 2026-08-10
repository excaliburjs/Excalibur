import * as ex from '@excalibur';

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

  it('can register handlers on window', () =>
    new Promise<void>((done) => {
      browser.window.on('someevent', () => {
        done();
      });

      window.dispatchEvent(new Event('someevent'));
    }));

  it('can pause handlers on window', () => {
    browser.window.on('somewindowevent', () => {
      fail();
    });

    browser.pause();
    window.dispatchEvent(new Event('somewindowevent'));
  });

  it('can register handlers on document', () =>
    new Promise<void>((done) => {
      browser.document.on('someevent', () => {
        done();
      });

      document.dispatchEvent(new Event('someevent'));
    }));

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

  it('can register multiple handlers per event name and all fire', () => {
    const first = vi.fn();
    const second = vi.fn();

    browser.window.on('multihandlerevent', first);
    browser.window.on('multihandlerevent', second);

    window.dispatchEvent(new Event('multihandlerevent'));

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('registering the same handler reference twice is idempotent (no duplicate native listeners)', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    const handler = vi.fn();

    browser.window.on('idempotentevent', handler);
    browser.window.on('idempotentevent', handler);

    const calls = addEventListenerSpy.mock.calls.filter((call) => call[0] === 'idempotentevent');
    expect(calls.length).toBe(1);

    window.dispatchEvent(new Event('idempotentevent'));
    expect(handler).toHaveBeenCalledTimes(1);

    addEventListenerSpy.mockRestore();
  });

  it('off(eventName, handler) removes only that handler, leaving others intact', () => {
    const first = vi.fn();
    const second = vi.fn();

    browser.window.on('offsingleevent', first);
    browser.window.on('offsingleevent', second);

    browser.window.off('offsingleevent', first);
    window.dispatchEvent(new Event('offsingleevent'));

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('can resume handlers', () => {
    const spy = vi.fn();
    browser.document.on('somedocumentevent', spy);

    browser.pause();
    document.dispatchEvent(new Event('somedocumentevent'));

    browser.resume();
    document.dispatchEvent(new Event('somedocumentevent'));

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
