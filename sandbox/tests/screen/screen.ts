var widthEl = document.getElementById('containerWidth') as HTMLInputElement;
var heightEl = document.getElementById('containerHeight') as HTMLInputElement;
var container = document.getElementsByClassName('game-container').item(0) as HTMLDivElement;

widthEl.addEventListener('input', (e) => {
  container.style.width = (e.target as any).value + 'vw';
});

heightEl.addEventListener('input', (e) => {
  container.style.height = (e.target as any).value + 'vh';
});

var game = new ex.Engine({
  canvasElementId: 'game',
  width: 800,
  height: 600,
  displayMode: ex.DisplayMode.FitContainer,
  pointerScope: ex.PointerScope.Canvas
});

game.start();
