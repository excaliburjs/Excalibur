Actions can be chained together and can be set to repeat,
or can be interrupted to change.

Actor actions are available off of [[Actor.actions]].

## Chaining Actions

You can chain actions to create a script because the action
methods return the context, allowing you to build a queue of
actions that get executed as part of an [[ActionQueue]].

```ts
class Enemy extends ex.Actor {
  public patrol() {
     // clear existing queue
     this.actions.clearActions();
     // guard a choke point
     // move to 100, 100 and take 1.2s
     // wait for 3s
     // move back to 0, 100 and take 1.2s
     // wait for 3s
     // repeat
     this.actions.moveTo(100, 100, 1200)
       .delay(3000)
       .moveTo(0, 100, 1200)
       .delay(3000)
       .repeatForever();
  }
}
```

## Example: Follow a Path

You can use [[ActionContext.moveTo|Actor.actions.moveTo]] to move to a specific point,
allowing you to chain together actions to form a path.

This example has a `Ship` follow a path that it guards by
spawning at the start point, moving to the end, then reversing
itself and repeating that forever.

```ts
public Ship extends ex.Actor {
  public onInitialize() {
    var path = [
      new ex.Point(20, 20),
      new ex.Point(50, 40),
      new ex.Point(25, 30),
      new ex.Point(75, 80)
    ];
    // spawn at start point
    this.x = path[0].x;
    this.y = path[0].y;
    // create action queue
    // forward path (skip first spawn point)
    for (var i = 1; i < path.length; i++) {
      this.actions.moveTo(path[i].x, path[i].y, 300);
    }
    
    // reverse path (skip last point)
    for (var j = path.length - 2; j >= 0; j--) {
      this.actions.moveTo(path[j].x, path[j].y, 300);
    }
    // repeat
    this.actions.repeatForever();
  }
}
```

While this is a trivial example, the Action API allows complex
routines to be programmed for Actors. For example, using the
[Tiled Map Editor](http://mapeditor.org) you can create a map that
uses polylines to create paths, load in the JSON using a 
[[Resource|Generic Resource]], create a [[TileMap]],
and spawn ships programmatically  while utilizing the polylines 
to automatically generate the actions needed to do pathing.

## Custom Actions

The API does allow you to implement new actions by implementing the [[IAction]]
interface, but this will be improved in future versions as right now it
is meant for the Excalibur team and can be advanced to implement.

You can manually manipulate an Actor's [[ActionQueue]] using 
[[Actor.actionQueue]]. For example, using [[ActionQueue.add]] for
custom actions.

## Future Plans

The Excalibur team is working on extending and rebuilding the Action API
in future versions to support multiple timelines/scripts, better eventing,
and a more robust API to allow for complex and customized actions.