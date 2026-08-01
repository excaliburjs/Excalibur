import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@fontsource-variable/jetbrains-mono/wght.css';
import './styles.css';

import { App } from './app';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
