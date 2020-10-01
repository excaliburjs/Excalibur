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

// Create an the game container
var game = new ex.Engine({
  width: 800,
  height: 600,
  antialiasing: false,
  canvasElementId: 'game',
  suppressHiDPIScaling: false,
  suppressPlayButton: true
});
game.showDebug(true);

var heartTex = new ex.Texture('../images/heart.png');
var imageRun = new ex.Texture('../images/PlayerRun.png');
var imageJump = new ex.Texture('../images/PlayerJump.png');
var imageBlocks = new ex.Texture('../images/BlockA0.png');
var spriteFontImage = new ex.Texture('../images/SpriteFont.png');
var jump = new ex.Sound('../sounds/jump.wav', '../sounds/jump.mp3');

jump.volume = 0.3;

var loader = new ex.Loader();
loader.addResource(heartTex);
loader.addResource(imageRun);
loader.addResource(imageJump);
loader.addResource(imageBlocks);
loader.addResource(spriteFontImage);
loader.addResource(jump);

// Set background color
game.backgroundColor = new ex.Color(114, 213, 224);

// setup physics defaults
ex.Physics.checkForFastBodies = true;
ex.Physics.acc = new ex.Vector(0, 800); // global accel

// Add some UI
//var heart = new ex.ScreenElement(0, 0, 20, 20);
var heart = new ex.ScreenElement({ x: 0, y: 0, width: 20 * 2, height: 20 * 2 });
var heartSprite = heartTex.asSprite();
heartSprite.scale.setTo(2, 2);
heart.addDrawing(heartSprite);
game.add(heart);

// Turn on debug diagnostics
game.showDebug(false);
//var blockSprite = new ex.Sprite(imageBlocks, 0, 0, 65, 49);
var blockSprite = new ex.Sprite({
  image: imageBlocks,
  x: 0,
  y: 0,
  width: 65,
  height: 49
});
// Create spritesheet
//var spriteSheetRun = new ex.SpriteSheet(imageRun, 21, 1, 96, 96);
var spriteSheetRun = new ex.SpriteSheet({
  image: imageRun,
  columns: 21,
  rows: 1,
  spWidth: 96,
  spHeight: 96
});
//var spriteSheetJump = new ex.SpriteSheet(imageJump, 21, 1, 96, 96);
var spriteSheetJump = new ex.SpriteSheet({
  image: imageJump,
  columns: 21,
  rows: 1,
  spWidth: 96,
  spHeight: 96
});
var tileBlockWidth = 64,
  tileBlockHeight = 48,
  spriteTiles = new ex.SpriteSheet(imageBlocks, 1, 1, tileBlockWidth, tileBlockHeight);

// create a collision map
//var tileMap = new ex.TileMap(100, 300, tileBlockWidth, tileBlockHeight, 4, 500);
var tileMap = new ex.TileMap({ x: 100, y: 300, cellWidth: tileBlockWidth, cellHeight: tileBlockHeight, rows: 4, cols: 500 });
tileMap.registerSpriteSheet('default', spriteTiles);
tileMap.data.forEach(function(cell: ex.Cell) {
  cell.solid = true;
  cell.pushSprite(new ex.TileSprite('default', 0));
});
game.add(tileMap);

// Create spriteFont
//var spriteFont = new ex.SpriteFont(spriteFontImage, '0123456789abcdefghijklmnopqrstuvwxyz,!\'&."?- ', true, 16, 3, 16, 16);
var spriteFont = new ex.SpriteFont({
  image: spriteFontImage,
  alphabet: '0123456789abcdefghijklmnopqrstuvwxyz,!\'&."?- ',
  caseInsensitive: true,
  columns: 16,
  rows: 3,
  spWidth: 16,
  spHeight: 16
});
//var label = new ex.Label('Hello World', 100, 100, null, spriteFont);
var label = new ex.Label({
  text: 'Hello World',
  x: 100,
  y: 100,
  spriteFont: spriteFont
});
game.add(label);

// Retrieve animations for blocks from sprite sheet
var blockAnimation = spriteTiles.getSprite(0).clone();
blockAnimation.addEffect(new ex.Effects.Grayscale());
// Animation 'enum' to prevent 'stringly' typed misspelling errors
enum Animations {
  Block,
  Idle,
  Left,
  Right,
  JumpRight,
  JumpLeft
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
  block.addDrawing(Animations.Block, blockAnimation);

  game.add(block);
}

var platform = new ex.Actor(400, 300, 200, 50, new ex.Color(0, 200, 0));
platform.body.collider.type = ex.CollisionType.Fixed;
platform.actions
  .moveTo(200, 300, 100)
  .moveTo(600, 300, 100)
  .moveTo(400, 300, 100)
  .repeatForever();
game.add(platform);

var platform2 = new ex.Actor(800, 300, 200, 20, new ex.Color(0, 0, 140));
platform2.body.collider.type = ex.CollisionType.Fixed;
platform2.actions
  .moveTo(2000, 300, 100)
  .moveTo(2000, 100, 100)
  .moveTo(800, 100, 100)
  .moveTo(800, 300, 100)
  .repeatForever();
