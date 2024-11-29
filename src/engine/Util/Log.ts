/* eslint-disable no-console */

import { Engine } from '../Engine';
import { vec } from '../Math/vector';
import { Color } from '../Color';

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
 * Excalibur comes built-in with a {@apilink ConsoleAppender} and {@apilink ScreenAppender}.
 * Derive from {@apilink Appender} to create your own logging appenders.
 */
export class Logger {
  private static _INSTANCE: Logger = null;
  private _appenders: Appender[] = [];

  constructor() {
    if (Logger._INSTANCE) {
      throw new Error('Logger is a singleton');
    }
    Logger._INSTANCE = this;
    // Default console appender
    Logger._INSTANCE.addAppender(new ConsoleAppender());
    return Logger._INSTANCE;
  }

  /**
   * Gets or sets the default logging level. Excalibur will only log
   * messages if equal to or above this level. Default: {@apilink LogLevel.Info}
   */
  public defaultLevel: LogLevel = LogLevel.Info;

  /**
   * Gets the current static instance of Logger
   */
  public static getInstance(): Logger {
    if (Logger._INSTANCE == null) {
      Logger._INSTANCE = new Logger();
    }
    return Logger._INSTANCE;
  }

  /**
   * Adds a new {@apilink Appender} to the list of appenders to write to
   */
  public addAppender(appender: Appender): void {
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

    const len = this._appenders.length;

    for (let i = 0; i < len; i++) {
      if (level >= this.defaultLevel) {
        this._appenders[i].log(level, args);
      }
    }
  }

  private _logOnceSet = new Set<any>();
  private _logOnce(level: LogLevel, args: any[]): void {
    const serialized = level + args.join('+');
    if (this._logOnceSet.has(serialized)) {
      return;
    } else {
      this._logOnceSet.add(serialized);
      this._log(level, args);
    }
  }

  /**
   * Writes a log message at the {@apilink LogLevel.Debug} level
   * @param args  Accepts any number of arguments
   */
  public debug(...args: any[]): void {
    this._log(LogLevel.Debug, args);
  }

  /**
   * Writes a log message once at the {@apilink LogLevel.Fatal} level, if it sees the same args again it wont log
   * @param args  Accepts any number of arguments
   */
  public debugOnce(...args: any[]): void {
    this._logOnce(LogLevel.Debug, args);
  }

  /**
   * Writes a log message at the {@apilink LogLevel.Info} level
   * @param args  Accepts any number of arguments
   */
  public info(...args: any[]): void {
    this._log(LogLevel.Info, args);
  }

  /**
   * Writes a log message once at the {@apilink LogLevel.Info} level, if it sees the same args again it wont log
   * @param args  Accepts any number of arguments
   */
  public infoOnce(...args: any[]): void {
    this._logOnce(LogLevel.Info, args);
  }

  /**
   * Writes a log message at the {@apilink LogLevel.Warn} level
   * @param args  Accepts any number of arguments
   */
  public warn(...args: any[]): void {
    this._log(LogLevel.Warn, args);
  }

  /**
   * Writes a log message once at the {@apilink LogLevel.Warn} level, if it sees the same args again it won't log
   * @param args  Accepts any number of arguments
   */
  public warnOnce(...args: any[]): void {
    this._logOnce(LogLevel.Warn, args);
  }

  /**
   * Writes a log message at the {@apilink LogLevel.Error} level
   * @param args  Accepts any number of arguments
   */
  public error(...args: any[]): void {
    this._log(LogLevel.Error, args);
  }

  /**
   * Writes a log message once at the {@apilink LogLevel.Error} level, if it sees the same args again it won't log
   * @param args  Accepts any number of arguments
   */
  public errorOnce(...args: any[]): void {
    this._logOnce(LogLevel.Error, args);
  }

  /**
   * Writes a log message at the {@apilink LogLevel.Fatal} level
   * @param args  Accepts any number of arguments
   */
  public fatal(...args: any[]): void {
    this._log(LogLevel.Fatal, args);
  }

  /**
   * Writes a log message once at the {@apilink LogLevel.Fatal} level, if it sees the same args again it won't log
   * @param args  Accepts any number of arguments
   */
  public fatalOnce(...args: any[]): void {
    this._logOnce(LogLevel.Fatal, args);
  }
}

/**
 * Contract for any log appender (such as console/screen)
 */
export interface Appender {
  /**
   * Logs a message at the given {@apilink LogLevel}
   * @param level  Level to log at
   * @param args   Arguments to log
   */
  log(level: LogLevel, args: any[]): void;
}

/**
 * Console appender for browsers (i.e. `console.log`)
 */
export class ConsoleAppender implements Appender {
  /**
   * Logs a message at the given {@apilink LogLevel}
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
    const consoleArgs: any[] = [];
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

export interface ScreenAppenderOptions {
  engine: Engine;
  /**
   * Optionally set the width of the overlay canvas
   */
  width?: number;
  /**
   * Optionally set the height of the overlay canvas
   */
  height?: number;
  /**
   * Adjust the text offset from the left side of the screen
   */
  xPos?: number;
  /**
   * Provide a text color
   */
  color?: Color;
  /**
   * Optionally set the CSS zindex of the overlay canvas
   */
  zIndex?: number;
}

/**
 * On-screen (canvas) appender
 */
export class ScreenAppender implements Appender {
  private _messages: string[] = [];
  public canvas: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D;
  private _pos = 10;
  private _color = Color.Black;
  private _options: ScreenAppenderOptions;
  constructor(options: ScreenAppenderOptions) {
    this._options = options;
    this.canvas = <HTMLCanvasElement>document.createElement('canvas');
    this._ctx = this.canvas.getContext('2d')!;
    this.canvas.style.position = 'absolute';
    this.canvas.style.zIndex = options.zIndex?.toString() ?? '99';
    document.body.appendChild(this.canvas);
    this._positionScreenAppenderCanvas();
    options.engine.screen.events.on('resize', () => {
      this._positionScreenAppenderCanvas();
    });
  }

  private _positionScreenAppenderCanvas() {
    const options = this._options;
    this.canvas.width = options.width ?? options.engine.screen.resolution.width;
    this.canvas.height = options.height ?? options.engine.screen.resolution.height;
    this.canvas.style.position = 'absolute';
    const pagePos = options.engine.screen.screenToPageCoordinates(vec(0, 0));
    this.canvas.style.left = pagePos.x + 'px';
    this.canvas.style.top = pagePos.y + 'px';
    this._pos = options.xPos ?? this._pos;
    this._color = options.color ?? this._color;
  }

  /**
   * Logs a message at the given {@apilink LogLevel}
   * @param level  Level to log at
   * @param args   Arguments to log
   */
  public log(level: LogLevel, args: any[]): void {
    const message = args.join(',');

    this._ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this._messages.unshift('[' + LogLevel[level] + '] : ' + message);

    let pos = 10;

    this._messages = this._messages.slice(0, 1000);
    for (let i = 0; i < this._messages.length; i++) {
      this._ctx.fillStyle = this._color.toRGBA();
      this._ctx.fillText(this._messages[i], this._pos, pos);
      pos += 10;
    }
  }
}
