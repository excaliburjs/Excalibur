## Creating a sprite

To create a [[Sprite]] you need to have a loaded [[Texture]] resource. You can
then use [[Texture.asSprite]] to quickly create a [[Sprite]] or you can create
a new instance of [[Sprite]] using the constructor. This is useful if you
want to "slice" out a portion of an image or if you want to change the dimensions.

```js
var game = new ex.Engine();
var txPlayer = new ex.Texture('/assets/tx/player.png');
// load assets
var loader = new ex.Loader([txPlayer]);

// start game
game.start(loader).then(function() {
  // create a sprite (quick)
  var playerSprite = txPlayer.asSprite();
  // create a sprite (custom)
  var playerSprite = new ex.Sprite(txPlayer, 0, 0, 80, 80);
});
```

You can then assign an [[Actor]] a sprite through [[Actor.addDrawing]] and
[[Actor.setDrawing]].

## Sprite Effects

Excalibur offers many sprite effects such as [[Colorize]] to let you manipulate
sprites. Keep in mind, more effects requires more power and can lead to memory or CPU
constraints and hurt performance. Each effect must be reprocessed every frame for each sprite.

It's still recommended to create an [[Animation]] or build in your effects to the sprites
for optimal performance.

There are a number of convenience methods available to perform sprite effects. Sprite effects are
side-effecting.

```typescript
var playerSprite = new ex.Sprite(txPlayer, 0, 0, 80, 80);

// darken a sprite by a percentage
playerSprite.darken(0.2); // 20%

// lighten a sprite by a percentage
playerSprite.lighten(0.2); // 20%
// saturate a sprite by a percentage
playerSprite.saturate(0.2); // 20%
// implement a custom effect
class CustomEffect implements ex.EffectsISpriteEffect {
  updatePixel(x: number, y: number, imageData: ImageData) {
    // modify ImageData
  }
}
playerSprite.addEffect(new CustomEffect());
```
