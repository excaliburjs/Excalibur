## Adding actors to the scene

For an [[Actor]] to be drawn and updated, it needs to be part of the "scene graph".
The [[Engine]] provides several easy ways to quickly add/remove actors from the
current scene.

```js
var game   = new ex.Engine(...);
var player = new ex.Actor();
var enemy  = new ex.Actor();
// add them to the "root" scene
game.add(player);
game.add(enemy);
// start game
game.start();
```

You can also add actors to a [[Scene]] instance specifically.

```js
var game   = new ex.Engine();
var level1 = new ex.Scene();
var player = new ex.Actor();
var enemy  = new ex.Actor();
// add actors to level1
level1.add(player);
level1.add(enemy);
// add level1 to the game
game.add("level1", level1);
// start the game
game.start();
// after player clicks start game, for example
game.goToScene("level1");

```

## Scene Lifecycle

A [[Scene|scene]] has a basic lifecycle that dictates how it is initialized, updated, and drawn. Once a [[Scene|scene]] is added to 
the [[Engine|engine]] it will follow this lifecycle.

![Scene Lifecycle](/assets/images/docs/SceneLifecycle.png)

## Extending scenes

For more complex games, you might want more control over a scene in which
case you can extend [[Scene]]. This is useful for menus, custom loaders,
and levels.

Just use [[Engine.add]] to add a new scene to the game. You can then use
[[Engine.goToScene]] to switch scenes which calls [[Scene.onActivate]] for the
new scene and [[Scene.onDeactivate]] for the old scene. Use [[Scene.onInitialize]]
to perform any start-up logic, which is called once.

**TypeScript**

```ts
class MainMenu extends ex.Scene {
  // start-up logic, called once
  public onInitialize(engine: ex.Engine) { }
  // each time the scene is entered (Engine.goToScene)
  public onActivate() { }
  // each time the scene is exited (Engine.goToScene)
  public onDeactivate() { }
}
// add to game and activate it
game.add("mainmenu", new MainMenu());
game.goToScene("mainmenu");
```

**Javascript**

```js
var MainMenu = ex.Scene.extend({
  // start-up logic, called once
  onInitialize: function (engine) { },
  // each time the scene is activated by Engine.goToScene
  onActivate: function () { },
  // each time the scene is deactivated by Engine.goToScene
  onDeactivate: function () { }
});
game.add("mainmenu", new MainMenu());
game.goToScene("mainmenu");
```

## Scene camera

By default, a [[Scene]] is initialized with a [[BaseCamera]] which
does not move and centers the game world.

Learn more about [[BaseCamera|Cameras]] and how to modify them to suit
your game.