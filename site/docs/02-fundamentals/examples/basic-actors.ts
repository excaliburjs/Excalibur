const basicPlayer = new ex.Actor({
  name: 'player', // optionally assign a name
  width: 50,
  height: 50,
  color: ex.Color.Red,
  pos: new ex.Vector(100, 100)
});

// move the player
basicPlayer.vel.x = 15;

// add player to game
game.add(basicPlayer);