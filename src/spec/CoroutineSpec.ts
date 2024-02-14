import * as ex from '@excalibur';
import { TestUtils } from './util/TestUtils';

describe('A Coroutine', () => {
  it('exists', () => {
    expect(ex.coroutine).toBeDefined();
  });

  it('can be run', async () => {
    const engine = TestUtils.engine({ width: 100, height: 100});
    const clock = engine.clock as ex.TestClock;
    clock.start();
    const result = ex.coroutine(engine, function * () {
      const elapsed = yield;
      expect(elapsed).toBe(100);
      yield;
    });
    clock.step(100);
    clock.step(100);
    await expectAsync(result).toBeResolved();
  });

  it('can wait for given ms', async () => {
    const engine = TestUtils.engine({ width: 100, height: 100});
    const clock = engine.clock as ex.TestClock;
    clock.start();
    const result = ex.coroutine(engine, function * () {
      const elapsed = yield 200;
      expect(elapsed).toBe(200);
      yield;

    });
    // wait 200 ms
    clock.step(200);
    // 1 more yield
    clock.step(100);
    await expectAsync(result).toBeResolved();
  });

  it('can wait for a promise', async () => {
    const engine = TestUtils.engine({ width: 100, height: 100});
    const clock = engine.clock as ex.TestClock;
    clock.start();
    const result = ex.coroutine(engine, function * () {
      const elapsed = yield ex.Util.delay(1000, clock);
      expect(elapsed).toBe(1);
      yield;
    });
    // wait 200 ms
    clock.step(1000);

    // flush
    await Promise.resolve();
    clock.step(0);

    // 1 more yield
    clock.step(100);
    await expectAsync(result).toBeResolved();
  });

  it('can throw error', async () => {
    const engine = TestUtils.engine({ width: 100, height: 100});
    const clock = engine.clock as ex.TestClock;
    clock.start();
    const result = ex.coroutine(engine, function * () {
      const elapsed = yield ex.Util.delay(1000, clock);
      expect(elapsed).toBe(1);
      yield;
      throw Error('error');
    });
    // wait 200 ms
    clock.step(1000);

    // flush
    await Promise.resolve();
    clock.step(0);

    // 1 more yield
    clock.step(100);
    await expectAsync(result).toBeRejectedWithError('error');
  });
});