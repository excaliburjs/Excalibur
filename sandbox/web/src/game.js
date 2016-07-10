/// <reference path='../../../dist/excalibur.d.ts' />
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
var game = new ex.Engine(800, 600, 'game');
game.setAntialiasing(false);
var heartTex = new ex.Texture('../images/heart.png');
var imageRun = new ex.Texture('../images/PlayerRun.png');
var imageJump = new ex.Texture('../images/PlayerJump.png');
var imageBlocks = new ex.Texture('../images/BlockA0.png');
var spriteFontImage = new ex.Texture('../images/SpriteFont.png');
var jump = new ex.Sound('../sounds/jump.wav', '../sounds/jump.mp3');
var template = new ex.Template('healthbar.tmpl');
jump.setVolume(.3);
var loader = new ex.Loader();
loader.addResource(heartTex);
loader.addResource(imageRun);
loader.addResource(imageJump);
loader.addResource(imageBlocks);
loader.addResource(spriteFontImage);
loader.addResource(jump);
// Set background color
game.backgroundColor = new ex.Color(114, 213, 224);
// Add some UI
var heart = new ex.UIActor(0, 0, 20, 20);
heart.scale.setTo(2, 2);
heart.addDrawing(heartTex.asSprite());
game.add(heart);
// Turn on debug diagnostics
game.isDebug = false;
var blockSprite = new ex.Sprite(imageBlocks, 0, 0, 65, 49);
// Create spritesheet
var spriteSheetRun = new ex.SpriteSheet(imageRun, 21, 1, 96, 96);
var spriteSheetJump = new ex.SpriteSheet(imageJump, 21, 1, 96, 96);
var tileBlockWidth = 64, tileBlockHeight = 48, spriteTiles = new ex.SpriteSheet(imageBlocks, 1, 1, tileBlockWidth, tileBlockHeight);
// create a collision map
var tileMap = new ex.TileMap(100, 300, tileBlockWidth, tileBlockHeight, 4, 500);
tileMap.registerSpriteSheet("default", spriteTiles);
tileMap.data.forEach(function (cell) {
    cell.solid = true;
    cell.pushSprite(new ex.TileSprite("default", 0));
});
game.add(tileMap);
// Create spriteFont
var spriteFont = new ex.SpriteFont(spriteFontImage, '0123456789abcdefghijklmnopqrstuvwxyz,!\'&."?- ', true, 16, 3, 16, 16);
var label = new ex.Label('Hello World', 100, 100, null, spriteFont);
label.scaleTo(2, 2, .5, .5).scaleTo(1, 1, .5, .5).repeatForever();
game.addChild(label);
// Retrieve animations for blocks from sprite sheet
var blockAnimation = spriteTiles.getSprite(0).clone();
blockAnimation.addEffect(new ex.Effects.Grayscale());
// Animation 'enum' to prevent 'stringly' typed misspelling errors
var Animations;
(function (Animations) {
    Animations[Animations["Block"] = 0] = "Block";
    Animations[Animations["Idle"] = 1] = "Idle";
    Animations[Animations["Left"] = 2] = "Left";
    Animations[Animations["Right"] = 3] = "Right";
    Animations[Animations["JumpRight"] = 4] = "JumpRight";
    Animations[Animations["JumpLeft"] = 5] = "JumpLeft";
})(Animations || (Animations = {}));
var currentX = 0;
// Create the level
for (var i = 0; i < 36; i++) {
    currentX = tileBlockWidth * i + 10;
    var color = new ex.Color(Math.random() * 255, Math.random() * 255, Math.random() * 255);
    var block = new ex.Actor(currentX, 350 + Math.random() * 100, tileBlockWidth, tileBlockHeight, color);
    block.collisionType = ex.CollisionType.Fixed;
    block.addCollisionGroup('ground');
    block.addDrawing(Animations.Block, blockAnimation);
    game.add(block);
}
var platform = new ex.Actor(400, 300, 200, 50, new ex.Color(0, 200, 0));
platform.collisionType = ex.CollisionType.Fixed;
platform.moveTo(200, 300, 100).moveTo(600, 300, 100).moveTo(400, 300, 100).repeatForever();
game.add(platform);
var platform2 = new ex.Actor(800, 300, 200, 20, new ex.Color(0, 0, 140));
platform2.collisionType = ex.CollisionType.Fixed;
platform2.moveTo(2000, 300, 100).moveTo(2000, 100, 100).moveTo(800, 100, 100).moveTo(800, 300, 100).repeatForever();
game.add(platform2);
var platform3 = new ex.Actor(-200, 400, 200, 20, new ex.Color(50, 0, 100));
platform3.collisionType = ex.CollisionType.Fixed;
platform3.moveTo(-200, 800, 300).moveTo(-200, 400, 50).delay(3000).moveTo(-200, 300, 800).moveTo(-200, 400, 800).repeatForever();
game.add(platform3);
var platform4 = new ex.Actor(200, 200, 100, 50, ex.Color.Azure);
platform4.collisionType = ex.CollisionType.Fixed;
platform4.moveBy(75, 300, .20);
game.add(platform4);
// Test follow api
var follower = new ex.Actor(50, 100, 20, 20, ex.Color.Black);
follower.collisionType = ex.CollisionType.PreventCollision;
game.add(follower);
// Create the player
var player = new ex.Actor(100, -200, 32, 96);
player.enableCapturePointer = true;
player.collisionType = ex.CollisionType.Active;
follower.meet(player, 60).asPromise().then(function () {
    console.log("Player met!!");
});
// follow player
player.scale.setTo(1, 1);
player.rotation = 0;
// Health bar example
var healthbar = new ex.Actor(0, -70, 140, 5, new ex.Color(0, 255, 0));
player.add(healthbar);
// Add Title above player
var playerLabel = new ex.Label('My Player', -70, -69, null, spriteFont);
player.add(playerLabel);
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
player.on('update', function () {
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
    }
    else if (game.input.keyboard.isHeld(ex.Input.Keys.Right)) {
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
            }
            else {
                player.setDrawing(Animations.JumpLeft);
            }
            jumpSound.play();
        }
    }
});
game.input.keyboard.on('up', function (e) {
    if (inAir)
        return;
    if (e.key === ex.Input.Keys.Left ||
        e.key === ex.Input.Keys.Right) {
        player.setDrawing(Animations.Idle);
    }
});
player.on('pointerdown', function (e) {
    alert("Player clicked!");
});
var newScene = new ex.Scene();
newScene.add(new ex.Label("MAH LABEL!", 200, 100));
//newScene.onActivate = function(){
//   console.log('activated newScene');
//};
//newScene.onDeactivate = function(){
//   console.log('deactivated newScene');
//};
newScene.on('activate', function (evt) {
    console.log('activate newScene');
});
newScene.on('deactivate', function (evt) {
    console.log('deactivate newScene');
});
game.addScene('label', newScene);
game.input.keyboard.on('down', function (keyDown) {
    if (keyDown.key === ex.Input.Keys.F) {
        var a = new ex.Actor(player.pos.x + 10, player.pos.y - 50, 10, 10, new ex.Color(222, 222, 222));
        a.vel.x = 200 * direction;
        a.vel.y = 0;
        a.collisionType = ex.CollisionType.Active;
        var inAir = true;
        a.on('collision', function (data) {
            inAir = false;
            //a.dx = data.other.dx;
            //a.dy = data.other.dy;
            //a.kill();
        });
        a.on('update', function (data) {
            if (inAir) {
                a.acc.y = 400; // * data.delta/1000;
            }
            else {
                a.acc.y = 0;
            }
            inAir = true;
        });
        game.addChild(a);
    }
    else if (keyDown.key === ex.Input.Keys.U) {
        game.goToScene('label');
    }
    else if (keyDown.key === ex.Input.Keys.I) {
        game.goToScene('root');
    }
});
var isColliding = false;
player.on('collision', function (data) {
    if (data.side === ex.Side.Bottom) {
        isColliding = true;
        if (inAir) {
            //console.log("Collided on bottom with inAir", inAir);
            player.setDrawing(Animations.Idle);
        }
        inAir = false;
        if (data.other && !(game.input.keyboard.isHeld(ex.Input.Keys.Left) || game.input.keyboard.isHeld(ex.Input.Keys.Right) || game.input.keyboard.isHeld(ex.Input.Keys.Up) || game.input.keyboard.isHeld(ex.Input.Keys.Down))) {
        }
        if (!data.other) {
        }
    }
    if (data.side === ex.Side.Top) {
        if (data.other) {
            player.vel.y = data.other.vel.y - player.vel.y;
        }
        else {
            player.vel.y = 0;
        }
    }
});
player.on('update', function (data) {
    // apply gravity if player is in the air
    // only apply gravity when not colliding
    if (!isColliding) {
        data.target.acc.setTo(0, 800); // * data.delta/1000;
    }
    else {
        data.target.acc.setTo(0, 0);
    }
    // Reset values because we don't know until we check the next update
    // inAir = true;
    isColliding = false;
    //console.log("Player Pos", player.x, player.y, player.getWidth(), player.getHeight());
});
player.on('initialize', function (evt) {
    console.log("Player initialized", evt.engine);
});
game.input.keyboard.on('down', function (keyDown) {
    if (keyDown.key === ex.Input.Keys.B) {
        var block = new ex.Actor(currentX, 350, 44, 50, color);
        currentX += 46;
        block.addDrawing(Animations.Block, blockAnimation);
        game.addChild(block);
    }
    if (keyDown.key === ex.Input.Keys.D) {
        game.isDebug = !game.isDebug;
    }
});
var paused = false;
game.on('p', function () {
    if (!paused) {
        game.stop();
    }
    else {
        game.start();
    }
    paused != paused;
});
// Create a camera to track the player
var camera = new ex.LockedCamera();
camera.setActorToFollow(player);
// camera.shake(5, 5, 1000);
// camera.zoom(0.5);
// camera.zoom(1.5, 10000);
// Add player to game is synonymous with adding a player to the current scene
game.add(player);
// Add particle emitter
var emitter = new ex.ParticleEmitter(100, 300, 2, 2);
emitter.minVel = 417;
emitter.maxVel = 589;
emitter.minAngle = Math.PI;
emitter.maxAngle = Math.PI * 2;
emitter.isEmitting = false;
emitter.emitRate = 494;
emitter.opacity = 0.84;
emitter.fadeFlag = true;
emitter.particleLife = 2465;
emitter.maxSize = 1.5;
emitter.minSize = .1;
emitter.acceleration = new ex.Vector(0, 460);
emitter.beginColor = ex.Color.Red;
emitter.endColor = ex.Color.Yellow;
emitter.particleSprite = blockSprite.clone();
emitter.particleSprite.anchor = new ex.Vector(.5, .5);
emitter.particleRotationalVelocity = Math.PI / 10;
emitter.randomRotation = true;
emitter.particleSprite.addEffect(new ex.Effects.Grayscale());
//emitter.acceleration = new ex.Vector(0, -400);
//emitter.particleSprite = spriteTiles.getSprite(0);
//emitter.focus = new ex.Vector(0, -100);
//emitter.focusAccel = 800;
game.add(emitter);
//emitter.follow(player, 20);
var exploding = false;
var trigger = new ex.Trigger(400, 200, 100, 100, function () {
    if (!exploding) {
        exploding = true;
        emitter.isEmitting = true;
        camera.shake(10, 10, 2000);
        game.addTimer(new ex.Timer(function () {
            emitter.isEmitting = false;
            exploding = false;
        }, 2000));
    }
});
trigger.repeats = -1;
trigger.target = player;
game.add(trigger);
game.input.pointers.primary.on('down', function (evt) {
    var c = tileMap.getCellByPoint(evt.x, evt.y);
    if (c) {
        if (c.solid) {
            c.solid = false;
            c.sprites.pop();
        }
        else {
            c.solid = true;
            c.pushSprite(new ex.TileSprite("default", 0));
        }
    }
    //logger.info("Collides", tileMap.collidesPoint(evt.x, evt.y));
    //emitter.focus = new ex.Vector(evt.x - emitter.x, evt.y - emitter.y);
});
game.input.keyboard.on('up', function (evt) {
    if (evt.key == ex.Input.Keys.F) {
        jump.play();
    }
    if (evt.key == ex.Input.Keys.S) {
        jump.stop();
    }
});
// Add camera to game
game.currentScene.camera = camera;
// Run the mainloop
var binding;
game.start(loader).then(function () {
    logger.info("All Resources have finished loading");
    //binding = new ex.Binding("container", template, emitter);
    //binding.listen(emitter, ["update"]);
});
