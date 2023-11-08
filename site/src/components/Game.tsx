import { useEffect, useRef } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import type * as ex from 'excalibur';

/**
 * Workaround for https://github.com/excaliburjs/Excalibur/issues/1431
 */
function cleanUpPlayButtons() {
  const playButtons = document.querySelectorAll("#excalibur-play-root");

  playButtons.forEach((playButton) => {
    if (playButton.parentNode) {
      playButton.parentNode.removeChild(playButton);
    }
  });
}

const Game = ({ exc, onStart }: { exc: typeof ex; onStart: (game: ex.Engine) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>();
  const gameRef = useRef<ex.Engine>(null);

  const resetGame = () => {
    if (gameRef.current) {
      gameRef.current.stop();
    }
    cleanUpPlayButtons();
  };

  useEffect(() => {
    // HMR support
    resetGame();

    gameRef.current = new exc.Engine({
      width: 600,
      height: 400,
      displayMode: exc.DisplayMode.Fixed,
      canvasElement: canvasRef.current,
      pointerScope: exc.PointerScope.Canvas,
      grabWindowFocus: false,
      scrollPreventionMode: exc.ScrollPreventionMode.None
    });

    gameRef.current.start().then(() => {
      gameRef.current.currentScene.camera.pos = exc.vec(0, 0);

      onStart(gameRef.current);
    });

    return resetGame;
  }, []);

  return <canvas ref={canvasRef}></canvas>;
}

const GameBrowserOnly = ({ onStart }: { onStart: (game: ex.Engine) => void }) => {
  return (
    <BrowserOnly fallback={<div></div>}>
      {() => <Game exc={require('excalibur')} onStart={onStart} />}
    </BrowserOnly>
  )
}

export default GameBrowserOnly;