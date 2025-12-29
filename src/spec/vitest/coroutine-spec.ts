import * as ex from '@excalibur';
import { TestUtils } from '../__util__/test-utils';

describe('A Coroutine', () => {
  let engine: ex.Engine;

  afterEach(() => {
    if (engine) {
      engine.dispose();
    }
  });

  it('exists', () => {
    expect(ex.coroutine).toBeDefined();
  });

  it('can be run', async () => {
    engine = TestUtils.engine({ width: 100, height: 100 });
    await engine.scope(async () => {
      const clock = engine.clock as ex.TestClock;
      clock.start();
      const result = ex.coroutine(function* () {
        const elapsed = yield;
        expect(this).toBe(globalThis);
        expect(elapsed).toBe(100);
        yield;
      });
      clock.step(100);
      clock.step(100);
      await expect(result).resolves.toBeUndefined();
    });
  });

  it('can should throw without engine outside scope ', () => {
    ex.Engine.Context.scope(null, () => {
      expect(() => {
        const result = ex.coroutine(function* () {
          const elapsed = yield;
          expect(this).toBe(globalThis);
          expect(elapsed).toBe(100);
          yield;
        });
      }).toThrowError(
        'Cannot run coroutine without engine parameter outside of an excalibur lifecycle method.\n' +
          'Pass an engine parameter to ex.coroutine(engine, function * {...})'
      );
    });
  });

  it('can bind a this arg overload 1', async () => {
    engine = TestUtils.engine({ width: 100, height: 100 });
    await engine.scope(async () => {
      const clock = engine.clock as ex.TestClock;
      clock.start();
      const myThis = { super: 'cool' };
      const result = ex.coroutine(myThis, function* () {
        const elapsed = yield;
        expect(this).toBe(myThis);
        expect(elapsed).toBe(100);
        yield;
      });
      clock.step(100);
      clock.step(100);
      await expect(result).resolves.toBeUndefined();
    });
  });

  it('can bind a this arg overload 2', async () => {
    engine = TestUtils.engine({ width: 100, height: 100 });
    await engine.scope(async () => {
      const clock = engine.clock as ex.TestClock;
      clock.start();
      const myThis = { super: 'cool' };
      const result = ex.coroutine(myThis, engine, function* () {
        const elapsed = yield;
        expect(this).toBe(myThis);
        expect(elapsed).toBe(100);
        yield;
      });
      clock.step(100);
      clock.step(100);
      await expect(result).resolves.toBeUndefined();
    });
  });

  it('can run overload 2', async () => {
    engine = TestUtils.engine({ width: 100, height: 100 });
    await engine.scope(async () => {
      const clock = engine.clock as ex.TestClock;
      clock.start();
      const result = ex.coroutine(engine, function* () {
        const elapsed = yield;
        expect(this).toBe(globalThis);
        expect(elapsed).toBe(100);
        yield;
      });
      clock.step(100);
      clock.step(100);
      await expect(result).resolves.toBeUndefined();
    });
  });

  it('can be run on scheduled timing', async () => {
    engine = TestUtils.engine({ width: 100, height: 100 });
    await engine.scope(async () => {
      const clock = engine.clock as ex.TestClock;
      clock.start();

      const calls = vi.fn();

      const preframe = ex.coroutine(
        function* () {
          const elapsed = yield;
          calls('preframe');
          expect(elapsed).toBe(100);
          yield;
        },
        { timing: 'preframe' }
      );

      const postframe = ex.coroutine(
        function* () {
          const elapsed = yield;
          calls('postframe');
          expect(elapsed).toBe(100);
          yield;
        },
        { timing: 'postframe' }
      );

      const preupdate = ex.coroutine(
        function* () {
          const elapsed = yield;
          calls('preupdate');
          expect(elapsed).toBe(100);
          yield;
        },
        { timing: 'preupdate' }
      );

      const postupdate = ex.coroutine(
        function* () {
          const elapsed = yield;
          calls('postupdate');
          expect(elapsed).toBe(100);
          yield;
        },
        { timing: 'postupdate' }
      );

      const predraw = ex.coroutine(
        function* () {
          const elapsed = yield;
          calls('predraw');
          expect(elapsed).toBe(100);
          yield;
        },
        { timing: 'predraw' }
      );

      const postdraw = ex.coroutine(
        function* () {
          const elapsed = yield;
          calls('postdraw');
          expect(elapsed).toBe(100);
          yield;
        },
        { timing: 'postdraw' }
      );

      clock.step(100);
      clock.step(100);
      expect(calls.mock.calls).toEqual([['preframe'], ['preupdate'], ['postupdate'], ['predraw'], ['postdraw'], ['postframe']]);
      await expect(preframe).resolves.toBeUndefined();
      await expect(preupdate).resolves.toBeUndefined();
      await expect(postupdate).resolves.toBeUndefined();
      await expect(predraw).resolves.toBeUndefined();
      await expect(postdraw).resolves.toBeUndefined();
      await expect(postframe).resolves.toBeUndefined();
    });
  });

  it('can wait for given ms', async () => {
    engine = TestUtils.engine({ width: 100, height: 100 });
    const clock = engine.clock as ex.TestClock;
    clock.start();
    await engine.scope(async () => {
      const result = ex.coroutine(function* () {
        const elapsed = yield 200;
        expect(elapsed).toBe(200);
        yield;
      });
      // wait 200 ms
      clock.step(200);
      // 1 more yield
      clock.step(100);
      await expect(result).resolves.toBeUndefined();
    });
  });

  it('can wait for a promise', async () => {
    engine = TestUtils.engine({ width: 100, height: 100 });
    await engine.scope(async () => {
      const clock = engine.clock as ex.TestClock;
      clock.start();
      const result = ex.coroutine(function* () {
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
      await expect(result).resolves.toBeUndefined();
    });
  });

  it('can throw error', async () => {
    engine = TestUtils.engine({ width: 100, height: 100 });
    await engine.scope(async () => {
      const clock = engine.clock as ex.TestClock;
      clock.start();
      const result = ex.coroutine(function* () {
        const elapsed = yield ex.Util.delay(1000, clock);
        expect(elapsed).toBe(1);
        yield;
        throw Error('error here');
      });
      // wait 200 ms
      clock.step(1000);

      // flush
      await Promise.resolve();
      clock.step(0);

      // 1 more yield
      clock.step(100);
      await expect(result).rejects.toThrowError('error here');
    });
  });

  it('can stop coroutines', () => {
    engine = TestUtils.engine({ width: 100, height: 100 });
    engine.scope(() => {
      const clock = engine.clock as ex.TestClock;
      clock.start();
      const result = ex.coroutine(function* () {
        yield 100;
        yield 100;
        yield 100;
        throw Error('should not error');
      });

      expect(result.isRunning()).toBe(true);
      clock.step(100);
      clock.step(100);
      result.cancel();
      expect(result.isRunning()).toBe(false);
      clock.step(100);
      expect(result.isRunning()).toBe(false);
    });
  });

  it('can start coroutines', () => {
    engine = TestUtils.engine({ width: 100, height: 100 });
    const logger = ex.Logger.getInstance();
    vi.spyOn(logger, 'warn');
    engine.scope(() => {
      const clock = engine.clock as ex.TestClock;
      clock.start();
      const result = ex.coroutine(
        function* () {
          yield 100;
          yield 100;
          yield 100;
        },
        { autostart: false }
      );

      expect(result.isRunning()).toBe(false);
      clock.step(100);
      result.start();
      result.start();
      expect(logger.warn).toHaveBeenCalled();
      clock.step(100);
      clock.step(100);
      expect(result.isRunning()).toBe(true);
      clock.step(100);
      expect(result.isRunning()).toBe(false);
      expect(result.isComplete()).toBe(true);
    });
  });

  it('can have nested coroutines', () => {
    engine = TestUtils.engine({ width: 100, height: 100 });
    engine.scope(() => {
      const clock = engine.clock as ex.TestClock;
      clock.start();
      const result = ex.coroutine(function* () {
        yield 100;
        yield* ex.coroutine(function* () {
          const elapsed = yield 99;
          expect(elapsed).toBe(99);
        });
        yield 100;
      });

      clock.step(100);
      clock.step(99);
      clock.step(100);

      expect(result.isRunning()).toBe(false);
    });
  });

  it('can iterate over coroutines', () => {
    engine = TestUtils.engine({ width: 100, height: 100 });
    engine.scope(() => {
      const clock = engine.clock as ex.TestClock;
      clock.start();
      const result = ex.coroutine(
        function* () {
          yield 100;
          yield 200;
          yield 300;
          yield* ex.coroutine(function* () {
            yield;
            yield 400;
          });
        },
        { autostart: false }
      );

      expect(result.generator.next().value).toBe(100);
      expect(result.generator.next().value).toBe(200);
      expect(result.generator.next().value).toBe(300);
      expect(result.generator.next().value).toBe(400);

      expect(result.isRunning()).toBe(false);
    });
  });

  it('can iterate over coroutines', () => {
    engine = TestUtils.engine({ width: 100, height: 100 });
    engine.scope(() => {
      const clock = engine.clock as ex.TestClock;
      clock.start();
      const result = ex.coroutine(
        function* () {
          yield 100;
          yield 200;
          yield 300;
          yield* ex.coroutine(function* () {
            yield;
            yield 400;
          });
        },
        { autostart: false }
      );

      let i = 0;
      const results = [100, 200, 300, 400];
      for (const val of result) {
        expect(val).toBe(results[i++]);
      }

      expect(result.isRunning()).toBe(false);
    });
  });
});
