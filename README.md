![Logo](/assets/icon.png?raw=true)

# Excalibur

[![Build Status](https://travis-ci.org/eonarheim/Excalibur.png?branch=master)](https://travis-ci.org/eonarheim/Excalibur)

Excalibur is a simple game engine written in TypeScript for making 2D games in HTML5 Canvas. The goal of Excalibur is create a simple engine to demonstrate the capabilities of TypeScript and to illustrate simple game development to new developers.

A compiled example can be found [here.](http://www.erikonarheim.com/sample-game/html/index.html)

## Example in JavaScript

```js
// Create an the game container
var game = new Engine();

// Create new actor at X=50, Y=50, Width=100, and Height= 100
var player = new Actor(50, 50, 100, 100, new Color(0,200,0));

player.addEventListener('up', function(){
	player.dy = -50;
});

player.addEventListener('down', function(){
	player.dy = 50;
});

game.addChild(player);
game.start();

```

## Example in TypeScript

```js
/// <reference path='Engine.d.ts' />
// Create an the game container
var game = new Engine();

// Create new actor at X=50, Y=50, Width=100, and Height= 100
var player = new Actor(50, 50, 100, 100, new Color(0,200,0));

player.addEventListener("up", ()=>{
	player.dy = -50;
});

player.addEventListener("down", ()=>{
	player.dy = 50;
});

game.addChild(player);
game.start();

```

# Features

* Sprite Sheet Support
* Naive collision detection
* Event handling
* Automation layer for actors
* Sublime Text 2 Project

# Contributing

Please view the [Contributing guidelines](Contributing.md).


# License

Excalibur is open source and operates under a variant of the BSD license:

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
	   This product includes software developed by the Excalibur Team.
	4. Neither the name of the creator nor the
	   names of its contributors may be used to endorse or promote products
	   derived from this software without specific prior written permission.

	THIS SOFTWARE IS PROVIDED BY THE EXCALIBUR TEAM ''AS IS'' AND ANY
	EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
	WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
	DISCLAIMED. IN NO EVENT SHALL THE EXCALIBUR TEAM BE LIABLE FOR ANY
	DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
	ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
	SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
