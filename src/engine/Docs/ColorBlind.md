Color correction algorithm originally sourced from http://www.daltonize.org/

Example:

```typescript
var game = new ex.Engine();

var colorBlindPostProcessor = new ex.ColorBlindCorrector(game, false, ColorBlindness.Protanope);

// post processors evaluate left to right
game.postProcessors.push(colorBlindPostProcessor);
game.start();
```
