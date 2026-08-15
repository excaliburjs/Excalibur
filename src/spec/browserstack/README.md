# BrowserStack browser-support tests

These tests run on specific browser versions on BrowserStack via `npm run test:browserstack` (see `src/spec/vitest.config.browserstack.ts` and `.github/workflows/browsersupport.yml`). They validate the **built bundle** (`build/dist/excalibur.js`) through the `ex` global, so run `npm run build` first.

Most tests should go in [../vitest](../vitest/); anything that is affected by a particular browser version should go here.
