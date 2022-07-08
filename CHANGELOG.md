# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).


## [Unreleased]

### Breaking Changes

-

### Deprecated

-

### Added

-

### Fixed

-

### Updates

-

### Changed

-



<!--------------------------------- DO NOT EDIT BELOW THIS LINE --------------------------------->
<!--------------------------------- DO NOT EDIT BELOW THIS LINE --------------------------------->
<!--------------------------------- DO NOT EDIT BELOW THIS LINE --------------------------------->

## [0.27.0] - 2022-07-08

### Breaking Changes

- `ex.Engine.snapToPixel` now defaults to `false`, it was unexpected to have pixel snapping on by default it has now been switched.
- The `ex.Physics.useRealisticPhysics()` physics solver has been updated to fix a bug in bounciness to be more physically accurate, this does change how physics behaves. Setting `ex.Body.bounciness = 0` will simulate the old behavior. 
- `ex.TransformComponent.posChanged$` has been removed, it incurs a steep performance cost
- `ex.EventDispatcher` meta events 'subscribe' and 'unsubscribe' were unused and undocumented and have been removed
- `ex.TileMap` tlies are now drawn from the lower left by default to match with `ex.IsometricMap` and Tiled, but can be configured with `renderFromTopOfGraphic` to restore the previous behavior.
- Scene `onActivate` and `onDeactivate` methods have been changed to receive a single parameter, an object containing the `previousScene`, `nextScene`, and optional `data` passed in from `goToScene()`

### Deprecated

-

### Added
- Added new configurable `ex.TileMap` option for rendering from the bottom or the top of the graphic, this matches with `ex.IsometricMap` and how Tiled renders `renderFromTopOfGraphic`, by default `false` and renders from the bottom.
  ```typescript
  const tileMap = new ex.TileMap({
    renderFromTopOfGraphic: false
  })
  ```
- Added new `ex.Future` type which is a convenient way of wrapping a native browser promise and resolving/rejecting later
  ```typescript
  const future = new ex.Future();
  const promise = future.promise; // returns promise
  promise.then(() => {
    console.log('Resolved!');
  });
  future.resolve(); // resolved promise
  ```
- Added new `ex.Semaphore` type to limit the number of concurrent cans in a section of code, this is used internally to work around a chrome browser limitation, but can be useful for throttling network calls or even async game events.
  ```typescript
  const semaphore = new ex.Semaphore(10); // Only allow 10 concurrent between enter() and exit()
  ...

  await semaphore.enter();
  await methodToBeLimited();
  semaphore.exit();
  ```
- Added new `ex.WatchVector` type that can observe changes to x/y more efficiently than `ex.watch()`
- Added performance improvements 
   * `ex.Vector.distance` improvement
   * `ex.BoundingBox.transform` improvement
- Added ability to clone `ex.Vector.clone(destVector)` into a destination vector
- Added new `ex.Transform` type that is a light weight container for transformation data. This logic has been extracted from the `ex.TransformComponent`, this makes it easy to pass `ex.Transform`s around. Additionally the extracted `ex.Transform` logic has been refactored for performance.
- Added new `ex.AffineMatrix` that is meant for 2D affine transformations, it uses less memory and performs less calculations than the `ex.Matrix` which uses a 4x4 Float32 matrix.
- Added new fixed update step to Excalibur! This allows developers to configure a fixed FPS for the update loop. One advantage of setting a fix update is that you will have a more consistent and predictable physics simulation. Excalibur graphics will be interpolated automatically to avoid any jitter in the fixed update.
  * If the fixed update FPS is greater than the display FPS, excalibur will run multiple updates in a row (at the configured update elapsed) to catch up, for example there could be X updates and 1 draw each clock step.
  * If the fixed update FPS is less than the display FPS, excalibur will skip updates until it meets the desired FPS, for example there could be no update for 1 draw each clock step.
  ```typescript
  const game = new ex.Engine({
    fixedUpdateFps: 20 // 20 fps fixed update, or a fixed update delta of 50 milliseconds
  });
  // turn off interpolation on a per actor basis
  const actor = new ex.Actor({...});
  actor.body.enableFixedUpdateInterpolate = false;
  game.add(game);
  ```

- Allowed setting playback `ex.Sound.duration` which will limit the amount of time that a clip plays from the current playback position.
- Added a new lightweight `ex.StateMachine` type for building finite state machines
  ```typescript
  const machine = ex.StateMachine.create({
    start: 'STOPPED',
    states: {
      PLAYING: {
        onEnter: () => {
          console.log("playing");
        },
        transitions: ['STOPPED', 'PAUSED']
      },
      STOPPED: {
        onEnter: () => {
          console.log("stopped");
        },
        transitions: ['PLAYING', 'SEEK']
      },
      SEEK: {
        transitions: ['*']
      },
      PAUSED: {
        onEnter: () => {
          console.log("paused")
        },
        transitions: ['PLAYING', 'STOPPED']
      }
    }
  });
  ```
- Added `ex.Sound.seek(positionInSeconds)` which will allow you to see to a place in the sound, this will implicitly pause the sound
- Added `ex.Sound.getTotalPlaybackDuration()` which will return the total time in the sound in seconds.
- Allow tinting of `ex.Sprite`'s by setting a new `tint` property, renderers must support the tint property in order to function.
  ```typescript
  const imageSource = new ex.ImageSource('./path/to/image.png');
  await imageSource.load();
  const sprite = imageSource.toSprite();
  sprite.tint = ex.Color.Red;
  ```
- Added `ex.Sound.getPlaybackPosition()` which returns the current playback position in seconds of the currently playing sound.
- Added `ex.Sound.playbackRate` which allows developers to get/set the current rate of playback. 1.0 is the default playback rate, 2.0 is twice the speed, and 0.5 is half speed.
- Added missing `ex.EaseBy` action type, uses `ex.EasingFunctions` to move relative from the current entity position.
- Added 2 new `Action` types to enable running parallel actions. `ex.ActionSequence` which allows developers to specify a sequence of actions to run in order, and `ex.ParallelActions` to run multiple actions at the same time.
  ```typescript
  const actor = new ex.Actor();
  const parallel = new ex.ParallelActions([
    new ex.ActionSequence(actor, ctx => ctx.moveTo(ex.vec(100, 0), 100)),
    new ex.ActionSequence(actor, ctx => ctx.rotateTo(Math.PI/2, Math.PI/2))
  ]);
  actor.actions.runAction(parallel);
  // actor will now move to (100, 100) and rotate to Math.PI/2 at the same time!!
  ```
- Add target element id to `ex.Screen.goFullScreen('some-element-id')` to influence the fullscreen element in the fullscreen browser API.
- Added optional `data` parameter to `goToScene`, which gets passed to the target scene's `onActivate` method.
  ```typescript
  class SceneA extends ex.Scene {
    /* ... */

    onActivate(context: ex.SceneActivationContext<{ foo: string }>) {
      console.log(context.data.foo); // bar
    }
  }

  engine.goToScene('sceneA', { foo: 'bar' })
  ```
  - Added the ability to select variable duration into Timer constructor.
  ```typescript
  const random = new ex.Random(1337);
  const timer = new ex.Timer({
    random,
    interval: 500,
    randomRange: [0, 500]
  })
  ```

### Fixed

- Fixed issue with `ex.Canvas` and `ex.Raster` graphics that forced their dimensions to the next highest power of two.
- Fixed issue with `ex.Engine.snapToPixel` where positions very close to pixel boundary created jarring 1 pixel oscillations.
- Fixed bug where a deferred `goToScene` would preserve the incorrect scene so `engine.add(someActor)` would place actors in the wrong scene after transitioning to another.
- Fixed usability issue and log warning if the `ex.ImageSource` is not loaded and a draw was attempted.
- Fixed bug in `ex.Physics.useRealisticPhysics()` solver where `ex.Body.bounciness` was not being respected in the simulation
- Fixed bug in `ex.Physics.useRealisticPhysics()` solver where `ex.Body.limitDegreeOfFreedom` was not working all the time.
- Fixed bug in `Clock.schedule` where callbacks would not fire at the correct time, this was because it was scheduling using browser time and not the clock's internal time.
- Fixed issue in Chromium browsers where Excalibur crashes if more than 256 `Image.decode()` calls are happening in the same frame.
- Fixed issue where `ex.EdgeCollider` were not working properly in `ex.CompositeCollider` for `ex.TileMap`'s
- Fixed issue where `ex.BoundingBox` overlap return false due to floating point rounding error causing multiple collisions to be evaluated sometimes
- Fixed issue with `ex.EventDispatcher` where removing a handler that didn't already exist would remove another handler by mistake
- Fixed issue with `ex.EventDispatcher` where concurrent modifications of the handler list where handlers would or would not fire correctly and throw
- Tweak to the `ex.ArcadeSolver` to produce more stable results by adjusting by an infinitesimal epsilon
  - Contacts with overlap smaller than the epsilon are ignored
  - Colliders with bounds that overlap smaller than the epsilon are ignored
