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
// setup physics defaults
// ex.Physics.useArcadePhysics();
// ex.Physics.checkForFastBodies = true;
// ex.Physics.acc = new ex.Vector(0, 10); // global accel
// Create an the game container
var game = new ex.Engine({
  width: 800 / 2,
  height: 600 / 2,
  viewport: { width: 800, height: 600 },
  canvasElementId: 'game',
  // pixelRatio: 1,
  // suppressPlayButton: true,
  pointerScope: ex.PointerScope.Canvas,
  displayMode: ex.DisplayMode.FitScreenAndZoom,
  snapToPixel: false,
  // fixedUpdateFps: 30,
  pixelRatio: 2,
  fixedUpdateFps: 60,
  maxFps: 60,
  antialiasing: {
    pixelArtSampler: true,
    canvasImageRendering: 'auto',
    nativeContextAntialiasing: false,
    filtering: ex.ImageFiltering.Pixel,
    multiSampleAntialiasing: true,
  },
  uvPadding: 0,
  physics: {
    colliders: {
      compositeStrategy: 'together'
    },
    solver: ex.SolverStrategy.Arcade,
    gravity: ex.vec(0, 20),
    arcade: {
      contactSolveBias: ex.ContactSolveBias.VerticalFirst
    },
    continuous: {
      checkForFastBodies: true
    }
  },
  configurePerformanceCanvas2DFallback: {
    allow: true,
    showPlayerMessage: true,
    threshold: { fps: 20, numberOfFrames: 100 }
  }
});
game.screen.events.on('fullscreen', (evt) => {
  console.log('fullscreen', evt);
});
game.screen.events.on('resize', (evt) => {
  console.log('resize', evt);
});
game.screen.events.on('pixelratio', (evt) => {
  console.log('pixelratio', evt);
});
game.currentScene.onPreDraw = (ctx: ex.ExcaliburGraphicsContext) => {
  ctx.save();
  ctx.z = 99;
  const red = ex.Color.fromHex('#F84541');
  const green = ex.Color.fromHex('#3CCC2E');
  const blue = ex.Color.fromHex('#3DDCFC');
  const yellow = ex.Color.fromHex('#FDCF45');

  const bb = game.screen.contentArea.clone();
  bb.top++
  bb.left++
  bb.bottom--
  bb.right--;
  bb.draw(ctx, ex.Color.Yellow);

  ctx.drawCircle(ex.vec(bb.left + 6, bb.top + 6), 10, green);
  ctx.drawCircle(ex.vec(bb.right - 6, bb.top + 6), 10, blue);
  ctx.drawCircle(ex.vec(bb.left + 6, bb.bottom - 6), 10, yellow);
  ctx.drawCircle(ex.vec(bb.right - 6, bb.bottom - 6), 10, red);
  ctx.restore();
}

game.on('fallbackgraphicscontext', (ctx) => {
  console.log('fallback triggered', ctx);
});
//@ts-ignore For some reason ts doesn't like the /// slash import
// const devtool = new ex.DevTools.DevTool(game);


// var colorblind = new ex.ColorBlindnessPostProcessor(ex.ColorBlindnessMode.Deuteranope);
// game.graphicsContext.addPostProcessor(colorblind);

fullscreenButton.addEventListener('click', () => {
  if (game.screen.isFullScreen) {
    game.screen.exitFullScreen();
  } else {
    game.screen.goFullScreen('container');
  }
});
game.showDebug(true);


var heartTex = new ex.ImageSource('../images/heart.png');
var heartImageSource = new ex.ImageSource('../images/heart.png');
var imageRun = new ex.ImageSource('../images/PlayerRun.png', false, ex.ImageFiltering.Blended);
var imageJump = new ex.ImageSource('../images/PlayerJump.png');
var imageRun2 = new ex.ImageSource('../images/PlayerRun.png');
var imageBlocks = new ex.ImageSource('../images/BlockA0.png', false, ex.ImageFiltering.Blended);
var spriteFontImage = new ex.ImageSource('../images/SpriteFont.png');
var jump = new ex.Sound('../sounds/jump.wav', '../sounds/jump.mp3');
var cards = new ex.ImageSource('../images/kenny-cards.png');
var cloud = new ex.ImageSource('../images/background_cloudA.png', false, ex.ImageFiltering.Blended);

