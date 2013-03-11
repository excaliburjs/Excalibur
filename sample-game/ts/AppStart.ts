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

// Create an the game container
var game = new Core.SimpleGame(1000,500,true, new Core.Color(114,213,224) );


// Create the level
for(var i = 0; i< 36; i++){
	var color = new Core.Color(Math.random()*255,Math.random()*255,Math.random()*255);
	game.addBlock(new Core.Block(50*i+10,350+Math.random()*100,50,50,color));
}

game.addBlock(new Core.Block(400, 300, 200,50,new Core.Color(0,0,0)));

game.addBlock(new Core.Block(600, 230, 200,30,new Core.Color(0,0,0)));


// Create the player
var player = new Core.Player(100,100,35,50);

// Create a physics system for the player
var physics = new Core.SideScrollerPhysics(player, game);
physics.setGravity(2.0);

// Top down physics system
//var physics = new Core.TopDownPhysics(player, game);
//physics.setFriction(.1);

// Add physics system to player
player.setPhysicsSystem(physics);
//player.setPhysicsSystem(physics);

// Create spritesheet
var spriteSheet = new Drawing.SpriteSheet('../images/TestPlayer.png', 10, 1, 44,50);

// Retrieve animations
var left = spriteSheet.getAnimationForRow(0, 8, 2, .2);
var right = spriteSheet.getAnimationForRow(0, 3, 2, .2);
var idle = spriteSheet.getAnimationForRow(0, 0, 3, .2);

// Add animations to player
player.addAnimation("left", left);
player.addAnimation("right", right);
player.addAnimation("idle", idle);

// Set default animation
player.playAnimation("idle");

// Create key handlers
player.addKeyHandler(["up","w"], 
   function(p:Core.Player){
      player.playAnimation("idle");
      var system  = player.getPhysicsSystem();
      if(system.isGround()){
         p.dy = -20;
         system.setGround(false);
      }        
   });

player.addKeyHandler(["left","a"], 
   function(p:Core.Player){
      p.dx -= 3;
      player.playAnimation("left");
   });

player.addKeyHandler(["right","d"], 
   function(p:Core.Player){
      p.dx += 3;
      player.playAnimation("right");
   });

player.addKeyHandler(["down", "s"],
   function(p:Core.Player){
      p.dy += 3;
   });

// Create a camera to track the player
var camera = new Camera.SideCamera();
camera.setActorToFollow(player);

// Add player to game
game.addActor(player);

// Add camera to game
game.addCamera(camera);

// Run the mainloop
game.start();