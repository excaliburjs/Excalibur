/// <reference path='../lib/excalibur.d.ts' />

/*********************
 *                  uuuuuuuuuuuuuuuuuuuu
 *                u" uuuuuuuuuuuuuuuuuu "u
 *              u" u$$$$$$$$$$$$$$$$$$$$u "u
 *            u" u$$$$$$$$$$$$$$$$$$$$$$$$u "u
 *          u" u$$$$$$$$$$$$$$$$$$$$$$$$$$$$u "u
 *        u" u$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$u "u
 *      u" u$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$u "u
 *      $ $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ $
 *      $ $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ $
 *      $ $$$" ... "$...  ...$" ... "$$$  ... "$$$ $
 *      $ $$$u `"$$$$$$$  $$$  $$$$$  $$  $$$  $$$ $
 *      $ $$$$$$uu "$$$$  $$$  $$$$$  $$  """ u$$$ $
 *      $ $$$""$$$  $$$$  $$$u "$$$" u$$  $$$$$$$$ $
 *      $ $$$$....,$$$$$..$$$$$....,$$$$..$$$$$$$$ $
 *      $ $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ $
 *      "u "$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$" u"
 *        "u "$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$" u"
 *          "u "$$$$$$$$$$$$$$$$$$$$$$$$$$$$" u"
 *            "u "$$$$$$$$$$$$$$$$$$$$$$$$" u"
 *              "u "$$$$$$$$$$$$$$$$$$$$" u"
 *                "u """""""""""""""""" u"
 *                  """"""""""""""""""""
 *
 * WARNING: Do not use this sandbox as a "sample" of how to use Excalibur *properly.*
 * This is a messy POS that we use to do crazy integration testing and is really
 * a terrible example.
 *
 * Please don't reference this. Reference the official sample games!
 *
 * Thank you,
 * Excalibur.js team
 */
var logger = ex.Logger.getInstance();
logger.defaultLevel = ex.LogLevel.Debug;

var fullscreenButton = document.getElementById('fullscreen') as HTMLButtonElement;

// Create an the game container
ex.Flags.enable(ex.Experiments.WebGL);
var game = new ex.Engine({
  width: 800 / 2,
  height: 600 / 2,
  viewport: { width: 800, height: 600 },
  canvasElementId: 'game',
  suppressHiDPIScaling: false,
  suppressPlayButton: true,
  antialiasing: false,
  snapToPixel: true
});

fullscreenButton.addEventListener('click', () => {
  if (game.screen.isFullScreen) {
    game.screen.exitFullScreen();
  } else {
    game.screen.goFullScreen();
  }
});
game.showDebug(true);

var heartTex = new ex.Graphics.ImageSource('../images/heart.png');
var heartImageSource = new ex.Graphics.ImageSource('../images/heart.png');
var imageRun = new ex.Graphics.ImageSource('../images/PlayerRun.png');
var imageJump = new ex.Graphics.ImageSource('../images/PlayerJump.png');
var imageRun2 = new ex.Graphics.ImageSource('../images/PlayerRun.png');
var imageBlocks = new ex.Graphics.ImageSource('../images/BlockA0.png');
var imageBlocksLegacy = new ex.Texture('../images/BlockA0.png');
var spriteFontImage = new ex.Graphics.ImageSource('../images/SpriteFont.png');
var jump = new ex.Sound('../sounds/jump.wav', '../sounds/jump.mp3');
var cards = new ex.Graphics.ImageSource('../images/kenny-cards.png');

jump.volume = 0.3;

var loader = new ex.Loader();
loader.addResource(heartImageSource);
loader.addResource(heartTex);
loader.addResource(imageRun);
loader.addResource(imageJump);
loader.addResource(imageBlocks);
loader.addResource(imageBlocksLegacy);
loader.addResource(spriteFontImage);
loader.addResource(cards);
loader.addResource(jump);

// Set background color
game.backgroundColor = new ex.Color(114, 213, 224);