- Fixed issue with `ex.ArcadeSolver` based collisions where colliders were catching on seams when sliding along a floor of multiple colliders. This was by sorting contacts by distance between bodies.
  ![sorted-collisions](https://user-images.githubusercontent.com/612071/172401390-9e9c3490-3566-47bf-b258-6a7da86a3464.gif)

- Fixed issue with `ex.ArcadeSolver` where corner contacts would zero out velocity even if the bodies were already moving away from the contact "divergent contacts".
  ![cancel-velocity-fix](https://user-images.githubusercontent.com/612071/172500318-539f3a36-31ae-4efc-b6ab-c4524b297adb.gif)

- Fixed issue where `ex.Sound` wasn't being paused when the browser window lost focus

### Updates

- Updated the collision system to improve performance
  * Cache computed values where possible
  * Avoid calculating transformations until absolutely necessary
  * Avoid calling methods in tight loops

### Changed

- `ex.Engine.configurePerformanceCanvas2DFallback` no longer requires `threshold` or `showPlayerMessage`
- `ex.Engine.snapToPixel` now defaults to `false`
- Most places where `ex.Matrix` was used have been switched to `ex.AffineMatrix`
- Most places where `ex.TransformComponent` was used have been switched to `ex.Transform`

## [0.26.0] - 2022-05-20

### Breaking Changes

- `ex.Line` has be replaced with a new Graphics type, the old geometric behavior is now under the type `ex.LineSegment`
- Notable deprecated types removed
  - `ex.SortedList` old sorted list is removed
  - `ex.Collection` old collection type is removed
  - `ex.Util` import site, exported code promoted `ex.*`
  - `ex.DisplayMode.Position` is removed, use CSS to position the canvas
  - `ex.Trait` interface, traits are not longer supported
  - `ex.Promises` old promise implementation is removed in favor of browser promises
- Notable method & property removals
  - `ex.Actor`
      * `.getZIndex()` and `.setZIndex()` removed use `.z`
  - `ex.Scene`
      * `.screenElements` removed in favor of `.entities`
      * `.addScreenElement(...)` removed use `.add(...)`
      * `.addTileMap(...)` removed use `.add(...)`
      * `.removeTileMap(...)` removed use `.remove(...)`
  - `ex.Timer`
      * `.unpause()` removed use `.resume()`
  - `ex.Camera`
      * `.rx` removed use `.angularVelocity`
  - `ex.BodyComponent`
      * `.sx` removed use `.scaleFactor`
      * `.rx` removed use `.angularVelocity`
  - `ex.ActionsComponent`
      * `.asPromise()` removed use `.toPromise()`
  - `ex.ActionContext`
      * `.asPromise()` removed use `.toPromise()`
  - `ex.Color`
      * Misspellings corrected
- The old drawing API had been removed from excalibur, this should not affect you unless you were using the `ex.Flags.useLegacyDrawing()` or `ex.Flags.useCanvasGraphicsContext()`.
  - Notably all implementations of `Drawable` are removed, use the new `Graphics` API
  - Methods on actor `ex.Actor.setDrawing(...)`, `ex.Actor.addDrawing(...)` are removed, use the `ex.Actor.graphics.add(...)`, `ex.Actor.graphics.show(...)` and `ex.Actor.graphics.use(...)`
  - The `ex.Actor.onPreDraw(...)` and `ex.Actor.onPostDraw(...)` are removed, use `ex.Actor.graphics.onPreDraw(...)` and `ex.Actor.graphics.onPostDraw(...)`
  - The events `predraw` and `postdraw` are removed
  - `ex.Scene.onPreDraw()` and `ex.Scene.onPostDraw()` are now called with the `ExcaliburGraphicsContext` instead of an `CanvasRenderingContext2D`
- `ex.TileMap` has several breaking changes around naming, but brings it consistent with Tiled terminology and the new `ex.IsometricMap`. Additionally the new names are easier to follow.
  - Constructor has been changed to the following
    ```typescript
     new ex.TileMap({
      pos: ex.vec(100, 100),
      tileWidth: 64,
      tileHeight: 48,
      rows: 20,
      columns: 20
    });
    ```
  - `ex.Cell` has been renamed to `ex.Tile`
    - `ex.Tile` now uses `addGraphic(...)`, `removeGraphic(...)`, `clearGraphics()` and `getGraphics()` instead of having an accessible `ex.Tile.graphics` array.
  - `ex.TileMap.data` has been renamed to `ex.TileMap.tiles`
  - `ex.TileMap.getCell(..)` has been renamed to `ex.TileMap.getTile(...)`
  - `ex.TileMap.getCellByIndex(...)` has been renamed to `ex.TileMap.getTileByIndex(...)`
  - `ex.TileMap.getCellByPoint(...)` has been renamed to `ex.TileMap.getTileByPoint(...)`


### Deprecated

-

### Added

- Added new parameter to `ex.Raster({quality: 4})` to specify the internal scaling for the bitmap, this is useful for improving the rendering quality of small rasters due to sampling error.
- Added new `ex.Line` graphics object for drawing lines!
  ```typescript
  const lineActor = new ex.Actor({
    pos: ex.vec(100, 0)
  });
  lineActor.graphics.anchor = ex.Vector.Zero;
  lineActor.graphics.use(new ex.Line({
    start: ex.vec(0, 0),
    end: ex.vec(200, 200),
    color: ex.Color.Green,
    thickness: 10
  }));
  game.add(lineActor);
  ```
- Added new performance fallback configuration to `ex.Engine` for developers to help players experiencing poor performance in non-standard browser configurations
  * This will fallback to the Canvas2D rendering graphics context which usually performs better on non hardware accelerated browsers, currently postprocessing effects are unavailable in this fallback.
  * By default if a game is running at 20fps or lower for 100 frames or more after the game has started it will be triggered, the developer can optionally show a player message that is off by default.
  ```typescript
    var game = new ex.Engine({
      ...
      configurePerformanceCanvas2DFallback: {
        allow: true, // opt-out of the fallback
        showPlayerMessage: true, // opt-in to a player pop-up message
        threshold: { fps: 20, numberOfFrames: 100 } // configure the threshold to trigger the fallback
      }
    });
  ```
- Added new `ex.ParallaxComponent` for creating parallax effects on the graphics, entities with this component are drawn differently and a collider will not be where you expect. It is not recommended you use colliders with parallax entities.
  ```typescript
  const actor = new ex.Actor();
  // The actor will be drawn shifted based on the camera position scaled by the parallax factor
  actor.addComponent(new ParallaxComponent(ex.vec(0.5, 0.5)));
  ```
- Added feature to build `SpriteSheet`s from a list of different sized source views using `ex.SpriteSheet.fromImageSourceWithSourceViews(...)`
  ```typescript
    const ss = ex.SpriteSheet.fromImageSourceWithSourceViews({
      image,
      sourceViews: [
        {x: 0, y: 0, width: 20, height: 30},
        {x: 20, y: 0, width: 40, height: 50},
      ]
    });
  ```
- Added draw call sorting `new ex.Engine({useDrawSorting: true})` to efficiently draw render plugins in batches to avoid expensive renderer switching as much as possible. By default this is turned on, but can be opted out of.
- Added the ability to clone into a target `Matrix` this is useful to save allocations and in turn garbage collection pauses.
- `ex.Engine` now support setting the pixel ratio in the constructor `new ex.Engine({pixelRatio: 2})`, this is useful for smooth `ex.Text` rendering when `antialiasing: false` and rendering pixel art type graphics
- `ex.TileMap` now supports per Tile custom colliders!
  ```typescript
  const tileMap = new ex.TileMap(...);
  const tile = tileMap.getTile(0, 0);
  tile.solid = true;
  tile.addCollider(...); // add your custom collider!
  ```
- New `ex.IsometricMap` for drawing isometric grids! (They also support custom colliders via the same mechanism as `ex.TileMap`)
  ```typescript
  new ex.IsometricMap({
      pos: ex.vec(250, 10),
      tileWidth: 32,
      tileHeight: 16,
      columns: 15,
      rows: 15
    });
  ```
  - `ex.IsometricTile` now come with a `ex.IsometricEntityComponent` which can be applied to any entity that needs to be correctly sorted to preserve the isometric illusion
  - `ex.IsometricEntitySystem` generates a new z-index based on the `elevation` and y position of an entity with `ex.IsometricEntityComponent`

- Added arbitrary non-convex polygon support (only non-self intersecting) with `ex.PolygonCollider(...).triangulate()` which builds a new `ex.CompositeCollider` composed of triangles.
- Added faster `ex.BoundingBox.transform(...)` implementation.
- Added faster `ex.BoundingBox.overlap(...)` implementation.
- Added `ex.Vector.min(...)` and `ex.Vector.max(...)` to find the min/max of each vector component between 2 vectors.
- Added `ex.TransformComponent.zIndexChange$` observable to watch when z index changes.
- Added new display mode `ex.DisplayMode.FitContainerAndFill`.
- Added new display mode `ex.DisplayMode.FitScreenAndFill`.
- Added new display mode `ex.DisplayMode.FitContainerAndZoom`.
- Added new display mode `ex.DisplayMode.FitScreenAndZoom`.
### Fixed

- Fixed unreleased issue where fixed update interpolation was incorrect with child actors
- Fixed unreleased bug where CompositeCollider components would not collide appropriately because contacts did not have unique ids
- Fixed issue where CompositeColliders treat separate constituents as separate collisionstart/collisionend which is unexpected
- Fixed issue where resources that failed to load would silently fail making debugging challenging
- Fixed issue where large pieces of Text were rendered as black rectangles on mobile, excalibur now internally breaks these into smaller chunks in order to render them.
- Fixed issue #2263 where keyboard input `wasPressed` was not working in the `onPostUpdate` lifecycle
- Fixed issue #2263 where there were some keys missing from the `ex.Input.Keys` enum, including `Enter`
- Fixed issue where Rectangle line renderer did not respect z order

### Updates

- Performance improvement to the `ex.Loader` screen keeping frame rates higher by only updating the backing `ex.Canvas` when there are changes
- Improved collision broadphase by swapping to a more efficient `ex.BoundingBox.overlaps` check
- Improved collision narrowphase by improving `ex.PolygonCollider` calculations for localBounds, bounds, and transformed point geometry
- Improved Text/Font performance by internally caching expensive native `measureText()` calls
- Performance improvement to GraphicsSystem
- Performance improvement to the transform capture of the previous frame transform and motion

### Changed

- Split offscreen detection into a separate system
- Renamed `ex.Matrix.multv()` and `ex.Matrix.multm()` to `ex.Matrix.multiply()` which matches our naming conventions

<!--------------------------------- DO NOT EDIT BELOW THIS LINE --------------------------------->
<!--------------------------------- DO NOT EDIT BELOW THIS LINE --------------------------------->
<!--------------------------------- DO NOT EDIT BELOW THIS LINE --------------------------------->

## [0.25.3] - 2022-02-05

## Breaking Changes

- Small breaking change to `engine.screenshot()` you must now use `await engine.screenshot()`. This avoids copy buffer performance impact of `preserveDrawingBuffer: true` by capturing a screen shot request on the next frame when the buffer has not yet been cleared.

### Deprecated

-

### Added

-

### Fixed

- Fixed issue where collision normals are inaccurate on polygon colliders that offset from their origin
- Fixed issue where only Pixel 6 devices crash when using their MAX_TEXTURE_IMAGE_UNITS, artificially cap Excalibur to 125 textures max
- Fixed issue [#2224] where pointer events sometimes didn't work in mobile platforms due to `touch-action` not being set to `none`
- Fixed issue [#2203] where `engine.screenshot()` did not work in the WebGL implementation
- Fixed issue [#1528] where screenshots didn't match the displayed game's size in HiDPI displays, images are now consistent with the game. If you want the full scaled image pass `engine.screenshot(true)` to preserve HiDPI Resolution.
- Fixed issue [#2206] error and warning logs for large images to help developers identify error situations in the webgl implementation

### Updates

-

### Changed

-

## [0.25.2] - 2022-01-21

### Breaking Changes

- `ex.Util.extend()` is removed, modern js spread operator `{...someobject, ...someotherobject}` handles this better.
- Excalibur post processing is now moved to the `engine.graphicsContext.addPostProcessor()`
- Breaking change to `ex.PostProcessor`, all post processors must now now implement this interface
  ```typescript
  export interface PostProcessor {
    intialize(gl: WebGLRenderingContext): void;
    getShader(): Shader;
  }
  ```
### Deprecated

- The static `Engine.createMainLoop` is now marked deprecated and will be removed in v0.26.0, it is replaced by the `Clock` api
- Mark legacy draw routines in `ex.Engine`, `ex.Scene`, and `ex.Actor` deprecated

### Added

- Added ability to build custom renderer plugins that are accessible to the `ex.ExcaliburGraphicsContext.draw<TCustomRenderer>(...)` after registering them `ex.ExcaliburGraphicsContext.register(new LineRenderer())`
- Added ability to draw circles and rectangles with outlines! `ex.ExcaliburGraphicsContext.drawCircle(...)` and `ex.ExcaliburGraphicsContext.drawRectangle(...)`
- Added `ex.CoordPlane` can be set in the `new ex.Actor({coordPlane: CoordPlane.Screen})` constructor
- Added convenience feature, setting the color, sets the color on default graphic if applicable
- Added a `DebugGraphicsComponent` for doing direct debug draw in the `DebugSystem`
- Added back TileMap debug draw
- Added `ex.Scene.timers` to expose the list of timers
- Added support for different webgl texture blending modes as `ex.ImageFiltering` :
  * `ex.ImageFiltering.Blended` -  Blended is useful when you have high resolution artwork and would like it blended and smoothed
  * `ex.ImageFiltering.Pixel` - Pixel is useful when you do not want smoothing aka antialiasing applied to your graphics.
- Excalibur will set a "default" blend mode based on the `ex.EngineOption` antialiasing property, but can be overridden per graphic
  - `antialiasing: true`, then the blend mode defaults to  `ex.ImageFiltering.Blended`
  - `antialiasing: false`, then the blend mode defaults to `ex.ImageFiltering.Pixel`
- `ex.Text/ex.Font` defaults to blended which improves the default look of text rendering dramatically!
- `ex.Circle` and `ex.Polygon` also default to blended which improves the default look dramatically!
- `ex.ImageSource` can now specify a blend mode before the Image is loaded, otherwise
- Added new `measureText` method to the `ex.SpriteFont` and `ex.Font` to return the bounds of any particular text
- Added new `Clock` api to manage the core main loop. Clocks hide the implementation detail of how the mainloop runs, users just knows that it ticks somehow. Clocks additionally encapsulate any related browser timing, like `performance.now()`
  1. `StandardClock` encapsulates the existing `requestAnimationFrame` api logic
  2. `TestClock` allows a user to manually step the mainloop, this can be useful for frame by frame debugging #1170 
  3. The base abstract clock implements the specifics of elapsed time 

- Added a new feature to Engine options to set a maximum fps `new ex.Engine({...options, maxFps: 30})`. This can be useful when needing to deliver a consistent experience across devices.
- Pointers can now be configured to use the collider or the graphics bounds as the target for pointers with the `ex.PointerComponent`
  - `useColliderShape` - (default true) uses the collider component geometry for pointer events
  - `useGraphicsBounds` - (default false) uses the graphics bounds for pointer events


### Fixed

- Fixed issue [#2192] where Actor.center was not correct in child actors
- Fixed issue where `ex.CircleCollider`s did not respect rotation/scale when offset
- Fixed issue [#2157] when compiling in TS strict mode complaining about `ex.Poolable`
- Fixed issue where scaled graphics were not calculating the correct bounds
- Fixed unreleased issue where clock implementation was not updating frame id
- Fixed alpha pre-multiply math in multiple shaders
- Fixed label initialization of fonts, passing a font in the constructor work
- Fixed bug in sprite bounds calculations not taking scale into account
- Fixed bug with pointer api where clicking on screen coordinate actors didn't work
- Fixed [#1815] issue where Camera would jitter when using a strategies based off of actors in the previous frame. 
- Fixed issue where TileMaps would sometimes have a geometry seam that may not fall on an actual screen pixel causing a visible gap between tiles and the background
  -- ![image](https://user-images.githubusercontent.com/612071/144700377-ac4585ba-3f4c-44b8-95db-ad36c5fc9a32.png)
- Fixed unreleased issue where SpriteFonts log every frame they detect a misconfigured font.
- Fixed unreleased issue where clock when constraining fps would pass larger than expected elapsed times to the simulation causing things to "speed up" bizarrely
- Fixed unreleased issue where games with no resources would crash
- Fixed issue [#2152] where shared state in `ex.Font` and `ex.SpriteFont` prevented text from aligning properly when re-used
- Fixed issue where fast moving `CompositeCollider`s were erroneously generating pairs for their constituent parts
- Fixed Safari 13.1 crash when booting Excalibur because of they odd MediaQuery API in older Safari
- Fixed issue where pointers did not work because of missing types
- Fixed issue with `ArcadeSolver` where stacked/overlapped tiles would double solve the position of the collider for the same overlap
- Fixed issue where changing the `ex.Sprite.width` or `ex.Sprite.height` did not resize the graphic.
- Fixed issue where initial Actor anchors set in the constructor were not being set in the graphics component
- EventDispatcher
  - `EventDispatcher` - doesn't require the target object. The context of `this` is not tampered anymore.
- Pointers
  - `PointerAbstraction` - is fixed to maintain reference
-

### Updates

- The following Engine's pieces: `Collision` `Graphics` `Resources` `Trigger` are updated to reflect the new EventDispatcher behavior.
- Refactor camera/screen interaction to utilize transforms instead of bespoke coordinate conversion
### Changed

- Updated Graphics to improve general performance
- Updated the webgl primitives to make building `ex.Shader`s, `ex.VertexBuffer`s, and `ex.VertexLayout`s much easier 
- Broke up the internal monolithic shader into separate internal renderer plugins
- Changed the debug system to separate displaying the debug position point (`game.debug.transform.showPosition = true`) and debug position label (`game.debug.transform.showPositionLabel = true`)
- `ex.ColorBlindCorrector` is renamed to `ex.ColorBlindnessPostProcessor`, and `ex.ColorBlindness` is renamed to `ex.ColorBlindnessMode`
   - Color blindness can still be corrected or simulated:
      * `game.debug.colorBlindMode.correct(ex.ColorBlindnessMode.Deuteranope)`
      * `game.debug.colorBlindMode.simulate(ex.ColorBlindnessMode.Deuteranope)`
- Excalibur now uses pre-multiplied alpha automatically, images will be unpacked into memory using `gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)`
- Excalibur FPS is now sampled over 100ms blocks, this gives a more usable fps in the stats. The sampler is available off of the engine clock `engine.clock.fpsSampler.fps` 
- Pointer Events:
  * Event types (up, down, move, etc) now all exist in 2 types `ex.Input.PointerEvent` and `ex.Input.WheelEvent`
  * The `stopPropagation()` method used to cancel further dispatches has been renamed to `cancel()` to match other events API.
  * Events no longer have a reference to the `pointer` but now have all of the same information that was availabe on the pointer `worldPos`, `screenPos`, `pagePos`


## [0.25.1] - 2021-11-05

### Added

- *Experimental:* Native ES module bundle distribution in package `esm/excalibur.js` entrypoint ([#2064](https://github.com/excaliburjs/Excalibur/pull/2064))
- `withEngine` utils support an aditional options parameter to override the Engine default options.
- Story to show a play / pause implementation. 
- `ex.Animation` now support `totalDuration` that will calculate automatically each frame duration based on how many frames have.
- `ex.Animation` now supports `.reverse()` to reverse the direction of play in an animation, use the `ex.Animation.direction` to inspect if the animation is playing in the `ex.AnimationDirection.Forward` direction or the `ex.AnimationDirection.Backward` direction.
### Changed

- Pointer system refactored into 2 parts:
   * First is an ECS style system `ex.PointerSystem` that dispatches events to Entities/Actors
   * Second is an event receiver `ex.PointerEventReceiver` which is responsible for collecting the native browser events
   * The API is mostly backwards compatible breaking changes are listed in the breaking change section, event types have been simplified, and `stopPropagation()` and been renamed to `cancel()`
- Internal Actions implementation converted to ECS system and component, this is a backwards compatible change with v0.25.0
  - `ex.ActionsSystem` and `ex.ActionsComponent` now wrap the existing `ex.ActionContext`
  - Actions can be shared with all entities now!
- Dispatch the `hidePlayButton` on the Button Event to prevent that keep on the screen on some situations [#1431].
- Revert VSCode Workbench Colors

### Deprecated

- Actions `asPromise()` renamed to `toPromise()`

### Fixed

- Fixed loader button position on window resize
- Fixed issue with setting `ex.TileMap.z` to a value
- Fixed crash in debug system if there is no collider geometry
- Fixed ImageSource loading error message [#2049]

## [0.25.0] - 2021-10-03

### Breaking Changes

- Actor Drawing: `ex.Actor.addDrawing`, `ex.Actor.setDrawing`, `onPostDraw()`, and `onPreDraw()` are no longer on by default and will be removed in v0.26.0, they are available behind a flag `ex.Flags.useLegacyDrawing()`
  - For custom drawing use the `ex.Canvas`
- `ex.Actor.rx` has been renamed to `ex.Actor.angularVelocity`
- Rename `ex.Edge` to `ex.EdgeCollider` and `ex.ConvexPolygon` to `ex.PolygonCollider` to avoid confusion and maintian consistency
- `ex.Label` constructor now only takes the option bag constructor and the font properties have been replaced with `ex.Font`
  ```typescript
  const label = new ex.Label({
    text: 'My Text',
    x: 100,
    y: 100,
    font: new ex.Font({
      family: 'Consolas',
      size: 32
    })
  });
  ```
- `ex.Physics.debug` properties for Debug drawing are now moved to `engine.debug.physics`, `engine.debug.collider`, and `engine.debug.body`.
  - Old `debugDraw(ctx: CanvasRenderingContext2D)` methods are removed.
- Collision `Pair`'s are now between Collider's and not bodies
- `PerlinNoise` has been removed from the core repo will now be offered as a [plugin](https://github.com/excaliburjs/excalibur-perlin)
- Legacy drawing implementations are moved behind `ex.LegacyDrawing` new Graphics implemenations of `Sprite`, `SpriteSheet`, `Animation` are now the default import.
  - To use any of the `ex.LegacyDrawing.*` implementations you must opt-in with the `ex.Flags.useLegacyDrawing()` note: new graphics do not work in this egacy mode
- Renames `CollisionResolutionStrategy.Box` collision resolution strategy to `Arcade`
- Renames `CollisionResolutionStrategy.RigidBody` collision resolution strategy to `Realistic`
- `Collider` is now a first class type and encapsulates what `Shape` used to be. `Collider` is no longer a member of the `Body`
- `CollisionType` and `CollisionGroup` are now a member of the `Body` component, the reasoning is they define how the simulated physics body will behave in simulation.
- `Timer`'s no longer automatically start when added to a `Scene`, this `Timer.start()` must be called. ([#1865](ttps://github.com/excaliburjs/Excalibur/issues/1865))
- `Timer.complete` is now read-only to prevent odd bugs, use `reset()`, `stop()`, and `start()` to manipulate timers.
- `Actor.actions.repeat()` and `Actor.actions.repeatForever()` now require a handler that specifies the actions to repeat. This is more clear and helps prevent bugs like #1891

  ```typescript
  const actor = new ex.Actor();

  actor.actions
    // Move up in a zig-zag by repeating 5 times
    .repeat((ctx) => {
      ctx.moveBy(10, 0, 10);
      ctx.moveBy(0, 10, 10);
    }, 5)
    .callMethod(() => {
      console.log('Done repeating!');
    });
  ```

- Removes `Entity.components` as a way to access, add, and remove components
- `ex.Camera.z` has been renamed to property `ex.Camera.zoom` which is the zoom factor
- `ex.Camera.zoom(...)` has been renamed to function `ex.Camera.zoomOverTime()`
- TileMap no longer needs registered SpriteSheets, `Sprite`'s can be added directly to `Cell`'s with `addGraphic`
  - The confusing `TileSprite` type is removed (Related to TileMap plugin updates https://github.com/excaliburjs/excalibur-tiled/issues/4, https://github.com/excaliburjs/excalibur-tiled/issues/23, https://github.com/excaliburjs/excalibur-tiled/issues/108)
- Directly changing debug drawing by `engine.isDebug = value` has been replaced by `engine.showDebug(value)` and `engine.toggleDebug()` ([#1655](https://github.com/excaliburjs/Excalibur/issues/1655))
- `UIActor` Class instances need to be replaced to `ScreenElement` (This Class it's marked as Obsolete) ([#1656](https://github.com/excaliburjs/Excalibur/issues/1656))
- Switch to browser based promise, the Excalibur implementation `ex.Promise` is marked deprecated ([#994](https://github.com/excaliburjs/Excalibur/issues/994))
- `DisplayMode`'s have changed ([#1733](https://github.com/excaliburjs/Excalibur/issues/1733)) & ([#1928](https://github.com/excaliburjs/Excalibur/issues/1928)):

  - `DisplayMode.FitContainer` fits the screen to the available width/height in the canvas parent element, while maintaining aspect ratio and resolution
  - `DisplayMode.FillContainer` update the resolution and viewport dyanmically to fill the available space in the canvas parent element, DOES NOT preserve `aspectRatio`
  - `DisplayMode.FitScreen` fits the screen to the available browser window space, while maintaining aspect ratio and resolution
  - `DisplayMode.FillScreen` now does what `DisplayMode.FullScreen` used to do, the resolution and viewport dynamically adjust to fill the available space in the window, DOES NOT preserve `aspectRatio` ([#1733](https://github.com/excaliburjs/Excalibur/issues/1733))
  - `DisplayMode.FullScreen` is now removed, use `Screen.goFullScreen()`.

- `SpriteSheet` now is immutable after creation to reduce chance of bugs if you modified a public field. The following properties are read-only: `columns`, `rows`, `spWidth`, `spHeight`, `image`, `sprites` and `spacing`.
- `Engine.pointerScope` now defaults to a more expected `ex.Input.PointerScope.Canvas` instead of `ex.Input.PointerScope.Document` which can cause frustrating bugs if building an HTML app with Excalibur

### Added

- New property `center` to `Screen` to encapsulate screen center coordinates calculation considering zoom and device pixel ratio
- New `ex.Shape.Capsule(width, height)` helper for defining capsule colliders, these are useful for ramps or jagged floor colliders.
- New collision group constructor argument added to Actor`new Actor({collisionGroup: collisionGroup})`
- `SpriteSheet.getSprite(x, y)` can retrieve a sprite from the SpriteSheet by x and y coordinate. For example, `getSprite(0, 0)` returns the top left sprite in the sheet.
  - `SpriteSheet`'s now have dimensionality with `rows` and `columns` optionally specified, if not there is always 1 row, and `sprites.length` columns
- `new Actor({radius: 10})` can now take a radius parameter to help create circular actors
- The `ExcaliburGraphicsContext` now supports drawing debug text
- `Entity` may also now optionally have a `name`, this is useful for finding entities by name or when displaying in debug mode.
- New `DebugSystem` ECS system will show debug drawing output for things toggled on/off in the `engine.debug` section, this allows for a less cluttered debug experience.
  - Each debug section now has a configurable color.
- Turn on WebGL support with `ex.Flags.useWebGL()`
- Added new helpers to `CollisionGroup` to define groups that collide with specified groups `CollisionGroup.collidesWith([groupA, groupB])`
  - Combine groups with `const groupAandB = CollisionGroup.combine([groupA, groupB])`
  - Invert a group instance `const everthingButGroupA = groupA.invert()`
- Improved Collision Simulation
  - New ECS based `CollisionSystem` and `MotionSystem`
  - Rigid body's can now sleep for improved performance
  - Multiple contacts now supported which improves stability
  - Iterative solver for improved stability
- Added `ColliderComponent` to hold individual `Collider` implementations like `Circle`, `Box`, or `CompositeCollider`
  - `Actor.collider.get()` will get the current collider
  - `Actor.collider.set(someCollider)` allows you to set a specific collider
- New `CompositeCollider` type to combine multiple colliders together into one for an entity
  - Composite colliders flatten into their individual colliders in the collision system
  - Composite collider keeps it's internal colliders in a DynamicTree for fast `.collide` checks
- New `TransformComponent` to encapsulate Entity transform, that is to say position, rotation, and scale
- New `MotionComponent` to encapsulate Entity transform values changing over time like velocity and acceleration
- Added multi-line support to `Text` graphics ([#1866](https://github.com/excaliburjs/Excalibur/issues/1866))
- Added `TileMap` arbitrary graphics support with `.addGraphic()` ([#1862](https://github.com/excaliburjs/Excalibur/issues/1862))
- Added `TileMap` row and column accessors `getRows()` and `getColumns()` ([#1859](https://github.com/excaliburjs/Excalibur/issues/1859))
- Added the ability to store arbitrary data in `TileMap` cells with `Cell.data.set('key', 'value')` and `Cell.data.get('key')` ([#1861](https://github.com/excaliburjs/Excalibur/issues/1861))
- Actions `moveTo()`, `moveBy()`, `easeTo()`, `scaleTo()`, and `scaleBy()` now have vector overloads
- `Animation.fromSpriteSheet` will now log a warning if an index into the `SpriteSheet` is invalid ([#1856](https://github.com/excaliburjs/Excalibur/issues/1856))
- `new ImageSource()` will now log a warning if an image type isn't fully supported. ([#1855](https://github.com/excaliburjs/Excalibur/issues/1855))
- `Timer.start()` to explicitly start timers, and `Timer.stop()` to stop timers and "rewind" them.
- `Timer.timeToNextAction` will return the milliseconds until the next action callback
- `Timer.timeElapsedTowardNextAction` will return the milliseconds counted towards the next action callback
- `BoundingBox` now has a method for detecting zero dimensions in width or height `hasZeroDimensions()`
- `BoundingBox`'s can now by `transform`'d by a `Matrix`
- Added `new Entity(components: Component[])` constructor overload to create entities with components quickly.
- Added `Entity.get(type: ComponentType)` to get strongly typed components if they exist on the entity.
- Added `Entity.has(type: ComponentType)` overload to check if an entity has a component of that type.
- Added `Entity.hasTag(tag: string)`, `Entity.addTag(tag: string)`, and `Entity.removeTag(tag: string, force: boolean)`.
  - Tag `offscreen` is now added to entities that are offscreen
- Added `Entity.componentAdded$` and `Entity.componentRemoved$` for observing component changes on an entity.
- For child/parent entities:
  - Added `Entity.addChild(entity: Entity)`, `Entity.removeChild(entity: Entity)`, `Entity.removeAllChildren()` for managing child entities
  - Added `Entity.addTemplate(templateEntity: Entity)` for adding template entities or "prefab".
  - Added `Entity.parent` readonly accessor to the parent (if exists), and `Entity.unparent()` to unparent an entity.
  - Added `Entity.getAncestors()` is a sorted list of parents starting with the topmost parent.
  - Added `Entity.children` readonly accessor to the list of children.
- Add the ability to press enter to start the game after loaded
- Add Excalibur Feature Flag implementation for releasing experimental or preview features ([#1673](https://github.com/excaliburjs/Excalibur/issues/1673))
- Color now can parse RGB/A string using Color.fromRGBString('rgb(255, 255, 255)') or Color.fromRGBString('rgb(255, 255, 255, 1)')
- `DisplayMode.FitScreen` will now scale the game to fit the available space, preserving the `aspectRatio`. ([#1733](https://github.com/excaliburjs/Excalibur/issues/1733))
- `SpriteSheet.spacing` now accepts a structure `{ top: number, left: number, margin: number }` for custom spacing dimensions ([#1788](https://github.com/excaliburjs/Excalibur/issues/1778))
- `SpriteSheet.ctor` now has an overload that accepts `spacing` for consistency although the object constructor is recommended ([#1788](https://github.com/excaliburjs/Excalibur/issues/1778))
- Add `SpriteSheet.getSpacingDimensions()` method to retrieve calculated spacing dimensions ([#1788](https://github.com/excaliburjs/Excalibur/issues/1778))
- Add `KeyEvent.value?: string` which is the key value (or "typed" value) that the browser detected. For example, holding Shift and pressing 9 will have a value of `(` which is the typed character.
- Add `KeyEvent.originalEvent?: KeyboardEvent` which exposes the raw keyboard event handled from the browser.
- Added a new getter to GraphicsComponent.ts called currentKeys that will return the names of the graphics shown in all layers
- Added a new getter to GraphicsLayer called currentKeys that will the names of the graphics shown in this layer

### Changed

- `Gif` now supports new graphics component
- `Algebra.ts` refactored into separate files in `Math/`
- Engine/Scene refactored to make use of the new ECS world which simplifies their logic
- `TileMap` now uses the built in `Collider` component instead of custom collision code.
- Updates the Excalibur ECS implementation for ease of use and Excalibur draw system integration
  - Adds "ex." namespace to built in component types like "ex.transform"
  - Adds `ex.World` to encapsulate all things ECS
  - Adds `ex.CanvasDrawSystem` to handle all HTML Canvas 2D drawing via ECS
  - Updates `ex.Actor` to use new `ex.TransformComponent` and `ex.CanvasDrawComponent`

### Deprecated

- `Timer.unpause()` has be deprecated in favor of `Timer.resume()` ([#1864](https://github.com/excaliburjs/Excalibur/issues/1864))
- Removed UIActor Stub in favor of ScreenElement ([#1656](https://github.com/excaliburjs/Excalibur/issues/1656))
- `ex.SortedList` as deprecated
- `ex.Promise` is marked deprecated ([#994](https://github.com/excaliburjs/Excalibur/issues/994))
- `ex.DisplayMode.Position` CSS can accomplish this task better than Excalibur ([#1733](https://github.com/excaliburjs/Excalibur/issues/1733))

### Fixed

- Fixed allow `ex.ColliderComponent` to not have a collider
- Fixed issue where collision events were not being forwarded from individual colliders in a `ex.CompositeCollider`
- Fixed issue where `ex.CompositeCollider`'s individual colliders were erroneously generating pairs
- Fixed issue where `GraphicsOptions` `width/height` could not be used to define a `ex.Sprite` with equivalent `sourceView` and `destSize` ([#1863](https://github.com/excaliburjs/Excalibur/issues/1863))
- Fixed issue where `ex.Scene.onActivate/onDeactivate` were called with the wrong arguments ([#1850](https://github.com/excaliburjs/Excalibur/issues/1850))
- Fixed issue where no width/height argmunents to engine throws an error
- Fixed issue where zero dimension image draws on the ExcaliburGraphicsContext throw an error
- Fixed issue where the first scene onInitialize fires at Engine contructor time and before the "play button" clicked ([#1900](https://github.com/excaliburjs/Excalibur/issues/1900))
- Fixed issue where the "play button" click was being interpreted as an input event excalibur needed to handle ([#1854](https://github.com/excaliburjs/Excalibur/issues/1854))
- Fixed issue where pointer events were not firing at the ex.Engine.input.pointers level ([#1439](https://github.com/excaliburjs/Excalibur/issues/1439))
- Fixed issue where pointer events propagate in an unexpected order, now they go from high z-index to low z-index ([#1922](https://github.com/excaliburjs/Excalibur/issues/1922))
- Fixed issue with Raster padding which caused images to grow over time ([#1897](https://github.com/excaliburjs/Excalibur/issues/1897))
- Fixed N+1 repeat/repeatForever bug ([#1891](https://github.com/excaliburjs/Excalibur/issues/1891))
- Fixed repeat/repeatForever issue with `rotateTo` ([#635](https://github.com/excaliburjs/Excalibur/issues/635))
- Entity update lifecycle is now called correctly
- Fixed GraphicsSystem `enterviewport` and `exitviewport` event
- Fixed DOM element leak when restarting games, play button elements piled up in the DOM.
- Fixed issues with `ex.Sprite` not rotating/scaling correctly around the anchor (Related to TileMap plugin updates https://github.com/excaliburjs/excalibur-tiled/issues/4, https://github.com/excaliburjs/excalibur-tiled/issues/23, https://github.com/excaliburjs/excalibur-tiled/issues/108)
  - Optionally specify whether to draw around the anchor or not `drawAroundAnchor`
- Fixed in the browser "FullScreen" api, coordinates are now correctly mapped from page space to world space ([#1734](https://github.com/excaliburjs/Excalibur/issues/1734))
- Fix audio decoding bug introduced in https://github.com/excaliburjs/Excalibur/pull/1707
- Fixed issue with promise resolve on double resource load ([#1434](https://github.com/excaliburjs/Excalibur/issues/1434))
- Fixed Firefox bug where scaled graphics with anti-aliasing turned off are not pixelated ([#1676](https://github.com/excaliburjs/Excalibur/issues/1676))
- Fixed z-index regression where actors did not respect z-index ([#1678](https://github.com/excaliburjs/Excalibur/issues/1678))
- Fixed Animation flicker bug when switching to an animation ([#1636](https://github.com/excaliburjs/Excalibur/issues/1636))
- Fixed `ex.Actor.easeTo` actions, they now use velocity to move Actors ([#1638](https://github.com/excaliburjs/Excalibur/issues/1638))
- Fixed `Scene` constructor signature to make the `Engine` argument optional ([#1363](https://github.com/excaliburjs/Excalibur/issues/1363))
- Fixed `anchor` properly of single shape `Actor` [#1535](https://github.com/excaliburjs/Excalibur/issues/1535)
- Fixed Safari bug where `Sound` resources would fail to load ([#1848](https://github.com/excaliburjs/Excalibur/issues/1848))

<!----------------------------------------------------------------------------------------------->

## [0.24.5] - 2020-09-07

### Breaking Changes

- [#1361] Makes use of proxies, Excalibur longer supports IE11 :boom: ([#1361]https://github.com/excaliburjs/Excalibur/issues/1361)

### Added

- Adds new ECS Foundations API, which allows excalibur core behavior to be manipulated with ECS style code ([#1361]https://github.com/excaliburjs/Excalibur/issues/1361)
  - Adds new `ex.Entity` & `ex.EntityManager` which represent anything that can do something in a Scene and are containers for Components
  - Adds new `ex.Component` type which allows encapsulation of state on entities
  - Adds new `ex.Query` & `ex.QueryManager` which allows queries over entities that match a component list
  - Adds new `ex.System` type which operates on matching Entities to do some behavior in Excalibur.
  - Adds new `ex.Observable` a small observable implementation for observing Entity component changes over time

### Fixed

- Fixed Animation flicker bug on the first frame when using animations with scale, anchors, or rotation. ([#1636](https://github.com/excaliburjs/Excalibur/issues/1636))

<!----------------------------------------------------------------------------------------------->

## [0.24.4] - 2020-09-02

### Added

- Add new `ex.Screen` abstraction to manage viewport size and resolution independently and all other screen related logic. ([#1617](https://github.com/excaliburjs/Excalibur/issues/1617))
  - New support for the browser fullscreen API
- Add color blind mode simulation and correction in debug object.
  ([#390](https://github.com/excaliburjs/Excalibur/issues/390))
- Add `LimitCameraBoundsStrategy`, which always keeps the camera locked to within the given bounds. ([#1498](https://github.com/excaliburjs/Excalibur/issues/1498))
- Add mechanisms to manipulate the `Loader` screen. ([#1417](https://github.com/excaliburjs/Excalibur/issues/1417))
  - Logo position `Loader.logoPosition`
  - Play button position `Loader.playButtonPosition`
  - Loading bar position `Loader.loadingBarPosition`
  - Loading bar color `Loader.loadingBarColor` by default is white, but can be any excalibur `ex.Color`

### Changed

- Remove usage of `mock.engine` from the tests. Use real engine instead.
- Upgrade Excalibur to TypeScript 3.9.2
- Upgrade Excalibur to Node 12 LTS

### Fixed

- Fixed Loader play button markup and styles are now cleaned up after clicked ([#1431](https://github.com/excaliburjs/Excalibur/issues/1431))
- Fixed Excalibur crashing when embedded within a cross-origin IFrame ([#1151](https://github.com/excaliburjs/Excalibur/issues/1151))
- Fixed performance issue where uneccessary effect processing was occurring for opacity changes ([#1549](https://github.com/excaliburjs/Excalibur/issues/1549))
- Fixed issue when loading images from a base64 strings that would crash the loader ([#1543](https://github.com/excaliburjs/Excalibur/issues/1543))
- Fixed issue where actors that were not in scene still received pointer events ([#1555](https://github.com/excaliburjs/Excalibur/issues/1555))
- Fixed Scene initialization order when using the lifecycle overrides ([#1553](https://github.com/excaliburjs/Excalibur/issues/1553))

<!----------------------------------------------------------------------------------------------->

## [0.24.0] - 2020-04-23

### Breaking Changes

- Remove obsolete `.extend()` semantics in Class.ts as as well as related test cases.

### Added

- Added new option for constructing bounding boxes. You can now construct with an options
  object rather than only individual coordinate parameters. ([#1151](https://github.com/excaliburjs/Excalibur/issues/1151))
- Added new interface for specifying the type of the options object passed to the
  bounding box constructor.
- Added the `ex.vec(x, y)` shorthand for creating vectors.
  ([#1340](https://github.com/excaliburjs/Excalibur/issues/1340))
- Added new event `processed` to `Sound` that passes processed `string | AudioBuffer` data. ([#1474](https://github.com/excaliburjs/Excalibur/pull/1474))
- Added new property `duration` to `Sound` and `AudioInstance` that exposes the track's duration in seconds when Web Audio API is used. ([#1474](https://github.com/excaliburjs/Excalibur/pull/1474))

### Changed

- Animation no longer mutate underlying sprites, instead they draw the sprite using the animations parameters. This allows more robust flipping at runtime. ([#1258](https://github.com/excaliburjs/Excalibur/issues/1258))
- Changed obsolete decorator to only log the same message 5 times. ([#1281](https://github.com/excaliburjs/Excalibur/issues/1281))
- Switched to core-js based polyfills instead of custom written ones ([#1214](https://github.com/excaliburjs/Excalibur/issues/1214))
- Updated to TypeScript@3.6.4 and node 10 LTS build
- `Sound.stop()` now always rewinds the track, even when the sound is paused. ([#1474](https://github.com/excaliburjs/Excalibur/pull/1474))

### Deprecated

- `ex.Vector.magnitude()` will be removed in `v0.25.0`, use `ex.Vector.size()`. ([#1277](https://github.com/excaliburjs/Excalibur/issues/1277))

### Fixed

- Fixed Excalibur crashing when displaying both a tilemap and a zero-size actor ([#1418](https://github.com/excaliburjs/Excalibur/issues/1418))
- Fixed animation flipping behavior ([#1172](https://github.com/excaliburjs/Excalibur/issues/1172))
- Fixed actors being drawn when their opacity is 0 ([#875](https://github.com/excaliburjs/Excalibur/issues/875))
- Fixed iframe event handling, excalibur will respond to keyboard events from the top window ([#1294](https://github.com/excaliburjs/Excalibur/issues/1294))
- Fixed camera to be vector backed so `ex.Camera.x = ?` and `ex.Camera.pos.setTo(...)` both work as expected([#1299](https://github.com/excaliburjs/Excalibur/issues/1299))
- Fixed missing on/once/off signatures on `ex.Pointer` ([#1345](https://github.com/excaliburjs/Excalibur/issues/1345))
- Fixed sounds not being stopped when `Engine.stop()` is called. ([#1476](https://github.com/excaliburjs/Excalibur/pull/1476))

<!----------------------------------------------------------------------------------------------->

## [0.23.0] - 2019-06-08

### Breaking Changes

- `ex.Actor.scale`, `ex.Actor.sx/sy`, `ex.Actor.actions.scaleTo/scaleBy` will not work as expected with new collider implementation, set width and height directly. These features will be completely removed in v0.24.0.

### Added

- New collision group implementation ([#1091](https://github.com/excaliburjs/Excalibur/issues/1091), [#862](https://github.com/excaliburjs/Excalibur/issues/862))
- New `ex.Collider` type which is the container for all collision related behavior and state. Actor is now extracted from collision.
- New interface `Clonable<T>` to indicate if an object contains a clone method
- New interface `Eventable<T>` to indicated if an object can emit and receive events
- `ex.Vector.scale` now also works with vector input
- `ex.BoundingBox.fromDimension(width: number, height: number)` can generate a bounding box from a width and height
- `ex.BoundingBox.translate(pos: Vector)` will create a new bounding box shifted by `pos`
- `ex.BoundingBox.scale(scale: Vector)` will create a new bounding box scaled by `scale`
- Added `isActor()` and `isCollider()` type guards
- Added `ex.CollisionShape.draw` collision shapes can now be drawn, actor's will use these shapes if no other drawing is specified
- Added a `getClosestLineBetween` method to `CollisionShape`'s for returning the closest line between 2 shapes ([#1071](https://github.com/excaliburjs/Excalibur/issues/1071))

### Changed

- Change `ex.Actor.within` to use surface of object geometry instead of the center to make judgements ([#1071](https://github.com/excaliburjs/Excalibur/issues/1071))
- Changed `moveBy`, `rotateBy`, and `scaleBy` to operate relative to the current actor position at a speed, instead of moving to an absolute by a certain time.
- Changed event handlers in excalibur to expect non-null event objects, before `hander: (event?: GameEvent) => void` implied that event could be null. This change addresses ([#1147](https://github.com/excaliburjs/Excalibur/issues/1147)) making strict null/function checks compatible with new TypeScript.
- Changed collision system to remove actor coupling, in addition `ex.Collider` is a new type that encapsulates all collision behavior. Use `ex.Actor.body.collider` to interact with collisions in Excalibur ([#1119](https://github.com/excaliburjs/Excalibur/issues/1119))
  - Add new `ex.Collider` type that is the housing for all collision related code
    - The source of truth for `ex.CollisionType` is now on collider, with a convenience getter on actor
    - The collision system now operates on `ex.Collider`'s not `ex.Actor`'s
  - `ex.CollisionType` has been moved to a separate file outside of `Actor`
    - CollisionType is switched to a string enum, style guide also updated
  - `ex.CollisionPair` now operates on a pair of `ex.Colliders`'s instead of `ex.Actors`'s
  - `ex.CollisionContact` now operates on a pair of `ex.Collider`'s instead of `ex.Actors`'s
  - `ex.Body` has been modified to house all the physical position/transform information
    - Integration has been moved from actor to `Body` as a physical concern
    - `useBoxCollision` has been renamed to `useBoxCollider`
    - `useCircleCollision` has been renamed to `useCircleCollider`
    - `usePolygonCollision` has been renamed to `usePolygonCollider`
    - `useEdgeCollision` has been renamed to `useEdgeCollider`
  - Renamed `ex.CollisionArea` to `ex.CollisionShape`
    - `ex.CircleArea` has been renamed to `ex.Circle`
    - `ex.PolygonArea` has been renamed to `ex.ConvexPolygon`
    - `ex.EdgeArea` has been renamed to `ex.Edge`
  - Renamed `getWidth()` & `setWidth()` to property `width`
    - Actor and BoundingBox are affected
  - Renamed `getHeight()` & `setHeight()` to property `height`
    - Actor and BoundingBox are affected
  - Renamed `getCenter()` to the property `center`
    - Actor, BoundingBox, and Cell are affected
  - Renamed `getBounds()` to the property `bounds`
    - Actor, Collider, and Shapes are affected
  - Renamed `getRelativeBounds()` to the property `localBounds`
    - Actor, Collider, and Shapes are affected
  - Renamed `moi()` to the property `inertia` (moment of inertia)
  - Renamed `restitution` to the property `bounciness`
  - Moved `collisionType` to `Actor.body.collider.type`
  - Moved `Actor.integrate` to `Actor.body.integrate`

### Deprecated

- Legacy groups `ex.Group` will be removed in v0.24.0, use collision groups as a replacement [#1091](https://github.com/excaliburjs/Excalibur/issues/1091)
- Legacy collision groups off `Actor` will be removed in v0.24.0, use `Actor.body.collider.collisionGroup` [#1091](https://github.com/excaliburjs/Excalibur/issues/1091)
- Removed `NaiveCollisionBroadphase` as it was no longer used
- Renamed methods and properties will be available until `v0.24.0`
- Deprecated collision attributes on actor, use `Actor.body.collider`
  - `Actor.x` & `Actor.y` will be removed in `v0.24.0` use `Actor.pos.x` & `Actor.pos.y`
  - `Actor.collisionArea` will be removed in `v0.24.0` use `Actor.body.collider.shape`
  - `Actor.getLeft()`, `Actor.getRight()`, `Actor.getTop()`, and `Actor.getBottom` are deprecated
    - Use `Actor.body.collider.bounds.(left|right|top|bottom)`
  - `Actor.getGeometry()` and `Actor.getRelativeGeometry()` are removed, use `Collider`
  - Collision related properties on Actor moved to `Collider`, use `Actor.body.collider`
    - `Actor.torque`
    - `Actor.mass`
    - `Actor.moi`
    - `Actor.friction`
    - `Actor.restitution`
  - Collision related methods on Actor moved to `Collider`, use `Actor.body.collider` or `Actor.body.collider.bounds`
    - `Actor.getSideFromIntersect(intersect)` -> `BoundingBox.sideFromIntersection`
    - `Actor.collidesWithSide(actor)` -> `Actor.body.collider.bounds.intersectWithSide`
    - `Actor.collides(actor)` -> `Actor.body.collider.bounds.intersect`

### Fixed

- Fixed issue where leaking window/document handlers was possible when calling `ex.Engine.stop()` and `ex.Engine.start()` ([#1063](https://github.com/excaliburjs/Excalibur/issues/1120))
- Fixed wrong `Camera` and `Loader` scaling on HiDPI screens when option `suppressHiDPIScaling` is set. ([#1120](https://github.com/excaliburjs/Excalibur/issues/1120))
- Fixed polyfill application by exporting a `polyfill()` function that can be called. ([#1132](https://github.com/excaliburjs/Excalibur/issues/1132))
- Fixed `Color.lighten()` ([#1084](https://github.com/excaliburjs/Excalibur/issues/1084))

<!----------------------------------------------------------------------------------------------->

## [0.22.0] - 2019-04-06

### Breaking Changes

- `ex.BaseCamera` replaced with `Camera` ([#1087](https://github.com/excaliburjs/Excalibur/issues/1087))

### Added

- Added `enableCanvasTransparency` property that can enable/disable canvas transparency ([#1096](https://github.com/excaliburjs/Excalibur/issues/1096))

### Changed

- Upgraded Excalibur to TypeScript 3.3.3333 ([#1052](https://github.com/excaliburjs/Excalibur/issues/1052))
- Added exceptions on `SpriteSheetImpl` constructor to check if the source texture dimensions are valid ([#1108](https://github.com/excaliburjs/Excalibur/issues/1108))

<!----------------------------------------------------------------------------------------------->

## [0.21.0] - 2019-02-02

### Added

- Added ability to automatically convert .gif files to SpriteSheet, Animations, and Sprites ([#153](https://github.com/excaliburjs/Excalibur/issues/153))
- New `viewport` property on camera to return a world space bounding box of the current visible area ([#1078](https://github.com/excaliburjs/Excalibur/issues/1078))

### Changed

- Updated `ex.Color` and `ex.Vector` constants to be static getters that return new instances each time, eliminating a common source of bugs ([#1085](https://github.com/excaliburjs/Excalibur/issues/1085))
- Remove optionality of engine in constructor of Scene and \_engine private with an underscore prefix ([#1067](https://github.com/excaliburjs/Excalibur/issues/1067))

### Deprecated

- Rename `ex.BaseCamera` to `Camera`, `ex.BaseCamera` will be removed in `v0.22.0` ([#1087](https://github.com/excaliburjs/Excalibur/issues/1087))

### Fixed

- Fixed issue of early offscreen culling related to zooming in and out ([#1078](https://github.com/excaliburjs/Excalibur/issues/1078))
- Fixed issue where setting `suppressPlayButton: true` blocks load in certain browsers ([#1079](https://github.com/excaliburjs/Excalibur/issues/1079))
- Fixed issue where the absence of a pointer button caused an error in the console([#1153](https://github.com/excaliburjs/Excalibur/issues/1153))

<!----------------------------------------------------------------------------------------------->

## [0.20.0] - 2018-12-10

### Breaking Changes

- `ex.PauseAfterLoader` removed, use `ex.Loader` instead ([#1031](https://github.com/excaliburjs/Excalibur/issues/1031))

### Added

- Added strongly-typed `EventTypes` enum to Events.ts to avoid magic strings ([#1066](https://github.com/excaliburjs/Excalibur/issues/1066))

### Changed

- Added parameter on SpriteSheet constructor so you can define how many pixels of space are between sprites ([#1058](https://github.com/excaliburjs/Excalibur/issues/1058))

<!----------------------------------------------------------------------------------------------->

## [0.19.1] - 2018-10-22

### Fixed

- Fixed issue where there were missing files in the dist (Loader.css, Loader.logo.png) ([#1057](https://github.com/excaliburjs/Excalibur/issues/1057))

## [0.19.0] - 2018-10-13

### Changed

- Excalibur user documentation has now moved to [excaliburjs.com/docs](https://excaliburjs.com/docs)
- Excalibur will now prompt for user input before starting the game to be inline with the new webaudio requirements from chrome/mobile browsers ([#1031](https://github.com/excaliburjs/Excalibur/issues/1031))

### Deprecated

- `PauseAfterLoader` for iOS in favor of new click-to-play functionality built into the default `Loader` ([#1031](https://github.com/excaliburjs/Excalibur/issues/1031))

### Fixed

- Fixed issue where Edge web audio playback was breaking ([#1047](https://github.com/excaliburjs/Excalibur/issues/1047))
- Fixed issue where pointer events do not work in mobile ([#1044](https://github.com/excaliburjs/Excalibur/issues/1044))
- Fixed issue where iOS was not loading by including the right polyfills ([#1043](https://github.com/excaliburjs/Excalibur/issues/1043))
- Fixed issue where sprites do not work in Firefox ([#980](https://github.com/excaliburjs/Excalibur/issues/978))
- Fixed issue where collision pairs could sometimes be incorrect ([#975](https://github.com/excaliburjs/Excalibur/issues/975))
- Fixed box collision velocity resolution so that objects resting on a surface do not accumulate velocity ([#986](https://github.com/excaliburjs/Excalibur/pull/1034))

<!----------------------------------------------------------------------------------------------->

## [0.18.0] - 2018-08-04

### Breaking Changes

- `Sound.setVolume()` replaced with `Sound.volume`
- `Sound.setLoop()` replaced with `Sound.loop`

### Added

- Add `Scene.isActorInDrawTree` method to determine if an actor is in the scene's draw tree.

### Fixed

- Fixed missing `exitviewport/enterviewport` events on Actors.on/once/off signatures ([#978](https://github.com/excaliburjs/Excalibur/issues/978))
- Fix issue where Actors would not be properly added to a scene if they were removed from that scene during the same frame ([#979](https://github.com/excaliburjs/Excalibur/issues/979))

<!----------------------------------------------------------------------------------------------->

## [0.17.0] - 2018-06-04

### Breaking Changes

- Property scope `Pointer.actorsUnderPointer` changed to private
- `Sprite.sx` replaced with `Sprite.x`
- `Sprite.sy` replaced with `Sprite.y`
- `Sprite.swidth` replaced with `Sprite.width`
- `Sprite.sheight` replaced with `Sprite.height`

### Added

- Allow timers to limit repeats to a finite number of times ([#957](https://github.com/excaliburjs/Excalibur/pull/974))
- Convenience method on Scene to determine whether it is the current scene. Scene.isCurrentScene() ([#982](https://github.com/excaliburjs/Excalibur/issues/982))
- New `PointerEvent.stopPropagation()` method added. Works the same way as (`https://developer.mozilla.org/en-US/docs/Web/API/Event/stopPropagation`)
  ([#912](https://github.com/excaliburjs/Excalibur/issues/912))
- New `Actor.getAncestors()` method, which retrieves full array of current Actor ancestors
- Static `Actor.defaults` prop, which implements `IActorDefaults`.
- Native sound events now exposed
  - `volumechange` - on playing sound volume change;
  - `pause` - on playback pause;
  - `stop` - on playback stop;
  - `emptied` - on data cleanup(f.e. when setting new data);
  - `resume` - on playback resume;
  - `playbackstart` - on playback start;
  - `playbackend` - on playback end;
- Added `Sound.instances` getter, which returns active tracks. Playing or paused
- Added `Sound.getTrackId(track: [[AudioInstance]])` method. Which returns id of track provided,
  if it is in list of active tracks.

### Changed

- Refactored Easing functions to be reversable ([#944](https://github.com/excaliburjs/Excalibur/pull/944))
- Now at creation every `Actor.anchor` prop is set to default `Actor.defaults.anchor`.
- Scene.remove(Actor) now starts the Actor.Kill event cycle ([#981](https://github.com/excaliburjs/Excalibur/issues/981))

### Deprecated

- `CapturePointer.update()` method now doesn't propagate event to actor, just verifies pointer events for actor.
- Added `Sound.volume` & `Sound.loop` properties as a replacement for `Sound.setVolume()` and `Sound.setLoop()`. The methods `setVolume` and `setLoop` have been marked obsolete.

### Fixed

- Added missing variable assignments to TileMapImpl constructor ([#957](https://github.com/excaliburjs/Excalibur/pull/957))
- Correct setting audio volume level from `value` to `setValueAtTime` to comply with deprecation warning in Chrome 59 ([#953](https://github.com/excaliburjs/Excalibur/pull/953))
- Force HiDPI scaling to always be at least 1 to prevent visual artifacts in some browsers
- Recalculate physics geometry when width/height change on Actor ([#948](https://github.com/excaliburjs/Excalibur/pull/948))
- Fix camera move chaining ([#944](https://github.com/excaliburjs/Excalibur/pull/944))
- Fix `pickSet(allowDuplicates: true)` now returns the proper length array with correct elements ([#977](https://github.com/excaliburjs/Excalibur/issues/977))
- `Index` export order to prevent `almond.js` from creation of corrupted modules loading order.
- `Sound.pause()` now saves correct timings.
- Fix `ex.Vector.isValid` edgecase at `Infinity` ([#1006](https://github.com/excaliburjs/Excalibur/issues/1006))

<!----------------------------------------------------------------------------------------------->

## [0.16.0] - 2018-03-31

### Added

- New typesafe and override safe event lifecycle overriding, all `onEventName` handlers will no longer be dangerous to override ([#582](https://github.com/excaliburjs/Excalibur/issues/582))
  - New lifecycle event `onPreKill` and `onPostKill`
- SpriteSheets can now produce animations from custom sprite coordinates `SpriteSheet.getAnimationByCoords(engine, coords[], speed)` ([#918](https://github.com/excaliburjs/Excalibur/issues/918))
- Added drag and drop support for Actors ([#134](https://github.com/excaliburjs/Excalibur/issues/134))
  - New Event `enter`
  - New Event `leave`
  - New Event `pointerenter`
  - New Event `pointerleave`
  - New Event `pointerdragstart`
  - New Event `pointerdragend`
  - New Event `pointerdragmove`
  - New Event `pointerdragenter`
  - New Event `pointerdragleave`
  - New Class `PointerDragEvent` which extends `PointerEvent`
  - New Class `GlobalCoordinates` that contains Vectors for the world, the page, and the screen.
  - Added property `ICapturePointerConfig.captureDragEvents` which controls whether to emit drag events to the actor
  - Added property `PointerEvent.pointer` which equals the original pointer object

### Deprecated

- `Sprite.sx`, `Sprite.sy`, `Sprite.swidth`, `Sprite.sheight` have been deprecated in favor of `Sprite.x`, `Sprite.y`, `Sprite.width`, `Sprite.height` ([#918](https://github.com/excaliburjs/Excalibur/issues/918))

### Fixed

- Added missing lifecycle event handlers on Actors, Triggers, Scenes, Engine, and Camera ([#582](https://github.com/excaliburjs/Excalibur/issues/582))
- Tile Maps now correctly render negative x-axis coordinates ([#904](https://github.com/excaliburjs/Excalibur/issues/904))
- Offscreen culling in HiDPI mode ([#949](https://github.com/excaliburjs/Excalibur/issues/949))
  - Correct bounds check to check drawWidth/drawHeight for HiDPI
  - suppressHiDPIScaling now also suppresses pixel ratio based scaling
- Extract and separate Sprite width/height from drawWidth/drawHeight to prevent context corruption ([#951](https://github.com/excaliburjs/Excalibur/pull/951))

<!----------------------------------------------------------------------------------------------->

## [0.15.0] - 2018-02-16

### Breaking Changes

- `LockedCamera` replaced with `BaseCamera.strategy.lockToActor`
- `SideCamera` replaced with `BaseCamera.strategy.lockToActorAxis`
- `Body.wasTouching` replaced with event type `CollisionEnd`

### Added

- Option bag constructors have been added for commonly-used classes (see [Constructors.md](https://github.com/excaliburjs/Excalibur/blob/main/src/engine/Docs/Constructors.md)) ([#410](https://github.com/excaliburjs/Excalibur/issues/410))

<!----------------------------------------------------------------------------------------------->

## [0.14.0] - 2017-12-02

### Breaking Changes

- Triggers now have a new option bag constructor using the `ITriggerOptions` interface. ([#863](https://github.com/excaliburjs/Excalibur/issues/863)).
- `update` event replaced with `postupdate` event
- `CollisionEvent` replaced by `PreCollisionEvent`
- `getDrawWidth()` and `getDrawHeight()` replaced with the getters `drawWidth` and `drawHeight`
- `PointerEvent.x` and `PointerEvent.y` replaced with `PointerEvent.pos`

### Added

- Automatic HiDPI screen detection and scaling in excalibur internals to correct blurry bitmap rendering on HiDPI screens. This feature can optionally be suppressed with `IEngineOptions.suppressHiDPIScaling`.
- Added new line utility `Line.normal()` and `Line.distanceToPoint` ([#703](https://github.com/excaliburjs/Excalibur/issues/703))
- Added new PolygonArea utility `PolygonArea.getClosestFace(point)` ([#703](https://github.com/excaliburjs/Excalibur/issues/703))
- Triggers now fire an `EnterTriggerEvent` when an actor enters the trigger, and an `ExitTriggerEvent` when an actor exits the trigger. ([#863](https://github.com/excaliburjs/Excalibur/issues/863))
- Actors have a new events `CollisionStart` which when 2 actors first start colliding and `CollisionEnd` when 2 actors are no longer colliding. ([#863](https://github.com/excaliburjs/Excalibur/issues/863))
- New camera strategies implementation for following targets in a scene. Allows for custom strategies to be implemented on top of some prebuilt
  - `LockCameraToActorStrategy` which behaves like `LockedCamera` and can be switched on with `Camera.strategy.lockToActor(actor)`.
  - `LockCameraToActorAxisStrategy` which behaves like `SideCamera` and can be switched on with `Camera.strategy.lockToActorAxis(actor, ex.Axis.X)`
  - `ElasticToActorStrategy` which is a new strategy that elastically moves the camera to an actor and can be switched on with `Camera.strategy.elasticToActor(actor, cameraElasticity, cameraFriction)`
  - `CircleAroundActorStrategy` which is a new strategy that will follow an actor when a certain radius from the camera focus and can be switched on with `Camera.strategy.circleAroundActor(actor)`

### Changed

- `Trigger` has been rebuilt to provide a better experience
  - The trigger `action` only fires when an actor enters the designated area instead of every frame of collision. ([#863](https://github.com/excaliburjs/Excalibur/issues/863))
  - Triggers can now draw like other Actors, but are still not visible by default ([#863](https://github.com/excaliburjs/Excalibur/issues/863))

### Deprecated

- `Body.wasTouching` has been deprecated in favor of a new event type `CollisionEnd` ([#863](https://github.com/excaliburjs/Excalibur/issues/863))
- `SideCamera` and `LockedCamera` are deprecated in favor of camera strategies

### Fixed

- Fixed odd jumping behavior when polygons collided with the end of an edge ([#703](https://github.com/excaliburjs/Excalibur/issues/703))

<!----------------------------------------------------------------------------------------------->

## [0.13.0] - 2017-10-07

### Breaking Changes

- `Scene.children` replaced with `Scene.actors`

### Added

- Convenience getters implemented `halfDrawWidth`, `halfDrawHeight`, `halfCanvasWidth`, `halfCanvasHeight`, `canvasWidth`, and `canvasHeight`.
- New pause/unpause feature for timers to help with more robust pausing ([#885](https://github.com/excaliburjs/Excalibur/issues/885))
- New event listening feature to listen to events only `.once(...)` then unsubscribe automatically ([#745](https://github.com/excaliburjs/Excalibur/issues/745))
- New collision event `postcollision` to indicate if collision resolution occured ([#880](https://github.com/excaliburjs/Excalibur/issues/880))

### Deprecated

- `PointerEvent.x` and `PointerEvent.y`, in favor of `PointerEvent.pos` ([#612](https://github.com/excaliburjs/Excalibur/issues/612))
- `CollisionEvent` has been deprecated in favor of the more clear `PreCollisionEvent` ([#880](https://github.com/excaliburjs/Excalibur/issues/880))
- `getDrawWidth()` and `getDrawHeight()` have been marked obsolete and changed into the getters `drawWidth` and `drawHeight` respectively in order to progressively make getters/setters consistent ([#861](https://github.com/excaliburjs/Excalibur/issues/612))

### Fixed

- Fixed same instance of color potentially being shared, and thus mutated, between instance actors ([#840](https://github.com/excaliburjs/Excalibur/issues/840))
- Fixed bug where active and passive type collisions would resolve when they shouldn't in rigid body physics mode ([#880](https://github.com/excaliburjs/Excalibur/issues/880))

<!----------------------------------------------------------------------------------------------->

## [0.12.0] 2017-08-12

### Breaking Changes

- `CollisionType.Elastic` has been removed
- `Promises.wrap` has been replaced with `Promise.resolve`

### Added

- Added new hsl and hex format options in Color.toString(format). rgb is the default to maintain backwards compatibility ([#852](https://github.com/excaliburjs/Excalibur/issues/852))

### Changed

- `Animation.loop` property now to set to `true` by default ([#583](https://github.com/excaliburjs/Excalibur/issues/583))
- Added backgroundColor to engine options as part of Engine constructor ([#846](https://github.com/excaliburjs/Excalibur/issues/846))

### Deprecated

- `ex.Scene.children` is now `ex.Scene.actors` ([#796](https://github.com/excaliburjs/Excalibur/issues/796))

<!----------------------------------------------------------------------------------------------->

## [0.11.0] 2017-06-10

### Breaking Changes

- Renamed `Utils.removeItemToArray()` to `Utils.removeItemFromArray()` ([#798](https://github.com/excaliburjs/Excalibur/issues/798/))

### Added

- Added optional volume argument to `Sound.play(volume?: number)`, which will play the Audio file at anywhere from mute (`volume` is 0.0) to full volume (`volume` is 1.0). ([#801](https://github.com/excaliburjs/Excalibur/issues/801))
- Added another DisplayMode option: `DisplayMode.Position`. When this is selected as the displayMode type, the user must specify a new `position` option ([#781](https://github.com/excaliburjs/Excalibur/issues/781))
- Added a static method `distance` to the `Vector` class ([#517](https://github.com/excaliburjs/Excalibur/issues/517))
- Added `WheelEvent` event type for the `wheel` browser event, Excalibur now supports scroll wheel ([#808](https://github.com/excaliburjs/Excalibur/issues/808/))

### Changed

- Camera zoom over time now returns a promise that resolves on completion ([#800](https://github.com/excaliburjs/Excalibur/issues/800))
- Edge builds have more descriptive versions now containing build number and Git commit hash (e.g. `0.10.0-alpha.105#commit`) ([#777](https://github.com/excaliburjs/Excalibur/issues/777))

### Fixed

- Fixed camera zoom over time, before it did not work at all ([#800](https://github.com/excaliburjs/Excalibur/issues/800))
- Fixed semi-colon key not being detected on Firefox and Opera. ([#789](https://github.com/excaliburjs/Excalibur/issues/789))

<!----------------------------------------------------------------------------------------------->

## [0.10.0] 2017-04-07

### Breaking Changes

- Rename `Engine.width` and `Engine.height` to be `Engine.canvasWidth` and `Engine.canvasHeight` ([#591](https://github.com/excaliburjs/Excalibur/issues/591))
- Rename `Engine.getWidth` and `Engine.getHeight` to be `Engine.getDrawWidth` and `Engine.getDrawHeight` ([#591](https://github.com/excaliburjs/Excalibur/issues/591))
- Changed `GameEvent` to be a generic type for TypeScript, allowing strongly typing the `target` property. ([#724](https://github.com/excaliburjs/Excalibur/issue/724))
- Removed `Body.useEdgeCollision()` parameter `center` ([#724](https://github.com/excaliburjs/Excalibur/issue/724))

### Added

- Added `Engine.isPaused` to retrieve the running status of Engine ([#750](https://github.com/excaliburjs/Excalibur/issues/750))
- Added `Engine.getWorldBounds` to provide a quick way to get the top left corner and bottom right corner of the screen ([#729](https://github.com/excaliburjs/Excalibur/issues/729))
- Added predraw and postdraw events to `Engine` class. These events happen when prior to and after a draw ([#744](https://github.com/excaliburjs/Excalibur/issues/744))
- Added Perlin noise generation helper `ex.PerlinGenerator` for 1d, 2d, and 3d noise, along with drawing utilities ([#491](https://github.com/excaliburjs/Excalibur/issues/491))
- Added font styles support for normal, italic, and oblique in addition to bold text support ([#563](https://github.com/excaliburjs/Excalibur/issues/563))

### Changed

- Update project to use TypeScript 2.2.2 ([#762](https://github.com/excaliburjs/Excalibur/issues/762))
- Changed `Util.extend` to include `Object.assign` functionality ([#763](https://github.com/excaliburjs/Excalibur/issues/763))

### Fixed

- Update the order of the affine transformations to fix bug when scaling and rotating Actors ([#770](https://github.com/excaliburjs/Excalibur/issues/770))

<!----------------------------------------------------------------------------------------------->

## [0.9.0] 2017-02-09

### Added

- Added `preupdate`, `postupdate`, `predraw`, `postdraw` events to TileMap
- Added `ex.Random` with seed support via Mersenne Twister algorithm ([#538](https://github.com/excaliburjs/Excalibur/issues/538))
- Added extended feature detection and reporting to `ex.Detector` ([#707](https://github.com/excaliburjs/Excalibur/issues/707))
  - `ex.Detector.getBrowserFeatures()` to retrieve the support matrix of the current browser
  - `ex.Detector.logBrowserFeatures()` to log the support matrix to the console (runs at startup when in Debug mode)
- Added `@obsolete` decorator to help give greater visibility to deprecated methods ([#684](https://github.com/excaliburjs/Excalibur/issues/684))
- Added better support for module loaders and TypeScript importing. See [Installation](https://excaliburjs.com/docs/installation) docs for more info. ([#606](https://github.com/excaliburjs/Excalibur/issues/606))
- Added new Excalibur example project templates ([#706](https://github.com/excaliburjs/Excalibur/issues/706), [#733](https://github.com/excaliburjs/Excalibur/issues/733)):
  - [Browserify](https://github.com/excaliburjs/example-ts-browserify)
  - [Webpack](https://github.com/excaliburjs/example-ts-webpack)
  - [Angular2](https://github.com/excaliburjs/example-ts-angular2)
  - [Universal Windows Platform (UWP)](https://github.com/excaliburjs/example-uwp)
  - [Apache Cordova](https://github.com/excaliburjs/example-cordova)
  - [Xamarin Forms](https://github.com/excaliburjs/example-xamarin)
  - [Electron](https://github.com/excaliburjs/example-electron)
- Added `Pointer.lastPagePos`, `Pointer.lastScreenPos` and `Pointer.lastWorldPos` that store the last pointer move coordinates ([#509](https://github.com/excaliburjs/Excalibur/issues/509))

### Changed

- Changed `Util.clamp` to use math libraries ([#536](https://github.com/excaliburjs/Excalibur/issues/536))
- Upgraded to TypeScript 2.1.4 ([#726](https://github.com/excaliburjs/Excalibur/issues/726))

### Fixed

- Fixed Scene/Actor activation and initialization order, actors were not being initialized before scene activation causing bugs ([#661](https://github.com/excaliburjs/Excalibur/issues/661))
- Fixed bug where the engine would not load if a loader was provided without any resources ([#565](https://github.com/excaliburjs/Excalibur/issues/565))
- Fixed bug where an Actor/UIActor/TileMap added during a Timer callback would not initialize before running `draw` loop. ([#584](https://github.com/excaliburjs/Excalibur/issues/584))
- Fixed bug where on slower systems a Sprite may not be drawn on the first `draw` frame ([#748](https://github.com/excaliburjs/Excalibur/issues/748))

<!----------------------------------------------------------------------------------------------->

## [0.8.0] 2016-12-04

### Added

- `ex.Vector.magnitude` alias that calls `ex.Vector.distance()` to get magnitude of Vector ([#663](https://github.com/excaliburjs/Excalibur/issues/663))
- Added new `ex.Line` utilities ([#662](https://github.com/excaliburjs/Excalibur/issues/662)):
  - `ex.Line.slope` for the raw slope (m) value
  - `ex.Line.intercept` for the Y intercept (b) value
  - `ex.Line.findPoint(x?, y?)` to find a point given an X or a Y value
  - `ex.Line.hasPoint(x, y, threshold)` to determine if given point lies on the line
- Added `Vector.One` and `Vector.Half` constants ([#649](https://github.com/excaliburjs/Excalibur/issues/649))
- Added `Vector.isValid` to check for null, undefined, Infinity, or NaN vectors method as part of ([#665](https://github.com/excaliburjs/Excalibur/issues/665))
- Added `ex.Promise.resolve` and `ex.Promise.reject` static methods ([#501](https://github.com/excaliburjs/Excalibur/issues/501))
- PhantomJS based testing infrastructure to accurately test browser features such as image diffs on canvas drawing ([#521](https://github.com/excaliburjs/Excalibur/issues/521))
- Added some basic debug stat collection to Excalibur ([#97](https://github.com/excaliburjs/Excalibur/issues/97)):
  - Added `ex.Engine.stats` to hold frame statistic information
  - Added `ex.Engine.debug` to hold debug flags and current frame stats
  - Added `preframe` and `postframe` events to `Engine` as hooks
  - Added ex.Physics statistics to the Excalibur statistics collection
- Added new fast body collision detection to Excalibur to prevent fast moving objects from tunneling through other objects ([#665](https://github.com/excaliburjs/Excalibur/issues/665))
  - Added DynamicTree raycast to query the scene for bounds that intersect a ray
  - Added fast BoundingBox raycast test

### Changed

- Internal physics names refactored to be more readable and to use names more in line with game engine terminology (explicit broadphase and narrowphase called out)

### Deprecated

- `ex.Promise.wrap` ([#501](https://github.com/excaliburjs/Excalibur/issues/501))

### Fixed

- Fix `Actor.oldPos` and `Actor.oldVel` values on update ([#666](https://github.com/excaliburjs/Excalibur/issues/666))
- Fix `Label.getTextWidth` returns incorrect result ([#679](https://github.com/excaliburjs/Excalibur/issues/679))
- Fix semi-transparent PNGs appear garbled ([#687](https://github.com/excaliburjs/Excalibur/issues/687))
- Fix incorrect code coverage metrics, previously our test process was reporting higher than actual code coverage ([#521](https://github.com/excaliburjs/Excalibur/issues/521))
- Fix `Actor.getBounds()` and `Actor.getRelativeBounds()` to return accurate bounding boxes based on the scale and rotation of actors. ([#692](https://github.com/excaliburjs/Excalibur/issues/692))

<!----------------------------------------------------------------------------------------------->

## [0.7.1] - 2016-10-03

### Breaking Changes

- Refactored and modified Sound API ([#644](https://github.com/excaliburjs/Excalibur/issues/644))
  - `Sound.setData` now returns a Promise which differs from previous API
  - Removed internal `FallbackAudio` and `Sound` classes and replaced with single `Sound` class
  - Added `AudioTagInstance` and `WebAudioInstance` internal classes

### Added

- `ex.Promise.join(Promise[])` support (in addition to `...promises` support) ([#642](https://github.com/excaliburjs/Excalibur/issues/642))
- Moved build artifacts to separate [excalibur-dist](https://github.com/excaliburjs/excalibur-dist) repository ([#648](https://github.com/excaliburjs/Excalibur/issues/648))
- `ex.Events` namespace and typed event handler `.on(...)` overloads for default events on core excalibur objects ([#639](https://github.com/excaliburjs/Excalibur/issues/639))
- `Engine.timescale` property (default: 1.0) to add time-scaling to the engine for time-based movements ([#543](https://github.com/excaliburjs/Excalibur/issues/543))
- Two new parameters to `ex.Util.DrawUtil.line` that accept a line thickness and end-cap style ([#658](https://github.com/excaliburjs/Excalibur/issues/658))

### Fixed

- `Actor.actions.fade` properly supporting fading between 0 and 1 and vice versa ([#640](https://github.com/excaliburjs/Excalibur/issues/640))
- Fix issues with audio offset tracking and muting while game is invisible ([#644](https://github.com/excaliburjs/Excalibur/issues/644))
- `Actor.getHeight()` and `Actor.getWidth()` now take into account parent scaling ([#645](https://github.com/excaliburjs/Excalibur/issues/645))
- `Actor.debugDraw` now works properly for child actors ([#505](https://github.com/excaliburjs/Excalibur/issues/505), [#645](https://github.com/excaliburjs/Excalibur/issues/645))
- Sprite culling was double scaling calculations ([#646](https://github.com/excaliburjs/Excalibur/issues/646))
- Fix negative zoom sprite culling ([#539](https://github.com/excaliburjs/Excalibur/issues/539))
- Fix Actor updates happening more than once per frame, causing multiple pointer events to trigger ([#643](https://github.com/excaliburjs/Excalibur/issues/643))
- Fix `Actor.on('pointerup')` capturePointer events opt-in on event handler. The opt-in was triggering correctly for handlers on 'pointerdown' and 'pointermove', but not 'pointerup'.

<!----------------------------------------------------------------------------------------------->

## [0.7.0] - 2016-08-29

### Breaking Changes

- Code marked 'Obsolete' has been removed ([#625](https://github.com/excaliburjs/Excalibur/issues/625), [#603](https://github.com/excaliburjs/Excalibur/issues/603))
  - `Actor`
    - `addEventListener`
    - `getWorldX`, `getWorldY`
    - `clearActions`, `easeTo`, `moveTo`, `moveBy`, `rotateTo`, `rotateBy`, `scaleTo`, `scaleBy`, `blink`, `fade`, `delay`, `die`, `callMethod`, `asPromise`, `repeat`, `repeatForever`, `follow`, `meet`
  - `Class`
    - `addEventListener`, `removeEventListener`
  - `Engine`
    - parameterized constructor
    - `addChild`, `removeChild`
  - `UpdateEvent` removed
- `Scene.addChild` and `Scene.removeChild` are now protected
- Removed ex.Template and ex.Binding ([#627](https://github.com/excaliburjs/Excalibur/issues/627))

### Added

- New physics system, physical properties for Actors ([#557](https://github.com/excaliburjs/Excalibur/issues/557), [#472](https://github.com/excaliburjs/Excalibur/issues/472))
- Read The Docs support for documentation ([#558](https://github.com/excaliburjs/Excalibur/issues/558))
- Continuous integration builds unstable packages and publishes them ([#567](https://github.com/excaliburjs/Excalibur/issues/567))
- Sound and Texture resources can now process data ([#574](https://github.com/excaliburjs/Excalibur/issues/574))
- Actors now throw an event when they are killed ([#585](https://github.com/excaliburjs/Excalibur/issues/585))
- "Tap to Play" button for iOS to fulfill platform audio requirements ([#262](https://github.com/excaliburjs/Excalibur/issues/262))
- Generic lerp/easing functions ([#320](https://github.com/excaliburjs/Excalibur/issues/320))
- Whitespace checking for conditional statements ([#634](https://github.com/excaliburjs/Excalibur/issues/634))
- Initial support for [Yeoman generator](https://github.com/excaliburjs/generator-excalibur) ([#578](https://github.com/excaliburjs/Excalibur/issues/578))

### Changed

- Upgraded Jasmine testing framework to version 2.4 ([#126](https://github.com/excaliburjs/Excalibur/issues/126))
- Updated TypeScript to 1.8 ([#596](https://github.com/excaliburjs/Excalibur/issues/596))
- Improved contributing document ([#560](https://github.com/excaliburjs/Excalibur/issues/560))
- Improved local and global coordinate tracking for Actors ([#60](https://github.com/excaliburjs/Excalibur/issues/60))
- Updated loader image to match new logo and theme ([#615](https://github.com/excaliburjs/Excalibur/issues/615))
- Ignored additional files for Bower publishing ([#614](https://github.com/excaliburjs/Excalibur/issues/614))

### Fixed

- Actions on the action context threw an error ([#564](https://github.com/excaliburjs/Excalibur/issues/564))
- Actor `getLeft()`, `getTop()`, `getBottom()` and `getRight()` did not respect anchors ([#568](https://github.com/excaliburjs/Excalibur/issues/568))
- Actor.actions.rotateTo and rotateBy were missing RotationType ([#575](https://github.com/excaliburjs/Excalibur/issues/575))
- Actors didn't behave correctly when killed and re-added to game ([#586](https://github.com/excaliburjs/Excalibur/issues/586))
- Default fontFamily for Label didn't work with custom FontSize or FontUnit ([#471](https://github.com/excaliburjs/Excalibur/issues/471))
- Fixed issues with testing sandbox ([#609](https://github.com/excaliburjs/Excalibur/issues/609))
- Issue with camera lerp ([#555](https://github.com/excaliburjs/Excalibur/issues/555))
- Issue setting initial opacity on Actors ([#511](https://github.com/excaliburjs/Excalibur/issues/511))
- Children were not being updated by their parent Actors ([#616](https://github.com/excaliburjs/Excalibur/issues/616))
- Center-anchored Actors were not drawn at the correct canvas coordinates when scaled ([#618](https://github.com/excaliburjs/Excalibur/issues/618))

<!----------------------------------------------------------------------------------------------->

## [0.6.0] - 2016-01-19

### Added

- GamePads now have a connection event ([#473](https://github.com/excaliburjs/Excalibur/issues/473))
- Unit circle drawing for debug mode ([#467](https://github.com/excaliburjs/Excalibur/issues/467))
- Engine now fails gracefully in unsupported browsers ([#386](https://github.com/excaliburjs/Excalibur/issues/386))
- Global fatal error catching ([#381](https://github.com/excaliburjs/Excalibur/issues/381))
- MockEngine for testing ([#360](https://github.com/excaliburjs/Excalibur/issues/360))
- Code coverage reports via Coveralls ([#169](https://github.com/excaliburjs/Excalibur/issues/169))
- SpriteFonts now support different target colors ([#148](https://github.com/excaliburjs/Excalibur/issues/148))
- Cameras now have position, velocity, and acceleration properties ([#490](https://github.com/excaliburjs/Excalibur/issues/490))

### Changed

- `Actor.addChild()` changed to `Actor.add()` ([#519](https://github.com/excaliburjs/Excalibur/issues/519))
- `Actor.removeChild()` changed to `Actor.remove()` ([#519](https://github.com/excaliburjs/Excalibur/issues/519))
- Documentation is only deployed on changes to the main git branch ([#483](https://github.com/excaliburjs/Excalibur/issues/483))
- A warning message is now displayed if no supported audio format is provided for a browser ([#476](https://github.com/excaliburjs/Excalibur/issues/476))
- Updated TSLint directory scanning ([#442](https://github.com/excaliburjs/Excalibur/issues/442), [#443](https://github.com/excaliburjs/Excalibur/issues/443), [#447](https://github.com/excaliburjs/Excalibur/issues/447))
- Deprecated older methods ([#399](https://github.com/excaliburjs/Excalibur/issues/399))
- Changed API for Key events ([#502](https://github.com/excaliburjs/Excalibur/issues/502))

### Fixed

- Actors now properly collide with TileMaps ([#541](https://github.com/excaliburjs/Excalibur/issues/541))
- Gamepad detection is fixed ([#460](https://github.com/excaliburjs/Excalibur/issues/460), [#518](https://github.com/excaliburjs/Excalibur/issues/518))
- Actor scale now correctly occurs after translation ([#514](https://github.com/excaliburjs/Excalibur/issues/514))
- Actors now respect the `visible` property of their children ([#513](https://github.com/excaliburjs/Excalibur/issues/513))
- Fixed centered sprite drawing on Actors ([#507](https://github.com/excaliburjs/Excalibur/issues/507))
- Animation `freezeframe` is now properly set to last Animation frame by default ([#506](https://github.com/excaliburjs/Excalibur/issues/506))
- It is no longer possible to add the same Actor to a scene multiple times ([#504](https://github.com/excaliburjs/Excalibur/issues/504))
- Text alignment on SpriteFonts with Labels is fixed ([#484](https://github.com/excaliburjs/Excalibur/issues/484))
- Engine pointer events properly fire when a camera is zoomed ([#480](https://github.com/excaliburjs/Excalibur/issues/480))
- Fixed a small bug in rotateTo ([#469](https://github.com/excaliburjs/Excalibur/issues/469))
- Setting Label colors now works ([#468](https://github.com/excaliburjs/Excalibur/issues/468))
- Labels now respect set font ([#372](https://github.com/excaliburjs/Excalibur/issues/372))
- UIActor now respects visibility ([#368](https://github.com/excaliburjs/Excalibur/issues/368))
- Solid color Actors now respect opacity ([#364](https://github.com/excaliburjs/Excalibur/issues/364))
- TileMap culling uses proper width and height values ([#293](https://github.com/excaliburjs/Excalibur/issues/293))
- Font API changed while fixing font size issue

<!----------------------------------------------------------------------------------------------->

## [0.5.1] - 2015-06-26

### Added

- Actors can now recursively check the containment of their children ([#453](https://github.com/excaliburjs/Excalibur/issues/453))
- `RotateTo` and `RotateBy` now support ShortestPath, LongestPath, Clockwise, and Counterclockwise rotation ([#461](https://github.com/excaliburjs/Excalibur/issues/461))

### Fixed

- `Actor.contains()` did not work for child actors ([#147](https://github.com/excaliburjs/Excalibur/issues/147))
- Unexpected placement occasionally occurred for Actors with certain collision types ([#319](https://github.com/excaliburjs/Excalibur/issues/319))
- Velocity wasn’t updating properly when fixed and active Actors collided ([#454](https://github.com/excaliburjs/Excalibur/issues/454))
- Actors removed with actor.kill() were not being removed from the draw tree ([#458](https://github.com/excaliburjs/Excalibur/issues/458))
- `RotateTo` and `RotateBy` weren’t using the shortest angle by default ([#282](https://github.com/excaliburjs/Excalibur/issues/282))
- Sprite width and height didn’t take scaling into account ([#437](https://github.com/excaliburjs/Excalibur/issues/437))
- Fixed error message when calling `Actor.setDrawing()` on a non-existent key ([#456](https://github.com/excaliburjs/Excalibur/issues/456))

<!----------------------------------------------------------------------------------------------->

## [0.5.0] - 2015-06-03

### Added

- resource cache busting ([#280](https://github.com/excaliburjs/Excalibur/issues/280))
- HTML5 Gamepad API support ([#15](https://github.com/excaliburjs/Excalibur/issues/15))
- Browserify support ([#312](https://github.com/excaliburjs/Excalibur/issues/312))
- ‘blur’ and ‘visible’ events to detect when the browser window a game is in has focus ([#385](https://github.com/excaliburjs/Excalibur/issues/385))
- Z-index support for Actors, allowing for specific ordered drawing ([#356](https://github.com/excaliburjs/Excalibur/issues/356))
- unlocked drawing for UI elements ([#354](https://github.com/excaliburjs/Excalibur/issues/354))
- `Promise.join()` to return a new promise when promises passed to it have been resolved ([#341](https://github.com/excaliburjs/Excalibur/issues/341), [#340](https://github.com/excaliburjs/Excalibur/issues/340))
- ability to skip a frame in an animation ([#313](https://github.com/excaliburjs/Excalibur/issues/313))
- You can now remove effects from `IDrawable` objects ([#303](https://github.com/excaliburjs/Excalibur/issues/303))
- generic `Resource` type to allow for XHR loading ([#297](https://github.com/excaliburjs/Excalibur/issues/297))
- gray `Color` constants ([#209](https://github.com/excaliburjs/Excalibur/issues/209))

### Changed

- Renamed `engine.addChild()` to `engine.add()` ([#288](https://github.com/excaliburjs/Excalibur/issues/288))
- Renamed `setSpriteTransformationPoint()` to `setAnchor()` ([#269](https://github.com/excaliburjs/Excalibur/issues/269))
- Renamed `TopCamera` to `LockedCamera` ([#184](https://github.com/excaliburjs/Excalibur/issues/184))
- Renamed `Actor.pipeline` to `Actor.traits` ([#351](https://github.com/excaliburjs/Excalibur/issues/351))
- Actor anchoring now uses center origin by default ([#299](https://github.com/excaliburjs/Excalibur/issues/299))
- Actor updates (movement, collision, etc.) now use a pipeline ([#330](https://github.com/excaliburjs/Excalibur/issues/330))
- Organized classes, files, and project structure ([#182](https://github.com/excaliburjs/Excalibur/issues/182), [#347](https://github.com/excaliburjs/Excalibur/issues/347))
- Improvements to collision detection ([#345](https://github.com/excaliburjs/Excalibur/issues/345), [#332](https://github.com/excaliburjs/Excalibur/issues/332))
- Loop optimizations for performance improvements ([#296](https://github.com/excaliburjs/Excalibur/issues/296))
- Updated to TypeScript 1.4 ([#393](https://github.com/excaliburjs/Excalibur/issues/393))
- Improved pointer event handling so touch and mouse events can be captured together ([#334](https://github.com/excaliburjs/Excalibur/issues/334))
- Improved `Point` and `Vector` methods and rotation ([#323](https://github.com/excaliburjs/Excalibur/issues/323), [#302](https://github.com/excaliburjs/Excalibur/issues/302))
- `Color` is now treated as a vector to allow for changes ([#298](https://github.com/excaliburjs/Excalibur/issues/298))
- Cleaned up event type consistency ([#273](https://github.com/excaliburjs/Excalibur/issues/273))
- There is now a default instance of a `Camera` ([#270](https://github.com/excaliburjs/Excalibur/issues/270))
- TSLint now used to enforce code quality

### Fixed

- A Sprite’s dimensions weren’t validated against the size of its texture ([#318](https://github.com/excaliburjs/Excalibur/issues/318))
- Improved sprite drawing performance issues ([#316](https://github.com/excaliburjs/Excalibur/issues/316))
- Actors were sometimes throwing duplicate collision events ([#284](https://github.com/excaliburjs/Excalibur/issues/284))
- Actors were not setting their initial opacity correctly ([#307](https://github.com/excaliburjs/Excalibur/issues/307))
- Particle emitters couldn’t emit less than 60 particles per second ([#301](https://github.com/excaliburjs/Excalibur/issues/301))
- Fixed issue with TileMap collisions ([#286](https://github.com/excaliburjs/Excalibur/issues/286))
- Animations with duplicate frames weren’t being created correctly ([#283](https://github.com/excaliburjs/Excalibur/issues/283))
- Separated drawing and collision logic for CollisionMaps (now TileMap) ([#285](https://github.com/excaliburjs/Excalibur/issues/285))
- Errors in promises were being swallowed if no error callback was supplied ([#337](https://github.com/excaliburjs/Excalibur/issues/337))
- A null promise was being returned if no loader was given to `Engine.start()` ([#335](https://github.com/excaliburjs/Excalibur/issues/335))
- Changed default collisionType to ‘PreventCollision’ ([#324](https://github.com/excaliburjs/Excalibur/issues/324))
- Color didn’t handle alpha = 0 correctly ([#257](https://github.com/excaliburjs/Excalibur/issues/257))
- Blink action usage was confusing ([#279](https://github.com/excaliburjs/Excalibur/issues/279))
- Couldn’t use the `width` and `height` properties of a Texture after it loaded ([#355](https://github.com/excaliburjs/Excalibur/issues/355))
- Using `on(‘pointerdown’)` would not automatically enable pointer capturing ([#398](https://github.com/excaliburjs/Excalibur/issues/398))
- Unsubscribing from an event sometimes removed other event handlers ([#366](https://github.com/excaliburjs/Excalibur/issues/366))
- `Actor.setCenterDrawing()` was hard-coded to true ([#375](https://github.com/excaliburjs/Excalibur/issues/375))
- Console was undefined in IE9. ([#378](https://github.com/excaliburjs/Excalibur/issues/378))
- Pointers were not handling mobile Safari touch events ([#382](https://github.com/excaliburjs/Excalibur/issues/382))
- Fixed debug mode drawing ([#274](https://github.com/excaliburjs/Excalibur/issues/274))
- Flipping a sprite didn’t factor in scaling ([#401](https://github.com/excaliburjs/Excalibur/issues/401))
- Sound continued to play when the game was paused ([#383](https://github.com/excaliburjs/Excalibur/issues/383))
- `UIActor.kill()` didn’t remove the actor ([#373](https://github.com/excaliburjs/Excalibur/issues/373))
- Passing an empty array to `ex.Promise.join` resulted in unresolved promises ([#365](https://github.com/excaliburjs/Excalibur/issues/365))
- MouseUp / TouchEnd events weren’t capture correctly if outside of canvas ([#374](https://github.com/excaliburjs/Excalibur/issues/374))
- Clearing actions from an empty action queue caused problems ([#409](https://github.com/excaliburjs/Excalibur/issues/409))
- `Scene.onActivate()` was being called before Scene.onInitialize() ([#418](https://github.com/excaliburjs/Excalibur/issues/418))
- New z-indexing wasn’t cleaning up after itself ([#433](https://github.com/excaliburjs/Excalibur/issues/433))
- Fixed issue with world / screen coordinates in UIActors ([#371](https://github.com/excaliburjs/Excalibur/issues/371))
- Fade action didn’t work for text ([#261](https://github.com/excaliburjs/Excalibur/issues/261))
- Fade action didn’t work for plain-color actors ([#256](https://github.com/excaliburjs/Excalibur/issues/256))
- Collision events weren’t being published for both collision participants ([#254](https://github.com/excaliburjs/Excalibur/issues/254))
- The loading bar was misrepresenting the time taken to decode audio files ([#106](https://github.com/excaliburjs/Excalibur/issues/106))
- `actor.getCenter()` wasn’t returning the correct value ([#438](https://github.com/excaliburjs/Excalibur/issues/438))
- Cameras were on the engine instead of the scene, resulting in scene transition problems ([#277](https://github.com/excaliburjs/Excalibur/issues/277))
- Actors with sprites larger than the actor would disappear prematurely from the screen ([#287](https://github.com/excaliburjs/Excalibur/issues/287))
- Derived classes can now use offscreen culling ([#294](https://github.com/excaliburjs/Excalibur/issues/294))
- Fixed issue with TileMap culling ([#444](https://github.com/excaliburjs/Excalibur/issues/444))

<!----------------------------------------------------------------------------------------------->

## [0.2.2] - 2014-04-15

### Fixed

- Removed extra declarations file from package that was causing visual studio build problems

<!----------------------------------------------------------------------------------------------->

## [0.2.0] - 2014-04-09

### Added

- Visual Studio 2013 template support ([#139](https://github.com/excaliburjs/Excalibur/issues/139))
- Collision Map for building large static collidable levels ([#33](https://github.com/excaliburjs/Excalibur/issues/33))
- Redundant fallback sound sources for cross browser support ([#125](https://github.com/excaliburjs/Excalibur/issues/125))
- Particle Emitter implementation ([#52](https://github.com/excaliburjs/Excalibur/issues/52))
- Trigger implementation ([#91](https://github.com/excaliburjs/Excalibur/issues/91))
- Timer implementation ([#76](https://github.com/excaliburjs/Excalibur/issues/76))
- Camera Effects: zoom, shake ([#55](https://github.com/excaliburjs/Excalibur/issues/55))
- Polygon IDrawable ([#93](https://github.com/excaliburjs/Excalibur/issues/93))
- Alias 'on' and 'off' for 'addEventListener' and 'removeEventListener' ([#229](https://github.com/excaliburjs/Excalibur/issues/229))
- Optimized draw so only on screen elements are drawn ([#239](https://github.com/excaliburjs/Excalibur/issues/239))
- Support Scale in the x and y directions for actors ([#118](https://github.com/excaliburjs/Excalibur/issues/118))
- Added notion of collision grouping ([#100](https://github.com/excaliburjs/Excalibur/issues/100))
- New Events like 'enterviewport', 'exitviewport', and 'initialize' ([#215](https://github.com/excaliburjs/Excalibur/issues/215), [#224](https://github.com/excaliburjs/Excalibur/issues/224))
- Textures allow direct pixel manipulation ([#155](https://github.com/excaliburjs/Excalibur/issues/155))
- Static Logger improvements with '.debug()', '.info()', '.warn()' and '.error()' ([#81](https://github.com/excaliburjs/Excalibur/issues/81))
- Added callMethod() action to actor ([#244](https://github.com/excaliburjs/Excalibur/issues/244))
- Added fade() action to actor ([#104](https://github.com/excaliburjs/Excalibur/issues/104))
- Added follow() and meet() action to actor ([#77](https://github.com/excaliburjs/Excalibur/issues/77))

### Changed

- 'engine.goToScene()' replaces push and pop ([#168](https://github.com/excaliburjs/Excalibur/issues/168))
- More intuitive starting workflow ([#149](https://github.com/excaliburjs/Excalibur/issues/149))
- Collisions are now more concrete on actors with CollisionType ([#241](https://github.com/excaliburjs/Excalibur/issues/241))
- Namespace all types with 'ex' to prevent Excalibur from polluting the global ([#87](https://github.com/excaliburjs/Excalibur/issues/87))
- Refactor SceneNode to Scene ([#135](https://github.com/excaliburjs/Excalibur/issues/135))
- Refactor keys ([#115](https://github.com/excaliburjs/Excalibur/issues/115))
- Build system with Grunt ([#92](https://github.com/excaliburjs/Excalibur/issues/92))

### Fixed

- Collision event was firing after other actor has been killed ([#228](https://github.com/excaliburjs/Excalibur/issues/228))
- Additional actor was killed when actor.kill() is called ([#226](https://github.com/excaliburjs/Excalibur/issues/226))
- Fixed loading bar ([#195](https://github.com/excaliburjs/Excalibur/issues/195))
- ex.Color.Yellow constant was wrong ([#122](https://github.com/excaliburjs/Excalibur/issues/122))
- removeEventListener did not exist off of engine ([#175](https://github.com/excaliburjs/Excalibur/issues/175))
- Excalibur promises should not swallow exceptions in promise callbacks ([#176](https://github.com/excaliburjs/Excalibur/issues/176))
- Actor.extend did not work on actor subclasses ([#103](https://github.com/excaliburjs/Excalibur/issues/103))

<!----------------------------------------------------------------------------------------------->

## [0.1.1] - 2013-12-19

### Changed

- Refactored Keys to be less confusing ([#115](https://github.com/excaliburjs/Excalibur/issues/115))
- Refactored ActorEvent to be less confusing ([#113](https://github.com/excaliburjs/Excalibur/issues/113))

### Fixed

- 'update' event on the Engine now fires correctly ([#105](https://github.com/excaliburjs/Excalibur/issues/105))
- Actor.extend works on subclasses now ([#103](https://github.com/excaliburjs/Excalibur/issues/103))

<!----------------------------------------------------------------------------------------------->

## 0.1.0 - 2013-12-11

### Added

- Actor based paradigm for managing game objects
- Built-in scripting for actors, allowing objects to move, rotate, blink, scale, and repeat actions
- Entity-entity collision detection
- Event support to react to events happening in the game
- Camera abstraction to easily think about the view port
- Multiple display modes including fixed size, full screen, and dynamic container
- Scene stack support to create multiple game levels
- Sprite sheet and animation support
- Simple sound library for game audio, supporting the Web Audio API and the HTML Audio API
- Promise implementation for managing asynchronous behavior
- Resource loading with optional custom progress bars

<!----------------------------------------------------------------------------------------------->

[unreleased]: https://github.com/excaliburjs/Excalibur/compare/v0.25.1...HEAD
[0.25.1]: https://github.com/excaliburjs/Excalibur/compare/v0.25.0...v0.25.1
[0.25.0]: https://github.com/excaliburjs/Excalibur/compare/v0.24.5...v0.25.0
[0.24.5]: https://github.com/excaliburjs/Excalibur/compare/v0.24.4...v0.24.5
[0.24.4]: https://github.com/excaliburjs/Excalibur/compare/v0.24.0...v0.24.4
[0.24.0]: https://github.com/excaliburjs/Excalibur/compare/v0.23.0...v0.24.0
[0.23.0]: https://github.com/excaliburjs/Excalibur/compare/v0.22.0...v0.23.0
[0.22.0]: https://github.com/excaliburjs/Excalibur/compare/v0.21.0...v0.22.0
[0.21.0]: https://github.com/excaliburjs/Excalibur/compare/v0.20.0...v0.21.0
[0.20.0]: https://github.com/excaliburjs/Excalibur/compare/v0.19.1...v0.20.0
[0.19.1]: https://github.com/excaliburjs/Excalibur/compare/v0.19.0...v0.19.1
[0.19.0]: https://github.com/excaliburjs/Excalibur/compare/v0.18.0...v0.19.0
[0.18.0]: https://github.com/excaliburjs/Excalibur/compare/v0.17.0...v0.18.0
[0.17.0]: https://github.com/excaliburjs/Excalibur/compare/v0.16.0...v0.17.0
[0.16.0]: https://github.com/excaliburjs/Excalibur/compare/v0.15.0...v0.16.0
[0.15.0]: https://github.com/excaliburjs/Excalibur/compare/v0.14.0...v0.15.0
[0.14.0]: https://github.com/excaliburjs/Excalibur/compare/v0.13.0...v0.14.0
[0.13.0]: https://github.com/excaliburjs/Excalibur/compare/v0.12.0...v0.13.0
[0.12.0]: https://github.com/excaliburjs/Excalibur/compare/v0.11.0...v0.12.0
[0.11.0]: https://github.com/excaliburjs/Excalibur/compare/v0.10.0...v0.11.0
[0.10.0]: https://github.com/excaliburjs/Excalibur/compare/v0.9.0...v0.10.0
[0.9.0]: https://github.com/excaliburjs/Excalibur/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/excaliburjs/Excalibur/compare/v0.7.1...v0.8.0
[0.7.1]: https://github.com/excaliburjs/Excalibur/compare/v0.7.0...v0.7.1
[0.7.0]: https://github.com/excaliburjs/Excalibur/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/excaliburjs/Excalibur/compare/v0.5.1...v0.6.0
[0.5.1]: https://github.com/excaliburjs/Excalibur/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/excaliburjs/Excalibur/compare/v0.2.2...v0.5.0
[0.2.2]: https://github.com/excaliburjs/Excalibur/compare/v0.2.0...v0.2.2
[0.2.0]: https://github.com/excaliburjs/Excalibur/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/excaliburjs/Excalibur/compare/v0.1...v0.1.1
[//]: # 'https://github.com/olivierlacan/keep-a-changelog'
