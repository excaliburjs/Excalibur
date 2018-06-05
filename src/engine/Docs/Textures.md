Textures are the raw image so to add a drawing to a game, you must create
a [[Sprite]]. You can use [[Texture.asSprite]] to quickly generate a Sprite
instance.

## Pre-loading textures

Pass the [[Texture]] to a [[Loader]] to pre-load the asset. Once a [[Texture]]
is loaded, you can generate a [[Sprite]] with it.

```js
var txPlayer = new ex.Texture('/assets/tx/player.png');
var loader = new ex.Loader(txPlayer);
game.start(loader).then(function() {
  var player = new ex.Actor();
  player.addDrawing(txPlayer);
  game.add(player);
});
```
