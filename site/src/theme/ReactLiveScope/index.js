import React from 'react';
import Game from '@site/src/components/Game';
import * as ex from 'excalibur';

const ReactLiveScope = {
  React,
  ...React,
  ex,
  Game
};
export default ReactLiveScope;