// Log one warning
var cards2 = new ex.ImageSource('../images/kenny-cards.png').toSprite();
cards2.draw(game.graphicsContext, 0, 0);
cards2.draw(game.graphicsContext, 0, 0);

jump.volume = 0.3;

var boot = new ex.Loader({
  fullscreenAfterLoad: true,
  fullscreenContainer: document.getElementById('container')
});
boot.addResource(heartImageSource);
boot.addResource(heartTex);
boot.addResource(imageRun);
boot.addResource(imageJump);
boot.addResource(imageBlocks);
boot.addResource(spriteFontImage);
boot.addResource(cards);
boot.addResource(cloud);
boot.addResource(jump);

// Set background color
game.backgroundColor = new ex.Color(114, 213, 224);



// Add some UI
//var heart = new ex.ScreenElement(0, 0, 20, 20);
var heart = new ex.ScreenElement({ x: 0, y: 0, width: 20 * 2, height: 20 * 2 });
heart.graphics.anchor = ex.vec(0, 0);
var heartSprite = ex.Sprite.from(heartTex);
heartSprite.scale.setTo(2, 2);
// heart.addDrawing(heartSprite);
var newSprite = new ex.Sprite({ image: heartImageSource });
newSprite.scale = ex.vec(2, 2);

var circle = new ex.Circle({
  radius: 10,
  color: ex.Color.Red,
  filtering: ex.ImageFiltering.Blended
});

var rect = new ex.Rectangle({
  width: 100,
  height: 100,
  color: ex.Color.Green
});

var triangle = new ex.Polygon({
  points: [ex.vec(10 * 5, 0), ex.vec(0, 20 * 5), ex.vec(20 * 5, 20 * 5)],
  color: ex.Color.Yellow
});