// setup physics defaults
ex.Physics.checkForFastBodies = true;
ex.Physics.acc = new ex.Vector(0, 800); // global accel

// Add some UI
//var heart = new ex.ScreenElement(0, 0, 20, 20);
var heart = new ex.ScreenElement({ x: 0, y: 0, width: 20 * 2, height: 20 * 2 });
heart.graphics.anchor = ex.vec(0, 0);
var heartSprite = ex.Graphics.Sprite.from(heartTex);
heartSprite.scale.setTo(2, 2);
// heart.addDrawing(heartSprite);
var newSprite = new ex.Graphics.Sprite({ image: heartImageSource });
newSprite.scale = ex.vec(2, 2);

var circle = new ex.Graphics.Circle({
  radius: 10,
  color: ex.Color.Red
});

var rect = new ex.Graphics.Rectangle({
  width: 100,
  height: 100,
  color: ex.Color.Green
});

var triangle = new ex.Graphics.Polygon({
  points: [ex.vec(10 * 5, 0), ex.vec(0, 20 * 5), ex.vec(20 * 5, 20 * 5)],
  color: ex.Color.Yellow
});

var anim = new ex.Graphics.Animation({
  frames: [
    {
      graphic: newSprite,
      duration: 1000
    },
    {
      graphic: circle,
      duration: 1000
    },
    {
      graphic: rect,
      duration: 1000
    },
    {
      graphic: triangle,
      duration: 1000
    }
  ]
});

//   alphabet: '0123456789abcdefghijklmnopqrstuvwxyz,!\'&."?- ',
//   caseInsensitive: true,
//   columns: 16,
//   rows: 3,
//   spWidth: 16,
//   spHeight: 16

var cardSpriteSheet = ex.Graphics.SpriteSheet.fromGrid({
  image: cards,
  grid: {
    rows: 4,
    columns: 14,
    spriteWidth: 42,
    spriteHeight: 60
  },
  spacing: {
    originOffset: { x: 11, y: 2 },
    margin: { x: 23, y: 5}
  }
});

cardSpriteSheet.sprites.forEach(s => s.scale = ex.vec(2, 2));

var cardAnimation = ex.Graphics.Animation.fromSpriteSheet(cardSpriteSheet, ex.Util.range(0, 14 * 4), 200);

var spriteFontSheet = ex.Graphics.SpriteSheet.fromGrid({
  image: spriteFontImage,
  grid: {
    rows: 3,
    columns: 16,
    spriteWidth: 16,
    spriteHeight: 16
  }
});

var spriteFont = new ex.Graphics.SpriteFont({
  alphabet: '0123456789abcdefghijklmnopqrstuvwxyz,!\'&."?- ',
  caseInsensitive: true,
  spriteSheet: spriteFontSheet
});

var spriteText = new ex.Graphics.Text({
  text: 'Sprite Text ❤️',
  font: spriteFont
});

// anim.on('loop', (a) => {
//   console.log('loop');
// });
// anim.on('frame', (f) => {
//   console.log('frame');
// });
// anim.on('ended', (a) => {
//   console.log('ended');
// });

var text = new ex.Graphics.Text({
  text: 'This is raster text ❤️',
  font: new ex.Graphics.Font({ size: 30 })
});
// text.showDebug = true;
var ran = new ex.Random(1337);

var canvasGraphic = new ex.Graphics.Canvas({
  width: 200,
  height: 200,
  cache: true,
  draw: (ctx: CanvasRenderingContext2D) => {
    const color = new ex.Color(ran.integer(0, 255), ran.integer(0, 255), ran.integer(0, 255));
    ctx.fillStyle = color.toRGBA();
    ctx.fillRect(0, 0, 100, 100);
  }
});

