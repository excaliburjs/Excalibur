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
logger.defaultLevel = 0 /* Debug */;

// Create an the game container
var game = new ex.Engine(800, 600, 'game');
game.setAntialiasing(false);

var imageRun = new ex.Texture('../images/PlayerRun.png');
var imageJump = new ex.Texture('../images/PlayerJump.png');
var imageBlocks = new ex.Texture('../images/BlockA0.png');
var spriteFontImage = new ex.Texture('../images/SpriteFont.png');
var jump = new ex.Sound('../sounds/jump.wav', '../sounds/jump.mp3');
var template = new ex.Template('healthbar.tmpl');
jump.setVolume(.3);

var loader = new ex.Loader();
loader.addResource(imageRun);
loader.addResource(imageJump);
loader.addResource(imageBlocks);
loader.addResource(spriteFontImage);
loader.addResource(jump);

// Set background color
game.backgroundColor = new ex.Color(114, 213, 224);

// Turn on debug diagnostics
game.isDebug = false;

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

for (var i = 0; i < 36; i++) {
    currentX = tileBlockWidth * i + 10;
    var color = new ex.Color(Math.random() * 255, Math.random() * 255, Math.random() * 255);
    var block = new ex.Actor(currentX, 350 + Math.random() * 100, tileBlockWidth, tileBlockHeight, color);
    block.collisionType = 4 /* Fixed */;
    block.addCollisionGroup('ground');
    block.addDrawing(0 /* Block */, blockAnimation);

    game.add(block);
}

var platform = new ex.Actor(400, 300, 200, 50, new ex.Color(0, 200, 0));
platform.collisionType = 4 /* Fixed */;
platform.moveTo(200, 300, 100).moveTo(600, 300, 100).moveTo(400, 300, 100).repeatForever();
game.add(platform);

var platform2 = new ex.Actor(800, 300, 200, 20, new ex.Color(0, 0, 140));
platform2.collisionType = 4 /* Fixed */;
platform2.moveTo(2000, 300, 100).moveTo(2000, 100, 100).moveTo(800, 100, 100).moveTo(800, 300, 100).repeatForever();
game.add(platform2);

var platform3 = new ex.Actor(-200, 400, 200, 20, new ex.Color(50, 0, 100));
platform3.collisionType = 4 /* Fixed */;
platform3.moveTo(-200, 800, 300).moveTo(-200, 400, 50).delay(3000).moveTo(-200, 300, 800).moveTo(-200, 400, 800).repeatForever();
game.add(platform3);

var platform4 = new ex.Actor(200, 200, 100, 50, ex.Color.Azure);
platform4.collisionType = 4 /* Fixed */;
platform4.moveBy(75, 300, .20);
game.add(platform4);

// Test follow api
var follower = new ex.Actor(50, 100, 20, 20, ex.Color.Black);
follower.collisionType = 0 /* PreventCollision */;
game.add(follower);

// Create the player
var player = new ex.Actor(100, -200, 32, 96);
follower.meet(player, 60);

// follow player
player.scaleX = 1;
player.scaleY = 1;
player.rotation = 0;

// Health bar example
var healthbar = new ex.Actor(0, -70, 140, 5, new ex.Color(0, 255, 0));
player.addChild(healthbar);

// Add Title above player
var playerLabel = new ex.Label('My Player', -70, -69, null, spriteFont);

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
player.addDrawing(2 /* Left */, left);
player.addDrawing(3 /* Right */, right);
player.addDrawing(1 /* Idle */, idle);
player.addDrawing(4 /* JumpRight */, jumpRight);
player.addDrawing(5 /* JumpLeft */, jumpLeft);

// Set default animation
player.setDrawing(1 /* Idle */);
player.setCenterDrawing(true);

var jumpSound = jump.sound;

var inAir = true;
var groundSpeed = 150;
var airSpeed = 130;
var jumpSpeed = 500;
var direction = 1;

var moveLeft = function () {
    direction = -1;
    if (!inAir) {
        player.setDrawing(2 /* Left */);
    }
    if (inAir) {
        player.dx = -airSpeed;
        return;
    }
    player.dx = -groundSpeed;
    // TODO: When platform is moving in same direction, add its dx
};

var moveRight = function () {
    direction = 1;
    if (!inAir) {
        player.setDrawing(3 /* Right */);
    }
    if (inAir) {
        player.dx = airSpeed;
        return;
    }
    player.dx = groundSpeed;
    // TODO: When platform is moving in same direction, add its dx
};

var moveJump = function () {
    if (!inAir) {
        player.dy -= jumpSpeed;
        inAir = true;
        if (direction === 1) {
            player.setDrawing(4 /* JumpRight */);
        } else {
            player.setDrawing(5 /* JumpLeft */);
        }
        jumpSound.play();
    }
};

var resetToIdle = function (e) {
    if (inAir)
        return;

    if (e.key === 37 /* Left */ || e.key === 39 /* Right */) {
        player.setDrawing(1 /* Idle */);
    }
};

player.addEventListener('left', moveLeft);
player.addEventListener('right', moveRight);
player.addEventListener('up', moveJump);

player.addEventListener('mousedown', function (e) {
    var button = "";
    if (e.mouseEvent.button == 0 /* Left */) {
        button = "Left";
    } else if (e.mouseEvent.button == 1 /* Middle */) {
        button = "Middle";
    } else if (e.mouseEvent.button == 2 /* Right */) {
        button = "Right";
    }
    alert("Player clicked with " + button + " button!");
});

