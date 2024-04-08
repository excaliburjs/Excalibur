var game = new ex.Engine({
  width: 800,
  height: 600
});

var loader = new ex.Loader();

function generate() {
  let srcs = [];
  for (let i = 0; i < 800; i++) {
    srcs.push(generateRandomImage());
  }
  let images = srcs.map((src) => new ex.ImageSource(src));
  loader.addResources(images);

  let sprites = images.map((i) => i.toSprite());

  game.currentScene.onPostDraw = (ctx) => {
    ctx.save();
    ctx.scale(0.25, 0.25);
    for (let i = 0; i < sprites.length; i++) {
      sprites[i].draw(ctx, ((i * 100) % (800 * 4)) + 10, Math.floor((i * 100) / (800 * 4)) * 100 + 10);
    }
    ctx.restore();
  };
}

function drawRandomCircleOnContext(ctx) {
  const x = Math.floor(Math.random() * 100);
  const y = Math.floor(Math.random() * 100);
  const radius = Math.floor(Math.random() * 20);

  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);

  ctx.beginPath();
  ctx.arc(x, y, radius, Math.PI * 2, 0, false);
  ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',1)';
  ctx.fill();
  ctx.closePath();
}

function generateRandomImage() {
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 100, 100);

  for (let i = 0; i < 20; i++) {
    drawRandomCircleOnContext(ctx);
  }
  return canvas.toDataURL('image/png');
}

generate();

game.start(loader);
