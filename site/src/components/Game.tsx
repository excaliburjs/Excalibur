import { useEffect, useRef } from 'react';
import { DisplayMode, Engine, PointerScope, ScrollPreventionMode, vec } from 'excalibur';

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

const Game = ({ onStart }: { onStart: (game: Engine) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>();
  const gameRef = useRef<Engine>(null);

  const resetGame = () => {
    if (gameRef.current) {
      gameRef.current.stop();
    }
    cleanUpPlayButtons();
  };

  useEffect(() => {
    // HMR support
    resetGame();

    gameRef.current = new Engine({
      width: 600,
      height: 400,
      displayMode: DisplayMode.Fixed,
      canvasElement: canvasRef.current,
      pointerScope: PointerScope.Canvas,
      grabWindowFocus: false,
      scrollPreventionMode: ScrollPreventionMode.None
    });

    gameRef.current.start().then(() => {
      gameRef.current.currentScene.camera.pos = vec(0, 0);

      onStart(gameRef.current);
    });

    return resetGame;
  }, []);

  return <canvas ref={canvasRef}></canvas>;
}

export default Game;