var group = new ex.Graphics.GraphicsGroup({
  members: [
    {
      graphic: newSprite,
      pos: ex.vec(0, 0)
    },
    {
      graphic: newSprite,
      pos: ex.vec(50, 0)
    },
    {
      graphic: newSprite,
      pos: ex.vec(0, 50)
    },
    {
      graphic: text,
      pos: ex.vec(100, 20)
    },
    {
      graphic: circle,
      pos: ex.vec(50, 50)
    },
    {
      graphic: anim,
      pos: ex.vec(200, 200)
    },
    {
      graphic: cardAnimation,
      pos: ex.vec(0, 200)
    },
    {
      graphic: spriteText,
      pos: ex.vec(300, 200)
    }
  ]
});

heart.graphics.add(group);
heart.pos = ex.vec(10, 10);
heart.onPostDraw = (ctx) => {
  ctx.fillStyle = ex.Color.Violet.toRGBA();
  ctx.fillRect(0, 0, 100, 100);
}
game.add(heart);

var label = new ex.Label('Test Label', 200, 200);
game.add(label);


var pointer = new ex.Actor({
  width: 25,
  height: 25,
  color: ex.Color.Red,
  collisionType: ex.CollisionType.Fixed
});
var pointerChild1 = new ex.Actor({
  pos: ex.vec(100, 0),
  width: 30,
  height: 30,
  color: ex.Color.Green,
  collisionType: ex.CollisionType.Fixed
});
var pointerChild2 = new ex.Actor({
  pos: ex.vec(0, 100),
  width: 30,
  height: 30,
  color: ex.Color.Violet,
  collisionType: ex.CollisionType.Fixed
});
var pointerChild3 = new ex.Actor({
  pos: ex.vec(-100, 0),
  width: 30,
  height: 30,
  color: ex.Color.Rose,
  collisionType: ex.CollisionType.Fixed
});
pointer.add(pointerChild1.add(pointerChild2.add(pointerChild3)));

game.add(pointer);
var otherPointer = new ex.ScreenElement({
  width: 15,
  height: 15,
  color: ex.Color.Blue
});
var pagePointer = document.getElementById('page') as HTMLDivElement;
otherPointer.anchor.setTo(.5, .5);
game.add(otherPointer);
game.input.pointers.primary.on('move', (ev) => {
   pointer.pos = ev.worldPos;
   otherPointer.pos = game.screen.worldToScreenCoordinates(ev.worldPos);
   let pagePos = game.screen.screenToPageCoordinates(otherPointer.pos);
   pagePointer.style.left = pagePos.x + 'px';
   pagePointer.style.top = pagePos.y + 'px';
});

game.input.pointers.primary.on('wheel', (ev) => {
  pointer.pos.setTo(ev.x, ev.y);
  game.currentScene.camera.z += (ev.deltaY / 1000);
  game.currentScene.camera.z = ex.Util.clamp(game.currentScene.camera.z, .05, 100);
})
// Turn on debug diagnostics
game.showDebug(false);
var blockSpriteLegacy = new ex.Sprite(imageBlocksLegacy, 0, 0, 65, 49);
var blockSprite = new ex.Graphics.Sprite({
  image: imageBlocks,
  destSize: {
    width: 65,
    height: 49
  }
});
// Create spritesheet
//var spriteSheetRun = new ex.SpriteSheet(imageRun, 21, 1, 96, 96);
var spriteSheetRun = ex.Graphics.SpriteSheet.fromGrid({
  image: imageRun,
  grid: {
    rows: 1,
    columns: 21,
    spriteHeight: 96,
    spriteWidth: 96
  }
});
//var spriteSheetJump = new ex.SpriteSheet(imageJump, 21, 1, 96, 96);
var spriteSheetJump = ex.Graphics.SpriteSheet.fromGrid({
  image: imageJump,
  grid: {
    columns: 21,
    rows: 1,
    spriteWidth: 96,
    spriteHeight: 96
  }
});
var tileBlockWidth = 64,
  tileBlockHeight = 48,
  spriteTiles = new ex.Graphics.SpriteSheet({sprites: [ex.Graphics.Sprite.from(imageBlocks)] });

