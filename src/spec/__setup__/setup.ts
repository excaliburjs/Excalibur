/* eslint-disable @typescript-eslint/no-empty-function */
import * as ex from '@excalibur';
import { afterAll, beforeAll } from 'vitest';
import './matchers/expect';

// add any global hooks here
beforeAll(() => {
  ex.Flags.enable('suppress-obsolete-message');
  // ensure consistent toEqualImage() resolution when running on hidpi displays
  window.devicePixelRatio = 1;
});

afterAll(() => {});
