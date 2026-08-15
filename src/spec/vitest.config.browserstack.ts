import * as path from 'path';
import type { ViteUserConfig } from 'vitest/config';
import { defineConfig, mergeConfig } from 'vitest/config';
import { webdriverio } from '@vitest/browser-webdriverio';
import commonConfig from '../../vite.config.common';
import { BUILD_NAME, LOCAL_IDENTIFIER } from './browserstack/browserstack-tunnel';

/**
 * Runs the browser-support smoke tests against the built bundle (build/dist/excalibur.js)
 * on real browsers via BrowserStack Automate.
 *
 * Deliberately a standalone config (not part of the root `projects`) so that plain
 * `vitest` runs never try to reach BrowserStack: `npm run test:browserstack`.
 * Requires BS_USERNAME/BS_PASSWORD and a prior `npm run build`.
 */

type BrowserStackTarget = {
  /** Local browser name the vitest provider understands */
  browser: 'chrome' | 'firefox' | 'safari';
  name: string;
  os: string;
  osVersion: string;
  browserVersion: 'latest' | 'latest-1';
};

const matrix: BrowserStackTarget[] = [
  { browser: 'chrome', name: 'chrome-latest-win11', os: 'Windows', osVersion: '11', browserVersion: 'latest' },
  { browser: 'chrome', name: 'chrome-latest-1-win11', os: 'Windows', osVersion: '11', browserVersion: 'latest-1' },
  { browser: 'firefox', name: 'firefox-latest-win11', os: 'Windows', osVersion: '11', browserVersion: 'latest' },
  { browser: 'firefox', name: 'firefox-latest-1-win11', os: 'Windows', osVersion: '11', browserVersion: 'latest-1' },
  { browser: 'safari', name: 'safari-latest', os: 'OS X', osVersion: 'Sequoia', browserVersion: 'latest' },
  { browser: 'safari', name: 'safari-latest-1', os: 'OS X', osVersion: 'Sonoma', browserVersion: 'latest-1' }
];

function browserstackInstance(target: BrowserStackTarget) {
  return {
    browser: target.browser,
    name: target.name,
    provider: webdriverio({
      user: process.env.BS_USERNAME,
      key: process.env.BS_PASSWORD,
      hostname: 'hub.browserstack.com',
      port: 443,
      protocol: 'https',
      path: '/wd/hub',
      capabilities: {
        'bstack:options': {
          projectName: 'Excalibur',
          buildName: BUILD_NAME,
          sessionName: target.name,
          os: target.os,
          osVersion: target.osVersion,
          browserVersion: target.browserVersion,
          local: true,
          localIdentifier: LOCAL_IDENTIFIER
        }
      }
    })
  };
}

export default defineConfig(
  mergeConfig(commonConfig, {
    // serve the repo root so the built bundle at /build/dist/excalibur.js is fetchable
    publicDir: path.resolve(__dirname, '../../'),
    test: {
      name: 'browserstack',
      globals: true,
      include: ['./browserstack/**/*spec.ts'],
      globalSetup: [path.resolve(__dirname, './browserstack/browserstack-tunnel.ts')],
      // remote real browsers are slow to provision and run
      testTimeout: 60_000,
      hookTimeout: 120_000,
      api: { host: '127.0.0.1' },
      browser: {
        enabled: true,
        // BrowserStack sessions are real headed browsers; the wdio provider also rejects headless safari
        headless: false,
        instances: matrix.map(browserstackInstance)
      }
    }
  } satisfies ViteUserConfig)
);
