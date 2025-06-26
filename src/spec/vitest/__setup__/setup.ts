import * as ex from '@excalibur';
import { beforeAll } from 'vitest';
import './matchers/expect';
import { setupEngineInstanceReporter } from '../__reporters__/engine-instance.setup';
import { setupMemoryReporter } from '../__reporters__/memory.setup';

setupEngineInstanceReporter();
setupMemoryReporter();

// add any global hooks here
beforeAll(() => {
  ex.Flags.enable('suppress-obsolete-message');
  // ensure consistent toEqualImage() resolution when running on hidpi displays
  window.devicePixelRatio = 1;
});
