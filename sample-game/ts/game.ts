/// <reference path='../../build/Excalibur.d.ts' />

var logger = ex.Logger.getInstance();
logger.defaultLevel = ex.LogLevel.Debug;

// Create an the game container
var game = new ex.Engine(800, 600, 'game');
game.setAntialiasing(false);

var imageRun = new ex.Texture('../images/PlayerRun.png');
var imageJump = new ex.Texture('../images/PlayerJump.png');
var imageBlocks = new ex.Texture('../images/BlockA0.png');
var spriteFontImage = new ex.Texture('../images/SpriteFont.png');
var jump = new ex.Sound('../sounds/jump.wav', '../sounds/jump.mp3');
jump.setVolume(.3);

var loader = new ex.Loader();
loader.addResource(imageRun);
loader.addResource(imageJump);
loader.addResource(imageBlocks);
loader.addResource(spriteFontImage);
loader.addResource(jump);


// Set background color
game.backgroundColor = new ex.Color(114,213,224);

// Turn on debug diagnostics
game.isDebug = false;

// Create spritesheet
var spriteSheetRun = new ex.SpriteSheet(imageRun, 21, 1, 96, 96);
var spriteSheetJump = new ex.SpriteSheet(imageJump, 21, 1, 96, 96);
var tileBlockWidth = 64,
    tileBlockHeight = 48,
    spriteTiles = new ex.SpriteSheet(imageBlocks, 1, 1, tileBlockWidth, tileBlockHeight);

// Create spriteFont
var spriteFont = new ex.SpriteFont(spriteFontImage, '0123456789abcdefghijklmnopqrstuvwxyz,!\'&."?- ', true, 16, 3, 16, 16);
var label = new ex.Label('Hello World', 100, 100, null, spriteFont);
label.scaleTo(2, .5).scaleTo(1,.5).repeatForever();
game.addChild(label);

// Retrieve animations for blocks from sprite sheet
var blockAnimation = spriteTiles.getSprite(0);
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
// Create the level
for(var i = 0; i< 36; i++){
   currentX = tileBlockWidth * i + 10;
   var color = new ex.Color(Math.random() * 255, Math.random() * 255, Math.random() * 255);
   var block = new ex.Actor(currentX, 350 + Math.random() * 100, tileBlockWidth, tileBlockHeight, color);

   block.addCollisionGroup('ground');
   block.addDrawing(Animations.Block, blockAnimation);
   
   game.addChild(block);
}

var platform = new ex.Actor(400, 300, 200,50, new ex.Color(0,200,0));
platform.moveTo(200, 300, 100).moveTo(600, 300, 100).moveTo(400, 300, 100).repeatForever();
game.addChild(platform);

var platform2 = new ex.Actor(800, 300, 200,20, new ex.Color(0,0,140));
platform2.moveTo(2000, 300, 100).moveTo(2000, 100, 100).moveTo(800, 100, 100).moveTo(800, 300, 100).repeatForever();
game.addChild(platform2);

var platform3 = new ex.Actor(-200, 400, 200, 20, new ex.Color(50, 0, 100));
platform3.moveTo(-200, 800, 300).moveTo(-200, 400, 50).delay(3000).moveTo(-200, 300, 800).moveTo(-200, 400, 800).repeatForever();
game.addChild(platform3);

var platform4 = new ex.Actor(200, 200, 100, 50, ex.Color.Azure);
platform4.moveBy(75, 300, .20);
game.addChild(platform4);

// Test follow api
var follower = new ex.Actor(50, 100, 20, 20, ex.Color.Black);
follower.preventCollisions = true;
game.addChild(follower);


// Create the player
var player = new ex.Actor(100,100,32,96);
player.addCollisionGroup('ground');
follower.meet(player, 60);

// follow player

player.scale = 1;
player.rotation = 0;
player.fixed = false;

// Health bar example
player.addChild(new ex.Actor(-48, -20, 140, 5, new ex.Color(0,255,0)));

// Add Title above player
var playerLabel = new ex.Label('My Player', -48, -39, null, spriteFont);

player.addChild(playerLabel);

// Retrieve animations for player from sprite sheet
var left = spriteSheetRun.getAnimationBetween(game, 1, 11, 50);
var right = spriteSheetRun.getAnimationBetween(game, 1, 11, 50);
right.flipHorizontal = true;
var idle = spriteSheetRun.getAnimationByIndices(game, [0], 200);
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
player.setCenterDrawing(true);

var jumpSound = jump.sound;


var inAir = true;
var groundSpeed = 150;
var airSpeed = 130;
var jumpSpeed = 500;
var direction = 1;
player.addEventListener('left', ()=>{
   direction = -1;
   if (!inAir) {
      player.setDrawing(Animations.Left);
   }
   if(inAir){
      player.dx = -airSpeed;
      return;
   }
   player.dx = -groundSpeed;

   // TODO: When platform is moving in same direction, add its dx
});

player.addEventListener('right', ()=>{
   direction = 1;
   if (!inAir) {
      player.setDrawing(Animations.Right);
   }
   if(inAir){
      player.dx = airSpeed;
      return;
   }
   player.dx = groundSpeed;

   // TODO: When platform is moving in same direction, add its dx
});

player.addEventListener('up', ()=>{
   if(!inAir){
      player.dy -= jumpSpeed;
      inAir = true;
      if (direction === 1) {
         player.setDrawing(Animations.JumpRight);
      } else {
         player.setDrawing(Animations.JumpLeft);
      }
      jumpSound.play();
   }
});

