[[Resource]] is an [[ILoadable]] so it can be passed to a [[Loader]] to pre-load before
a level or game.

Example usages: JSON, compressed files, blobs.

## Pre-loading generic resources

```js
var resLevel1 = new ex.Resource("/assets/levels/1.json", "application/json");
var loader = new ex.Loader(resLevel1);
// attach a handler to process once loaded
resLevel1.processData = function (data) {
  // process JSON
  var json = JSON.parse(data);
  // create a new level (inherits Scene) with the JSON configuration
  var level = new Level(json);
  // add a new scene
  game.add(level.name, level);
}
game.start(loader);
```