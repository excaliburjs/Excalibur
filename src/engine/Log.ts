module ex {

   /**
    * Logging level that Excalibur will tag
    */
   export enum LogLevel {
      Debug,
      Info,
      Warn,
      Error,
      Fatal
   }   

   /**
    * Static singleton that represents the logging facility for Excalibur.
    * Excalibur comes built-in with a [[ConsoleAppender]] and [[ScreenAppender]].
    * Derive from [[IAppender]] to create your own logging appenders.
    *
    * ## Example: Logging
    *
    * ```js
    * // set default log level (default: Info)
    * ex.Logger.getInstance().defaultLevel = ex.LogLevel.Warn;
    *
    * // this will not be shown because it is below Warn
    * ex.Logger.getInstance().info("This will be logged as Info");
    * // this will show because it is Warn
    * ex.Logger.getInstance().warn("This will be logged as Warn");
    * // this will show because it is above Warn
    * ex.Logger.getInstance().error("This will be logged as Error");
    * // this will show because it is above Warn
    * ex.Logger.getInstance().fatal("This will be logged as Fatal");
    * ```
    */
   export class Logger {
      private static _instance: Logger = null;
      private _appenders: IAppender[] = [];      

      constructor() {
         if (Logger._instance) {
            throw new Error('Logger is a singleton');
         }
         Logger._instance = this;
         // Default console appender
         Logger._instance.addAppender(new ConsoleAppender());
         return Logger._instance;
      }

      /**
       * Gets or sets the default logging level. Excalibur will only log 
       * messages if equal to or above this level. Default: [[LogLevel.Info]]
       */
      public defaultLevel: LogLevel = LogLevel.Info;

      /**
       * Gets the current static instance of Logger
       */
      public static getInstance(): Logger {
         if (Logger._instance == null) {
            Logger._instance = new Logger();
         }
         return Logger._instance;
      }

      /**
       * Adds a new [[IAppender]] to the list of appenders to write to
       */
      public addAppender(appender: IAppender): void {
         this._appenders.push(appender);
      }

      /**
       * Clears all appenders from the logger
       */
      public clearAppenders(): void {
         this._appenders.length = 0;
      }

      /**
       * Logs a message at a given LogLevel
       * @param level  The LogLevel`to log the message at
       * @param args   An array of arguments to write to an appender
       */
      private _log(level: LogLevel, args: any[]): void {
         if (level == null) {
            level = this.defaultLevel;
         }

         var i = 0, len = this._appenders.length;

         for (i; i < len; i++) {
            if (level >= this.defaultLevel) {
               this._appenders[i].log(level, args);
            }
         }
      }

      /**
       * Writes a log message at the [[LogLevel.Debug]] level
       * @param args  Accepts any number of arguments
       */
      public debug(...args): void {
         this._log(LogLevel.Debug, args);
      }

      /**
       * Writes a log message at the [[LogLevel.Info]] level
       * @param args  Accepts any number of arguments
       */
      public info(...args): void {
         this._log(LogLevel.Info, args);
      }

      /**
       * Writes a log message at the [[LogLevel.Warn]] level
       * @param args  Accepts any number of arguments
       */
      public warn(...args): void {
         this._log(LogLevel.Warn, args);
      }

      /**
       * Writes a log message at the [[LogLevel.Error]] level
       * @param args  Accepts any number of arguments
       */
      public error(...args): void {
         this._log(LogLevel.Error, args);
      }

      /**
       * Writes a log message at the [[LogLevel.Fatal]] level
       * @param args  Accepts any number of arguments
       */
      public fatal(...args): void {
         this._log(LogLevel.Fatal, args);
      }
   }

   /**
    * Contract for any log appender (such as console/screen)
    */
   export interface IAppender {

      /**
       * Logs a message at the given [[LogLevel]]
       * @param level  Level to log at
       * @param args   Arguments to log
       */
      log(level: LogLevel, args: any[]): void;
   }

   /**
    * Console appender for browsers (i.e. `console.log`)
    */
   export class ConsoleAppender implements IAppender {
      
      /**
       * Logs a message at the given [[LogLevel]]
       * @param level  Level to log at
       * @param args   Arguments to log
       */
      public log(level: LogLevel, args: any[]): void {
         // Check for console support
         if (!console && !console.log && console.warn && console.error) {
            // todo maybe do something better than nothing
            return;
         }

         // Create a new console args array
         var consoleArgs = [];
         consoleArgs.unshift.apply(consoleArgs, args);
         consoleArgs.unshift('[' + LogLevel[level] + '] : ');
         
         if (level < LogLevel.Warn) {

            // Call .log for Debug/Info
            if (console.log.apply) {
               // this is required on some older browsers that don't support apply on console.log :(
               console.log.apply(console, consoleArgs);
            } else {
               console.log(consoleArgs.join(' '));
            }
         } else if (level < LogLevel.Error) {

            // Call .warn for Warn
            if (console.warn.apply) {
               console.warn.apply(console, consoleArgs);
            } else {
               console.warn(consoleArgs.join(' '));
            }
         } else {

            // Call .error for Error/Fatal
            if (console.error.apply) {
               console.error.apply(console, consoleArgs);
            } else {
               console.error(consoleArgs.join(' '));
            }
         }
      }
   }

   /**
    * On-screen (canvas) appender    
    */
   export class ScreenAppender implements IAppender {
      // @todo Clean this up

      private _messages: string[] = [];
      private _canvas: HTMLCanvasElement;
      private _ctx: CanvasRenderingContext2D;

      /**
       * @param width   Width of the screen appender in pixels
       * @param height  Height of the screen appender in pixels
       */
      constructor(width?: number, height?: number) {
         this._canvas = <HTMLCanvasElement>document.createElement('canvas');
         this._canvas.width = width || window.innerWidth;
         this._canvas.height = height || window.innerHeight;
         this._canvas.style.position = 'absolute';
         this._ctx = <CanvasRenderingContext2D>this._canvas.getContext('2d');
         document.body.appendChild(this._canvas);
      }

      /**
       * Logs a message at the given [[LogLevel]]
       * @param level  Level to log at
       * @param args   Arguments to log
       */
      public log(level: LogLevel, args: any[]): void {
         var message = args.join(',');
         
         this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

         this._messages.unshift('[' + LogLevel[level] + '] : ' + message);

         var pos = 10;
         var opacity = 1.0;
         for (var i = 0; i < this._messages.length; i++) {
            this._ctx.fillStyle = 'rgba(255,255,255,' + opacity.toFixed(2) + ')';
            this._ctx.fillText(this._messages[i], 200, pos);
            pos += 10;
            opacity = opacity > 0 ? opacity - .05 : 0;
         }
      }
   }
}