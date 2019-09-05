import { configure } from '@storybook/html';

function loadStories() {
  const req = require.context('../src/engine', true, /\.stories\.ts$/);
  req.keys().forEach((filename) => req(filename));
}

configure(loadStories, module);
