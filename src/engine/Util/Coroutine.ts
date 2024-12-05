import { createContext, useContext } from '../Context';
import { Engine } from '../Engine';
import { ScheduledCallbackTiming } from './Clock';
import { Logger } from './Log';
export type CoroutineGenerator = () => Generator<any | number | Promise<any> | undefined, void, number>;

const InsideCoroutineContext = createContext<boolean>();

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
  /**
   * Coroutines run preframe in the clock by default.
   */
  timing?: ScheduledCallbackTiming;
  /**
   * Coroutines auto start by default, set to false to require play();
   */
  autostart?: boolean;
}

type Thenable = PromiseLike<void>['then'];

export interface CoroutineInstance extends PromiseLike<void> {
  isRunning(): boolean;
  isComplete(): boolean;
  done: Promise<void>;
  generator: Generator<CoroutineInstance | number | Promise<any> | undefined, void, number>;
  start: () => CoroutineInstance;
  cancel: () => void;
  then: Thenable;
  [Symbol.iterator]: () => Generator<CoroutineInstance | number | Promise<any> | undefined, void, number>;
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
  const logger = Logger.getInstance();
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

  const inside = useContext(InsideCoroutineContext);
  const schedule = options?.timing;
  const autostart = inside ? false : options?.autostart ?? true;
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
  const generatorFcn = coroutineGenerator.bind(thisArg) as CoroutineGenerator;
  const generator = generatorFcn();
  let loop: (elapsed: number) => void;
  const complete = new Promise<void>((resolve, reject) => {
    loop = (elapsed: number) => {
      try {
        if (cancelled) {
          completed = true;
          resolve();
          return;
        }
        const { done, value } = InsideCoroutineContext.scope(true, () => generator.next(elapsed));
        if (done || cancelled) {
          completed = true;
          resolve();
          return;
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
        return;
      }
    };
    if (autostart) {
      started = true;
      loop(engine.clock.elapsed()); // run first frame immediately
    }
  });

  const co: CoroutineInstance = {
    isRunning: () => {
      return started && !cancelled && !completed;
    },
    isComplete: () => {
      return completed;
    },
    cancel: () => {
      cancelled = true;
    },
    start: () => {
      if (!started) {
        started = true;
        loop(engine.clock.elapsed());
      } else {
        logger.warn(
          '.start() was called on a coroutine that was already started, this is probably a bug:\n',
          Function.prototype.toString.call(generatorFcn)
        );
      }
      return co;
    },
    generator,
    done: complete,
    then: complete.then.bind(complete),
    [Symbol.iterator]: () => {
      // TODO warn if a coroutine is already running
      // TODO warn if a coroutine is cancelled
      return generator;
    }
  };

  return co;
}
