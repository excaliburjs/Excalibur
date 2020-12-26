/// <reference path='../../lib/excalibur.d.ts' />

var game = new ex.Engine({ width: 500, height: 500 });
ex.Physics.useRigidBodyPhysics();
ex.Physics.acc.setTo(0, 500);

var historicFrameStats = new Array(10);

var updateStat = function(id, stat) {
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
  // clone since engine reuses instances
  historicFrameStats[ev.stats.id % 11] = ev.stats.clone();

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

  updateStat('debug-frame-pairs', ev.stats.physics.pairs);
  updateStat('debug-frame-collisions', ev.stats.physics.collisions);
  updateStat('debug-frame-fastbodies', ev.stats.physics.fastBodies);
  updateStat('debug-frame-fastbodycollisions', ev.stats.physics.fastBodyCollisions);
  updateStat('debug-frame-broadphase', ev.stats.physics.broadphase);
  updateStat('debug-frame-narrowphase', ev.stats.physics.narrowphase);
});

game.add(new ex.ScreenElement(0, 0, 50, 50));

function spawnBox() {
  var box = new ex.Actor(250, 50, 50, 50, ex.Color.Red);
  box.body.collider.type = ex.CollisionType.Active;
  box.body.useBoxCollider(50, 50);
  game.add(box);
}

spawnBox();

var floor = new ex.Actor(250, 500, 500, 10, ex.Color.Green);
floor.body.collider.type = ex.CollisionType.Fixed;
floor.body.useBoxCollider(50, 50);
game.add(floor);

game.input.keyboard.on('press', (evt) => {
  if (evt.key === ex.Input.Keys.B) {
    spawnBox();
  }
});

game.start();