game.add(platform2);

var platform3 = new ex.Actor(-200, 400, 200, 20, new ex.Color(50, 0, 100));
platform3.body.collider.type = ex.CollisionType.Fixed;
platform3.actions
  .moveTo(-200, 800, 300)
  .moveTo(-200, 400, 50)
  .delay(3000)
  .moveTo(-200, 300, 800)
  .moveTo(-200, 400, 800)
  .repeatForever();
game.add(platform3);

var platform4 = new ex.Actor(75, 300, 100, 50, ex.Color.Azure);
platform4.body.collider.type = ex.CollisionType.Fixed;
game.add(platform4);

// Test follow api
var follower = new ex.Actor(50, 100, 20, 20, ex.Color.Black);
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

// Add Title above player
var playerLabel = new ex.Label({
  text: 'My Player',
  pos: new ex.Vector(-70, -69),
  fontFamily: 'Times New Roman'
  // spriteFont: spriteFont
});

player.add(playerLabel);

// Retrieve animations for player from sprite sheet
var left_sprites = spriteSheetRun.getAnimationBetween(game, 1, 11, 50).sprites;
var left = new ex.Animation({
  engine: game,
  speed: 50,
  sprites: left_sprites
});
// var left = new ex.Animation(game, left_sprites, 50);
var right = spriteSheetRun.getAnimationBetween(game, 1, 11, 50);
right.flipHorizontal = true;
var idle = spriteSheetRun.getAnimationByIndices(game, [0], 200);
//idle.anchor.setTo(.5, .5);
var jumpLeft = spriteSheetJump.getAnimationBetween(game, 0, 11, 100);
var jumpRight = spriteSheetJump.getAnimationBetween(game, 11, 22, 100);
left.loop = true;
right.loop = true;
idle.loop = true;

jumpRight.freezeFrame = 0;
jumpLeft.freezeFrame = 11;

// Add animations to player
player.addDrawing(Animations.Left, left);
player.addDrawing(Animations.Right, right);
player.addDrawing(Animations.Idle, idle);
player.addDrawing(Animations.JumpRight, jumpRight);
player.addDrawing(Animations.JumpLeft, jumpLeft);

// Set default animation
player.setDrawing(Animations.Idle);

var inAir = true;
var groundSpeed = 150;
var airSpeed = 130;
var jumpSpeed = 500;
var direction = 1;
player.on('postupdate', () => {
  if (game.input.keyboard.isHeld(ex.Input.Keys.Left)) {
    direction = -1;
    if (!inAir) {
      player.setDrawing(Animations.Left);
    }
    if (inAir) {
      player.vel.x = -airSpeed;
      return;
    }
    player.vel.x = -groundSpeed;
  } else if (game.input.keyboard.isHeld(ex.Input.Keys.Right)) {
    direction = 1;
    if (!inAir) {
      player.setDrawing(Animations.Right);
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
        player.setDrawing(Animations.JumpRight);
      } else {
        player.setDrawing(Animations.JumpLeft);
      }
      jump.play();
    }
  }
});

game.input.keyboard.on('up', (e?: ex.Input.KeyEvent) => {
  if (inAir) return;

  if (e.key === ex.Input.Keys.Left || e.key === ex.Input.Keys.Right) {
    player.setDrawing(Animations.Idle);
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
      player.setDrawing(Animations.Idle);
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
    block.addDrawing(Animations.Block, blockAnimation);
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
var sprite = blockSprite.clone();
sprite.anchor = new ex.Vector(0.5, 0.5);
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
  maxSize: 1.5,
  minSize: 0.1,
  acceleration: new ex.Vector(0, 460),
  beginColor: ex.Color.Red,
  endColor: ex.Color.Yellow,
  particleSprite: sprite,
  particleRotationalVelocity: Math.PI / 10,
  randomRotation: true
});
// var emitter = new ex.ParticleEmitter(100, 300, 2, 2);
// emitter.minVel = 417;
// emitter.maxVel = 589;
// emitter.minAngle = Math.PI;
// emitter.maxAngle = Math.PI * 2;
// emitter.isEmitting = false;
// emitter.emitRate = 494;
// emitter.opacity = 0.84;
// emitter.fadeFlag = true;
// emitter.particleLife = 2465;
// emitter.maxSize = 1.5;
// emitter.minSize = .1;
// emitter.acceleration = new ex.Vector(0, 460);
// emitter.beginColor = ex.Color.Red;
// emitter.endColor = ex.Color.Yellow;
// emitter.particleSprite = blockSprite.clone();
// emitter.particleSprite.anchor = new ex.Vector(.5, .5);
// emitter.particleRotationalVelocity = Math.PI / 10;
// emitter.randomRotation = true;
emitter.particleSprite.addEffect(new ex.Effects.Grayscale());

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
      c.pushSprite(new ex.TileSprite('default', 0));
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
