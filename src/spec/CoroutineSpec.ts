import * as ex from '@excalibur';
import { TestUtils } from './util/TestUtils';

describe('A Coroutine', () => {
  it('exists', () => {
    expect(ex.coroutine).toBeDefined();
  });

  it('can be run', async () => {
    const engine = TestUtils.engine({ width: 100, height: 100 });
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
      await expectAsync(result).toBeResolved();
      engine.dispose();
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
    const engine = TestUtils.engine({ width: 100, height: 100 });
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
      await expectAsync(result).toBeResolved();
      engine.dispose();
    });
  });

  it('can bind a this arg overload 2', async () => {
    const engine = TestUtils.engine({ width: 100, height: 100 });
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
      await expectAsync(result).toBeResolved();
      engine.dispose();
    });
  });

  it('can run overload 2', async () => {
    const engine = TestUtils.engine({ width: 100, height: 100 });
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
      await expectAsync(result).toBeResolved();
      engine.dispose();
    });
  });

  it('can be run on scheduled timing', async () => {
    const engine = TestUtils.engine({ width: 100, height: 100 });
    await engine.scope(async () => {
      const clock = engine.clock as ex.TestClock;
      clock.start();

      const calls = jasmine.createSpy('calls');

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
      expect(calls.calls.allArgs()).toEqual([['preframe'], ['preupdate'], ['postupdate'], ['predraw'], ['postdraw'], ['postframe']]);
      await expectAsync(preframe).toBeResolved();
      await expectAsync(preupdate).toBeResolved();
      await expectAsync(postupdate).toBeResolved();
      await expectAsync(predraw).toBeResolved();
      await expectAsync(postdraw).toBeResolved();
      await expectAsync(postframe).toBeResolved();
    });
    engine.dispose();
  });

  it('can wait for given ms', async () => {
    const engine = TestUtils.engine({ width: 100, height: 100 });
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
      await expectAsync(result).toBeResolved();
    });
    engine.dispose();
  });

  it('can wait for a promise', async () => {
    const engine = TestUtils.engine({ width: 100, height: 100 });
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
      await expectAsync(result).toBeResolved();
    });
    engine.dispose();
  });

  it('can throw error', async () => {
    const engine = TestUtils.engine({ width: 100, height: 100 });
    await engine.scope(async () => {
      const clock = engine.clock as ex.TestClock;
      clock.start();
      const result = ex.coroutine(function* () {
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
      engine.dispose();
    });
  });
});