player.addEventListener('keyup', resetToIdle);

player.addEventListener('touchstart', function (e) {
    alert("player touched!");
});

// touch movement
var touchGoRight = false;
game.addEventListener('touchstart', function () {
    touchGoRight = true;
});
game.addEventListener('touchend', function () {
    touchGoRight = false;

    moveJump();

    if (inAir)
        return;

    player.setDrawing(1 /* Idle */);
});

var newScene = new ex.Scene();
newScene.add(new ex.Label("MAH LABEL!", 200, 100));

//newScene.onActivate = function(){
//   console.log('activated newScene');
//};
//newScene.onDeactivate = function(){
//   console.log('deactivated newScene');
//};
newScene.addEventListener('activate', function (evt) {
    console.log('activate newScene');
});

newScene.addEventListener('deactivate', function (evt) {
    console.log('deactivate newScene');
});

game.addScene('label', newScene);

game.addEventListener('keydown', function (keyDown) {
    if (keyDown.key === 70 /* F */) {
        var a = new ex.Actor(player.x + 10, player.y - 50, 10, 10, new ex.Color(222, 222, 222));
        a.dx = 200 * direction;
        a.dy = 0;
        a.collisionType = 3 /* Elastic */;
        var inAir = true;
        a.addEventListener('collision', function (data) {
            inAir = false;
            //a.dx = data.other.dx;
            //a.dy = data.other.dy;
            //a.kill();
        });
        a.addEventListener('update', function (data) {
            if (inAir) {
                a.ay = 400; // * data.delta/1000;
            } else {
                a.ay = 0;
            }
            inAir = true;
        });
        game.addChild(a);
    } else if (keyDown.key === 85 /* U */) {
        game.goToScene('label');
    } else if (keyDown.key === 73 /* I */) {
        game.goToScene('root');
    }
});

var isColliding = false;
player.addEventListener('collision', function (data) {
    if (data.side === 2 /* Bottom */) {
        isColliding = true;

        if (inAir) {
            //console.log("Collided on bottom with inAir", inAir);
            player.setDrawing(1 /* Idle */);
        }
        inAir = false;
        if (data.other && !(game.isKeyPressed(37 /* Left */) || game.isKeyPressed(39 /* Right */) || game.isKeyPressed(38 /* Up */) || game.isKeyPressed(40 /* Down */))) {
            player.dx = data.other.dx;
            player.dy = data.other.dy;
        }

        if (!data.other) {
            player.dx = 0;
            player.dy = 0;
        }
    }

    if (data.side === 1 /* Top */) {
        if (data.other) {
            player.dy = data.other.dy - player.dy;
        } else {
            player.dy = 0;
        }
    }
});

player.addEventListener('update', function (data) {
    // apply gravity if player is in the air
    // only apply gravity when not colliding
    if (!isColliding) {
        data.target.ay = 800; // * data.delta/1000;
    } else {
        data.target.ay = 0;
    }

    if (touchGoRight) {
        moveRight();
    }

    // Reset values because we don't know until we check the next update
    // inAir = true;
    isColliding = false;
    //console.log("Player Pos", player.x, player.y, player.getWidth(), player.getHeight());
});

player.addEventListener('initialize', function (evt) {
    console.log("Player initialized", evt.engine);
});

game.addEventListener('keydown', function (keyDown) {
    if (keyDown.key === 66 /* B */) {
        var block = new ex.Actor(currentX, 350, 44, 50, color);
        currentX += 46;
        block.addDrawing(0 /* Block */, blockAnimation);
        game.addChild(block);
    }
});

var paused = false;
game.addEventListener('p', function () {
    if (!paused) {
        game.stop();
    } else {
        game.start();
    }
    paused != paused;
});

game.addEventListener('keydown', function (keyDown) {
    if (keyDown.key === 68 /* D */) {
        game.isDebug = !game.isDebug;
    }
});

// Create a camera to track the player
var camera = new ex.TopCamera(game);
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
emitter.maxSize = 10;
emitter.minSize = 1;
emitter.acceleration = new ex.Vector(0, 460);
emitter.beginColor = ex.Color.Red;
emitter.endColor = ex.Color.Yellow;

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

game.addEventListener('mousedown', function (evt) {
    var c = tileMap.getCellByPoint(evt.x, evt.y);
    if (c) {
        if (c.solid) {
            c.solid = false;
            c.sprites.pop();
        } else {
            c.solid = true;
            c.pushSprite(new ex.TileSprite("default", 0));
        }
    }
    //logger.info("Collides", tileMap.collidesPoint(evt.x, evt.y));
    //emitter.focus = new ex.Vector(evt.x - emitter.x, evt.y - emitter.y);
});

game.addEventListener('keyup', function (evt) {
    if (evt.key == 70 /* F */) {
        jump.play();
    }
});

game.addEventListener('keyup', function (evt) {
    if (evt.key == 83 /* S */) {
        jump.stop();
    }
});

// Add camera to game
game.camera = camera;

// Run the mainloop
var binding;
game.start(loader).then(function () {
    logger.info("All Resources have finished loading");
    //binding = new ex.Binding("container", template, emitter);
    //binding.listen(emitter, ["update"]);
});
//# sourceMappingURL=game.js.map
