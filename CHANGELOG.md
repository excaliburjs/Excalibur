# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

### Breaking Changes
- Refactored and modified Sound API ([#644](https://github.com/excaliburjs/Excalibur/issues/644))
  - `Sound.setData` now returns a Promise which differs from previous API
  - Removed internal `FallbackAudio` and `Sound` classes and replaced with single `Sound` class
  - Added `AudioTagInstance` and `WebAudioInstance` internal classes

### Added
- `ex.Promise.join(Promise[])` support (in addition to `...promises` support) ([#642](https://github.com/excaliburjs/Excalibur/issues/642))
- Moved build artifacts to separate [excalibur-dist](https://github.com/excaliburjs/excalibur-dist) repository ([#648](https://github.com/excaliburjs/Excalibur/issues/648))
- `ex.Events` namespace and typed event handler `.on(...)` overloads for default events on core excalibur objects ([#639](https://github.com/excaliburjs/Excalibur/issues/639))
- Two new parameters to `ex.Util.DrawUtil.line` that accept a line thickness and end-cap style ([#658](https://github.com/excaliburjs/Excalibur/issues/658))

### Fixed
- `Actor.actions.fade` properly supporting fading between 0 and 1 and vice versa ([#640](https://github.com/excaliburjs/Excalibur/issues/640))
- Fix issues with audio offset tracking and muting while game is invisible ([#644](https://github.com/excaliburjs/Excalibur/issues/644))
- `Actor.getHeight()` and `Actor.getWidth()` now take into account parent scaling ([#645](https://github.com/excaliburjs/Excalibur/issues/645))
- `Actor.debugDraw` now works properly for child actors ([#505](https://github.com/excaliburjs/Excalibur/issues/505), [#645](https://github.com/excaliburjs/Excalibur/issues/645))
- Sprite culling was double scaling calculations ([#646](https://github.com/excaliburjs/Excalibur/issues/646))
- Fix negative zoom sprite culling ([#539](https://github.com/excaliburjs/Excalibur/issues/539))

## [0.7.0] - 2016-08-29
### Breaking Changes
- Code marked 'Obsolete' has been removed (#625, #603)
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
- Removed ex.Template and ex.Binding (#627)
  
### Added
- New physics system, physical properties for Actors (#557, #472)
- Read The Docs support for documentation (#558)
- Continuous integration builds unstable packages and publishes them (#567)
- Sound and Texture resources can now process data (#574)
- Actors now throw an event when they are killed (#585)
- "Tap to Play" button for iOS to fulfill platform audio requirements (#262)
- Generic lerp/easing functions (#320)
- Whitespace checking for conditional statements (#634)
- Initial support for [Yeoman generator](https://github.com/excaliburjs/generator-excalibur) (#578)

### Changed
- Upgraded Jasmine testing framework to version 2.4 (#126)
- Updated TypeScript to 1.8 (#596)
- Improved contributing document (#560)
- Improved local and global coordinate tracking for Actors (#60)
- Updated loader image to match new logo and theme (#615)
- Ignored additional files for Bower publishing (#614)

### Fixed
- Actions on the action context threw an error (#564)
- Actor `getLeft()`, `getTop()`, `getBottom()` and `getRight()` did not respect anchors (#568)
- Actor.actions.rotateTo and rotateBy were missing RotationType (#575)
- Actors didn't behave correctly when killed and re-added to game (#586)
- Default fontFamily for Label didn't work with custom FontSize or FontUnit (#471)
- Fixed issues with testing sandbox (#609)
- Issue with camera lerp (#555)
- Issue setting initial opacity on Actors (#511)
- Children were not being updated by their parent Actors (#616)
- Center-anchored Actors were not drawn at the correct canvas coordinates when scaled (#618)

## [0.6.0] - 2016-01-19
### Added
- GamePads now have a connection event (#473)
- Unit circle drawing for debug mode (#467)
- Engine now fails gracefully in unsupported browsers (#386)
- Global fatal error catching (#381)
- MockEngine for testing (#360)
- Code coverage reports via Coveralls (#169)
- SpriteFonts now support different target colors (#148)
- Cameras now have position, velocity, and acceleration properties (#490)

### Changed
- `Actor.addChild()` changed to `Actor.add()` (#519)
- `Actor.removeChild()` changed to `Actor.remove()` (#519)
- Documentation is only deployed on changes to the master git branch (#483)
- A warning message is now displayed if no supported audio format is provided for a browser (#476)
- Updated TSLint directory scanning (#442, #443, #447)
- Deprecated older methods (#399)
- Changed API for Key events (#502)

### Fixed
- Actors now properly collide with TileMaps (#541)
- Gamepad detection is fixed (#460, #518)
- Actor scale now correctly occurs after translation (#514)
- Actors now respect the `visible` property of their children (#513)
- Fixed centered sprite drawing on Actors (#507)
- Animation `freezeframe` is now properly set to last Animation frame by default (#506)
- It is no longer possible to add the same Actor to a scene multiple times (#504)
- Text alignment on SpriteFonts with Labels is fixed (#484)
- Engine pointer events properly fire when a camera is zoomed (#480)
- Fixed a small bug in rotateTo (#469)
- Setting Label colors now works (#468)
- Labels now respect set font (#372)
- UIActor now respects visibility (#368)
- Solid color Actors now respect opacity (#364)
- TileMap culling uses proper width and height values (#293)
- Font API changed while fixing font size issue

## [0.5.1] - 2015-06-26
### Added
- Actors can now recursively check the containment of their children (#453)
- `RotateTo` and `RotateBy` now support ShortestPath, LongestPath, Clockwise, and Counterclockwise rotation (#461)

### Fixed
- `Actor.contains()` did not work for child actors (#147)
- Unexpected placement occasionally occurred for Actors with certain collision types (#319)
- Velocity wasn’t updating properly when fixed and active Actors collided (#454)
- Actors removed with actor.kill() were not being removed from the draw tree (#458)
- `RotateTo` and `RotateBy` weren’t using the shortest angle by default (#282)
- Sprite width and height didn’t take scaling into account (#437)
- Fixed error message when calling `Actor.setDrawing()` on a non-existent key (#456)

## [0.5.0] - 2015-06-03
### Added
- resource cache busting (#280)
- HTML5 Gamepad API support (#15)
- Browserify support (#312)
- ‘blur’ and ‘visible’ events to detect when the browser window a game is in has focus (#385)
- Z-index support for Actors, allowing for specific ordered drawing (#356)
- unlocked drawing for UI elements (#354)
- `Promise.join()` to return a new promise when promises passed to it have been resolved (#341, #340)
- ability to skip a frame in an animation (#313)
- You can now remove effects from `IDrawable` objects (#303)
- generic `Resource` type to allow for XHR loading (#297)
- gray `Color` constants (#209)

### Changed
- Renamed `engine.addChild()` to `engine.add()` (#288)
- Renamed `setSpriteTransformationPoint()` to `setAnchor()` (#269)
- Renamed `TopCamera` to `LockedCamera` (#184)
- Renamed `Actor.pipeline` to `Actor.traits` (#351)
- Actor anchoring now uses center origin by default (#299)
- Actor updates (movement, collision, etc.) now use a pipeline (#330)
- Organized classes, files, and project structure (#182, #347)
- Improvements to collision detection (#345, #332)
- Loop optimizations for performance improvements (#296)
- Updated to TypeScript 1.4 (#393)
- Improved pointer event handling so touch and mouse events can be captured together (#334)
- Improved `Point` and `Vector` methods and rotation (#323, #302)
- `Color` is now treated as a vector to allow for changes (#298)
- Cleaned up event type consistency (#273)
- There is now a default instance of a `Camera` (#270)
- TSLint now used to enforce code quality

### Fixed
- A Sprite’s dimensions weren’t validated against the size of its texture (#318)
- Improved sprite drawing performance issues (#316)
- Actors were sometimes throwing duplicate collision events (#284)
- Actors were not setting their initial opacity correctly (#307)
- Particle emitters couldn’t emit less than 60 particles per second (#301)
- Fixed issue with TileMap collisions (#286)
- Animations with duplicate frames weren’t being created correctly (#283)
- Separated drawing and collision logic for CollisionMaps (now TileMap) (#285)
- Errors in promises were being swallowed if no error callback was supplied (#337)
- A null promise was being returned if no loader was given to `Engine.start()` (#335)
- Changed default collisionType to ‘PreventCollision’ (#324)
- Color didn’t handle alpha = 0 correctly (#257)
- Blink action usage was confusing (#279)
- Couldn’t use the `width` and `height` properties of a Texture after it loaded (#355)
- Using `on(‘pointerdown’)` would not automatically enable pointer capturing (#398)
- Unsubscribing from an event sometimes removed other event handlers (#366)
- `Actor.setCenterDrawing()` was hard-coded to true (#375)
- Console was undefined in IE9. (#378)
- Pointers were not handling mobile Safari touch events (#382)
- Fixed debug mode drawing (#274)
- Flipping a sprite didn’t factor in scaling (#401)
- Sound continued to play when the game was paused (#383)
- `UIActor.kill()` didn’t remove the actor (#373)
- Passing an empty array to `ex.Promise.join` resulted in unresolved promises (#365)
- MouseUp / TouchEnd events weren’t capture correctly if outside of canvas (#374)
- Clearing actions from an empty action queue caused problems (#409)
- `Scene.onActivate()` was being called before Scene.onInitialize() (#418)
- New z-indexing wasn’t cleaning up after itself (#433)
- Fixed issue with world / screen coordinates in UIActors (#371)
- Fade action didn’t work for text (#261)
- Fade action didn’t work for plain-color actors (#256)
- Collision events weren’t being published for both collision participants (#254)
- The loading bar was misrepresenting the time taken to decode audio files (#106)
- `actor.getCenter()` wasn’t returning the correct value (#438)
- Cameras were on the engine instead of the scene, resulting in scene transition problems (#277)
- Actors with sprites larger than the actor would disappear prematurely from the screen (#287)
- Derived classes can now use offscreen culling (#294)
- Fixed issue with TileMap culling (#444)

## [0.2.2] - 2014-04-15
### Fixed
- Removed extra declarations file from package that was causing visual studio build problems

## [0.2.0] - 2014-04-09
### Added
- Visual Studio 2013 template support (#139)
- Collision Map for building large static collidable levels (#33)
- Redundant fallback sound sources for cross browser support (#125)
- Particle Emitter implementation (#52)
- Trigger implementation (#91)
- Timer implementation (#76)
- Camera Effects: zoom, shake (#55)
- Polygon IDrawable (#93)
- Alias 'on' and 'off' for 'addEventListener' and 'removeEventListener' (#229)
- Optimized draw so only on screen elements are drawn (#239)
- Support Scale in the x and y directions for actors (#118)
- Added notion of collision grouping (#100)
- New Events like 'enterviewport', 'exitviewport', and 'initialize' (#215, #224)
- Textures allow direct pixel manipulation (#155)
- Static Logger improvements with '.debug()', '.info()', '.warn()' and '.error()' (#81)
- Added callMethod() action to actor (#244)
- Added fade() action to actor (#104)
- Added follow() and meet() action to actor (#77)

### Changed
- 'engine.goToScene()' replaces push and pop (#168)
- More intuitive starting workflow (#149)
- Collisions are now more concrete on actors with CollisionType (#241)
- Namespace all types with 'ex' to prevent Excalibur from polluting the global (#87)
- Refactor SceneNode to Scene (#135)
- Refactor keys (#115)
- Build system with Grunt (#92)

### Fixed
- Collision event was firing after other actor has been killed (#228)
- Additional actor was killed when actor.kill() is called (#226)
- Fixed loading bar (#195)
- ex.Color.Yellow constant was wrong (#122)
- removeEventListener did not exist off of engine (#175)
- Excalibur promises should not swallow exceptions in promise callbacks (#176)
- Actor.extend did not work on actor subclasses (#103)

## [0.1.1] - 2013-12-19
### Changed
- Refactored Keys to be less confusing (#115)
- Refactored ActorEvent to be less confusing (#113)

### Fixed 
- 'update' event on the Engine now fires correctly (#105)
- Actor.extend works on subclasses now (#103)

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

[Unreleased]: https://github.com/excaliburjs/Excalibur/compare/v0.7.0...HEAD
[0.7.0]: https://github.com/excaliburjs/Excalibur/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/excaliburjs/Excalibur/compare/v0.5.1...v0.6.0
[0.5.1]: https://github.com/excaliburjs/Excalibur/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/excaliburjs/Excalibur/compare/v0.2.2...v0.5.0
[0.2.2]: https://github.com/excaliburjs/Excalibur/compare/v0.2.0...v0.2.2
[0.2.0]: https://github.com/excaliburjs/Excalibur/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/excaliburjs/Excalibur/compare/v0.1...v0.1.1

[//]: # (https://github.com/olivierlacan/keep-a-changelog)