var anim = new ex.Animation({
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

var cardSpriteSheet = ex.SpriteSheet.fromImageSource({
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

var cardAnimation = ex.Animation.fromSpriteSheet(cardSpriteSheet, ex.range(0, 14 * 4), 200);

var multiCardSheet = ex.SpriteSheet.fromImageSourceWithSourceViews({
  image: cards,
  sourceViews: [
    { x: 11, y: 2, width: 42*2 + 23, height: 60*2 + 5 }
  ]
});

var multiCardActor = new ex.Actor({
  pos: ex.vec(400, 100),
});

multiCardActor.graphics.use(multiCardSheet.sprites[0]);
game.add(multiCardActor);

var rand = new ex.Random(1337);
var cloudSprite = cloud.toSprite();
for (var i = 0; i < 100; i++) {
  var clouds = new ex.Actor({
    name: 'cloud',
    pos: ex.vec(400 + i * rand.floating(100, 300), -rand.floating(0, 300)),
    z: -10
  });
  clouds.graphics.use(cloudSprite);
  var parallax = new ex.ParallaxComponent(ex.vec(rand.floating(.5, .9), .5));
  clouds.addComponent(parallax);

  clouds.vel.x = -10;
  game.add(clouds);
}

var spriteFontSheet = ex.SpriteSheet.fromImageSource({
  image: spriteFontImage,
  grid: {
    rows: 3,
    columns: 16,
    spriteWidth: 16,
    spriteHeight: 16
  }
});

var spriteFont = new ex.SpriteFont({
  alphabet: '0123456789abcdefghijklmnopqrstuvwxyz,!\'&."?- ',
  caseInsensitive: true,
  spriteSheet: spriteFontSheet
});

var spriteText = new ex.Text({
  text: 'Sprite Text 💖',
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

var text = new ex.Text({
  text: 'This is raster text ❤️',
  font: new ex.Font({ size: 30 })
});
// text.showDebug = true;
var ran = new ex.Random(1337);

var canvasGraphic = new ex.Canvas({
  width: 200,
  height: 200,
  cache: true,
  draw: (ctx: CanvasRenderingContext2D) => {
    const color = new ex.Color(ran.integer(0, 255), ran.integer(0, 255), ran.integer(0, 255));
    ctx.fillStyle = color.toRGBA();
    ctx.fillRect(0, 0, 100, 100);
  }
});

var group = new ex.GraphicsGroup({
  members: [
    {
      graphic: newSprite,
      offset: ex.vec(0, 0)
    },
    {
      graphic: newSprite,
      offset: ex.vec(50, 0)
    },
    {
      graphic: newSprite,
      offset: ex.vec(0, 50)
    },
    {
      graphic: text,
      offset: ex.vec(100, 20)
    },
    {
      graphic: circle,
      offset: ex.vec(50, 50)
    },
    {
      graphic: anim,
      offset: ex.vec(200, 200)
    },
    {
      graphic: cardAnimation,
      offset: ex.vec(0, 200)
    },
    {
      graphic: spriteText,
      offset: ex.vec(300, 200)
    }
  ]
});

heart.graphics.add(group);
heart.pos = ex.vec(10, 10);
game.add(heart);

var label = new ex.Label({text: 'Test Label', x: 200, y: 200});
game.add(label);

var testSpriteLabel = new ex.Label({text: 'Test Sprite Label', x: 200, y: 100, spriteFont: spriteFont});
game.add(testSpriteLabel);


var pointer = new ex.Actor({
  width: 25,
  height: 25,
  color: ex.Color.Red
});
game.add(pointer);
var otherPointer = new ex.ScreenElement({
  width: 15,
  height: 15,
  color: ex.Color.Blue
});
var pagePointer = document.getElementById('page') as HTMLDivElement;
otherPointer.anchor.setTo(.5, .5);
game.add(otherPointer);
// game.input.pointers.primary.on('move', (ev) => {
//    pointer.pos = ev.worldPos;
//    otherPointer.pos = game.screen.worldToScreenCoordinates(ev.worldPos);
//    let pagePos = game.screen.screenToPageCoordinates(otherPointer.pos);
//    pagePointer.style.left = pagePos.x + 'px';
//    pagePointer.style.top = pagePos.y + 'px';
// });

game.input.pointers.primary.on('wheel', (ev) => {
  pointer.pos.setTo(ev.x, ev.y);
  game.currentScene.camera.zoom += (ev.deltaY / 1000);
  game.currentScene.camera.zoom = ex.clamp(game.currentScene.camera.zoom, .05, 100);
})
// Turn on debug diagnostics
game.showDebug(false);
var blockSprite = new ex.Sprite({
  image: imageBlocks,
  destSize: {
    width: 65,
    height: 49
  }
});
blockSprite.tint = ex.Color.Blue;
otherPointer.get(ex.TransformComponent).z = 100;
otherPointer.graphics.use(blockSprite);
// Create spritesheet
//var spriteSheetRun = new ex.SpriteSheet(imageRun, 21, 1, 96, 96);
var spriteSheetRun = ex.SpriteSheet.fromImageSource({
  image: imageRun,
  grid: {
    rows: 1,
    columns: 21,
    spriteHeight: 96,
    spriteWidth: 96
  }
});
//var spriteSheetJump = new ex.SpriteSheet(imageJump, 21, 1, 96, 96);
var spriteSheetJump = ex.SpriteSheet.fromImageSource({
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
  spriteTiles = new ex.SpriteSheet({sprites: [ex.Sprite.from(imageBlocks)] });

var blockGroup = ex.CollisionGroupManager.create('ground');
// create a collision map
// var tileMap = new ex.TileMap(100, 300, tileBlockWidth, tileBlockHeight, 4, 500);
var tileMap = new ex.TileMap({
  name: 'tilemap', 
  pos: ex.vec(-300, 300),
  tileWidth: tileBlockWidth,
  tileHeight: tileBlockHeight,
  rows: 4,
  columns: 500 
});
tileMap.get(ex.BodyComponent).group = blockGroup;
// tileMap.get(ex.TransformComponent).coordPlane = ex.CoordPlane.Screen;
var blocks = ex.Sprite.from(imageBlocks);
// var flipped = spriteTiles.sprites[0].clone();
// flipped.flipVertical = true;
// var blockAnim = new ex.Animation({
//   frames: [
//     { graphic: spriteTiles.sprites[0], duration: 200 },
//     { graphic: flipped, duration: 200 }
//   ]
// })
tileMap.tiles.forEach(function(cell: ex.Tile) {
  cell.solid = true;
  cell.addGraphic(spriteTiles.sprites[0]);
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
var color = new ex.Color(Math.random() * 255, Math.random() * 255, Math.random() * 255);
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
  block.body.collisionType = ex.CollisionType.Fixed;
  //var block = new ex.Actor(currentX, 350 + Math.random() * 100, tileBlockWidth, tileBlockHeight, color);
  //block.collisionType = ex.CollisionType.Fixed;
  block.body.group = blockGroup;
  block.graphics.add(blockSprite);

  game.add(block);
}

var platform = new ex.Actor({x: 400, y: 300, width: 200, height: 50, color: new ex.Color(0, 200, 0)});
platform.graphics.add(new ex.Rectangle({ color: new ex.Color(0, 200, 0), width: 200, height: 50 }));
platform.body.collisionType = ex.CollisionType.Fixed;
platform.body.group = blockGroup;
platform.actions.repeatForever(ctx => ctx.moveTo(200, 300, 100).moveTo(600, 300, 100).moveTo(400, 300, 100));
game.add(platform);

var platform2 = new ex.Actor({x: 800, y: 300, width: 200, height: 20, color: new ex.Color(0, 0, 140)});
platform2.graphics.add(new ex.Rectangle({ color: new ex.Color(0, 0, 140), width: 200, height: 20 }));
platform2.body.collisionType = ex.CollisionType.Fixed;
platform2.body.group = blockGroup;
platform2.actions.repeatForever(ctx => ctx.moveTo(2000, 300, 100).moveTo(2000, 100, 100).moveTo(800, 100, 100).moveTo(800, 300, 100));
game.add(platform2);

var platform3 = new ex.Actor({x: -200, y: 400, width: 200, height: 20, color: new ex.Color(50, 0, 100)});
platform3.graphics.add(new ex.Rectangle({ color: new ex.Color(50, 0, 100), width: 200, height: 20 }));
platform3.body.collisionType = ex.CollisionType.Fixed;
platform3.body.group = blockGroup;
platform3.actions.repeatForever(ctx => ctx.moveTo(-200, 800, 300).moveTo(-200, 400, 50).delay(3000).moveTo(-200, 300, 800).moveTo(-200, 400, 800));
game.add(platform3);

var platform4 = new ex.Actor({x: 75, y: 300, width: 100, height: 50, color: ex.Color.Azure});
platform4.graphics.add(new ex.Rectangle({ color: ex.Color.Azure, width: 100, height: 50 }));
platform4.body.collisionType = ex.CollisionType.Fixed;
platform4.body.group = blockGroup;
game.add(platform4);

// Test follow api
var follower = new ex.Actor({x: 50, y: 100, width: 20, height: 20, color: ex.Color.Black});
follower.graphics.add(new ex.Rectangle({ color: ex.Color.Black, width: 20, height: 20 }));
follower.body.collisionType = ex.CollisionType.PreventCollision;
game.add(follower);

// Create the player
var player = new ex.Actor({
  name: 'player',
  pos: new ex.Vector(100, -200),
  collider: ex.Shape.Capsule(32, 96),
  collisionType: ex.CollisionType.Active
});
player.onPostUpdate = (engine) => {
  var hits = engine.currentScene.physics.rayCast(new ex.Ray(player.pos, ex.Vector.Down), {
    maxDistance: 100,
    collisionGroup: blockGroup,
    searchAllColliders: false
  });
  // console.log(hits);
}
// player.graphics.onPostDraw = (ctx) => {
//   ctx.drawLine(ex.Vector.Zero, ex.Vector.Down.scale(100), ex.Color.Red, 2);
// }
player.body.canSleep = false;
player.graphics.copyGraphics = false;
follower.actions
  .meet(player, 60)
  .toPromise()
  .then(() => {
    console.log('Player met!!');
  });

player.onCollisionStart = (_a,_b,_c, contact) => {
  console.log('start', contact);
}
player.onCollisionEnd = (_a,_b) => {
  console.log('end');
}

// follow player

player.rotation = 0;
player.on('collisionstart', () => {
  console.log('collision start');
});

player.on('collisionend', (e) => {
  console.log('collision end', e.other.collider);
});

// Health bar example
var healthbar = new ex.Actor({
  name: 'player healthbar',
  x: 0,
  y: -70,
  width: 140,
  height: 5,
  color: new ex.Color(0, 255, 0)});
player.addChild(healthbar);
player.onPostUpdate = () => {
  ex.Debug.drawLine(
    player.pos,
    player.pos.add(ex.Vector.Down.scale(100)), {
      color: ex.Color.Red
    });
  ex.Debug.drawPoint(player.pos, {
    size: 1,
    color: ex.Color.Violet
  });
  ex.Debug.drawCircle(player.pos, 100, {
    color: ex.Color.Transparent,
    strokeColor: ex.Color.Black,
    width: 1
  });
  ex.Debug.drawBounds(player.collider.bounds, { color: ex.Color.Yellow });
}
// player.onPostDraw = (ctx: CanvasRenderingContext2D) => {
//   ctx.fillStyle = 'red';
//   ctx.fillRect(0, 0, 100, 100);
// };
// player.graphics.onPostDraw = (ctx: ex.ExcaliburGraphicsContext) => {
//   // ctx.debug.drawLine(ex.vec(0, 0), ex.vec(200, 0));
//   // ctx.debug.drawPoint(ex.vec(0, 0), { size: 20, color: ex.Color.Black });
// };

class OtherActor extends ex.Actor {
  constructor(args: ex.ActorArgs) {
    super(args);
  }
  onCollisionStart(self: ex.Collider, other: ex.Collider, side: ex.Side, contact: ex.CollisionContact): void {
    console.log('other collision start')
  }
  onCollisionEnd(self: ex.Collider, other: ex.Collider): void {
    console.log('other collision end')
  }
}

var other = new OtherActor({
  name: 'other',
  pos: new ex.Vector(200, -200),
  width: 100,
  height: 100,
  color: ex.Color.Violet,
  collisionType: ex.CollisionType.Active
});

game.add(other);

var healthbar2 = new ex.Rectangle({
  width: 140,
  height: 5,
  color: new ex.Color(0, 255, 0)
});

var playerText = new ex.Text({
  text: 'A long piece of text is long',
  font: new ex.Font({
    size: 20,
    family: 'Times New Roman'
  })
});

var group = new ex.GraphicsGroup({
  members: [
    { graphic: healthbar2, offset: ex.vec(0, -70)},
    { graphic: playerText, offset: ex.vec(0, -70)}
  ]
})
healthbar.graphics.use(group);

// var backgroundLayer = player.graphics.layers.create({
//   name: 'background',
//   order: -1
// });

// backgroundLayer.show(healthbar2, { offset: ex.vec(0, -70) });

// // playerText.showDebug = true;
// backgroundLayer.show(playerText, { offset: ex.vec(0, -70) });

// Retrieve animations for player from sprite sheet
var left = ex.Animation.fromSpriteSheet(spriteSheetRun, ex.range(1, 10), 50);
// var left = new ex.Animation(game, left_sprites, 50);
var right = left.clone(); // spriteSheetRun.getAnimationBetween(game, 1, 11, 50);
right.flipHorizontal = true;
var idle = ex.Animation.fromSpriteSheet(spriteSheetRun, [0], 200); // spriteSheetRun.getAnimationByIndices(game, [0], 200);
//idle.anchor.setTo(.5, .5);
var jumpLeft = ex.Animation.fromSpriteSheet(
  spriteSheetJump,
  ex.range(0, 10).reverse(),
  100,
  ex.AnimationStrategy.Freeze
); // spriteSheetJump.getAnimationBetween(game, 0, 11, 100);
var jumpRight = ex.Animation.fromSpriteSheet(spriteSheetJump, ex.range(11, 21), 100, ex.AnimationStrategy.Freeze); // spriteSheetJump.getAnimationBetween(game, 11, 22, 100);
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
  if (game.input.keyboard.isHeld(ex.Keys.Left)) {
    direction = -1;
    if (!inAir) {
      player.graphics.use(Animations.Left);
    }
    if (inAir) {
      player.vel.x = -airSpeed;
      return;
    }
    player.vel.x = -groundSpeed;
  } else if (game.input.keyboard.isHeld(ex.Keys.Right)) {
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

  if (game.input.keyboard.isHeld(ex.Keys.Up)) {
    if (!inAir) {
      player.vel.y = -jumpSpeed;
      inAir = true;
      if (direction === 1) {
        player.graphics.use<ex.Animation>(Animations.JumpRight).reset();
      } else {
        player.graphics.use<ex.Animation>(Animations.JumpLeft).reset();
      }
      jump.play();
    }
  }
});

game.input.keyboard.on('up', (e?: ex.KeyEvent) => {
  if (inAir) return;

  if (e.key === ex.Keys.Left || e.key === ex.Keys.Right) {
    player.graphics.use(Animations.Idle);
  }
});

player.on('pointerdown', (e?: ex.PointerEvent) => {
  // alert('Player clicked!');
});
player.on('pointerdown', () => {
  console.log('pointer down');
});
player.on('pointerup', () => {
  console.log('pointer up');
});
player.on('pointermove', () => {
  //console.log('pointer over');
});
player.on('pointerleave', () => {
  console.log('pointer exit');
});
player.on('pointerenter', () => {
  console.log('pointer enter');
});
player.on('pointerwheel', () => {
  console.log('pointer wheel');
});

var newScene = new ex.Scene();
newScene.backgroundColor = ex.Color.Yellow;
newScene.add(new ex.Label({text: 'MAH LABEL!', x: 200, y: 100}));
newScene.on('activate', (evt?: ex.ActivateEvent) => {
  console.log('activate newScene');
});

newScene.on('deactivate', (evt?: ex.DeactivateEvent) => {
  console.log('deactivate newScene');
});
newScene.on('foo', (ev: ex.GameEvent<any>) => {});

game.addScene('label', newScene);

game.input.keyboard.on('down', (keyDown?: ex.KeyEvent) => {
  if (keyDown.key === ex.Keys.F) {
    var a = new ex.Actor({x: player.pos.x + 10, y: player.pos.y - 50, width: 10, height: 10, color: new ex.Color(222, 222, 222)});
    a.vel.x = 200 * direction;
    a.vel.y = 0;
    a.body.collisionType = ex.CollisionType.Active;
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
  } else if (keyDown.key === ex.Keys.U) {
    game.goToScene('label');
  } else if (keyDown.key === ex.Keys.I) {
    game.goToScene('root');
  }
});

var isColliding = false;
player.on('postcollision', (data: ex.PostCollisionEvent) => {
  if (data.side === ex.Side.Bottom) {
    isColliding = true;

    if (inAir) {
      player.graphics.use(Animations.Idle);
    }
    inAir = false;
    if (
      data.other &&
      !(
        game.input.keyboard.isHeld(ex.Keys.Left) ||
        game.input.keyboard.isHeld(ex.Keys.Right) ||
        game.input.keyboard.isHeld(ex.Keys.Up) ||
        game.input.keyboard.isHeld(ex.Keys.Down)
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

game.input.keyboard.on('down', (keyDown?: ex.KeyEvent) => {
  if (keyDown.key === ex.Keys.B) {
    var block = new ex.Actor({x: currentX, y: 350, width: 44, height: 50, color: color});
    currentX += 46;
    block.graphics.add(blockAnimation);
    game.add(block);
  }
  if (keyDown.key === ex.Keys.D) {
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
  particleSprite: blockSprite,
  particleRotationalVelocity: Math.PI / 10,
  randomRotation: true
});
const original = (ex.ParticleEmitter.prototype as any)._createParticle;
(ex.ParticleEmitter.prototype as any)._createParticle = function () {
  const particle = original.call(this);
  particle.graphics.onPostDraw = () => {};
  return particle;
}
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
        }).start()
      );
    }
  }
});

game.add(trigger);

game.input.pointers.primary.on('down', (evt: ex.PointerEvent) => {
  var c = tileMap.getTileByPoint(evt.worldPos);
  if (c) {
    if (c.solid) {
      c.solid = false;
      c.clearGraphics();
    } else {
      c.solid = true;
      c.addGraphic(spriteTiles.sprites[0]);
    }
  }
});

game.input.keyboard.on('up', (evt?: ex.KeyEvent) => {
  if (evt.key == ex.Keys.F) {
    jump.play();
  }
  if (evt.key == ex.Keys.S) {
    jump.stop();
  }
});

// Add camera to game
game.currentScene.camera.strategy.lockToActorAxis(player, ex.Axis.X);
game.currentScene.camera.y = 200;

// Run the mainloop
game.start(boot).then(() => {
  logger.info('All Resources have finished loading');
});