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
var game = new Core.SimpleGame(1000, 500, true);
// Set background color
game.setBackgroundColor(new Core.Color(0, 0, 0));
// Set fps
game.setFps(60);
// Turn on debug diagnostics
game.setDebug(true);
// Implement planetary physics
var PlanetaryPhysics = (function () {
    function PlanetaryPhysics() {
        this.actors = [];
    }
    PlanetaryPhysics.prototype.addActor = function (actor) {
        this.actors.push(actor);
        actor.setPhysicsSystem(this);
    };
    PlanetaryPhysics.prototype.removeActor = function (actor) {
        var index = this.actors.indexOf(actor);
        this.actors.splice(index, 1);
    };
    PlanetaryPhysics.prototype.getProperty = function (key) {
        return false;
    };
    PlanetaryPhysics.prototype.setProperty = function (key, value) {
    };
    PlanetaryPhysics.prototype.gravity = function (a, b) {
        var dx = a.getX() - b.getX();
        var dy = a.getY() - b.getY();
        var distance = Math.sqrt(dx * dx + dy * dy);
        return 1.0 / (distance * distance);
    };
    PlanetaryPhysics.prototype.clamp = function (val, min, max) {
        if(val > max) {
            return max;
        }
        if(val < min) {
            return min;
        }
        return val;
    };
    PlanetaryPhysics.prototype.update = function (delta) {
        for(var i = 0; i < this.actors.length; i++) {
            var actor1 = this.actors[i];
            // j=i+1 will update the upper diagonal
            for(var j = 0; j < this.actors.length; j++) {
                var actor2 = this.actors[j];
                var dx = Math.abs(actor2.getX() - actor1.getX());
                var dy = Math.abs(actor2.getY() - actor1.getY());
                var distance = Math.sqrt(dx * dx + dy * dy);
                if(distance > 0.02) {
                    var force = 1 / (distance * distance);
                    var ux = (actor1.getX() - actor2.getX()) / distance;
                    var uy = (actor1.getY() - actor2.getY()) / distance;
                    // dampen velocity
                    //actor2.setDx(this.clamp(actor2.getDx(),-4,4));
                    //actor2.setDy(this.clamp(actor2.getDy(),-4,4));
                    actor2.setAx(this.clamp(actor2.getAx(), -5, 5));
                    actor2.setAy(this.clamp(actor2.getAy(), -5, 5));
                    actor2.setAx(actor2.getAx() + ux * force);
                    actor2.setAy(actor2.getAy() + uy * force);
                }
            }
        }
    };
    return PlanetaryPhysics;
})();
// Create physics
var physics = new PlanetaryPhysics();
var camera = new Camera.TopCamera();
// Create the level
for(var i = 0; i < 10; i++) {
    for(var j = 0; j < 10; j++) {
        var color = new Core.Color(Math.random() * 255, Math.random() * 255, Math.random() * 255);
        var block = new Core.Block(100 + i * 100, 100 + j * 100, 15, 15, color);
        if(i % 2 == 0) {
        } else {
        }
        //camera.setActorToFollow(block);
        game.addActor(block);
        physics.addActor(block);
    }
}
/*
for(var i = 0; i < 400; i++){
var b = new Core.Block(240, 240, 50, 50, new Core.Color(255,255,0));
game.addActor(b);
physics.addActor(b);
camera.setActorToFollow(b);
}*/
//game.addCamera(camera);
// Add physics system to the game
game.addPhysics(physics);
// Run the mainloop
game.start();
