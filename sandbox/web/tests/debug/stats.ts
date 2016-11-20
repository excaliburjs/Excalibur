/// <reference path='../../excalibur.d.ts' />

var game = new ex.Engine({ width: 500, height: 500 });
var historicFrameStats = new Array(10);

var updateStat = function (id, stat) {
   document.getElementById(id).innerHTML = stat;
};

var avg = function<T>(arr: Array<T>, prop: string) {
   var sum = 0;
   var i = 0;
   
   for (var item of arr) {
      if (item && typeof item[prop] === 'number') {
         i++;
         sum = sum + item[prop];
      }
   }

   if (i === 0) {
      return 0;
   }

   return sum / i;
};

var timer = 1000;
game.on('postframe', (ev: ex.PostFrameEvent) => {

   // set historic stats
   historicFrameStats[ev.stats.id % 11] = ev.stats;

   timer -= ev.stats.delta;

   updateStat('debug-frame-delta', ev.stats.delta);
   updateStat('debug-frame-fps', Math.floor(ev.stats.fps));

   if (timer <= 0) {
      updateStat('debug-frame-delta-avg', Math.floor(avg(historicFrameStats, 'delta')));
      updateStat('debug-frame-fps-avg', Math.floor(avg(historicFrameStats, 'fps')));
      timer = 1000;
   }
   updateStat('debug-frame-duration-total', ev.stats.duration.total);
   updateStat('debug-frame-duration-draw', ev.stats.duration.draw);
   updateStat('debug-frame-duration-update', ev.stats.duration.update);

   updateStat('debug-frame-actors-total', ev.stats.actors.total);
   updateStat('debug-frame-actors-alive', ev.stats.actors.alive);
   updateStat('debug-frame-actors-killed', ev.stats.actors.killed);
   updateStat('debug-frame-actors-remaining', ev.stats.actors.remaining);
   updateStat('debug-frame-actors-ui', ev.stats.actors.ui);
});

game.add(new ex.Actor(50, 50, 50, 50, ex.Color.Red));
game.add(new ex.UIActor(0, 0, 50, 50));

game.start();