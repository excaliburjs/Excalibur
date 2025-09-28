// this is in a separate file because this is executed in the browser
import * as ex from '@excalibur';

/**
 * Logs the data needed for the engine instance reporter. Should
 * be run once in setup file.
 */
export function setupEngineInstanceReporter() {
  let currentEngines = ex.Engine.InstanceCount;

  afterEach((ctx) => {
    ctx.task.meta.engineInstanceLeaks ??= [];

    if (currentEngines < ex.Engine.InstanceCount) {
      // eslint-disable-next-line no-console
      console.log(`Spec ${ctx.task.name} Engine increased: ${ex.Engine.InstanceCount}`);

      ctx.task.meta.engineInstanceLeaks.push({
        testName: ctx.task.name,
        engineCount: ex.Engine.InstanceCount
      });
    }
    currentEngines = ex.Engine.InstanceCount;
  });
}
