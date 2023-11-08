const level1 = new ex.Scene();

// add actors to level1
level1.add(player);
level1.add(enemy);

// add level1 to the game
game.add('level1', level1);

// start the game
game.start();

// after player clicks start game, for example
game.goToScene('level1');