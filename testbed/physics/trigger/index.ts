import * as ex from '../../../build/dist/';

const game = new ex.Engine({
  width: 400,
  height: 400
});

game.toggleDebug();

const PlayerGroup = ex.CollisionGroupManager.create('player');

const player = new ex.Actor({
  name: 'player',
  pos: ex.vec(0, 100),
  width: 16,
  height: 16,
  collisionType: ex.CollisionType.Active,
  collisionGroup: PlayerGroup,
  color: ex.Color.Red
});

player.vel.x = 10;

export const doorTrigger = new ex.Trigger({
  width: 16,
  height: 16,
  pos: ex.vec(100, 100),
  repeat: -1,
  action: () => {
    console.log('triggered');
  },
});
doorTrigger.body.group = PlayerGroup;// ex.CollisionGroup.collidesWith([PlayerGroup]);

game.start().then(() => {
  game.currentScene.add(player);
  game.currentScene.add(doorTrigger);
});