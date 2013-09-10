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

/// <reference path='../../js/Engine.d.ts' />

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
game.isDebug = true;

// Create spritesheet
var spriteSheet = new Drawing.SpriteSheet('../images/TestPlayer.png', 12, 1, 44,50);

// Retrieve animations for blocks from sprite sheet
var blockAnimation = spriteSheet.getAnimationByIndices([10],.2);

// Animation 'enum' to prevent 'stringly' typed misspelling errors
enum Animations {
   Block,
   Idle,
   Left,
   Right
}


// Create the level
for(var i = 0; i< 36; i++){
	var color = new Color(Math.random()*255,Math.random()*255,Math.random()*255);
	var block = new Actor(46*i+10,350+Math.random()*100,44,50,color);
   
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
platform3.moveTo(-200, 800, 300).moveTo(-200, 400, 50).delay(3).moveTo(-200, 300, 800).moveTo(-200, 400, 800).repeatForever();
game.addChild(platform3);

var platform4 = new Actor(200, 200, 100, 50, new Color(200, 0, 100));
platform4.moveBy(75, 300, .20);
game.addChild(platform4);


// Create the player
var player = new Actor(100,100,35,50);
player.ay = 20;
player.fixed = false;

// Retrieve animations for player from sprite sheet
var left = spriteSheet.getAnimationByIndices([8, 9], .2);
var right = spriteSheet.getAnimationByIndices([3, 4], .2);
var idle = spriteSheet.getAnimationByIndices([0, 1, 2], .2);

// Add animations to player
player.addAnimation(Animations.Left, left); 
player.addAnimation(Animations.Right, right);
player.addAnimation(Animations.Idle, idle);

// Set default animation
player.playAnimation(Animations.Idle);



var inAir = true;
var groundSpeed = 90;
var airSpeed = 200;
var jumpSpeed = 500;
player.addEventListener(Keys[Keys.LEFT], (data)=>{
   if(inAir){
      player.dx += -airSpeed;
   }
   player.dx = -groundSpeed;
   player.playAnimation(Animations.Left);
});

player.addEventListener(Keys[Keys.RIGHT], (data)=>{
   if(inAir){
      player.dx += airSpeed;
   }
   player.dx = groundSpeed;
   player.playAnimation(Animations.Right);
});

player.addEventListener(Keys[Keys.UP], (data)=>{
   if(!inAir){
      player.dy = -jumpSpeed;
      inAir = true;
   }
});

player.addEventListener(EventType[EventType.COLLISION], (data)=>{
   inAir = true;
   if(data.actor == player && data.side === Side.BOTTOM){
      inAir = false;
      player.dx = 0;
   }
})

// Create a camera to track the player
var camera = new Camera.SideCamera();
camera.setActorToFollow(player);

// Add player to game
game.addChild(player);

// Add camera to game
game.camera = camera;

// Run the mainloop
game.start();