import React from 'react';
import Game from '@site/src/components/Game';

const ReactLiveScope = {
  React,
  ...React,
  ex: requireExcaliburOnClientOnly(),
  Game
};
export default ReactLiveScope;

function requireExcaliburOnClientOnly() {
  if (typeof window === 'undefined') {
    return {};
  }
  return require('excalibur');
}
