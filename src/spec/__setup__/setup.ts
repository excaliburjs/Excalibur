/* eslint-disable @typescript-eslint/no-empty-function */
import { afterAll, beforeAll } from 'vitest';
import './matchers/expect';

// add any global hooks here
beforeAll(() => {
  // ensure consistent toEqualImage() resolution when running on hidpi displays
  window.devicePixelRatio = 1;
});

afterAll(() => {});
