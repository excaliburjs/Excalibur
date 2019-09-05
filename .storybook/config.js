import { configure, addParameters } from '@storybook/html';
import { DocsPage, DocsContainer } from '@storybook/addon-docs/blocks';

addParameters({
  docs: {
    container: DocsContainer,
    page: DocsPage
  }
});

configure(require.context('../src/engine', true, /\.stories\.ts$/), module);
