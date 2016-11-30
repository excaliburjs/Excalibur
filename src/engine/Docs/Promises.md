## A Promise Chain

Promises can be chained together and can be useful for creating a queue
of functions to be called when something is done.
The first [[Promise]] you will encounter is probably [[Engine.start]]
which resolves when the game has finished loading.

```js
var game = new ex.Engine();
// perform start-up logic once game is ready
game.start().then(function () {
  // start-up & initialization logic
});
```

## Handling errors

You can optionally pass an error handler to [[Promise.then]] which will handle
any errors that occur during Promise execution.

```js
var game = new ex.Engine();
game.start().then(
  // success handler
  function () {
  },
  // error handler
  function (err) {
  }
);
```

Any errors that go unhandled will be bubbled up to the browser.