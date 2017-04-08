Excalibur uses the HTML5 Canvas API for drawing your game to the screen.
The canvas is available to all `draw` functions for raw manipulation,
but Excalibur is meant to simplify or completely remove the need to use
the canvas directly.

## Creating a Game

To create a new game, create a new instance of [[Engine]] and pass in
the configuration ([[IEngineOptions]]). Excalibur only supports a single
instance of a game at a time, so it is safe to use globally.
You can then call [[start]] which starts the game and optionally accepts
a [[Loader]] which you can use to pre-load assets.

```js
var game = new ex.Engine({ 
  width: 800, // the width of the canvas
  height: 600, // the height of the canvas
  canvasElementId: '', // the DOM canvas element ID, if you are providing your own
  displayMode: ex.DisplayMode.FullScreen, // the display mode
  pointerScope: ex.Input.PointerScope.Document // the scope of capturing pointer (mouse/touch) events
});
// call game.start, which is a Promise
game.start().then(function () {
  // ready, set, go!
});
```

## The Main Loop

The Excalibur engine uses a simple main loop. The engine updates and renders
the "scene graph" which is the [[Scene|scenes]] and the tree of [[Actor|actors]] within that
scene. Only one [[Scene]] can be active at a time. The engine does not update/draw any other
scene, which means any actors will not be updated/drawn if they are part of a deactivated scene.
![Engine Lifecycle](/assets/images/docs/EngineLifecycle.png)

**Scene Graph**

```
Engine
  |_ Scene 1 (activated)
    |_ Actor 1
      |_ Child Actor 1
    |_ Actor 2
  |_ Scene 2 (deactivated)
  |_ Scene 3 (deactivated)
```
The engine splits the game into two primary responsibilities: updating and drawing. This is
to keep your game smart about splitting duties so that you aren't drawing when doing
logic or performing logic as you draw.

### Update Loop

The first operation run is the **Update** loop. [[Actor]] and [[Scene]] both implement
an overridable/extendable `update` method. Use it to perform any logic-based operations
in your game for a particular class.

### Draw Loop

The next step is the **Draw** loop. A [[Scene]] loops through its child [[Actor|actors]] and
draws each one. You can override the `draw` method on an actor to customize its drawing.
You should **not** perform any logic in a draw call, it should only relate to drawing.

## Working with Scenes

The engine automatically creates a "root" [[Scene]]. You can use this for whatever you want.
You can manipulate scenes using [[Engine.add|add]], [[Engine.remove|remove]], 
and [[Engine.goToScene|goToScene]]. You can overwrite or remove the `root` scene if 
you want. There always has to be at least one scene and only **one** scene can be 
active at any one time.

Learn more about the [[Scene|scene lifecycle]].

### Adding a scene

```js
var game = new ex.Engine();
// create a new level
var level1 = new ex.Scene();
// add level 1 to the game
game.add("level1", level1);
// in response to user input, go to level 1
game.goToScene("level1");
// go back to main menu
game.goToScene("root");
```

### Accessing the current scene

To add actors and other entities to the current [[Scene]], you can use [[Engine.add|add]]. Alternatively,
you can use [[Engine.currentScene]] to directly access the current scene.

## Managing the Viewport

Excalibur supports multiple [[DisplayMode|display modes]] for a game. Pass in a `displayMode`
option when creating a game to customize the viewport.  
The [[canvasWidth]] and [[canvasHeight]] are still used to represent the native width and height 
of the canvas, but you can leave them at 0 or `undefined` to ignore them. If width and height
are not specified, the game won't be scaled and native resolution will be the physical screen
width/height.

If you use [[DisplayMode.Container]], the canvas will automatically resize to fit inside of
it's parent DOM element. This allows you maximum control over the game viewport, e.g. in case
you want to provide HTML UI on top or as part of your game.

## Extending the Engine

For complex games, any entity that inherits [[Class]] can be extended to override built-in
functionality. This is recommended for [[Actor|actors]] and [[Scene|scenes]], especially.
You can customize the options or provide more for your game by extending [[Engine]].

**TypeScript**

```ts
class Game extends ex.Engine {

  constructor() {
    super({ width: 800, height: 600, displayMode: DisplayMode.FullScreen });
  }

  public start() {
    // add custom scenes
    this.add("mainmenu", new MainMenu());
    return super.start(myLoader).then(() => {
      this.goToScene("mainmenu");
      // custom start-up
    });
  }
}
var game = new Game();
game.start();
```

**Javascript**

```js
var Game = ex.Engine.extend({

  constructor: function () {
    Engine.call(this, { width: 800, height: 600, displayMode: DisplayMode.FullScreen });
  }

  start: function() {
    // add custom scenes
    this.add("mainmenu", new MainMenu());
    var _this = this;
    return Engine.prototype.start.call(this, myLoader).then(function() {
      _this.goToScene("mainmenu");
      // custom start-up
    });
  }
});
var game = new Game();
game.start();
```
