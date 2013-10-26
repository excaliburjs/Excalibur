/**
Copyright (c) 2013 Erik Onarheim
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
1. Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.
3. All advertising materials mentioning features or use of this software
   must display the following acknowledgement:
   This product includes software developed by the GameTS Team.
4. Neither the name of the creator nor the
   names of its contributors may be used to endorse or promote products
   derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE GAMETS TEAM ''AS IS'' AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE GAMETS TEAM BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/// <reference path='../../js/Excalibur.d.ts' />

// Create screen appender 
var screenAppender = new ScreenAppender();
var logger = Logger.getInstance();
logger.defaultLevel = Log.DEBUG;
logger.addAppender(screenAppender);


// Create an the game container
var game = new Engine();

// Set background color
game.backgroundColor = new Color(114,213,224);

// Turn on debug diagnostics
game.isDebug = false;

// Create spritesheet
var spriteSheet = new Drawing.SpriteSheet('../images/TestPlayer.png', 12, 1, 44,50);

// Create spriteFont
var spriteFont = new Drawing.SpriteFont('../images/SpriteFont.png', '0123456789abcdefghijklmnopqrstuvwxyz,!\'&."?- ', true, 16, 3, 16, 16);
var label = new Label('Hello World', 100, 100, spriteFont);
label.scaleTo(2, .5).scaleTo(1,.5).repeatForever();
game.addChild(label);

// Retrieve animations for blocks from sprite sheet
var blockAnimation = spriteSheet.getAnimationByIndices(game, [10], 200);
blockAnimation.loop = true;
// Animation 'enum' to prevent 'stringly' typed misspelling errors
enum Animations {
   Block,
   Idle,
   Left,
   Right
}

var currentX = 0;
// Create the level
for(var i = 0; i< 36; i++){
   currentX = 46*i+10;
   var color = new Color(Math.random()*255,Math.random()*255,Math.random()*255);
   var block = new Actor(currentX,350+Math.random()*100,44,50,color);
   
   block.addAnimation(Animations.Block, blockAnimation);
   block.playAnimation(Animations.Block);
   
   game.addChild(block);
}

var platform = new Actor(400, 300, 200,50,new Color(0,200,0));
platform.moveTo(200, 300, 100).moveTo(600, 300, 100).moveTo(400, 300, 100).repeatForever();
game.addChild(platform);

var platform2 = new Actor(800, 300, 200,20, new Color(0,0,140));
platform2.moveTo(2000, 300, 100).moveTo(2000, 100, 100).moveTo(800, 100, 100).moveTo(800, 300, 100).repeatForever();
game.addChild(platform2);

var platform3 = new Actor(-200, 400, 200, 20, new Color(50, 0, 100));
platform3.moveTo(-200, 800, 300).moveTo(-200, 400, 50).delay(3000).moveTo(-200, 300, 800).moveTo(-200, 400, 800).repeatForever();
game.addChild(platform3);

var platform4 = new Actor(200, 200, 100, 50, Color.Azure);
platform4.moveBy(75, 300, .20);
game.addChild(platform4);


// Create the player
var player = new Actor(100,100,44,50);
player.scale = 1;
player.rotation = 0;
player.solid = false;

// Health bar example
player.addChild(new Actor(-14.5, -20, 70, 5, new Color(0,255,0)));

// Add Title above player
var playerLabel = new Label('My Player', -14.5, -39, spriteFont);

player.addChild(playerLabel);

// Retrieve animations for player from sprite sheet
var left = spriteSheet.getAnimationByIndices(game, [8, 9], 200);
var right = spriteSheet.getAnimationByIndices(game, [3, 4], 200);
var idle = spriteSheet.getAnimationByIndices(game, [0, 1, 2], 200);
left.loop = true;
right.loop = true;
idle.loop = true;


// Add animations to player
player.addAnimation(Animations.Left, left); 
player.addAnimation(Animations.Right, right);
player.addAnimation(Animations.Idle, idle);

// Set default animation
player.playAnimation(Animations.Idle);


var jumpSound = new Media.Sound("../sounds/smb_jump-small.wav");


var inAir = true;
var groundSpeed = 90;
var airSpeed = 90;
var jumpSpeed = 500;
var direction = 1;
player.addEventListener('left', ()=>{
   direction = -1;
   player.playAnimation(Animations.Left);
   if(inAir){
      player.dx = -airSpeed;
      return;
   }
   player.dx += -groundSpeed;
});

player.addEventListener('right', ()=>{
   direction = 1;
   player.playAnimation(Animations.Right);
   if(inAir){
      player.dx = airSpeed;
      return;
   }
   player.dx += groundSpeed;
});

player.addEventListener('up', ()=>{
   if(!inAir){
      player.dy -= jumpSpeed;
      inAir = true;
      player.playAnimation(Animations.Idle);
      jumpSound.play();
   }
});

game.addEventListener('keyDown', (keyDown? : KeyDown)=>{
   if(keyDown.key === Keys.F){
      var a = new Actor(player.x+10, player.y-50, 10, 10, new Color(222,222,222));
      a.dx = 200*direction;
      a.dy = 0;
      a.solid = false;
      var inAir = true;
      a.addEventListener('collision', (data?: CollisionEvent)=>{
         inAir = false;
         a.dx = data.other.dx;
         a.dy = data.other.dy;
      });
      a.addEventListener('update', (data?: UpdateEvent)=>{
         if(inAir){
            a.dy += 400 * data.delta/1000;
         }
         inAir = true;
      });
      game.addChild(a);
   }
});

player.addEventListener('collision', (data?: CollisionEvent)=>{   
   if(data.side === Side.BOTTOM){
      inAir = false;
      player.dx = data.other.dx;
      player.dy = data.other.dy;
   }

   if(data.side === Side.TOP){
      player.dy = data.other.dy - player.dy;
   }
});

player.addEventListener('update', (data?: UpdateEvent)=>{
   if(inAir){
      player.dy += 800 * data.delta/1000;
   }
   inAir = true;
});

game.addEventListener('keydown', (keyDown? : KeyDown)=>{
   if(keyDown.key === Keys.B){
      var block = new Actor(currentX,350,44,50,color);
      currentX += 46;
      block.addAnimation(Animations.Block, blockAnimation);
      block.playAnimation(Animations.Block);
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


game.addEventListener('keydown', (keyDown? : KeyDown)=>{

   if(keyDown.key === Keys.D){
      game.isDebug = !game.isDebug;
   }
});

game.addEventListener('blur', ()=>{
   game.stop();
});

game.addEventListener('focus', ()=>{
   game.start();
});

// Create a camera to track the player
var camera = new Camera.SideCamera();
camera.setActorToFollow(player);

// Add player to game is synonymous with adding a player to the current scene
game.addChild(player);

// Add camera to game
game.camera = camera;

// Run the mainloop
game.start();