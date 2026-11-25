import * as ex from '@excalibur';
import { expectTypeOf } from 'vitest';
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

  it('can use useEngine() and engine-less coroutine() after an await in an async scope', async () => {
    engine = TestUtils.engine({ width: 100, height: 100 }, ['use-canvas-context']);
    await engine.scope(async () => {
      await Promise.resolve();
      expect(ex.Engine.useEngine()).toBe(engine);
      const co = ex.coroutine(function* () {
        yield;
      });
      expect(co).toBeDefined();
      co.cancel();
    });
    expect(() => ex.Engine.useEngine()).toThrow();
  });

  it('can use useEngine() after an await in Scene.onInitialize reached through goToScene', async () => {
    engine = TestUtils.engine({ width: 100, height: 100 }, ['use-canvas-context']);
    let injected: ex.Engine | undefined;
    class MyScene extends ex.Scene {
      override async onInitialize() {
        await new Promise((resolve) => setTimeout(resolve, 5));
        injected = ex.Engine.useEngine();
      }
    }
    engine.addScene('my', new MyScene());
    await engine.start();
    await engine.goToScene('my');
    expect(injected).toBe(engine);
  });

  it('can be run', async () => {
    engine = TestUtils.engine({ width: 100, height: 100 }, ['use-canvas-context']);
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
        ex.coroutine(function* () {
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
    engine = TestUtils.engine({ width: 100, height: 100 }, ['use-canvas-context']);
    await engine.scope(async () => {
      const clock = engine.clock as ex.TestClock;
      clock.start();
      const myThis = { super: 'cool' };
      const result = ex.coroutine(myThis, function* () {
        const elapsed = yield;
        expect(this).toBe(myThis);
        expect(this.super).toBe('cool');
        expect(elapsed).toBe(100);
        yield;
      });
      clock.step(100);
      clock.step(100);
      await expect(result).resolves.toBeUndefined();
    });
  });

  it('can bind a this arg overload 2', async () => {
    engine = TestUtils.engine({ width: 100, height: 100 }, ['use-canvas-context']);
    await engine.scope(async () => {
      const clock = engine.clock as ex.TestClock;
      clock.start();
      const myThis = { super: 'cool' };
      const result = ex.coroutine(myThis, engine, function* () {
        const elapsed = yield;
        expect(this).toBe(myThis);
        expect(this.super).toBe('cool');
        expect(elapsed).toBe(100);
        yield;
      });
      clock.step(100);
      clock.step(100);
      await expect(result).resolves.toBeUndefined();
    });
  });

  it('can bind an engine as this arg', async () => {
    engine = TestUtils.engine({ width: 100, height: 100 }, ['use-canvas-context']);
    await engine.scope(async () => {
      const clock = engine.clock as ex.TestClock;
      clock.start();
      const result = ex.coroutine(engine, engine, function* () {
        const elapsed = yield;
        expect(this).toBe(engine);
        expect(elapsed).toBe(100);
        yield;
      });
      clock.step(100);
      clock.step(100);
      await expect(result).resolves.toBeUndefined();
    });
  });

  it('can run overload 2', async () => {
    engine = TestUtils.engine({ width: 100, height: 100 }, ['use-canvas-context']);
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
    engine = TestUtils.engine({ width: 100, height: 100 }, ['use-canvas-context']);
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
    engine = TestUtils.engine({ width: 100, height: 100 }, ['use-canvas-context']);
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
    engine = TestUtils.engine({ width: 100, height: 100 }, ['use-canvas-context']);
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
    engine = TestUtils.engine({ width: 100, height: 100 }, ['use-canvas-context']);
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
    engine = TestUtils.engine({ width: 100, height: 100 }, ['use-canvas-context']);
    engine.scope(() => {
      const clock = engine.clock as ex.TestClock;
      clock.start();
      const result = ex.coroutine(function* () {
        yield 100;
        yield 100;
        yield 100;
        throw Error('should not error');
      });

      expect(result.isRunning).toBe(true);
      clock.step(100);
      clock.step(100);
      result.cancel();
      expect(result.isRunning).toBe(false);
      clock.step(100);
      expect(result.isRunning).toBe(false);
    });
  });

  it('can start coroutines', () => {
    engine = TestUtils.engine({ width: 100, height: 100 }, ['use-canvas-context']);
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

      expect(result.isRunning).toBe(false);
      clock.step(100);
      result.start();
      result.start();
      expect(logger.warn).toHaveBeenCalled();
      clock.step(100);
      clock.step(100);
      expect(result.isRunning).toBe(true);
      clock.step(100);
      expect(result.isRunning).toBe(false);
      expect(result.isComplete).toBe(true);
    });
  });

  it('can have nested coroutines', () => {
    engine = TestUtils.engine({ width: 100, height: 100 }, ['use-canvas-context']);
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

      expect(result.isRunning).toBe(false);
    });
  });

  it('can iterate over coroutines', () => {
    engine = TestUtils.engine({ width: 100, height: 100 }, ['use-canvas-context']);
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

      expect(result.isRunning).toBe(false);
    });
  });

  it('can iterate over coroutines with for..of', () => {
    engine = TestUtils.engine({ width: 100, height: 100 }, ['use-canvas-context']);
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
      for (const val of result as Iterable<ex.CoroutineYield>) {
        expectTypeOf(val).toEqualTypeOf<ex.CoroutineYield>();
        expect(val).toBe(results[i++]);
      }

      expect(result.isRunning).toBe(false);
    });
  });

  it('supports standalone CoroutineIterator annotations and class generator methods', async () => {
    engine = TestUtils.engine({ width: 100, height: 100 }, ['use-canvas-context']);
    await engine.scope(async () => {
      const clock = engine.clock as ex.TestClock;
      clock.start();

      class Runner {
        total = 0;
        *run(this: Runner): ex.CoroutineIterator {
          const elapsed = yield 50;
          expectTypeOf(elapsed).toEqualTypeOf<number>();
          this.total += elapsed;
        }
      }

      const runner = new Runner();
      const co = ex.coroutine(runner, runner.run);
      clock.step(50);
      await expect(co).resolves.toBeUndefined();
      expect(runner.total).toBe(50);
    });
  });

  it('enforces strong TypeScript typings', () => {
    engine = TestUtils.engine({ width: 100, height: 100 }, ['use-canvas-context']);
    engine.scope(() => {
      const myThis = { count: 1 };

      const co1 = ex.coroutine(
        function* () {
          expectTypeOf(this).toEqualTypeOf<unknown>();
          const elapsed = yield;
          expectTypeOf(elapsed).toEqualTypeOf<number>();
          const elapsed2 = yield 100;
          expectTypeOf(elapsed2).toEqualTypeOf<number>();
          const elapsed3 = yield Promise.resolve('ok');
          expectTypeOf(elapsed3).toEqualTypeOf<number>();
        },
        { autostart: false }
      );
      expectTypeOf(co1).toEqualTypeOf<ex.CoroutineInstance>();
      expectTypeOf(co1.done).toEqualTypeOf<Promise<void>>();
      expectTypeOf(co1.generator).toEqualTypeOf<ex.CoroutineIterator>();

      ex.coroutine(
        myThis,
        function* () {
          expectTypeOf(this).toEqualTypeOf<{ count: number }>();
          yield;
        },
        { autostart: false }
      );

      ex.coroutine(
        myThis,
        engine,
        function* () {
          expectTypeOf(this).toEqualTypeOf<{ count: number }>();
          yield;
        },
        { autostart: false }
      );

      // Backward compatibility with explicit `this: any`
      ex.coroutine(
        function* (this: any) {
          yield;
        },
        { autostart: false }
      );

      // Rejects accessing properties on `this` when no thisArg is provided (prevents DOM globalThis footguns like `this.name`)
      ex.coroutine(
        function* () {
          // @ts-expect-error `this` is `unknown` without thisArg
          void this.name;
          yield;
        },
        { autostart: false }
      );

      // Rejects passing Engine as 2-arg thisArg (at runtime args[0] instanceof Engine is treated as engine, not thisArg)
      ex.coroutine(
        engine,
        function* () {
          // @ts-expect-error `this` is `unknown` on the (engine, gen) overload, not Engine
          void this.currentScene;
          yield;
        },
        { autostart: false }
      );

      function* needsEngine(this: ex.Engine): ex.CoroutineIterator {
        void this.currentScene;
        yield;
      }

      // @ts-expect-error Engine cannot be bound as thisArg via 2-arg overload
      ex.coroutine(engine, needsEngine, { autostart: false });

      // Binding Engine explicitly as thisArg requires the 3-arg overload
      ex.coroutine(engine, engine, needsEngine, { autostart: false });

      // Rejects invalid yielded values
      // @ts-expect-error string is not a valid CoroutineYield
      ex.coroutine(
        function* () {
          yield 'invalid';
        },
        { autostart: false }
      );

      // @ts-expect-error plain object is not a valid CoroutineYield
      ex.coroutine(
        function* () {
          yield { delay: 100 };
        },
        { autostart: false }
      );

      // Rejects mismatched thisArg for typed generator
      function* needsCount(this: { count: number }): ex.CoroutineIterator {
        yield this.count;
      }

      // @ts-expect-error missing thisArg for generator requiring { count: number }
      ex.coroutine(needsCount, { autostart: false });

      // @ts-expect-error wrong thisArg type
      ex.coroutine({ wrong: true }, needsCount, { autostart: false });

      // Polymorphic `this` inside Actor / Scene subclasses and generic helpers
      class TypedActor extends ex.Actor {
        override onInitialize() {
          ex.coroutine(
            this,
            function* () {
              this.pos.x += 1;
              yield;
            },
            { autostart: false }
          );
        }
      }

      class TypedScene extends ex.Scene {
        override onInitialize() {
          ex.coroutine(
            this,
            function* () {
              void this.actors.length;
              yield;
            },
            { autostart: false }
          );
        }
      }

      class TypedEngine extends ex.Engine {
        override onInitialize() {
          ex.coroutine(
            this,
            function* () {
              // @ts-expect-error `this` is `unknown` on (engine, gen) overload even inside Engine subclass
              void this.currentScene;
              yield;
            },
            { autostart: false }
          );
          ex.coroutine(
            this,
            this,
            function* () {
              void this.currentScene;
              yield;
            },
            { autostart: false }
          );
        }
      }

      function runOnActor<T extends ex.Actor>(actor: T, fn: (this: T) => ex.CoroutineIterator) {
        return ex.coroutine(actor, fn, { autostart: false });
      }

      void TypedActor;
      void TypedScene;
      void TypedEngine;
      void runOnActor;

      // Supports null, undefined, and primitive thisArg
      ex.coroutine(
        null,
        function* () {
          expectTypeOf(this).toEqualTypeOf<null>();
          yield;
        },
        { autostart: false }
      );
      ex.coroutine(
        undefined,
        function* () {
          expectTypeOf(this).toEqualTypeOf<undefined>();
          yield;
        },
        { autostart: false }
      );
      ex.coroutine(
        42,
        function* () {
          expectTypeOf(this).toEqualTypeOf<number>();
          yield;
        },
        { autostart: false }
      );
    });
  });

  it('maintains engine.scope() across resumed preframe and postframe ticks outside external engine.scope()', async () => {
    engine = TestUtils.engine({ width: 100, height: 100 }, ['use-canvas-context']);
    const clock = engine.clock as ex.TestClock;
    clock.start();

    let preframeEngine: ex.Engine | undefined;
    let nestedEngine: ex.Engine | undefined;
    let postframeEngine: ex.Engine | undefined;

    const pre = ex.coroutine(engine, function* () {
      yield 100;
      preframeEngine = ex.Engine.useEngine();
      yield* ex.coroutine(function* () {
        yield 50;
        nestedEngine = ex.Engine.useEngine();
      });
    });

    const post = ex.coroutine(
      engine,
      function* () {
        yield 100;
        postframeEngine = ex.Engine.useEngine();
      },
      { timing: 'postframe' }
    );

    // Step the clock OUTSIDE engine.scope(), matching real StandardClock / RAF execution
    clock.step(100);
    clock.step(50);

    await expect(pre).resolves.toBeUndefined();
    await expect(post).resolves.toBeUndefined();
    expect(preframeEngine).toBe(engine);
    expect(nestedEngine).toBe(engine);
    expect(postframeEngine).toBe(engine);
  });

  it('supports arrow-function generator wrappers that capture lexical this and arguments', async () => {
    engine = TestUtils.engine({ width: 100, height: 100 }, ['use-canvas-context']);
    const clock = engine.clock as ex.TestClock;
    clock.start();

    class Mover {
      x = 0;
      *move(speed: number): ex.CoroutineIterator {
        const elapsed = yield 100;
        this.x += speed * elapsed;
      }
    }

    const mover = new Mover();
    const co = engine.scope(() => ex.coroutine(() => mover.move(2)));

    clock.step(100);
    await expect(co).resolves.toBeUndefined();
    expect(mover.x).toBe(200);
  });

  it('clears clock schedule and resolves immediately on cancel()', async () => {
    engine = TestUtils.engine({ width: 100, height: 100 }, ['use-canvas-context']);
    const clock = engine.clock as ex.TestClock;
    clock.start();
    const clearSpy = vi.spyOn(clock, 'clearSchedule');

    let ranAfterCancel = false;
    const co = ex.coroutine(engine, function* () {
      yield 60000;
      ranAfterCancel = true;
    });

    expect(co.isRunning).toBe(true);
    expect(co.isComplete).toBe(false);

    co.cancel();

    expect(clearSpy).toHaveBeenCalledTimes(1);
    expect(co.isRunning).toBe(false);
    expect(co.isComplete).toBe(true);
    // Resolves immediately without needing to step 60000ms
    await expect(co).resolves.toBeUndefined();

    clock.step(60000);
    expect(ranAfterCancel).toBe(false);
  });

  it('does not run when start() is called after cancel()', () => {
    engine = TestUtils.engine({ width: 100, height: 100 }, ['use-canvas-context']);
    const logger = ex.Logger.getInstance();
    const warnSpy = vi.spyOn(logger, 'warn');

    let executed = false;
    const co = ex.coroutine(
      engine,
      function* myNamedCoroutine() {
        executed = true;
        yield 100;
      },
      { autostart: false }
    );

    co.cancel();
    co.start();

    expect(executed).toBe(false);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('already cancelled'), expect.stringContaining('myNamedCoroutine'));
  });

  it('handles rejected yielded promises and supports try/catch inside the generator', async () => {
    engine = TestUtils.engine({ width: 100, height: 100 }, ['use-canvas-context']);
    const clock = engine.clock as ex.TestClock;
    clock.start();

    // Uncaught rejected promise rejects the coroutine and marks it complete
    const failing = ex.coroutine(engine, function* () {
      yield Promise.reject(new Error('network fail'));
    });

    await Promise.resolve();
    clock.step(16);

    await expect(failing).rejects.toThrowError('network fail');
    expect(failing.isRunning).toBe(false);
    expect(failing.isComplete).toBe(true);

    // Caught rejected promise lets the generator recover
    let caughtMessage: string | undefined;
    const recovering = ex.coroutine(engine, function* () {
      try {
        yield Promise.reject(new Error('recoverable'));
      } catch (e) {
        caughtMessage = (e as Error).message;
      }
      yield 50;
    });

    await Promise.resolve();
    clock.step(16);
    clock.step(50);

    await expect(recovering).resolves.toBeUndefined();
    expect(caughtMessage).toBe('recoverable');
    expect(recovering.isComplete).toBe(true);
  });

  it('marks coroutine as complete and not running when generator throws', async () => {
    engine = TestUtils.engine({ width: 100, height: 100 }, ['use-canvas-context']);
    const clock = engine.clock as ex.TestClock;
    clock.start();

    const co = ex.coroutine(engine, function* () {
      yield 100;
      throw new Error('boom');
    });

    clock.step(100);
    await expect(co).rejects.toThrowError('boom');
    expect(co.isRunning).toBe(false);
    expect(co.isComplete).toBe(true);
  });

  it('honors explicit autostart: true when spawning a parallel coroutine inside another coroutine', async () => {
    engine = TestUtils.engine({ width: 100, height: 100 }, ['use-canvas-context']);
    const clock = engine.clock as ex.TestClock;
    clock.start();

    let parallelCompleted = false;
    const outer = ex.coroutine(engine, function* () {
      ex.coroutine(
        function* () {
          yield 50;
          parallelCompleted = true;
        },
        { autostart: true }
      );
      yield 100;
    });

    clock.step(50);
    expect(parallelCompleted).toBe(true);
    clock.step(50);
    await expect(outer).resolves.toBeUndefined();
  });

  it('logs original generator source when start() is called twice', () => {
    engine = TestUtils.engine({ width: 100, height: 100 }, ['use-canvas-context']);
    const logger = ex.Logger.getInstance();
    const warnSpy = vi.spyOn(logger, 'warn');

    const co = ex.coroutine(
      engine,
      function* uniqueCoroutineName() {
        yield 100;
      },
      { autostart: false }
    );

    co.start();
    co.start();

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('already started'), expect.stringContaining('uniqueCoroutineName'));
  });

  it('runs generator finally blocks on external cancel() and self-cancellation', async () => {
    engine = TestUtils.engine({ width: 100, height: 100 }, ['use-canvas-context']);
    const clock = engine.clock as ex.TestClock;
    clock.start();

    // External cancel runs finally inside engine.scope()
    let externalCleanup = false;
    let cleanupEngine: ex.Engine | undefined;
    const co1 = ex.coroutine(engine, function* () {
      try {
        yield 500;
      } finally {
        cleanupEngine = ex.Engine.useEngine();
        externalCleanup = true;
      }
    });

    co1.cancel();
    await expect(co1).resolves.toBeUndefined();
    expect(externalCleanup).toBe(true);
    expect(cleanupEngine).toBe(engine);

    // Self-cancellation defers generator.return() cleanly until step unwinds
    let selfCleanup = false;
    const co2 = ex.coroutine(engine, function* () {
      try {
        yield 100;
        co2.cancel();
        yield 100;
      } finally {
        selfCleanup = true;
      }
    });

    clock.step(100);
    await expect(co2).resolves.toBeUndefined();
    expect(selfCleanup).toBe(true);
    expect(co2.isComplete).toBe(true);
    expect(co2.isRunning).toBe(false);

    // Cancelling before start() does not run finally
    let unstartedCleanup = false;
    const co3 = ex.coroutine(
      engine,
      function* () {
        try {
          yield 100;
        } finally {
          unstartedCleanup = true;
        }
      },
      { autostart: false }
    );
    co3.cancel();
    await expect(co3).resolves.toBeUndefined();
    expect(unstartedCleanup).toBe(false);
  });

  it('clears schedule on the original clock instance if engine.clock is swapped', async () => {
    engine = TestUtils.engine({ width: 100, height: 100 }, ['use-canvas-context']);
    const oldClock = engine.clock as ex.TestClock;
    oldClock.start();
    const oldClearSpy = vi.spyOn(oldClock, 'clearSchedule');

    const co = ex.coroutine(engine, function* () {
      yield 500;
    });

    const newClock = oldClock.toTestClock();
    const newClearSpy = vi.spyOn(newClock, 'clearSchedule');
    engine.clock = newClock;

    co.cancel();
    await expect(co).resolves.toBeUndefined();
    expect(oldClearSpy).toHaveBeenCalledTimes(1);
    expect(newClearSpy).not.toHaveBeenCalled();
  });

  it('completes nested child coroutine and warns if delegating to running or cancelled coroutines', async () => {
    engine = TestUtils.engine({ width: 100, height: 100 }, ['use-canvas-context']);
    const clock = engine.clock as ex.TestClock;
    clock.start();

    let child!: ex.CoroutineInstance;
    const outer = ex.coroutine(engine, function* () {
      child = ex.coroutine(function* () {
        yield 50;
      });
      yield* child;
    });

    expect(child.isComplete).toBe(false);
    clock.step(50);
    await expect(outer).resolves.toBeUndefined();
    expect(child.isComplete).toBe(true);
    await expect(child).resolves.toBeUndefined();

    // Warn when yield* targets an already-running or cancelled coroutine
    const logger = ex.Logger.getInstance();
    const warnSpy = vi.spyOn(logger, 'warn');

    const alreadyRunning = ex.coroutine(engine, function* () {
      yield 100;
    });
    const cancelledCo = ex.coroutine(
      engine,
      function* () {
        yield 100;
      },
      { autostart: false }
    );
    cancelledCo.cancel();

    const wrapper = ex.coroutine(engine, function* () {
      yield* alreadyRunning;
      yield* cancelledCo;
    });

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('already running'), expect.any(String));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('already cancelled'), expect.any(String));
    alreadyRunning.cancel();
    wrapper.cancel();
  });

  it('handles self-cancel, parent cancel, isRunning, start() guard, and rejected promises inside yield* child', async () => {
    engine = TestUtils.engine({ width: 100, height: 100 }, ['use-canvas-context']);
    const clock = engine.clock as ex.TestClock;
    clock.start();
    const logger = ex.Logger.getInstance();
    const warnSpy = vi.spyOn(logger, 'warn');

    // 1. Self-cancel inside yield* child + isRunning + start() guard
    let childCleanup = false;
    let childRanAfterCancel = false;
    let parentContinuedAfterChild = false;
    const child = ex.coroutine(
      engine,
      function* () {
        try {
          yield 100;
          child.cancel();
          yield 100;
          childRanAfterCancel = true;
        } finally {
          childCleanup = true;
        }
      },
      { autostart: false }
    );

    const parent = ex.coroutine(engine, function* () {
      yield* child;
      parentContinuedAfterChild = true;
    });

    expect(child.isRunning).toBe(true);
    child.start();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('already started'), expect.any(String));

    clock.step(100);
    await expect(child).resolves.toBeUndefined();
    await expect(parent).resolves.toBeUndefined();
    expect(childCleanup).toBe(true);
    expect(childRanAfterCancel).toBe(false);
    expect(parentContinuedAfterChild).toBe(true);
    expect(child.isRunning).toBe(false);
    expect(child.isComplete).toBe(true);

    // 2. Parent cancel propagates finally cleanup into delegated child
    let nestedFinallyRan = false;
    let delegatedChild!: ex.CoroutineInstance;
    const outer = ex.coroutine(engine, function* () {
      delegatedChild = ex.coroutine(function* () {
        try {
          yield 500;
        } finally {
          nestedFinallyRan = true;
        }
      });
      yield* delegatedChild;
    });

    expect(delegatedChild.isRunning).toBe(true);
    outer.cancel();
    await expect(outer).resolves.toBeUndefined();
    await expect(delegatedChild).resolves.toBeUndefined();
    expect(nestedFinallyRan).toBe(true);
    expect(delegatedChild.isComplete).toBe(true);

    // 3. Rejected promise inside yield* child is forwarded to child try/catch
    let caughtInChild: string | undefined;
    const parentWithReject = ex.coroutine(engine, function* () {
      yield* ex.coroutine(function* () {
        try {
          yield Promise.reject(new Error('child rejection'));
        } catch (e) {
          caughtInChild = (e as Error).message;
        }
      });
    });

    await Promise.resolve();
    clock.step(16);
    await expect(parentWithReject).resolves.toBeUndefined();
    expect(caughtInChild).toBe('child rejection');
  });

  it('clamps negative yield values to 0ms when scheduling on the clock', async () => {
    engine = TestUtils.engine({ width: 100, height: 100 }, ['use-canvas-context']);
    const clock = engine.clock as ex.TestClock;
    clock.start();
    const scheduleSpy = vi.spyOn(clock, 'schedule');

    const co = ex.coroutine(engine, function* () {
      yield -50;
    });

    expect(scheduleSpy).toHaveBeenCalledWith(expect.any(Function), 0, undefined);
    clock.step(16);
    await expect(co).resolves.toBeUndefined();
  });

  it('settles child.done when a delegated child self-cancels and then throws before yielding', async () => {
    engine = TestUtils.engine({ width: 100, height: 100 }, ['use-canvas-context']);
    const clock = engine.clock as ex.TestClock;
    clock.start();

    let isCompleteMidStep: boolean | undefined;
    let isRunningMidStep: boolean | undefined;
    let parentCaught: string | undefined;

    const child = ex.coroutine(
      engine,
      function* () {
        yield 100;
        child.cancel();
        isRunningMidStep = child.isRunning;
        isCompleteMidStep = child.isComplete;
        throw new Error('after cancel');
      },
      { autostart: false }
    );

    const parent = ex.coroutine(engine, function* () {
      try {
        yield* child;
      } catch (e) {
        parentCaught = (e as Error).message;
      }
    });

    clock.step(100);
    await expect(parent).resolves.toBeUndefined();
    await expect(child).resolves.toBeUndefined();
    expect(isRunningMidStep).toBe(false);
    expect(isCompleteMidStep).toBe(false);
    expect(child.isComplete).toBe(true);
    expect(parentCaught).toBe('after cancel');
  });

  it('propagates errors from a delegated child finally block to parent.done on parent.cancel()', async () => {
    engine = TestUtils.engine({ width: 100, height: 100 }, ['use-canvas-context']);
    const clock = engine.clock as ex.TestClock;
    clock.start();

    let child!: ex.CoroutineInstance;
    const parent = ex.coroutine(engine, function* () {
      child = ex.coroutine(function* () {
        try {
          yield 500;
        } finally {
          throw new Error('child cleanup failed');
        }
      });
      yield* child;
    });

    parent.cancel();

    await expect(parent).rejects.toThrowError('child cleanup failed');
    await expect(child).resolves.toBeUndefined();
    expect(parent.isComplete).toBe(true);
    expect(child.isComplete).toBe(true);
  });
});