// create a collision map
// var tileMap = new ex.TileMap(100, 300, tileBlockWidth, tileBlockHeight, 4, 500);
var tileMap = new ex.TileMap({ x: 100, y: 300, cellWidth: tileBlockWidth, cellHeight: tileBlockHeight, rows: 4, cols: 500 });
var blocks = ex.Graphics.Sprite.from(imageBlocks);
tileMap.data.forEach(function(cell: ex.Cell) {
  cell.solid = true;
  cell.addSprite(spriteTiles.sprites[0]);
});
game.add(tileMap);

// Create spriteFont
//var spriteFont = new ex.SpriteFont(spriteFontImage, '0123456789abcdefghijklmnopqrstuvwxyz,!\'&."?- ', true, 16, 3, 16, 16);
// var spriteFont = new ex.SpriteFont({
//   image: spriteFontImage,
//   alphabet: '0123456789abcdefghijklmnopqrstuvwxyz,!\'&."?- ',
//   caseInsensitive: true,
//   columns: 16,
//   rows: 3,
//   spWidth: 16,
//   spHeight: 16
// });
// //var label = new ex.Label('Hello World', 100, 100, null, spriteFont);
// var label = new ex.Label({
//   text: 'Hello World',
//   x: 100,
//   y: 100,
//   spriteFont: spriteFont
// });
// game.add(label);

// Retrieve animations for blocks from sprite sheet
var blockAnimation = spriteTiles.sprites[0].clone();
// blockAnimation.addEffect(new ex.Effects.Grayscale());
// Animation 'enum' to prevent 'stringly' typed misspelling errors
enum Animations {
  Block = 'Block',
  Idle = 'Idle',
  Left = 'Left',
  Right = 'Right',
  JumpRight = 'JumpRight',
  JumpLeft = 'JumpLeft'
}

var currentX = 0;
var blockGroup = ex.CollisionGroupManager.create('ground');
// Create the level
for (var i = 0; i < 36; i++) {
  currentX = tileBlockWidth * i + 10;
  var color = new ex.Color(Math.random() * 255, Math.random() * 255, Math.random() * 255);
  var block = new ex.Actor({
    pos: new ex.Vector(currentX, 350 + Math.random() * 100),
    width: tileBlockWidth,
    height: tileBlockHeight,
    color: color
  });
  block.body.collider.type = ex.CollisionType.Fixed;
  //var block = new ex.Actor(currentX, 350 + Math.random() * 100, tileBlockWidth, tileBlockHeight, color);
  //block.collisionType = ex.CollisionType.Fixed;
  block.body.collider.group = blockGroup;
  block.graphics.add(blockAnimation);

  game.add(block);
}

var platform = new ex.Actor(400, 300, 200, 50, new ex.Color(0, 200, 0));
platform.graphics.add(new ex.Graphics.Rectangle({ color: new ex.Color(0, 200, 0), width: 200, height: 50 }));
platform.body.collider.type = ex.CollisionType.Fixed;
platform.actions.moveTo(200, 300, 100).moveTo(600, 300, 100).moveTo(400, 300, 100).repeatForever();
game.add(platform);

var platform2 = new ex.Actor(800, 300, 200, 20, new ex.Color(0, 0, 140));
platform2.graphics.add(new ex.Graphics.Rectangle({ color: new ex.Color(0, 0, 140), width: 200, height: 20 }));
platform2.body.collider.type = ex.CollisionType.Fixed;
platform2.actions.moveTo(2000, 300, 100).moveTo(2000, 100, 100).moveTo(800, 100, 100).moveTo(800, 300, 100).repeatForever();
game.add(platform2);

var platform3 = new ex.Actor(-200, 400, 200, 20, new ex.Color(50, 0, 100));
platform3.graphics.add(new ex.Graphics.Rectangle({ color: new ex.Color(50, 0, 100), width: 200, height: 20 }));
platform3.body.collider.type = ex.CollisionType.Fixed;
platform3.actions.moveTo(-200, 800, 300).moveTo(-200, 400, 50).delay(3000).moveTo(-200, 300, 800).moveTo(-200, 400, 800).repeatForever();
game.add(platform3);

