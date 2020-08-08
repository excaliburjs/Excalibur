## Handling Screens

Excalibur has a screen abstraction for dealing with [[Screen.viewport]] size, and [[Screen.resolution]]. It also handles HiDPI scaling, the browser fullscreen API, and translation of screen coordinates into game world coordinates.

The [[Screen.viewport]] represents the size of the window into the game work in CSS pixels on the screen. 

The [[Screen.resolution]] represents the number of logical pixels stretched across that viewport.

The screen abstraction can be accessed most easily off of a constructed engine.

```typescript
const game = new ex.Engine({
  // sets the viewport as it did before
  // width and height are provided for backwards compatibilty
  width: 800,
  height: 600,
  // or optionally use the viewport option
  viewport: { width: 800, height: 600 },
  
  // sets the resolution
  resolution: ex.Resolution.GameBoy
});

const screen = game.screen

```

## Viewport and Resolution

The best way to change the viewport and resolution is in the [[Engine]] constructor arguments. If the viewport or resolution is changed after constructor time, [[Screen.applyResolutionAndViewport]] must be called to have the changes take effect.


```typescript

// get or set the viewport
const viewport = game.screen.viewport;
game.screen.viewport = { width: 400, height: 300 };

// get or set the resolution
const resolution = game.screen.resolution;
game.screen.resolution = { width: 100, height: 100 };

// Apply changes to viewport and resolution to the canvas and graphics context
game.screen.applyResolutionAndViewport();
```

Sometimes you might want to switch between 2 different resolutions and viewports, perhaps for different scenes, or for some in game animation. This can be done with [[Screen.pushResolutionAndViewport]] and [[Screen.popResolutionAndViewport]].

```typescript
// Save the current resolution and viewport
game.screen.pushResolutionAndViewport();
// Change and apply
game.screen.resolution = ex.Resolution.NES;
game.screen.applyResolutionAndViewport();

// Show some animation or do something at NES resolution

// Restore the old resolution and viewport, then apply
game.screen.popResolutionAndViewport();
game.screen.applyResolutionAndViewport();

```

## Fullscreen API

The screen abstraction now supports the [browser fullscreen api](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API). This will cause the game to be displayed fullscreen until the user exits (usually with the escape key or by gesturing to the exit button at the top of the browser window).

```typescript

await game.screen.goFullScreen();

await game.screen.exitFullScreen();

```