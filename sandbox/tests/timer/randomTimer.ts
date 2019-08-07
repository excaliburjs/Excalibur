/// <reference path="../../lib/excalibur.d.ts" />


var game = new ex.Engine({
    canvasElementId: 'game',
    width: 600,
    height: 400
});

let rcount: number = 0;
let rcallback = () => { count++; console.log(count) };
let rtimer: ex.Timer = ex.Timer.RandomTimer(rcallback, 1, 5000, true, 20);
game.add(timer);
game.start();