var platform4 = new ex.Actor(75, 300, 100, 50, ex.Color.Azure);
platform4.graphics.add(new ex.Graphics.Rectangle({ color: ex.Color.Azure, width: 100, height: 50 }));
platform4.body.collider.type = ex.CollisionType.Fixed;
game.add(platform4);

// Test follow api
var follower = new ex.Actor(50, 100, 20, 20, ex.Color.Black);
follower.graphics.add(new ex.Graphics.Rectangle({ color: ex.Color.Black, width: 20, height: 20 }));
follower.body.collider.type = ex.CollisionType.PreventCollision;
game.add(follower);

// Create the player
// var player = new ex.Actor(100, -200, 32, 96);
// player.enableCapturePointer = true;
// player.collisionType = ex.CollisionType.Active;
var player = new ex.Actor({
  pos: new ex.Vector(100, -200),
  width: 32,
  height: 96,
  enableCapturePointer: true,
  collisionType: ex.CollisionType.Active
});
player.graphics.copyGraphics = false;
follower.actions
  .meet(player, 60)
  .asPromise()
  .then(() => {
    console.log('Player met!!');
  });

// follow player

player.rotation = 0;

// Health bar example
var healthbar = new ex.Actor(0, -70, 140, 5, new ex.Color(0, 255, 0));
player.add(healthbar);
// player.onPostDraw = (ctx: CanvasRenderingContext2D) => {
//   ctx.fillStyle = 'red';
//   ctx.fillRect(0, 0, 100, 100);
// };
player.graphics.onPostDraw = (ctx: ex.Graphics.ExcaliburGraphicsContext) => {
  ctx.debug.drawLine(ex.vec(0, 0), ex.vec(200, 0));
  ctx.debug.drawPoint(ex.vec(0, 0), { size: 20, color: ex.Color.Black });
};

var healthbar2 = new ex.Graphics.Rectangle({
  width: 140,
  height: 5,
  color: new ex.Color(0, 255, 0)
});

var backroundLayer = player.graphics.layers.create({
  name: 'background',
  order: -1
});

backroundLayer.show(healthbar2, { offset: ex.vec(0, -70) });
var playerText = new ex.Graphics.Text({
  text: 'A long piece of text is long',
  font: new ex.Graphics.Font({
    size: 20,
    family: 'Times New Roman'
  })
});
// playerText.showDebug = true;
backroundLayer.show(playerText, { offset: ex.vec(0, -70) });

// Retrieve animations for player from sprite sheet
var left = ex.Graphics.Animation.fromSpriteSheet(spriteSheetRun, ex.Util.range(1, 10), 50);
// var left = new ex.Animation(game, left_sprites, 50);
var right = left.clone(); // spriteSheetRun.getAnimationBetween(game, 1, 11, 50);
right.flipHorizontal = true;
var idle = ex.Graphics.Animation.fromSpriteSheet(spriteSheetRun, [0], 200); // spriteSheetRun.getAnimationByIndices(game, [0], 200);
//idle.anchor.setTo(.5, .5);
var jumpLeft = ex.Graphics.Animation.fromSpriteSheet(
  spriteSheetJump,
  ex.Util.range(0, 10).reverse(),
  100,
  ex.Graphics.AnimationStrategy.Freeze
); // spriteSheetJump.getAnimationBetween(game, 0, 11, 100);
var jumpRight = ex.Graphics.Animation.fromSpriteSheet(spriteSheetJump, ex.Util.range(11, 21), 100, ex.Graphics.AnimationStrategy.Freeze); // spriteSheetJump.getAnimationBetween(game, 11, 22, 100);
// left.loop = true;
// right.loop = true;
// idle.loop = true;

// jumpRight.freezeFrame = 0;
// jumpLeft.freezeFrame = 11;

