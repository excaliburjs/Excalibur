import { createContext, useContext } from '../context';
import { Engine } from '../engine';
import type { ScheduledCallbackTiming } from './clock';
import { Logger } from './log';
export type CoroutineYield = number | Promise<unknown> | undefined;
export type CoroutineIterator<TReturn = void> = Generator<CoroutineYield, TReturn, number>;
export type CoroutineGenerator<TThis = unknown> = (this: TThis) => CoroutineIterator;

// Non-conditional exclusion so polymorphic `this` (e.g. Actor/Scene subclasses) stays assignable
type NotEngine = { useCanvas2DFallback?: never } | null | undefined; // TODO this is goofy

const InsideCoroutineContext = createContext<boolean>();

export interface CoroutineOptions {
  /**
   * Coroutines run preframe in the clock by default.
   */
  timing?: ScheduledCallbackTiming;
  /**
   * Coroutines auto start by default, set to false to require start();
   */
  autostart?: boolean;
}

export interface CoroutineInstance extends PromiseLike<void>, Iterable<CoroutineYield> {
  readonly isRunning: boolean;
  readonly isComplete: boolean;
  readonly done: Promise<void>;
  readonly generator: CoroutineIterator;
  start(): CoroutineInstance;
  cancel(): void;
  [Symbol.iterator](): CoroutineIterator;
}

/**
 * Excalibur coroutine helper, returns a [[CoroutineInstance]] which is promise-like when complete. Coroutines run before frame update by default.
 *
 * Each coroutine yield is 1 excalibur frame. Coroutines get passed the elapsed time out of yield. Coroutines
 * run internally on the excalibur clock.
 *
 * If you yield a promise it will be awaited before resumed (the `yield` expression still evaluates to the resumed frame's elapsed ms, not the promise's resolved value)
 * If you yield a number it will wait at least that many ms before resumed (the `yield` expression evaluates to the resumed frame's elapsed ms)
 * @param coroutineGenerator coroutine generator function
 * @param options optionally schedule coroutine pre/post update
 */
export function coroutine(coroutineGenerator: CoroutineGenerator, options?: CoroutineOptions): CoroutineInstance;
/**
 * Excalibur coroutine helper, returns a [[CoroutineInstance]] which is promise-like when complete. Coroutines run before frame update by default.
 *
 * Each coroutine yield is 1 excalibur frame. Coroutines get passed the elapsed time out of yield. Coroutines
 * run internally on the excalibur clock.
 *
 * If you yield a promise it will be awaited before resumed (the `yield` expression still evaluates to the resumed frame's elapsed ms, not the promise's resolved value)
 * If you yield a number it will wait at least that many ms before resumed (the `yield` expression evaluates to the resumed frame's elapsed ms)
 * @param engine pass a specific engine to use for running the coroutine
 * @param coroutineGenerator coroutine generator function
 * @param options optionally schedule coroutine pre/post update
 */
export function coroutine(engine: Engine, coroutineGenerator: CoroutineGenerator, options?: CoroutineOptions): CoroutineInstance;
/**
 * Excalibur coroutine helper, returns a [[CoroutineInstance]] which is promise-like when complete. Coroutines run before frame update by default.
 *
 * Each coroutine yield is 1 excalibur frame. Coroutines get passed the elapsed time out of yield. Coroutines
 * run internally on the excalibur clock.
 *
 * If you yield a promise it will be awaited before resumed (the `yield` expression still evaluates to the resumed frame's elapsed ms, not the promise's resolved value)
 * If you yield a number it will wait at least that many ms before resumed (the `yield` expression evaluates to the resumed frame's elapsed ms)
 * @param thisArg set the "this" context of the generator, by default is globalThis
 * @param engine pass a specific engine to use for running the coroutine
 * @param coroutineGenerator coroutine generator function
 * @param options optionally schedule coroutine pre/post update
 */
