module ex {
   export enum Log {
      Debug,
      Info,
      Warn,
      Error,
      Fatal
   }

   export interface IAppender {
      log(level: Log, args: any[]);
   }

   export class ConsoleAppender implements IAppender {
      constructor() { }
      public log(level: Log, args: any[]) {
         var consoleArgs = [];
         consoleArgs.unshift.apply(consoleArgs, args);
         consoleArgs.unshift("[" + Log[level] + "] : ");         

         if (level < Log.Warn) {
            console.log.apply(console, consoleArgs);
         } else if (level < Log.Error) {
            console.warn.apply(console, consoleArgs);
         } else {
            console.error.apply(console, consoleArgs);
         }
      }
   }

   export class ScreenAppender implements IAppender {

      private _messages: string[] = [];
      private canvas: HTMLCanvasElement;
      private ctx: CanvasRenderingContext2D;
      constructor(width?: number, height?: number) {
         this.canvas = <HTMLCanvasElement>document.createElement('canvas');
         this.canvas.width = width || window.innerWidth;
         this.canvas.height = height || window.innerHeight;
         this.canvas.style.position = 'absolute';
         this.ctx = this.canvas.getContext('2d');
         document.body.appendChild(this.canvas);
      }

      public log(level: Log, args: any[]) {
         var message = args.join(",");

         //this.ctx.fillStyle = 'rgba(0,0,0,1.0)';
         this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

         this._messages.unshift("[" + Log[level] + "] : " + message);

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

   export class Logger {
      private static _instance: Logger = null;
      private appenders: IAppender[] = [];
      public defaultLevel: Log = Log.Info;

      constructor() {
         if (Logger._instance) {
            throw new Error("Logger is a singleton");
         }
         Logger._instance = this;
      }

      public static getInstance(): Logger {
         if (Logger._instance == null) {
            Logger._instance = new Logger();
         }
         return Logger._instance;
      }

      public addAppender(appender: IAppender) {
         this.appenders.push(appender);
      }

      private _log(level: Log, args: any[]): void {
         if (level == null) {
            level = this.defaultLevel;
         }
         var defaultLevel = this.defaultLevel;
         this.appenders.forEach(function (appender) {
            if (level >= defaultLevel) {
               appender.log(level, args);
            }
         });
      }

      public debug(...args): void {
         this._log(Log.Debug, args);
      }

      public info(...args): void {
         this._log(Log.Info, args);
      }

      public warn(...args): void {
         this._log(Log.Warn, args);
      }

      public error(...args): void {
         this._log(Log.Error, args);
      }

      public fatal(...args): void {
         this._log(Log.Fatal, args);
      }
   }
}