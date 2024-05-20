import { Engine } from '../Engine';
import { ScheduledCallbackTiming } from './Clock';
export type CoroutineGenerator = () => Generator<number | Promise<any> | undefined, void, number>;

const generatorFunctionDeclaration = /^\s*(?:function)?\*/;
/**
 *
 */
function isCoroutineGenerator(x: any): x is CoroutineGenerator {
  if (typeof x !== 'function') {
    return false;
  }
  if (generatorFunctionDeclaration.test(Function.prototype.toString.call(x))) {
    return true;
  }
  if (!Object.getPrototypeOf) {
    return false;
  }
  return Object.getPrototypeOf(x) === Object.getPrototypeOf(new Function('return function * () {}')());
}

export interface CoroutineOptions {
  timing?: ScheduledCallbackTiming;
  autostart?: boolean;
}

type Thenable = PromiseLike<void>['then'];

export interface CoroutineInstance extends PromiseLike<void> {
  done: Promise<void>;
  generator: Generator<number | Promise<any> | undefined, void, number>;
  start: () => CoroutineInstance;
  cancel: () => void;
  then: Thenable;
  [Symbol.iterator]: () => Generator<number | Promise<any> | undefined, void, number>;
}

/**
 * Excalibur coroutine helper, returns a [[CoroutineInstance]] which is promise-like when complete. Coroutines run before frame update by default.
 *
 * Each coroutine yield is 1 excalibur frame. Coroutines get passed the elapsed time our of yield. Coroutines
 * run internally on the excalibur clock.
 *
 * If you yield a promise it will be awaited before resumed
 * If you yield a number it will wait that many ms before resumed
 * @param thisArg set the "this" context of the generator, by default is globalThis
 * @param engine pass a specific engine to use for running the coroutine
 * @param coroutineGenerator coroutine generator function
 * @param {CoroutineOptions} options optionally schedule coroutine pre/post update
 */
export function coroutine(
  thisArg: any,
  engine: Engine,
  coroutineGenerator: CoroutineGenerator,
  options?: CoroutineOptions
): CoroutineInstance;
/**
 * Excalibur coroutine helper, returns a promise when complete. Coroutines run before frame update.
 *
 * Each coroutine yield is 1 excalibur frame. Coroutines get passed the elapsed time our of yield. Coroutines
 * run internally on the excalibur clock.
 *
 * If you yield a promise it will be awaited before resumed
 * If you yield a number it will wait that many ms before resumed
 * @param engine pass a specific engine to use for running the coroutine
 * @param coroutineGenerator coroutine generator function
 * @param {CoroutineOptions} options optionally schedule coroutine pre/post update
 */
export function coroutine(engine: Engine, coroutineGenerator: CoroutineGenerator, options?: CoroutineOptions): CoroutineInstance;
/**
 * Excalibur coroutine helper, returns a promise when complete. Coroutines run before frame update.
 *
 * Each coroutine yield is 1 excalibur frame. Coroutines get passed the elapsed time our of yield. Coroutines
 * run internally on the excalibur clock.
 *
 * If you yield a promise it will be awaited before resumed
 * If you yield a number it will wait that many ms before resumed
 * @param coroutineGenerator coroutine generator function
 * @param {CoroutineOptions} options optionally schedule coroutine pre/post update
 */
export function coroutine(coroutineGenerator: CoroutineGenerator, options?: CoroutineOptions): CoroutineInstance;
/**
 * Excalibur coroutine helper, returns a promise when complete. Coroutines run before frame update.
 *
 * Each coroutine yield is 1 excalibur frame. Coroutines get passed the elapsed time our of yield. Coroutines
 * run internally on the excalibur clock.
 *
 * If you yield a promise it will be awaited before resumed
 * If you yield a number it will wait that many ms before resumed
 * @param thisArg set the "this" context of the generator, by default is globalThis
 * @param coroutineGenerator coroutine generator function
 * @param {CoroutineOptions} options optionally schedule coroutine pre/post update
 */
export function coroutine(thisArg: any, coroutineGenerator: CoroutineGenerator, options?: CoroutineOptions): CoroutineInstance;
/**
 *
 */
export function coroutine(...args: any[]): CoroutineInstance {
  let coroutineGenerator: CoroutineGenerator;
  let thisArg: any;
  let options: CoroutineOptions | undefined;
  let passedEngine: Engine | undefined;

  // coroutine(coroutineGenerator: CoroutineGenerator, options?: CoroutineOptions): CoroutineInstance;
  if (isCoroutineGenerator(args[0])) {
    thisArg = globalThis;
    coroutineGenerator = args[0];
    options = args[1];
  }

  // coroutine(thisArg: any, coroutineGenerator: CoroutineGenerator, options?: CoroutineOptions): CoroutineInstance;
  if (isCoroutineGenerator(args[1])) {
    thisArg = args[0];
    coroutineGenerator = args[1];
    options = args[2];
  }

  // coroutine(thisArg: any, engine: Engine, coroutineGenerator: CoroutineGenerator, options?: CoroutineOptions): CoroutineInstance;
  if (args[1] instanceof Engine) {
    thisArg = args[0];
    passedEngine = args[1];
    coroutineGenerator = args[2];
    options = args[3];
  }

  // coroutine(engine: Engine, coroutineGenerator: CoroutineGenerator, options?: CoroutineOptions): CoroutineInstance;
  if (args[0] instanceof Engine) {
    thisArg = globalThis;
    passedEngine = args[0];
    coroutineGenerator = args[1];
    options = args[2];
  }

  const schedule = options?.timing;
  const autostart = options?.autostart ?? true;
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
  let cancelled = false;
  const generatorFcn = coroutineGenerator.bind(thisArg);
  const generator = generatorFcn();
  let loop: (elapsedMs: number) => void;
  const complete = new Promise<void>((resolve, reject) => {
    loop = (elapsedMs: number) => {
      try {
        const { done, value } = generator.next(elapsedMs);
        if (done || cancelled) {
          resolve();
        }

        if (value instanceof Promise) {
          value.then(() => {
            // schedule next loop
            engine.clock.schedule(loop, 0, schedule);
          });
        } else if (value === undefined || value === void 0) {
          // schedule next frame
          engine.clock.schedule(loop, 0, schedule);
        } else {
          // schedule value milliseconds from now
          engine.clock.schedule(loop, value || 0, schedule);
        }
      } catch (e) {
        reject(e);
      }
    };
    if (autostart) {
      started = true;
      loop(engine.clock.elapsed()); // run first frame immediately
    }
  });

  const co: CoroutineInstance = {
    cancel: () => {
      cancelled = true;
    },
    start: () => {
      if (!started) {
        started = true;
        loop(engine.clock.elapsed());
      } else {
        // TODO warn that a coroutine was attempted to be restarted
      }
      return co;
    },
    generator,
    done: complete,
    then: (onfulfilled, onrejected) => {
      return complete.then(onfulfilled, onrejected);
    },
    [Symbol.iterator]: () => {
      // TODO warn if a coroutine is already running
      // TODO warn if a coroutine is cancelled
      return generator;
    }
  };

  return co;
}
