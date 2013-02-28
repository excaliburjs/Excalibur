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
var game = new Engine.SimpleGame(1000,500,true, new Engine.Color(114,213,224) );


// Create the level
for(var i = 0; i< 16; i++){
	var color = new Engine.Color(Math.random()*255,Math.random()*255,Math.random()*255);
	game.addBlock(new Engine.Block(50*i+10,350+Math.random()*100,50,50,color));
}

game.addBlock(new Engine.Block(400, 200, 200,50,new Engine.Color(0,0,0)));

game.addBlock(new Engine.Block(600, 130, 200,30,new Engine.Color(0,0,0)));

// Create the player
var player = new Engine.Player(100,100,44,50);

// Create spritesheet
var spriteSheet = new Drawing.SpriteSheet('../images/TestPlayer.png', 10, 1, 44,50);

// Retrieve animation
var animation = spriteSheet.getAnimationForRow(0, .2);
animation.setScale(1.0);


player.addAnimation("test", animation);

player.playAnimation("test");

// Create key handlers
player.addKeyHandler("up", 
   function(p:Engine.Player){
      if(p.onGround){
         p.dy = -20;
         p.onGround = false;
      }        
   });

player.addKeyHandler("left", 
   function(p:Engine.Player){
         p.dx -= 6;
   });

player.addKeyHandler("right", 
   function(p:Engine.Player){
         p.dx += 6;
   });

game.addActor(player);

// Run the mainloop
game.start();