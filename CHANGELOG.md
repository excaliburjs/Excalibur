# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Breaking Changes

### Added
- Added `ex.Random` with seed support via Mersenne Twister algorithm ([#538](https://github.com/excaliburjs/Excalibur/issues/538))
- Added extended feature detection and reporting to `ex.Detector` ([#707](https://github.com/excaliburjs/Excalibur/issues/707))
  - `ex.Detector.getBrowserFeatures()` to retrieve the support matrix of the current browser
  - `ex.Detector.logBrowserFeatures()` to log the support matrix to the console (runs at startup when in Debug mode)
- Added @obsolete decorator to help give greater visibility to deprecated methods ([#684](https://github.com/excaliburjs/Excalibur/issues/684))
- Added better support for module loaders and TypeScript importing. See [Installation](http://docs.excaliburjs.com/en/latest/installation.html) docs for more info. ([#606](https://github.com/excaliburjs/Excalibur/issues/606))
- Added new Excalibur example project templates ([#706](https://github.com/excaliburjs/Excalibur/issues/706), [#733](https://github.com/excaliburjs/Excalibur/issues/733)):
  - [Browserify](https://github.com/excaliburjs/example-ts-browserify)
  - [Webpack](https://github.com/excaliburjs/example-ts-webpack)
  - [Angular2](https://github.com/excaliburjs/example-ts-angular2)
  - [Universal Windows Platform (UWP)](https://github.com/excaliburjs/example-uwp)

### Changed
- Changed Util.clamp to use math libraries ([#536](https://github.com/excaliburjs/Excalibur/issues/536))
- Upgraded to TypeScript 2.1.4 ([#726](https://github.com/excaliburjs/Excalibur/issues/726))

### Deprecated

### Removed

### Fixed
- Fixed Scene/Actor activation and initialization order, actors were not being initialized before scene activation causing bugs ([#661](https://github.com/excaliburjs/Excalibur/issues/661))
- Fixed bug with Excalibur where it would not load if a loader was provided without any resources ([#565](https://github.com/excaliburjs/Excalibur/issues/565))

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
- Documentation is only deployed on changes to the master git branch ([#483](https://github.com/excaliburjs/Excalibur/issues/483))
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


## [0.2.2] - 2014-04-15
### Fixed
- Removed extra declarations file from package that was causing visual studio build problems


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


## [0.1.1] - 2013-12-19
### Changed
- Refactored Keys to be less confusing ([#115](https://github.com/excaliburjs/Excalibur/issues/115))
- Refactored ActorEvent to be less confusing ([#113](https://github.com/excaliburjs/Excalibur/issues/113))

### Fixed 
- 'update' event on the Engine now fires correctly ([#105](https://github.com/excaliburjs/Excalibur/issues/105))
- Actor.extend works on subclasses now ([#103](https://github.com/excaliburjs/Excalibur/issues/103))


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

[Unreleased]: https://github.com/excaliburjs/Excalibur/compare/v0.8.0...HEAD
[0.8.0]: https://github.com/excaliburjs/Excalibur/compare/v0.7.1...v0.8.0
[0.7.1]: https://github.com/excaliburjs/Excalibur/compare/v0.7.0...v0.7.1
[0.7.0]: https://github.com/excaliburjs/Excalibur/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/excaliburjs/Excalibur/compare/v0.5.1...v0.6.0
[0.5.1]: https://github.com/excaliburjs/Excalibur/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/excaliburjs/Excalibur/compare/v0.2.2...v0.5.0
[0.2.2]: https://github.com/excaliburjs/Excalibur/compare/v0.2.0...v0.2.2
[0.2.0]: https://github.com/excaliburjs/Excalibur/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/excaliburjs/Excalibur/compare/v0.1...v0.1.1

[//]: # (https://github.com/olivierlacan/keep-a-changelog)