// Add animations to player
player.graphics.add(Animations.Left, left);
player.graphics.add(Animations.Right, right);
player.graphics.add(Animations.Idle, idle);
player.graphics.add(Animations.JumpRight, jumpRight);
player.graphics.add(Animations.JumpLeft, jumpLeft);

// Set default animation
player.graphics.use(Animations.Idle);

var inAir = true;
var groundSpeed = 150;
var airSpeed = 130;
var jumpSpeed = 500;
var direction = 1;
player.on('postupdate', () => {
  if (game.input.keyboard.isHeld(ex.Input.Keys.Left)) {
    direction = -1;
    if (!inAir) {
      player.graphics.use(Animations.Left);
    }
    if (inAir) {
      player.vel.x = -airSpeed;
      return;
    }
    player.vel.x = -groundSpeed;
  } else if (game.input.keyboard.isHeld(ex.Input.Keys.Right)) {
    direction = 1;
    if (!inAir) {
      player.graphics.use(Animations.Right);
    }
    if (inAir) {
      player.vel.x = airSpeed;
      return;
    }
    player.vel.x = groundSpeed;
  }

  if (game.input.keyboard.isHeld(ex.Input.Keys.Up)) {
    if (!inAir) {
      player.vel.y = -jumpSpeed;
      inAir = true;
      if (direction === 1) {
        player.graphics.use<ex.Graphics.Animation>(Animations.JumpRight).reset();
      } else {
        player.graphics.use<ex.Graphics.Animation>(Animations.JumpLeft).reset();
      }
      jump.play();
    }
  }
});

game.input.keyboard.on('up', (e?: ex.Input.KeyEvent) => {
  if (inAir) return;

  if (e.key === ex.Input.Keys.Left || e.key === ex.Input.Keys.Right) {
    player.graphics.use(Animations.Idle);
  }
});

player.on('pointerdown', (e?: ex.Input.PointerEvent) => {
  alert('Player clicked!');
});

var newScene = new ex.Scene(game);
newScene.add(new ex.Label('MAH LABEL!', 200, 100));
newScene.on('activate', (evt?: ex.ActivateEvent) => {
  console.log('activate newScene');
});

newScene.on('deactivate', (evt?: ex.DeactivateEvent) => {
  console.log('deactivate newScene');
});
newScene.on('foo', (ev: ex.GameEvent<any>) => {});

game.addScene('label', newScene);

game.input.keyboard.on('down', (keyDown?: ex.Input.KeyEvent) => {
  if (keyDown.key === ex.Input.Keys.F) {
    var a = new ex.Actor(player.pos.x + 10, player.pos.y - 50, 10, 10, new ex.Color(222, 222, 222));
    a.vel.x = 200 * direction;
    a.vel.y = 0;
    a.body.collider.type = ex.CollisionType.Active;
    var inAir = true;
    a.on('precollision', (data?: ex.PreCollisionEvent) => {
      inAir = false;
      if (!data.other) {
        a.vel.y = 0;
      }
    });
    a.on('postupdate', (data?: ex.PostUpdateEvent) => {
      if (inAir) {
        a.acc.y = 400;
      } else {
        a.acc.y = 0;
      }
      inAir = true;
    });
    game.add(a);
  } else if (keyDown.key === ex.Input.Keys.U) {
    game.goToScene('label');
  } else if (keyDown.key === ex.Input.Keys.I) {
    game.goToScene('root');
  }
});

var isColliding = false;
player.on('precollision', (data?: ex.PreCollisionEvent) => {
  if (data.side === ex.Side.Bottom) {
    isColliding = true;

    if (inAir) {
      player.graphics.use(Animations.Idle);
    }
    inAir = false;
    if (
      data.other &&
      !(
        game.input.keyboard.isHeld(ex.Input.Keys.Left) ||
        game.input.keyboard.isHeld(ex.Input.Keys.Right) ||
        game.input.keyboard.isHeld(ex.Input.Keys.Up) ||
        game.input.keyboard.isHeld(ex.Input.Keys.Down)
      )
    ) {
      player.vel.x = data.other.vel.x;
      player.vel.y = data.other.vel.y;
    }

    if (!data.other) {
      player.vel.x = 0;
      player.vel.y = 0;
    }
  }

  if (data.side === ex.Side.Top) {
    if (data.other) {
      player.vel.y = data.other.vel.y - player.vel.y;
    } else {
      player.vel.y = 0;
    }
  }
});

