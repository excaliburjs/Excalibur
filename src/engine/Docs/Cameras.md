Cameras are attached to [[Scene|Scenes]] and can be changed by
setting [[Scene.camera]]. By default, a [[Scene]] is initialized with a
[[BaseCamera]] that doesn't move and is centered on the screen.

## Focus

Cameras have a position ([[x]], [[y]]) which means they center around a specific
[[Vector|point]].

If a camera is following an [[Actor]], it will ensure the [[Actor]] is always at the
center of the screen. You can use [[x]] and [[y]] instead if you wish to
offset the focal point.

## Camera strategies

Cameras can implement a number of strategies to track, follow, or exhibit custom behavior in relation to a target. A common reason to use a
strategy is to have the [[BaseCamera]] follow an [[Actor]].

In order to user the different built-in strategies, you can access `Camera.strategy`

Lock the camera exactly to the center of the actor's bounding box

```typescript
game.currentScene.camera.strategy.lockToActor(actor);
```

Lock the camera to one axis of the actor, in this case follow the actors x position

```typescript
game.currentScene.camera.strategy.lockToActorAxis(actor, ex.Axis.X);
```

Elastically move the camera to an actor in a smooth motion see [[ElasticToActorStrategy]] for details

```typescript
game.currentScene.camera.strategy.elasticToActor(actor, cameraElasticity, cameraFriction);
```

Keep the actor within a circle around the focus

```typescript
game.currentScene.camera.strategy.radiusAroundActor(actor, radius);
```

## Custom strategies

Custom strategies can be implemented by extending the ICameraStrategy interface and added to cameras to build novel behavior with `ex.Camera.addStrategy<T>(new MyCameraStrategy<T>())`.

As shown below a camera strategy calculates a new camera position (`ex.Vector`) every frame given a target type, camera, engine, and elapsed delta in milliseconds.

```typescript
/**
 * Interface that describes a custom camera strategy for tracking targets
 */
export interface ICameraStrategy<T> {
  /**
   * Target of the camera strategy that will be passed to the action
   */
  target: T;

  /**
   * Camera strategies perform an action to calculate a new focus returned out of the strategy
   */
  action: (target: T, camera: BaseCamera, engine: Engine, delta: number) => Vector;
}
```

## Camera Shake

To add some fun effects to your game, the [[shake]] method
will do a random shake. This is great for explosions, damage, and other
in-game effects.

## Camera Lerp

"Lerp" is short for [Linear Interpolation](http://en.wikipedia.org/wiki/Linear_interpolation)
and it enables the camera focus to move smoothly between two points using timing functions.
Use [[move]] to ease to a specific point using a provided [[EasingFunction]].

## Camera Zooming

To adjust the zoom for your game, use [[zoom]] which will scale the
game accordingly. You can pass a duration to transition between zoom levels.

## Known Issues

**Actors following a path will wobble when camera is moving**  
[Issue #276](https://github.com/excaliburjs/Excalibur/issues/276)
