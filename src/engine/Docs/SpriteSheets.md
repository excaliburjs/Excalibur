You can also use a [[SpriteFont]] which is special kind of [[SpriteSheet]] for use
with [[Label|Labels]].

## Creating a SpriteSheet

To create a [[SpriteSheet]] you need a loaded [[Texture]] resource.

```js
var game = new ex.Engine();
var txAnimPlayerIdle = new ex.Texture("/assets/tx/anim-player-idle.png");
// load assets
var loader = new ex.Loader(txAnimPlayerIdle);

// start game
game.start(loader).then(function () {
  var player = new ex.Actor();
 
  // create sprite sheet with 5 columns, 1 row, 80x80 frames
  var playerIdleSheet = new ex.SpriteSheet(txAnimPlayerIdle, 5, 1, 80, 80);
  
  // create animation (125ms frame speed)
  var playerIdleAnimation = playerIdleSheet.getAnimationForAll(game, 125);
 
  // add drawing to player as "idle"
  player.addDrawing("idle", playerIdleAnimation);
  // add player to game
  game.add(player);
});
```

## Creating animations

[[SpriteSheets]] provide a quick way to generate a new [[Animation]] instance.

You can use *all* the frames of a [[Texture]] ([[SpriteSheet.getAnimationForAll]])
or you can use a range of frames ([[SpriteSheet.getAnimationBetween]]) or you
can use specific frames ([[SpriteSheet.getAnimationByIndices]]).

To create an [[Animation]] these methods must be passed an instance of [[Engine]].
It's recommended to generate animations for an [[Actor]] in their [[Actor.onInitialize]]
event because the [[Engine]] is passed to the initialization function. However, if your
[[Engine]] instance is in the global scope, you can create an [[Animation]] at any time
provided the [[Texture]] has been [[Loader|loaded]].

```js
  // create sprite sheet with 5 columns, 1 row, 80x80 frames
  var playerIdleSheet = new ex.SpriteSheet(txAnimPlayerIdle, 5, 1, 80, 80);
  
  // create animation for all frames (125ms frame speed)
  var playerIdleAnimation = playerIdleSheet.getAnimationForAll(game, 125);
  // create animation for a range of frames (2-4) (125ms frame speed)
  var playerIdleAnimation = playerIdleSheet.getAnimationBetween(game, 1, 3, 125);
  // create animation for specific frames 2, 4, 5 (125ms frame speed)
  var playerIdleAnimation = playerIdleSheet.getAnimationByIndices(game, [1, 3, 4], 125);
  // create a repeating animation (ping-pong)
  var playerIdleAnimation = playerIdleSheet.getAnimationByIndices(game, [1, 3, 4, 3, 1], 125);
```

## Multiple rows

Sheets are organized in "row major order" which means left-to-right, top-to-bottom.
Indexes are zero-based, so while you might think to yourself the first column is
column "1", to the engine it is column "0". You can easily calculate an index 
of a frame using this formula:

    Given: col = 5, row = 3, columns = 10
    index = col + row * columns
    index = 4 + 2 * 10 // zero-based, subtract 1 from col & row
    index = 24

You can also simply count the frames of the image visually starting from the top left
and beginning with zero.

```js
// get a sprite for column 3, row 6
var sprite = animation.getSprite(2 + 5 * 10)
```