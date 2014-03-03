module ex {

   /**
    * Logging level that Excalibur will tag
    * @class LogLevel
    */
   export enum LogLevel {
      /**
       @property Debug {LogLevel}
       @static 
       @final
       */
       /**
       @property Info {LogLevel}
       @static 
       @final
       */
       /**
       @property Warn {LogLevel}
       @static 
       @final
       */
       /**
       @property Error {LogLevel}
       @static 
       @final
       */
       /**
       @property Fatal {LogLevel}
       @static 
       @final
       */
      Debug,
      Info,
      Warn,
      Error,
      Fatal
   }   

   /**
    * Static singleton that represents the logging facility for Excalibur.
    * Excalibur comes built-in with a ConsoleAppender and ScreenAppender.
    * Derive from IAppender to create your own logging appenders.
    * @class Logger
    * @static
    * @singleton
    */
   export class Logger {
      private static _instance: Logger = null;
      private appenders: IAppender[] = [];      

      /**
       * Use Logger.getInstance() to retrieve the logging instance.
       */
      constructor() {
         if (Logger._instance) {
            throw new Error("Logger is a singleton");
         }
         Logger._instance = this;
      }

      /**
       * Gets or sets the default logging level. Excalibur will only log 
       * messages if equal to or above this level.
       * @property defaultLevel {LogLevel}
       */
      public defaultLevel: LogLevel = LogLevel.Info;

      /**
       * Gets the current static instance of Logger
       * @method getInstance
       * @static
       * @returns Logger
       */
      public static getInstance(): Logger {
         if (Logger._instance == null) {
            Logger._instance = new Logger();
         }
         return Logger._instance;
      }

      /**
       * Adds a new IAppender to the list of appenders to write to
       * @method addAppender
       * @param appender {IAppender} Appender to add
       */
      public addAppender(appender: IAppender): void {
         this.appenders.push(appender);
      }

      /**
       * Logs a message at a given LogLevel
       * @method _log
       * @private
       * @param level {LogLevel}The LogLevel`to log the message at
       * @param args An array of arguments to write to an appender
       */
      private _log(level: LogLevel, args: any[]): void {
         if (level == null) {
            level = this.defaultLevel;
         }
         
         this.appenders.forEach(appender=> {
            if (level >= this.defaultLevel) {
               appender.log(level, args);
            }
         });
      }

      /**
       * Writes a log message at the LogLevel.Debug level
       * @method debug
       * @param ...args Accepts any number of arguments
       */
      public debug(...args): void {
         this._log(LogLevel.Debug, args);
      }

      /**
       * Writes a log message at the LogLevel.Info level
       * @method info
       * @param ...args Accepts any number of arguments
       */
      public info(...args): void {
         this._log(LogLevel.Info, args);
      }

      /**
       * Writes a log message at the LogLevel.Warn level
       * @method warn
       * @param ...args Accepts any number of arguments
       */
      public warn(...args): void {
         this._log(LogLevel.Warn, args);
      }

      /**
       * Writes a log message at the LogLevel.Error level
       * @method error
       * @param ...args Accepts any number of arguments
       */
      public error(...args): void {
         this._log(LogLevel.Error, args);
      }

      /**
       * Writes a log message at the LogLevel.Fatal level
       * @method fatal
       * @param ...args Accepts any number of arguments
       */
      public fatal(...args): void {
         this._log(LogLevel.Fatal, args);
      }
   }

   /**
    * Contract for any log appender (such as console/screen)
    * @class IAppender
    */
   export interface IAppender {

      /**
       * Logs a message at the given LogLevel
       * @method log
       * @param level {LogLevel} Level to log at
       * @param args {any[]} Arguments to log
       */
      log(level: LogLevel, args: any[]): void;
   }

   /**
    * Console appender for browsers (i.e. console.log)
    * @class ConsoleAppender
    * @constructor
    * @extends IAppender
    */
   export class ConsoleAppender implements IAppender {
      
      public log(level: LogLevel, args: any[]): void {

         // Create a new console args array
         var consoleArgs = [];
         consoleArgs.unshift.apply(consoleArgs, args);
         consoleArgs.unshift("[" + LogLevel[level] + "] : ");
         
         if (level < LogLevel.Warn) {

            // Call .log for Debug/Info
            console.log.apply(console, consoleArgs);
         } else if (level < LogLevel.Error) {

            // Call .warn for Warn
            console.warn.apply(console, consoleArgs);
         } else {

            // Call .error for Error/Fatal
            console.error.apply(console, consoleArgs);
         }
      }
   }

   /**
    * On-screen (canvas) appender
    * @todo Clean this up
    * @class ScreenAppender
    * @extends IAppender
    * @constructor
    * @param width {number} Width of the screen appender in pixels
    * @param height {number} Height of the screen appender in pixels
    */
   export class ScreenAppender implements IAppender {

      private _messages: string[] = [];
      private canvas: HTMLCanvasElement;
      private ctx: CanvasRenderingContext2D;

      /**
       * Creates a new `ScreenAppender` with the given width and height
       */
      constructor(width?: number, height?: number) {
         this.canvas = <HTMLCanvasElement>document.createElement('canvas');
         this.canvas.width = width || window.innerWidth;
         this.canvas.height = height || window.innerHeight;
         this.canvas.style.position = 'absolute';
         this.ctx = this.canvas.getContext('2d');
         document.body.appendChild(this.canvas);
      }

      public log(level: LogLevel, args: any[]): void {
         var message = args.join(",");
         
         this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

         this._messages.unshift("[" + LogLevel[level] + "] : " + message);

         var pos = 10;
         var opacity = 1.0;
         for (var i = 0; i < this._messages.length; i++) {
            this.ctx.fillStyle = 'rgba(255,255,255,' + opacity.toFixed(2) + ')';
            this.ctx.fillText(this._messages[i], 200, pos);
            pos += 10;
            opacity = opacity > 0 ? opacity - .05 : 0;
         }
      }
   }
}