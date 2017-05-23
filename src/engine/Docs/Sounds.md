## Pre-loading sounds

Pass the [[Sound]] to a [[Loader]] to pre-load the asset. Once a [[Sound]]
is loaded, you can [[Sound.play|play]] it. You can pass an argument from 0.0 - 1.0
into [[Sound.play|play]] in order to play the sound at that volume.

```js
// define multiple sources (such as mp3/wav/ogg) as a browser fallback
var sndPlayerDeath = new ex.Sound("/assets/snd/player-death.mp3", "/assets/snd/player-death.wav");
var loader = new ex.Loader(sndPlayerDeath);
game.start(loader).then(function () {
  sndPlayerDeath.play();
});
```  