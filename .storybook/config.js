import { configure } from '@storybook/html';

configure(require.context('../src/engine', true, /\.stories\.ts$/), module);
