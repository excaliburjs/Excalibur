![Logo](/assets/excalibur-title-dark.png?raw=true)

[![Build Status](https://travis-ci.org/excaliburjs/Excalibur.png?branch=master)](https://travis-ci.org/excaliburjs/Excalibur)

Excalibur is a simple game engine written in TypeScript for making 2D games in HTML5 Canvas. The goal of Excalibur is  to demonstrate the capabilities of TypeScript and to illustrate game development to new developers.

Documentation can be found at [excaliburjs.com](http://excaliburjs.com).

Compiled examples can be found [here](http://excaliburjs.com/gallery/home/).

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

* Sprite sheet support
* Naive collision detection
* Event handling
* Automation layer for actors
* Sublime Text 2 project

# Contributing

Please view the [Contributing guidelines](CONTRIBUTING.md).


# License

Excalibur is open source and operates under the 2 clause BSD license:

	Copyright (c) 2013, Erik Onarheim
	All rights reserved.
	
	Redistribution and use in source and binary forms, with or without
	modification, are permitted provided that the following conditions are met: 
	
	1. Redistributions of source code must retain the above copyright notice, this
	   list of conditions and the following disclaimer. 
	2. Redistributions in binary form must reproduce the above copyright notice,
	   this list of conditions and the following disclaimer in the documentation
	   and/or other materials provided with the distribution. 
	
	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
	ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
	WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
	DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
	ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
	(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
	LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
	ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
	SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	
	The views and conclusions contained in the software and documentation are those
	of the authors and should not be interpreted as representing official policies, 
	either expressed or implied, of the FreeBSD Project.
