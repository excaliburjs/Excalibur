import * as ex from 'excalibur';

/******************************
 Player Setup
*******************************/

class MyPlayer extends ex.Actor {
  speed: number = 100;
  constructor() {
    super({
      x: 250,
      y: 250,
      radius: 16,
      color: ex.Color.Orange,
      collisionType: ex.CollisionType.Active,
      z: 10,
    });
  }

  onCollisionStart(self: ex.Collider, other: ex.Collider, side: ex.Side, contact: ex.CollisionContact): void {
    if (other.owner instanceof MyPrize) {
      other.owner.kill();
    }
  }

  onPreUpdate(engine: ex.Engine, elapsed: number): void {
    let tracked_velocity = ex.Vector.Zero;
    if (engine.input.keyboard.isHeld(ex.Keys.A)) {
      tracked_velocity.x = -this.speed;
    }
    if (engine.input.keyboard.isHeld(ex.Keys.D)) {
      tracked_velocity.x = this.speed;
    }
    if (engine.input.keyboard.isHeld(ex.Keys.W)) {
      tracked_velocity.y = -this.speed;
    }
    if (engine.input.keyboard.isHeld(ex.Keys.S)) {
      tracked_velocity.y = this.speed;
    }

    this.vel = tracked_velocity;
  }
}

let player = new MyPlayer();

/******************************
 Tilemap Setup
*******************************/

const myTileMap = new ex.TileMap({
  tileWidth: 32,
  tileHeight: 32,
  rows: 12,
  columns: 12,
})

const setupTileMap = () => {
  let whiteBorder = new ex.Rectangle({ width: 30, height: 30, color: ex.Color.Transparent, strokeColor: ex.Color.White, lineWidth: 2 });
  let whiteTile = new ex.Rectangle({ width: 32, height: 32, color: ex.Color.White });
  let greyTile = new ex.GraphicsGroup({ members: [new ex.Rectangle({ width: 32, height: 32, color: ex.Color.Gray }), { graphic: whiteBorder, offset: ex.vec(1, 1) }] });

  const isTopEdge = (index: number, width: number) => index < width;
  const isBottomEdge = (index: number, width: number, totalTiles: number) => index >= totalTiles - width;
  const isLeftEdge = (index: number, width: number) => index % width === 0;
  const isRightEdge = (index: number, width: number) => (index + 1) % width === 0;

  function isEdgeTile(index: number, width: number, totalTiles: number): boolean {
    return (
      isTopEdge(index, width) ||
      isBottomEdge(index, width, totalTiles) ||
      isLeftEdge(index, width) ||
      isRightEdge(index, width)
    );
  }

  let tileIndex = 0;
  for (const tile of myTileMap.tiles) {
    if (isEdgeTile(tileIndex, myTileMap.columns, myTileMap.tiles.length)) {
      tile.solid = true;
      tile.addGraphic(greyTile);
    } else {
      tile.addGraphic(whiteTile);
    }
    tileIndex++;
  }
}
setupTileMap();

/******************************
 Button Setup
*******************************/
class MyButton extends ex.Actor {
  constructor() {
    super({
      x: 96,
      y: 96,
      radius: 12,
      color: ex.Color.Black,
      z: 10,

    })
  }
}

/******************************
 Trigger Setup
*******************************/
let trigger = new ex.Trigger({
  width: 24,
  height: 24,
  pos: ex.vec(96, 96),
  target: player,

  action: () => {
    let isPrize = game.currentScene.entities.find(e => e instanceof MyPrize);
    if (!isPrize) {
      game.currentScene.add(new MyPrize());
    }
  },
})

/******************************
 Prize Setup
*******************************/

class MyPrize extends ex.Actor {
  constructor() {
    super({
      x: 300,
      y: 300,
      radius: 12,
      color: ex.Color.Yellow,
      z: 10,
      collisionType: ex.CollisionType.Passive
    })
  }
}


/******************************
 Engine Setup
*******************************/
const game = new ex.Engine({
  canvasElementId: 'preview-canvas',
  displayMode: ex.DisplayMode.Fixed,
  width: 500,
  height: 500,
  pixelArt: true,
  physics: {
    colliders: {
      compositeStrategy: 'separate'
    }
  }
});

/******************************
 Setting up the parent actor
*******************************/

game.add(player);
game.add(myTileMap);
game.add(new MyButton());
game.add(trigger);
game.currentScene.camera.strategy.lockToActor(player);
game.start();
