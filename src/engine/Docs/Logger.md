## Example: Logging

```js
// set default log level (default: Info)
ex.Logger.getInstance().defaultLevel = ex.LogLevel.Warn;
// this will not be shown because it is below Warn
ex.Logger.getInstance().info("This will be logged as Info");
// this will show because it is Warn
ex.Logger.getInstance().warn("This will be logged as Warn");
// this will show because it is above Warn
ex.Logger.getInstance().error("This will be logged as Error");
// this will show because it is above Warn
ex.Logger.getInstance().fatal("This will be logged as Fatal");
```