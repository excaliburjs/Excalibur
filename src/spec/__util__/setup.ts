import * as ex from '@excalibur';
import { beforeAll } from 'vitest';
import { setupEngineInstanceReporter } from './reporters/engine-instance.setup';
import { setupMemoryReporter } from './reporters/memory.setup';

setupEngineInstanceReporter();
setupMemoryReporter();

// add any global hooks here
beforeAll(() => {
  ex.Flags.enable('suppress-obsolete-message');
  // ensure consistent toEqualImage() resolution when running on hidpi displays
  window.devicePixelRatio = 1;
});