player.on('postupdate', (data?: ex.PostUpdateEvent) => {
  // apply gravity if player is in the air
  // only apply gravity when not colliding
  if (!isColliding && data.target instanceof ex.Actor) {
    data.target.acc.y = 800; // * data.delta/1000;
  } else {
    //data.target.acc.y = 0;
  }

  // Reset values because we don't know until we check the next update
  isColliding = false;
});

player.on('initialize', (evt?: ex.InitializeEvent) => {
  console.log('Player initialized', evt.engine);
});

game.input.keyboard.on('down', (keyDown?: ex.Input.KeyEvent) => {
  if (keyDown.key === ex.Input.Keys.B) {
    var block = new ex.Actor(currentX, 350, 44, 50, color);
    currentX += 46;
    block.graphics.add(blockAnimation);
    game.add(block);
  }
  if (keyDown.key === ex.Input.Keys.D) {
    game.toggleDebug();
  }
});

var paused = false;
game.on('p', () => {
  if (!paused) {
    game.stop();
  } else {
    game.start();
  }
  paused != paused;
});

// Create a camera to track the player
var camera = game.currentScene.camera;

// Add player to game is synonymous with adding a player to the current scene
game.add(player);

// Add particle emitter
// sprite.anchor = new ex.Vector(0.5, 0.5);
var emitter = new ex.ParticleEmitter({
  pos: new ex.Vector(100, 300),
  width: 2,
  height: 2,
  minVel: 417,
  maxVel: 589,
  minAngle: Math.PI,
  maxAngle: Math.PI * 2,
  isEmitting: false,
  emitRate: 494,
  opacity: 0.84,
  fadeFlag: true,
  particleLife: 2465,
  maxSize: 20.5,
  minSize: 10,
  acceleration: new ex.Vector(0, 460),
  beginColor: ex.Color.Red,
  endColor: ex.Color.Yellow,
  // particleSprite: blockSpriteLegacy,
  particleRotationalVelocity: Math.PI / 10,
  randomRotation: true
});
game.add(emitter);

var exploding = false;
var trigger = new ex.Trigger({
  width: 100,
  height: 100,
  pos: new ex.Vector(400, 200),
  repeat: -1,
  target: player,
  action: () => {
    if (!exploding) {
      exploding = true;
      emitter.isEmitting = true;
      camera.shake(10, 10, 2000);
      game.addTimer(
        new ex.Timer({
          interval: 2000,
          fcn: () => {
            emitter.isEmitting = false;
            exploding = false;
          }
        })
      );
    }
  }
});

game.add(trigger);

game.input.pointers.primary.on('down', (evt?: ex.Input.PointerEvent) => {
  var c = tileMap.getCellByPoint(evt.worldPos.x, evt.worldPos.y);
  if (c) {
    if (c.solid) {
      c.solid = false;
      c.sprites.pop();
    } else {
      c.solid = true;
      c.addSprite(spriteTiles.sprites[0]);
    }
  }
});

game.input.keyboard.on('up', (evt?: ex.Input.KeyEvent) => {
  if (evt.key == ex.Input.Keys.F) {
    jump.play();
  }
  if (evt.key == ex.Input.Keys.S) {
    jump.stop();
  }
});

// Add camera to game
game.currentScene.camera.strategy.lockToActorAxis(player, ex.Axis.X);
game.currentScene.camera.y = 200;

// Run the mainloop
game.start(loader).then(() => {
  logger.info('All Resources have finished loading');
});
