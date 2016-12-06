
Excalibur comes with a [[LockedCamera]] and a [[SideCamera]], depending on
your game needs.

Cameras are attached to [[Scene|Scenes]] and can be changed by 
setting [[Scene.camera]]. By default, a [[Scene]] is initialized with a
[[BaseCamera]] that doesn't move and is centered on the screen.

## Focus

Cameras have a position ([[x]], [[y]]) which means they center around a specific
[[Vector|point]]. This can also be an [[Actor]] ([[BaseCamera.setActorToFollow]]) which
the camera will follow as the actor moves, which can be useful for cutscene scenarios (using
invisible actors).

If a camera is following an [[Actor]], it will ensure the [[Actor]] is always at the
center of the screen. You can use [[x]] and [[y]] instead if you wish to
offset the focal point.

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