/// <reference path="../../lib/excalibur.d.ts" />


var game = new ex.Engine({
    canvasElementId: 'game',
    width: 600,
    height: 400
});
let count: number = 0;
let callback = () => { count++; console.log(count)};
let timer: ex.Timer = new ex.Timer(callback, 3000, true, 10);
game.add(timer);
game.start();