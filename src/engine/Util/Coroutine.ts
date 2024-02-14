import { Engine } from '../Engine';
// import { Entity } from "../EntityComponentSystem";
// import { Scene } from "../Scene";

export type CoroutineEventType = 'postupdate' | 'preupdate';
export type CoroutineGenerator = () => Generator<number | Promise<any>, void, number>;

/**
 * Excalibur coroutine helper, returns a promise when complete.
 *
 * Each coroutine yield is 1 excalibur frame. Coroutines get passed the elapsed time our of yield. Coroutines
 * run internally on the excalibur clock.
 *
 * If you yield a promise it will be awaited before resumed
 * If you yield a number it will wait that many ms before resumed
 * @param engine
 * @param coroutineGenerator
 */
export function coroutine(engine: Engine, coroutineGenerator: CoroutineGenerator): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const generator = coroutineGenerator();
    const loop = (elapsedMs: number) => {
      try {
        const { done, value } = generator.next(elapsedMs);
        if (done) {
          resolve();
        }

        if (value instanceof Promise) {
          value.then(() => {
            // schedule next loop
            engine.clock.schedule(loop);
          });
        } else if (value === undefined || value === (void 0)) {
          // schedule next frame
          engine.clock.schedule(loop);
        } else {
          // schedule value milliseconds from now
          engine.clock.schedule(loop, value || 0);
        }
      } catch {
        reject();
      }
    };
    loop(engine.clock.elapsed());// run first frame immediately
  });
}