export function coroutine<TThis>(
  thisArg: TThis,
  engine: Engine,
  coroutineGenerator: CoroutineGenerator<NoInfer<TThis>>,
  options?: CoroutineOptions
): CoroutineInstance;
/**
 * Excalibur coroutine helper, returns a [[CoroutineInstance]] which is promise-like when complete. Coroutines run before frame update by default.
 *
 * Each coroutine yield is 1 excalibur frame. Coroutines get passed the elapsed time out of yield. Coroutines
 * run internally on the excalibur clock.
 *
 * If you yield a promise it will be awaited before resumed (the `yield` expression still evaluates to the resumed frame's elapsed ms, not the promise's resolved value)
 * If you yield a number it will wait at least that many ms before resumed (the `yield` expression evaluates to the resumed frame's elapsed ms)
 * @param thisArg set the "this" context of the generator, by default is globalThis
 * @param coroutineGenerator coroutine generator function
 * @param options optionally schedule coroutine pre/post update
 */
export function coroutine<TThis>(
  thisArg: TThis & NotEngine,
  coroutineGenerator: CoroutineGenerator<NoInfer<TThis>>,
  options?: CoroutineOptions
): CoroutineInstance;
/**
 *
 */
export function coroutine(...args: unknown[]): CoroutineInstance {
  const logger = Logger.getInstance();
  let coroutineGenerator: CoroutineGenerator<unknown> | undefined;
  let thisArg: unknown;
  let options: CoroutineOptions | undefined;
  let passedEngine: Engine | undefined;

  if (args[1] instanceof Engine) {
    // coroutine(thisArg, engine, coroutineGenerator, options?)
    thisArg = args[0];
    passedEngine = args[1];
    coroutineGenerator = args[2] as CoroutineGenerator<unknown>;
    options = args[3] as CoroutineOptions | undefined;
  } else if (args[0] instanceof Engine) {
    // coroutine(engine, coroutineGenerator, options?)
    thisArg = globalThis;
    passedEngine = args[0];
    coroutineGenerator = args[1] as CoroutineGenerator<unknown>;
    options = args[2] as CoroutineOptions | undefined;
  } else if (typeof args[1] === 'function') {
    // coroutine(thisArg, coroutineGenerator, options?)
    thisArg = args[0];
    coroutineGenerator = args[1] as CoroutineGenerator<unknown>;
    options = args[2] as CoroutineOptions | undefined;
  } else if (typeof args[0] === 'function') {
    // coroutine(coroutineGenerator, options?)
    thisArg = globalThis;
    coroutineGenerator = args[0] as CoroutineGenerator<unknown>;
    options = args[1] as CoroutineOptions | undefined;
  }

  if (typeof coroutineGenerator !== 'function') {
    throw new Error('Cannot run coroutine without a generator function');
  }

  const inside = useContext(InsideCoroutineContext);
  const schedule = options?.timing;
  const autostart = options?.autostart ?? !inside;
  let engine: Engine;
  try {
    engine = passedEngine ?? Engine.useEngine();
  } catch (_) {
    throw Error(
      'Cannot run coroutine without engine parameter outside of an excalibur lifecycle method.\n' +
        'Pass an engine parameter to ex.coroutine(engine, function * {...})'
    );
  }

  let started = false;
  let completed = false;
  let cancelled = false;
  let stepping = false;
  let clearScheduled: (() => void) | undefined;
  let resolveComplete!: () => void;
  let rejectComplete!: (reason?: unknown) => void;

  const complete = new Promise<void>((resolve, reject) => {
    resolveComplete = resolve;
    rejectComplete = reject;
  });

  const finish = () => {
    completed = true;
    resolveComplete();
  };

  const fail = (e: unknown) => {
    completed = true;
    rejectComplete(e);
  };

  const warn = (message: string) => {
    logger.warn(message, Function.prototype.toString.call(coroutineGenerator));
  };

  const scheduleOnClock = (cb: (elapsed: number) => void, timeout: number) => {
    const clock = engine.clock;
    const id = clock.schedule(cb, timeout, schedule);
    clearScheduled = () => clock.clearSchedule(id);
  };

  const generator = engine.scope(() => coroutineGenerator.call(thisArg));

  const closeGenerator = () => {
    try {
      engine.scope(() => generator.return(undefined));
      finish();
    } catch (e) {
      fail(e);
    }
  };

  const scheduleNext = (result: IteratorResult<CoroutineYield, void>) => {
    if (result.done) {
      finish();
      return;
    }

    if (cancelled) {
      closeGenerator();
      return;
    }

    const { value } = result;
    if (value instanceof Promise) {
      value.then(
        () => {
          if (!cancelled && !completed) {
            scheduleOnClock(loop, 0);
          }
        },
        (err) => {
          if (!cancelled && !completed) {
            scheduleOnClock(() => step(() => generator.throw(err)), 0);
          }
        }
      );
    } else {
      // schedule next frame (0ms for undefined) or at least value milliseconds from now
      scheduleOnClock(loop, Math.max(0, value || 0));
    }
  };

  const step = (advance: () => IteratorResult<CoroutineYield, void>) => {
    clearScheduled = undefined;
    if (cancelled) {
      return;
    }
    try {
      stepping = true;
      let result: IteratorResult<CoroutineYield, void>;
      try {
        result = engine.scope(() => InsideCoroutineContext.scope(true, advance));
      } finally {
        stepping = false;
      }
      scheduleNext(result);
    } catch (e) {
      fail(e);
    }
  };

  const loop = (elapsed: number) => step(() => generator.next(elapsed));

  if (autostart) {
    started = true;
    loop(engine.clock.elapsed()); // run first frame immediately
  }

  const co: CoroutineInstance = {
    get isRunning() {
      return started && !cancelled && !completed;
    },
    get isComplete() {
      return completed;
    },
    cancel: () => {
      if (cancelled || completed) {
        return;
      }
      cancelled = true;
      clearScheduled?.();
      clearScheduled = undefined;
      if (!stepping) {
        closeGenerator();
      }
    },
    start: () => {
      if (cancelled) {
        warn('.start() was called on a coroutine that was already cancelled, this is probably a bug:\n');
        return co;
      }
      if (!started) {
        started = true;
        loop(engine.clock.elapsed());
      } else {
        warn('.start() was called on a coroutine that was already started, this is probably a bug:\n');
      }
      return co;
    },
    generator,
    done: complete,
    then: complete.then.bind(complete),
    [Symbol.iterator]: () => {
      if (started && !cancelled && !completed) {
        warn('Iterating or yield* on a coroutine that is already running, this is probably a bug:\n');
      } else if (cancelled) {
        warn('Iterating or yield* on a coroutine that was already cancelled, this is probably a bug:\n');
      }
      started = true;
      return (function* (): CoroutineIterator {
        let threw = false;
        try {
          let nextArg: number | undefined;
          let first = true;
          let pendingThrow: { err: unknown } | undefined;
          while (!cancelled) {
            stepping = true;
            let result: IteratorResult<CoroutineYield, void>;
            try {
              if (pendingThrow) {
                const { err } = pendingThrow;
                pendingThrow = undefined;
                result = generator.throw(err);
              } else if (first) {
                first = false;
                result = generator.next();
              } else {
                result = generator.next(nextArg!);
              }
            } catch (e) {
              threw = true;
              throw e;
            } finally {
              stepping = false;
            }
            if (result.done) {
              finish();
              return;
            }
            if (cancelled) {
              closeGenerator();
              return;
            }
            try {
              nextArg = yield result.value as CoroutineYield;
            } catch (err) {
              pendingThrow = { err };
            }
          }
        } finally {
          if (!completed) {
            if (threw) {
              finish();
            } else {
              try {
                engine.scope(() => generator.return(undefined));
              } finally {
                finish();
              }
            }
          }
        }
      })();
    }
  };

  return co;
}