player.addEventListener('mousedown', ()=>{
   alert("player clicked!");
});

player.addEventListener('keyup', (e? : ex.KeyUp) => {
   if (inAir) return;
   
   if (e.key === ex.InputKey.Left ||
       e.key === ex.InputKey.Right) {
      player.setDrawing(Animations.Idle);
   }
});

player.addEventListener('touchstart', ()=> {
   alert("player touched!");
});

var newScene = new ex.Scene();
newScene.addChild(new ex.Label("MAH LABEL!", 200, 100));
newScene.onActivate = function(){
   console.log('activated newScene');
};
newScene.onDeactivate = function(){
   console.log('deactivated newScene');
};
game.addScene('label', newScene);

game.addEventListener('keydown', (keyDown? : ex.KeyDown)=>{
   if(keyDown.key === ex.InputKey.F){
      var a = new ex.Actor(player.x+10, player.y-50, 10, 10, new ex.Color(222,222,222));
      a.dx = 200*direction;
      a.dy = 0;
      a.preventCollisions = true;
      a.fixed = false;
      var inAir = true;
      a.addEventListener('collision', (data?: ex.CollisionEvent)=>{
         inAir = false;
         a.dx = data.other.dx;
         a.dy = data.other.dy;
         a.kill();
      });
      a.addEventListener('update', (data?: ex.UpdateEvent)=>{
         if(inAir){
            a.dy += 400 * data.delta/1000;
         }
         inAir = true;
      });
      game.addChild(a);
   }else if(keyDown.key === ex.InputKey.U){
      game.goToScene('label');
   }else if(keyDown.key === ex.InputKey.I){
      game.goToScene('root');
   }
});

var isColliding = false;
player.addEventListener('collision', (data?: ex.CollisionEvent)=>{   
       
   if(data.side === ex.Side.BOTTOM){
      isColliding = true;

      if (inAir) {
        //console.log("Collided on bottom with inAir", inAir);
        player.setDrawing(Animations.Idle);
      }
      inAir = false;
      player.dx = data.other.dx;
      player.dy = data.other.dy;      
   }

   if(data.side === ex.Side.TOP){
      player.dy = data.other.dy - player.dy;
   }
});

player.addEventListener('update', (data?: ex.UpdateEvent)=>{
   // apply gravity if player is in the air
   // only apply gravity when not colliding
   if(!isColliding){
      data.target.dy += 800 * data.delta/1000;
   }

   // Reset values because we don't know until we check the next update
   // inAir = true;
   isColliding = false;

   //console.log("Player Pos", player.x, player.y, player.getWidth(), player.getHeight());
});

game.addEventListener('keydown', (keyDown? : ex.KeyDown)=>{
   if(keyDown.key === ex.InputKey.B){
      var block = new ex.Actor(currentX,350,44,50,color);
      currentX += 46;
      block.addDrawing(Animations.Block, blockAnimation);
      game.addChild(block);
   }
});

var paused = false;
game.addEventListener('p', ()=>{
   if(!paused){
      game.stop();
   }else{
      game.start();
   }
   paused != paused;
});


game.addEventListener('keydown', (keyDown? : ex.KeyDown)=>{

   if(keyDown.key === ex.InputKey.D){
      game.isDebug = !game.isDebug;
   }
});


// Create a camera to track the player
var camera = new ex.SideCamera(game);
camera.setActorToFollow(player);
// camera.shake(5, 5, 1000);
// camera.zoom(0.5);
// camera.zoom(1.5, 10000);

// Add player to game is synonymous with adding a player to the current scene
game.addChild(player);

// Add particle emitter
var emitter = new ex.ParticleEmitter(100, 300, 2, 2);
emitter.minVel = 417;
emitter.maxVel = 589;
emitter.minAngle = Math.PI;
emitter.maxAngle = Math.PI*2;
emitter.isEmitting = false;
emitter.emitRate = 494;
emitter.opacity = 0.84;
emitter.fade = true;
emitter.particleLife = 2465;
emitter.maxSize = 10;
emitter.minSize = 1;
emitter.acceleration = new ex.Vector(0, 460);
emitter.beginColor = ex.Color.Red;
emitter.endColor = ex.Color.Yellow;
//emitter.acceleration = new ex.Vector(0, -400);
//emitter.particleSprite = spriteTiles.getSprite(0);
//emitter.focus = new ex.Vector(0, -100);
//emitter.focusAccel = 800;
game.addChild(emitter);

//emitter.follow(player, 20);

var exploding = false;
var trigger = new ex.Trigger(400, 200, 100, 100, ()=>{
   if(!exploding){
      exploding = true;
      emitter.isEmitting = true;
      camera.shake(10, 10, 2000);
      game.addTimer(new ex.Timer(()=>{
         emitter.isEmitting = false;
         exploding = false;
      }, 2000));
   }   
});

trigger.repeats = -1;
trigger.target = player;

game.addChild(trigger);

game.addEventListener('mousedown', (evt? : ex.MouseDown)=>{
   logger.info(evt.x + ", " +evt.y);
   emitter.focus = new ex.Vector(evt.x - emitter.x, evt.y - emitter.y);
});

game.addEventListener('keyup', (evt?: ex.KeyUp)=>{
   if(evt.key == ex.InputKey.F){
      jump.play();
   }
});

game.addEventListener('keyup', (evt?: ex.KeyUp)=>{
   if(evt.key == ex.InputKey.S){
      jump.stop();
   }
});


// Add camera to game
game.camera = camera;

// Run the mainloop
game.start(loader).then(()=>{
   logger.info("All Resources have finished loading");
});