import { Local } from 'browserstack-local';

/**
 * Groups the BrowserStack sessions for one run and ties them to this machine's tunnel,
 * shared between the vitest config (capabilities) and the tunnel started in global setup.
 */
export const BUILD_NAME = process.env.GITHUB_RUN_ID ? `browsersupport-${process.env.GITHUB_RUN_ID}` : 'browsersupport-local';
export const LOCAL_IDENTIFIER = `excalibur-${BUILD_NAME}`;

/**
 * Vitest global setup: starts a BrowserStack Local tunnel so the remote browsers can reach
 * the vitest server on this machine, and tears it down when the run completes.
 */
export default async function setup() {
  if (!process.env.BS_USERNAME || !process.env.BS_PASSWORD) {
    throw new Error('BS_USERNAME and BS_PASSWORD must be set to run the BrowserStack browser-support tests');
  }

  const tunnel = new Local();
  await new Promise<void>((resolve, reject) => {
    tunnel.start(
      {
        key: process.env.BS_PASSWORD,
        localIdentifier: LOCAL_IDENTIFIER,
        forceLocal: true
      },
      (error) => (error ? reject(error) : resolve())
    );
  });

  return () =>
    new Promise<void>((resolve) => {
      tunnel.stop(() => resolve());
    });
}
