import commonConfig from '../vite.config.common.js';

/** @type { import('@storybook/html-vite').StorybookConfig } */
const config = {
  stories: ['../src/stories/*.stories.ts'],
  addons: [],
  framework: {
    name: '@storybook/html-vite',
    options: {}
  },
  async viteFinal(config) {
    const { mergeConfig } = await import('vite');

    return mergeConfig(config, commonConfig);
  }
};
export default config;
