function onStart(game) {
  const player = new ex.Actor({
    name: 'player', // optionally assign a name
    width: 50,
    height: 50,
    color: ex.Color.Red
  });

  // move the player
  player.vel.x = 15;

  // add player to game
  game.add(player);
}

render(<Game onStart={onStart} />);