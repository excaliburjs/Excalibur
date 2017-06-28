## Creating an animation

Create a [[Texture]] that contains the frames of your animation. Once the texture
is [[Loader|loaded]], you can then generate an [[Animation]] by creating a [[SpriteSheet]]
and using [[SpriteSheet.getAnimationForAll]].

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

## Sprite effects

You can add [["Drawing/SpriteEffects"|sprite effects]] to an animation through methods
like [[Animation.invert]] or [[Animation.lighten]]. Keep in mind, since this
manipulates the raw pixel values of a [[Sprite]], it can have a performance impact.
[[Animetion.loop]] is now set to true by default.