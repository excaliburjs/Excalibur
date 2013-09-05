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

game.addChild(new Actor(400, 300, 200,50,new Color(0,0,0)));

game.addChild(new Actor(600, 230, 200,30, new Color(0,0,0)));


// Create the player
var player = new Actor(100,100,35,50);
player.ay = 20;

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



player.addEventListener(Keys[Keys.LEFT], (data)=>{
   player.dx = -70;
   player.playAnimation(Animations.Left);
});

player.addEventListener(Keys[Keys.RIGHT], (data)=>{
   player.dx = 70;
   player.playAnimation(Animations.Right);
});

var inAir = false;
player.addEventListener(Keys[Keys.UP], (data)=>{
   if(!inAir){
      player.dy = -500;
      inAir = true;
   }
});

player.addEventListener(EventType[EventType.COLLISION], (data)=>{
   logger.log("COLLISION", Log.DEBUG);
   if(data.y > 0){
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