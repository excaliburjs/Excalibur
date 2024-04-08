async function main() {
  const game = new ex.Engine({
    width: 3000,
    height: 3000,
    suppressHiDPIScaling: true,
    displayMode: ex.DisplayMode.FitScreen
  });

  await game.start();

  const paddle = new ex.Actor({
    x: 220,
    y: 220,
    width: 400,
    height: 400,
    color: ex.Color.White
  });

  console.log('Game:', game.drawWidth, '·', game.drawHeight);
  console.log('Canv:', game.canvasWidth, '·', game.canvasHeight);
  // console.log('Camera: ', game.currentScene.camera.pos);
  // console.log('Center: ', game.screen.center);
  // game.currentScene.camera.pos = game.screen.center;

  game.add(paddle);
  return [game, paddle];
}

main().then(([game, paddle]) => {
  console.log('Promise from main()');
  (window as any).game = game;
  (window as any).paddle = paddle;
});
