/**
 * Flags is a feature flag implementation for Excalibur. They can only be operated **before {@apilink Engine} construction**
 * after which they are frozen and are read-only.
 *
 * Flags are used to enable experimental or preview features in Excalibur.
 */
declare class Flags {
    private static _FROZEN;
    private static _FLAGS;
    /**
     * Force excalibur to load the Canvas 2D graphics context fallback
     * @warning not all features of excalibur are supported in the Canvas 2D fallback
     */
    static useCanvasGraphicsContext(): void;
    /**
     * Force excalibur to use the less optimized image renderer
     */
    static useLegacyImageRenderer(): void;
    /**
     * Freeze all flag modifications making them readonly
     */
    static freeze(): void;
    /**
     * Resets internal flag state, not meant to be called by users. Only used for testing.
     *
     * Calling this in your game is UNSUPPORTED
     * @internal
     */
    static _reset(): void;
    /**
     * Enable a specific feature flag by name. **Note: can only be set before {@apilink Engine} constructor time**
     * @param flagName
     */
    static enable(flagName: string): void;
    /**
     * Disable a specific feature flag by name. **Note: can only be set before {@apilink Engine} constructor time**
     * @param flagName
     */
    static disable(flagName: string): void;
    /**
     * Check if a flag is enabled. If the flag is disabled or does not exist `false` is returned
     * @param flagName
     */
    static isEnabled(flagName: string): boolean;
    /**
     * Show a list of currently known flags
     */
    static show(): string[];
}

type Id<T extends string> = {
    type: T;
    value: number;
};
/**
 * Create a branded ID type from a number
 */
declare function createId<T extends string>(type: T, value: number): Id<T>;

type EventMap = Record<string, any>;
type EventKey<T extends EventMap> = string & keyof T;
type Handler<EventType> = (event: EventType) => void;
/**
 * Interface that represents a handle to a subscription that can be closed
 */
interface Subscription {
    /**
     * Removes the associated event handler, synonymous with events.off(...);
     */
    close(): void;
}
/**
 * Excalibur's typed event emitter, this allows events to be sent with any string to Type mapping
 */
declare class EventEmitter<TEventMap extends EventMap = any> {
    private _paused;
    private _empty;
    private _listeners;
    private _listenersOnce;
    private _pipes;
    /**
     * Removes all listeners and pipes
     */
    clear(): void;
    on<TEventName extends EventKey<TEventMap>>(eventName: TEventName, handler: Handler<TEventMap[TEventName]>): Subscription;
    on(eventName: string, handler: Handler<unknown>): Subscription;
    once<TEventName extends EventKey<TEventMap>>(eventName: TEventName, handler: Handler<TEventMap[TEventName]>): Subscription;
    once(eventName: string, handler: Handler<unknown>): Subscription;
    off<TEventName extends EventKey<TEventMap>>(eventName: TEventName, handler: Handler<TEventMap[TEventName]>): void;
    off(eventName: string, handler: Handler<unknown>): void;
    off(eventName: string): void;
    emit<TEventName extends EventKey<TEventMap>>(eventName: TEventName, event: TEventMap[TEventName]): void;
    emit(eventName: string, event?: any): void;
    /**
     * Replay events from this emitter to another
     * @param emitter
     */
    pipe(emitter: EventEmitter<any>): Subscription;
    /**
     * Remove any piped emitters
     * @param emitter
     */
    unpipe(emitter: EventEmitter<any>): void;
    /**
     * Paused event emitters do not emit events
     */
    pause(): void;
    /**
     * Unpaused event emitter do emit events
     */
    unpause(): void;
}

/**
 * Determines the scope of handling mouse/touch events.
 */
declare enum PointerScope {
    /**
     * Handle events on the `canvas` element only. Events originating outside the
     * `canvas` will not be handled.
     */
    Canvas = "Canvas",
    /**
     * Handles events on the entire document. All events will be handled by Excalibur.
     */
    Document = "Document"
}

/**
 * Provides standard colors (e.g. {@apilink Color.Black})
 * but you can also create custom colors using RGB, HSL, or Hex. Also provides
 * useful color operations like {@apilink Color.lighten}, {@apilink Color.darken}, and more.
 */
declare class Color {
    /**
     * Red channel
     */
    r: number;
    /**
     * Green channel
     */
    g: number;
    /**
     * Blue channel
     */
    b: number;
    /**
     * Alpha channel (between 0 and 1)
     */
    a: number;
    /**
     * Hue
     */
    h: number;
    /**
     * Saturation
     */
    s: number;
    /**
     * Lightness
     */
    l: number;
    /**
     * Creates a new instance of Color from an r, g, b, a
     * @param r  The red component of color (0-255)
     * @param g  The green component of color (0-255)
     * @param b  The blue component of color (0-255)
     * @param a  The alpha component of color (0-1.0)
     */
    constructor(r: number, g: number, b: number, a?: number);
    /**
     * Creates a new instance of Color from an r, g, b, a
     * @param r  The red component of color (0-255)
     * @param g  The green component of color (0-255)
     * @param b  The blue component of color (0-255)
     * @param a  The alpha component of color (0-1.0)
     */
    static fromRGB(r: number, g: number, b: number, a?: number): Color;
    /**
     * Creates a new instance of Color from a rgb string
     * @param string  CSS color string of the form rgba(255, 255, 255, 1) or rgb(255, 255, 255)
     */
    static fromRGBString(string: string): Color;
    /**
     * Creates a new instance of Color from a hex string
     * @param hex  CSS color string of the form #ffffff, the alpha component is optional
     */
    static fromHex(hex: string): Color;
    /**
     * Creates a new instance of Color from hsla values
     * @param h  Hue is represented [0-1]
     * @param s  Saturation is represented [0-1]
     * @param l  Luminance is represented [0-1]
     * @param a  Alpha is represented [0-1]
     */
    static fromHSL(h: number, s: number, l: number, a?: number): Color;
    /**
     * Lightens the current color by a specified amount
     * @param factor  The amount to lighten by [0-1]
     */
    lighten(factor?: number): Color;
    /**
     * Darkens the current color by a specified amount
     * @param factor  The amount to darken by [0-1]
     */
    darken(factor?: number): Color;
    /**
     * Saturates the current color by a specified amount
     * @param factor  The amount to saturate by [0-1]
     */
    saturate(factor?: number): Color;
    /**
     * Desaturates the current color by a specified amount
     * @param factor  The amount to desaturate by [0-1]
     */
    desaturate(factor?: number): Color;
    /**
     * Multiplies a color by another, results in a darker color
     * @param color  The other color
     */
    multiply(color: Color): Color;
    /**
     * Screens a color by another, results in a lighter color
     * @param color  The other color
     */
    screen(color: Color): Color;
    /**
     * Inverts the current color
     */
    invert(): Color;
    /**
     * Averages the current color with another
     * @param color  The other color
     */
    average(color: Color): Color;
    equal(color: Color): boolean;
    /**
     * Returns a CSS string representation of a color.
     * @param format Color representation, accepts: rgb, hsl, or hex
     */
    toString(format?: 'rgb' | 'hsl' | 'hex'): string;
    /**
     * Returns Hex Value of a color component
     * @param c color component
     * @see https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
     */
    private _componentToHex;
    /**
     * Return Hex representation of a color.
     */
    toHex(): string;
    /**
     * Return RGBA representation of a color.
     */
    toRGBA(): string;
    /**
     * Return HSLA representation of a color.
     */
    toHSLA(): string;
    /**
     * Returns a CSS string representation of a color.
     */
    fillStyle(): string;
    /**
     * Returns a clone of the current color.
     */
    clone(dest?: Color): Color;
    /**
     * Black (#000000)
     */
    static get Black(): Color;
    /**
     * White (#FFFFFF)
     */
    static get White(): Color;
    /**
     * Gray (#808080)
     */
    static get Gray(): Color;
    /**
     * Light gray (#D3D3D3)
     */
    static get LightGray(): Color;
    /**
     * Dark gray (#A9A9A9)
     */
    static get DarkGray(): Color;
    /**
     * Yellow (#FFFF00)
     */
    static get Yellow(): Color;
    /**
     * Orange (#FFA500)
     */
    static get Orange(): Color;
    /**
     * Red (#FF0000)
     */
    static get Red(): Color;
    /**
     * Vermilion (#FF5B31)
     */
    static get Vermilion(): Color;
    /**
     * Rose (#FF007F)
     */
    static get Rose(): Color;
    /**
     * Pink (#FFC0CB)
     */
    static get Pink(): Color;
    /**
     * Magenta (#FF00FF)
     */
    static get Magenta(): Color;
    /**
     * Violet (#7F00FF)
     */
    static get Violet(): Color;
    /**
     * Purple (#800080)
     */
    static get Purple(): Color;
    /**
     * Blue (#0000FF)
     */
    static get Blue(): Color;
    /**
     * Azure (#007FFF)
     */
    static get Azure(): Color;
    /**
     * Cyan (#00FFFF)
     */
    static get Cyan(): Color;
    /**
     * Viridian (#59978F)
     */
    static get Viridian(): Color;
    /**
     * Teal (#008080)
     */
    static get Teal(): Color;
    /**
     * Green (#00FF00)
     */
    static get Green(): Color;
    /**
     * Chartreuse (#7FFF00)
     */
    static get Chartreuse(): Color;
    /**
     * Transparent (#FFFFFF00)
     */
    static get Transparent(): Color;
    /**
     * ExcaliburBlue (#176BAA)
     */
    static get ExcaliburBlue(): Color;
    /**
     * Brown (#964B00)
     */
    static get Brown(): Color;
}

/**
 * Logging level that Excalibur will tag
 */
declare enum LogLevel {
    Debug = 0,
    Info = 1,
    Warn = 2,
    Error = 3,
    Fatal = 4
}
/**
 * Static singleton that represents the logging facility for Excalibur.
 * Excalibur comes built-in with a {@apilink ConsoleAppender} and {@apilink ScreenAppender}.
 * Derive from {@apilink Appender} to create your own logging appenders.
 */
declare class Logger {
    private static _INSTANCE;
    private _appenders;
    constructor();
    /**
     * Gets or sets the default logging level. Excalibur will only log
     * messages if equal to or above this level. Default: {@apilink LogLevel.Info}
     */
    defaultLevel: LogLevel;
    /**
     * Gets the current static instance of Logger
     */
    static getInstance(): Logger;
    /**
     * Adds a new {@apilink Appender} to the list of appenders to write to
     */
    addAppender(appender: Appender): void;
    /**
     * Clears all appenders from the logger
     */
    clearAppenders(): void;
    /**
     * Logs a message at a given LogLevel
     * @param level  The LogLevel`to log the message at
     * @param args   An array of arguments to write to an appender
     */
    private _log;
    private _logOnceSet;
    private _logOnce;
    /**
     * Writes a log message at the {@apilink LogLevel.Debug} level
     * @param args  Accepts any number of arguments
     */
    debug(...args: any[]): void;
    /**
     * Writes a log message once at the {@apilink LogLevel.Fatal} level, if it sees the same args again it wont log
     * @param args  Accepts any number of arguments
     */
    debugOnce(...args: any[]): void;
    /**
     * Writes a log message at the {@apilink LogLevel.Info} level
     * @param args  Accepts any number of arguments
     */
    info(...args: any[]): void;
    /**
     * Writes a log message once at the {@apilink LogLevel.Info} level, if it sees the same args again it wont log
     * @param args  Accepts any number of arguments
     */
    infoOnce(...args: any[]): void;
    /**
     * Writes a log message at the {@apilink LogLevel.Warn} level
     * @param args  Accepts any number of arguments
     */
    warn(...args: any[]): void;
    /**
     * Writes a log message once at the {@apilink LogLevel.Warn} level, if it sees the same args again it won't log
     * @param args  Accepts any number of arguments
     */
    warnOnce(...args: any[]): void;
    /**
     * Writes a log message at the {@apilink LogLevel.Error} level
     * @param args  Accepts any number of arguments
     */
    error(...args: any[]): void;
    /**
     * Writes a log message once at the {@apilink LogLevel.Error} level, if it sees the same args again it won't log
     * @param args  Accepts any number of arguments
     */
    errorOnce(...args: any[]): void;
    /**
     * Writes a log message at the {@apilink LogLevel.Fatal} level
     * @param args  Accepts any number of arguments
     */
    fatal(...args: any[]): void;
    /**
     * Writes a log message once at the {@apilink LogLevel.Fatal} level, if it sees the same args again it won't log
     * @param args  Accepts any number of arguments
     */
    fatalOnce(...args: any[]): void;
}
/**
 * Contract for any log appender (such as console/screen)
 */
interface Appender {
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
declare class ConsoleAppender implements Appender {
    /**
     * Logs a message at the given {@apilink LogLevel}
     * @param level  Level to log at
     * @param args   Arguments to log
     */
    log(level: LogLevel, args: any[]): void;
}
interface ScreenAppenderOptions {
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
declare class ScreenAppender implements Appender {
    private _messages;
    canvas: HTMLCanvasElement;
    private _ctx;
    private _pos;
    private _color;
    private _options;
    constructor(options: ScreenAppenderOptions);
    private _positionScreenAppenderCanvas;
    /**
     * Logs a message at the given {@apilink LogLevel}
     * @param level  Level to log at
     * @param args   Arguments to log
     */
    log(level: LogLevel, args: any[]): void;
}

interface Clonable<T> {
    clone(): T;
}

/**
 * An enum that describes the strategies that rotation actions can use
 */
declare enum RotationType {
    /**
     * Rotation via `ShortestPath` will use the smallest angle
     * between the starting and ending points. This strategy is the default behavior.
     */
    ShortestPath = "shortest-path",
    /**
     * Rotation via `LongestPath` will use the largest angle
     * between the starting and ending points.
     */
    LongestPath = "longest-path",
    /**
     * Rotation via `Clockwise` will travel in a clockwise direction,
     * regardless of the starting and ending points.
     */
    Clockwise = "clockwise",
    /**
     * Rotation via `CounterClockwise` will travel in a counterclockwise direction,
     * regardless of the starting and ending points.
     */
    CounterClockwise = "counter-clockwise"
}

/**
 * A 2D vector on a plane.
 */
declare class Vector implements Clonable<Vector> {
    /**
     * Get or set the vector equals epsilon, by default 0.001 meaning vectors within that tolerance on x or y will be considered equal.
     */
    static EQUALS_EPSILON: number;
    /**
     * A (0, 0) vector
     */
    static get Zero(): Vector;
    /**
     * A (1, 1) vector
     */
    static get One(): Vector;
    /**
     * A (0.5, 0.5) vector
     */
    static get Half(): Vector;
    /**
     * A unit vector pointing up (0, -1)
     */
    static get Up(): Vector;
    /**
     * A unit vector pointing down (0, 1)
     */
    static get Down(): Vector;
    /**
     * A unit vector pointing left (-1, 0)
     */
    static get Left(): Vector;
    /**
     * A unit vector pointing right (1, 0)
     */
    static get Right(): Vector;
    /**
     * Returns a vector of unit length in the direction of the specified angle in Radians.
     * @param angle The angle to generate the vector
     */
    static fromAngle(angle: number): Vector;
    /**
     * Checks if vector is not null, undefined, or if any of its components are NaN or Infinity.
     */
    static isValid(vec: Vector): boolean;
    /**
     * Calculates distance between two Vectors
     * @param vec1
     * @param vec2
     */
    static distance(vec1: Vector, vec2: Vector): number;
    static min(vec1: Vector, vec2: Vector): Vector;
    static max(vec1: Vector, vec2: Vector): Vector;
    /**
     * @param x  X component of the Vector
     * @param y  Y component of the Vector
     */
    constructor(x: number, y: number);
    protected _x: number;
    /**
     * Get the x component of the vector
     */
    get x(): number;
    /**
     * Set the x component, THIS MUTATES the current vector. It is usually better to create a new vector.
     * @warning **Be very careful setting components on shared vectors, mutating shared vectors can cause hard to find bugs**
     */
    set x(val: number);
    protected _y: number;
    /**
     * Get the y component of the vector
     */
    get y(): number;
    /**
     * Set the y component, THIS MUTATES the current vector. It is usually better to create a new vector.
     * @warning **Be very careful setting components on shared vectors, mutating shared vectors can cause hard to find bugs**
     */
    set y(val: number);
    /**
     * Sets the x and y components at once, THIS MUTATES the current vector. It is usually better to create a new vector.
     * @warning **Be very careful using this, mutating vectors can cause hard to find bugs**
     */
    setTo(x: number, y: number): void;
    /**
     * Compares this point against another and tests for equality
     * @param vector The other point to compare to
     * @param tolerance Amount of euclidean distance off we are willing to tolerate
     */
    equals(vector: Vector, tolerance?: number): boolean;
    /**
     * The distance to another vector. If no other Vector is specified, this will return the {@apilink magnitude}.
     * @param v  The other vector. Leave blank to use origin vector.
     */
    distance(v?: Vector): number;
    squareDistance(v?: Vector): number;
    /**
     * Clamps the current vector's magnitude mutating it
     * @param magnitude
     */
    clampMagnitude(magnitude: number): Vector;
    /**
     * The size (magnitude) of the Vector
     * @deprecated Will be removed in v1, use Vector.magnitude
     */
    get size(): number;
    /**
     * Setting the size mutates the current vector
     * @warning Can be used to set the size of the vector, **be very careful using this, mutating vectors can cause hard to find bugs**
     * @deprecated Will be removed in v1, use Vector.magnitude
     */
    set size(newLength: number);
    /**
     * The magnitude (length) of the Vector
     */
    get magnitude(): number;
    /**
     * Setting the size mutates the current vector
     * @warning Can be used to set the size of the vector, **be very careful using this, mutating vectors can cause hard to find bugs**
     */
    set magnitude(newMagnitude: number);
    /**
     * Normalizes a non-zero vector to have a magnitude of 1. Zero vectors return a new zero vector.
     */
    normalize(): Vector;
    /**
     * Returns the average (midpoint) between the current point and the specified
     */
    average(vec: Vector): Vector;
    /**
     * Scales a vector's by a factor of size
     * @param size  The factor to scale the magnitude by
     * @param dest  Optionally provide a destination vector for the result
     */
    scale(scale: Vector, dest?: Vector): Vector;
    scale(size: number, dest?: Vector): Vector;
    /**
     * Adds one vector to another
     * @param v The vector to add
     * @param dest Optionally copy the result into a provided vector
     */
    add(v: Vector, dest?: Vector): Vector;
    /**
     * Subtracts a vector from another, if you subtract vector `B.sub(A)` the resulting vector points from A -> B
     * @param v The vector to subtract
     */
    sub(v: Vector, dest?: Vector): Vector;
    /**
     * Adds one vector to this one modifying the original
     * @param v The vector to add
     * @warning Be very careful using this, mutating vectors can cause hard to find bugs
     */
    addEqual(v: Vector): Vector;
    /**
     * Subtracts a vector from this one modifying the original
     * @param v The vector to subtract
     * @warning Be very careful using this, mutating vectors can cause hard to find bugs
     */
    subEqual(v: Vector): Vector;
    /**
     * Scales this vector by a factor of size and modifies the original
     * @warning Be very careful using this, mutating vectors can cause hard to find bugs
     */
    scaleEqual(size: number): Vector;
    /**
     * Performs a dot product with another vector
     * @param v  The vector to dot
     */
    dot(v: Vector): number;
    /**
     * Performs a 2D cross product with scalar. 2D cross products with a scalar return a vector.
     * @param v  The scalar to cross
     */
    cross(v: number): Vector;
    /**
     * Performs a 2D cross product with another vector. 2D cross products return a scalar value not a vector.
     * @param v  The vector to cross
     */
    cross(v: Vector): number;
    static cross(num: number, vec: Vector): Vector;
    /**
     * Returns the perpendicular vector to this one
     */
    perpendicular(): Vector;
    /**
     * Returns the normal vector to this one, same as the perpendicular of length 1
     */
    normal(): Vector;
    /**
     * Negate the current vector
     */
    negate(): Vector;
    /**
     * Returns the angle of this vector, in range [0, 2*PI)
     */
    toAngle(): number;
    /**
     * Returns the difference in radians between the angle of this vector and given angle,
     * using the given rotation type.
     * @param angle in radians to which the vector has to be rotated, using {@apilink rotate}
     * @param rotationType what {@apilink RotationType} to use for the rotation
     * @returns the angle by which the vector needs to be rotated to match the given angle
     */
    angleBetween(angle: number, rotationType: RotationType): number;
    /**
     * Rotates the current vector around a point by a certain angle in radians.
     * Positive angle means rotation clockwise.
     */
    rotate(angle: number, anchor?: Vector, dest?: Vector): Vector;
    /**
     * Creates new vector that has the same values as the previous.
     */
    clone(dest?: Vector): Vector;
    /**
     * Returns a string representation of the vector.
     */
    toString(fixed?: number): string;
    /**
     * Linearly interpolates between the current vector and the target vector.
     * At `t = 0`, the result is the current vector, and at `t = 1`, the result is the target vector.
     * Values of `t` outside the range [0, 1] will be clamped to that range.
     *
     * @param target The target vector to interpolate towards.
     * @param t The interpolation factor, clamped between 0 and 1.
     * @returns A new vector that is the result of the linear interpolation.
     */
    lerp(target: Vector, t: number): Vector;
}
/**
 * Shorthand for creating new Vectors - returns a new Vector instance with the
 * provided X and Y components.
 * @param x  X component of the Vector
 * @param y  Y component of the Vector
 */
declare function vec(x: number, y: number): Vector;

/**
 * An enum that describes the types of collisions bodies can participate in
 */
declare enum CollisionType {
    /**
     * Bodies with the `PreventCollision` setting do not participate in any
     * collisions and do not raise collision events.
     */
    PreventCollision = "PreventCollision",
    /**
     * Bodies with the `Passive` setting only raise collision events, but are not
     * influenced or moved by other bodies and do not influence or move other bodies.
     * This is useful for use in trigger type behavior.
     */
    Passive = "Passive",
    /**
     * Bodies with the `Active` setting raise collision events and participate
     * in collisions with other bodies and will be push or moved by bodies sharing
     * the `Active` or `Fixed` setting.
     */
    Active = "Active",
    /**
     * Bodies with the `Fixed` setting raise collision events and participate in
     * collisions with other bodies. Actors with the `Fixed` setting will not be
     * pushed or moved by other bodies sharing the `Fixed`. Think of Fixed
     * bodies as "immovable/unstoppable" objects. If two `Fixed` bodies meet they will
     * not be pushed or moved by each other, they will not interact except to throw
     * collision events.
     */
    Fixed = "Fixed"
}

/**
 * Enum representing the coordinate plane for the position 2D vector in the {@apilink TransformComponent}
 */
declare enum CoordPlane {
    /**
     * The world coordinate plane (default) represents world space, any entities drawn with world
     * space move when the camera moves.
     */
    World = "world",
    /**
     * The screen coordinate plane represents screen space, entities drawn in screen space are pinned
     * to screen coordinates ignoring the camera.
     */
    Screen = "screen"
}

declare enum MatrixLocations {
    X = 12,
    Y = 13
}
/**
 * Excalibur Matrix helper for 4x4 matrices
 *
 * Useful for webgl 4x4 matrices
 */
declare class Matrix {
    /**
     *  4x4 matrix in column major order
     *
     * |         |         |          |          |
     * | ------- | ------- | -------- | -------- |
     * | data[0] | data[4] | data[8]  | data[12] |
     * | data[1] | data[5] | data[9]  | data[13] |
     * | data[2] | data[6] | data[10] | data[14] |
     * | data[3] | data[7] | data[11] | data[15] |
     *
     */
    data: Float32Array;
    /**
     * Creates an orthographic (flat non-perspective) projection
     * https://en.wikipedia.org/wiki/Orthographic_projection
     * @param left
     * @param right
     * @param bottom
     * @param top
     * @param near
     * @param far
     */
    static ortho(left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix;
    /**
     * Creates a new Matrix with the same data as the current 4x4
     */
    clone(dest?: Matrix): Matrix;
    /**
     * Converts the current matrix into a DOMMatrix
     *
     * This is useful when working with the browser Canvas context
     * @returns {DOMMatrix} DOMMatrix
     */
    toDOMMatrix(): DOMMatrix;
    static fromFloat32Array(data: Float32Array): Matrix;
    /**
     * Creates a new identity matrix (a matrix that when applied does nothing)
     */
    static identity(): Matrix;
    /**
     * Resets the current matrix to the identity matrix, mutating it
     * @returns {Matrix} Current matrix as identity
     */
    reset(): Matrix;
    /**
     * Creates a brand new translation matrix at the specified 3d point
     * @param x
     * @param y
     */
    static translation(x: number, y: number): Matrix;
    /**
     * Creates a brand new scaling matrix with the specified scaling factor
     * @param sx
     * @param sy
     */
    static scale(sx: number, sy: number): Matrix;
    /**
     * Creates a brand new rotation matrix with the specified angle in radians
     * @param angle
     */
    static rotation(angle: number): Matrix;
    /**
     * Multiply the current matrix by a vector producing a new vector
     * @param vector
     * @param dest
     */
    multiply(vector: Vector, dest?: Vector): Vector;
    /**
     * Multiply the current matrix by another matrix producing a new matrix
     * @param matrix
     * @param dest
     */
    multiply(matrix: Matrix, dest?: Matrix): Matrix;
    /**
     * Applies translation to the current matrix mutating it
     * @param x
     * @param y
     */
    translate(x: number, y: number): this;
    setPosition(x: number, y: number): void;
    getPosition(): Vector;
    /**
     * Applies rotation to the current matrix mutating it
     * @param angle in Radians
     */
    rotate(angle: number): this;
    /**
     * Applies scaling to the current matrix mutating it
     * @param x
     * @param y
     */
    scale(x: number, y: number): this;
    setRotation(angle: number): void;
    getRotation(): number;
    getScaleX(): number;
    getScaleY(): number;
    /**
     * Get the scale of the matrix
     */
    getScale(): Vector;
    private _scaleX;
    private _scaleSignX;
    setScaleX(val: number): void;
    private _scaleY;
    private _scaleSignY;
    setScaleY(val: number): void;
    setScale(scale: Vector): void;
    /**
     * Determinant of the upper left 2x2 matrix
     */
    getBasisDeterminant(): number;
    /**
     * Return the affine inverse, optionally store it in a target matrix.
     *
     * It's recommended you call .reset() the target unless you know what you're doing
     * @param target
     */
    getAffineInverse(target?: Matrix): Matrix;
    isIdentity(): boolean;
    toString(): string;
}

declare class AffineMatrix {
    /**
     * |         |         |          |
     * | ------- | ------- | -------- |
     * | data[0] | data[2] | data[4]  |
     * | data[1] | data[3] | data[5]  |
     * |   0     |    0    |    1     |
     */
    data: Float64Array<ArrayBuffer>;
    /**
     * Converts the current matrix into a DOMMatrix
     *
     * This is useful when working with the browser Canvas context
     * @returns {DOMMatrix} DOMMatrix
     */
    toDOMMatrix(): DOMMatrix;
    static identity(): AffineMatrix;
    /**
     * Creates a brand new translation matrix at the specified 3d point
     * @param x
     * @param y
     */
    static translation(x: number, y: number): AffineMatrix;
    /**
     * Creates a brand new scaling matrix with the specified scaling factor
     * @param sx
     * @param sy
     */
    static scale(sx: number, sy: number): AffineMatrix;
    /**
     * Creates a brand new rotation matrix with the specified angle in radians
     * @param angle
     */
    static rotation(angle: number): AffineMatrix;
    setPosition(x: number, y: number): void;
    getPosition(): Vector;
    /**
     * Applies rotation to the current matrix mutating it
     * @param angle in Radians
     */
    rotate(angle: number): this;
    /**
     * Applies translation to the current matrix mutating it
     * @param x
     * @param y
     */
    translate(x: number, y: number): this;
    /**
     * Applies scaling to the current matrix mutating it
     * @param x
     * @param y
     */
    scale(x: number, y: number): this;
    determinant(): number;
    /**
     * Return the affine inverse, optionally store it in a target matrix.
     *
     * It's recommended you call .reset() the target unless you know what you're doing
     * @param target
     */
    inverse(target?: AffineMatrix): AffineMatrix;
    /**
     * Multiply the current matrix by a vector producing a new vector
     * @param vector
     * @param dest
     */
    multiply(vector: Vector, dest?: Vector): Vector;
    /**
     * Multiply the current matrix by another matrix producing a new matrix
     * @param matrix
     * @param dest
     */
    multiply(matrix: AffineMatrix, dest?: AffineMatrix): AffineMatrix;
    /**
     * Packed array of length 8, that contains 4 vertices, with 2 components each
     * So: [x0, y0, x1, y1, x2, y2, x3, y3]
     * @param quad
     */
    multiplyQuadInPlace(quad: number[]): void;
    to4x4(): Matrix;
    setRotation(angle: number): void;
    getRotation(): number;
    getScaleX(): number;
    getScaleY(): number;
    /**
     * Get the scale of the matrix
     */
    getScale(): Vector;
    private _scale;
    private _scaleSignX;
    setScaleX(val: number): void;
    private _scaleSignY;
    setScaleY(val: number): void;
    setScale(scale: Vector): void;
    isIdentity(): boolean;
    /**
     * Resets the current matrix to the identity matrix, mutating it
     * @returns {AffineMatrix} Current matrix as identity
     */
    reset(): AffineMatrix;
    /**
     * Creates a new Matrix with the same data as the current {@apilink AffineMatrix}
     */
    clone(dest?: AffineMatrix): AffineMatrix;
    toString(): string;
}

declare class Transform {
    private _parent;
    get parent(): Transform | null;
    set parent(transform: Transform | null);
    get children(): readonly Transform[];
    private _children;
    private _pos;
    set pos(v: Vector);
    get pos(): Vector;
    set globalPos(v: Vector);
    private _globalPos;
    get globalPos(): Vector;
    private _rotation;
    set rotation(rotation: number);
    get rotation(): number;
    set globalRotation(rotation: number);
    get globalRotation(): number;
    private _scale;
    set scale(v: Vector);
    get scale(): Vector;
    set globalScale(v: Vector);
    private _globalScale;
    get globalScale(): Vector;
    private _z;
    set z(z: number);
    get z(): number;
    set globalZ(z: number);
    get globalZ(): number;
    private _isDirty;
    private _isInverseDirty;
    private _matrix;
    private _inverse;
    /**
     * Calculates and returns the matrix representation of this transform
     *
     * Avoid mutating the matrix to update the transform, it is not the source of truth.
     * Update the transform pos, rotation, scale.
     */
    get matrix(): AffineMatrix;
    /**
     * Calculates and returns the inverse matrix representation of this transform
     */
    get inverse(): AffineMatrix;
    private _scratch;
    private _calculateMatrix;
    flagDirty(): void;
    apply(point: Vector): Vector;
    applyInverse(point: Vector): Vector;
    setTransform(pos: Vector, rotation: number, scale: Vector): void;
    /**
     * Returns true if the transform has a negative x scale or y scale, but not both
     */
    isMirrored(): boolean;
    /**
     * Clones the current transform
     * **Warning does not clone the parent**
     * @param dest
     */
    clone(dest?: Transform): Transform;
    /**
     * Clones but keeps the same parent reference
     */
    cloneWithParent(dest?: Transform): Transform;
    toString(): string;
}

/**
 * Defines a generic message that can contain any data
 * @template T is the typescript Type of the data
 */
interface Message<T> {
    type: string;
    data: T;
}
/**
 * Defines an interface for an observer to receive a message via a notify() method
 */
interface Observer<T> {
    notify(message: T): void;
}
/**
 * Defines an interface for something that might be an observer if a notify() is present
 */
type MaybeObserver<T> = Partial<Observer<T>>;
/**
 * Simple Observable implementation
 * @template T is the typescript Type that defines the data being observed
 */
declare class Observable<T> {
    observers: Observer<T>[];
    subscriptions: ((val: T) => any)[];
    /**
     * Register an observer to listen to this observable
     * @param observer
     */
    register(observer: Observer<T>): void;
    /**
     * Register a callback to listen to this observable
     * @param func
     */
    subscribe(func: (val: T) => any): void;
    /**
     * Remove an observer from the observable
     * @param observer
     */
    unregister(observer: Observer<T>): void;
    /**
     * Remove a callback that is listening to this observable
     * @param func
     */
    unsubscribe(func: (val: T) => any): void;
    /**
     * Broadcasts a message to all observers and callbacks
     * @param message
     */
    notifyAll(message: T): void;
    /**
     * Removes all observers and callbacks
     */
    clear(): void;
}

type MaybeKnownComponent<Component, TKnownComponents> = Component extends TKnownComponents ? Component : Component | undefined;

/**
 * Interface holding an entity component pair
 */
interface EntityComponent {
    component: Component;
    entity: Entity;
}
/**
 * AddedComponent message
 */
declare class AddedComponent implements Message<EntityComponent> {
    data: EntityComponent;
    readonly type: 'Component Added';
    constructor(data: EntityComponent);
}
/**
 * Type guard to know if message is f an Added Component
 */
declare function isAddedComponent(x: Message<EntityComponent>): x is AddedComponent;
/**
 * RemovedComponent message
 */
declare class RemovedComponent implements Message<EntityComponent> {
    data: EntityComponent;
    readonly type: 'Component Removed';
    constructor(data: EntityComponent);
}
/**
 * Type guard to know if message is for a Removed Component
 */
declare function isRemovedComponent(x: Message<EntityComponent>): x is RemovedComponent;
/**
 * Built in events supported by all entities
 */
type EntityEvents = {
    initialize: InitializeEvent;
    add: AddEvent;
    remove: RemoveEvent;
    preupdate: PreUpdateEvent;
    postupdate: PostUpdateEvent;
    kill: KillEvent;
};
declare const EntityEvents: {
    readonly Add: "add";
    readonly Remove: "remove";
    readonly Initialize: "initialize";
    readonly PreUpdate: "preupdate";
    readonly PostUpdate: "postupdate";
    readonly Kill: "kill";
};
interface EntityOptions<TComponents extends Component> {
    name?: string;
    components?: TComponents[];
}
/**
 * An Entity is the base type of anything that can have behavior in Excalibur, they are part of the built in entity component system
 *
 * Entities can be strongly typed with the components they contain
 *
 * ```typescript
 * const entity = new Entity<ComponentA | ComponentB>();
 * entity.components.a; // Type ComponentA
 * entity.components.b; // Type ComponentB
 * ```
 */
declare class Entity<TKnownComponents extends Component = any> implements OnInitialize, OnPreUpdate, OnPostUpdate, OnAdd, OnRemove {
    private static _ID;
    /**
     * The unique identifier for the entity
     */
    id: number;
    name: string;
    /**
     * Listen to or emit events for an entity
     */
    events: EventEmitter<EntityEvents>;
    private _tags;
    componentAdded$: Observable<Component>;
    componentRemoved$: Observable<Component>;
    tagAdded$: Observable<string>;
    tagRemoved$: Observable<string>;
    /**
     * Current components on the entity
     *
     * **Do not modify**
     *
     * Use addComponent/removeComponent otherwise the ECS will not be notified of changes.
     */
    readonly components: Map<Function, Component>;
    componentValues: Component[];
    private _componentsToRemove;
    constructor(options: EntityOptions<TKnownComponents>);
    constructor(components?: TKnownComponents[], name?: string);
    /**
     * The current scene that the entity is in, if any
     */
    scene: Scene | null;
    /**
     * Whether this entity is active, if set to false it will be reclaimed
     * @deprecated use isActive
     */
    get active(): boolean;
    /**
     * Whether this entity is active, if set to false it will be reclaimed
     * @deprecated use isActive
     */
    set active(val: boolean);
    /**
     * Whether this entity is active, if set to false it will be reclaimed
     */
    isActive: boolean;
    /**
     * Kill the entity, means it will no longer be updated. Kills are deferred to the end of the update.
     * If parented it will be removed from the parent when killed.
     */
    kill(): void;
    isKilled(): boolean;
    /**
     * Specifically get the tags on the entity from {@apilink TagsComponent}
     */
    get tags(): Set<string>;
    /**
     * Check if a tag exists on the entity
     * @param tag name to check for
     */
    hasTag(tag: string): boolean;
    /**
     * Adds a tag to an entity
     * @param tag
     */
    addTag(tag: string): Entity<TKnownComponents>;
    /**
     * Removes a tag on the entity
     *
     * Removals are deferred until the end of update
     * @param tag
     */
    removeTag(tag: string): Entity<TKnownComponents>;
    /**
     * The types of the components on the Entity
     */
    get types(): ComponentCtor[];
    /**
     * Returns all component instances on entity
     */
    getComponents(): Component[];
    /**
     * Verifies that an entity has all the required types
     * @param requiredTypes
     */
    hasAll<TComponent extends Component>(requiredTypes: ComponentCtor<TComponent>[]): boolean;
    /**
     * Verifies that an entity has all the required tags
     * @param requiredTags
     */
    hasAllTags(requiredTags: string[]): boolean;
    get<TComponent extends Component>(type: ComponentCtor<TComponent>): MaybeKnownComponent<TComponent, TKnownComponents>;
    private _parent;
    get parent(): Entity | null;
    childrenAdded$: Observable<Entity<any>>;
    childrenRemoved$: Observable<Entity<any>>;
    private _children;
    /**
     * Get the direct children of this entity
     */
    get children(): readonly Entity[];
    /**
     * Unparents this entity, if there is a parent. Otherwise it does nothing.
     */
    unparent(): void;
    /**
     * Adds an entity to be a child of this entity
     * @param entity
     */
    addChild(entity: Entity): Entity;
    /**
     * Remove an entity from children if it exists
     * @param entity
     */
    removeChild(entity: Entity): Entity;
    /**
     * Removes all children from this entity
     */
    removeAllChildren(): Entity;
    /**
     * Returns a list of parent entities starting with the topmost parent. Includes the current entity.
     */
    getAncestors(): Entity[];
    /**
     * Returns a list of all the entities that descend from this entity. Includes the current entity.
     */
    getDescendants(): Entity[];
    /**
     * Creates a deep copy of the entity and a copy of all its components
     */
    clone(): Entity;
    /**
     * Adds a copy of all the components from another template entity as a "prefab"
     * @param templateEntity Entity to use as a template
     * @param force Force component replacement if it already exists on the target entity
     */
    addTemplate(templateEntity: Entity, force?: boolean): Entity;
    private _getClassHierarchyRoot;
    /**
     * Adds a component to the entity
     * @param component Component or Entity to add copy of components from
     * @param force Optionally overwrite any existing components of the same type
     */
    addComponent<TComponent extends Component>(component: TComponent, force?: boolean): Entity<TKnownComponents | TComponent>;
    /**
     * Removes a component from the entity, by default removals are deferred to the end of entity update to avoid consistency issues
     *
     * Components can be force removed with the `force` flag, the removal is not deferred and happens immediately
     * @param typeOrInstance
     * @param force
     */
    removeComponent<TComponent extends Component>(typeOrInstance: ComponentCtor<TComponent> | TComponent, force?: boolean): Entity<Exclude<TKnownComponents, TComponent>>;
    clearComponents(): void;
    /**
     * @hidden
     * @internal
     */
    processComponentRemoval(): void;
    /**
     * Check if a component type exists
     * @param type
     */
    has<TComponent extends Component>(type: ComponentCtor<TComponent>): boolean;
    private _isInitialized;
    private _isAdded;
    /**
     * Gets whether the actor is Initialized
     */
    get isInitialized(): boolean;
    get isAdded(): boolean;
    /**
     * Initializes this entity, meant to be called by the Scene before first update not by users of Excalibur.
     *
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     * @internal
     */
    _initialize(engine: Engine): void;
    /**
     * Adds this Actor, meant to be called by the Scene when Actor is added.
     *
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     * @internal
     */
    _add(engine: Engine): void;
    /**
     * Removes Actor, meant to be called by the Scene when Actor is added.
     *
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     * @internal
     */
    _remove(engine: Engine): void;
    /**
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * Internal _preupdate handler for {@apilink onPreUpdate} lifecycle event
     * @internal
     */
    _preupdate(engine: Engine, elapsed: number): void;
    /**
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * Internal _preupdate handler for {@apilink onPostUpdate} lifecycle event
     * @internal
     */
    _postupdate(engine: Engine, elapsed: number): void;
    /**
     * `onInitialize` is called before the first update of the entity. This method is meant to be
     * overridden.
     *
     * Synonymous with the event handler `.on('initialize', (evt) => {...})`
     */
    onInitialize(engine: Engine): void;
    /**
     * `onAdd` is called when Actor is added to scene. This method is meant to be
     * overridden.
     *
     * Synonymous with the event handler `.on('add', (evt) => {...})`
     */
    onAdd(engine: Engine): void;
    /**
     * `onRemove` is called when Actor is added to scene. This method is meant to be
     * overridden.
     *
     * Synonymous with the event handler `.on('remove', (evt) => {...})`
     */
    onRemove(engine: Engine): void;
    /**
     * Safe to override onPreUpdate lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
     *
     * `onPreUpdate` is called directly before an entity is updated.
     */
    onPreUpdate(engine: Engine, elapsed: number): void;
    /**
     * Safe to override onPostUpdate lifecycle event handler. Synonymous with `.on('postupdate', (evt) =>{...})`
     *
     * `onPostUpdate` is called directly after an entity is updated.
     */
    onPostUpdate(engine: Engine, elapsed: number): void;
    /**
     *
     * Entity update lifecycle, called internally
     * @internal
     * @param engine
     * @param elapsed
     */
    update(engine: Engine, elapsed: number): void;
    emit<TEventName extends EventKey<EntityEvents>>(eventName: TEventName, event: EntityEvents[TEventName]): void;
    emit(eventName: string, event?: any): void;
    on<TEventName extends EventKey<EntityEvents>>(eventName: TEventName, handler: Handler<EntityEvents[TEventName]>): Subscription;
    on(eventName: string, handler: Handler<unknown>): Subscription;
    once<TEventName extends EventKey<EntityEvents>>(eventName: TEventName, handler: Handler<EntityEvents[TEventName]>): Subscription;
    once(eventName: string, handler: Handler<unknown>): Subscription;
    off<TEventName extends EventKey<EntityEvents>>(eventName: TEventName, handler: Handler<EntityEvents[TEventName]>): void;
    off(eventName: string, handler: Handler<unknown>): void;
    off(eventName: string): void;
}

/**
 * Component Constructor Types
 */
declare type ComponentCtor<TComponent extends Component = Component> = new (...args: any[]) => TComponent;
/**
 *
 */
declare function isComponentCtor(value: any): value is ComponentCtor<Component>;
/**
 * Components are containers for state in Excalibur, the are meant to convey capabilities that an Entity possesses
 *
 * Implementations of Component must have a zero-arg constructor to support dependencies
 *
 * ```typescript
 * class MyComponent extends ex.Component {
 *   // zero arg support required if you want to use component dependencies
 *   constructor(public optionalPos?: ex.Vector) {}
 * }
 * ```
 */
declare abstract class Component {
    /**
     * Optionally list any component types this component depends on
     * If the owner entity does not have these components, new components will be added to the entity
     *
     * Only components with zero-arg constructors are supported as automatic component dependencies
     */
    readonly dependencies?: ComponentCtor[];
    /**
     * Current owning {@apilink Entity}, if any, of this component. Null if not added to any {@apilink Entity}
     */
    owner?: Entity;
    /**
     * Clones any properties on this component, if that property value has a `clone()` method it will be called
     */
    clone(): Component;
    /**
     * Optional callback called when a component is added to an entity
     */
    onAdd?(owner: Entity): void;
    /**
     * Optional callback called when a component is removed from an entity
     */
    onRemove?(previousOwner: Entity): void;
}

declare class TransformComponent extends Component {
    private _logger;
    private _parentComponent;
    private _transform;
    get(): Transform;
    private _addChildTransform;
    onAdd(owner: Entity): void;
    onRemove(_previousOwner: Entity): void;
    /**
     * Observable that emits when the z index changes on this component
     */
    zIndexChanged$: Observable<number>;
    /**
     * The z-index ordering of the entity, a higher values are drawn on top of lower values.
     * For example z=99 would be drawn on top of z=0.
     */
    get z(): number;
    set z(val: number);
    get globalZ(): number;
    set globalZ(z: number);
    private _coordPlane;
    /**
     * The {@apilink CoordPlane | `coordinate plane`} for this transform for the entity.
     */
    get coordPlane(): CoordPlane;
    set coordPlane(value: CoordPlane);
    get pos(): Vector;
    set pos(v: Vector);
    get globalPos(): Vector;
    set globalPos(v: Vector);
    get rotation(): number;
    set rotation(rotation: number);
    get globalRotation(): number;
    set globalRotation(rotation: number);
    get scale(): Vector;
    set scale(v: Vector);
    get globalScale(): Vector;
    set globalScale(v: Vector);
    applyInverse(v: Vector): Vector;
    apply(v: Vector): Vector;
    clone(): TransformComponent;
}

interface Motion {
    /**
     * The velocity of an entity in pixels per second
     */
    vel: Vector;
    /**
     * The maximum component-wise velocity of an entity in pixels per second
     */
    maxVel: Vector;
    /**
     * The acceleration of entity in pixels per second^2
     */
    acc: Vector;
    /**
     * The scale rate of change in scale units per second
     */
    scaleFactor: Vector;
    /**
     * The angular velocity which is how quickly the entity is rotating in radians per second
     */
    angularVelocity: number;
    /**
     * The amount of torque applied to the entity, angular acceleration is torque * inertia
     */
    torque: number;
    /**
     * Inertia can be thought of as the resistance to motion
     */
    inertia: number;
}
declare class MotionComponent extends Component {
    /**
     * The velocity of an entity in pixels per second
     */
    vel: Vector;
    /**
     * The maximum component-wise velocity of an entity in pixels per second
     */
    maxVel: Vector;
    /**
     * The acceleration of entity in pixels per second^2
     */
    acc: Vector;
    /**
     * The scale rate of change in scale units per second
     */
    scaleFactor: Vector;
    /**
     * The angular velocity which is how quickly the entity is rotating in radians per second
     */
    angularVelocity: number;
    /**
     * The amount of torque applied to the entity, angular acceleration is torque * inertia
     */
    torque: number;
    /**
     * Inertia can be thought of as the resistance to motion
     */
    inertia: number;
}

/**
 * CollisionGroups indicate like members that do not collide with each other. Use {@apilink CollisionGroupManager} to create {@apilink CollisionGroup}s
 *
 * For example:
 *
 * Players have collision group "player"
 *
 * ![Player Collision Group](/assets/images/docs/CollisionGroupsPlayer.png)
 *
 * Enemies have collision group "enemy"
 *
 * ![Enemy Collision Group](/assets/images/docs/CollisionGroupsEnemy.png)
 *
 * Blocks have collision group "ground"
 *
 * ![Ground collision group](/assets/images/docs/CollisionGroupsGround.png)
 *
 * Players don't collide with each other, but enemies and blocks. Likewise, enemies don't collide with each other but collide
 * with players and blocks.
 *
 * This is done with bitmasking, see the following pseudo-code
 *
 * PlayerGroup = `0b001`
 * PlayerGroupMask = `0b110`
 *
 * EnemyGroup = `0b010`
 * EnemyGroupMask = `0b101`
 *
 * BlockGroup = `0b100`
 * BlockGroupMask = `0b011`
 *
 * Should Players collide? No because the bitwise mask evaluates to 0
 * `(player1.group & player2.mask) === 0`
 * `(0b001 & 0b110) === 0`
 *
 * Should Players and Enemies collide? Yes because the bitwise mask is non-zero
 * `(player1.group & enemy1.mask) === 1`
 * `(0b001 & 0b101) === 1`
 *
 * Should Players and Blocks collide? Yes because the bitwise mask is non-zero
 * `(player1.group & blocks1.mask) === 1`
 * `(0b001 & 0b011) === 1`
 */
declare class CollisionGroup {
    /**
     * The `All` {@apilink CollisionGroup} is a special group that collides with all other groups including itself,
     * it is the default collision group on colliders.
     */
    static All: CollisionGroup;
    private _name;
    private _category;
    private _mask;
    /**
     * STOP!!** It is preferred that {@apilink CollisionGroupManager.create} is used to create collision groups
     *  unless you know how to construct the proper bitmasks. See https://github.com/excaliburjs/Excalibur/issues/1091 for more info.
     * @param name Name of the collision group
     * @param category 32 bit category for the group, should be a unique power of 2. For example `0b001` or `0b010`
     * @param mask 32 bit mask of category, or `~category` generally. For a category of `0b001`, the mask would be `0b110`
     */
    constructor(name: string, category: number, mask: number);
    /**
     * Get the name of the collision group
     */
    get name(): string;
    /**
     * Get the category of the collision group, a 32 bit number which should be a unique power of 2
     */
    get category(): number;
    /**
     * Get the mask for this collision group
     */
    get mask(): number;
    /**
     * Evaluates whether 2 collision groups can collide
     *
     * This means the mask has the same bit set the other category and vice versa
     * @param other  CollisionGroup
     */
    canCollide(other: CollisionGroup): boolean;
    /**
     * Inverts the collision group. For example, if before the group specified "players",
     * inverting would specify all groups except players
     * @returns CollisionGroup
     */
    invert(): CollisionGroup;
    /**
     * Combine collision groups with each other. The new group includes all of the previous groups.
     * @param collisionGroups
     */
    static combine(collisionGroups: CollisionGroup[]): CollisionGroup;
    /**
     * Creates a collision group that collides with the listed groups
     * @param collisionGroups
     */
    static collidesWith(collisionGroups: CollisionGroup[]): CollisionGroup;
    toString(): string;
}

type DeepRequired<T> = Required<{
    [K in keyof T]: T[K] extends Required<T[K]> ? T[K] : DeepRequired<T[K]>;
}>;

/**
 * Possible collision resolution strategies
 *
 * The default is {@apilink SolverStrategy.Arcade} which performs simple axis aligned arcade style physics. This is useful for things
 * like platformers or top down games.
 *
 * More advanced rigid body physics are enabled by setting {@apilink SolverStrategy.Realistic} which allows for complicated
 * simulated physical interactions.
 */
declare enum SolverStrategy {
    Arcade = "arcade",
    Realistic = "realistic"
}

/**
 * Tells the Arcade collision solver to prefer certain contacts over others
 */
declare enum ContactSolveBias {
    None = "none",
    VerticalFirst = "vertical-first",
    HorizontalFirst = "horizontal-first"
}
/**
 * Contact bias values
 */
interface ContactBias {
    vertical: number;
    horizontal: number;
}
/**
 * Vertical First contact solve bias Used by the {@apilink ArcadeSolver} to sort contacts
 */
declare const VerticalFirst: ContactBias;
/**
 * Horizontal First contact solve bias Used by the {@apilink ArcadeSolver} to sort contacts
 */
declare const HorizontalFirst: ContactBias;
/**
 * None value, {@apilink ArcadeSolver} sorts contacts using distance by default
 */
declare const None: ContactBias;

/**
 * Possible collision resolution strategies
 *
 * The default is {@apilink SolverStrategy.Arcade} which performs simple axis aligned arcade style physics. This is useful for things
 * like platformers or top down games.
 *
 * More advanced rigid body physics are enabled by setting {@apilink SolverStrategy.Realistic} which allows for complicated
 * simulated physical interactions.
 */
declare enum SpatialPartitionStrategy {
    DynamicTree = "dynamic-tree",
    SparseHashGrid = "sparse-hash-grid"
}

interface DynamicTreeConfig {
    /**
     * Pad collider BoundingBox by a constant amount for purposes of potential pairs
     *
     * Default 5 pixels
     */
    boundsPadding?: number;
    /**
     * Factor to add to the collider BoundingBox, bounding box (dimensions += vel * dynamicTreeVelocityMultiplier);
     *
     * Default 2
     */
    velocityMultiplier?: number;
}
interface SparseHashGridConfig {
    /**
     * Size of the grid cells, default is 100x100 pixels.
     *
     * A good size means that your average collider in your game would fit inside the cell size by size dimension.
     */
    size: number;
}
interface PhysicsConfig {
    /**
     * Excalibur physics simulation is enabled
     */
    enabled?: boolean;
    /**
     * Configure gravity that applies to all {@apilink CollisionType.Active} bodies.
     *
     * This is acceleration in pixels/sec^2
     *
     * Default vec(0, 0)
     *
     * {@apilink BodyComponent.useGravity} to opt out
     */
    gravity?: Vector;
    /**
     * Configure the type of physics simulation you would like
     *
     * * {@apilink SolverStrategy.Arcade} is suitable for games where you might be doing platforming or top down movement.
     * * {@apilink SolverStrategy.Realistic} is where you need objects to bounce off each other and respond like real world objects.
     *
     * Default is Arcade
     */
    solver?: SolverStrategy;
    /**
     * Configure physics sub-stepping, this can increase simulation fidelity by doing smaller physics steps
     *
     * Default is 1 step
     */
    substep?: number;
    /**
     * Configure colliders
     */
    colliders?: {
        /**
         * Treat composite collider's member colliders as either separate colliders for the purposes of onCollisionStart/onCollision
         * or as a single collider together.
         *
         * This property can be overridden on individual {@apilink CompositeColliders}.
         *
         * For composites without gaps or small groups of colliders, you probably want 'together'
         *
         * For composites with deliberate gaps, like a platforming level layout, you probably want 'separate'
         *
         * Default is 'together' if unset
         */
        compositeStrategy?: 'separate' | 'together';
    };
    /**
     * Configure excalibur continuous collision (WIP)
     */
    continuous?: {
        /**
         * Enable fast moving body checking, this enables checking for collision pairs via raycast for fast moving objects to prevent
         * bodies from tunneling through one another.
         *
         * Default true
         */
        checkForFastBodies?: boolean;
        /**
         * Disable minimum fast moving body raycast, by default if checkForFastBodies = true Excalibur will only check if the
         * body is moving at least half of its minimum dimension in an update. If disableMinimumSpeedForFastBody is set to true,
         * Excalibur will always perform the fast body raycast regardless of speed.
         *
         * Default false
         */
        disableMinimumSpeedForFastBody?: boolean;
        /**
         * Surface epsilon is used to help deal with predicting collisions by applying a slop
         *
         * Default 0.1
         */
        surfaceEpsilon?: number;
    };
    /**
     * Configure body defaults
     */
    bodies?: {
        /**
         * Configure default mass that bodies have
         *
         * Default 10 mass units
         */
        defaultMass?: number;
        /**
         * Sleep epsilon
         *
         * Default 0.07
         */
        sleepEpsilon?: number;
        /**
         * Wake Threshold, the amount of "motion" need to wake a body from sleep
         *
         * Default 0.07 * 3;
         */
        wakeThreshold?: number;
        /**
         * Sleep bias
         *
         * Default 0.9
         */
        sleepBias?: number;
        /**
         * By default bodies do not sleep, this can be turned on to improve perf if you have a lot of bodies.
         *
         * Default false
         */
        canSleepByDefault?: boolean;
    };
    /**
     * Configure the spatial data structure for locating pairs and raycasts
     */
    spatialPartition?: SpatialPartitionStrategy;
    sparseHashGrid?: SparseHashGridConfig;
    dynamicTree?: DynamicTreeConfig;
    /**
     * Configure the {@apilink ArcadeSolver}
     */
    arcade?: {
        /**
         * Hints the {@apilink ArcadeSolver} to preferentially solve certain contact directions first.
         *
         * Options:
         * * Solve {@apilink ContactSolveBias.VerticalFirst} which will do vertical contact resolution first (useful for platformers
         * with up/down gravity)
         * * Solve {@apilink ContactSolveBias.HorizontalFirst} which will do horizontal contact resolution first (useful for games with
         * left/right forces)
         * * By default {@apilink ContactSolveBias.None} which sorts by distance
         */
        contactSolveBias?: ContactSolveBias;
    };
    /**
     * Configure the {@apilink RealisticSolver}
     */
    realistic?: {
        contactSolveBias?: ContactSolveBias;
        /**
         * Number of position iterations (overlap) to run in the solver
         *
         * Default 3 iterations
         */
        positionIterations?: number;
        /**
         * Number of velocity iteration (response) to run in the solver
         *
         * Default 8 iterations
         */
        velocityIterations?: number;
        /**
         * Amount of overlap to tolerate in pixels
         *
         * Default 1 pixel
         */
        slop?: number;
        /**
         * Amount of positional overlap correction to apply each position iteration of the solver
         * 0 - meaning no correction, 1 - meaning correct all overlap. Generally values 0 < .5 look nice.
         *
         * Default 0.2
         */
        steeringFactor?: number;
        /**
         * Warm start set to true re-uses impulses from previous frames back in the solver. Re-using impulses helps
         * the solver converge quicker
         *
         * Default true
         */
        warmStart?: boolean;
    };
}
declare const getDefaultPhysicsConfig: () => DeepRequired<PhysicsConfig>;

type ComponentInstance<T> = T extends ComponentCtor<infer R> ? R : never;
/**
 * Turns `Entity<A | B>` into `Entity<A> | Entity<B>`
 */
type DistributeEntity<T> = T extends infer U extends Component ? Entity<U> : never;
interface QueryParams<TKnownComponentCtors extends ComponentCtor<Component> = never, TAnyComponentCtors extends ComponentCtor<Component> = never> {
    components?: {
        all?: TKnownComponentCtors[];
        any?: TAnyComponentCtors[];
        not?: ComponentCtor<Component>[];
    };
    tags?: {
        all?: string[];
        any?: string[];
        not?: string[];
    };
}
type QueryEntity<TAllComponentCtors extends ComponentCtor<Component> = never, TAnyComponentCtors extends ComponentCtor<Component> = never> = [TAnyComponentCtors] extends [never] ? Entity<ComponentInstance<TAllComponentCtors>> : Entity<ComponentInstance<TAllComponentCtors>> | DistributeEntity<ComponentInstance<TAnyComponentCtors>>;
/**
 * Represents query for entities that match a list of types that is cached and observable
 *
 * Queries can be strongly typed by supplying a type union in the optional type parameter
 * ```typescript
 * const queryAB = new ex.Query<ComponentTypeA | ComponentTypeB>(['A', 'B']);
 * ```
 */
declare class Query<TAllComponentCtors extends ComponentCtor<Component> = never, TAnyComponentCtors extends ComponentCtor<Component> = never> {
    readonly id: string;
    entities: QueryEntity<TAllComponentCtors, TAnyComponentCtors>[];
    /**
     * This fires right after the component is added
     */
    entityAdded$: Observable<QueryEntity<TAllComponentCtors, TAnyComponentCtors>>;
    /**
     * This fires right before the component is actually removed from the entity, it will still be available for cleanup purposes
     */
    entityRemoved$: Observable<QueryEntity<TAllComponentCtors, TAnyComponentCtors>>;
    readonly filter: {
        components: {
            all: Set<TAllComponentCtors>;
            any: Set<TAnyComponentCtors>;
            not: Set<ComponentCtor<Component>>;
        };
        tags: {
            all: Set<string>;
            any: Set<string>;
            not: Set<string>;
        };
    };
    constructor(params: TAllComponentCtors[] | QueryParams<TAllComponentCtors, TAnyComponentCtors>);
    static createId(params: Function[] | QueryParams<any, any>): string;
    static hashTags(set: Set<string>): string;
    static hashComponents(set: Set<ComponentCtor<Component>>): string;
    matches(entity: Entity): boolean;
    /**
     * Potentially adds an entity to a query index, returns true if added, false if not
     * @param entity
     */
    checkAndAdd(entity: Entity): boolean;
    removeEntity(entity: Entity): void;
    /**
     * Returns a list of entities that match the query
     * @param sort Optional sorting function to sort entities returned from the query
     */
    getEntities(sort?: (a: Entity, b: Entity) => number): QueryEntity<TAllComponentCtors, TAnyComponentCtors>[];
}

declare class TagQuery<TKnownTags extends string = never> {
    readonly requiredTags: TKnownTags[];
    readonly id: string;
    tags: Set<TKnownTags>;
    entities: Entity<any>[];
    /**
     * This fires right after the component is added
     */
    entityAdded$: Observable<Entity<any>>;
    /**
     * This fires right before the component is actually removed from the entity, it will still be available for cleanup purposes
     */
    entityRemoved$: Observable<Entity<any>>;
    constructor(requiredTags: TKnownTags[]);
    static createId(requiredComponents: string[]): string;
    checkAndAdd(entity: Entity): boolean;
    removeEntity(entity: Entity): void;
    /**
     * Returns a list of entities that match the query
     * @param sort Optional sorting function to sort entities returned from the query
     */
    getEntities(sort?: (a: Entity, b: Entity) => number): Entity<any>[];
}

/**
 * The query manager is responsible for updating all queries when entities/components change
 */
declare class QueryManager {
    private _world;
    private _queries;
    private _addComponentHandlers;
    private _removeComponentHandlers;
    private _componentToQueriesIndex;
    private _tagQueries;
    private _addTagHandlers;
    private _removeTagHandlers;
    private _tagToQueriesIndex;
    constructor(_world: World);
    createQuery<TKnownComponentCtors extends ComponentCtor<Component> = never, TAnyComponentCtors extends ComponentCtor<Component> = never>(params: TKnownComponentCtors[] | QueryParams<TKnownComponentCtors, TAnyComponentCtors>): Query<TKnownComponentCtors, TAnyComponentCtors>;
    createTagQuery<TKnownTags extends string>(requiredTags: TKnownTags[]): TagQuery<TKnownTags>;
    private _createAddComponentHandler;
    private _createRemoveComponentHandler;
    private _createAddTagHandler;
    private _createRemoveTagHandler;
    /**
     * Scans queries and locates any that need this entity added
     * @param entity
     */
    addEntity(entity: Entity): void;
    /**
     * Scans queries and locates any that need this entity removed
     * @param entity
     */
    removeEntity(entity: Entity): void;
    /**
     * Updates any queries when a component is added to an entity
     * @param entity
     * @param component
     */
    addComponent(entity: Entity, component: Component): void;
    /**
     * Updates any queries when a component is removed from an entity
     * @param entity
     * @param component
     */
    removeComponent(entity: Entity, component: Component): void;
    /**
     * Updates any queries when a tag is added to an entity
     * @param entity
     * @param tag
     */
    addTag(entity: Entity, tag: string): void;
    /**
     * Updates any queries when a component is removed from an entity
     * @param entity
     * @param tag
     */
    removeTag(entity: Entity, tag: string): void;
}

/**
 * Enum that determines whether to run the system in the update or draw phase
 */
declare enum SystemType {
    Update = "update",
    Draw = "draw"
}
/**
 * An Excalibur {@apilink System} that updates entities of certain types.
 * Systems are scene specific
 *
 *
 *
 * Excalibur Systems currently require at least 1 Component type to operated
 *
 * Multiple types are declared as a type union
 * For example:
 *
 * ```typescript
 * class MySystem extends System {
 *   static priority = SystemPriority.Lowest;
 *   public readonly systemType = SystemType.Update;
 *   public query: Query<typeof TransformComponent>;
 *   constructor(public world: World) {
 *   super();
 *      this.query = this.world.query([TransformComponent]);
 *   }
 *   public update(elapsed: number) {
 *      ...
 *   }
 * }
 * ```
 */
declare abstract class System {
    /**
     * Determine whether the system is called in the {@apilink SystemType.Update} or the {@apilink SystemType.Draw} phase. Update is first, then Draw.
     */
    abstract readonly systemType: SystemType;
    /**
     * System can execute in priority order, by default all systems are priority 0. Lower values indicated higher priority.
     * For a system to execute before all other a lower priority value (-1 for example) must be set.
     * For a system to execute after all other a higher priority value (10 for example) must be set.
     */
    static priority: number;
    /**
     * Optionally specify an initialize handler
     * @param scene
     */
    initialize?(world: World, scene: Scene): void;
    /**
     * Update all entities that match this system's types
     * @param elapsed Time in milliseconds
     */
    abstract update(elapsed: number): void;
    /**
     * Optionally run a preupdate before the system processes matching entities
     * @param scene
     * @param elapsed Time in milliseconds since the last frame
     */
    preupdate?(scene: Scene, elapsed: number): void;
    /**
     * Optionally run a postupdate after the system processes matching entities
     * @param scene
     * @param elapsed Time in milliseconds since the last frame
     */
    postupdate?(scene: Scene, elapsed: number): void;
}

interface SystemCtor<T extends System> {
    new (...args: any[]): T;
}
/**
 *
 */
declare function isSystemConstructor(x: any): x is SystemCtor<System>;
/**
 * The SystemManager is responsible for keeping track of all systems in a scene.
 * Systems are scene specific
 */
declare class SystemManager {
    private _world;
    /**
     * List of systems, to add a new system call {@apilink SystemManager.addSystem}
     */
    systems: System[];
    initialized: boolean;
    constructor(_world: World);
    /**
     * Get a system registered in the manager by type
     * @param systemType
     */
    get<T extends System>(systemType: SystemCtor<T>): T | null;
    /**
     * Adds a system to the manager, it will now be updated every frame
     * @param systemOrCtor
     */
    addSystem(systemOrCtor: SystemCtor<System> | System): void;
    /**
     * Removes a system from the manager, it will no longer be updated
     * @param system
     */
    removeSystem(system: System): void;
    /**
     * Initialize all systems in the manager
     *
     * Systems added after initialize() will be initialized on add
     */
    initialize(): void;
    /**
     * Updates all systems
     * @param type whether this is an update or draw system
     * @param scene context reference
     * @param elapsed time in milliseconds
     */
    updateSystems(type: SystemType, scene: Scene, elapsed: number): void;
    clear(): void;
}

/**
 * The World is a self-contained entity component system for a particular context.
 */
declare class World {
    scene: Scene;
    private _logger;
    queryManager: QueryManager;
    entityManager: EntityManager;
    systemManager: SystemManager;
    /**
     * The context type is passed to the system updates
     * @param scene
     */
    constructor(scene: Scene);
    /**
     * Query the ECS world for entities that match your components
     */
    query<TKnownComponentCtors extends ComponentCtor<Component> = never, TAnyComponentCtors extends ComponentCtor<Component> = never>(params: TKnownComponentCtors[] | QueryParams<TKnownComponentCtors, TAnyComponentCtors>): Query<TKnownComponentCtors, TAnyComponentCtors>;
    queryTags<TKnownTags extends string>(requiredTags: TKnownTags[]): TagQuery<TKnownTags>;
    /**
     * Update systems by type and time elapsed in milliseconds
     */
    update(type: SystemType, elapsed: number): void;
    /**
     * Add an entity to the ECS world
     * @param entity
     */
    add(entity: Entity): void;
    /**
     * Add a system to the ECS world
     * @param system
     */
    add(system: System): void;
    add(system: SystemCtor<System>): void;
    /**
     * Get a system out of the ECS world
     */
    get(system: SystemCtor<System>): System;
    /**
     * Remove an entity from the ECS world
     * @param entity
     */
    remove(entity: Entity, deferred?: boolean): void;
    /**
     * Remove a system from the ECS world
     * @param system
     */
    remove(system: System): void;
    get entities(): Entity<any>[];
    clearEntities(): void;
    clearSystems(): void;
}

declare class EntityManager {
    private _world;
    entities: Entity[];
    _entityIndex: {
        [entityId: string]: Entity;
    };
    private _childAddedHandlerMap;
    private _childRemovedHandlerMap;
    constructor(_world: World);
    /**
     * Runs the entity lifecycle
     * @param scene
     * @param elapsed
     */
    updateEntities(scene: Scene, elapsed: number): void;
    findEntitiesForRemoval(): void;
    private _createChildAddedHandler;
    private _createChildRemovedHandler;
    /**
     * Adds an entity to be tracked by the EntityManager
     * @param entity
     */
    addEntity(entity: Entity): void;
    removeEntity(entity: Entity, deferred?: boolean): void;
    removeEntity(id: number, deferred?: boolean): void;
    private _entitiesToRemove;
    processEntityRemovals(): void;
    processComponentRemovals(): void;
    getById(id: number): Entity | undefined;
    getByName(name: string): Entity[];
    clear(): void;
}

/**
 * Higher priorities run earlier than others in the system update
 */
declare const SystemPriority: {
    readonly Highest: number;
    readonly Higher: -5;
    readonly Average: 0;
    readonly Lower: 5;
    readonly Lowest: number;
};

interface BodyComponentOptions {
    type?: CollisionType;
    group?: CollisionGroup;
    useGravity?: boolean;
    config?: Pick<PhysicsConfig, 'bodies'>['bodies'];
}
declare enum DegreeOfFreedom {
    Rotation = "rotation",
    X = "x",
    Y = "y"
}
/**
 * Body describes all the physical properties pos, vel, acc, rotation, angular velocity for the purpose of
 * of physics simulation.
 */
declare class BodyComponent extends Component implements Clonable<BodyComponent> {
    dependencies: (typeof TransformComponent | typeof MotionComponent)[];
    static _ID: number;
    readonly id: Id<'body'>;
    events: EventEmitter<any>;
    oldTransform: Transform;
    /**
     * Indicates whether the old transform has been captured at least once for interpolation
     * @internal
     */
    __oldTransformCaptured: boolean;
    /**
     * Enable or disabled the fixed update interpolation, by default interpolation is on.
     */
    enableFixedUpdateInterpolate: boolean;
    private _bodyConfig;
    private static _DEFAULT_CONFIG;
    wakeThreshold: number;
    constructor(options?: BodyComponentOptions);
    get matrix(): AffineMatrix;
    /**
     * Called by excalibur to update physics config defaults if they change
     * @param config
     */
    updatePhysicsConfig(config: DeepRequired<Pick<PhysicsConfig, 'bodies'>['bodies']>): void;
    /**
     * Called by excalibur to update defaults
     * @param config
     */
    static updateDefaultPhysicsConfig(config: DeepRequired<Pick<PhysicsConfig, 'bodies'>['bodies']>): void;
    /**
     * Collision type for the rigidbody physics simulation, by default {@apilink CollisionType.PreventCollision}
     */
    collisionType: CollisionType;
    /**
     * The collision group for the body's colliders, by default body colliders collide with everything
     */
    group: CollisionGroup;
    /**
     * The amount of mass the body has
     */
    private _mass;
    get mass(): number;
    set mass(newMass: number);
    /**
     * The inverse mass (1/mass) of the body. If {@apilink CollisionType.Fixed} this is 0, meaning "infinite" mass
     */
    get inverseMass(): number;
    /**
     * Amount of "motion" the body has before sleeping. If below {@apilink Physics.sleepEpsilon} it goes to "sleep"
     */
    sleepMotion: number;
    /**
     * Can this body sleep, by default bodies do not sleep
     */
    canSleep: boolean;
    private _sleeping;
    /**
     * Whether this body is sleeping or not
     * @deprecated use isSleeping
     */
    get sleeping(): boolean;
    /**
     * Whether this body is sleeping or not
     */
    get isSleeping(): boolean;
    /**
     * Set the sleep state of the body
     * @param sleeping
     * @deprecated use isSleeping
     */
    setSleeping(sleeping: boolean): void;
    set isSleeping(sleeping: boolean);
    /**
     * Update body's {@apilink BodyComponent.sleepMotion} for the purpose of sleeping
     */
    updateMotion(): void;
    private _cachedInertia;
    /**
     * Get the moment of inertia from the {@apilink ColliderComponent}
     */
    get inertia(): number;
    private _cachedInverseInertia;
    /**
     * Get the inverse moment of inertial from the {@apilink ColliderComponent}. If {@apilink CollisionType.Fixed} this is 0, meaning "infinite" mass
     */
    get inverseInertia(): number;
    /**
     * The also known as coefficient of restitution of this actor, represents the amount of energy preserved after collision or the
     * bounciness. If 1, it is 100% bouncy, 0 it completely absorbs.
     */
    bounciness: number;
    /**
     * The coefficient of friction on this actor.
     *
     * The {@apilink SolverStrategy.Arcade} does not support this property.
     *
     */
    friction: number;
    /**
     * Should use global gravity {@apilink Physics.gravity} in it's physics simulation, default is true
     */
    useGravity: boolean;
    /**
     * Degrees of freedom to limit
     *
     * Note: this only limits responses in the realistic solver, if velocity/angularVelocity is set the actor will still respond
     */
    limitDegreeOfFreedom: DegreeOfFreedom[];
    /**
     * Returns if the owner is active
     * @deprecated use isActive
     */
    get active(): boolean;
    /**
     * Returns if the owner is active
     */
    get isActive(): boolean;
    /**
     * @deprecated Use globalPos
     */
    get center(): Vector;
    transform: TransformComponent;
    motion: MotionComponent;
    onAdd(owner: Entity<any>): void;
    get pos(): Vector;
    set pos(val: Vector);
    /**
     * The (x, y) position of the actor this will be in the middle of the actor if the
     * {@apilink Actor.anchor} is set to (0.5, 0.5) which is default.
     * If you want the (x, y) position to be the top left of the actor specify an anchor of (0, 0).
     */
    get globalPos(): Vector;
    set globalPos(val: Vector);
    private _oldGlobalPos;
    /**
     * The position of the actor last frame (x, y) in pixels
     */
    get oldPos(): Vector;
    /**
     * The global position of the actor last frame (x, y) in pixels
     */
    get oldGlobalPos(): Vector;
    /**
     * The current velocity vector (vx, vy) of the actor in pixels/second
     */
    get vel(): Vector;
    set vel(val: Vector);
    /**
     * The velocity of the actor last frame (vx, vy) in pixels/second
     */
    oldVel: Vector;
    /**
     * The current acceleration vector (ax, ay) of the actor in pixels/second/second. An acceleration pointing down such as (0, 100) may
     * be useful to simulate a gravitational effect.
     */
    get acc(): Vector;
    set acc(val: Vector);
    /**
     * Gets/sets the acceleration of the actor from the last frame. This does not include the global acc {@apilink Physics.acc}.
     */
    oldAcc: Vector;
    /**
     * The current torque applied to the actor
     */
    get torque(): number;
    set torque(val: number);
    /**
     * Gets/sets the rotation of the body from the last frame.
     */
    get oldRotation(): number;
    /**
     * The rotation of the body in radians
     */
    get rotation(): number;
    set rotation(val: number);
    /**
     * The scale vector of the actor
     */
    get scale(): Vector;
    set scale(val: Vector);
    /**
     * The scale of the actor last frame
     */
    get oldScale(): Vector;
    /**
     * The scale rate of change of the actor in scale/second
     */
    get scaleFactor(): Vector;
    set scaleFactor(scaleFactor: Vector);
    /**
     * Get the angular velocity in radians/second
     */
    get angularVelocity(): number;
    /**
     * Set the angular velocity in radians/second
     */
    set angularVelocity(value: number);
    private _impulseScratch;
    private _distanceFromCenterScratch;
    /**
     * Apply a specific impulse to the body
     * @param point
     * @param impulse
     */
    applyImpulse(point: Vector, impulse: Vector): void;
    /**
     * Apply only linear impulse to the body
     * @param impulse
     */
    applyLinearImpulse(impulse: Vector): void;
    /**
     * Apply only angular impulse to the body
     * @param point
     * @param impulse
     */
    applyAngularImpulse(point: Vector, impulse: Vector): void;
    /**
     * Sets the old versions of pos, vel, acc, and scale.
     */
    captureOldTransform(): void;
    clone(): BodyComponent;
}

interface Eventable {
    /**
     * Emits an event for target
     * @param eventName  The name of the event to publish
     * @param event      Optionally pass an event data object to the handler
     */
    emit(eventName: string, event: any): void;
    /**
     * Subscribe an event handler to a particular event name, multiple handlers per event name are allowed.
     * @param eventName  The name of the event to subscribe to
     * @param handler    The handler callback to fire on this event
     */
    on(eventName: string, handler: Handler<any>): void;
    /**
     * Unsubscribe an event handler(s) from an event. If a specific handler
     * is specified for an event, only that handler will be unsubscribed.
     * Otherwise all handlers will be unsubscribed for that event.
     * @param eventName  The name of the event to unsubscribe
     * @param handler    Optionally the specific handler to unsubscribe
     */
    off(eventName: string, handler?: Handler<any>): void;
    /**
     * Once listens to an event once then auto unsubscribes from that event
     * @param eventName The name of the event to subscribe to once
     * @param handler   The handler of the event that will be auto unsubscribed
     */
    once(eventName: string, handler: Handler<any>): void;
}

declare class GlobalCoordinates {
    worldPos: Vector;
    pagePos: Vector;
    screenPos: Vector;
    static fromPagePosition(x: number, y: number, engine: Engine): GlobalCoordinates;
    static fromPagePosition(pos: Vector, engine: Engine): GlobalCoordinates;
    constructor(worldPos: Vector, pagePos: Vector, screenPos: Vector);
}

/**
 * The mouse button being pressed.
 */
declare enum PointerButton {
    Left = "Left",
    Middle = "Middle",
    Right = "Right",
    Unknown = "Unknown",
    NoButton = "NoButton"
}

/**
 * The type of pointer for a {@apilink PointerEvent}.
 */
declare enum PointerType {
    Touch = "Touch",
    Mouse = "Mouse",
    Pen = "Pen",
    Unknown = "Unknown"
}

declare class PointerEvent {
    type: 'down' | 'up' | 'move' | 'cancel';
    pointerId: number;
    button: PointerButton;
    pointerType: PointerType;
    coordinates: GlobalCoordinates;
    nativeEvent: Event;
    active: boolean;
    cancel(): void;
    get pagePos(): Vector;
    get screenPos(): Vector;
    get worldPos(): Vector;
    constructor(type: 'down' | 'up' | 'move' | 'cancel', pointerId: number, button: PointerButton, pointerType: PointerType, coordinates: GlobalCoordinates, nativeEvent: Event);
}

declare enum WheelDeltaMode {
    Pixel = "Pixel",
    Line = "Line",
    Page = "Page"
}

declare class WheelEvent {
    x: number;
    y: number;
    pageX: number;
    pageY: number;
    screenX: number;
    screenY: number;
    index: number;
    deltaX: number;
    deltaY: number;
    deltaZ: number;
    deltaMode: WheelDeltaMode;
    ev: Event;
    active: boolean;
    cancel(): void;
    constructor(x: number, y: number, pageX: number, pageY: number, screenX: number, screenY: number, index: number, deltaX: number, deltaY: number, deltaZ: number, deltaMode: WheelDeltaMode, ev: Event);
}

interface PointerEvents$1 {
    on(eventName: pointerup, handler: (event: PointerEvent) => void): void;
    on(eventName: pointerdown, handler: (event: PointerEvent) => void): void;
    on(eventName: pointerenter, handler: (event: PointerEvent) => void): void;
    on(eventName: pointerleave, handler: (event: PointerEvent) => void): void;
    on(eventName: pointermove, handler: (event: PointerEvent) => void): void;
    on(eventName: pointercancel, handler: (event: PointerEvent) => void): void;
    on(eventName: pointerwheel, handler: (event: WheelEvent) => void): void;
    on(eventName: pointerdragstart, handler: (event: PointerEvent) => void): void;
    on(eventName: pointerdragend, handler: (event: PointerEvent) => void): void;
    on(eventName: pointerdragenter, handler: (event: PointerEvent) => void): void;
    on(eventName: pointerdragleave, handler: (event: PointerEvent) => void): void;
    on(eventName: pointerdragmove, handler: (event: PointerEvent) => void): void;
    once(eventName: pointerup, handler: (event: PointerEvent) => void): void;
    once(eventName: pointerdown, handler: (event: PointerEvent) => void): void;
    once(eventName: pointerenter, handler: (event: PointerEvent) => void): void;
    once(eventName: pointerleave, handler: (event: PointerEvent) => void): void;
    once(eventName: pointermove, handler: (event: PointerEvent) => void): void;
    once(eventName: pointercancel, handler: (event: PointerEvent) => void): void;
    once(eventName: pointerwheel, handler: (event: WheelEvent) => void): void;
    once(eventName: pointerdragstart, handler: (event: PointerEvent) => void): void;
    once(eventName: pointerdragend, handler: (event: PointerEvent) => void): void;
    once(eventName: pointerdragenter, handler: (event: PointerEvent) => void): void;
    once(eventName: pointerdragleave, handler: (event: PointerEvent) => void): void;
    once(eventName: pointerdragmove, handler: (event: PointerEvent) => void): void;
    off(eventName: pointerup, handler?: (event: PointerEvent) => void): void;
    off(eventName: pointerdown, handler?: (event: PointerEvent) => void): void;
    off(eventName: pointerenter, handler?: (event: PointerEvent) => void): void;
    off(eventName: pointerleave, handler?: (event: PointerEvent) => void): void;
    off(eventName: pointermove, handler?: (event: PointerEvent) => void): void;
    off(eventName: pointercancel, handler?: (event: PointerEvent) => void): void;
    off(eventName: pointerwheel, handler?: (event: WheelEvent) => void): void;
    off(eventName: pointerdragstart, handler?: (event: PointerEvent) => void): void;
    off(eventName: pointerdragend, handler?: (event: PointerEvent) => void): void;
    off(eventName: pointerdragenter, handler?: (event: PointerEvent) => void): void;
    off(eventName: pointerdragleave, handler?: (event: PointerEvent) => void): void;
    off(eventName: pointerdragmove, handler?: (event: PointerEvent) => void): void;
}

/**
 * A definition of an EasingFunction. See {@apilink EasingFunctions}.
 */
interface EasingFunction<TValueToEase = number> {
    (currentTime: number, startValue: TValueToEase, endValue: TValueToEase, duration: number): TValueToEase;
}
/**
 * Standard easing functions for motion in Excalibur, defined on a domain of [0, duration] and a range from [+startValue,+endValue]
 * Given a time, the function will return a value from positive startValue to positive endValue.
 *
 * ```js
 * function Linear (t) {
 *    return t * t;
 * }
 *
 * // accelerating from zero velocity
 * function EaseInQuad (t) {
 *    return t * t;
 * }
 *
 * // decelerating to zero velocity
 * function EaseOutQuad (t) {
 *    return t * (2 - t);
 * }
 *
 * // acceleration until halfway, then deceleration
 * function EaseInOutQuad (t) {
 *    return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
 * }
 *
 * // accelerating from zero velocity
 * function EaseInCubic (t) {
 *    return t * t * t;
 * }
 *
 * // decelerating to zero velocity
 * function EaseOutCubic (t) {
 *    return (--t) * t * t + 1;
 * }
 *
 * // acceleration until halfway, then deceleration
 * function EaseInOutCubic (t) {
 *    return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
 * }
 * ```
 */
declare class EasingFunctions {
    static CreateReversibleEasingFunction(easing: EasingFunction): EasingFunction;
    static CreateVectorEasingFunction(easing: EasingFunction<number>): EasingFunction<Vector>;
    static Linear: EasingFunction;
    static EaseInQuad: EasingFunction<number>;
    static EaseOutQuad: EasingFunction;
    static EaseInOutQuad: EasingFunction;
    static EaseInCubic: EasingFunction;
    static EaseOutCubic: EasingFunction;
    static EaseInOutCubic: EasingFunction;
}

/**
 * A 2D line segment
 */
declare class LineSegment {
    begin: Vector;
    end: Vector;
    /**
     * @param begin  The starting point of the line segment
     * @param end  The ending point of the line segment
     */
    constructor(begin: Vector, end: Vector);
    clone(dest?: LineSegment): LineSegment;
    transform(matrix: AffineMatrix, dest?: LineSegment): LineSegment;
    /**
     * Gets the raw slope (m) of the line. Will return (+/-)Infinity for vertical lines.
     */
    get slope(): number;
    /**
     * Gets the Y-intercept (b) of the line. Will return (+/-)Infinity if there is no intercept.
     */
    get intercept(): number;
    private _normal;
    /**
     * Gets the normal of the line
     */
    normal(): Vector;
    private _dir;
    dir(): Vector;
    getPoints(): Vector[];
    private _slope;
    /**
     * Returns the slope of the line in the form of a vector of length 1
     */
    getSlope(): Vector;
    /**
     * Returns the edge of the line as vector, the length of the vector is the length of the edge
     */
    getEdge(): Vector;
    /**
     * Returns the length of the line segment in pixels
     */
    getLength(): number;
    /**
     * Returns the midpoint of the edge
     */
    get midpoint(): Vector;
    /**
     * Flips the direction of the line segment
     */
    flip(): LineSegment;
    /**
     * Tests if a given point is below the line, points in the normal direction above the line are considered above.
     * @param point
     */
    below(point: Vector): boolean;
    /**
     * Returns the clip point
     * @param sideVector Vector that traces the line
     * @param length Length to clip along side
     */
    clip(sideVector: Vector, length: number, normalize?: boolean): LineSegment;
    /**
     * Find the perpendicular distance from the line to a point
     * https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
     * @param point
     */
    distanceToPoint(point: Vector, signed?: boolean): number;
    /**
     * Find the perpendicular line from the line to a point
     * https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
     * (a - p) - ((a - p) * n)n
     * a is a point on the line
     * p is the arbitrary point above the line
     * n is a unit vector in direction of the line
     * @param point
     */
    findVectorToPoint(point: Vector): Vector;
    /**
     * Finds a point on the line given only an X or a Y value. Given an X value, the function returns
     * a new point with the calculated Y value and vice-versa.
     * @param x The known X value of the target point
     * @param y The known Y value of the target point
     * @returns A new point with the other calculated axis value
     */
    findPoint(x?: number, y?: number): Vector;
    /**
     * Whether or not the given point lies on this line. This method is precise by default
     * meaning the point must lie exactly on the line. Adjust threshold to
     * loosen the strictness of the check for floating-point calculations.
     */
    hasPoint(x: number, y: number, threshold?: number): boolean;
    /**
     * Whether or not the given point lies on this line. This method is precise by default
     * meaning the point must lie exactly on the line. Adjust threshold to
     * loosen the strictness of the check for floating-point calculations.
     */
    hasPoint(v: Vector, threshold?: number): boolean;
}

/**
 * A 2D ray that can be cast into the scene to do collision detection
 */
declare class Ray {
    pos: Vector;
    dir: Vector;
    /**
     * @param pos The starting position for the ray
     * @param dir The vector indicating the direction of the ray
     */
    constructor(pos: Vector, dir: Vector);
    /**
     * Tests a whether this ray intersects with a line segment. Returns a number greater than or equal to 0 on success.
     * This number indicates the mathematical intersection time.
     * @param line  The line to test
     */
    intersect(line: LineSegment): number;
    intersectPoint(line: LineSegment): Vector;
    /**
     * Returns the point of intersection given the intersection time
     */
    getPoint(time: number): Vector;
}

/**
 * An enum that describes the sides of an axis aligned box for collision
 */
declare enum Side {
    None = "None",
    Top = "Top",
    Bottom = "Bottom",
    Left = "Left",
    Right = "Right"
}
declare namespace Side {
    /**
     * Returns the opposite side from the current
     */
    function getOpposite(side: Side): Side;
    /**
     * Given a vector, return the Side most in that direction
     */
    function fromDirection(direction: Vector): Side;
}

interface BoundingBoxOptions {
    left: number;
    right: number;
    top: number;
    bottom: number;
}
/**
 * Axis Aligned collision primitive for Excalibur.
 */
declare class BoundingBox {
    top: number;
    right: number;
    bottom: number;
    left: number;
    /**
     * Constructor allows passing of either an object with all coordinate components,
     * or the coordinate components passed separately.
     * @param leftOrOptions    Either x coordinate of the left edge or an options object
     * containing the four coordinate components.
     * @param top     y coordinate of the top edge
     * @param right   x coordinate of the right edge
     * @param bottom  y coordinate of the bottom edge
     */
    constructor(leftOrOptions?: number | BoundingBoxOptions, top?: number, right?: number, bottom?: number);
    /**
     * Returns a new instance of {@apilink BoundingBox} that is a copy of the current instance
     */
    clone(dest?: BoundingBox): BoundingBox;
    /**
     * Resets the bounds to a zero width/height box
     */
    reset(): void;
    /**
     * Given bounding box A & B, returns the side relative to A when intersection is performed.
     * @param intersection Intersection vector between 2 bounding boxes
     */
    static getSideFromIntersection(intersection: Vector): Side;
    static fromPoints(points: Vector[]): BoundingBox;
    /**
     * Creates a bounding box from a width and height
     * @param width
     * @param height
     * @param anchor Default Vector.Half
     * @param pos Default Vector.Zero
     */
    static fromDimension(width: number, height: number, anchor?: Vector, pos?: Vector): BoundingBox;
    /**
     * Returns the calculated width of the bounding box
     */
    get width(): number;
    /**
     * Returns the calculated height of the bounding box
     */
    get height(): number;
    /**
     * Return whether the bounding box has zero dimensions in height,width or both
     */
    hasZeroDimensions(): boolean;
    /**
     * Returns the center of the bounding box
     */
    get center(): Vector;
    get topLeft(): Vector;
    get bottomRight(): Vector;
    get topRight(): Vector;
    get bottomLeft(): Vector;
    translate(pos: Vector): BoundingBox;
    /**
     * Rotates a bounding box by and angle and around a point, if no point is specified (0, 0) is used by default. The resulting bounding
     * box is also axis-align. This is useful when a new axis-aligned bounding box is needed for rotated geometry.
     */
    rotate(angle: number, point?: Vector): BoundingBox;
    /**
     * Scale a bounding box by a scale factor, optionally provide a point
     * @param scale
     * @param point
     */
    scale(scale: Vector, point?: Vector): BoundingBox;
    /**
     * Transform the axis aligned bounding box by a {@apilink Matrix}, producing a new axis aligned bounding box
     * @param matrix
     */
    transform(matrix: AffineMatrix): BoundingBox;
    /**
     * Returns the perimeter of the bounding box
     */
    getPerimeter(): number;
    private _points;
    private _left?;
    private _right?;
    private _top?;
    private _bottom?;
    /**
     * Returns the world space points that make up the corners of the bounding box as a polygon
     */
    getPoints(): readonly Vector[];
    /**
     * Determines whether a ray intersects with a bounding box
     */
    rayCast(ray: Ray, farClipDistance?: number): boolean;
    /**
     * Returns the time along the ray where a raycast hits
     */
    rayCastTime(ray: Ray, farClipDistance?: number): number;
    /**
     * Tests whether a point is contained within the bounding box
     * @param p  The point to test
     */
    contains(p: Vector): boolean;
    /**
     * Tests whether another bounding box is totally contained in this one
     * @param bb  The bounding box to test
     */
    contains(bb: BoundingBox): boolean;
    /**
     * Combines this bounding box and another together returning a new bounding box
     * @param other  The bounding box to combine
     */
    combine(other: BoundingBox, dest?: BoundingBox): BoundingBox;
    get dimensions(): Vector;
    /**
     * Returns true if the bounding boxes overlap.
     * @param other
     * @param epsilon Optionally specify a small epsilon (default 0) as amount of overlap to ignore as overlap.
     * This epsilon is useful in stable collision simulations.
     */
    overlaps(other: BoundingBox, epsilon?: number): boolean;
    private static _SCRATCH_INTERSECT;
    /**
     * Test wether this bounding box intersects with another returning
     * the intersection vector that can be used to resolve the collision. If there
     * is no intersection null is returned.
     * @param other  Other {@apilink BoundingBox} to test intersection with
     * @returns A Vector in the direction of the current BoundingBox, this <- other
     */
    intersect(other: BoundingBox): Vector;
    /**
     * Test whether the bounding box has intersected with another bounding box, returns the side of the current bb that intersected.
     * @param bb The other actor to test
     */
    intersectWithSide(bb: BoundingBox): Side;
    /**
     * Draw a debug bounding box
     * @param ex
     * @param color
     */
    draw(ex: ExcaliburGraphicsContext, color?: Color): void;
}

/**
 * Interface that describes a custom camera strategy for tracking targets
 */
interface CameraStrategy<T> {
    /**
     * Target of the camera strategy that will be passed to the action
     */
    target: T;
    /**
     * Camera strategies perform an action to calculate a new focus returned out of the strategy
     * @param target The target object to apply this camera strategy (if any)
     * @param camera The current camera implementation in excalibur running the game
     * @param engine The current engine running the game
     * @param elapsed The elapsed time in milliseconds since the last frame
     */
    action: (target: T, camera: Camera, engine: Engine, elapsed: number) => Vector;
}
/**
 * Container to house convenience strategy methods
 * @internal
 */
declare class StrategyContainer {
    camera: Camera;
    constructor(camera: Camera);
    /**
     * Creates and adds the {@apilink LockCameraToActorStrategy} on the current camera.
     * @param actor The actor to lock the camera to
     */
    lockToActor(actor: Actor): void;
    /**
     * Creates and adds the {@apilink LockCameraToActorAxisStrategy} on the current camera
     * @param actor The actor to lock the camera to
     * @param axis The axis to follow the actor on
     */
    lockToActorAxis(actor: Actor, axis: Axis): void;
    /**
     * Creates and adds the {@apilink ElasticToActorStrategy} on the current camera
     * If cameraElasticity < cameraFriction < 1.0, the behavior will be a dampened spring that will slowly end at the target without bouncing
     * If cameraFriction < cameraElasticity < 1.0, the behavior will be an oscillating spring that will over
     * correct and bounce around the target
     * @param actor Target actor to elastically follow
     * @param cameraElasticity [0 - 1.0] The higher the elasticity the more force that will drive the camera towards the target
     * @param cameraFriction [0 - 1.0] The higher the friction the more that the camera will resist motion towards the target
     */
    elasticToActor(actor: Actor, cameraElasticity: number, cameraFriction: number): void;
    /**
     * Creates and adds the {@apilink RadiusAroundActorStrategy} on the current camera
     * @param actor Target actor to follow when it is "radius" pixels away
     * @param radius Number of pixels away before the camera will follow
     */
    radiusAroundActor(actor: Actor, radius: number): void;
    /**
     * Creates and adds the {@apilink LimitCameraBoundsStrategy} on the current camera
     * @param box The bounding box to limit the camera to.
     */
    limitCameraBounds(box: BoundingBox): void;
}
/**
 * Camera axis enum
 */
declare enum Axis {
    X = 0,
    Y = 1
}
/**
 * Lock a camera to the exact x/y position of an actor.
 */
declare class LockCameraToActorStrategy implements CameraStrategy<Actor> {
    target: Actor;
    constructor(target: Actor);
    action: (target: Actor, camera: Camera, engine: Engine, elapsed: number) => Vector;
}
/**
 * Lock a camera to a specific axis around an actor.
 */
declare class LockCameraToActorAxisStrategy implements CameraStrategy<Actor> {
    target: Actor;
    axis: Axis;
    constructor(target: Actor, axis: Axis);
    action: (target: Actor, cam: Camera, _eng: Engine, elapsed: number) => Vector;
}
/**
 * Using [Hook's law](https://en.wikipedia.org/wiki/Hooke's_law), elastically move the camera towards the target actor.
 */
declare class ElasticToActorStrategy implements CameraStrategy<Actor> {
    target: Actor;
    cameraElasticity: number;
    cameraFriction: number;
    /**
     * If cameraElasticity < cameraFriction < 1.0, the behavior will be a dampened spring that will slowly end at the target without bouncing
     * If cameraFriction < cameraElasticity < 1.0, the behavior will be an oscillating spring that will over
     * correct and bounce around the target
     * @param target Target actor to elastically follow
     * @param cameraElasticity [0 - 1.0] The higher the elasticity the more force that will drive the camera towards the target
     * @param cameraFriction [0 - 1.0] The higher the friction the more that the camera will resist motion towards the target
     */
    constructor(target: Actor, cameraElasticity: number, cameraFriction: number);
    action: (target: Actor, cam: Camera, _eng: Engine, elapsed: number) => Vector;
}
declare class RadiusAroundActorStrategy implements CameraStrategy<Actor> {
    target: Actor;
    radius: number;
    /**
     *
     * @param target Target actor to follow when it is "radius" pixels away
     * @param radius Number of pixels away before the camera will follow
     */
    constructor(target: Actor, radius: number);
    action: (target: Actor, cam: Camera, _eng: Engine, elapsed: number) => Vector;
}
/**
 * Prevent a camera from going beyond the given camera dimensions.
 */
declare class LimitCameraBoundsStrategy implements CameraStrategy<BoundingBox> {
    target: BoundingBox;
    /**
     * Useful for limiting the camera to a {@apilink TileMap}'s dimensions, or a specific area inside the map.
     *
     * Note that this strategy does not perform any movement by itself.
     * It only sets the camera position to within the given bounds when the camera has gone beyond them.
     * Thus, it is a good idea to combine it with other camera strategies and set this strategy as the last one.
     *
     * Make sure that the camera bounds are at least as large as the viewport size.
     * @param target The bounding box to limit the camera to
     */
    boundSizeChecked: boolean;
    constructor(target: BoundingBox);
    action: (target: BoundingBox, cam: Camera, _eng: Engine, elapsed: number) => Vector;
}
type CameraEvents = {
    preupdate: PreUpdateEvent<Camera>;
    postupdate: PostUpdateEvent<Camera>;
    initialize: InitializeEvent<Camera>;
};
declare const CameraEvents: {
    Initialize: string;
    PreUpdate: string;
    PostUpdate: string;
};
/**
 * Cameras
 *
 * {@apilink Camera} is the base class for all Excalibur cameras. Cameras are used
 * to move around your game and set focus. They are used to determine
 * what is "off screen" and can be used to scale the game.
 *
 */
declare class Camera implements CanUpdate, CanInitialize {
    events: EventEmitter<CameraEvents>;
    transform: AffineMatrix;
    inverse: AffineMatrix;
    protected _follow: Actor;
    private _cameraStrategies;
    get strategies(): CameraStrategy<any>[];
    strategy: StrategyContainer;
    /**
     * Get or set current zoom of the camera, defaults to 1
     */
    private _z;
    get zoom(): number;
    set zoom(val: number);
    /**
     * Get or set rate of change in zoom, defaults to 0
     */
    dz: number;
    /**
     * Get or set zoom acceleration
     */
    az: number;
    /**
     * Current rotation of the camera
     */
    rotation: number;
    private _angularVelocity;
    /**
     * Get or set the camera's angular velocity
     */
    get angularVelocity(): number;
    set angularVelocity(value: number);
    private _posChanged;
    private _pos;
    /**
     * Get or set the camera's position
     */
    get pos(): Vector;
    set pos(vec: Vector);
    /**
     * Has the position changed since the last update
     */
    hasChanged(): boolean;
    /**
     * Interpolated camera position if more draws are running than updates
     *
     * Enabled when `Engine.fixedUpdateFps` is enabled, in all other cases this will be the same as pos
     */
    drawPos: Vector;
    private _oldPos;
    /**
     * Get or set the camera's velocity
     */
    vel: Vector;
    /**
     * Get or set the camera's acceleration
     */
    acc: Vector;
    private _cameraMoving;
    private _currentLerpTime;
    private _lerpDuration;
    private _lerpStart;
    private _lerpEnd;
    private _lerpResolve;
    private _lerpPromise;
    protected _isShaking: boolean;
    private _shakeMagnitudeX;
    private _shakeMagnitudeY;
    private _shakeDuration;
    private _elapsedShakeTime;
    private _xShake;
    private _yShake;
    protected _isZooming: boolean;
    private _zoomStart;
    private _zoomEnd;
    private _currentZoomTime;
    private _zoomDuration;
    private _zoomResolve;
    private _zoomPromise;
    private _zoomEasing;
    private _easing;
    private _halfWidth;
    private _halfHeight;
    /**
     * Get the camera's x position
     */
    get x(): number;
    /**
     * Set the camera's x position (cannot be set when following an {@apilink Actor} or when moving)
     */
    set x(value: number);
    /**
     * Get the camera's y position
     */
    get y(): number;
    /**
     * Set the camera's y position (cannot be set when following an {@apilink Actor} or when moving)
     */
    set y(value: number);
    /**
     * Get or set the camera's x velocity
     */
    get dx(): number;
    set dx(value: number);
    /**
     * Get or set the camera's y velocity
     */
    get dy(): number;
    set dy(value: number);
    /**
     * Get or set the camera's x acceleration
     */
    get ax(): number;
    set ax(value: number);
    /**
     * Get or set the camera's y acceleration
     */
    get ay(): number;
    set ay(value: number);
    /**
     * Returns the focal point of the camera, a new point giving the x and y position of the camera
     */
    getFocus(): Vector;
    /**
     * This moves the camera focal point to the specified position using specified easing function. Cannot move when following an Actor.
     * @param pos The target position to move to
     * @param duration The duration in milliseconds the move should last
     * @param [easingFn] An optional easing function ({@apilink EasingFunctions.EaseInOutCubic} by default)
     * @returns A {@apilink Promise} that resolves when movement is finished, including if it's interrupted.
     *          The {@apilink Promise} value is the {@apilink Vector} of the target position. It will be rejected if a move cannot be made.
     */
    move(pos: Vector, duration: number, easingFn?: EasingFunction): Promise<Vector>;
    /**
     * Sets the camera to shake at the specified magnitudes for the specified duration
     * @param magnitudeX  The x magnitude of the shake
     * @param magnitudeY  The y magnitude of the shake
     * @param duration    The duration of the shake in milliseconds
     */
    shake(magnitudeX: number, magnitudeY: number, duration: number): void;
    /**
     * Zooms the camera in or out by the specified scale over the specified duration.
     * If no duration is specified, it take effect immediately.
     * @param scale    The scale of the zoom
     * @param duration The duration of the zoom in milliseconds
     */
    zoomOverTime(scale: number, duration?: number, easingFn?: EasingFunction): Promise<boolean>;
    private _viewport;
    /**
     * Gets the bounding box of the viewport of this camera in world coordinates
     */
    get viewport(): BoundingBox;
    /**
     * Adds one or more new camera strategies to this camera
     * @param cameraStrategy Instance of an {@apilink CameraStrategy}
     */
    addStrategy<T extends CameraStrategy<any>[]>(...cameraStrategies: T): void;
    /**
     * Sets the strategies of this camera, replacing all existing strategies
     * @param cameraStrategies Array of {@apilink CameraStrategy}
     */
    setStrategies<T extends CameraStrategy<any>[]>(cameraStrategies: T): void;
    /**
     * Removes a camera strategy by reference
     * @param cameraStrategy Instance of an {@apilink CameraStrategy}
     */
    removeStrategy<T>(cameraStrategy: CameraStrategy<T>): void;
    /**
     * Clears all camera strategies from the camera
     */
    clearAllStrategies(): void;
    /**
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * Internal _preupdate handler for {@apilink onPreUpdate} lifecycle event
     * @param engine The reference to the current game engine
     * @param elapsed  The time elapsed since the last update in milliseconds
     * @internal
     */
    _preupdate(engine: Engine, elapsed: number): void;
    /**
     * Safe to override onPreUpdate lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
     *
     * `onPreUpdate` is called directly before a scene is updated.
     * @param engine The reference to the current game engine
     * @param elapsed  The time elapsed since the last update in milliseconds
     */
    onPreUpdate(engine: Engine, elapsed: number): void;
    /**
     *  It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * Internal _preupdate handler for {@apilink onPostUpdate} lifecycle event
     * @param engine The reference to the current game engine
     * @param elapsed  The time elapsed since the last update in milliseconds
     * @internal
     */
    _postupdate(engine: Engine, elapsed: number): void;
    /**
     * Safe to override onPostUpdate lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
     *
     * `onPostUpdate` is called directly after a scene is updated.
     * @param engine The reference to the current game engine
     * @param elapsed  The time elapsed since the last update in milliseconds
     */
    onPostUpdate(engine: Engine, elapsed: number): void;
    private _engine;
    private _screen;
    private _isInitialized;
    get isInitialized(): boolean;
    _initialize(engine: Engine): void;
    /**
     * Safe to override onPostUpdate lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
     *
     * `onPostUpdate` is called directly after a scene is updated.
     */
    onInitialize(engine: Engine): void;
    emit<TEventName extends EventKey<CameraEvents>>(eventName: TEventName, event: CameraEvents[TEventName]): void;
    emit(eventName: string, event?: any): void;
    on<TEventName extends EventKey<CameraEvents>>(eventName: TEventName, handler: Handler<CameraEvents[TEventName]>): Subscription;
    on(eventName: string, handler: Handler<unknown>): Subscription;
    once<TEventName extends EventKey<CameraEvents>>(eventName: TEventName, handler: Handler<CameraEvents[TEventName]>): Subscription;
    once(eventName: string, handler: Handler<unknown>): Subscription;
    off<TEventName extends EventKey<CameraEvents>>(eventName: TEventName, handler: Handler<CameraEvents[TEventName]>): void;
    off(eventName: string, handler: Handler<unknown>): void;
    off(eventName: string): void;
    runStrategies(engine: Engine, elapsed: number): void;
    updateViewport(): void;
    update(engine: Engine, elapsed: number): void;
    private _snapPos;
    /**
     * Applies the relevant transformations to the game canvas to "move" or apply effects to the Camera
     * @param ctx Canvas context to apply transformations
     */
    draw(ctx: ExcaliburGraphicsContext): void;
    updateTransform(pos: Vector): void;
    private _isDoneShaking;
}

interface NativeEventable {
    addEventListener(name: string, handler: (...any: any[]) => any): any;
    removeEventListener(name: string, handler: (...any: any[]) => any): any;
}
declare class BrowserComponent<T extends NativeEventable> {
    nativeComponent: T;
    private _paused;
    private _nativeHandlers;
    on(eventName: string, handler: (evt: any) => void): void;
    off(eventName: string, handler?: (event: any) => void): void;
    private _decorate;
    pause(): void;
    resume(): void;
    clear(): void;
    constructor(nativeComponent: T);
}
declare class BrowserEvents {
    private _windowGlobal;
    private _documentGlobal;
    private _windowComponent;
    private _documentComponent;
    constructor(_windowGlobal: Window, _documentGlobal: Document);
    get window(): BrowserComponent<Window>;
    get document(): BrowserComponent<Document>;
    pause(): void;
    resume(): void;
    clear(): void;
}

/**
 * A 1 dimensional projection on an axis, used to test overlaps
 */
declare class Projection {
    min: number;
    max: number;
    constructor(min: number, max: number);
    overlaps(projection: Projection): boolean;
    getOverlap(projection: Projection): number;
}

interface RayCastHit {
    /**
     * The distance along the ray cast in pixels that a hit was detected
     */
    distance: number;
    /**
     * Reference to the collider that was hit
     */
    collider: Collider;
    /**
     * Reference to the body that was hit
     */
    body: BodyComponent;
    /**
     * World space point of the hit
     */
    point: Vector;
    /**
     * Normal vector of hit collider
     */
    normal: Vector;
}

declare class CompositeCollider extends Collider {
    private _transform;
    private _collisionProcessor;
    private _dynamicAABBTree;
    private _colliders;
    private _compositeStrategy?;
    /**
     * Treat composite collider's member colliders as either separate colliders for the purposes of onCollisionStart/onCollision
     * or as a single collider together.
     *
     * This property can be overridden on individual {@apilink CompositeColliders}.
     *
     * For composites without gaps or small groups of colliders, you probably want 'together'
     *
     * For composites with deliberate gaps, like a platforming level layout, you probably want 'separate'
     *
     * Default is 'together' if unset
     */
    set compositeStrategy(value: 'separate' | 'together');
    get compositeStrategy(): "separate" | "together";
    constructor(colliders: Collider[]);
    clearColliders(): void;
    addCollider(collider: Collider): void;
    removeCollider(collider: Collider): void;
    getColliders(): Collider[];
    get worldPos(): Vector;
    get center(): Vector;
    get bounds(): BoundingBox;
    get localBounds(): BoundingBox;
    get axes(): Vector[];
    getFurthestPoint(direction: Vector): Vector;
    getInertia(mass: number): number;
    collide(other: Collider): CollisionContact[];
    getClosestLineBetween(other: Collider): LineSegment;
    contains(point: Vector): boolean;
    rayCast(ray: Ray, max?: number): RayCastHit | null;
    project(axis: Vector): Projection;
    update(transform: Transform): void;
    debug(ex: ExcaliburGraphicsContext, color: Color, options?: {
        lineWidth: number;
        pointSize: number;
    }): void;
    clone(): Collider;
}

/**
 * A collision collider specifies the geometry that can detect when other collision colliders intersect
 * for the purposes of colliding 2 objects in excalibur.
 */
declare abstract class Collider implements Clonable<Collider> {
    private static _ID;
    readonly id: Id<'collider'>;
    /**
     * Composite collider if any this collider is attached to
     *
     * **WARNING** do not tamper with this property
     */
    composite: CompositeCollider | null;
    events: EventEmitter<any>;
    /**
     * Returns a boolean indicating whether this body collided with
     * or was in stationary contact with
     * the body of the other {@apilink Collider}
     */
    touching(other: Collider): boolean;
    owner: Entity;
    /**
     * Pixel offset of the collision collider relative to the collider, by default (0, 0) meaning the collider is positioned
     * on top of the collider.
     */
    offset: Vector;
    /**
     * Position of the collision collider in world coordinates
     */
    abstract get worldPos(): Vector;
    /**
     * The center point of the collision collider, for example if the collider is a circle it would be the center.
     */
    abstract get center(): Vector;
    /**
     * Return the axis-aligned bounding box of the collision collider in world coordinates
     */
    abstract get bounds(): BoundingBox;
    /**
     * Return the axis-aligned bounding box of the collision collider in local coordinates
     */
    abstract get localBounds(): BoundingBox;
    /**
     * Return the axes of this particular collider
     */
    abstract get axes(): Vector[];
    /**
     * Find the furthest point on the convex hull of this particular collider in a certain direction.
     */
    abstract getFurthestPoint(direction: Vector): Vector;
    abstract getInertia(mass: number): number;
    abstract collide(collider: Collider): CollisionContact[];
    /**
     * Returns the closest line between the surfaces this collider and another
     * @param collider
     */
    abstract getClosestLineBetween(collider: Collider): LineSegment;
    /**
     * Return wether the collider contains a point inclusive to it's border
     */
    abstract contains(point: Vector): boolean;
    /**
     * Return the point on the border of the collision collider that intersects with a ray (if any).
     */
    abstract rayCast(ray: Ray, max?: number): RayCastHit | null;
    /**
     * Create a projection of this collider along an axis. Think of this as casting a "shadow" along an axis
     */
    abstract project(axis: Vector): Projection;
    /**
     * Updates collider world space geometry
     */
    abstract update(transform: Transform): void;
    abstract debug(ex: ExcaliburGraphicsContext, color: Color, options?: {
        lineWidth: number;
        pointSize: number;
    }): void;
    abstract clone(): Collider;
}

interface CircleColliderOptions {
    /**
     * Optional pixel offset to shift the circle relative to the collider, by default (0, 0).
     */
    offset?: Vector;
    /**
     * Required radius of the circle
     */
    radius: number;
}
/**
 * This is a circle collider for the excalibur rigid body physics simulation
 */
declare class CircleCollider extends Collider {
    /**
     * Position of the circle relative to the collider, by default (0, 0).
     */
    offset: Vector;
    private _globalMatrix;
    get worldPos(): Vector;
    private _naturalRadius;
    private _radius;
    /**
     * Get the radius of the circle
     */
    get radius(): number;
    /**
     * Set the radius of the circle
     */
    set radius(val: number);
    private _transform;
    constructor(options: CircleColliderOptions);
    /**
     * Returns a clone of this shape, not associated with any collider
     */
    clone(): CircleCollider;
    /**
     * Get the center of the collider in world coordinates
     */
    get center(): Vector;
    /**
     * Tests if a point is contained in this collider
     */
    contains(point: Vector): boolean;
    /**
     * Casts a ray at the Circle collider and returns the nearest point of collision
     * @param ray
     */
    rayCast(ray: Ray, max?: number): RayCastHit | null;
    getClosestLineBetween(shape: Collider): LineSegment;
    /**
     * @inheritdoc
     */
    collide(collider: Collider): CollisionContact[];
    /**
     * Find the point on the collider furthest in the direction specified
     */
    getFurthestPoint(direction: Vector): Vector;
    /**
     * Find the local point on the shape in the direction specified
     * @param direction
     */
    getFurthestLocalPoint(direction: Vector): Vector;
    /**
     * Get the axis aligned bounding box for the circle collider in world coordinates
     */
    get bounds(): BoundingBox;
    private _localBoundsDirty;
    private _localBounds;
    /**
     * Get the axis aligned bounding box for the circle collider in local coordinates
     */
    get localBounds(): BoundingBox;
    /**
     * Get axis not implemented on circles, since there are infinite axis in a circle
     */
    get axes(): Vector[];
    /**
     * Returns the moment of inertia of a circle given it's mass
     * https://en.wikipedia.org/wiki/List_of_moments_of_inertia
     */
    getInertia(mass: number): number;
    update(transform: Transform): void;
    /**
     * Project the circle along a specified axis
     */
    project(axis: Vector): Projection;
    debug(ex: ExcaliburGraphicsContext, color: Color, options?: {
        lineWidth: number;
    }): void;
}

interface PolygonColliderOptions {
    /**
     * Pixel offset relative to a collider's body transform position.
     */
    offset?: Vector;
    /**
     * Points in the polygon in order around the perimeter in local coordinates. These are relative from the body transform position.
     * **Must be at least 3 points**
     */
    points: Vector[];
    /**
     * Suppresses convexity warning
     */
    suppressConvexWarning?: boolean;
}
/**
 * Polygon collider for detecting collisions
 */
declare class PolygonCollider extends Collider {
    private _logger;
    /**
     * Pixel offset relative to a collider's body transform position.
     */
    offset: Vector;
    flagDirty(): void;
    private _points;
    private _normals;
    get normals(): readonly Vector[];
    /**
     * Points in the polygon in order around the perimeter in local coordinates. These are relative from the body transform position.
     * Excalibur stores these in counter-clockwise order
     */
    set points(points: Vector[]);
    private _calculateNormals;
    /**
     * Points in the polygon in order around the perimeter in local coordinates. These are relative from the body transform position.
     * Excalibur stores these in counter-clockwise order
     */
    get points(): Vector[];
    private _transform;
    get transform(): Transform;
    private _transformedPoints;
    private _sides;
    private _localSides;
    constructor(options: PolygonColliderOptions);
    private _checkAndUpdateWinding;
    _isCounterClockwiseWinding(points: Vector[]): boolean;
    /**
     * Returns if the polygon collider is convex, Excalibur does not handle non-convex collision shapes.
     * Call {@apilink Polygon.triangulate} to generate a {@apilink CompositeCollider} from this non-convex shape
     */
    isConvex(): boolean;
    /**
     * Tessellates the polygon into a triangle fan as a {@apilink CompositeCollider} of triangle polygons
     */
    tessellate(): CompositeCollider;
    /**
     * Triangulate the polygon collider using the "Ear Clipping" algorithm.
     * Returns a new {@apilink CompositeCollider} made up of smaller triangles.
     */
    triangulate(): CompositeCollider;
    /**
     * Returns a clone of this ConvexPolygon, not associated with any collider
     */
    clone(): PolygonCollider;
    /**
     * Returns the world position of the collider, which is the current body transform plus any defined offset
     */
    get worldPos(): Vector;
    /**
     * Get the center of the collider in world coordinates
     */
    get center(): Vector;
    private _transformedPointsDirty;
    /**
     * Calculates the underlying transformation from the body relative space to world space
     */
    private _calculateTransformation;
    /**
     * Gets the points that make up the polygon in world space, from actor relative space (if specified)
     */
    getTransformedPoints(): Vector[];
    private _sidesDirty;
    /**
     * Gets the sides of the polygon in world space
     */
    getSides(): LineSegment[];
    private _localSidesDirty;
    /**
     * Returns the local coordinate space sides
     */
    getLocalSides(): LineSegment[];
    /**
     * Given a direction vector find the world space side that is most in that direction
     * @param direction
     */
    findSide(direction: Vector): LineSegment;
    /**
     * Given a direction vector find the local space side that is most in that direction
     * @param direction
     */
    findLocalSide(direction: Vector): LineSegment;
    /**
     * Get the axis associated with the convex polygon
     */
    get axes(): Vector[];
    /**
     * Updates the transform for the collision geometry
     *
     * Collision geometry (points/bounds) will not change until this is called.
     * @param transform
     */
    update(transform: Transform): void;
    /**
     * Tests if a point is contained in this collider in world space
     */
    contains(point: Vector): boolean;
    getClosestLineBetween(collider: Collider): LineSegment;
    /**
     * Returns a collision contact if the 2 colliders collide, otherwise collide will
     * return null.
     * @param collider
     */
    collide(collider: Collider): CollisionContact[];
    /**
     * Find the point on the collider furthest in the direction specified
     */
    getFurthestPoint(direction: Vector): Vector;
    /**
     * Find the local point on the collider furthest in the direction specified
     * @param direction
     */
    getFurthestLocalPoint(direction: Vector): Vector;
    /**
     * Finds the closes face to the point using perpendicular distance
     * @param point point to test against polygon
     */
    getClosestFace(point: Vector): {
        distance: Vector;
        face: LineSegment;
    };
    /**
     * Get the axis aligned bounding box for the polygon collider in world coordinates
     */
    get bounds(): BoundingBox;
    private _localBoundsDirty;
    private _localBounds;
    /**
     * Get the axis aligned bounding box for the polygon collider in local coordinates
     */
    get localBounds(): BoundingBox;
    private _cachedMass;
    private _cachedInertia;
    /**
     * Get the moment of inertia for an arbitrary polygon
     * https://en.wikipedia.org/wiki/List_of_moments_of_inertia
     */
    getInertia(mass: number): number;
    /**
     * Casts a ray into the polygon and returns a vector representing the point of contact (in world space) or null if no collision.
     */
    rayCast(ray: Ray, max?: number): RayCastHit | null;
    /**
     * Project the edges of the polygon along a specified axis
     */
    project(axis: Vector): Projection;
    debug(ex: ExcaliburGraphicsContext, color: Color, options?: {
        lineWidth: number;
        pointSize: number;
    }): void;
}

declare class Pool<Type> {
    builder: () => Type;
    recycler?: (instance: Type) => Type;
    maxObjects: number;
    totalAllocations: number;
    index: number;
    objects: Type[];
    disableWarnings: boolean;
    private _logger;
    constructor(builder: () => Type, recycler?: (instance: Type) => Type, maxObjects?: number);
    dispose(): void;
    preallocate(): void;
    /**
     * Use many instances out of the in the context and return all to the pool.
     *
     * By returning values out of the context they will be un-hooked from the pool and are free to be passed to consumers
     * @param context
     */
    using(context: (pool: Pool<Type>) => Type[] | void): Type[];
    /**
     * Use a single instance out of th pool and immediately return it to the pool
     * @param context
     */
    borrow(context: (object: Type) => void): void;
    /**
     * Retrieve a value from the pool, will allocate a new instance if necessary or recycle from the pool
     */
    get(): Type;
    /**
     * Signals we are done with the pool objects for now, Reclaims all objects in the pool.
     *
     * If a list of pooled objects is passed to done they are un-hooked from the pool and are free
     * to be passed to consumers
     * @param objects A list of object to separate from the pool
     */
    done(...objects: Type[]): Type[];
    done(): void;
}

/**
 * Specific information about a contact and it's separation
 */
declare class SeparationInfo {
    /**
     * Collider A
     */
    collider: Collider;
    /**
     * Signed value (negative means overlap, positive no overlap)
     */
    separation: number;
    /**
     * Axis of separation from the collider's perspective
     */
    axis: Vector;
    /**
     * Local axis of separation from the collider's perspective
     */
    localAxis?: Vector;
    /**
     * Side of separation (reference) from the collider's perspective
     */
    side?: LineSegment;
    /**
     * Local side of separation (reference) from the collider's perspective
     */
    localSide?: LineSegment;
    /**
     * Index of the separation side (reference) from the collider's perspective
     */
    sideId?: number;
    /**
     * Point on collider B (incident point)
     */
    point: Vector;
    /**
     * Local point on collider B (incident point)
     */
    localPoint?: Vector;
}
declare class SeparatingAxis {
    static SeparationPool: Pool<SeparationInfo>;
    private static _ZERO;
    private static _SCRATCH_POINT;
    private static _SCRATCH_SUB_POINT;
    private static _SCRATCH_NORMAL;
    private static _SCRATCH_MATRIX;
    static findPolygonPolygonSeparation(polyA: PolygonCollider, polyB: PolygonCollider): SeparationInfo;
    static findCirclePolygonSeparation(circle: CircleCollider, polygon: PolygonCollider): Vector | null;
    static findPolygonPolygonSeparationDegenerate(polyA: PolygonCollider, polyB: PolygonCollider): SeparationInfo;
}

/**
 * Collision contacts are used internally by Excalibur to resolve collision between colliders. This
 * Pair prevents collisions from being evaluated more than one time
 */
declare class CollisionContact {
    private _canceled;
    /**
     * Currently the ids between colliders
     */
    readonly id: string;
    /**
     * The first collider in the collision
     */
    colliderA: Collider;
    /**
     * The second collider in the collision
     */
    colliderB: Collider;
    /**
     * The minimum translation vector to resolve overlap, pointing away from colliderA
     */
    mtv: Vector;
    /**
     * World space contact points between colliderA and colliderB
     */
    points: Vector[];
    /**
     * Local space contact points between colliderA and colliderB
     */
    localPoints: Vector[];
    /**
     * The collision normal, pointing away from colliderA
     */
    normal: Vector;
    /**
     * The collision tangent
     */
    tangent: Vector;
    /**
     * Information about the specifics of the collision contact separation
     */
    info: SeparationInfo;
    bodyA: BodyComponent | null;
    bodyB: BodyComponent | null;
    constructor(colliderA: Collider, colliderB: Collider, mtv: Vector, normal: Vector, tangent: Vector, points: Vector[], localPoints: Vector[], info: SeparationInfo);
    /**
     * Match contact awake state, except if body's are Fixed
     */
    matchAwake(): void;
    isCanceled(): boolean;
    cancel(): void;
    /**
     * Biases the contact so that the given collider is colliderA
     */
    bias(collider: Collider): this;
}

interface EdgeColliderOptions {
    /**
     * The beginning of the edge defined in local coordinates to the collider
     */
    begin: Vector;
    /**
     * The ending of the edge defined in local coordinates to the collider
     */
    end: Vector;
    /**
     * Optionally specify an offset
     */
    offset?: Vector;
}
/**
 * Edge is a single line collider to create collisions with a single line.
 */
declare class EdgeCollider extends Collider {
    offset: Vector;
    begin: Vector;
    end: Vector;
    private _transform;
    private _globalMatrix;
    constructor(options: EdgeColliderOptions);
    /**
     * Returns a clone of this Edge, not associated with any collider
     */
    clone(): EdgeCollider;
    get worldPos(): Vector;
    /**
     * Get the center of the collision area in world coordinates
     */
    get center(): Vector;
    private _getTransformedBegin;
    private _getTransformedEnd;
    /**
     * Returns the slope of the line in the form of a vector
     */
    getSlope(): Vector;
    /**
     * Returns the length of the line segment in pixels
     */
    getLength(): number;
    /**
     * Tests if a point is contained in this collision area
     */
    contains(): boolean;
    /**
     * @inheritdoc
     */
    rayCast(ray: Ray, max?: number): RayCastHit | null;
    /**
     * Returns the closes line between this and another collider, from this -> collider
     * @param shape
     */
    getClosestLineBetween(shape: Collider): LineSegment;
    /**
     * @inheritdoc
     */
    collide(shape: Collider): CollisionContact[];
    /**
     * Find the point on the collider furthest in the direction specified
     */
    getFurthestPoint(direction: Vector): Vector;
    private _boundsFromBeginEnd;
    /**
     * Get the axis aligned bounding box for the edge collider in world space
     */
    get bounds(): BoundingBox;
    /**
     * Get the axis aligned bounding box for the edge collider in local space
     */
    get localBounds(): BoundingBox;
    /**
     * Returns this edge represented as a line in world coordinates
     */
    asLine(): LineSegment;
    /**
     * Return this edge as a line in local line coordinates (relative to the position)
     */
    asLocalLine(): LineSegment;
    /**
     * Get the axis associated with the edge
     */
    get axes(): Vector[];
    /**
     * Get the moment of inertia for an edge
     * https://en.wikipedia.org/wiki/List_of_moments_of_inertia
     */
    getInertia(mass: number): number;
    /**
     * @inheritdoc
     */
    update(transform: Transform): void;
    /**
     * Project the edge along a specified axis
     */
    project(axis: Vector): Projection;
    debug(ex: ExcaliburGraphicsContext, color: Color): void;
}

declare class ColliderComponent extends Component {
    events: EventEmitter<any>;
    /**
     * Observable that notifies when a collider is added to the body
     */
    $colliderAdded: Observable<Collider>;
    /**
     * Observable that notifies when a collider is removed from the body
     */
    $colliderRemoved: Observable<Collider>;
    constructor(collider?: Collider);
    private _collider;
    /**
     * Get the current collider geometry
     */
    get(): Collider | undefined;
    /**
     * Set the collider geometry
     * @param collider
     * @returns the collider you set
     */
    set<T extends Collider>(collider: T): T;
    private _collidersToRemove;
    /**
     * Remove collider geometry from collider component
     */
    clear(): void;
    processColliderRemoval(): void;
    clone(): ColliderComponent;
    /**
     * Return world space bounds
     */
    get bounds(): BoundingBox;
    /**
     * Return local space bounds
     */
    get localBounds(): BoundingBox;
    /**
     * Update the collider's transformed geometry
     */
    update(): void;
    /**
     * Collide component with another
     * @param other
     */
    collide(other: ColliderComponent): CollisionContact[];
    onAdd(entity: Entity): void;
    onRemove(): void;
    /**
     * Sets up a box geometry based on the current bounds of the associated actor of this physics body.
     *
     * If no width/height are specified the body will attempt to use the associated actor's width/height.
     *
     * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
     */
    useBoxCollider(width: number, height: number, anchor?: Vector, center?: Vector): PolygonCollider;
    /**
     * Sets up a {@apilink PolygonCollider | `polygon`} collision geometry based on a list of of points relative
     *  to the anchor of the associated actor
     * of this physics body.
     *
     * Only [convex polygon](https://en.wikipedia.org/wiki/Convex_polygon) definitions are supported.
     *
     * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
     */
    usePolygonCollider(points: Vector[], center?: Vector): PolygonCollider;
    /**
     * Sets up a {@apilink Circle | `circle collision geometry`} as the only collider with a specified radius in pixels.
     *
     * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
     */
    useCircleCollider(radius: number, center?: Vector): CircleCollider;
    /**
     * Sets up an {@apilink Edge | `edge collision geometry`} with a start point and an end point relative to the anchor of the associated actor
     * of this physics body.
     *
     * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
     */
    useEdgeCollider(begin: Vector, end: Vector): EdgeCollider;
    /**
     * Setups up a {@apilink CompositeCollider} which can define any arbitrary set of excalibur colliders
     * @param colliders
     */
    useCompositeCollider(colliders: Collider[]): CompositeCollider;
}

/**
 * Excalibur helper for defining colliders quickly
 */
declare class Shape {
    /**
     * Creates a box collider, under the hood defines a {@apilink PolygonCollider} collider
     * @param width Width of the box
     * @param height Height of the box
     * @param anchor Anchor of the box (default (.5, .5)) which positions the box relative to the center of the collider's position
     * @param offset Optional offset relative to the collider in local coordinates
     */
    static Box(width: number, height: number, anchor?: Vector, offset?: Vector): PolygonCollider;
    /**
     * Creates a new {@apilink PolygonCollider | `arbitrary polygon`} collider
     *
     * PolygonColliders are useful for creating convex polygon shapes
     * @param points Points specified in counter clockwise
     * @param offset Optional offset relative to the collider in local coordinates
     */
    static Polygon(points: Vector[], offset?: Vector, suppressConvexWarning?: boolean): PolygonCollider;
    /**
     * Creates a new {@apilink CircleCollider | `circle`} collider
     *
     * Circle colliders are useful for balls, or to make collisions more forgiving on sharp edges
     * @param radius Radius of the circle collider
     * @param offset Optional offset relative to the collider in local coordinates
     */
    static Circle(radius: number, offset?: Vector): CircleCollider;
    /**
     * Creates a new {@apilink EdgeCollider | `edge`} collider
     *
     * Edge colliders are useful for  floors, walls, and other barriers
     * @param begin Beginning of the edge in local coordinates to the collider
     * @param end Ending of the edge in local coordinates to the collider
     */
    static Edge(begin: Vector, end: Vector): EdgeCollider;
    /**
     * Creates a new capsule shaped {@apilink CompositeCollider} using 2 circles and a box
     *
     * Capsule colliders are useful for platformers with incline or jagged floors to have a smooth
     * player experience.
     * @param width
     * @param height
     * @param offset Optional offset
     */
    static Capsule(width: number, height: number, offset?: Vector): CompositeCollider;
}

declare const CollisionJumpTable: {
    CollideCircleCircle(circleA: CircleCollider, circleB: CircleCollider): CollisionContact[];
    CollideCirclePolygon(circle: CircleCollider, polygon: PolygonCollider): CollisionContact[];
    CollideCircleEdge(circle: CircleCollider, edge: EdgeCollider): CollisionContact[];
    CollideEdgeEdge(): CollisionContact[];
    CollidePolygonEdge(polygon: PolygonCollider, edge: EdgeCollider): CollisionContact[];
    CollidePolygonPolygon(polyA: PolygonCollider, polyB: PolygonCollider): CollisionContact[];
    FindContactSeparation(contact: CollisionContact, localPoint: Vector): number;
};

declare const ClosestLineJumpTable: {
    PolygonPolygonClosestLine(polygonA: PolygonCollider, polygonB: PolygonCollider): LineSegment;
    PolygonEdgeClosestLine(polygon: PolygonCollider, edge: EdgeCollider): LineSegment;
    PolygonCircleClosestLine(polygon: PolygonCollider, circle: CircleCollider): LineSegment;
    CircleCircleClosestLine(circleA: CircleCollider, circleB: CircleCollider): LineSegment;
    CircleEdgeClosestLine(circle: CircleCollider, edge: EdgeCollider): LineSegment;
    EdgeEdgeClosestLine(edgeA: EdgeCollider, edgeB: EdgeCollider): LineSegment;
};

/**
 * Static class for managing collision groups in excalibur, there is a maximum of 32 collision groups possible in excalibur
 */
declare class CollisionGroupManager {
    private static _STARTING_BIT;
    private static _MAX_GROUPS;
    private static _CURRENT_GROUP;
    private static _CURRENT_BIT;
    private static _GROUPS;
    /**
     * Create a new named collision group up to a max of 32.
     * @param name Name for the collision group
     * @param mask Optionally provide your own 32-bit mask, if none is provide the manager will generate one
     */
    static create(name: string, mask?: number): CollisionGroup;
    /**
     * Get all collision groups currently tracked by excalibur
     */
    static get groups(): CollisionGroup[];
    /**
     * Get a collision group by it's name
     * @param name
     */
    static groupByName(name: string): CollisionGroup;
    /**
     * Resets the managers internal group management state
     */
    static reset(): void;
}

/**
 * Models a potential collision between 2 colliders
 */
declare class Pair {
    colliderA: Collider;
    colliderB: Collider;
    id: string;
    constructor(colliderA: Collider, colliderB: Collider);
    /**
     * Returns whether a it is allowed for 2 colliders in a Pair to collide
     * @param colliderA
     * @param colliderB
     */
    static canCollide(colliderA: Collider, colliderB: Collider): boolean;
    /**
     * Returns whether or not it is possible for the pairs to collide
     */
    get canCollide(): boolean;
    /**
     * Runs the collision intersection logic on the members of this pair
     */
    collide(): CollisionContact[];
    /**
     * Check if the collider is part of the pair
     * @param collider
     */
    hasCollider(collider: Collider): boolean;
    /**
     * Calculates the unique pair hash id for this collision pair (owning id)
     */
    static calculatePairHash(idA: Id<'collider'>, idB: Id<'collider'>): string;
}

interface RayCastOptions {
    /**
     * Optionally specify the maximum distance in pixels to ray cast, default is Infinity
     */
    maxDistance?: number;
    /**
     * Optionally specify a collision group to target in the ray cast, default is All.
     */
    collisionGroup?: CollisionGroup;
    /**
     * Optionally specify a collision mask to target multiple collision categories
     */
    collisionMask?: number;
    /**
     * Optionally search for all colliders that intersect the ray cast.
     *
     * Default false
     */
    searchAllColliders?: boolean;
    /**
     * Optionally ignore things with CollisionGroup.All and only test against things with an explicit group
     *
     * Default false
     */
    ignoreCollisionGroupAll?: boolean;
    /**
     * Optionally provide a any filter function to filter on arbitrary qualities of a ray cast hit
     *
     * Filters run after any collision mask/collision group filtering, it is the last decision
     *
     * Returning true means you want to include the collider in your results, false means exclude it
     */
    filter?: (hit: RayCastHit) => boolean;
}

declare enum ColorBlindnessMode {
    Protanope = "Protanope",
    Deuteranope = "Deuteranope",
    Tritanope = "Tritanope"
}

declare class ColorBlindFlags {
    private _engine;
    private _colorBlindPostProcessor;
    constructor(engine: Engine);
    /**
     * Correct colors for a specified color blindness
     * @param colorBlindness
     */
    correct(colorBlindness: ColorBlindnessMode): void;
    /**
     * Simulate colors for a specified color blindness
     * @param colorBlindness
     */
    simulate(colorBlindness: ColorBlindnessMode): void;
    /**
     * Remove color blindness post processor
     */
    clear(): void;
}

interface FpsSamplerOptions {
    /**
     * Specify the sampling period in milliseconds (default 100)
     */
    samplePeriod?: number;
    /**
     * Specify the initial FPS
     */
    initialFps: number;
    /**
     * Specify the function used to return the current time (in milliseconds)
     */
    nowFn: () => number;
}
declare class FpsSampler {
    private _fps;
    private _samplePeriod;
    private _currentFrameTime;
    private _frames;
    private _previousSampleTime;
    private _beginFrameTime;
    private _nowFn;
    constructor(options: FpsSamplerOptions);
    /**
     * Start of code block to sample FPS for
     */
    start(): void;
    /**
     * End of code block to sample FPS for
     */
    end(): void;
    /**
     * Return the currently sampled fps over the last sample period, by default every 100ms
     */
    get fps(): number;
    /**
     * Return the instantaneous fps, this can be less useful because it will fluctuate given the current frames time
     */
    get instant(): number;
}

type ScheduledCallbackTiming = 'preframe' | 'postframe' | 'preupdate' | 'postupdate' | 'predraw' | 'postdraw';
/**
 * Unique identifier for a scheduled callback
 */
type ScheduleId = number;
interface ClockOptions {
    /**
     * Define the function you'd like the clock to tick when it is started
     */
    tick: (elapsed: number) => any;
    /**
     * Optionally define the fatal exception handler, used if an error is thrown in tick
     */
    onFatalException?: (e: unknown) => any;
    /**
     * Optionally limit the maximum FPS of the clock
     */
    maxFps?: number;
}
/**
 * Abstract Clock is the base type of all Clocks
 *
 * It has a few opinions
 * 1. It manages the calculation of what "elapsed" time means and thus maximum fps
 * 2. The default timing api is implemented in now()
 *
 * To implement your own clock, extend Clock and override start/stop to start and stop the clock, then call update() with whatever
 * method is unique to your clock implementation.
 */
declare abstract class Clock {
    protected tick: (elapsed: number) => any;
    private _onFatalException;
    private _maxFps;
    private _lastTime;
    fpsSampler: FpsSampler;
    private _options;
    private _elapsed;
    private _scheduledCbs;
    private _totalElapsed;
    private _nextScheduleId;
    constructor(options: ClockOptions);
    /**
     * Get the elapsed time for the last completed frame
     */
    elapsed(): number;
    /**
     * Get the current time in milliseconds
     */
    now(): number;
    toTestClock(): TestClock;
    toStandardClock(): StandardClock;
    setFatalExceptionHandler(handler: (e: unknown) => any): void;
    /**
     * Schedule a callback to fire given a timeout in milliseconds using the excalibur {@apilink Clock}
     *
     * This is useful to use over the built in browser `setTimeout` because callbacks will be tied to the
     * excalibur update clock, instead of browser time, this means that callbacks wont fire if the game is
     * stopped or paused.
     * @param cb callback to fire
     * @param timeoutMs Optionally specify a timeout in milliseconds from now, default is 0ms which means the next possible tick
     * @param timing Optionally specify a timeout in milliseconds from now, default is 0ms which means the next possible tick
     * @returns A unique identifier that can be used to clear the scheduled callback with {@apilink clearSchedule}
     */
    schedule(cb: (elapsed: number) => any, timeoutMs?: number, timing?: ScheduledCallbackTiming): ScheduleId;
    /**
     * Clears a scheduled callback using the ID returned from {@apilink schedule}
     * @param id The ID of the scheduled callback to clear
     */
    clearSchedule(id: ScheduleId): void;
    /**
     * Called internally to trigger scheduled callbacks in the clock
     * @param timing
     * @internal
     */
    __runScheduledCbs(timing?: ScheduledCallbackTiming): void;
    protected update(overrideUpdateMs?: number): void;
    /**
     * Returns if the clock is currently running
     */
    abstract isRunning(): boolean;
    /**
     * Start the clock, it will then periodically call the tick(elapsedMilliseconds) since the last tick
     */
    abstract start(): void;
    /**
     * Stop the clock, tick() is no longer called
     */
    abstract stop(): void;
}
/**
 * The {@apilink StandardClock} implements the requestAnimationFrame browser api to run the tick()
 */
declare class StandardClock extends Clock {
    private _running;
    private _requestId;
    constructor(options: ClockOptions);
    isRunning(): boolean;
    start(): void;
    stop(): void;
}
interface TestClockOptions {
    /**
     * Specify the update milliseconds to use for each manual step()
     */
    defaultUpdateMs: number;
}
/**
 * The TestClock is meant for debugging interactions in excalibur that require precise timing to replicate or test
 */
declare class TestClock extends Clock {
    private _logger;
    private _updateMs;
    private _running;
    private _currentTime;
    constructor(options: ClockOptions & TestClockOptions);
    /**
     * Get the current time in milliseconds
     */
    now(): number;
    isRunning(): boolean;
    start(): void;
    stop(): void;
    /**
     * Manually step the clock forward 1 tick, optionally specify an elapsed time in milliseconds
     * @param overrideUpdateMs
     */
    step(overrideUpdateMs?: number): void;
    /**
     * Run a number of steps that tick the clock, optionally specify an elapsed time in milliseconds
     * @param numberOfSteps
     * @param overrideUpdateMs
     */
    run(numberOfSteps: number, overrideUpdateMs?: number): void;
}

/**
 * Debug stats containing current and previous frame statistics
 */
interface DebugStats {
    currFrame: FrameStats;
    prevFrame: FrameStats;
}
/**
 * Represents a frame's individual statistics
 */
interface FrameStatistics {
    /**
     * The number of the frame
     */
    id: number;
    /**
     * Gets the frame's delta (time since last frame scaled by {@apilink Engine.timescale}) (in ms)
     *
     * Excalibur extension depends on this
     */
    elapsedMs: number;
    /**
     * Gets the frame's frames-per-second (FPS)
     */
    fps: number;
    /**
     * Duration statistics (in ms)
     */
    duration: FrameDurationStats;
    /**
     * Actor statistics
     */
    actors: FrameActorStats;
    /**
     * Physics statistics
     */
    physics: PhysicsStatistics;
    /**
     * Graphics statistics
     */
    graphics: GraphicsStatistics;
}
/**
 * Represents actor stats for a frame
 */
interface FrameActorStats {
    /**
     * Gets the frame's number of actors (alive)
     */
    alive: number;
    /**
     * Gets the frame's number of actors (killed)
     */
    killed: number;
    /**
     * Gets the frame's number of remaining actors (alive - killed)
     */
    remaining: number;
    /**
     * Gets the frame's number of UI actors
     */
    ui: number;
    /**
     * Gets the frame's number of total actors (remaining + UI)
     */
    total: number;
}
/**
 * Represents duration stats for a frame
 */
interface FrameDurationStats {
    /**
     * Gets the frame's total time to run the update function (in ms)
     */
    update: number;
    /**
     * Gets the frame's total time to run the draw function (in ms)
     */
    draw: number;
    /**
     * Gets the frame's total render duration (update + draw duration) (in ms)
     */
    total: number;
}
/**
 * Represents physics stats for the current frame
 */
interface PhysicsStatistics {
    /**
     * Gets the number of broadphase collision pairs which
     */
    pairs: number;
    /**
     * Gets the number of actual collisions
     */
    collisions: number;
    /**
     * Copy of the current frame contacts (only updated if debug is toggled on)
     */
    contacts: Map<string, CollisionContact>;
    /**
     * Gets the number of fast moving bodies using raycast continuous collisions in the scene
     */
    fastBodies: number;
    /**
     * Gets the number of bodies that had a fast body collision resolution
     */
    fastBodyCollisions: number;
    /**
     * Gets the time it took to calculate the broadphase pairs
     */
    broadphase: number;
    /**
     * Gets the time it took to calculate the narrowphase
     */
    narrowphase: number;
}
interface GraphicsStatistics {
    drawCalls: number;
    drawnImages: number;
}
/**
 * Debug statistics and flags for Excalibur. If polling these values, it would be
 * best to do so on the `postupdate` event for {@apilink Engine}, after all values have been
 * updated during a frame.
 */
declare class DebugConfig {
    private _engine;
    constructor(engine: Engine);
    /**
     * Switch the current excalibur clock with the {@apilink TestClock} and return
     * it in the same running state.
     *
     * This is useful when you need to debug frame by frame.
     */
    useTestClock(): TestClock;
    /**
     * Switch the current excalibur clock with the {@apilink StandardClock} and
     * return it in the same running state.
     *
     * This is useful when you need to switch back to normal mode after
     * debugging.
     */
    useStandardClock(): StandardClock;
    /**
     * Performance statistics
     */
    stats: DebugStats;
    /**
     * Correct or simulate color blindness using {@apilink ColorBlindnessPostProcessor}.
     * @warning Will reduce FPS.
     */
    colorBlindMode: ColorBlindFlags;
    /**
     * Filter debug context to named entities or entity ids
     */
    filter: {
        useFilter: boolean;
        nameQuery: string;
        ids: number[];
    };
    /**
     * Entity debug settings
     */
    entity: {
        showAll: boolean;
        showId: boolean;
        showName: boolean;
    };
    /**
     * Transform component debug settings
     */
    transform: {
        showAll: boolean;
        debugZIndex: number;
        showPosition: boolean;
        showPositionLabel: boolean;
        positionColor: Color;
        showZIndex: boolean;
        showScale: boolean;
        scaleColor: Color;
        showRotation: boolean;
        rotationColor: Color;
    };
    /**
     * Graphics component debug settings
     */
    graphics: {
        showAll: boolean;
        showBounds: boolean;
        boundsColor: Color;
    };
    /**
     * Collider component debug settings
     */
    collider: {
        showAll: boolean;
        showBounds: boolean;
        boundsColor: Color;
        showOwner: boolean;
        showGeometry: boolean;
        geometryColor: Color;
        geometryLineWidth: number;
        geometryPointSize: number;
    };
    /**
     * Physics simulation debug settings
     */
    physics: {
        showAll: boolean;
        showBroadphaseSpacePartitionDebug: boolean;
        showCollisionNormals: boolean;
        collisionNormalColor: Color;
        showCollisionContacts: boolean;
        contactSize: number;
        collisionContactColor: Color;
    };
    /**
     * Motion component debug settings
     */
    motion: {
        showAll: boolean;
        showVelocity: boolean;
        velocityColor: Color;
        showAcceleration: boolean;
        accelerationColor: Color;
    };
    /**
     * Body component debug settings
     */
    body: {
        showAll: boolean;
        showCollisionGroup: boolean;
        showCollisionType: boolean;
        showSleeping: boolean;
        showMotion: boolean;
        showMass: boolean;
    };
    /**
     * Camera debug settings
     */
    camera: {
        showAll: boolean;
        showFocus: boolean;
        focusColor: Color;
        showZoom: boolean;
    };
    tilemap: {
        showAll: boolean;
        showGrid: boolean;
        gridColor: Color;
        gridWidth: number;
        showSolidBounds: boolean;
        solidBoundsColor: Color;
        showColliderGeometry: boolean;
    };
    isometric: {
        showAll: boolean;
        showPosition: boolean;
        positionColor: Color;
        positionSize: number;
        showGrid: boolean;
        gridColor: Color;
        gridWidth: number;
        showColliderGeometry: boolean;
    };
}
/**
 * Implementation of a frame's stats. Meant to have values copied via {@apilink FrameStats.reset}, avoid
 * creating instances of this every frame.
 */
declare class FrameStats implements FrameStatistics {
    private _id;
    private _elapsedMs;
    private _fps;
    private _actorStats;
    private _durationStats;
    private _physicsStats;
    private _graphicsStats;
    /**
     * Zero out values or clone other IFrameStat stats. Allows instance reuse.
     * @param [otherStats] Optional stats to clone
     */
    reset(otherStats?: FrameStatistics): void;
    /**
     * Provides a clone of this instance.
     */
    clone(): FrameStats;
    /**
     * Gets the frame's id
     */
    get id(): number;
    /**
     * Sets the frame's id
     */
    set id(value: number);
    /**
     * Gets the frame's delta (time since last frame)
     */
    get elapsedMs(): number;
    /**
     * Sets the frame's delta (time since last frame). Internal use only.
     * @internal
     */
    set elapsedMs(value: number);
    /**
     * Gets the frame's frames-per-second (FPS)
     */
    get fps(): number;
    /**
     * Sets the frame's frames-per-second (FPS). Internal use only.
     * @internal
     */
    set fps(value: number);
    /**
     * Gets the frame's actor statistics
     */
    get actors(): FrameActorStats;
    /**
     * Gets the frame's duration statistics
     */
    get duration(): FrameDurationStats;
    /**
     * Gets the frame's physics statistics
     */
    get physics(): PhysicsStats;
    /**
     * Gets the frame's graphics statistics
     */
    get graphics(): GraphicsStatistics;
}
declare class PhysicsStats implements PhysicsStatistics {
    private _pairs;
    private _collisions;
    private _contacts;
    private _fastBodies;
    private _fastBodyCollisions;
    private _broadphase;
    private _narrowphase;
    /**
     * Zero out values or clone other IPhysicsStats stats. Allows instance reuse.
     * @param [otherStats] Optional stats to clone
     */
    reset(otherStats?: PhysicsStatistics): void;
    /**
     * Provides a clone of this instance.
     */
    clone(): PhysicsStatistics;
    get pairs(): number;
    set pairs(value: number);
    get collisions(): number;
    set collisions(value: number);
    get contacts(): Map<string, CollisionContact>;
    set contacts(contacts: Map<string, CollisionContact>);
    get fastBodies(): number;
    set fastBodies(value: number);
    get fastBodyCollisions(): number;
    set fastBodyCollisions(value: number);
    get broadphase(): number;
    set broadphase(value: number);
    get narrowphase(): number;
    set narrowphase(value: number);
}

declare class DebugSystem extends System {
    world: World;
    static priority: number;
    readonly systemType = SystemType.Draw;
    private _graphicsContext;
    private _collisionSystem;
    private _camera;
    private _engine;
    query: Query<typeof TransformComponent>;
    constructor(world: World);
    initialize(world: World, scene: Scene): void;
    update(): void;
    postupdate(engine: Scene<unknown>, elapsed: number): void;
    /**
     * This applies the current entity transform to the graphics context
     * @param entity
     */
    private _applyTransform;
    /**
     * Applies the current camera transform if in world coordinates
     * @param transform
     */
    private _pushCameraTransform;
    /**
     * Resets the current camera transform if in world coordinates
     * @param transform
     */
    private _popCameraTransform;
}

/**
 * Definition for collision processor
 *
 * Collision processors are responsible for tracking colliders and identifying contacts between them
 */
interface CollisionProcessor {
    /**
     *
     */
    rayCast(ray: Ray, options?: RayCastOptions): RayCastHit[];
    /**
     * Query the collision processor for colliders that contain the point
     * @param point
     */
    query(point: Vector): Collider[];
    /**
     * Query the collision processor for colliders that overlap with the bounds
     * @param bounds
     */
    query(bounds: BoundingBox): Collider[];
    /**
     * Get all tracked colliders
     */
    getColliders(): readonly Collider[];
    /**
     * Track collider in collision processor
     */
    track(target: Collider): void;
    /**
     * Untrack collider in collision processor
     */
    untrack(target: Collider): void;
    /**
     * Detect potential collision pairs given a list of colliders
     */
    broadphase(targets: Collider[], elapsed: number, stats?: FrameStats): Pair[];
    /**
     * Identify actual collisions from those pairs, and calculate collision impulse
     */
    narrowphase(pairs: Pair[], stats?: FrameStats): CollisionContact[];
    /**
     * Update the internal structures to track colliders
     */
    update(targets: Collider[], elapsed: number): number;
    /**
     * Draw any debug information
     */
    debug(ex: ExcaliburGraphicsContext, elapsed: number): void;
}

/**
 * Dynamic Tree Node used for tracking bounds within the tree
 */
declare class TreeNode<T> {
    parent?: TreeNode<T>;
    left: TreeNode<T>;
    right: TreeNode<T>;
    bounds: BoundingBox;
    height: number;
    data: T;
    constructor(parent?: TreeNode<T>);
    isLeaf(): boolean;
}
interface ColliderProxy<T> {
    id: Id<'collider'>;
    owner: T;
    bounds: BoundingBox;
}
/**
 * The DynamicTrees provides a spatial partitioning data structure for quickly querying for overlapping bounding boxes for
 * all tracked bodies. The worst case performance of this is O(n*log(n)) where n is the number of bodies in the tree.
 *
 * Internally the bounding boxes are organized as a balanced binary tree of bounding boxes, where the leaf nodes are tracked bodies.
 * Every non-leaf node is a bounding box that contains child bounding boxes.
 */
declare class DynamicTree<TProxy extends ColliderProxy<Entity>> {
    private _config;
    worldBounds: BoundingBox;
    root: TreeNode<TProxy>;
    nodes: {
        [key: number]: TreeNode<TProxy>;
    };
    constructor(_config: Required<DynamicTreeConfig>, worldBounds?: BoundingBox);
    /**
     * Inserts a node into the dynamic tree
     */
    private _insert;
    /**
     * Removes a node from the dynamic tree
     */
    private _remove;
    /**
     * Tracks a body in the dynamic tree
     */
    trackCollider(collider: TProxy): void;
    /**
     * Updates the dynamic tree given the current bounds of each body being tracked
     */
    updateCollider(collider: TProxy): boolean;
    /**
     * Untracks a body from the dynamic tree
     */
    untrackCollider(collider: TProxy): void;
    /**
     * Balances the tree about a node
     */
    private _balance;
    /**
     * Returns the internal height of the tree, shorter trees are better. Performance drops as the tree grows
     */
    getHeight(): number;
    /**
     * Queries the Dynamic Axis Aligned Tree for bodies that could be colliding with the provided body.
     *
     * In the query callback, it will be passed a potential collider. Returning true from this callback indicates
     * that you are complete with your query and you do not want to continue. Returning false will continue searching
     * the tree until all possible colliders have been returned.
     */
    query(collider: TProxy, callback: (other: TProxy) => boolean): void;
    /**
     * Queries the Dynamic Axis Aligned Tree for bodies that could be intersecting. By default the raycast query uses an infinitely
     * long ray to test the tree specified by `max`.
     *
     * In the query callback, it will be passed a potential body that intersects with the raycast. Returning true from this
     * callback indicates that your are complete with your query and do not want to continue. Return false will continue searching
     * the tree until all possible bodies that would intersect with the ray have been returned.
     */
    rayCastQuery(ray: Ray, max: number, callback: (other: TProxy) => boolean): void;
    getNodes(): TreeNode<TProxy>[];
    debug(ex: ExcaliburGraphicsContext): void;
}

/**
 * Responsible for performing the collision broadphase (locating potential collisions) and
 * the narrowphase (actual collision contacts)
 */
declare class DynamicTreeCollisionProcessor implements CollisionProcessor {
    private _config;
    private _dynamicCollisionTree;
    private _pairs;
    private _collisionPairCache;
    private _colliders;
    constructor(_config: DeepRequired<PhysicsConfig>);
    getColliders(): readonly Collider[];
    query(point: Vector): Collider[];
    query(bounds: BoundingBox): Collider[];
    rayCast(ray: Ray, options?: RayCastOptions): RayCastHit[];
    /**
     * Tracks a physics body for collisions
     */
    track(target: Collider): void;
    /**
     * Untracks a physics body
     */
    untrack(target: Collider): void;
    private _pairExists;
    /**
     * Detects potential collision pairs in a broadphase approach with the dynamic AABB tree strategy
     */
    broadphase(targets: Collider[], elapsed: number, stats?: FrameStats): Pair[];
    /**
     * Applies narrow phase on collision pairs to find actual area intersections
     * Adds actual colliding pairs to stats' Frame data
     */
    narrowphase(pairs: Pair[], stats?: FrameStats): CollisionContact[];
    /**
     * Update the dynamic tree positions
     */
    update(targets: Collider[]): number;
    debug(ex: ExcaliburGraphicsContext): void;
}

declare class HashGridProxy<T extends {
    bounds: BoundingBox;
}> {
    object: T;
    id: number;
    /**
     * left bounds x hash coordinate
     */
    leftX: number;
    /**
     * right bounds x hash coordinate
     */
    rightX: number;
    /**
     * bottom bounds y hash coordinate
     */
    bottomY: number;
    /**
     * top bounds y hash coordinate
     */
    topY: number;
    bounds: BoundingBox;
    cells: HashGridCell<T>[];
    hasZeroBounds: boolean;
    /**
     * Grid size in pixels
     */
    readonly gridSize: number;
    constructor(object: T, gridSize: number);
    /**
     * Has the hashed bounds changed
     */
    hasChanged(): boolean;
    /**
     * Clears all collider references
     */
    clear(): void;
    /**
     * Update bounds of the proxy
     */
    updateBounds(): void;
    /**
     * Updates the hashed bounds coordinates
     */
    update(): void;
}
declare class HashGridCell<TObject extends {
    bounds: BoundingBox;
}, TProxy extends HashGridProxy<TObject> = HashGridProxy<TObject>> {
    proxies: TProxy[];
    key: string;
    x: number;
    y: number;
    configure(x: number, y: number): void;
    static calculateHashKey(x: number, y: number): string;
}
declare class SparseHashGrid<TObject extends {
    bounds: BoundingBox;
}, TProxy extends HashGridProxy<TObject> = HashGridProxy<TObject>> {
    readonly gridSize: number;
    readonly sparseHashGrid: Map<string, HashGridCell<TObject, TProxy>>;
    readonly objectToProxy: Map<TObject, TProxy>;
    bounds: BoundingBox;
    private _hashGridCellPool;
    private _buildProxy;
    constructor(options: {
        size: number;
        proxyFactory?: (object: TObject, gridSize: number) => TProxy;
    });
    query(point: Vector): TObject[];
    query(bounds: BoundingBox): TObject[];
    get(xCoord: number, yCoord: number): HashGridCell<TObject>;
    private _insert;
    private _remove;
    track(target: TObject): void;
    untrack(target: TObject): void;
    update(targets: TObject[]): number;
    debug(ex: ExcaliburGraphicsContext, elapsed: number): void;
}

/**
 * Proxy type to stash collision info
 */
declare class HashColliderProxy extends HashGridProxy<Collider> {
    collider: Collider;
    id: number;
    owner: Entity;
    body?: BodyComponent;
    collisionType: CollisionType;
    hasZeroBounds: boolean;
    /**
     * left bounds x hash coordinate
     */
    leftX: number;
    /**
     * right bounds x hash coordinate
     */
    rightX: number;
    /**
     * bottom bounds y hash coordinate
     */
    bottomY: number;
    /**
     * top bounds y hash coordinate
     */
    topY: number;
    /**
     * References to the hash cell the collider is a current member of
     */
    cells: HashGridCell<Collider, HashColliderProxy>[];
    /**
     * Grid size in pixels
     */
    readonly gridSize: number;
    constructor(collider: Collider, gridSize: number);
    /**
     * Updates the hashed bounds coordinates
     */
    update(): void;
}
/**
 * This collision processor uses a sparsely populated grid of uniform cells to bucket potential
 * colliders together for the purpose of detecting collision pairs and collisions.
 */
declare class SparseHashGridCollisionProcessor implements CollisionProcessor {
    readonly gridSize: number;
    readonly hashGrid: SparseHashGrid<Collider, HashColliderProxy>;
    private _pairs;
    private _nonPairs;
    _pairPool: Pool<Pair>;
    constructor(options: {
        size: number;
    });
    getColliders(): readonly Collider[];
    query(point: Vector): Collider[];
    query(bound: BoundingBox): Collider[];
    rayCast(ray: Ray, options?: RayCastOptions): RayCastHit[];
    /**
     * Adds the collider to the internal data structure for collision tracking
     * @param target
     */
    track(target: Collider): void;
    /**
     * Removes a collider from the internal data structure for tracking collisions
     * @param target
     */
    untrack(target: Collider): void;
    private _canCollide;
    /**
     * Runs the broadphase sweep over tracked colliders and returns possible collision pairs
     * @param targets
     * @param elapsed
     */
    broadphase(targets: Collider[], elapsed: number): Pair[];
    /**
     * Runs a fine grain pass on collision pairs and does geometry intersection tests producing any contacts
     * @param pairs
     * @param stats
     */
    narrowphase(pairs: Pair[], stats?: FrameStats): CollisionContact[];
    /**
     * Perform data structure maintenance, returns number of colliders updated
     */
    update(targets: Collider[], elapsed: number): number;
    /**
     * Draws the internal data structure
     * @param ex
     * @param elapsed
     */
    debug(ex: ExcaliburGraphicsContext, elapsed: number): void;
}

/**
 * Represents an audio control implementation
 */
interface Audio {
    /**
     * Whether the audio should loop (repeat forever)
     */
    loop: boolean;
    /**
     * The volume (between 0 and 1)
     */
    volume: number;
    /**
     * Set the playbackRate, default is 1.0 at normal speed.
     * For example 2.0 is double speed, and 0.5 is half speed.
     */
    playbackRate: number;
    /**
     * Whether or not any audio is playing
     */
    isPlaying(): boolean;
    /**
     * Returns if the audio is paused
     */
    isPaused(): boolean;
    /**
     * Returns if the audio is stopped
     */
    isStopped(): boolean;
    /**
     * Will play the sound or resume if paused
     */
    play(): Promise<any>;
    /**
     * Seek to a position (in seconds) in the audio
     * @param position
     */
    seek(position: number): void;
    /**
     * Return the duration of the sound
     */
    getTotalPlaybackDuration(): number;
    /**
     * Return the current playback time of the playing track in seconds from the start
     */
    getPlaybackPosition(): number;
    /**
     * Pause the sound
     */
    pause(): void;
    /**
     * Stop playing the sound and reset
     */
    stop(): void;
}

type ExResponseType = '' | 'arraybuffer' | 'blob' | 'document' | 'json' | 'text';
interface ExResponseTypesLookup {
    [name: string]: ExResponseType;
}
declare class ExResponse {
    static type: ExResponseTypesLookup;
}
/**
 * Represents an audio implementation like {@apilink WebAudioInstance}
 */
interface AudioImplementation {
    /**
     * XHR response type
     */
    responseType: ExResponseType;
    /**
     * Processes raw data and transforms into sound data
     */
    processData(data: Blob | ArrayBuffer): Promise<string | AudioBuffer>;
    /**
     * Factory method that returns an instance of a played audio track
     */
    createInstance(data: string | AudioBuffer): Audio;
}

/**
 * An interface describing loadable resources in Excalibur. Built-in loadable
 * resources include {@apilink Texture}, {@apilink Sound}, and a generic {@apilink Resource}.
 */
interface Loadable<T> {
    /**
     * Data associated with a loadable
     */
    data: T;
    /**
     * Begins loading the resource and returns a promise to be resolved on completion
     */
    load(): Promise<T>;
    /**
     * Returns true if the loadable is loaded
     */
    isLoaded(): boolean;
}

/**
 * Describes the different image filtering modes
 */
declare enum ImageFiltering {
    /**
     * Pixel is useful when you do not want smoothing aka antialiasing applied to your graphics.
     *
     * Useful for Pixel art aesthetics.
     */
    Pixel = "Pixel",
    /**
     * Blended is useful when you have high resolution artwork and would like it blended and smoothed
     */
    Blended = "Blended"
}
/**
 * Parse the image filtering attribute value, if it doesn't match returns null
 */
declare function parseImageFiltering(val: string): ImageFiltering | undefined;

/**
 * Describes the different image wrapping modes
 */
declare enum ImageWrapping {
    Clamp = "Clamp",
    Repeat = "Repeat",
    Mirror = "Mirror"
}
/**
 *
 */
declare function parseImageWrapping(val: string): ImageWrapping;

interface ImageSourceOptions {
    filtering?: ImageFiltering;
    wrapping?: ImageWrapConfiguration | ImageWrapping;
    bustCache?: boolean;
}
interface ImageWrapConfiguration {
    x: ImageWrapping;
    y: ImageWrapping;
}
declare const ImageSourceAttributeConstants: {
    readonly Filtering: "filtering";
    readonly WrappingX: "wrapping-x";
    readonly WrappingY: "wrapping-y";
};
declare class ImageSource implements Loadable<HTMLImageElement> {
    private _logger;
    private _resource;
    filtering?: ImageFiltering;
    wrapping?: ImageWrapConfiguration;
    /**
     * The original size of the source image in pixels
     */
    get width(): number;
    /**
     * The original height of the source image in pixels
     */
    get height(): number;
    private _src?;
    /**
     * Returns true if the Texture is completely loaded and is ready
     * to be drawn.
     */
    isLoaded(): boolean;
    /**
     * Access to the underlying html image element
     */
    data: HTMLImageElement;
    get image(): HTMLImageElement;
    private _readyFuture;
    /**
     * Promise the resolves when the image is loaded and ready for use, does not initiate loading
     */
    ready: Promise<HTMLImageElement>;
    readonly path: string;
    /**
     * The path to the image, can also be a data url like 'data:image/'
     * @param pathOrBase64 {string} Path to the image resource relative from the HTML document hosting the game, or absolute
     * @param options
     */
    constructor(pathOrBase64: string, options?: ImageSourceOptions);
    /**
     * The path to the image, can also be a data url like 'data:image/'
     * @param pathOrBase64 {string} Path to the image resource relative from the HTML document hosting the game, or absolute
     * @param bustCache {boolean} Should excalibur add a cache busting querystring?
     * @param filtering {ImageFiltering} Optionally override the image filtering set by {@apilink EngineOptions.antialiasing}
     */
    constructor(pathOrBase64: string, bustCache: boolean, filtering?: ImageFiltering);
    /**
     * Create an ImageSource from and HTML <image> tag element
     * @param image
     */
    static fromHtmlImageElement(image: HTMLImageElement, options?: ImageSourceOptions): ImageSource;
    static fromHtmlCanvasElement(image: HTMLCanvasElement, options?: ImageSourceOptions): ImageSource;
    static fromSvgString(svgSource: string, options?: ImageSourceOptions): ImageSource;
    /**
     * Should excalibur add a cache busting querystring? By default false.
     * Must be set before loading
     */
    get bustCache(): boolean;
    set bustCache(val: boolean);
    /**
     * Begins loading the image and returns a promise that resolves when the image is loaded
     */
    load(): Promise<HTMLImageElement>;
    /**
     * Build a sprite from this ImageSource
     */
    toSprite(options?: Omit<GraphicOptions & SpriteOptions, 'image'>): Sprite;
    /**
     * Unload images from memory
     */
    unload(): void;
}

type SourceView = {
    x: number;
    y: number;
    width: number;
    height: number;
};
type DestinationSize = {
    width: number;
    height: number;
};
interface SpriteOptions {
    /**
     * Image to create a sprite from
     */
    image: ImageSource;
    /**
     * By default the source is the entire dimension of the {@apilink ImageSource}
     */
    sourceView?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    /**
     * By default the size of the final sprite is the size of the {@apilink ImageSource}
     */
    destSize?: {
        width: number;
        height: number;
    };
}
declare class Sprite extends Graphic {
    private _logger;
    image: ImageSource;
    sourceView: SourceView;
    destSize: DestinationSize;
    private _dirty;
    static from(image: ImageSource, options?: Omit<GraphicOptions & SpriteOptions, 'image'>): Sprite;
    constructor(options: GraphicOptions & SpriteOptions);
    get width(): number;
    get height(): number;
    set width(newWidth: number);
    set height(newHeight: number);
    private _updateSpriteDimensions;
    protected _preDraw(ex: ExcaliburGraphicsContext, x: number, y: number): void;
    _drawImage(ex: ExcaliburGraphicsContext, x: number, y: number): void;
    clone(): Sprite;
}

interface TiledSpriteOptions {
    image: ImageSource;
    /**
     * Source view into the {@link ImageSource image}
     */
    sourceView?: SourceView;
    /**
     * Optionally override {@link ImageFiltering filtering}
     */
    filtering?: ImageFiltering;
    /**
     * Optionally override {@link ImageWrapping wrapping} , default wrapping is Repeat for TiledSprite
     */
    wrapping?: ImageWrapConfiguration | ImageWrapping;
    /**
     * Total width in pixels for the tiling to take place over
     */
    width: number;
    /**
     * Total height in pixels for the tiling to take place over
     */
    height: number;
}
declare class TiledSprite extends Sprite {
    private _ready;
    ready: Promise<void>;
    private _options;
    constructor(options: TiledSpriteOptions & GraphicOptions);
    static fromSprite(sprite: Sprite, options?: Partial<Omit<TiledSpriteOptions & GraphicOptions, 'image'>>): TiledSprite;
    private _applyTiling;
}

/**
 * Specify sprite sheet spacing options, useful if your sprites are not tightly packed
 * and have space between them.
 */
interface SpriteSheetSpacingDimensions {
    /**
     * The starting point to offset and start slicing the sprite sheet from the top left of the image.
     * Default is (0, 0)
     */
    originOffset?: {
        x?: number;
        y?: number;
    } | Vector;
    /**
     * The margin between sprites.
     * Default is (0, 0)
     */
    margin?: {
        x?: number;
        y?: number;
    } | Vector;
}
/**
 * Sprite sheet options for slicing up images
 */
interface SpriteSheetGridOptions {
    /**
     * Source image to use for each sprite
     */
    image: ImageSource;
    /**
     * Grid definition for the sprite sheet
     */
    grid: {
        /**
         * Number of rows in the sprite sheet
         */
        rows: number;
        /**
         * Number of columns in the sprite sheet
         */
        columns: number;
        /**
         * Width of each individual sprite
         */
        spriteWidth: number;
        /**
         * Height of each individual sprite
         */
        spriteHeight: number;
    };
    /**
     * Optionally specify any spacing information between sprites
     */
    spacing?: SpriteSheetSpacingDimensions;
}
interface SpriteSheetSparseOptions {
    /**
     * Source image to use for each sprite
     */
    image: ImageSource;
    /**
     * List of source view rectangles to create a sprite sheet from
     */
    sourceViews: SourceView[];
}
interface SpriteSheetOptions {
    /**
     * Source sprites for the sprite sheet
     */
    sprites: Sprite[];
    /**
     * Optionally specify the number of rows in a sprite sheet (default 1 row)
     */
    rows?: number;
    /**
     * Optionally specify the number of columns in a sprite sheet (default sprites.length)
     */
    columns?: number;
}
interface GetSpriteOptions extends GraphicOptions {
}
/**
 * Represents a collection of sprites from a source image with some organization in a grid
 */
declare class SpriteSheet {
    readonly sprites: Sprite[];
    readonly rows: number;
    readonly columns: number;
    /**
     * Build a new sprite sheet from a list of sprites
     *
     * Use {@apilink SpriteSheet.fromImageSource} to create a SpriteSheet from an {@apilink ImageSource} organized in a grid
     * @param options
     */
    constructor(options: SpriteSheetOptions);
    /**
     * Find a sprite by their x/y integer coordinates in the SpriteSheet, for example `getSprite(0, 0)` is the {@apilink Sprite} in the top-left
     * and `getSprite(1, 0)` is the sprite one to the right.
     * @param x
     * @param y
     */
    getSprite(x: number, y: number, options?: GetSpriteOptions): Sprite;
    /**
     * Find a sprite by their x/y integer coordinates in the SpriteSheet and configures tiling to repeat by default,
     * for example `getTiledSprite(0, 0)` is the {@apilink TiledSprite} in the top-left
     * and `getTiledSprite(1, 0)` is the sprite one to the right.
     *
     * Example:
     *
     * ```typescript
     * spriteSheet.getTiledSprite(1, 0, {
     * width: game.screen.width,
     * height: 200,
     * wrapping: {
     * x: ex.ImageWrapping.Repeat,
     * y: ex.ImageWrapping.Clamp
     * }
     * });
     * ```
     * @param x
     * @param y
     * @param options
     */
    getTiledSprite(x: number, y: number, options?: Partial<Omit<TiledSpriteOptions & GraphicOptions, 'image'>>): TiledSprite;
    /**
     * Create a sprite sheet from a sparse set of {@apilink SourceView} rectangles
     * @param options
     */
    static fromImageSourceWithSourceViews(options: SpriteSheetSparseOptions): SpriteSheet;
    /**
     * Create a SpriteSheet from an {@apilink ImageSource} organized in a grid
     *
     * Example:
     * ```
     * const spriteSheet = SpriteSheet.fromImageSource({
     *   image: imageSource,
     *   grid: {
     *     rows: 5,
     *     columns: 2,
     *     spriteWidth: 32, // pixels
     *     spriteHeight: 32 // pixels
     *   },
     *   // Optionally specify spacing
     *   spacing: {
     *     // pixels from the top left to start the sprite parsing
     *     originOffset: {
     *       x: 5,
     *       y: 5
     *     },
     *     // pixels between each sprite while parsing
     *     margin: {
     *       x: 1,
     *       y: 1
     *     }
     *   }
     * })
     * ```
     * @param options
     */
    static fromImageSource(options: SpriteSheetGridOptions): SpriteSheet;
    clone(): SpriteSheet;
}

interface HasTick {
    /**
     *
     * @param elapsed The amount of real world time in milliseconds that has elapsed that must be updated in the animation
     * @param idempotencyToken Optional idempotencyToken prevents a ticking animation from updating twice per frame
     */
    tick(elapsed: number, idempotencyToken?: number): void;
}
declare enum AnimationDirection {
    /**
     * Animation is playing forwards
     */
    Forward = "forward",
    /**
     * Animation is playing backwards
     */
    Backward = "backward"
}
declare enum AnimationStrategy {
    /**
     * Animation ends without displaying anything
     */
    End = "end",
    /**
     * Animation loops to the first frame after the last frame
     */
    Loop = "loop",
    /**
     * Animation plays to the last frame, then backwards to the first frame, then repeats
     */
    PingPong = "pingpong",
    /**
     * Animation ends stopping on the last frame
     */
    Freeze = "freeze"
}
/**
 * Frame of animation
 */
interface Frame {
    /**
     * Optionally specify a graphic to show, no graphic shows an empty frame
     */
    graphic?: Graphic;
    /**
     * Optionally specify the number of ms the frame should be visible, overrides the animation duration (default 100 ms)
     */
    duration?: number;
}
interface FrameEvent extends Frame {
    frameIndex: number;
}
/**
 * Animation options for building an animation via constructor.
 */
interface AnimationOptions {
    /**
     * List of frames in the order you wish to play them
     */
    frames: Frame[];
    /**
     * Optionally set a positive speed multiplier on the animation.
     *
     * By default 1, meaning 1x speed. If set to 2, it will play the animation twice as fast.
     */
    speed?: number;
    /**
     * Optionally reverse the direction of play
     */
    reverse?: boolean;
    /**
     * Optionally specify a default frame duration in ms (Default is 100)
     */
    frameDuration?: number;
    /**
     * Optionally specify a total duration of the animation in ms to calculate each frame's duration
     */
    totalDuration?: number;
    /**
     * Optionally specify the {@apilink AnimationStrategy} for the Animation
     */
    strategy?: AnimationStrategy;
    /**
     * Optionally set arbitrary meta data for the animation
     */
    data?: Record<string, any>;
}
type AnimationEvents = {
    frame: FrameEvent;
    loop: Animation;
    end: Animation;
};
declare const AnimationEvents: {
    Frame: string;
    Loop: string;
    End: string;
};
interface FromSpriteSheetOptions {
    /**
     * {@apilink SpriteSheet} to source the animation frames from
     */
    spriteSheet: SpriteSheet;
    /**
     * The list of (x, y) positions of sprites in the {@apilink SpriteSheet} of each frame, for example (0, 0)
     * is the the top left sprite, (0, 1) is the sprite directly below that, and so on.
     *
     * You may optionally specify a duration for the frame in milliseconds as well, this will override
     * the default duration.
     */
    frameCoordinates: {
        x: number;
        y: number;
        duration?: number;
        options?: GetSpriteOptions;
    }[];
    /**
     * Optionally specify a default duration for frames in milliseconds
     * @deprecated use `durationPerFrame`
     */
    durationPerFrameMs?: number;
    /**
     * Optionally specify a default duration for frames in milliseconds
     */
    durationPerFrame?: number;
    /**
     * Optionally set a positive speed multiplier on the animation.
     *
     * By default 1, meaning 1x speed. If set to 2, it will play the animation twice as fast.
     */
    speed?: number;
    /**
     * Optionally specify the animation strategy for this animation, by default animations loop {@apilink AnimationStrategy.Loop}
     */
    strategy?: AnimationStrategy;
    /**
     * Optionally specify the animation should be reversed
     */
    reverse?: boolean;
    /**
     * Optionally set arbitrary meta data for the animation
     */
    data?: Record<string, any>;
}
/**
 * Create an Animation given a list of {@apilink Frame | `frames`} in {@apilink AnimationOptions}
 *
 * To create an Animation from a {@apilink SpriteSheet}, use {@apilink Animation.fromSpriteSheet}
 */
declare class Animation extends Graphic implements HasTick {
    private static _LOGGER;
    events: EventEmitter<AnimationEvents>;
    frames: Frame[];
    strategy: AnimationStrategy;
    frameDuration: number;
    data: Map<string, any>;
    private _idempotencyToken;
    private _firstTick;
    private _currentFrame;
    private _timeLeftInFrame;
    private _pingPongDirection;
    private _done;
    private _playing;
    private _speed;
    private _wasResetDuringFrameCalc;
    constructor(options: GraphicOptions & AnimationOptions);
    clone<T extends typeof Animation>(): InstanceType<T>;
    get width(): number;
    get height(): number;
    /**
     * Create an Animation from a {@apilink SpriteSheet}, a list of indices into the sprite sheet, a duration per frame
     * and optional {@apilink AnimationStrategy}
     *
     * Example:
     * ```typescript
     * const spriteSheet = SpriteSheet.fromImageSource({...});
     *
     * const anim = Animation.fromSpriteSheet(spriteSheet, range(0, 5), 200, AnimationStrategy.Loop);
     * ```
     * @param spriteSheet ex.SpriteSheet
     * @param spriteSheetIndex 0 based index from left to right, top down (row major order) of the ex.SpriteSheet
     * @param durationPerFrame duration per frame in milliseconds
     * @param strategy Optional strategy, default AnimationStrategy.Loop
     */
    static fromSpriteSheet<T extends typeof Animation>(this: T, spriteSheet: SpriteSheet, spriteSheetIndex: number[], durationPerFrame: number, strategy?: AnimationStrategy, data?: Record<string, any>): InstanceType<T>;
    /**
     * Create an {@apilink Animation} from a {@apilink SpriteSheet} given a list of coordinates
     *
     * Example:
     * ```typescript
     * const spriteSheet = SpriteSheet.fromImageSource({...});
     *
     * const anim = Animation.fromSpriteSheetCoordinates({
     *  spriteSheet,
     *  frameCoordinates: [
     *    {x: 0, y: 5, duration: 100, options { flipHorizontal: true }},
     *    {x: 1, y: 5, duration: 200},
     *    {x: 2, y: 5},
     *    {x: 3, y: 5}
     *  ],
     *  strategy: AnimationStrategy.PingPong
     * });
     * ```
     * @param options
     * @returns Animation
     */
    static fromSpriteSheetCoordinates<T extends typeof Animation>(this: T, options: FromSpriteSheetOptions): InstanceType<T>;
    /**
     * Current animation speed
     *
     * 1 meaning normal 1x speed.
     * 2 meaning 2x speed and so on.
     */
    get speed(): number;
    /**
     * Current animation speed
     *
     * 1 meaning normal 1x speed.
     * 2 meaning 2x speed and so on.
     */
    set speed(val: number);
    /**
     * Returns the current Frame of the animation
     *
     * Use {@apilink Animation.currentFrameIndex} to get the frame number and
     * {@apilink Animation.goToFrame} to set the current frame index
     */
    get currentFrame(): Frame | null;
    /**
     * Returns the current frame index of the animation
     *
     * Use {@apilink Animation.currentFrame} to grab the current {@apilink Frame} object
     */
    get currentFrameIndex(): number;
    /**
     * Returns the amount of time in milliseconds left in the current frame
     */
    get currentFrameTimeLeft(): number;
    /**
     * Returns `true` if the animation is playing
     */
    get isPlaying(): boolean;
    private _reversed;
    get isReversed(): boolean;
    /**
     * Reverses the play direction of the Animation, this preserves the current frame
     */
    reverse(): void;
    /**
     * Returns the current play direction of the animation
     */
    get direction(): AnimationDirection;
    /**
     * Plays or resumes the animation from the current frame
     */
    play(): void;
    /**
     * Pauses the animation on the current frame
     */
    pause(): void;
    /**
     * Reset the animation back to the beginning, including if the animation were done
     */
    reset(): void;
    /**
     * Returns `true` if the animation can end
     */
    get canFinish(): boolean;
    /**
     * Returns `true` if the animation is done, for looping type animations
     * `ex.AnimationStrategy.PingPong` and `ex.AnimationStrategy.Loop` this will always return `false`
     *
     * See the `ex.Animation.canFinish()` method to know if an animation type can end
     */
    get done(): boolean;
    /**
     * Jump the animation immediately to a specific frame if it exists
     *
     * Optionally specify an override for the duration of the frame, useful for
     * keeping multiple animations in sync with one another.
     * @param frameNumber
     * @param duration
     */
    goToFrame(frameNumber: number, duration?: number): void;
    private _nextFrame;
    /**
     * Called internally by Excalibur to update the state of the animation potential update the current frame
     * @param elapsed Milliseconds elapsed
     * @param idempotencyToken Prevents double ticking in a frame by passing a unique token to the frame
     */
    tick(elapsed: number, idempotencyToken?: number): void;
    protected _drawImage(ctx: ExcaliburGraphicsContext, x: number, y: number): void;
}

interface GraphicsGroupingOptions {
    members: (GraphicsGrouping | Graphic)[];
    /**
     * Default true, GraphicsGroup will use the anchor to position all the graphics based on their combined bounds
     *
     * Setting to false will ignore anchoring from parent components and position the top left of all graphics at the actor's position,
     * positioning graphics in the group is done with the `offset` property.
     */
    useAnchor?: boolean;
}
interface GraphicsGrouping {
    offset: Vector;
    graphic: Graphic;
    /**
     * Optionally disable this graphics bounds as part of group calculation, default true
     * if unspecified
     *
     * You may want disable this if you're using text because their bounds will affect
     * the centering of the whole group.
     *
     * **WARNING** having inaccurate bounds can cause offscreen culling issues.
     */
    useBounds?: boolean;
}
declare class GraphicsGroup extends Graphic implements HasTick {
    private _logger;
    useAnchor: boolean;
    members: (GraphicsGrouping | Graphic)[];
    constructor(options: GraphicsGroupingOptions & GraphicOptions);
    clone(): GraphicsGroup;
    private _updateDimensions;
    get localBounds(): BoundingBox;
    private _isAnimationOrGroup;
    tick(elapsed: number, idempotencyToken?: number): void;
    reset(): void;
    protected _preDraw(ex: ExcaliburGraphicsContext, x: number, y: number): void;
    protected _drawImage(ex: ExcaliburGraphicsContext, x: number, y: number): void;
}

interface LineOptions {
    start: Vector;
    end: Vector;
    color?: Color;
    thickness?: number;
}
declare class Line extends Graphic {
    readonly start: Vector;
    readonly end: Vector;
    color: Color;
    thickness: number;
    private _localBounds;
    constructor(options: LineOptions);
    get localBounds(): BoundingBox;
    private _calculateBounds;
    protected _drawImage(ctx: ExcaliburGraphicsContext, _x: number, _y: number): void;
    clone(): Line;
}

/**
 * Provide arbitrary drawing for the purposes of debugging your game
 *
 * Will only show when the Engine is set to debug mode {@apilink Engine.showDebug} or {@apilink Engine.toggleDebug}
 *
 */
declare class DebugGraphicsComponent extends Component {
    draw: (ctx: ExcaliburGraphicsContext, debugFlags: DebugConfig) => void;
    useTransform: boolean;
    constructor(draw: (ctx: ExcaliburGraphicsContext, debugFlags: DebugConfig) => void, useTransform?: boolean);
}

declare class GraphicsSystem extends System {
    world: World;
    static priority: 0;
    readonly systemType = SystemType.Draw;
    private _token;
    private _graphicsContext;
    private _camera;
    private _engine;
    private _sortedTransforms;
    query: Query<typeof TransformComponent | typeof GraphicsComponent>;
    get sortedTransforms(): TransformComponent[];
    constructor(world: World);
    initialize(world: World, scene: Scene): void;
    private _zHasChanged;
    private _zIndexUpdate;
    preupdate(): void;
    update(elapsed: number): void;
    private _drawGraphicsComponent;
    private _targetInterpolationTransform;
    /**
     * This applies the current entity transform to the graphics context
     * @param entity
     */
    private _applyTransform;
    private _applyOpacity;
}

declare class OffscreenSystem extends System {
    world: World;
    static priority: number;
    systemType: SystemType;
    private _camera;
    private _screen;
    private _worldBounds;
    query: Query<typeof TransformComponent | typeof GraphicsComponent>;
    constructor(world: World);
    initialize(world: World, scene: Scene): void;
    update(): void;
    private _isOffscreen;
}

declare class ParallaxComponent extends Component {
    parallaxFactor: Vector;
    constructor(parallaxFactor?: Vector);
}

interface RasterOptions extends GraphicOptions {
    /**
     * Optionally specify a quality number, which is how much to scale the internal Raster. Default is 1.
     *
     * For example if the quality is set to 2, it doubles the internal raster bitmap in memory.
     *
     * Adjusting this value can be useful if you are working with small rasters.
     */
    quality?: number;
    /**
     * Optionally specify "smoothing" if you want antialiasing to apply to the raster's bitmap context, by default `false`
     */
    smoothing?: boolean;
    /**
     * Optionally specify the color of the raster's bitmap context, by default {@apilink Color.Black}
     */
    color?: Color;
    /**
     * Optionally specify the stroke color of the raster's bitmap context, by default undefined
     */
    strokeColor?: Color;
    /**
     * Optionally specify the line width of the raster's bitmap, by default 1 pixel
     */
    lineWidth?: number;
    /**
     * Optionally specify the line dash of the raster's bitmap, by default `[]` which means none
     */
    lineDash?: number[];
    /**
     * Optionally specify the line end style, default is "butt".
     */
    lineCap?: 'butt' | 'round' | 'square';
    /**
     * Optionally specify the padding to apply to the bitmap
     */
    padding?: number;
    /**
     * Optionally specify what image filtering mode should be used, {@apilink ImageFiltering.Pixel} for pixel art,
     * {@apilink ImageFiltering.Blended} for hi-res art
     *
     * By default unset, rasters defer to the engine antialiasing setting
     */
    filtering?: ImageFiltering;
}
/**
 * A Raster is a Graphic that needs to be first painted to a HTMLCanvasElement before it can be drawn to the
 * {@apilink ExcaliburGraphicsContext}. This is useful for generating custom images using the 2D canvas api.
 *
 * Implementors must implement the {@apilink Raster.execute} method to rasterize their drawing.
 */
declare abstract class Raster extends Graphic {
    filtering?: ImageFiltering;
    lineCap: 'butt' | 'round' | 'square';
    quality: number;
    _bitmap: HTMLCanvasElement;
    protected _ctx: CanvasRenderingContext2D;
    private _dirty;
    constructor(options?: RasterOptions);
    cloneRasterOptions(): RasterOptions;
    /**
     * Gets whether the graphic is dirty, this means there are changes that haven't been re-rasterized
     */
    get dirty(): boolean;
    /**
     * Flags the graphic as dirty, meaning it must be re-rasterized before draw.
     * This should be called any time the graphics state changes such that it affects the outputted drawing
     */
    flagDirty(): void;
    private _originalWidth?;
    /**
     * Gets or sets the current width of the Raster graphic. Setting the width will cause the raster
     * to be flagged dirty causing a re-raster on the next draw.
     *
     * Any `padding`s or `quality` set will be factored into the width
     */
    get width(): number;
    set width(value: number);
    private _originalHeight?;
    /**
     * Gets or sets the current height of the Raster graphic. Setting the height will cause the raster
     * to be flagged dirty causing a re-raster on the next draw.
     *
     * Any `padding` or `quality` set will be factored into the height
     */
    get height(): number;
    set height(value: number);
    private _getTotalWidth;
    private _getTotalHeight;
    /**
     * Returns the local bounds of the Raster including the padding
     */
    get localBounds(): BoundingBox;
    private _smoothing;
    /**
     * Gets or sets the smoothing (anti-aliasing of the graphic). Setting the height will cause the raster
     * to be flagged dirty causing a re-raster on the next draw.
     */
    get smoothing(): boolean;
    set smoothing(value: boolean);
    private _color;
    /**
     * Gets or sets the fillStyle of the Raster graphic. Setting the fillStyle will cause the raster to be
     * flagged dirty causing a re-raster on the next draw.
     */
    get color(): Color;
    set color(value: Color);
    private _strokeColor;
    /**
     * Gets or sets the strokeStyle of the Raster graphic. Setting the strokeStyle will cause the raster to be
     * flagged dirty causing a re-raster on the next draw.
     */
    get strokeColor(): Color | undefined;
    set strokeColor(value: Color | undefined);
    private _lineWidth;
    /**
     * Gets or sets the line width of the Raster graphic. Setting the lineWidth will cause the raster to be
     * flagged dirty causing a re-raster on the next draw.
     */
    get lineWidth(): number;
    set lineWidth(value: number);
    private _lineDash;
    get lineDash(): number[];
    set lineDash(value: number[]);
    private _padding;
    get padding(): number;
    set padding(value: number);
    /**
     * Rasterize the graphic to a bitmap making it usable as in excalibur. Rasterize is called automatically if
     * the graphic is {@apilink Raster.dirty} on the next {@apilink Graphic.draw} call
     */
    rasterize(): void;
    protected _applyRasterProperties(ctx: CanvasRenderingContext2D): void;
    protected _drawImage(ex: ExcaliburGraphicsContext, x: number, y: number): void;
    /**
     * Executes drawing implementation of the graphic, this is where the specific drawing code for the graphic
     * should be implemented. Once `rasterize()` the graphic can be drawn to the {@apilink ExcaliburGraphicsContext} via `draw(...)`
     * @param ctx Canvas to draw the graphic to
     */
    abstract execute(ctx: CanvasRenderingContext2D): void;
}

interface CircleOptions {
    radius: number;
}
/**
 * A circle {@apilink Graphic} for drawing circles to the {@apilink ExcaliburGraphicsContext}
 *
 * Circles default to {@apilink ImageFiltering.Blended}
 */
declare class Circle extends Raster {
    private _radius;
    get radius(): number;
    set radius(value: number);
    constructor(options: RasterOptions & CircleOptions);
    clone(): Circle;
    execute(ctx: CanvasRenderingContext2D): void;
}

interface RectangleOptions {
    width: number;
    height: number;
}
/**
 * A Rectangle {@apilink Graphic} for drawing rectangles to the {@apilink ExcaliburGraphicsContext}
 */
declare class Rectangle extends Raster {
    constructor(options: RasterOptions & RectangleOptions);
    clone(): Rectangle;
    execute(ctx: CanvasRenderingContext2D): void;
}

interface PolygonOptions {
    points: Vector[];
}
/**
 * A polygon {@apilink Graphic} for drawing arbitrary polygons to the {@apilink ExcaliburGraphicsContext}
 *
 * Polygons default to {@apilink ImageFiltering.Blended}
 */
declare class Polygon extends Raster {
    private _points;
    get points(): Vector[];
    set points(points: Vector[]);
    get minPoint(): Vector;
    constructor(options: RasterOptions & PolygonOptions);
    clone(): Polygon;
    execute(ctx: CanvasRenderingContext2D): void;
}

/**
 * Enum representing the different font size units
 * https://developer.mozilla.org/en-US/docs/Web/CSS/font-size
 */
declare enum FontUnit {
    /**
     * Em is a scalable unit, 1 em is equal to the current font size of the current element, parent elements can effect em values
     */
    Em = "em",
    /**
     * Rem is similar to the Em, it is a scalable unit. 1 rem is equal to the font size of the root element
     */
    Rem = "rem",
    /**
     * Pixel is a unit of length in screen pixels
     */
    Px = "px",
    /**
     * Point is a physical unit length (1/72 of an inch)
     */
    Pt = "pt",
    /**
     * Percent is a scalable unit similar to Em, the only difference is the Em units scale faster when Text-Size stuff
     */
    Percent = "%"
}
/**
 * Enum representing the different horizontal text alignments
 */
declare enum TextAlign {
    /**
     * The text is left-aligned.
     */
    Left = "left",
    /**
     * The text is right-aligned.
     */
    Right = "right",
    /**
     * The text is centered.
     */
    Center = "center",
    /**
     * The text is aligned at the normal start of the line (left-aligned for left-to-right locales,
     * right-aligned for right-to-left locales).
     */
    Start = "start",
    /**
     * The text is aligned at the normal end of the line (right-aligned for left-to-right locales,
     * left-aligned for right-to-left locales).
     */
    End = "end"
}
/**
 * Enum representing the different baseline text alignments
 */
declare enum BaseAlign {
    /**
     * The text baseline is the top of the em square.
     */
    Top = "top",
    /**
     * The text baseline is the hanging baseline.  Currently unsupported; this will act like
     * alphabetic.
     */
    Hanging = "hanging",
    /**
     * The text baseline is the middle of the em square.
     */
    Middle = "middle",
    /**
     * The text baseline is the normal alphabetic baseline.
     */
    Alphabetic = "alphabetic",
    /**
     * The text baseline is the ideographic baseline; this is the bottom of
     * the body of the characters, if the main body of characters protrudes
     * beneath the alphabetic baseline.  Currently unsupported; this will
     * act like alphabetic.
     */
    Ideographic = "ideographic",
    /**
     * The text baseline is the bottom of the bounding box.  This differs
     * from the ideographic baseline in that the ideographic baseline
     * doesn't consider descenders.
     */
    Bottom = "bottom"
}
/**
 * Enum representing the different possible font styles
 */
declare enum FontStyle {
    Normal = "normal",
    Italic = "italic",
    Oblique = "oblique"
}
/**
 * Enum representing the text direction, useful for other languages, or writing text in reverse
 */
declare enum Direction {
    LeftToRight = "ltr",
    RightToLeft = "rtl"
}
/**
 * Font rendering option
 */
interface FontOptions {
    /**
     * Optionally the size of the font in the specified {@apilink FontUnit} by default 10.
     */
    size?: number;
    /**
     * Optionally specify unit to measure fonts in, by default Pixels
     */
    unit?: FontUnit;
    /**
     * Optionally specify the font family, by default 'sans-serif'
     */
    family?: string;
    /**
     * Optionally specify the font style, by default Normal
     */
    style?: FontStyle;
    /**
     * Optionally set whether the font is bold, by default false
     */
    bold?: boolean;
    /**
     * Optionally specify the text align, by default Left
     */
    textAlign?: TextAlign;
    /**
     * Optionally specify the text base align, by default Alphabetic
     */
    baseAlign?: BaseAlign;
    /**
     * Optionally specify the text direction, by default LeftToRight
     */
    direction?: Direction;
    /**
     * Optionally override the text line height in pixels, useful for multiline text. If unset will use default.
     */
    lineHeight?: number | undefined;
    /**
     * Optionally specify the quality of the text bitmap, it is a multiplier on the size size, by default 2.
     * Higher quality text has a higher memory impact
     */
    quality?: number;
    /**
     * Optionally specify a text shadow, by default none is specified
     */
    shadow?: {
        blur?: number;
        offset?: Vector;
        color?: Color;
    };
}
/**
 * @internal
 */
interface FontRenderer {
    measureText(text: string): BoundingBox;
    render(ex: ExcaliburGraphicsContext, text: string, color: Color, x: number, y: number): void;
}

interface SpriteFontOptions {
    /**
     * Alphabet string in spritesheet order (default is row column order)
     * example: 'abcdefghijklmnopqrstuvwxyz'
     */
    alphabet: string;
    /**
     * {@apilink SpriteSheet} to source character sprites from
     */
    spriteSheet: SpriteSheet;
    /**
     * Optionally ignore case in the supplied text;
     */
    caseInsensitive?: boolean;
    /**
     * Optionally override the text line height, useful for multiline text. If unset will use default.
     */
    lineHeight?: number | undefined;
    /**
     * Optionally adjust the spacing between character sprites
     */
    spacing?: number;
    /**
     * Optionally specify a "shadow"
     */
    shadow?: {
        offset: Vector;
    };
}
declare class SpriteFont extends Graphic implements FontRenderer {
    private _text;
    alphabet: string;
    spriteSheet: SpriteSheet;
    shadow?: {
        offset: Vector;
    };
    caseInsensitive: boolean;
    spacing: number;
    lineHeight: number | undefined;
    private _logger;
    constructor(options: SpriteFontOptions & GraphicOptions);
    private _getCharacterSprites;
    measureText(text: string, maxWidth?: number): BoundingBox;
    protected _drawImage(ex: ExcaliburGraphicsContext, x: number, y: number, maxWidth?: number): void;
    render(ex: ExcaliburGraphicsContext, text: string, _color: any, x: number, y: number, maxWidth?: number): void;
    clone(): SpriteFont;
    /**
     * Return array of lines split based on the \n character, and the maxWidth? constraint
     * @param text
     * @param maxWidth
     */
    private _cachedText?;
    private _cachedLines?;
    private _cachedRenderWidth?;
    private _getLinesFromText;
}

/**
 * Represents a system or web font in Excalibur
 *
 * If no options specified, the system sans-serif 10 pixel is used
 *
 * If loading a custom web font be sure to have the font loaded before you use it https://erikonarheim.com/posts/dont-test-fonts/
 */
declare class Font extends Graphic implements FontRenderer {
    /**
     * Set the font filtering mode, by default set to {@apilink ImageFiltering.Blended} regardless of the engine default smoothing
     *
     * If you have a pixel style font that may be a reason to switch this to {@apilink ImageFiltering.Pixel}
     */
    filtering: ImageFiltering;
    constructor(options?: FontOptions & GraphicOptions & RasterOptions);
    clone(): Font;
    /**
     * Font quality determines the size of the underlying raster text, higher quality means less jagged edges.
     * If quality is set to 1, then just enough raster bitmap is generated to render the text.
     *
     * You can think of quality as how zoomed in to the text you can get before seeing jagged edges.
     *
     * (Default 2)
     */
    quality: number;
    padding: number;
    smoothing: boolean;
    lineWidth: number;
    lineDash: number[];
    color: Color;
    strokeColor?: Color;
    family: string;
    style: FontStyle;
    bold: boolean;
    unit: FontUnit;
    textAlign: TextAlign;
    baseAlign: BaseAlign;
    direction: Direction;
    /**
     * Font line height in pixels, default line height if unset
     */
    lineHeight: number | undefined;
    size: number;
    shadow?: {
        blur?: number;
        offset?: Vector;
        color?: Color;
    };
    get fontString(): string;
    private _textBounds;
    get localBounds(): BoundingBox;
    protected _drawImage(_ex: ExcaliburGraphicsContext, _x: number, _y: number): void;
    protected _rotate(ex: ExcaliburGraphicsContext): void;
    protected _flip(ex: ExcaliburGraphicsContext): void;
    private _textMeasurement;
    measureTextWithoutCache(text: string, maxWidth?: number): BoundingBox;
    /**
     * Returns a BoundingBox that is the total size of the text including multiple lines
     *
     * Does not include any padding or adjustment
     * @param text
     * @returns BoundingBox
     */
    measureText(text: string, maxWidth?: number): BoundingBox;
    protected _postDraw(ex: ExcaliburGraphicsContext): void;
    render(ex: ExcaliburGraphicsContext, text: string, colorOverride: Color, x: number, y: number, maxWidth?: number): void;
}

interface TextOptions {
    /**
     * Text to draw
     */
    text: string;
    /**
     * Optionally override the font color, currently unsupported by SpriteFont
     */
    color?: Color;
    /**
     * Optionally specify a font, if none specified a default font is used (System sans-serif 10 pixel)
     */
    font?: Font | SpriteFont;
    /**
     * Optionally specify a maximum width in pixels for our text, and wrap to the next line if needed.
     */
    maxWidth?: number;
}
/**
 * Represent Text graphics in excalibur
 *
 * Useful for in game labels, ui, or overlays
 */
declare class Text extends Graphic {
    color?: Color;
    maxWidth?: number;
    constructor(options: TextOptions & GraphicOptions);
    clone(): Text;
    private _text;
    get text(): string;
    set text(value: string);
    private _font;
    get font(): Font | SpriteFont;
    set font(font: Font | SpriteFont);
    private _textWidth;
    get width(): number;
    private _textHeight;
    get height(): number;
    private _calculateDimension;
    get localBounds(): BoundingBox;
    protected _rotate(_ex: ExcaliburGraphicsContext): void;
    protected _flip(_ex: ExcaliburGraphicsContext): void;
    protected _preDraw(ex: ExcaliburGraphicsContext, x: number, y: number): void;
    protected _drawImage(ex: ExcaliburGraphicsContext, x: number, y: number): void;
}

declare class FontTextInstance {
    readonly font: Font;
    readonly text: string;
    readonly color: Color;
    readonly maxWidth?: number;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    private _textFragments;
    dimensions: BoundingBox;
    disposed: boolean;
    private _lastHashCode;
    constructor(font: Font, text: string, color: Color, maxWidth?: number);
    measureText(text: string, maxWidth?: number): BoundingBox;
    private _setDimension;
    static getHashCode(font: Font, text: string, color?: Color): string;
    getHashCode(includeColor?: boolean): string;
    protected _applyRasterProperties(ctx: CanvasRenderingContext2D): void;
    private _applyFont;
    private _drawText;
    private _splitTextBitmap;
    flagDirty(): void;
    private _dirty;
    private _ex?;
    render(ex: ExcaliburGraphicsContext, x: number, y: number, maxWidth?: number): void;
    dispose(): void;
    /**
     * Return array of lines split based on the \n character, and the maxWidth? constraint
     * @param text
     * @param maxWidth
     */
    private _cachedText?;
    private _cachedLines?;
    private _cachedRenderWidth?;
    private _getLinesFromText;
}

declare class FontCache {
    static FONT_TIMEOUT: number;
    private static _LOGGER;
    private static _TEXT_USAGE;
    private static _TEXT_CACHE;
    private static _MEASURE_CACHE;
    static measureText(text: string, font: Font, maxWidth?: number): BoundingBox;
    static getTextInstance(text: string, font: Font, color: Color): FontTextInstance;
    static checkAndClearCache(): void;
    static get cacheSize(): number;
    /**
     * Force clear all cached text bitmaps
     */
    static clearCache(): void;
}

interface CanvasOptions {
    draw?: (ctx: CanvasRenderingContext2D) => void;
    cache?: boolean;
}
/**
 * A canvas {@apilink Graphic} to provide an adapter between the 2D Canvas API and the {@apilink ExcaliburGraphicsContext}.
 *
 * The {@apilink Canvas} works by re-rastering a draw handler to a HTMLCanvasElement for every draw which is then passed
 * to the {@apilink ExcaliburGraphicsContext} implementation as a rendered image.
 *
 * **Low performance API**
 */
declare class Canvas extends Raster {
    private _options;
    /**
     * Return the 2D graphics context of this canvas
     */
    get ctx(): CanvasRenderingContext2D;
    constructor(_options?: GraphicOptions & RasterOptions & CanvasOptions);
    clone(): Canvas;
    execute(ctx: CanvasRenderingContext2D): void;
}

/**
 * Nine slice stretch mode
 */
declare enum NineSliceStretch {
    /**
     * Stretch the image across a dimension
     */
    Stretch = "stretch",
    /**
     * Tile the image across a dimension
     */
    Tile = "tile",
    /**
     * Tile the image across a dimension but only by whole image amounts
     */
    TileFit = "tile-fit"
}
type NineSliceConfig = GraphicOptions & {
    /**
     * Final width of the nine slice graphic
     */
    width: number;
    /**
     * Final height of the nine slice graphic
     */
    height: number;
    /**
     *  Image source that's loaded from a Loader or individually
     *
     */
    source: ImageSource;
    /**
     *  Configuration for the source
     *
     *  Details for the source image, including:
     *
     *  width and height as numbers of the source image
     *
     *  and the 9 slice margins
     */
    sourceConfig: {
        width: number;
        height: number;
        topMargin: number;
        leftMargin: number;
        bottomMargin: number;
        rightMargin: number;
    };
    /**
     *  Configuration for the destination
     *
     *  Details for the destination image, including:
     *
     *  stretching strategies for horizontal and vertical stretching
     *
     *  and flag for drawing the center tile if desired
     */
    destinationConfig: {
        /**
         * Draw the center part of the nine slice, if false it's a completely transparent gap
         */
        drawCenter: boolean;
        /**
         * Horizontal stretch configuration
         */
        horizontalStretch: NineSliceStretch;
        /**
         * Vertical stretch configuration
         */
        verticalStretch: NineSliceStretch;
    };
};
declare class NineSlice extends Graphic {
    private _imgSource;
    private _sourceSprite?;
    private _canvasA;
    private _canvasB;
    private _canvasC;
    private _canvasD;
    private _canvasE;
    private _canvasF;
    private _canvasG;
    private _canvasH;
    private _canvasI;
    private _logger;
    private _config;
    constructor(config: NineSliceConfig);
    /**
     * Sets the target width of the 9 slice (pixels), and recalculates the 9 slice if desired (auto)
     * @param newWidth
     * @param auto
     */
    setTargetWidth(newWidth: number, auto?: boolean): void;
    /**
     * Sets the target height of the 9 slice (pixels), and recalculates the 9 slice if desired (auto)
     * @param newHeight
     * @param auto
     */
    setTargetHeight(newHeight: number, auto?: boolean): void;
    /**
     *  Sets the 9 slice margins (pixels), and recalculates the 9 slice if desired (auto)
     */
    setMargins(left: number, top: number, right: number, bottom: number, auto?: boolean): void;
    /**
     *  Sets the stretching strategy for the 9 slice, and recalculates the 9 slice if desired (auto)
     *
     */
    setStretch(type: 'horizontal' | 'vertical' | 'both', stretch: NineSliceStretch, auto?: boolean): void;
    /**
     *  Returns the config of the 9 slice
     */
    getConfig(): NineSliceConfig;
    /**
     * Draws 1 of the 9 tiles based on parameters passed in
     * context is the ExcaliburGraphicsContext from the _drawImage function
     * destinationSize is the size of the destination image as a vector (width,height)
     * targetCanvas is the canvas to draw to
     * horizontalStretch and verticalStretch are the horizontal and vertical stretching strategies
     * marginW and marginH are optional margins for the 9 slice for positioning
     * @param context
     * @param targetCanvas
     * @param destinationSize
     * @param horizontalStretch
     * @param verticalStretch
     * @param marginWidth
     * @param marginHeight
     */
    protected _drawTile(context: ExcaliburGraphicsContext, targetCanvas: HTMLCanvasElement, destinationSize: Vector, horizontalStretch: NineSliceStretch, verticalStretch: NineSliceStretch, marginWidth?: number, marginHeight?: number): void;
    /**
     *  Draws the 9 slices to the canvas
     */
    protected _drawImage(ex: ExcaliburGraphicsContext, x: number, y: number): void;
    /**
     * Slices the source sprite into the 9 slice canvases internally
     */
    protected _initialize(): void;
    /**
     * Clones the 9 slice
     */
    clone(): NineSlice;
    /**
     * Returns the number of tiles
     */
    protected _getNumberOfTiles(tileSize: number, destinationSize: number, strategy: NineSliceStretch): number;
    /**
     * Returns the position and size of the tile
     */
    protected _calculateParams(tileNum: number, numTiles: number, tileSize: number, destinationSize: number, strategy: NineSliceStretch): {
        tempPosition: number;
        tempSize: number;
    };
}

interface TiledAnimationOptions {
    /**
     * Animation to tile
     */
    animation: Animation;
    /**
     * Optionally override source view on frame graphics
     */
    sourceView?: Partial<SourceView>;
    /**
     * Optionally override filtering options
     */
    filtering?: ImageFiltering;
    /**
     * Default wrapping is Repeat for TiledAnimation
     */
    wrapping?: ImageWrapConfiguration | ImageWrapping;
    /**
     * Total width in pixels for the tiling to take place
     */
    width: number;
    /**
     * Total height in pixels for the tiling to take place
     */
    height: number;
}
declare class TiledAnimation extends Animation {
    private _ready;
    ready: Promise<void>;
    private _tiledWidth;
    private _tiledHeight;
    private _sourceView;
    constructor(options: GraphicOptions & Omit<AnimationOptions, 'frames'> & TiledAnimationOptions);
    static fromAnimation(animation: Animation, options?: Omit<TiledAnimationOptions, 'animation'>): TiledAnimation;
    private _updateSourceView;
    get sourceView(): Partial<SourceView>;
    set sourceView(sourceView: Partial<SourceView>);
    private _updateWidthHeight;
    get width(): number;
    get height(): number;
    set width(width: number);
    set height(height: number);
}

type UniformDictionary = Record<string, number | boolean | Vector | Color | AffineMatrix | Float32Array | [uniformData: Float32Array, bindingPoint: number]>;
type UniformTypeNames = 'uniform1f' | 'uniform1i' | 'uniform1ui' | 'uniform2f' | 'uniform2i' | 'uniform2ui' | 'uniform3f' | 'uniform3i' | 'uniform3ui' | 'uniform4f' | 'uniform4i' | 'uniform4ui' | 'uniform1fv' | 'uniform1iv' | 'uniform1uiv' | 'uniform2fv' | 'uniform2iv' | 'uniform2uiv' | 'uniform3fv' | 'uniform3iv' | 'uniform3uiv' | 'uniform4fv' | 'uniform4iv' | 'uniform4uiv' | 'uniformMatrix2fv' | 'uniformMatrix2x3fv' | 'uniformMatrix2x4fv' | 'uniformMatrix3fv' | 'uniformMatrix3x2fv' | 'uniformMatrix3x4fv' | 'uniformMatrix4fv' | 'uniformMatrix4x2fv' | 'uniformMatrix4x3fv';
/**
 *
 */
declare function glTypeToUniformTypeName(gl: WebGL2RenderingContext, glType: number): UniformTypeNames;
type RemoveFirstFromTuple<T extends any[]> = T['length'] extends 0 ? [] : ((...b: T) => void) extends (a: any, ...b: infer I) => void ? I : [];
type UniformParameters<TUniformType extends UniformTypeNames> = RemoveFirstFromTuple<Parameters<WebGL2RenderingContext[TUniformType]>>;
interface UniformDefinition {
    name: string;
    glType: number;
    location: WebGLUniformLocation;
}
interface VertexAttributeDefinition {
    /**
     * string name of the attribute in the shader program, commonly `a_nameofmyvariable`
     */
    name: string;
    /**
     * Number of components for a given attribute
     * Must be 1, 2, 3, or 4
     *
     * For example a vec4 attribute would be `4` floats, so 4
     */
    size: number;
    /**
     * Supported types in webgl 1
     * * gl.BYTE
     * * gl.SHORT
     * * gl.UNSIGNED_BYTE
     * * gl.UNSIGNED_SHORT
     * * gl.FLOAT
     * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer
     */
    glType: number;
    /**
     * Is the attribute normalized between (0-1)
     */
    normalized: boolean;
    /**
     * Location index in the shader program
     */
    location: number;
}
interface ShaderOptions {
    /**
     * ExcaliburGraphicsContextWebGL this layout will be attached to, these cannot be reused across webgl contexts.
     */
    graphicsContext: ExcaliburGraphicsContext;
    /**
     * Optionally provide a name for the shader (useful for debugging purposes)
     */
    name?: string;
    /**
     * Vertex shader source code in glsl #version 300 es
     */
    vertexSource: string;
    /**
     * Fragment shader source code in glsl #version 300 es
     */
    fragmentSource: string;
    /**
     * Set initial uniforms
     */
    uniforms?: UniformDictionary;
    /**
     * Set initial images as uniform sampler2D
     */
    images?: Record<string, ImageSource>;
    /**
     * Optionally set the starting texture slot, default 0
     */
    startingTextureSlot?: number;
    /**
     * Callback to fire directly before linking the program
     */
    onPreLink?: (program: WebGLProgram) => void;
    /**
     * Callback to fire directly after the progam has finished compiling
     */
    onPostCompile?: (shader: Shader) => void;
}
declare class Shader {
    readonly name: string;
    readonly vertexSource: string;
    readonly fragmentSource: string;
    private static _ACTIVE_SHADER_INSTANCE;
    private _logger;
    private _gl;
    private _textureLoader;
    private _textures;
    program: WebGLProgram;
    attributes: {
        [variableName: string]: VertexAttributeDefinition;
    };
    private _uniforms;
    private _uniformBuffers;
    private _compiled;
    private _onPreLink?;
    private _onPostCompile?;
    private _dirtyUniforms;
    private _maxTextureSlots;
    private _startingTextureSlot;
    /**
     * Flags uniforms need to be re-uploaded on the next call to .use()
     */
    flagUniformsDirty(): void;
    /**
     * Set uniforms key value pairs
     */
    uniforms: UniformDictionary;
    /**
     * Set images to load into the shader as a sampler2d
     */
    images: Record<string, ImageSource>;
    /**
     * Returns whether the shader is compiled
     */
    get compiled(): boolean;
    /**
     * Create a shader program in excalibur
     * @param options specify shader vertex and fragment source
     */
    constructor(options: ShaderOptions);
    /**
     * Deletes the webgl program from the gpu
     */
    dispose(): void;
    /**
     * Binds the shader program
     */
    use(): void;
    unuse(): void;
    isCurrentlyBound(): boolean;
    private _setUniforms;
    private _loadImageSource;
    _setImages(suppressWarning?: boolean): void;
    /**
     * Compile the current shader against a webgl context
     */
    compile(): WebGLProgram;
    /**
     * Get's the uniform definitons
     */
    getUniformDefinitions(): UniformDefinition[];
    getAttributeDefinitions(): VertexAttributeDefinition[];
    addImageSource(samplerName: string, image: ImageSource): void;
    removeImageSource(samplerName: string): void;
    /**
     * Set a texture in a gpu texture slot
     * @param slotNumber
     * @param texture
     */
    setTexture(slotNumber: number, texture: WebGLTexture): void;
    /**
     * Set a uniform buffer block with a Float32Array
     * @param name The of the binding block
     * @param data Float32Array
     * @param [bindingPoint]
     */
    setUniformBuffer(name: string, data: Float32Array, bindingPoint?: number): void;
    trySetUniformBuffer(name: string, data: Float32Array, bindingPoint?: number): boolean;
    /**
     * Set an integer uniform for the current shader
     *
     * **Important** Must call ex.Shader.use() before setting a uniform!
     * @param name
     * @param value
     */
    setUniformInt(name: string, value: number): void;
    /**
     * Set an integer uniform for the current shader, WILL NOT THROW on error.
     *
     * **Important** Must call ex.Shader.use() before setting a uniform!
     * @param name
     * @param value
     */
    trySetUniformInt(name: string, value: number): boolean;
    /**
     * Set an integer array uniform for the current shader
     *
     * **Important** Must call ex.Shader.use() before setting a uniform!
     * @param name
     * @param value
     */
    setUniformIntArray(name: string, value: number[]): void;
    /**
     * Set an integer array uniform for the current shader, WILL NOT THROW on error.
     *
     * **Important** Must call ex.Shader.use() before setting a uniform!
     * @param name
     * @param value
     */
    trySetUniformIntArray(name: string, value: number[]): boolean;
    /**
     * Set a boolean uniform for the current shader
     *
     * **Important** Must call ex.Shader.use() before setting a uniform!
     * @param name
     * @param value
     */
    setUniformBoolean(name: string, value: boolean): void;
    /**
     * Set a boolean uniform for the current shader, WILL NOT THROW on error.
     *
     * **Important** Must call ex.Shader.use() before setting a uniform!
     * @param name
     * @param value
     */
    trySetUniformBoolean(name: string, value: boolean): boolean;
    /**
     * Set a float uniform for the current shader
     *
     * **Important** Must call ex.Shader.use() before setting a uniform!
     * @param name
     * @param value
     */
    setUniformFloat(name: string, value: number): void;
    /**
     * Set a float uniform for the current shader, WILL NOT THROW on error.
     *
     * **Important** Must call ex.Shader.use() before setting a uniform!
     * @param name
     * @param value
     */
    trySetUniformFloat(name: string, value: number): boolean;
    /**
     * Set a float array uniform for the current shader
     *
     * **Important** Must call ex.Shader.use() before setting a uniform!
     * @param name
     * @param value
     */
    setUniformFloatArray(name: string, value: number[]): void;
    /**
     * Set a float array uniform for the current shader, WILL NOT THROW on error.
     *
     * **Important** Must call ex.Shader.use() before setting a uniform!
     * @param name
     * @param value
     */
    trySetUniformFloatArray(name: string, value: number[]): boolean;
    /**
     * Set a {@apilink Vector} uniform for the current shader
     *
     * **Important** Must call ex.Shader.use() before setting a uniform!
     * @param name
     * @param value
     */
    setUniformFloatVector(name: string, value: Vector): void;
    /**
     * Set a {@apilink Vector} uniform for the current shader, WILL NOT THROW on error.
     *
     * **Important** Must call ex.Shader.use() before setting a uniform!
     * @param name
     * @param value
     */
    trySetUniformFloatVector(name: string, value: Vector): boolean;
    /**
     * Set a {@apilink Color} uniform for the current shader
     *
     * **Important** Must call ex.Shader.use() before setting a uniform!
     * @param name
     * @param value
     */
    setUniformFloatColor(name: string, value: Color): void;
    /**
     * Set a {@apilink Color} uniform for the current shader, WILL NOT THROW on error.
     *
     * **Important** Must call ex.Shader.use() before setting a uniform!
     * @param name
     * @param value
     */
    trySetUniformFloatColor(name: string, value: Color): boolean;
    /**
     * Set an {@apilink Matrix} uniform for the current shader
     *
     * **Important** Must call ex.Shader.use() before setting a uniform!
     * @param name
     * @param value
     */
    setUniformMatrix(name: string, value: Matrix): void;
    setUniformAffineMatrix(name: string, value: AffineMatrix): void;
    /**
     * Set an {@apilink Matrix} uniform for the current shader, WILL NOT THROW on error.
     *
     * **Important** Must call ex.Shader.use() before setting a uniform!
     * @param name
     * @param value
     */
    trySetUniformMatrix(name: string, value: Matrix): boolean;
    /**
     * Set any available uniform type in webgl
     *
     * For example setUniform('uniformMatrix2fv', 'u_my2x2_mat`, ...);
     */
    setUniform<TUniformType extends UniformTypeNames>(uniformType: TUniformType, name: string, ...value: UniformParameters<TUniformType>): void;
    /**
     * Set any available uniform type in webgl. Will try to set the uniform, will return false if the uniform didn't exist,
     * true if it was set.
     *
     * WILL NOT THROW on error
     *
     * For example setUniform('uniformMatrix2fv', 'u_my2x2_mat`, ...);
     *
     */
    trySetUniform<TUniformType extends UniformTypeNames>(uniformType: TUniformType, name: string, ...value: UniformParameters<TUniformType>): boolean;
    private _createProgram;
    private _compileShader;
    private _processSourceForError;
}

interface VertexBufferOptions {
    /**
     * WebGL2RenderingContext this layout will be attached to, these cannot be reused across contexts.
     */
    gl: WebGL2RenderingContext;
    /**
     * Size in number of floats, so [4.2, 4.0, 2.1] is size = 3
     *
     * Ignored if data is passed directly
     */
    size?: number;
    /**
     * If the vertices never change switching 'static' can be more efficient on the gpu
     *
     * Default is 'dynamic'
     */
    type?: 'static' | 'dynamic';
    /**
     * Optionally pass pre-seeded data, size parameter is ignored
     */
    data?: Float32Array;
}
/**
 * Helper around vertex buffer to simplify creating and uploading geometry
 *
 * Under the hood uses Float32Array
 */
declare class VertexBuffer {
    private _gl;
    /**
     * Access to the webgl buffer handle
     */
    readonly buffer: WebGLBuffer;
    /**
     * Access to the raw data of the vertex buffer
     */
    readonly bufferData: Float32Array;
    /**
     * If the vertices never change switching 'static' can be more efficient on the gpu
     *
     * Default is 'dynamic'
     */
    type: 'static' | 'dynamic';
    constructor(options: VertexBufferOptions);
    /**
     * Bind this vertex buffer
     */
    bind(): void;
    unbind(): void;
    /**
     * Upload vertex buffer geometry to the GPU
     */
    upload(count?: number): void;
    dispose(): void;
}

interface VertexLayoutOptions {
    /**
     * WebGL2RenderingContext this layout will be attached to, these cannot be reused across contexts.
     */
    gl: WebGL2RenderingContext;
    /**
     * Shader that this layout will be for, if null you must set a shader before using it.
     */
    shader?: Shader;
    /**
     * Vertex buffer to use for vertex data
     */
    vertexBuffer: VertexBuffer;
    /**
     * Starting index for the attribute pointer
     */
    attributePointerStartIndex?: number;
    /**
     * Specify the attributes that will exist in the vertex buffer
     *
     * **Important** must specify them in the order that they will be in the vertex buffer!!
     */
    attributes: [name: string, numberOfComponents: number, type?: 'int' | 'matrix' | 'float'][];
    /**
     * Optionally suppress any warnings out of vertex layouts
     *
     * **BEWARE** this may cause you to have issues go unnoticed
     */
    suppressWarnings?: boolean;
}
/**
 * Helper around creating vertex attributes in a given {@apilink VertexBuffer}, this is useful for describing
 * the memory layout for your vertices inside a particular buffer
 *
 * Note: This helper assumes interleaved attributes in one {@apilink VertexBuffer}, not many.
 *
 * Working with `gl.vertexAttribPointer` can be tricky, and this attempts to double check you
 */
declare class VertexLayout {
    private _gl;
    private _logger;
    private _suppressWarnings;
    private _shader;
    private _layout;
    private _attributes;
    private _vertexBuffer;
    private _vao;
    get vertexBuffer(): VertexBuffer;
    get attributes(): readonly [name: string, numberOfComponents: number, type?: 'int' | 'matrix' | 'float'][];
    constructor(options: VertexLayoutOptions);
    private _vertexTotalSizeBytes;
    /**
     * Total number of bytes that the vertex will take up
     */
    get totalVertexSizeBytes(): number;
    set shader(shader: Shader);
    get shader(): Shader;
    private _initialized;
    /**
     * Layouts need shader locations and must be bound to a shader
     */
    initialize(): void;
    /**
     * Bind this layout with it's associated vertex buffer
     * @param uploadBuffer Optionally indicate you wish to upload the buffer to the GPU associated with this layout
     */
    use(uploadBuffer?: boolean, count?: number): void;
}

declare class TransformStack {
    private _pool;
    private _transforms;
    private _currentTransform;
    save(): void;
    restore(): void;
    translate(x: number, y: number): AffineMatrix;
    rotate(angle: number): AffineMatrix;
    scale(x: number, y: number): AffineMatrix;
    reset(): void;
    set current(matrix: AffineMatrix);
    get current(): AffineMatrix;
}

interface MaterialOptions {
    /**
     * Name the material for debugging
     */
    name?: string;
    /**
     * Excalibur graphics context to create the material (only WebGL is supported at the moment)
     */
    graphicsContext?: ExcaliburGraphicsContext;
    /**
     * Optionally specify a vertex shader
     *
     * If none supplied the default will be used
     *
     * ```
     *  #version 300 es
     *  // vertex position in local space
     *  in vec2 a_position;
     *  in vec2 a_uv;
     *  out vec2 v_uv;
     *  // orthographic projection matrix
     *  uniform mat4 u_matrix;
     *  // world space transform matrix
     *  uniform mat4 u_transform;
     *  void main() {
     *    // Set the vertex position using the ortho & transform matrix
     *    gl_Position = u_matrix * u_transform * vec4(a_position, 0.0, 1.0);
     *    // Pass through the UV coord to the fragment shader
     *    v_uv = a_uv;
     *  }
     * ```
     */
    vertexSource?: string;
    /**
     * Add custom fragment shader
     *
     * *Note: Excalibur image alpha's are pre-multiplied
     *
     * Pre-built varyings:
     *
     * * `in vec2 v_uv` - UV coordinate
     * * `in vec2 v_screenuv` - UV coordinate
     *
     * Pre-built uniforms:
     *
     * * `uniform sampler2D u_graphic` - The current graphic displayed by the GraphicsComponent
     * * `uniform vec2 u_resolution` - The current resolution of the screen
     * * `uniform vec2 u_size;` - The current size of the graphic
     * * `uniform vec4 u_color` - The current color of the material
     * * `uniform float u_opacity` - The current opacity of the graphics context
     *
     */
    fragmentSource: string;
    /**
     * Add custom color, by default ex.Color.Transparent
     */
    color?: Color;
    /**
     * Add additional images to the material, you are limited by the GPU's maximum texture slots
     *
     * Specify a dictionary of uniform sampler names to ImageSource
     */
    images?: Record<string, ImageSource>;
    /**
     * Optionally set starting uniforms on a shader
     */
    uniforms?: UniformDictionary;
}
interface MaterialImageOptions {
    filtering?: ImageFiltering;
}
declare class Material {
    private _logger;
    private _name;
    private _shader;
    private _color;
    private _initialized;
    private _fragmentSource;
    private _vertexSource;
    private _images;
    private _uniforms;
    constructor(options: MaterialOptions);
    private _initialize;
    get uniforms(): UniformDictionary;
    get images(): Record<string, ImageSource>;
    get color(): Color;
    set color(c: Color);
    get name(): string;
    get isUsingScreenTexture(): boolean;
    update(callback: (shader: Shader) => any): void;
    getShader(): Shader | null;
    addImageSource(samplerName: string, image: ImageSource): void;
    removeImageSource(samplerName: string): void;
    use(): void;
}

declare class StateStack {
    private _pool;
    current: ExcaliburGraphicsContextState;
    private _states;
    private _cloneState;
    save(): void;
    restore(): void;
}

interface GarbageCollectionOptions {
    /**
     * Textures that aren't drawn after a certain number of milliseconds are unloaded from the GPU
     * Default 60_000 ms
     */
    textureCollectInterval?: number;
}
declare const DefaultGarbageCollectionOptions: GarbageCollectionOptions;
interface GarbageCollectorOptions {
    /**
     * Returns a timestamp in milliseconds representing now
     */
    getTimestamp: () => number;
}
declare class GarbageCollector {
    options: GarbageCollectorOptions;
    private _collectHandle;
    private _running;
    private _collectionMap;
    private _collectors;
    constructor(options: GarbageCollectorOptions);
    /**
     *
     * @param type Resource type
     * @param timeoutInterval If resource type exceeds interval in milliseconds collect() is called
     * @param collect Collection implementation, returns true if collected
     */
    registerCollector(type: string, timeoutInterval: number, collect: (resource: any) => boolean): void;
    /**
     * Add a resource to be tracked for collection
     * @param type
     * @param resource
     */
    addCollectableResource(type: string, resource: any): void;
    /**
     * Update the resource last used timestamp preventing collection
     * @param resource
     */
    touch(resource: any): void;
    /**
     * Runs the collection loop to cleanup any stale resources given the registered collect handlers
     */
    collectStaleResources: (deadline?: IdleDeadline) => void;
    /**
     * Force collect all resources, useful for shutting down a game
     * or if you know that you will not use anything you've allocated before now
     */
    forceCollectAll(): void;
    running(): boolean;
    /**
     * Starts the garbage collection loop
     */
    start(): void;
    /**
     * Stops the garbage collection loop
     */
    stop(): void;
}

/**
 * Manages loading image sources into webgl textures, a unique id is associated with all sources
 */
declare class TextureLoader {
    private _garbageCollector?;
    private static _LOGGER;
    constructor(gl: WebGL2RenderingContext, _garbageCollector?: {
        garbageCollector: GarbageCollector;
        collectionInterval: number;
    });
    dispose(): void;
    /**
     * Sets the default filtering for the Excalibur texture loader, default {@apilink ImageFiltering.Blended}
     */
    static filtering: ImageFiltering;
    static wrapping: ImageWrapConfiguration;
    private _gl;
    private _textureMap;
    private static _MAX_TEXTURE_SIZE;
    /**
     * Get the WebGL Texture from a source image
     * @param image
     */
    get(image: HTMLImageSource): WebGLTexture;
    /**
     * Returns whether a source image has been loaded as a texture
     * @param image
     */
    has(image: HTMLImageSource): boolean;
    /**
     * Loads a graphic into webgl and returns it's texture info, a webgl context must be previously registered
     * @param image Source graphic
     * @param options {ImageSourceOptions} Optionally configure the ImageFiltering and ImageWrapping mode to apply to the loaded texture
     * @param forceUpdate Optionally force a texture to be reloaded, useful if the source graphic has changed
     */
    load(image: HTMLImageSource, options?: ImageSourceOptions, forceUpdate?: boolean): WebGLTexture | null;
    delete(image: HTMLImageSource): void;
    /**
     * Takes an image and returns if it meets size criteria for hardware
     * @param image
     * @returns if the image will be supported at runtime
     */
    static checkImageSizeSupportedAndLog(image: HTMLImageSource): boolean;
    /**
     * Looks for textures that haven't been drawn in a while
     */
    private _collect;
}

/**
 * Interface that defines an Excalibur Renderer that can be called with .draw() in the {@apilink ExcaliburGraphicsContext}
 */
interface RendererPlugin {
    /**
     * Unique type name for this renderer plugin
     */
    readonly type: string;
    /**
     * Render priority tie breaker when drawings are at the same z index
     *
     * Lower number means higher priority and is drawn first. Higher number means lower priority and is drawn last.
     */
    priority: number;
    /**
     * Initialize your renderer
     * @param gl
     * @param context
     */
    initialize(gl: WebGL2RenderingContext, context: ExcaliburGraphicsContextWebGL): void;
    /**
     * Issue a draw command to draw something to the screen
     * @param args
     */
    draw(...args: any[]): void;
    /**
     * @returns if there are any pending draws in the renderer
     */
    hasPendingDraws(): boolean;
    /**
     * Flush any pending graphics draws to the screen
     */
    flush(): void;
    /**
     * Clear out any allocated memory
     */
    dispose(): void;
}

declare const pixelSnapEpsilon = 0.0001;
declare class ExcaliburGraphicsContextWebGLDebug implements DebugDraw {
    private _webglCtx;
    private _debugText;
    constructor(_webglCtx: ExcaliburGraphicsContextWebGL);
    /**
     * Draw a debugging rectangle to the context
     * @param x
     * @param y
     * @param width
     * @param height
     */
    drawRect(x: number, y: number, width: number, height: number, rectOptions?: RectGraphicsOptions): void;
    /**
     * Draw a debugging line to the context
     * @param start
     * @param end
     * @param lineOptions
     */
    drawLine(start: Vector, end: Vector, lineOptions?: LineGraphicsOptions): void;
    /**
     * Draw a debugging point to the context
     * @param point
     * @param pointOptions
     */
    drawPoint(point: Vector, pointOptions?: PointGraphicsOptions): void;
    drawText(text: string, pos: Vector): void;
}
interface WebGLGraphicsContextInfo {
    transform: TransformStack;
    state: StateStack;
    ortho: Matrix;
    context: ExcaliburGraphicsContextWebGL;
}
interface ExcaliburGraphicsContextWebGLOptions extends ExcaliburGraphicsContextOptions {
    context?: WebGL2RenderingContext;
    garbageCollector?: {
        garbageCollector: GarbageCollector;
        collectionInterval: number;
    };
    handleContextLost?: (e: Event) => void;
    handleContextRestored?: (e: Event) => void;
}
declare class ExcaliburGraphicsContextWebGL implements ExcaliburGraphicsContext {
    private _logger;
    private _renderers;
    private _lazyRenderersFactory;
    imageRenderer: 'ex.image' | 'ex.image-v2';
    private _isDrawLifecycle;
    useDrawSorting: boolean;
    private _drawCallPool;
    private _drawCallIndex;
    private _drawCalls;
    private _renderTarget;
    private _msaaTarget;
    private _postProcessTargets;
    private _screenRenderer;
    private _postprocessors;
    /**
     * Meant for internal use only. Access the internal context at your own risk and no guarantees this will exist in the future.
     * @internal
     */
    __gl: WebGL2RenderingContext;
    private _transform;
    private _state;
    private _ortho;
    /**
     * Snaps the drawing x/y coordinate to the nearest whole pixel
     */
    snapToPixel: boolean;
    /**
     * Native context smoothing
     */
    readonly smoothing: boolean;
    /**
     * Whether the pixel art sampler is enabled for smooth sub pixel anti-aliasing
     */
    readonly pixelArtSampler: boolean;
    /**
     * UV padding in pixels to use in internal image rendering to prevent texture bleed
     *
     */
    uvPadding: number;
    backgroundColor: Color;
    textureLoader: TextureLoader;
    materialScreenTexture: WebGLTexture | null;
    get z(): number;
    set z(value: number);
    get opacity(): number;
    set opacity(value: number);
    get tint(): Color | undefined | null;
    set tint(color: Color | undefined | null);
    get width(): number;
    get height(): number;
    get ortho(): Matrix;
    /**
     * Checks the underlying webgl implementation if the requested internal resolution is supported
     * @param dim
     */
    checkIfResolutionSupported(dim: Resolution): boolean;
    readonly multiSampleAntialiasing: boolean;
    readonly samples?: number;
    readonly transparency: boolean;
    private _isContextLost;
    constructor(options: ExcaliburGraphicsContextWebGLOptions);
    private _disposed;
    dispose(): void;
    private _init;
    register<T extends RendererPlugin>(renderer: T): void;
    lazyRegister<TRenderer extends RendererPlugin>(type: TRenderer['type'], renderer: () => TRenderer): void;
    get(rendererName: string): RendererPlugin | undefined;
    private _currentRenderer;
    private _isCurrentRenderer;
    beginDrawLifecycle(): void;
    endDrawLifecycle(): void;
    draw<TRenderer extends RendererPlugin>(rendererName: TRenderer['type'], ...args: Parameters<TRenderer['draw']>): void;
    resetTransform(): void;
    updateViewport(resolution: Resolution): void;
    private _imageToWidth;
    private _getImageWidth;
    private _imageToHeight;
    private _getImageHeight;
    drawImage(image: HTMLImageSource, x: number, y: number): void;
    drawImage(image: HTMLImageSource, x: number, y: number, width: number, height: number): void;
    drawImage(image: HTMLImageSource, sx: number, sy: number, swidth?: number, sheight?: number, dx?: number, dy?: number, dwidth?: number, dheight?: number): void;
    drawLine(start: Vector, end: Vector, color: Color, thickness?: number): void;
    drawRectangle(pos: Vector, width: number, height: number, color: Color, stroke?: Color, strokeThickness?: number): void;
    drawCircle(pos: Vector, radius: number, color: Color, stroke?: Color, thickness?: number): void;
    debug: ExcaliburGraphicsContextWebGLDebug;
    save(): void;
    restore(): void;
    translate(x: number, y: number): void;
    rotate(angle: number): void;
    scale(x: number, y: number): void;
    transform(matrix: AffineMatrix): void;
    getTransform(): AffineMatrix;
    multiply(m: AffineMatrix): void;
    addPostProcessor(postprocessor: PostProcessor): void;
    removePostProcessor(postprocessor: PostProcessor): void;
    clearPostProcessors(): void;
    private _totalPostProcessorTime;
    updatePostProcessors(elapsed: number): void;
    set material(material: Material | null | undefined);
    get material(): Material | null | undefined;
    /**
     * Creates and initializes the material which compiles the internal shader
     * @param options
     * @returns Material
     */
    createMaterial(options: Omit<MaterialOptions, 'graphicsContext'>): Material;
    createShader(options: Omit<ShaderOptions, 'graphicsContext'>): Shader;
    clear(): void;
    /**
     * Flushes all batched rendering to the screen
     */
    flush(): void;
}

/**
 * PostProcessors can be used to apply a shader to the entire screen. It is recommended
 * you use the {@apilink ScreenShader} to build your post processor shader.
 *
 * The screen texture comes through as this uniform
 *
 * `uniform sampler2D u_image`
 *
 * Post processor shaders get some default uniforms passed to them
 *
 * `uniform float u_time_ms` - total playback time in milliseconds
 * `uniform float u_elapsed_ms` - the elapsed time from the last frame in milliseconds
 * `uniform vec2 u_resolution` - the resolution of the canvas (in pixels)
 *
 * Custom uniforms can be updated in the {@apilink PostProcessor.onUpdate}
 */
interface PostProcessor {
    initialize(graphicsContext: ExcaliburGraphicsContextWebGL): void;
    getShader(): Shader;
    getLayout(): VertexLayout;
    /**
     * Use the onUpdate hook to update any uniforms in the postprocessors shader
     *
     * The shader has already been bound so there is no need to call shader.use();
     * @param elapsed
     */
    onUpdate?(elapsed: number): void;
    /**
     * Use the onDraw hook to upload any textures or command that need to run right before draw
     * @param elapsed
     */
    onDraw?(): void;
}

declare class ExcaliburGraphicsContext2DCanvasDebug implements DebugDraw {
    private _ex;
    private _debugText;
    constructor(_ex: ExcaliburGraphicsContext2DCanvas);
    /**
     * Draw a debug rectangle to the context
     * @param x
     * @param y
     * @param width
     * @param height
     */
    drawRect(x: number, y: number, width: number, height: number): void;
    drawLine(start: Vector, end: Vector, lineOptions?: LineGraphicsOptions): void;
    drawPoint(point: Vector, pointOptions?: PointGraphicsOptions): void;
    drawText(text: string, pos: Vector): void;
}
interface ExcaliburGraphicsContext2DOptions extends ExcaliburGraphicsContextOptions {
    context?: CanvasRenderingContext2D;
}
declare class ExcaliburGraphicsContext2DCanvas implements ExcaliburGraphicsContext {
    /**
     * Meant for internal use only. Access the internal context at your own risk and no guarantees this will exist in the future.
     * @internal
     */
    __ctx: CanvasRenderingContext2D;
    get width(): number;
    get height(): number;
    /**
     * Unused in Canvas implementation
     */
    readonly useDrawSorting: boolean;
    /**
     * Unused in Canvas implementation
     */
    z: number;
    backgroundColor: Color;
    private _state;
    get opacity(): number;
    set opacity(value: number);
    get tint(): Color | null | undefined;
    set tint(color: Color | null | undefined);
    snapToPixel: boolean;
    get smoothing(): boolean;
    set smoothing(value: boolean);
    constructor(options: ExcaliburGraphicsContext2DOptions);
    resetTransform(): void;
    updateViewport(_resolution: Resolution): void;
    /**
     * Draw an image to the Excalibur Graphics context at an x and y coordinate using the images width and height
     */
    drawImage(image: HTMLImageSource, x: number, y: number): void;
    /**
     *
     * Draw an image to the Excalibur Graphics context at an x and y coordinate with a specific width and height
     */
    drawImage(image: HTMLImageSource, x: number, y: number, width: number, height: number): void;
    /**
     *
     * Draw an image to the Excalibur Graphics context specifying the source image coordinates (sx, sy, swidth, sheight)
     * and to a specific destination on the context (dx, dy, dwidth, dheight)
     */
    drawImage(image: HTMLImageSource, sx: number, sy: number, swidth?: number, sheight?: number, dx?: number, dy?: number, dwidth?: number, dheight?: number): void;
    drawLine(start: Vector, end: Vector, color: Color, thickness?: number): void;
    drawRectangle(pos: Vector, width: number, height: number, color: Color): void;
    drawCircle(pos: Vector, radius: number, color: Color, stroke?: Color, thickness?: number): void;
    debug: ExcaliburGraphicsContext2DCanvasDebug;
    /**
     * Save the current state of the canvas to the stack (transforms and opacity)
     */
    save(): void;
    /**
     * Restore the state of the canvas from the stack
     */
    restore(): void;
    /**
     * Translate the origin of the context by an x and y
     * @param x
     * @param y
     */
    translate(x: number, y: number): void;
    /**
     * Rotate the context about the current origin
     */
    rotate(angle: number): void;
    /**
     * Scale the context by an x and y factor
     * @param x
     * @param y
     */
    scale(x: number, y: number): void;
    getTransform(): AffineMatrix;
    multiply(_m: AffineMatrix): void;
    addPostProcessor(_postprocessor: PostProcessor): void;
    removePostProcessor(_postprocessor: PostProcessor): void;
    clearPostProcessors(): void;
    updatePostProcessors(elapsed: number): void;
    beginDrawLifecycle(): void;
    endDrawLifecycle(): void;
    set material(material: Material | undefined | null);
    get material(): Material | undefined | null;
    createMaterial(options: Omit<MaterialOptions, 'graphicsContext'>): Material;
    clear(): void;
    /**
     * Flushes the batched draw calls to the screen
     */
    flush(): void;
    dispose(): void;
}

/**
 * An enum that represents the types of emitter nozzles
 */
declare enum EmitterType {
    /**
     * Constant for the circular emitter type
     */
    Circle = "circle",
    /**
     * Constant for the rectangular emitter type
     */
    Rectangle = "rectangle"
}

/**
 * @module
 * Pseudo-Random Utility
 *
 * A pseudo-random utility to add seeded random support for help in
 * generating things like terrain or reproducible randomness. Uses the
 * [Mersenne Twister](https://en.wikipedia.org/wiki/Mersenne_Twister) algorithm.
 */
/**
 * Pseudo-random number generator following the Mersenne_Twister algorithm. Given a seed this generator will produce the same sequence
 * of numbers each time it is called.
 * See https://en.wikipedia.org/wiki/Mersenne_Twister for more details.
 * Uses the MT19937-32 (2002) implementation documented here http://www.math.sci.hiroshima-u.ac.jp/~m-mat/MT/MT2002/emt19937ar.html
 *
 * Api inspired by http://chancejs.com/# https://github.com/chancejs/chancejs
 */
declare class Random {
    private _lowerMask;
    private _upperMask;
    private _w;
    private _n;
    private _m;
    private _a;
    private _u;
    private _s;
    private _b;
    private _t;
    private _c;
    private _l;
    private _f;
    private _mt;
    private _index;
    private _seed;
    /**
     * If no seed is specified, the Date.now() is used
     */
    constructor(seed?: number);
    /**
     * Apply the twist
     */
    private _twist;
    /**
     * Return next 32 bit integer number in sequence
     */
    nextInt(): number;
    /**
     * Return a random floating point number between [0, 1)
     */
    next(): number;
    /**
     * Return a random floating point in range [min, max) min is included, max is not included
     */
    floating(min: number, max: number): number;
    /**
     * Return a random integer in range [min, max] min is included, max is included.
     * Implemented with rejection sampling, see https://medium.com/@betable/tifu-by-using-math-random-f1c308c4fd9d#.i13tdiu5a
     */
    integer(min: number, max: number): number;
    /**
     * Returns true or false randomly with 50/50 odds by default.
     * By default the likelihood of returning a true is .5 (50%).
     * @param likelihood takes values between [0, 1]
     */
    bool(likelihood?: number): boolean;
    /**
     * Returns one element from an array at random
     */
    pickOne<T>(array: Array<T>): T;
    /**
     * Returns a new array random picking elements from the original
     * @param array Original array to pick from
     * @param numPicks can be any positive number
     * @param allowDuplicates indicates whether the returned set is allowed duplicates (it does not mean there will always be duplicates
     * just that it is possible)
     */
    pickSet<T>(array: Array<T>, numPicks: number, allowDuplicates?: boolean): Array<T>;
    /**
     * Returns a new array randomly picking elements in the original (not reused)
     * @param array Array to pick elements out of
     * @param numPicks must be less than or equal to the number of elements in the array.
     */
    private _pickSetWithoutDuplicates;
    /**
     * Returns a new array random picking elements from the original allowing duplicates
     * @param array Array to pick elements out of
     * @param numPicks can be any positive number
     */
    private _pickSetWithDuplicates;
    /**
     * Returns a new array that has its elements shuffled. Using the Fisher/Yates method
     * https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
     */
    shuffle<T>(array: Array<T>): Array<T>;
    /**
     * Generate a list of random integer numbers
     * @param length the length of the final array
     * @param min the minimum integer number to generate inclusive
     * @param max the maximum integer number to generate inclusive
     */
    range(length: number, min: number, max: number): Array<number>;
    /**
     * Returns the result of a d4 dice roll
     */
    d4(): number;
    /**
     * Returns the result of a d6 dice roll
     */
    d6(): number;
    /**
     * Returns the result of a d8 dice roll
     */
    d8(): number;
    /**
     * Returns the result of a d10 dice roll
     */
    d10(): number;
    /**
     * Returns the result of a d12 dice roll
     */
    d12(): number;
    /**
     * Returns the result of a d20 dice roll
     */
    d20(): number;
    get seed(): number;
}

/**
 * Using a particle emitter is a great way to create interesting effects
 * in your game, like smoke, fire, water, explosions, etc. `ParticleEmitter`
 * extend {@apilink Actor} allowing you to use all of the features that come with.
 *
 * These particles are simulated on the CPU in JavaScript
 */
declare class ParticleEmitter extends Actor {
    private _particlesToEmit;
    private _particlePool;
    numParticles: number;
    /**
     * Random number generator
     */
    random: Random;
    /**
     * Gets or sets the isEmitting flag
     */
    isEmitting: boolean;
    /**
     * Gets or sets the backing deadParticle collection
     */
    deadParticles: Particle[];
    /**
     * Gets or sets the emission rate for particles (particles/sec)
     */
    emitRate: number;
    /**
     * Gets or sets the emitter type for the particle emitter
     */
    emitterType: EmitterType;
    /**
     * Gets or sets the emitter radius, only takes effect when the {@apilink emitterType} is {@apilink EmitterType.Circle}
     */
    radius: number;
    particle: ParticleConfig;
    /**
     * @param config particle emitter options bag
     */
    constructor(config: ParticleEmitterArgs);
    removeParticle(particle: Particle): void;
    private _activeParticles;
    /**
     * Causes the emitter to emit particles
     * @param particleCount  Number of particles to emit right now
     */
    emitParticles(particleCount: number): void;
    clearParticles(): void;
    private _createParticle;
    update(engine: Engine, elapsed: number): void;
}

/**
/**
 * CPU Particle is used in a {@apilink ParticleEmitter}
 */
declare class Particle extends Entity {
    static DefaultConfig: ParticleConfig;
    focus?: Vector;
    focusAccel?: number;
    beginColor: Color;
    endColor: Color;
    life: number;
    fade: boolean;
    private _rRate;
    private _gRate;
    private _bRate;
    private _aRate;
    private _currentColor;
    size: number;
    graphic?: Graphic;
    startSize?: number;
    endSize?: number;
    sizeRate: number;
    visible: boolean;
    isOffscreen: boolean;
    transform: TransformComponent;
    motion: MotionComponent;
    graphics: GraphicsComponent;
    particleTransform: ParticleTransform;
    name: string;
    constructor(options: ParticleConfig);
    private _emitter?;
    registerEmitter(emitter: ParticleEmitter): void;
    configure(options: ParticleConfig): void;
    kill(): void;
    update(engine: Engine, elapsed: number): void;
}
interface ParticleConfig {
    /**
     * Optionally set the emitted particle transform style, {@apilink ParticleTransform.Global} is the default and emits particles as if
     * they were world space objects, useful for most effects.
     *
     * If set to {@apilink ParticleTransform.Local} particles are children of the emitter and move relative to the emitter
     * as they would in a parent/child actor relationship.
     */
    transform?: ParticleTransform;
    /**
     * Starting position of the particle
     */
    pos?: Vector;
    /**
     * Starting velocity of the particle
     */
    vel?: Vector;
    /**
     * Starting acceleration of the particle
     */
    acc?: Vector;
    /**
     * Starting angular velocity of the particle
     */
    angularVelocity?: number;
    /**
     * Starting rotation of the particle
     */
    rotation?: number;
    /**
     * Optionally set the z index of the particle, default is 0
     */
    z?: number;
    /**
     * Size of the particle in pixels
     */
    size?: number;
    /**
     * Optionally set a graphic
     */
    graphic?: Graphic;
    /**
     * Totally life of the particle in milliseconds
     */
    life?: number;
    /**
     * Starting opacity of the particle
     */
    opacity?: number;
    /**
     * Should the particle fade out to fully transparent over their life
     */
    fade?: boolean;
    /**
     * Ending color of the particle over its life
     */
    endColor?: Color;
    /**
     * Beginning color of the particle over its life
     */
    beginColor?: Color;
    /**
     * Set the start size when you want to change particle size over their life
     */
    startSize?: number;
    /**
     * Set the end size when you want to change particle size over their life
     */
    endSize?: number;
    /**
     * Smallest possible starting size of the particle
     */
    minSize?: number;
    /**
     * Largest possible starting size of the particle
     */
    maxSize?: number;
    /**
     * Minimum magnitude of the particle starting speed
     */
    minSpeed?: number;
    /**
     * Maximum magnitude of the particle starting speed
     */
    maxSpeed?: number;
    /**
     * Minimum angle to use for the particles starting rotation
     */
    minAngle?: number;
    /**
     * Maximum angle to use for the particles starting rotation
     */
    maxAngle?: number;
    /**
     * Gets or sets the optional focus where all particles should accelerate towards
     *
     * If the particle transform is global the focus is in world space, otherwise it is relative to the emitter
     */
    focus?: Vector;
    /**
     * Gets or sets the optional acceleration for focusing particles if a focus has been specified
     */
    focusAccel?: number;
    /**
     * Indicates whether particles should start with a random rotation
     */
    randomRotation?: boolean;
}
declare enum ParticleTransform {
    /**
     * {@apilink ParticleTransform.Global} is the default and emits particles as if
     * they were world space objects, useful for most effects.
     */
    Global = "global",
    /**
     * {@apilink ParticleTransform.Local} particles are children of the emitter and move relative to the emitter
     * as they would in a parent/child actor relationship.
     */
    Local = "local"
}
interface ParticleEmitterArgs {
    particle?: ParticleConfig;
    x?: number;
    y?: number;
    z?: number;
    pos?: Vector;
    width?: number;
    height?: number;
    /**
     * Is emitting currently
     */
    isEmitting?: boolean;
    /**
     * Particles per second
     */
    emitRate?: number;
    focus?: Vector;
    focusAccel?: number;
    /**
     * Emitter shape
     */
    emitterType?: EmitterType;
    /**
     * Radius of the emitter if the emitter type is EmitterType.Circle
     */
    radius?: number;
    random?: Random;
}

declare class GpuParticleEmitter extends Actor {
    particle: GpuParticleConfig;
    graphics: GraphicsComponent;
    renderer: GpuParticleRenderer;
    isEmitting: boolean;
    emitRate: number;
    emitterType: EmitterType;
    radius: number;
    readonly maxParticles: number;
    random: Random;
    get pos(): Vector;
    set pos(pos: Vector);
    get z(): number;
    set z(z: number);
    constructor(config: ParticleEmitterArgs & {
        maxParticles?: number;
        particle?: GpuParticleConfig;
    });
    _initialize(engine: Engine): void;
    private _particlesToEmit;
    update(engine: Engine, elapsed: number): void;
    emitParticles(particleCount: number): void;
    clearParticles(): void;
    draw(ctx: ExcaliburGraphicsContextWebGL, elapsed: number): void;
}

interface GpuParticleConfig extends ParticleConfig {
    /**
     * Only Sprite graphics are supported in GPU particles at the moment
     */
    graphic?: Sprite;
    /**
     * Set the maximum particles to use for this emitter
     */
    maxParticles?: number;
}
/**
 * Container for the GPU Particle State contains the internal state needed for the GPU
 * to render particles and maintain state.
 */
declare class GpuParticleRenderer {
    static readonly GPU_MAX_PARTICLES: number;
    emitter: GpuParticleEmitter;
    emitRate: number;
    particle: GpuParticleConfig;
    private _initialized;
    private _vaos;
    private _buffers;
    private _random;
    private _drawIndex;
    private _currentVao;
    private _currentBuffer;
    private _numInputFloats;
    private _particleData;
    private _particleIndex;
    private _uploadIndex;
    private _wrappedLife;
    private _wrappedParticles;
    private _particleLife;
    constructor(emitter: GpuParticleEmitter, random: Random, options: GpuParticleConfig);
    get isInitialized(): boolean;
    get maxParticles(): number;
    initialize(gl: WebGL2RenderingContext, context: ExcaliburGraphicsContextWebGL): void;
    private _clearRequested;
    clearParticles(): void;
    private _emitted;
    emitParticles(particleCount: number): void;
    private _uploadEmitted;
    update(elapsed: number): void;
    draw(gl: WebGL2RenderingContext): void;
}

declare class ParticleRenderer implements RendererPlugin {
    readonly type: "ex.particle";
    priority: number;
    private _gl;
    private _context;
    private _shader;
    initialize(gl: WebGL2RenderingContext, context: ExcaliburGraphicsContextWebGL): void;
    private _getTexture;
    draw(renderer: GpuParticleRenderer, elapsed: number): void;
    hasPendingDraws(): boolean;
    flush(): void;
    dispose(): void;
}

/**
 * Internal debug text helper
 */
declare class DebugText {
    constructor();
    /**
     * base64 font
     */
    readonly fontSheet: string;
    size: number;
    private _imageSource;
    private _spriteSheet;
    private _spriteFont;
    load(): Promise<void>;
    /**
     * Writes debug text using the built in sprint font
     * @param ctx
     * @param text
     * @param pos
     */
    write(ctx: ExcaliburGraphicsContext, text: string, pos: Vector): void;
}

/**
 * Helper that defines a whole screen renderer, just provide a fragment source!
 *
 * Currently supports 1 varying
 * - vec2 a_texcoord between 0-1 which corresponds to screen position
 */
declare class ScreenShader {
    private _shader;
    private _buffer;
    private _layout;
    constructor(context: ExcaliburGraphicsContextWebGL, fragmentSource: string);
    getShader(): Shader;
    getLayout(): VertexLayout;
}

declare class ColorBlindnessPostProcessor implements PostProcessor {
    private _colorBlindnessMode;
    private _shader;
    private _simulate;
    constructor(_colorBlindnessMode: ColorBlindnessMode, simulate?: boolean);
    initialize(graphicsContext: ExcaliburGraphicsContextWebGL): void;
    getShader(): Shader;
    getLayout(): VertexLayout;
    set colorBlindnessMode(colorBlindMode: ColorBlindnessMode);
    get colorBlindnessMode(): ColorBlindnessMode;
    set simulate(value: boolean);
    get simulate(): boolean;
}

interface UniformBufferOptions {
    /**
     * WebGL2RenderingContext this layout will be attached to, these cannot be reused across contexts.
     */
    gl: WebGL2RenderingContext;
    /**
     * Size in number of floats, so [4.2, 4.0, 2.1] is size = 3
     *
     * **NOTE It is recommended you use multiples of 4's to avoid hardware implemenetation bugs, vec4's the the most supported**
     *
     * Ignored if data is passed directly
     */
    size?: number;
    /**
     * If the vertices never change switching 'static' can be more efficient on the gpu
     *
     * Default is 'dynamic'
     */
    type?: 'static' | 'dynamic';
    /**
     * Optionally pass pre-seeded data, size parameter is ignored
     */
    data?: Float32Array;
}
declare class UniformBuffer {
    private _gl;
    /**
     * Access to the webgl buffer handle
     */
    readonly buffer: WebGLBuffer;
    readonly bufferData: Float32Array;
    type: 'static' | 'dynamic';
    private _maxFloats;
    constructor(options: UniformBufferOptions);
    /**
     * Bind this uniform buffer
     */
    bind(): void;
    unbind(): void;
    upload(count?: number): void;
    dispose(): void;
}

/**
 * Helper that defines and index buffer for quad geometry
 *
 * Index buffers allow you to save space in vertex buffers when you share vertices in geometry
 * it is almost always worth it in terms of performance to use an index buffer.
 */
declare class QuadIndexBuffer {
    private _gl;
    private _logger;
    /**
     * Access to the webgl buffer handle
     */
    buffer: WebGLBuffer;
    /**
     * Access to the raw data of the index buffer
     */
    bufferData: Uint16Array | Uint32Array;
    /**
     * Depending on the browser this is either gl.UNSIGNED_SHORT or gl.UNSIGNED_INT
     */
    bufferGlType: number;
    /**
     * @param gl WebGL2RenderingContext this layout will be attached to, these cannot be reused across contexts.
     * @param numberOfQuads Specify the max number of quads you want to draw
     * @param useUint16 Optionally force a uint16 buffer
     */
    constructor(gl: WebGL2RenderingContext, numberOfQuads: number, useUint16?: boolean);
    get size(): number;
    /**
     * Upload data to the GPU
     */
    upload(): void;
    /**
     * Bind this index buffer
     */
    bind(): void;
    dispose(): void;
}

declare class Debug {
    static _drawCalls: ((ctx: ExcaliburGraphicsContext) => void)[];
    static _ctx: ExcaliburGraphicsContext;
    static z: number;
    static registerGraphicsContext(ctx: ExcaliburGraphicsContext): void;
    static draw(debugDrawCall: (ctx: ExcaliburGraphicsContext) => void): void;
    static drawPoint(point: Vector, options?: PointGraphicsOptions): void;
    static drawLine(start: Vector, end: Vector, options?: LineGraphicsOptions): void;
    static drawLines(points: Vector[], options?: LineGraphicsOptions): void;
    static drawText(text: string, pos: Vector): void;
    static drawPolygon(points: Vector[], options?: {
        color?: Color;
    }): void;
    static drawCircle(center: Vector, radius: number, options?: {
        color?: Color;
        strokeColor?: Color;
        width?: number;
    }): void;
    static drawBounds(boundingBox: BoundingBox, options?: {
        color?: Color;
    }): void;
    static drawRay(ray: Ray, options?: {
        distance?: number;
        color?: Color;
    }): void;
    static flush(ctx: ExcaliburGraphicsContext): void;
    static clear(): void;
}

/**
 * Return the size of the GlType in bytes
 * @param gl
 * @param type
 */
declare function getGlTypeSizeBytes(gl: WebGLRenderingContext, type: number): number;
/**
 * Checks if an attribute is present in vertex source
 */
declare function isAttributeInSource(source: string, variable: string): boolean;
/**
 * Attempt to discern the glType of an attribute from vertex source
 * @param gl
 * @param source
 * @param variable
 */
declare function getGLTypeFromSource(gl: WebGLRenderingContext, source: string, variable: string): 5121 | 5124 | 5125 | 5126 | 5122 | 5123 | 5120 | 35670;
/**
 * Based on the type return the number of attribute components
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer
 * @param gl
 * @param type
 */
declare function getAttributeComponentSize(gl: WebGLRenderingContext, type: number): number;
/**
 * Based on the attribute return the corresponding supported attrib pointer type
 * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer
 * @param gl
 * @param type
 */
declare function getAttributePointerType(gl: WebGLRenderingContext, type: number): 5121 | 5126 | 5122 | 5123 | 5120;
/**
 *
 */
declare function getMaxShaderComplexity(gl: WebGL2RenderingContext, numIfs: number): number;

declare const webglUtil_getAttributeComponentSize: typeof getAttributeComponentSize;
declare const webglUtil_getAttributePointerType: typeof getAttributePointerType;
declare const webglUtil_getGLTypeFromSource: typeof getGLTypeFromSource;
declare const webglUtil_getGlTypeSizeBytes: typeof getGlTypeSizeBytes;
declare const webglUtil_getMaxShaderComplexity: typeof getMaxShaderComplexity;
declare const webglUtil_isAttributeInSource: typeof isAttributeInSource;
declare namespace webglUtil {
  export { webglUtil_getAttributeComponentSize as getAttributeComponentSize, webglUtil_getAttributePointerType as getAttributePointerType, webglUtil_getGLTypeFromSource as getGLTypeFromSource, webglUtil_getGlTypeSizeBytes as getGlTypeSizeBytes, webglUtil_getMaxShaderComplexity as getMaxShaderComplexity, webglUtil_isAttributeInSource as isAttributeInSource };
}

interface QuadTreeItem {
    bounds: BoundingBox;
}
interface QuadTreeOptions {
    maxDepth?: number;
    capacity: number;
    level?: number;
}
/**
 * QuadTree spatial data structure. Useful for quickly retrieving all objects that might
 * be in a specific location.
 */
declare class QuadTree<TItem extends QuadTreeItem> {
    bounds: BoundingBox;
    options?: QuadTreeOptions;
    private _defaultOptions;
    halfWidth: number;
    halfHeight: number;
    items: TItem[];
    private _isDivided;
    topLeft: QuadTree<TItem> | null;
    topRight: QuadTree<TItem> | null;
    bottomLeft: QuadTree<TItem> | null;
    bottomRight: QuadTree<TItem> | null;
    constructor(bounds: BoundingBox, options?: QuadTreeOptions);
    /**
     * Splits the quad tree one level deeper
     */
    private _split;
    private _insertIntoSubNodes;
    /**
     * Insert an item to be tracked in the QuadTree
     * @param item
     */
    insert(item: TItem): void;
    /**
     * Remove a tracked item in the QuadTree
     * @param item
     */
    remove(item: TItem): void;
    /**
     * Query the structure for all objects that intersect the bounding box
     * @param boundingBox
     * @returns items
     */
    query(boundingBox: BoundingBox): TItem[];
    clear(): void;
    getAllItems(): TItem[];
    getTreeDepth(): number;
    debug(ctx: ExcaliburGraphicsContext): void;
}

/**
 * A collision solver figures out how to position colliders such that they are no longer overlapping
 *
 * Solvers are executed in the order
 *
 * 1. preSolve
 * 2. solveVelocity
 * 3. solvePosition
 * 4. postSolve
 * @inheritdoc
 */
interface CollisionSolver {
    /**
     * Solves overlapping contact in
     *
     * Solvers are executed in the order
     * 1. preSolve
     * 2. solveVelocity
     * 3. solvePosition
     * 4. postSolve
     * @param contacts
     */
    solve(contacts: CollisionContact[]): CollisionContact[];
}

/**
 * ArcadeSolver is the default in Excalibur. It solves collisions so that there is no overlap between contacts,
 * and negates velocity along the collision normal.
 *
 * This is usually the type of collisions used for 2D games that don't need a more realistic collision simulation.
 *
 */
declare class ArcadeSolver implements CollisionSolver {
    config: DeepRequired<Pick<PhysicsConfig, 'arcade'>['arcade']>;
    directionMap: Map<string, "horizontal" | "vertical">;
    distanceMap: Map<string, number>;
    constructor(config: DeepRequired<Pick<PhysicsConfig, 'arcade'>['arcade']>);
    solve(contacts: CollisionContact[]): CollisionContact[];
    private _compositeContactsIds;
    preSolve(contacts: CollisionContact[]): void;
    postSolve(contacts: CollisionContact[]): void;
    solvePosition(contact: CollisionContact): void;
    solveVelocity(contact: CollisionContact): void;
}

/**
 * Holds information about contact points, meant to be reused over multiple frames of contact
 */
declare class ContactConstraintPoint {
    point: Vector;
    local: Vector;
    contact: CollisionContact;
    constructor(point: Vector, local: Vector, contact: CollisionContact);
    /**
     * Updates the contact information
     */
    update(): this;
    /**
     * Returns the relative velocity between bodyA and bodyB
     */
    getRelativeVelocity(): Vector;
    /**
     * Impulse accumulated over time in normal direction
     */
    normalImpulse: number;
    /**
     * Impulse accumulated over time in the tangent direction
     */
    tangentImpulse: number;
    /**
     * Effective mass seen in the normal direction
     */
    normalMass: number;
    /**
     * Effective mass seen in the tangent direction
     */
    tangentMass: number;
    /**
     * Direction from center of mass of bodyA to contact point
     */
    aToContact: Vector;
    /**
     * Direction from center of mass of bodyB to contact point
     */
    bToContact: Vector;
    /**
     * Original contact velocity combined with bounciness
     */
    originalVelocityAndRestitution: number;
}

declare class RealisticSolver implements CollisionSolver {
    config: DeepRequired<Pick<PhysicsConfig, 'realistic'>['realistic']>;
    directionMap: Map<string, "horizontal" | "vertical">;
    distanceMap: Map<string, number>;
    constructor(config: DeepRequired<Pick<PhysicsConfig, 'realistic'>['realistic']>);
    lastFrameContacts: Map<string, CollisionContact>;
    idToContactConstraint: Map<string, ContactConstraintPoint[]>;
    getContactConstraints(id: string): ContactConstraintPoint[];
    solve(contacts: CollisionContact[]): CollisionContact[];
    preSolve(contacts: CollisionContact[]): void;
    postSolve(contacts: CollisionContact[]): void;
    /**
     * Warm up body's based on previous frame contact points
     * @param contacts
     */
    warmStart(contacts: CollisionContact[]): void;
    /**
     * Iteratively solve the position overlap constraint
     * @param contacts
     */
    solvePosition(contacts: CollisionContact[]): void;
    solveVelocity(contacts: CollisionContact[]): void;
}

declare class PhysicsWorld {
    $configUpdate: Observable<Required<{
        enabled?: boolean;
        gravity?: Vector;
        solver?: SolverStrategy;
        substep?: number;
        colliders?: Required<{
            compositeStrategy?: "separate" | "together";
        }>;
        continuous?: Required<{
            checkForFastBodies?: boolean;
            disableMinimumSpeedForFastBody?: boolean;
            surfaceEpsilon?: number;
        }>;
        bodies?: Required<{
            defaultMass?: number;
            sleepEpsilon?: number;
            wakeThreshold?: number;
            sleepBias?: number;
            canSleepByDefault?: boolean;
        }>;
        spatialPartition?: SpatialPartitionStrategy;
        sparseHashGrid?: SparseHashGridConfig;
        dynamicTree?: Required<{
            boundsPadding?: number;
            velocityMultiplier?: number;
        }>;
        arcade?: Required<{
            contactSolveBias?: ContactSolveBias;
        }>;
        realistic?: Required<{
            contactSolveBias?: ContactSolveBias;
            positionIterations?: number;
            velocityIterations?: number;
            slop?: number;
            steeringFactor?: number;
            warmStart?: boolean;
        }>;
    }>>;
    private _configDirty;
    private _config;
    get config(): DeepRequired<PhysicsConfig>;
    set config(newConfig: DeepRequired<PhysicsConfig>);
    private _collisionProcessor;
    /**
     * Spatial data structure for locating potential collision pairs and ray casts
     */
    get collisionProcessor(): CollisionProcessor;
    constructor(config: DeepRequired<PhysicsConfig>);
    /**
     * Raycast into the scene's physics world
     * @param ray
     * @param options
     */
    rayCast(ray: Ray, options?: RayCastOptions): RayCastHit[];
    /**
     * Query for colliders in the scene's physics world
     * @param point
     */
    query(point: Vector): Collider[];
    query(bounds: BoundingBox): Collider[];
}

declare class CollisionSystem extends System {
    private _physics;
    static priority: -5;
    systemType: SystemType;
    query: Query<ComponentCtor<TransformComponent> | ComponentCtor<ColliderComponent>>;
    private _engine;
    private _configDirty;
    private _realisticSolver;
    private _arcadeSolver;
    private _lastFrameContacts;
    private _currentFrameContacts;
    private _motionSystem;
    private get _processor();
    private _trackCollider;
    private _untrackCollider;
    constructor(world: World, _physics: PhysicsWorld);
    initialize(world: World, scene: Scene): void;
    update(elapsed: number): void;
    postupdate(): void;
    getSolver(): CollisionSolver;
    debug(ex: ExcaliburGraphicsContext): void;
    runContactStartEnd(): void;
}

declare class MotionSystem extends System {
    world: World;
    physics: PhysicsWorld;
    static priority: -5;
    systemType: SystemType;
    private _physicsConfigDirty;
    query: Query<typeof TransformComponent | typeof MotionComponent>;
    constructor(world: World, physics: PhysicsWorld);
    update(elapsed: number): void;
    captureOldTransformWithChildren(entity: Entity): void;
}

/**
 * Enum representing the different display modes available to Excalibur.
 */
declare enum DisplayMode {
    /**
     * Default, use a specified resolution for the game. Like 800x600 pixels for example.
     */
    Fixed = "Fixed",
    /**
     * Fit the aspect ratio given by the game resolution within the container at all times will fill any gaps with canvas.
     * The displayed area outside the aspect ratio is not guaranteed to be on the screen, only the {@apilink Screen.contentArea}
     * is guaranteed to be on screen.
     */
    FitContainerAndFill = "FitContainerAndFill",
    /**
     * Fit the aspect ratio given by the game resolution the screen at all times will fill the screen.
     * This displayed area outside the aspect ratio is not guaranteed to be on the screen, only the {@apilink Screen.contentArea}
     * is guaranteed to be on screen.
     */
    FitScreenAndFill = "FitScreenAndFill",
    /**
     * Fit the viewport to the parent element maintaining aspect ratio given by the game resolution, but zooms in to avoid the black bars
     * (letterbox) that would otherwise be present in {@apilink FitContainer}.
     *
     * **warning** This will clip some drawable area from the user because of the zoom,
     * use {@apilink Screen.contentArea} to know the safe to draw area.
     */
    FitContainerAndZoom = "FitContainerAndZoom",
    /**
     * Fit the viewport to the device screen maintaining aspect ratio given by the game resolution, but zooms in to avoid the black bars
     * (letterbox) that would otherwise be present in {@apilink FitScreen}.
     *
     * **warning** This will clip some drawable area from the user because of the zoom,
     * use {@apilink Screen.contentArea} to know the safe to draw area.
     */
    FitScreenAndZoom = "FitScreenAndZoom",
    /**
     * Fit to screen using as much space as possible while maintaining aspect ratio and resolution.
     * This is not the same as {@apilink Screen.enterFullscreen} but behaves in a similar way maintaining aspect ratio.
     *
     * You may want to center your game here is an example
     * ```html
     * <!-- html -->
     * <body>
     * <main>
     *   <canvas id="game"></canvas>
     * </main>
     * </body>
     * ```
     *
     * ```css
     * // css
     * main {
     *   display: flex;
     *   align-items: center;
     *   justify-content: center;
     *   height: 100%;
     *   width: 100%;
     * }
     * ```
     */
    FitScreen = "FitScreen",
    /**
     * Fill the entire screen's css width/height for the game resolution dynamically. This means the resolution of the game will
     * change dynamically as the window is resized. This is not the same as {@apilink Screen.enterFullscreen}
     */
    FillScreen = "FillScreen",
    /**
     * Fit to parent element width/height using as much space as possible while maintaining aspect ratio and resolution.
     */
    FitContainer = "FitContainer",
    /**
     * Use the parent DOM container's css width/height for the game resolution dynamically
     */
    FillContainer = "FillContainer"
}
type ViewportUnit = 'pixel' | 'percent';
/**
 * Convenience class for quick resolutions
 * Mostly sourced from https://emulation.gametechwiki.com/index.php/Resolution
 */
declare class Resolution {
    static get SVGA(): Resolution;
    static get Standard(): Resolution;
    static get Atari2600(): Resolution;
    static get GameBoy(): Resolution;
    static get GameBoyAdvance(): Resolution;
    static get NintendoDS(): Resolution;
    static get NES(): Resolution;
    static get SNES(): Resolution;
}
interface Resolution {
    width: number;
    height: number;
}
interface ViewportDimension {
    widthUnit?: ViewportUnit;
    heightUnit?: ViewportUnit;
    width: number;
    height: number;
}
interface ScreenOptions {
    /**
     * Canvas element to build a screen on
     */
    canvas: HTMLCanvasElement;
    /**
     * Graphics context for the screen
     */
    context: ExcaliburGraphicsContext;
    /**
     * Browser abstraction
     */
    browser: BrowserEvents;
    /**
     * Optionally set antialiasing, defaults to true. If set to true, images will be smoothed
     */
    antialiasing?: boolean;
    /**
     * Optionally set the image rendering CSS hint on the canvas element, default is auto
     */
    canvasImageRendering?: 'auto' | 'pixelated';
    /**
     * Optionally override the pixel ratio to use for the screen, otherwise calculated automatically from the browser
     */
    pixelRatio?: number;
    /**
     * Optionally specify the actual pixel resolution in width/height pixels (also known as logical resolution), by default the
     * resolution will be the same as the viewport. Resolution will be overridden by {@apilink DisplayMode.FillContainer} and
     * {@apilink DisplayMode.FillScreen}.
     */
    resolution?: Resolution;
    /**
     * Visual viewport size in css pixel, if resolution is not specified it will be the same as the viewport
     */
    viewport: ViewportDimension;
    /**
     * Set the display mode of the screen, by default DisplayMode.Fixed.
     */
    displayMode?: DisplayMode;
}
/**
 * Fires when the screen resizes, useful if you have logic that needs to be aware of resolution/viewport constraints
 */
interface ScreenResizeEvent {
    /**
     * Current viewport in css pixels of the screen
     */
    viewport: ViewportDimension;
    /**
     * Current resolution in world pixels of the screen
     */
    resolution: Resolution;
}
/**
 * Fires when the pixel ratio changes, useful to know if you've moved to a hidpi screen or back
 */
interface PixelRatioChangeEvent {
    /**
     * Current pixel ratio of the screen
     */
    pixelRatio: number;
}
/**
 * Fires when the browser fullscreen api is successfully engaged or disengaged
 */
interface FullScreenChangeEvent {
    /**
     * Current fullscreen state
     */
    fullscreen: boolean;
}
/**
 * Built in events supported by all entities
 */
type ScreenEvents = {
    /**
     * Fires when the screen resizes, useful if you have logic that needs to be aware of resolution/viewport constraints
     */
    resize: ScreenResizeEvent;
    /**
     * Fires when the pixel ratio changes, useful to know if you've moved to a hidpi screen or back
     */
    pixelratio: PixelRatioChangeEvent;
    /**
     * Fires when the browser fullscreen api is successfully engaged or disengaged
     */
    fullscreen: FullScreenChangeEvent;
};
declare const ScreenEvents: {
    readonly ScreenResize: "resize";
    readonly PixelRatioChange: "pixelratio";
    readonly FullScreenChange: "fullscreen";
};
/**
 * The Screen handles all aspects of interacting with the screen for Excalibur.
 */
declare class Screen {
    graphicsContext: ExcaliburGraphicsContext;
    /**
     * Listen to screen events {@apilink ScreenEvents}
     */
    events: EventEmitter<ScreenEvents>;
    private _canvas;
    private _antialiasing;
    private _canvasImageRendering;
    private _contentResolution;
    private _browser;
    private _camera;
    private _resolution;
    private _resolutionStack;
    private _viewport;
    private _viewportStack;
    private _pixelRatioOverride;
    private _displayMode;
    private _isFullscreen;
    private _mediaQueryList;
    private _isDisposed;
    private _logger;
    private _resizeObserver;
    constructor(options: ScreenOptions);
    private _listenForPixelRatio;
    dispose(): void;
    private _fullscreenChangeHandler;
    private _pixelRatioChangeHandler;
    private _resizeHandler;
    private _calculateDevicePixelRatio;
    private _devicePixelRatio;
    /**
     * Returns the computed pixel ratio, first using any override, then the device pixel ratio
     */
    get pixelRatio(): number;
    /**
     * This calculates the ratio between excalibur pixels and the HTML pixels.
     *
     * This is useful for scaling HTML UI so that it matches your game.
     */
    get worldToPagePixelRatio(): number;
    /**
     * Get or set the pixel ratio override
     *
     * You will need to call applyResolutionAndViewport() affect change on the screen
     */
    get pixelRatioOverride(): number | undefined;
    set pixelRatioOverride(value: number | undefined);
    get isHiDpi(): boolean;
    get displayMode(): DisplayMode;
    get canvas(): HTMLCanvasElement;
    get parent(): HTMLElement | Window;
    get resolution(): Resolution;
    set resolution(resolution: Resolution);
    /**
     * Returns screen dimensions in pixels or percentage
     */
    get viewport(): ViewportDimension;
    set viewport(viewport: ViewportDimension);
    get aspectRatio(): number;
    get scaledWidth(): number;
    get scaledHeight(): number;
    setCurrentCamera(camera: Camera): void;
    pushResolutionAndViewport(): void;
    peekViewport(): ViewportDimension;
    peekResolution(): Resolution;
    popResolutionAndViewport(): void;
    applyResolutionAndViewport(): void;
    /**
     * Get or set screen antialiasing,
     *
     * If true smoothing is applied
     */
    get antialiasing(): boolean;
    /**
     * Get or set screen antialiasing
     */
    set antialiasing(isSmooth: boolean);
    /**
     * Returns true if excalibur is fullscreen using the browser fullscreen api
     * @deprecated use isFullscreen()
     */
    get isFullScreen(): boolean;
    /**
     * Returns true if excalibur is fullscreen using the browser fullscreen api
     */
    get isFullscreen(): boolean;
    /**
     * Requests to go fullscreen using the browser fullscreen api, requires user interaction to be successful.
     * For example, wire this to a user click handler.
     *
     * Optionally specify a target element id to go fullscreen, by default the game canvas is used
     * @param elementId
     * @deprecated use enterFullscreen(...)
     */
    goFullScreen(elementId?: string): Promise<void>;
    /**
     * Requests to enter fullscreen using the browser fullscreen api, requires user interaction to be successful.
     * For example, wire this to a user click handler.
     *
     * Optionally specify a target element id to go fullscreen, by default the game canvas is used
     * @param elementId
     */
    enterFullscreen(elementId?: string): Promise<void>;
    /**
     * Requests to exit fullscreen using the browser fullscreen api
     * @deprecated use exitFullscreen()
     */
    exitFullScreen(): Promise<void>;
    exitFullscreen(): Promise<void>;
    private _viewportToPixels;
    /**
     * Takes a coordinate in normal html page space, for example from a pointer move event, and translates it to
     * Excalibur screen space.
     *
     * Excalibur screen space starts at the top left (0, 0) corner of the viewport, and extends to the
     * bottom right corner (resolutionX, resolutionY). When using *AndFill suffixed display modes screen space
     * (0, 0) is the top left of the safe content area bounding box not the viewport.
     * @param point
     */
    pageToScreenCoordinates(point: Vector): Vector;
    /**
     * Takes a coordinate in Excalibur screen space, and translates it to normal html page space. For example,
     * this is where html elements might live if you want to position them relative to Excalibur.
     *
     * Excalibur screen space starts at the top left (0, 0) corner of the viewport, and extends to the
     * bottom right corner (resolutionX, resolutionY)
     * @param point
     */
    screenToPageCoordinates(point: Vector): Vector;
    /**
     * Takes a coordinate in Excalibur screen space, and translates it to Excalibur world space.
     *
     * World space is where {@apilink Entity | `entities`} in Excalibur live by default {@apilink CoordPlane.World}
     * and extends infinitely out relative from the {@apilink Camera}.
     * @param point  Screen coordinate to convert
     */
    screenToWorldCoordinates(point: Vector): Vector;
    /**
     * Takes a coordinate in Excalibur world space, and translates it to Excalibur screen space.
     *
     * Screen space is where {@apilink ScreenElement | `screen elements`} and {@apilink Entity | `entities`} with {@apilink CoordPlane.Screen} live.
     * @param point  World coordinate to convert
     */
    worldToScreenCoordinates(point: Vector): Vector;
    pageToWorldCoordinates(point: Vector): Vector;
    worldToPageCoordinates(point: Vector): Vector;
    /**
     * Returns a BoundingBox of the top left corner of the screen
     * and the bottom right corner of the screen.
     *
     * World bounds are in world coordinates, useful for culling objects offscreen that are in world space
     */
    getWorldBounds(): BoundingBox;
    /**
     * Returns a BoundingBox of the top left corner of the screen and the bottom right corner of the screen.
     *
     * Screen bounds are in screen coordinates, useful for culling objects offscreen that are in screen space
     */
    getScreenBounds(): BoundingBox;
    /**
     * The width of the game canvas in pixels (physical width component of the
     * resolution of the canvas element)
     */
    get canvasWidth(): number;
    /**
     * Returns half width of the game canvas in pixels (half physical width component)
     */
    get halfCanvasWidth(): number;
    /**
     * The height of the game canvas in pixels, (physical height component of
     * the resolution of the canvas element)
     */
    get canvasHeight(): number;
    /**
     * Returns half height of the game canvas in pixels (half physical height component)
     */
    get halfCanvasHeight(): number;
    /**
     * Returns the width of the engine's visible drawing surface in pixels including zoom and device pixel ratio.
     */
    get drawWidth(): number;
    /**
     * Returns the width of the engine's visible drawing surface in pixels including zoom and device pixel ratio.
     */
    get width(): number;
    /**
     * Returns half the width of the engine's visible drawing surface in pixels including zoom and device pixel ratio.
     */
    get halfDrawWidth(): number;
    /**
     * Returns the height of the engine's visible drawing surface in pixels including zoom and device pixel ratio.
     */
    get drawHeight(): number;
    get height(): number;
    /**
     * Returns half the height of the engine's visible drawing surface in pixels including zoom and device pixel ratio.
     */
    get halfDrawHeight(): number;
    /**
     * Returns screen center coordinates including zoom and device pixel ratio.
     */
    get center(): Vector;
    /**
     * Returns the content area in screen space where it is safe to place content
     */
    get contentArea(): BoundingBox;
    /**
     * Returns the unsafe area in screen space, this is the full screen and some space may not be onscreen.
     */
    get unsafeArea(): BoundingBox;
    private _contentArea;
    private _unsafeArea;
    private _computeFit;
    private _computeFitScreenAndFill;
    private _computeFitContainerAndFill;
    private _computeFitAndFill;
    private _computeFitScreenAndZoom;
    private _computeFitContainerAndZoom;
    private _computeFitAndZoom;
    private _computeFitContainer;
    private _applyDisplayMode;
    /**
     * Sets the resolution and viewport based on the selected display mode.
     */
    private _setResolutionAndViewportByDisplayMode;
}

type HTMLImageSource = HTMLImageElement | HTMLCanvasElement;
interface AntialiasOptions {
    /**
     * Turns on the special pixel art sampler in excalibur's image shader for sub pixel
     * anti-aliasing
     *
     * Default false
     */
    pixelArtSampler?: boolean;
    /**
     * Configures the webgl's getContext('webgl2', {antialias: true | false}) or configures
     * Canvas2D imageSmoothing = true;
     *
     * **Note** this option is incompatible with `multiSampleAntialiasing`
     *
     * Default false
     */
    nativeContextAntialiasing?: boolean;
    /**
     * Configures the internal render buffer multi-sampling settings
     *
     * Default true, with max samples that the platform supports
     */
    multiSampleAntialiasing?: boolean | {
        /**
         * Optionally specify number of samples (will be clamped to the max the platform supports)
         *
         * Default most platforms are 16 samples
         */
        samples: number;
    };
    /**
     * Sets the default image filtering for excalibur
     *
     * Default {@apilink ImageFiltering.Blended}
     */
    filtering?: ImageFiltering;
    /**
     * Sets the canvas image rendering CSS style
     *
     * Default 'auto'
     */
    canvasImageRendering?: 'pixelated' | 'auto';
}
declare const DefaultAntialiasOptions: Required<AntialiasOptions>;
declare const DefaultPixelArtOptions: Required<AntialiasOptions>;
interface ExcaliburGraphicsContextOptions {
    /**
     * Target existing html canvas element
     */
    canvasElement: HTMLCanvasElement;
    /**
     * Enables antialiasing on the canvas context (smooths pixels with default canvas sampling)
     */
    antialiasing?: boolean;
    /**
     * Enable the sub pixel antialiasing pixel art sampler for nice looking pixel art
     */
    pixelArtSampler?: boolean;
    /**
     * Enable canvas transparency
     */
    enableTransparency?: boolean;
    /**
     * Enable or disable multi-sample antialiasing in the internal render buffer.
     *
     * If true the max number of samples will be used
     *
     * By default enabled
     */
    multiSampleAntialiasing?: boolean | {
        /**
         * Specify number of samples to use during the multi sample anti-alias, if not specified the max will be used.
         * Limited by the hardware (usually 16)
         */
        samples: number;
    };
    /**
     * UV padding in pixels to use in the internal image rendering
     *
     * Recommended .25 - .5 of a pixel
     */
    uvPadding?: number;
    /**
     * Hint the power preference to the graphics context
     */
    powerPreference?: 'default' | 'high-performance' | 'low-power';
    /**
     * Snaps the pixel to an integer value (floor)
     */
    snapToPixel?: boolean;
    /**
     * Current clearing color of the context
     */
    backgroundColor?: Color;
    /**
     * Feature flag that enables draw sorting will removed in v0.29
     */
    useDrawSorting?: boolean;
}
interface ExcaliburGraphicsContextState {
    opacity: number;
    z: number;
    tint: Color | null | undefined;
    material: Material | null | undefined;
}
interface LineGraphicsOptions {
    color?: Color;
}
interface RectGraphicsOptions {
    color?: Color;
}
interface PointGraphicsOptions {
    color: Color;
    size: number;
}
interface DebugDraw {
    /**
     * Draw a debugging rectangle to the screen
     * @param x
     * @param y
     * @param width
     * @param height
     * @param rectOptions
     */
    drawRect(x: number, y: number, width: number, height: number, rectOptions?: RectGraphicsOptions): void;
    /**
     * Draw a debugging line to the screen
     * @param start '
     * @param end
     * @param lineOptions
     */
    drawLine(start: Vector, end: Vector, lineOptions?: LineGraphicsOptions): void;
    /**
     * Draw a debugging point to the screen
     * @param point
     * @param pointOptions
     */
    drawPoint(point: Vector, pointOptions?: PointGraphicsOptions): void;
    /**
     * Draw debug text
     * @param text
     * @param pos
     */
    drawText(text: string, pos: Vector): void;
}
interface ExcaliburGraphicsContext {
    width: number;
    height: number;
    /**
     * Excalibur will automatically sort draw calls by z and priority for maximal draw performance,
     * this can disrupt a specific desired painter order.
     *
     * To force a specific draw call order, use {@apilink ExcaliburGraphicsContext.z}
     *
     * By default `useDrawSorting` is `true`, to opt out set this to `false`
     */
    useDrawSorting: boolean;
    /**
     * Set the current z context for the graphics context. Draw calls issued to the context will use this z
     * to inform their sort order.
     *
     * Note it is important to all {@apilink ExcaliburGraphicsContext.save} and {@apilink ExcaliburGraphicsContext.restore} when modifying state.
     */
    z: number;
    /**
     * Snaps all drawings to the nearest pixel truncated down, by default false
     */
    snapToPixel: boolean;
    /**
     * Enable smoothed drawing (also known as anti-aliasing), by default true
     */
    smoothing: boolean;
    /**
     * Set the background color of the graphics context, default is {@apilink Color.ExcaliburBlue}
     */
    backgroundColor: Color;
    /**
     * Sets the opacity of the current {@apilink Graphic} being drawn, default is 1
     */
    opacity: number;
    /**
     * Sets the tint color to be multiplied by any images drawn, default is black 0xFFFFFFFF
     */
    tint: Color | null | undefined;
    /**
     * Resets the current transform to the identity matrix
     */
    resetTransform(): void;
    /**
     * Gets the current transform
     */
    getTransform(): AffineMatrix;
    /**
     * Multiplies the current transform by a matrix
     * @param m
     */
    multiply(m: AffineMatrix): void;
    /**
     * Update the context with the current viewport dimensions (used in resizing)
     */
    updateViewport(resolution: Resolution): void;
    /**
     * Access the debug drawing api
     */
    debug: DebugDraw;
    /**
     * Draw an image to the Excalibur Graphics context at an x and y coordinate using the images width and height
     */
    drawImage(image: HTMLImageSource, x: number, y: number): void;
    /**
     *
     * Draw an image to the Excalibur Graphics context at an x and y coordinate with a specific width and height
     */
    drawImage(image: HTMLImageSource, x: number, y: number, width: number, height: number): void;
    /**
     *
     * Draw an image to the Excalibur Graphics context specifying the source image coordinates (sx, sy, swidth, sheight)
     * and to a specific destination on the context (dx, dy, dwidth, dheight)
     */
    drawImage(image: HTMLImageSource, sx: number, sy: number, swidth?: number, sheight?: number, dx?: number, dy?: number, dwidth?: number, dheight?: number): void;
    /**
     * Draw a solid line to the Excalibur Graphics context
     * @param start
     * @param end
     * @param color
     * @param thickness
     */
    drawLine(start: Vector, end: Vector, color: Color, thickness: number): void;
    /**
     * Draw a solid rectangle to the Excalibur Graphics context
     * @param pos
     * @param width
     * @param height
     * @param color
     */
    drawRectangle(pos: Vector, width: number, height: number, color: Color, stroke?: Color, strokeThickness?: number): void;
    /**
     * Draw a circle to the Excalibur Graphics context
     * @param pos
     * @param radius
     * @param color
     * @param stroke Optionally specify the stroke color
     * @param thickness
     */
    drawCircle(pos: Vector, radius: number, color: Color, stroke?: Color, thickness?: number): void;
    /**
     * Save the current state of the canvas to the stack (transforms and opacity)
     */
    save(): void;
    /**
     * Restore the state of the canvas from the stack
     */
    restore(): void;
    /**
     * Translate the origin of the context by an x and y
     * @param x
     * @param y
     */
    translate(x: number, y: number): void;
    /**
     * Rotate the context about the current origin
     */
    rotate(angle: number): void;
    /**
     * Scale the context by an x and y factor
     * @param x
     * @param y
     */
    scale(x: number, y: number): void;
    /**
     * Add a post processor to the graphics context
     *
     * Post processors are run in the order they were added.
     * @param postprocessor
     */
    addPostProcessor(postprocessor: PostProcessor): void;
    /**
     * Remove a specific post processor from the graphics context
     * @param postprocessor
     */
    removePostProcessor(postprocessor: PostProcessor): void;
    /**
     * Remove all post processors from the graphics context
     */
    clearPostProcessors(): void;
    /**
     * Updates all post processors in the graphics context
     *
     * Called internally by Excalibur
     * @param elapsed
     * @internal
     */
    updatePostProcessors(elapsed: number): void;
    /**
     * Gets or sets the material to be used in the current context's drawings
     *
     * This allows customs shaders to be used but draw calls are no longer batched by default.
     * @param material
     */
    material: Material | null | undefined;
    /**
     * Creates and initializes the material which compiles the internal shader
     * @param options
     * @returns
     */
    createMaterial(options: Omit<MaterialOptions, 'graphicsContext'>): Material;
    /**
     * Clears the screen with the current background color
     */
    clear(): void;
    /**
     * Flushes the batched draw calls to the screen
     */
    flush(): void;
    beginDrawLifecycle(): void;
    endDrawLifecycle(): void;
    dispose(): void;
}

interface GraphicOptions {
    /**
     * The width of the graphic
     */
    width?: number;
    /**
     * The height of the graphic
     */
    height?: number;
    /**
     * Should the graphic be flipped horizontally
     */
    flipHorizontal?: boolean;
    /**
     * Should the graphic be flipped vertically
     */
    flipVertical?: boolean;
    /**
     * The rotation of the graphic
     */
    rotation?: number;
    /**
     * The scale of the graphic
     */
    scale?: Vector;
    /**
     * The opacity of the graphic between (0 -1)
     */
    opacity?: number;
    /**
     * The tint of the graphic, this color will be multiplied by the original pixel colors
     */
    tint?: Color;
    /**
     * The origin of the drawing in pixels to use when applying transforms, by default it will be the center of the image in pixels
     */
    origin?: Vector;
}
/**
 * A Graphic is the base Excalibur primitive for something that can be drawn to the {@apilink ExcaliburGraphicsContext}.
 * {@apilink Sprite}, {@apilink Animation}, {@apilink GraphicsGroup}, {@apilink Canvas}, {@apilink Rectangle}, {@apilink Circle}, and {@apilink Polygon} all derive from the
 * {@apilink Graphic} abstract class.
 *
 * Implementors of a Graphic must override the abstract {@apilink Graphic._drawImage} method to render an image to the graphics context. Graphic
 * handles all the position, rotation, and scale transformations in {@apilink Graphic._preDraw} and {@apilink Graphic._postDraw}
 */
declare abstract class Graphic {
    private static _ID;
    readonly id: number;
    transform: AffineMatrix;
    tint?: Color;
    private _transformStale;
    isStale(): boolean;
    /**
     * Gets or sets wether to show debug information about the graphic
     */
    showDebug: boolean;
    private _flipHorizontal;
    /**
     * Gets or sets the flipHorizontal, which will flip the graphic horizontally (across the y axis)
     */
    get flipHorizontal(): boolean;
    set flipHorizontal(value: boolean);
    private _flipVertical;
    /**
     * Gets or sets the flipVertical, which will flip the graphic vertically (across the x axis)
     */
    get flipVertical(): boolean;
    set flipVertical(value: boolean);
    private _rotation;
    /**
     * Gets or sets the rotation of the graphic
     */
    get rotation(): number;
    set rotation(value: number);
    /**
     * Gets or sets the opacity of the graphic, 0 is transparent, 1 is solid (opaque).
     */
    opacity: number;
    private _scale;
    /**
     * Gets or sets the scale of the graphic, this affects the width and
     */
    get scale(): Vector;
    set scale(value: Vector);
    private _origin?;
    /**
     * Gets or sets the origin of the graphic, if not set the center of the graphic is the origin
     */
    get origin(): Vector | undefined;
    set origin(value: Vector | undefined);
    constructor(options?: GraphicOptions);
    cloneGraphicOptions(): GraphicOptions;
    private _width;
    /**
     * Gets or sets the width of the graphic (always positive)
     */
    get width(): number;
    private _height;
    /**
     * Gets or sets the height of the graphic (always positive)
     */
    get height(): number;
    set width(value: number);
    set height(value: number);
    /**
     * Gets a copy of the bounds in pixels occupied by the graphic on the the screen. This includes scale.
     */
    get localBounds(): BoundingBox;
    /**
     * Draw the whole graphic to the context including transform
     * @param ex The excalibur graphics context
     * @param x
     * @param y
     */
    draw(ex: ExcaliburGraphicsContext, x: number, y: number): void;
    /**
     * Meant to be overridden by the graphic implementation to draw the underlying image (HTMLCanvasElement or HTMLImageElement)
     * to the graphics context without transform. Transformations like position, rotation, and scale are handled by {@apilink Graphic._preDraw}
     * and {@apilink Graphic._postDraw}
     * @param ex The excalibur graphics context
     * @param x
     * @param y
     */
    protected abstract _drawImage(ex: ExcaliburGraphicsContext, x: number, y: number): void;
    /**
     * Apply affine transformations to the graphics context to manipulate the graphic before {@apilink Graphic._drawImage}
     * @param ex
     * @param x
     * @param y
     */
    protected _preDraw(ex: ExcaliburGraphicsContext, x: number, y: number): void;
    protected _rotate(ex: ExcaliburGraphicsContext | AffineMatrix): void;
    protected _flip(ex: ExcaliburGraphicsContext | AffineMatrix): void;
    /**
     * Apply any additional work after {@apilink Graphic._drawImage} and restore the context state.
     * @param ex
     */
    protected _postDraw(ex: ExcaliburGraphicsContext): void;
    /**
     * Returns a new instance of the graphic that has the same properties
     */
    abstract clone(): Graphic;
}

/**
 * Type guard for checking if a Graphic HasTick (used for graphics that change over time like animations)
 * @param graphic
 */
declare function hasGraphicsTick(graphic: Graphic): graphic is Graphic & HasTick;
interface GraphicsShowOptions {
    offset?: Vector;
    anchor?: Vector;
}
interface GraphicsComponentOptions {
    onPostDraw?: (ex: ExcaliburGraphicsContext, elapsed: number) => void;
    onPreDraw?: (ex: ExcaliburGraphicsContext, elapsed: number) => void;
    onPreTransformDraw?: (ex: ExcaliburGraphicsContext, elapsed: number) => void;
    onPostTransformDraw?: (ex: ExcaliburGraphicsContext, elapsed: number) => void;
    /**
     * Name of current graphic to use
     */
    current?: string;
    /**
     * Optionally set the color of the graphics component
     */
    color?: Color;
    /**
     * Optionally set a material to use on the graphic
     */
    material?: Material;
    /**
     * Optionally copy instances of graphics by calling .clone(), you may set this to false to avoid sharing graphics when added to the
     * component for performance reasons. By default graphics are not copied and are shared when added to the component.
     */
    copyGraphics?: boolean;
    /**
     * Optional visible flag, if the graphics component is not visible it will not be displayed
     */
    visible?: boolean;
    /**
     * Optional opacity
     */
    opacity?: number;
    /**
     * List of graphics and optionally the options per graphic
     */
    graphics?: {
        [graphicName: string]: Graphic | {
            graphic: Graphic;
            options?: GraphicsShowOptions | undefined;
        };
    };
    /**
     * Optional offset in absolute pixels to shift all graphics in this component from each graphic's anchor (default is top left corner)
     */
    offset?: Vector;
    /**
     * Optional anchor
     */
    anchor?: Vector;
}
/**
 * Component to manage drawings, using with the position component
 */
declare class GraphicsComponent extends Component {
    private _logger;
    private _current;
    private _graphics;
    private _options;
    material: Material | null;
    /**
     * Draws after the entity transform has been applied, but before graphics component graphics have been drawn
     */
    onPreDraw?: (ctx: ExcaliburGraphicsContext, elapsed: number) => void;
    /**
     * Draws after the entity transform has been applied, and after graphics component graphics has been drawn
     */
    onPostDraw?: (ctx: ExcaliburGraphicsContext, elapsed: number) => void;
    /**
     * Draws before the entity transform has been applied before any any graphics component drawing
     */
    onPreTransformDraw?: (ctx: ExcaliburGraphicsContext, elapsed: number) => void;
    /**
     * Draws after the entity transform has been applied, and after all graphics component drawing
     */
    onPostTransformDraw?: (ctx: ExcaliburGraphicsContext, elapsed: number) => void;
    private _color?;
    /**
     * Sets or gets wether any drawing should be visible in this component
     * @deprecated use isVisible
     */
    get visible(): boolean;
    /**
     * Sets or gets wether any drawing should be visible in this component
     * @deprecated use isVisible
     */
    set visible(val: boolean);
    /**
     * Sets or gets wether any drawing should be visible in this component
     */
    isVisible: boolean;
    /**
     * Optionally force the graphic onscreen, default false. Not recommend to use for perf reasons, only if you known what you're doing.
     */
    forceOnScreen: boolean;
    /**
     * Sets or gets wither all drawings should have an opacity applied
     */
    opacity: number;
    private _offset;
    /**
     * Offset to apply to graphics by default
     */
    get offset(): Vector;
    set offset(value: Vector);
    private _anchor;
    /**
     * Anchor to apply to graphics by default
     */
    get anchor(): Vector;
    set anchor(value: Vector);
    /**
     * Sets the color of the actor's current graphic
     */
    get color(): Color | undefined;
    set color(v: Color | undefined);
    /**
     * Flip all graphics horizontally along the y-axis
     */
    flipHorizontal: boolean;
    /**
     * Flip all graphics vertically along the x-axis
     */
    flipVertical: boolean;
    /**
     * If set to true graphics added to the component will be copied. This can effect performance, but is useful if you don't want
     * changes to a graphic to effect all the places it is used.
     */
    copyGraphics: boolean;
    constructor(options?: GraphicsComponentOptions);
    getGraphic(name: string): Graphic | undefined;
    getOptions(name: string): GraphicsShowOptions | undefined;
    /**
     * Get registered graphics names
     */
    getNames(): string[];
    /**
     * Returns the currently displayed graphic
     */
    get current(): Graphic | undefined;
    /**
     * Returns the currently displayed graphic offsets
     */
    get currentOptions(): GraphicsShowOptions | undefined;
    /**
     * Returns all graphics associated with this component
     */
    get graphics(): {
        [graphicName: string]: Graphic;
    };
    /**
     * Returns all graphics options associated with this component
     */
    get options(): {
        [graphicName: string]: GraphicsShowOptions | undefined;
    };
    /**
     * Adds a named graphic to this component, if the name is "default" or not specified, it will be shown by default without needing to call
     * @param graphic
     */
    add(graphic: Graphic, options?: GraphicsShowOptions): Graphic;
    add(name: string, graphic: Graphic, options?: GraphicsShowOptions): Graphic;
    /**
     * Removes a registered graphic, if the removed graphic is the current it will switch to the default
     * @param name
     */
    remove(name: string): void;
    /**
     * Use a graphic only, will set the default graphic. Returns the new {@apilink Graphic}
     *
     * Optionally override the stored options
     * @param nameOrGraphic
     * @param options
     */
    use<T extends Graphic = Graphic>(nameOrGraphic: string | T, options?: GraphicsShowOptions): T;
    /**
     * Hide currently shown graphic
     */
    hide(): void;
    private _localBounds?;
    set localBounds(bounds: BoundingBox);
    recalculateBounds(): void;
    /**
     * Get local bounds of graphics component
     */
    get localBounds(): BoundingBox;
    /**
     * Get world bounds of graphics component
     */
    get bounds(): BoundingBox;
    /**
     * Update underlying graphics if necessary, called internally
     * @param elapsed
     * @internal
     */
    update(elapsed: number, idempotencyToken?: number): void;
    clone(): GraphicsComponent;
}

interface PointerComponentOptions {
    useColliderShape?: boolean;
    useGraphicsBounds?: boolean;
    localBounds?: BoundingBox;
}
/**
 * Add this component to optionally configure how the pointer
 * system detects pointer events.
 *
 * By default the collider shape is used and graphics bounds is not.
 *
 * If both collider shape and graphics bounds are enabled it will fire events if either or
 * are intersecting the pointer.
 */
declare class PointerComponent extends Component {
    /**
     * Use any existing Collider component geometry for pointer events. This is useful if you want
     * user pointer events only to trigger on the same collision geometry used in the collider component
     * for collision resolution. Default is `true`.
     */
    useColliderShape: boolean;
    /**
     * Use any existing Graphics component bounds for pointers. This is useful if you want the axis aligned
     * bounds around the graphic to trigger pointer events. Default is `true`.
     */
    useGraphicsBounds: boolean;
    /**
     * Optionally use other bounds for pointer testing
     */
    localBounds?: BoundingBox;
    constructor(options?: PointerComponentOptions);
}

/**
 * Used for implementing actions for the {@apilink ActionContext | `Action API`}.
 */
interface Action {
    id: number;
    update(elapsed: number): void;
    isComplete(entity: Entity): boolean;
    reset(): void;
    stop(): void;
}
/**
 *
 */
declare function nextActionId(): number;

/**
 * Action Queues represent an ordered sequence of actions
 *
 * Action queues are part of the {@apilink ActionContext | `Action API`} and
 * store the list of actions to be executed for an {@apilink Actor}.
 *
 * Actors implement {@apilink Actor.actions} which can be manipulated by
 * advanced users to adjust the actions currently being executed in the
 * queue.
 */
declare class ActionQueue {
    private _entity;
    private _actions;
    private _currentAction;
    private _completedActions;
    constructor(entity: Entity);
    /**
     * Add an action to the sequence
     * @param action
     */
    add(action: Action): void;
    /**
     * Remove an action by reference from the sequence
     * @param action
     */
    remove(action: Action): void;
    /**
     * Removes all actions from this sequence
     */
    clearActions(): void;
    /**
     *
     * @returns The total list of actions in this sequence complete or not
     */
    getActions(): Action[];
    getIncompleteActions(): Action[];
    getCurrentAction(): Action | null;
    /**
     *
     * @returns `true` if there are more actions to process in the sequence
     */
    hasNext(): boolean;
    /**
     * @returns `true` if the current sequence of actions is done
     */
    isComplete(): boolean;
    /**
     * Resets the sequence of actions, this is used to restart a sequence from the beginning
     */
    reset(): void;
    /**
     * Update the queue which updates actions and handles completing actions
     * @param elapsed
     */
    update(elapsed: number): void;
}

interface MoveByOptions {
    offset: Vector;
    duration: number;
    easing?: EasingFunction;
}
/**
 *
 */
declare function isMoveByOptions(x: any): x is MoveByOptions;
declare class MoveByWithOptions implements Action {
    entity: Entity;
    id: number;
    private _start;
    private _end;
    private _durationMs;
    private _tx;
    private _started;
    private _currentMs;
    private _stopped;
    private _motion;
    private _offset;
    private _easing;
    constructor(entity: Entity, options: MoveByOptions);
    update(elapsed: number): void;
    isComplete(entity: Entity): boolean;
    stop(): void;
    reset(): void;
}
declare class MoveBy implements Action {
    id: number;
    private _tx;
    private _motion;
    private _entity;
    x: number;
    y: number;
    private _distance;
    private _speed;
    private _start;
    private _offset;
    private _end;
    private _dir;
    private _started;
    private _stopped;
    constructor(entity: Entity, offsetX: number, offsetY: number, speed: number);
    update(elapsed: number): void;
    isComplete(entity: Entity): boolean;
    stop(): void;
    reset(): void;
}

interface MoveToOptions {
    pos: Vector;
    duration: number;
    easing?: EasingFunction;
}
/**
 *
 */
declare function isMoveToOptions(x: any): x is MoveToOptions;
declare class MoveToWithOptions implements Action {
    entity: Entity;
    id: number;
    private _end;
    private _durationMs;
    private _tx;
    private _started;
    private _start;
    private _currentMs;
    private _stopped;
    private _motion;
    private _easing;
    constructor(entity: Entity, options: MoveToOptions);
    update(elapsed: number): void;
    isComplete(entity: Entity): boolean;
    stop(): void;
    reset(): void;
}
declare class MoveTo implements Action {
    entity: Entity;
    id: number;
    private _tx;
    private _motion;
    x: number;
    y: number;
    private _start;
    private _end;
    private _dir;
    private _speed;
    private _distance;
    private _started;
    private _stopped;
    constructor(entity: Entity, destX: number, destY: number, speed: number);
    update(elapsed: number): void;
    isComplete(entity: Entity): boolean;
    stop(): void;
    reset(): void;
}

interface VectorViewOptions {
    getX: () => number;
    getY: () => number;
    setX: (x: number) => void;
    setY: (y: number) => void;
}
declare class VectorView extends Vector {
    private _getX;
    private _getY;
    private _setX;
    private _setY;
    constructor(options: VectorViewOptions);
    get x(): number;
    set x(val: number);
    get y(): number;
    set y(val: number);
}

/**
 * Linear interpolation between `a` and `b`, at `time = 0` the value will be `a` at `time = 1` the value will be `b`
 * @param a
 * @param b
 * @param time
 */
declare function lerp(a: number, b: number, time: number): number;
/**
 * Linear interpolation between angles in radians
 * @param startAngle
 * @param endAngle
 * @param rotationType
 * @param time
 */
declare function lerpAngle(startAngle: number, endAngle: number, rotationType: RotationType, time: number): number;
/**
 * Linear interpolation between `a` and `b`, at `time = 0` the value will be `a` at `time = 1` the value will be `b`
 * @param a
 * @param b
 * @param time
 */
declare function lerpVector(a: Vector, b: Vector, time: number): Vector;
/**
 * Inverse of a linear interpolation, given a `value` in between `a` and `b` return how close to `a` or `b` the `value` is.
 *
 * Example: `a=1`, `b=5`, `value=4` will return `.75`
 * @param a
 * @param b
 * @param value
 */
declare function inverseLerp(a: number, b: number, value: number): number;
/**
 * Inverse of a linear interpolation, given a `value` in between `a` and `b` return how close to `a` or `b` the `value` is.
 *
 * **Warning** assumes that the `value` vector is co-linear with vector `a` and `b`
 *
 * Example: `a=1`, `b=5`, `value=4` will return `.75`
 * @param a
 * @param b
 * @param value
 */
declare function inverseLerpVector(a: Vector, b: Vector, value: Vector): number;
/**
 * Remaps a value from a source domain to a destination
 * @param minSource
 * @param maxSource
 * @param minDestination
 * @param maxDestination
 * @param value
 */
declare function remap(minSource: number, maxSource: number, minDestination: number, maxDestination: number, value: number): number;
/**
 * Remaps a value from a source domain to a destination
 *
 * **Warning** assumes that the `value` vector is co-linear with vector `minSource` and `maxSource`
 * @param minSource
 * @param maxSource
 * @param minDestination
 * @param maxDestination
 * @param value
 */
declare function remapVector(minSource: Vector, maxSource: Vector, minDestination: Vector, maxDestination: Vector, value: Vector): Vector;

interface BezierCurveOptions {
    /**
     * [start, control1, control2, end]
     */
    controlPoints: [start: Vector, control1: Vector, control2: Vector, end: Vector];
    /**
     * Quality when sampling uniform points on the curve. Samples = 4 * quality;
     *
     * For bigger 'uniform' curves you may want to increase quality
     *
     * Default 4
     */
    quality?: number;
}
/**
 * BezierCurve that supports cubic Bezier curves.
 */
declare class BezierCurve {
    private _distLookup;
    private _controlPoints;
    private _arcLength;
    readonly quality: number;
    constructor(options: BezierCurveOptions);
    get arcLength(): number;
    get controlPoints(): readonly [start: Vector, control1: Vector, control2: Vector, end: Vector];
    set controlPoints(points: [start: Vector, control1: Vector, control2: Vector, end: Vector]);
    setControlPoint(index: 0 | 1 | 2 | 3, point: Vector): void;
    private _calculateLookup;
    private _getTimeGivenDistance;
    /**
     * Get the point on the Bezier curve at a certain time
     * @param time Between 0-1
     */
    getPoint(time: number): Vector;
    /**
     * Get the tangent of the Bezier curve at a certain time
     * @param time Between 0-1
     */
    getTangent(time: number): Vector;
    /**
     * Get the tangent of the Bezier curve where the distance is uniformly distributed over time
     * @param time
     */
    getUniformTangent(time: number): Vector;
    /**
     * Get the normal of the Bezier curve at a certain time
     * @param time Between 0-1
     */
    getNormal(time: number): Vector;
    /**
     * Get the normal of the Bezier curve where the distance is uniformly distributed over time
     * @param time
     */
    getUniformNormal(time: number): Vector;
    /**
     * Points are spaced uniformly across the length of the curve over time
     * @param time
     */
    getUniformPoint(time: number): Vector;
    clone(): BezierCurve;
}

/**
 * Two PI constant
 */
declare const TwoPI: number;
/**
 * Returns the fractional part of a number
 * @param x
 */
declare function frac(x: number): number;
/**
 * Returns the sign of a number, if 0 returns 0
 */
declare function sign(val: number): number;
/**
 * Clamps a value between a min and max inclusive
 */
declare function clamp(val: number, min: number, max: number): number;
/**
 * Approximately equals
 */
declare function approximatelyEqual(val1: number, val2: number, tolerance: number): boolean;
/**
 * Convert an angle to be the equivalent in the range [0, 2PI)
 */
declare function canonicalizeAngle(angle: number): number;
/**
 * Convert radians to degrees
 */
declare function toDegrees(radians: number): number;
/**
 * Convert degrees to radians
 */
declare function toRadians(degrees: number): number;
/**
 * Generate a range of numbers
 * For example: range(0, 5) -> [0, 1, 2, 3, 4, 5]
 * @param from inclusive
 * @param to inclusive
 */
declare const range: (from: number, to: number) => number[];
/**
 * Find a random floating point number in range
 */
declare function randomInRange(min: number, max: number, random?: Random): number;
/**
 * Find a random integer in a range
 */
declare function randomIntInRange(min: number, max: number, random?: Random): number;

/**
 * A unique identifier for a graph node or edge.
 */
type G_UUID = string & {
    readonly __brand: unique symbol;
};
interface EdgeOptionsWithWeight {
    weight: number;
    useEuclidean?: false;
    /**
     * Whether the edge is directed.
     * @default false
     */
    directed?: boolean;
}
interface EdgeOptionsWeightless {
    weight?: undefined;
    useEuclidean?: false | undefined;
    /**
     * Whether the edge is directed.
     * @default false
     */
    directed?: boolean;
}
interface EdgeOptionsWithEuclidean {
    weight?: undefined;
    useEuclidean: true;
    /**
     * Whether the edge is directed.
     * @default false
     */
    directed?: boolean;
}
/**
 * Options for creating a new edge in the graph.
 */
type EdgeOptions = EdgeOptionsWithWeight | EdgeOptionsWithEuclidean | EdgeOptionsWeightless;
/**
 * A weighted graph data structure.
 * @template T The type of data stored in each node.
 */
declare class Graph<T> {
    private _nodes;
    private _edges;
    adjacencyList: Map<G_UUID, Set<G_UUID>>;
    id: G_UUID;
    /**
     * Constructs a new graph data structure.
     *
     * This constructor initializes an empty graph with no nodes or edges.
     */
    constructor();
    /**
     * Adds a new node to the graph with the given data.
     * @returns The newly created node.
     */
    addNode(data: T, position?: Vector): Node<T> | PositionNode<T>;
    /**
     * Adds multiple new nodes to the graph with the given data.
     * @returns A map of all nodes in the graph, including the newly created ones.
     */
    addNodes(nodes: T[]): Map<G_UUID, Node<T>>;
    /**
     * Deletes a node from the graph along with all its associated edges.
     * This method removes the specified node and any edges connected to it
     * from the graph. It updates the internal structures to reflect these
     * changes.
     * @param node - The node to be deleted from the graph.
     * @returns A map of all remaining nodes in the graph.
     */
    deleteNode(node: Node<T>): Map<G_UUID, Node<T>>;
    /**
     * Adds a new edge between two nodes in the graph. If the edge already exists, it does not add a duplicate.
     * The function allows specifying edge options such as weight and directionality. For undirected edges,
     * it creates a duplicate edge in the reverse direction and links both edges as partners.
     * @param from - The source node of the edge.
     * @param to - The target node of the edge.
     * @param options - Optional settings for the edge, including weight and directionality.
     * @returns An array containing the created edge(s). If the edge is directed, the array contains one edge;
     *          if undirected, it contains both the original and the duplicate edge.
     */
    addEdge(from: Node<T>, to: Node<T>, options?: EdgeOptions): Edge<T>[];
    /**
     * Deletes an edge from the graph.
     *
     * This method removes the specified edge and its partner edge (if any) from the graph.
     * It updates the internal edge set and edge list accordingly. The source and target
     * nodes of the edge are also updated to reflect the removal of the edge.
     * @param edge - The edge to be deleted from the graph.
     */
    deleteEdge(edge: Edge<T>): void;
    /**
     * The set of nodes in the graph, keyed by their UUID.
     *
     * The map returned by this property is a shallow copy of the internal map.
     * The nodes in this map are not frozen, and may be modified by the caller.
     * @returns A shallow copy of the graph's internal node map.
     */
    get nodes(): Map<G_UUID, Node<T>>;
    /**
     * Gets a node by its UUID.
     * @param id - The UUID of the node to be retrieved.
     * @returns The node with the specified UUID, or undefined if no such node exists.
     */
    getNode(id: G_UUID): Node<T>;
    /**
     * Retrieves the set of edges in the graph.
     *
     * The returned set is a shallow copy of the internal edge set.
     * Modifications to this set do not affect the graph's internal state.
     * @returns A set containing all edges in the graph.
     */
    get edges(): Set<Edge<T>>;
    /**
     * Gets the neighbors of the given node.
     *
     * The returned array contains all of the nodes that are directly connected to the given node.
     * @param node - The node whose neighbors should be retrieved.
     * @returns An array of nodes that are directly connected to the given node.
     */
    getNeighbors(node: Node<T>): Node<T>[];
    /**
     * Checks if two nodes are connected by an edge.
     * @param node1 - The first node to check.
     * @param node2 - The second node to check.
     * @returns true if the nodes are connected, false if not.
     */
    areNodesConnected(node1: Node<T>, node2: Node<T>): boolean;
    /**
     * Performs a breadth-first search (BFS) on the graph starting from the given node.
     *
     * This method explores the graph layer by layer, starting from the specified node.
     * It visits all nodes that are directly connected to the start node before moving
     * on to the nodes at the next level of the graph.
     * @param startNode - The node to start the BFS from.
     * @returns An array of UUIDs representing the nodes that were visited during the search.
     *          The order of the nodes in the array corresponds to the order in which they
     *          were visited.
     */
    bfs(startNode: Node<T>): G_UUID[];
    /**
     * Performs a depth-first search (DFS) on the graph starting from the given node.
     *
     * This method explores the graph by traversing as far as possible along each
     * branch before backtracking. It visits all nodes that are reachable from the
     * start node.
     * @param startNode - The node to start the DFS from.
     * @param [visited] - A set of node IDs that have already been visited during
     *                    the search. This parameter is optional, and defaults to an
     *                    empty set.
     * @returns An array of UUIDs representing the nodes that were visited during the
     *          search. The order of the nodes in the array corresponds to the order
     *          in which they were visited.
     */
    dfs(startNode: Node<T>, visited?: Set<string>): G_UUID[];
    /**
     * Creates a new graph from an array of nodes, and adds them all to the graph.
     * @param nodes - The array of nodes to add to the graph.
     * @returns The newly created graph.
     */
    static createGraphFromNodes<T>(nodes: T[]): Graph<T>;
    /**
     * Finds the shortest path between two nodes in the graph using Dijkstra's algorithm.
     *
     * This method calculates the shortest path from the specified start node to the
     * specified end node in the graph. It returns an object containing the path and
     * the total distance of the path.
     * @param startNode - The node from which the search for the shortest path begins.
     * @param endNode - The node where the search for the shortest path ends.
     * @returns An object containing:
     *   - `path`: An array of nodes representing the shortest path from startNode to endNode.
     *     If no path is found, this will be `null`.
     *   - `distance`: The total distance of the shortest path. If no path is found, this will
     *     be `Infinity`.
     */
    dijkstra(sourcenode: Node<T>): Array<{
        node: Node<T>;
        distance: number;
        previous: Node<T> | null;
    }>;
    /**
     * Finds the shortest path between two nodes in the graph using the Dijkstra method
     *
     * This method calculates the shortest path from the specified start node to the
     * specified end node in the graph. It returns an object containing the path and
     * the total distance of the path.
     * @param startingNode - The node from which the search for the shortest path begins.
     * @param endNode - The node where the search for the shortest path ends.
     * @returns An object containing:
     *   - `path`: An array of nodes representing the shortest path from startNode to endNode.
     *     If no path is found, this will be `null`.
     *   - `distance`: The total distance of the shortest path. If no path is found, this will
     *     be `Infinity`.
     */
    shortestPathDijkstra(startingNode: Node<T>, endNode: Node<T>): {
        path: Node<T>[];
        distance: number;
    };
    /**
     * Finds the shortest path between two nodes in the graph using the A* algorithm.
     *
     * This method calculates the shortest path from the specified start node to the
     * specified end node in the graph. It returns an object containing the path and
     * the total distance of the path.
     * @param startNode - The node from which the search for the shortest path begins.
     * @param endNode - The node where the search for the shortest path ends.
     * @returns An object containing:
     *   - `path`: An array of nodes representing the shortest path from startNode to endNode.
     *     If no path is found, this will be `null`.
     *   - `distance`: The total distance of the shortest path. If no path is found, this will
     *     be `Infinity`.
     *   - `skippedNodes`: A set of all nodes that were skipped during the search (because they
     *     were not `PositionNode`s).
     */
    aStar(startNode: PositionNode<T>, endNode: PositionNode<T>): {
        path: PositionNode<T>[] | null;
        pathSteps: number;
        distance: number;
        skippedNodes: Set<G_UUID>;
    };
    private _euclideanDistance;
}
/**
 * Represents an edge in a graph, connecting two nodes.
 * @template T The type of data stored in the nodes connected by this edge.
 */
declare class Edge<T> {
    private _id;
    private _source;
    private _target;
    private _weight;
    private _partnerEdge;
    constructor(source: Node<T>, target: Node<T>, config?: EdgeOptions);
    linkWithPartner(partnerEdge: Edge<T>): void;
    get id(): G_UUID;
    get source(): Node<T>;
    get target(): Node<T>;
    get weight(): number;
    get partnerEdge(): Edge<T>;
}
/**
 * Represents a node in a graph, with a unique identifier and optional data.
 * @template T The type of data stored in this node.
 */
declare class Node<T> {
    private _id;
    private _data;
    private _edges;
    constructor(data: T);
    get id(): G_UUID;
    get data(): T;
    get edges(): Set<Edge<T>>;
    registerNewEdge(newEdge: Edge<T>): void;
    breakEdge(edge: Edge<T>): void;
    getConnectedNodes(): Node<T>[];
}
/**
 * Represents a node in a graph with a unique identifier, optional data, and a position in space.
 * @template T The type of data stored in this node.
 * @augments {Node<T>}
 */
declare class PositionNode<T> extends Node<T> {
    pos: Vector;
    constructor(data: T, pos: Vector);
}

interface RotateToOptions {
    /**
     * Absolute angle to rotate to in radians
     */
    angle: number;
    /**
     * Duration to take in milliseconds
     */
    duration: number;
    /**
     * Optionally provide type of rotation, default is RotationType.ShortestPath
     */
    rotationType?: RotationType;
}
/**
 *
 */
declare function isRotateToOptions(x: any): x is RotateToOptions;
declare class RotateToWithOptions implements Action {
    entity: Entity;
    id: number;
    private _durationMs;
    private _tx;
    private _started;
    private _currentMs;
    private _stopped;
    private _motion;
    private _endAngle;
    private _startAngle;
    private _rotationType;
    constructor(entity: Entity, options: RotateToOptions);
    update(elapsed: number): void;
    isComplete(entity: Entity): boolean;
    stop(): void;
    reset(): void;
}
declare class RotateTo implements Action {
    id: number;
    private _tx;
    private _motion;
    x: number;
    y: number;
    private _start;
    private _end;
    private _speed;
    private _rotationType;
    private _direction;
    private _distance;
    private _shortDistance;
    private _longDistance;
    private _shortestPathIsPositive;
    private _currentNonCannonAngle;
    private _started;
    private _stopped;
    constructor(entity: Entity, angle: number, speed: number, rotationType?: RotationType);
    update(elapsed: number): void;
    isComplete(): boolean;
    stop(): void;
    reset(): void;
}

interface RotateByOptions {
    /**
     * Angle in radians to offset from the current and rotate
     */
    angleRadiansOffset: number;
    /**
     * Duration to take in milliseconds
     */
    duration: number;
    /**
     * Optionally provide type of rotation, default is RotationType.ShortestPath
     */
    rotationType?: RotationType;
}
/**
 *
 */
declare function isRotateByOptions(x: any): x is RotateByOptions;
declare class RotateByWithOptions implements Action {
    entity: Entity;
    id: number;
    private _durationMs;
    private _tx;
    private _started;
    private _currentMs;
    private _stopped;
    private _motion;
    private _offset;
    private _startAngle;
    private _rotationType;
    private _endAngle;
    constructor(entity: Entity, options: RotateByOptions);
    update(elapsed: number): void;
    isComplete(): boolean;
    stop(): void;
    reset(): void;
}
declare class RotateBy implements Action {
    id: number;
    private _tx;
    private _motion;
    x: number;
    y: number;
    private _start;
    private _end;
    private _speed;
    private _offset;
    private _rotationType;
    private _direction;
    private _distance;
    private _shortDistance;
    private _longDistance;
    private _shortestPathIsPositive;
    private _currentNonCannonAngle;
    private _started;
    private _stopped;
    constructor(entity: Entity, angleRadiansOffset: number, speed: number, rotationType?: RotationType);
    update(elapsed: number): void;
    isComplete(): boolean;
    stop(): void;
    reset(): void;
}

interface ScaleToOptions {
    /**
     * Absolute scale to change to
     */
    scale: Vector;
    /**
     * Duration to take in milliseconds
     */
    duration: number;
}
/**
 *
 */
declare function isScaleToOptions(x: any): x is ScaleToOptions;
declare class ScaleToWithOptions implements Action {
    entity: Entity;
    id: number;
    private _durationMs;
    private _tx;
    private _started;
    private _currentMs;
    private _stopped;
    private _motion;
    private _endScale;
    private _startScale;
    constructor(entity: Entity, options: ScaleToOptions);
    update(elapsed: number): void;
    isComplete(): boolean;
    stop(): void;
    reset(): void;
}
declare class ScaleTo implements Action {
    id: number;
    private _tx;
    private _motion;
    x: number;
    y: number;
    private _startX;
    private _startY;
    private _endX;
    private _endY;
    private _speedX;
    private _speedY;
    private _distanceX;
    private _distanceY;
    private _started;
    private _stopped;
    constructor(entity: Entity, scaleX: number, scaleY: number, speedX: number, speedY: number);
    update(elapsed: number): void;
    isComplete(): boolean;
    stop(): void;
    reset(): void;
}

interface ScaleByOptions {
    /**
     * Absolute scale to change to
     */
    scaleOffset: Vector;
    /**
     * Duration to take in milliseconds
     */
    duration: number;
}
/**
 *
 */
declare function isScaleByOptions(x: any): x is ScaleByOptions;
declare class ScaleByWithOptions implements Action {
    entity: Entity;
    id: number;
    private _durationMs;
    private _tx;
    private _started;
    private _currentMs;
    private _stopped;
    private _motion;
    private _endScale;
    private _scaleOffset;
    private _startScale;
    constructor(entity: Entity, options: ScaleByOptions);
    update(elapsed: number): void;
    isComplete(): boolean;
    stop(): void;
    reset(): void;
}
declare class ScaleBy implements Action {
    id: number;
    private _tx;
    private _motion;
    x: number;
    y: number;
    private _startScale;
    private _endScale;
    private _offset;
    private _distanceX;
    private _distanceY;
    private _directionX;
    private _directionY;
    private _started;
    private _stopped;
    private _speedX;
    private _speedY;
    constructor(entity: Entity, scaleOffsetX: number, scaleOffsetY: number, speed: number);
    update(elapsed: number): void;
    isComplete(): boolean;
    stop(): void;
    reset(): void;
}

interface CurveToOptions {
    /**
     * Bezier Curve in world coordinates to animate towards
     *
     * The start control point is assumed to be the actor's current position
     */
    controlPoints: [control1: Vector, control2: Vector, end: Vector];
    /**
     * Total duration for the action to run
     */
    duration: number;
    /**
     * Dynamic mode will speed up/slow down depending on the curve
     *
     * Uniform mode will animate at a consistent velocity across the curve
     *
     * Default: 'dynamic'
     */
    mode?: 'dynamic' | 'uniform';
    /**
     * Quality when sampling uniform points on the curve. Samples = 4 * quality;
     *
     * For bigger 'uniform' curves you may want to increase quality
     *
     * Default 4
     */
    quality?: number;
}
declare class CurveTo implements Action {
    id: number;
    private _curve;
    private _durationMs;
    private _entity;
    private _tx;
    private _currentMs;
    private _started;
    private _stopped;
    private _mode;
    constructor(entity: Entity, options: CurveToOptions);
    update(elapsed: number): void;
    isComplete(entity: Entity): boolean;
    reset(): void;
    stop(): void;
}

interface CurveByOptions {
    /**
     * Bezier Curve relative to the current actor position to move
     */
    controlPoints: [control1: Vector, control2: Vector, end: Vector];
    /**
     * Total duration for the action to run
     */
    duration: number;
    /**
     * Dynamic mode will speed up/slow down depending on the curve
     *
     * Uniform mode will animate at a consistent velocity across the curve
     *
     * Default: 'dynamic'
     */
    mode?: 'dynamic' | 'uniform';
    /**
     * Quality when sampling uniform points on the curve. Samples = 4 * quality;
     *
     * For bigger 'uniform' curves you may want to increase quality to make the motion appear smooth
     *
     * Default 4
     */
    quality?: number;
}
declare class CurveBy implements Action {
    id: number;
    private _curve;
    private _durationMs;
    private _entity;
    private _tx;
    private _currentMs;
    private _started;
    private _stopped;
    private _mode;
    constructor(entity: Entity, options: CurveByOptions);
    update(elapsed: number): void;
    isComplete(entity: Entity): boolean;
    reset(): void;
    stop(): void;
}

/**
 * The fluent Action API allows you to perform "actions" on
 * {@apilink Actor | `actors`} such as following, moving, rotating, and
 * more. You can implement your own actions by implementing
 * the {@apilink Action} interface.
 */
declare class ActionContext {
    private _entity;
    private _queue;
    constructor(entity: Entity);
    getQueue(): ActionQueue;
    update(elapsed: number): void;
    /**
     * Clears all queued actions from the Actor
     */
    clearActions(): void;
    runAction(action: Action): this;
    /**
     * Animates an actor with a specified bezier curve by an offset to the current position, the start point is assumed
     * to be the actors current position
     * @param options
     */
    curveBy(options: CurveByOptions): ActionContext;
    /**
     * Animates an actor with a specified bezier curve to an absolute world space coordinate, the start point is assumed
     * to be the actors current position
     * @param options
     */
    curveTo(options: CurveToOptions): ActionContext;
    /**
     * This method will move an actor to the specified `x` and `y` position over the
     * specified duration using a given {@apilink EasingFunctions} and return back the actor. This
     * method is part of the actor 'Action' fluent API allowing action chaining.
     * @param pos       The x,y vector location to move the actor to
     * @param duration  The time it should take the actor to move to the new location in milliseconds
     * @param easingFcn Use {@apilink EasingFunction} or a custom function to use to calculate position, Default is {@apilink EasingFunctions.Linear}
     * @deprecated use new moveTo({pos: Vector, duration: number, easing: EasingFunction})
     */
    easeTo(pos: Vector, duration: number, easingFcn?: EasingFunction): ActionContext;
    /**
     * This method will move an actor to the specified `x` and `y` position over the
     * specified duration using a given {@apilink EasingFunctions} and return back the actor. This
     * method is part of the actor 'Action' fluent API allowing action chaining.
     * @param x         The x location to move the actor to
     * @param y         The y location to move the actor to
     * @param duration  The time it should take the actor to move to the new location in milliseconds
     * @param easingFcn Use {@apilink EasingFunction} or a custom function to use to calculate position, Default is {@apilink EasingFunctions.Linear}
     * @deprecated use new moveTo({pos: Vector, duration: number, easing: EasingFunction})
     */
    easeTo(x: number, y: number, duration: number, easingFcn?: EasingFunction): ActionContext;
    /**
     * This method will move an actor by a specified vector offset relative to the current position given
     * a duration and a {@apilink EasingFunction}. This method is part of the actor 'Action' fluent API allowing action chaining.
     * @param offset Vector offset relative to the current position
     * @param duration The duration in milliseconds
     * @param easingFcn Use {@apilink EasingFunction} or a custom function to use to calculate position, Default is {@apilink EasingFunctions.Linear}
     * @deprecated use new moveBy({offset: Vector, duration: number, easing: EasingFunction})
     */
    easeBy(offset: Vector, duration: number, easingFcn?: EasingFunction): ActionContext;
    /**
     * This method will move an actor by a specified x and y offset relative to the current position given
     * a duration and a {@apilink EasingFunction}. This method is part of the actor 'Action' fluent API allowing action chaining.
     * @param offset Vector offset relative to the current position
     * @param duration The duration in milliseconds
     * @param easingFcn Use {@apilink EasingFunction} or a custom function to use to calculate position, Default is {@apilink EasingFunctions.Linear}
     * @deprecated use new moveBy({offset: Vector, duration: number, easing: EasingFunction})
     */
    easeBy(offsetX: number, offsetY: number, duration: number, easingFcn?: EasingFunction): ActionContext;
    /**
     * Moves an actor to a specified {@link Vector} in a given duration in milliseconds.
     * You may optionally specify an {@link EasingFunction}
     * @param options
     */
    moveTo(options: MoveToOptions): ActionContext;
    /**
     * This method will move an actor to the specified x and y position at the
     * speed specified (in pixels per second) and return back the actor. This
     * method is part of the actor 'Action' fluent API allowing action chaining.
     * @param pos    The x,y vector location to move the actor to
     * @param speed  The speed in pixels per second to move
     */
    moveTo(pos: Vector, speed: number): ActionContext;
    /**
     * This method will move an actor to the specified x and y position at the
     * speed specified (in pixels per second) and return back the actor. This
     * method is part of the actor 'Action' fluent API allowing action chaining.
     * @param x      The x location to move the actor to
     * @param y      The y location to move the actor to
     * @param speed  The speed in pixels per second to move
     */
    moveTo(x: number, y: number, speed: number): ActionContext;
    /**
     * Moves an actor by a specified offset {@link Vector} in a given duration in milliseconds.
     * You may optionally specify an {@link EasingFunction}
     * @param options
     */
    moveBy(options: MoveByOptions): ActionContext;
    /**
     * This method will move an actor by the specified x offset and y offset from its current position, at a certain speed.
     * This method is part of the actor 'Action' fluent API allowing action chaining.
     * @param xOffset     The x offset to apply to this actor
     * @param yOffset     The y location to move the actor to
     * @param speed  The speed in pixels per second the actor should move
     */
    moveBy(offset: Vector, speed: number): ActionContext;
    moveBy(xOffset: number, yOffset: number, speed: number): ActionContext;
    /**
     * Rotates an actor to a specified angle over a duration in milliseconds,
     * you make pick a rotation strategy {@link RotationType} to pick the direction
     * @param options
     */
    rotateTo(options: RotateToOptions): ActionContext;
    /**
     * This method will rotate an actor to the specified angle at the speed
     * specified (in radians per second) and return back the actor. This
     * method is part of the actor 'Action' fluent API allowing action chaining.
     * @param angle  The angle to rotate to in radians
     * @param speed         The angular velocity of the rotation specified in radians per second
     * @param rotationType  The {@apilink RotationType} to use for this rotation
     */
    rotateTo(angle: number, speed: number, rotationType?: RotationType): ActionContext;
    /**
     * Rotates an actor by a specified offset angle over a duration in milliseconds,
     * you make pick a rotation strategy {@link RotationType} to pick the direction
     * @param options
     */
    rotateBy(options: RotateByOptions): ActionContext;
    /**
     * This method will rotate an actor by the specified angle offset, from it's current rotation given a certain speed
     * in radians/sec and return back the actor. This method is part
     * of the actor 'Action' fluent API allowing action chaining.
     * @param angleRadiansOffset  The angle to rotate to in radians relative to the current rotation
     * @param speed          The speed in radians/sec the actor should rotate at
     * @param rotationType  The {@apilink RotationType} to use for this rotation, default is shortest path
     */
    rotateBy(angleRadiansOffset: number, speed: number, rotationType?: RotationType): ActionContext;
    /**
     * Scales an actor to a specified scale {@link Vector} over a duration in milliseconds
     * @param options
     */
    scaleTo(options: ScaleToOptions): ActionContext;
    /**
     * This method will scale an actor to the specified size at the speed
     * specified (in magnitude increase per second) and return back the
     * actor. This method is part of the actor 'Action' fluent API allowing
     * action chaining.
     * @param size    The scale to adjust the actor to over time
     * @param speed   The speed of scaling specified in magnitude increase per second
     */
    scaleTo(size: Vector, speed: Vector): ActionContext;
    /**
     * This method will scale an actor to the specified size at the speed
     * specified (in magnitude increase per second) and return back the
     * actor. This method is part of the actor 'Action' fluent API allowing
     * action chaining.
     * @param sizeX   The scaling factor to apply on X axis
     * @param sizeY   The scaling factor to apply on Y axis
     * @param speedX  The speed of scaling specified in magnitude increase per second on X axis
     * @param speedY  The speed of scaling specified in magnitude increase per second on Y axis
     */
    scaleTo(sizeX: number, sizeY: number, speedX: number, speedY: number): ActionContext;
    /**
     * Scales an actor by a specified scale offset {@link Vector} over a duration in milliseconds
     * @param options
     */
    scaleBy(options: ScaleByOptions): ActionContext;
    /**
     * This method will scale an actor by an amount relative to the current scale at a certain speed in scale units/sec
     * and return back the actor. This method is part of the
     * actor 'Action' fluent API allowing action chaining.
     * @param offset   The scaling factor to apply to the actor
     * @param speed    The speed to scale at in scale units/sec
     */
    scaleBy(offset: Vector, speed: number): ActionContext;
    /**
     * This method will scale an actor by an amount relative to the current scale at a certain speed in scale units/sec
     * and return back the actor. This method is part of the
     * actor 'Action' fluent API allowing action chaining.
     * @param sizeOffsetX   The scaling factor to apply on X axis
     * @param sizeOffsetY   The scaling factor to apply on Y axis
     * @param speed    The speed to scale at in scale units/sec
     */
    scaleBy(sizeOffsetX: number, sizeOffsetY: number, speed: number): ActionContext;
    /**
     * This method will cause an actor to blink (become visible and not
     * visible). Optionally, you may specify the number of blinks. Specify the amount of time
     * the actor should be visible per blink, and the amount of time not visible.
     * This method is part of the actor 'Action' fluent API allowing action chaining.
     * @param timeVisible     The amount of time to stay visible per blink in milliseconds
     * @param timeNotVisible  The amount of time to stay not visible per blink in milliseconds
     * @param numBlinks       The number of times to blink
     */
    blink(timeVisible: number, timeNotVisible: number, numBlinks?: number): ActionContext;
    /**
     * This method will cause an actor's opacity to change from its current value
     * to the provided value by a specified time (in milliseconds). This method is
     * part of the actor 'Action' fluent API allowing action chaining.
     * @param opacity  The ending opacity
     * @param duration     The time it should take to fade the actor (in milliseconds)
     */
    fade(opacity: number, duration: number): ActionContext;
    /**
     * This will cause an actor to flash a specific color for a period of time
     * @param color
     * @param duration The duration in milliseconds
     */
    flash(color: Color, duration?: number): this;
    /**
     * This method will delay the next action from executing for a certain
     * amount of time (in milliseconds). This method is part of the actor
     * 'Action' fluent API allowing action chaining.
     * @param duration  The amount of time to delay the next action in the queue from executing in milliseconds
     */
    delay(duration: number): ActionContext;
    /**
     * This method will add an action to the queue that will remove the actor from the
     * scene once it has completed its previous  Any actions on the
     * action queue after this action will not be executed.
     */
    die(): ActionContext;
    /**
     * This method allows you to call an arbitrary method as the next action in the
     * action queue. This is useful if you want to execute code in after a specific
     * action, i.e An actor arrives at a destination after traversing a path
     */
    callMethod(method: () => any): ActionContext;
    /**
     * This method will cause the actor to repeat all of the actions built in
     * the `repeatBuilder` callback. If the number of repeats
     * is not specified it will repeat forever. This method is part of
     * the actor 'Action' fluent API allowing action chaining
     *
     * ```typescript
     * // Move up in a zig-zag by repeated moveBy's
     * actor.actions.repeat(repeatCtx => {
     * repeatCtx.moveBy(10, 0, 10);
     * repeatCtx.moveBy(0, 10, 10);
     * }, 5);
     * ```
     * @param repeatBuilder The builder to specify the repeatable list of actions
     * @param times  The number of times to repeat all the previous actions in the action queue. If nothing is specified the actions
     * will repeat forever
     */
    repeat(repeatBuilder: (repeatContext: ActionContext) => any, times?: number): ActionContext;
    /**
     * This method will cause the actor to repeat all of the actions built in
     * the `repeatBuilder` callback. If the number of repeats
     * is not specified it will repeat forever. This method is part of
     * the actor 'Action' fluent API allowing action chaining
     *
     * ```typescript
     * // Move up in a zig-zag by repeated moveBy's
     * actor.actions.repeat(repeatCtx => {
     * repeatCtx.moveBy(10, 0, 10);
     * repeatCtx.moveBy(0, 10, 10);
     * }, 5);
     * ```
     * @param repeatBuilder The builder to specify the repeatable list of actions
     */
    repeatForever(repeatBuilder: (repeatContext: ActionContext) => any): ActionContext;
    /**
     * This method will cause the entity to follow another at a specified distance
     * @param entity           The entity to follow
     * @param followDistance  The distance to maintain when following, if not specified the actor will follow at the current distance.
     */
    follow(entity: Entity, followDistance?: number): ActionContext;
    /**
     * This method will cause the entity to move towards another until they
     * collide "meet" at a specified speed.
     * @param entity  The entity to meet
     * @param speed  The speed in pixels per second to move, if not specified it will match the speed of the other actor
     * @param tolerance  The tolerance in pixels to meet, if not specified it will be 1 pixel
     */
    meet(entity: Entity, speed?: number, tolerance?: number): ActionContext;
    /**
     * Returns a promise that resolves when the current action queue up to now
     * is finished.
     */
    toPromise(): Promise<void>;
}

interface Actionable {
    actions: ActionContext;
}

/**
 * Action that can represent a sequence of actions, this can be useful in conjunction with
 * {@apilink ParallelActions} to run multiple sequences in parallel.
 */
declare class ActionSequence implements Action {
    id: number;
    private _actionQueue;
    private _stopped;
    private _sequenceContext;
    private _sequenceBuilder;
    constructor(entity: Entity, actionBuilder: (actionContext: ActionContext) => any);
    update(elapsed: number): void;
    isComplete(): boolean;
    stop(): void;
    reset(): void;
    clone(entity: Entity): ActionSequence;
}

/**
 * Action that can run multiple {@apilink Action}s or {@apilink ActionSequence}s at the same time
 */
declare class ParallelActions implements Action {
    id: number;
    private _actions;
    constructor(parallelActions: Action[]);
    update(elapsed: number): void;
    isComplete(entity: Entity): boolean;
    reset(): void;
    stop(): void;
}

declare class Repeat implements Action {
    id: number;
    private _actionQueue;
    private _repeat;
    private _originalRepeat;
    private _stopped;
    private _repeatContext;
    private _repeatBuilder;
    constructor(entity: Entity, repeatBuilder: (repeatContext: ActionContext) => any, repeat: number);
    update(elapsed: number): void;
    isComplete(): boolean;
    stop(): void;
    reset(): void;
}

/**
 * RepeatForever Action implementation, it is recommended you use the fluent action
 * context API.
 *
 *
 */
declare class RepeatForever implements Action {
    id: number;
    private _actionQueue;
    private _stopped;
    private _repeatContext;
    private _repeatBuilder;
    constructor(entity: Entity, repeatBuilder: (repeatContext: ActionContext) => any);
    update(elapsed: number): void;
    isComplete(): boolean;
    stop(): void;
    reset(): void;
}

declare class Blink implements Action {
    id: number;
    private _graphics;
    private _timeVisible;
    private _timeNotVisible;
    private _elapsedTime;
    private _totalTime;
    private _duration;
    private _stopped;
    private _started;
    constructor(entity: Entity, timeVisible: number, timeNotVisible: number, numBlinks?: number);
    update(elapsed: number): void;
    isComplete(): boolean;
    stop(): void;
    reset(): void;
}

declare class Die implements Action {
    id: number;
    private _entity;
    private _stopped;
    constructor(entity: Entity);
    update(elapsed: number): void;
    isComplete(): boolean;
    stop(): void;
    reset(): void;
}

/**
 * @deprecated use moveTo({pos: Vector, duration: number, easing: EasingFunction})
 */
declare class EaseTo implements Action {
    easingFcn: (currentTime: number, startValue: number, endValue: number, duration: number) => number;
    id: number;
    private _tx;
    private _motion;
    private _currentLerpTime;
    private _lerpDuration;
    private _lerpStart;
    private _lerpEnd;
    private _initialized;
    private _stopped;
    constructor(entity: Entity, x: number, y: number, duration: number, easingFcn: (currentTime: number, startValue: number, endValue: number, duration: number) => number);
    private _initialize;
    update(elapsed: number): void;
    isComplete(): boolean;
    reset(): void;
    stop(): void;
}

/**
 * @deprecated use moveBy({offset: Vector, duration: number, easing: EasingFunction})
 */
declare class EaseBy implements Action {
    easingFcn: (currentTime: number, startValue: number, endValue: number, duration: number) => number;
    id: number;
    private _tx;
    private _motion;
    private _currentLerpTime;
    private _lerpDuration;
    private _lerpStart;
    private _lerpEnd;
    private _offset;
    private _initialized;
    private _stopped;
    constructor(entity: Entity, offsetX: number, offsetY: number, duration: number, easingFcn: (currentTime: number, startValue: number, endValue: number, duration: number) => number);
    private _initialize;
    update(elapsed: number): void;
    isComplete(): boolean;
    reset(): void;
    stop(): void;
}

declare class Fade implements Action {
    id: number;
    private _graphics;
    private _endOpacity;
    private _remainingTime;
    private _originalTime;
    private _multiplier;
    private _started;
    private _stopped;
    constructor(entity: Entity, endOpacity: number, duration: number);
    update(elapsed: number): void;
    isComplete(): boolean;
    stop(): void;
    reset(): void;
}

declare class Follow implements Action {
    id: number;
    private _tx;
    private _motion;
    private _followTx;
    private _followMotion;
    x: number;
    y: number;
    private _current;
    private _end;
    private _dir;
    private _speed;
    private _maximumDistance;
    private _distanceBetween;
    private _started;
    private _stopped;
    constructor(entity: Entity, entityToFollow: Entity, followDistance?: number);
    update(elapsed: number): void;
    stop(): void;
    isComplete(): boolean;
    reset(): void;
}

declare class Meet implements Action {
    id: number;
    private _tx;
    private _motion;
    private _meetTx;
    private _meetMotion;
    x: number;
    y: number;
    private _current;
    private _end;
    private _dir;
    private _speed;
    private _distanceBetween;
    private _started;
    private _stopped;
    private _speedWasSpecified;
    private _tolerance;
    constructor(actor: Entity, actorToMeet: Entity, speed?: number, tolerance?: number);
    update(elapsed: number): void;
    isComplete(): boolean;
    stop(): void;
    reset(): void;
}

declare class Delay implements Action {
    id: number;
    private _elapsedTime;
    private _delay;
    private _started;
    private _stopped;
    constructor(duration: number);
    update(elapsed: number): void;
    isComplete(): boolean;
    stop(): void;
    reset(): void;
}

declare class Flash implements Action {
    id: number;
    private _graphics;
    private _duration;
    private _stopped;
    private _started;
    private _entity;
    private _material;
    private _total;
    private _currentDuration;
    constructor(entity: Entity, color: Color, duration?: number);
    update(elapsed: number): void;
    isComplete(): boolean;
    stop(): void;
    reset(): void;
}

declare class ActionsSystem extends System {
    world: World;
    static priority: -5;
    systemType: SystemType;
    private _actions;
    query: Query<typeof ActionsComponent>;
    constructor(world: World);
    update(elapsed: number): void;
}

interface ActionContextMethods extends Pick<ActionContext, keyof ActionContext> {
}
declare class ActionsComponent extends Component implements ActionContextMethods {
    dependencies: (typeof TransformComponent | typeof MotionComponent)[];
    private _ctx;
    onAdd(entity: Entity): void;
    onRemove(): void;
    private _getCtx;
    /**
     * Returns the internal action queue
     * @returns action queue
     */
    getQueue(): ActionQueue;
    /**
     * Runs a specific action in the action queue
     * @param action
     */
    runAction(action: Action): ActionContext;
    /**
     * Updates the internal action context, performing action and moving through the internal queue
     * @param elapsed
     */
    update(elapsed: number): void;
    /**
     * Clears all queued actions from the Actor
     */
    clearActions(): void;
    /**
     * Animates an actor with a specified bezier curve by an offset to the current position, the start point is assumed
     * to be the actors current position
     * @param options
     */
    curveBy(options: CurveByOptions): ActionContext;
    /**
     * Animates an actor with a specified bezier curve to an absolute world space coordinate, the start point is assumed
     * to be the actors current position
     * @param options
     */
    curveTo(options: CurveToOptions): ActionContext;
    /**
     * This method will move an actor to the specified `x` and `y` position over the
     * specified duration using a given {@apilink EasingFunctions} and return back the actor. This
     * method is part of the actor 'Action' fluent API allowing action chaining.
     * @param pos       The x,y vector location to move the actor to
     * @param duration  The time it should take the actor to move to the new location in milliseconds
     * @param easingFcn Use {@apilink EasingFunctions} or a custom function to use to calculate position, Default is {@apilink EasingFunctions.Linear}
     * @deprecated use new moveTo({pos: Vector, duration: number, easing: EasingFunction})
     */
    easeTo(pos: Vector, duration: number, easingFcn?: EasingFunction): ActionContext;
    /**
     * This method will move an actor to the specified `x` and `y` position over the
     * specified duration using a given {@apilink EasingFunctions} and return back the actor. This
     * method is part of the actor 'Action' fluent API allowing action chaining.
     * @param x         The x location to move the actor to
     * @param y         The y location to move the actor to
     * @param duration  The time it should take the actor to move to the new location in milliseconds
     * @param easingFcn Use {@apilink EasingFunctions} or a custom function to use to calculate position, Default is {@apilink EasingFunctions.Linear}
     * @deprecated use new moveTo({pos: Vector, duration: number, easing: EasingFunction})
     */
    easeTo(x: number, y: number, duration: number, easingFcn?: EasingFunction): ActionContext;
    /**
     *
     * @param offset
     * @param duration
     * @param easingFcn
     * @deprecated use new moveBy({pos: Vector, duration: number, easing: EasingFunction})
     */
    easeBy(offset: Vector, duration: number, easingFcn?: EasingFunction): ActionContext;
    /**
     *
     * @param offsetX
     * @param offsetY
     * @param duration
     * @param easingFcn
     * @deprecated use new moveBy({pos: Vector, duration: number, easing: EasingFunction})
     */
    easeBy(offsetX: number, offsetY: number, duration: number, easingFcn?: EasingFunction): ActionContext;
    /**
     * Moves an actor to a specified {@link Vector} in a given duration in milliseconds.
     * You may optionally specify an {@link EasingFunction}
     * @param options
     */
    moveTo(options: MoveToOptions): ActionContext;
    /**
     * This method will move an actor to the specified x and y position at the
     * speed specified (in pixels per second) and return back the actor. This
     * method is part of the actor 'Action' fluent API allowing action chaining.
     * @param pos    The x,y vector location to move the actor to
     * @param speed  The speed in pixels per second to move
     */
    moveTo(pos: Vector, speed: number): ActionContext;
    /**
     * This method will move an actor to the specified x and y position at the
     * speed specified (in pixels per second) and return back the actor. This
     * method is part of the actor 'Action' fluent API allowing action chaining.
     * @param x      The x location to move the actor to
     * @param y      The y location to move the actor to
     * @param speed  The speed in pixels per second to move
     */
    moveTo(x: number, y: number, speed: number): ActionContext;
    /**
     * Moves an actor by a specified offset {@link Vector} in a given duration in milliseconds.
     * You may optionally specify an {@link EasingFunction}
     * @param options
     */
    moveBy(options: MoveByOptions): ActionContext;
    /**
     * This method will move an actor by the specified x offset and y offset from its current position, at a certain speed.
     * This method is part of the actor 'Action' fluent API allowing action chaining.
     * @param offset The (x, y) offset to apply to this actor
     * @param speed  The speed in pixels per second the actor should move
     */
    moveBy(offset: Vector, speed: number): ActionContext;
    /**
     * This method will move an actor by the specified x offset and y offset from its current position, at a certain speed.
     * This method is part of the actor 'Action' fluent API allowing action chaining.
     * @param xOffset     The x offset to apply to this actor
     * @param yOffset     The y location to move the actor to
     * @param speed  The speed in pixels per second the actor should move
     */
    moveBy(xOffset: number, yOffset: number, speed: number): ActionContext;
    /**
     * Rotates an actor to a specified angle over a duration in milliseconds,
     * you make pick a rotation strategy {@link RotationType} to pick the direction
     * @param options
     */
    rotateTo(options: RotateToOptions): ActionContext;
    /**
     * This method will rotate an actor to the specified angle at the speed
     * specified (in radians per second) and return back the actor. This
     * method is part of the actor 'Action' fluent API allowing action chaining.
     * @param angle  The angle to rotate to in radians
     * @param speed         The angular velocity of the rotation specified in radians per second
     * @param rotationType  The {@apilink RotationType} to use for this rotation
     */
    rotateTo(angle: number, speed: number, rotationType?: RotationType): ActionContext;
    /**
     * Rotates an actor by a specified offset angle over a duration in milliseconds,
     * you make pick a rotation strategy {@link RotationType} to pick the direction
     * @param options
     */
    rotateBy(options: RotateByOptions): ActionContext;
    /**
     * This method will rotate an actor by the specified angle offset, from it's current rotation given a certain speed
     * in radians/sec and return back the actor. This method is part
     * of the actor 'Action' fluent API allowing action chaining.
     * @param angleRadiansOffset  The angle to rotate to in radians relative to the current rotation
     * @param speed          The speed in radians/sec the actor should rotate at
     * @param rotationType  The {@apilink RotationType} to use for this rotation, default is shortest path
     */
    rotateBy(angleRadiansOffset: number, speed: number, rotationType?: RotationType): ActionContext;
    /**
     * Scales an actor to a specified scale {@link Vector} over a duration
     * @param options
     */
    scaleTo(options: ScaleToOptions): ActionContext;
    /**
     * This method will scale an actor to the specified size at the speed
     * specified (in magnitude increase per second) and return back the
     * actor. This method is part of the actor 'Action' fluent API allowing
     * action chaining.
     * @param size    The scale to adjust the actor to over time
     * @param speed   The speed of scaling specified in magnitude increase per second
     */
    scaleTo(size: Vector, speed: Vector): ActionContext;
    /**
     * This method will scale an actor to the specified size at the speed
     * specified (in magnitude increase per second) and return back the
     * actor. This method is part of the actor 'Action' fluent API allowing
     * action chaining.
     * @param sizeX   The scaling factor to apply on X axis
     * @param sizeY   The scaling factor to apply on Y axis
     * @param speedX  The speed of scaling specified in magnitude increase per second on X axis
     * @param speedY  The speed of scaling specified in magnitude increase per second on Y axis
     */
    scaleTo(sizeX: number, sizeY: number, speedX: number, speedY: number): ActionContext;
    /**
     * Scales an actor by a specified scale offset {@link Vector} over a duration in milliseconds
     * @param options
     */
    scaleBy(options: ScaleByOptions): ActionContext;
    /**
     * This method will scale an actor by an amount relative to the current scale at a certain speed in scale units/sec
     * and return back the actor. This method is part of the
     * actor 'Action' fluent API allowing action chaining.
     * @param offset   The scaling factor to apply to the actor
     * @param speed    The speed to scale at in scale units/sec
     */
    scaleBy(offset: Vector, speed: number): ActionContext;
    /**
     * This method will scale an actor by an amount relative to the current scale at a certain speed in scale units/sec
     * and return back the actor. This method is part of the
     * actor 'Action' fluent API allowing action chaining.
     * @param sizeOffsetX   The scaling factor to apply on X axis
     * @param sizeOffsetY   The scaling factor to apply on Y axis
     * @param speed    The speed to scale at in scale units/sec
     */
    scaleBy(sizeOffsetX: number, sizeOffsetY: number, speed: number): ActionContext;
    /**
     * This method will cause an actor to blink (become visible and not
     * visible). Optionally, you may specify the number of blinks. Specify the amount of time
     * the actor should be visible per blink, and the amount of time not visible.
     * This method is part of the actor 'Action' fluent API allowing action chaining.
     * @param timeVisible     The amount of time to stay visible per blink in milliseconds
     * @param timeNotVisible  The amount of time to stay not visible per blink in milliseconds
     * @param numBlinks       The number of times to blink
     */
    blink(timeVisible: number, timeNotVisible: number, numBlinks?: number): ActionContext;
    /**
     * This method will cause an actor's opacity to change from its current value
     * to the provided value by a specified time (in milliseconds). This method is
     * part of the actor 'Action' fluent API allowing action chaining.
     * @param opacity  The ending opacity
     * @param duration     The time it should take to fade the actor (in milliseconds)
     */
    fade(opacity: number, duration: number): ActionContext;
    /**
     * This will cause an actor to flash a specific color for a period of time
     * @param color
     * @param duration The duration in milliseconds
     */
    flash(color: Color, duration?: number): ActionContext;
    /**
     * This method will delay the next action from executing for a certain
     * amount of time (in milliseconds). This method is part of the actor
     * 'Action' fluent API allowing action chaining.
     * @param duration  The amount of time to delay the next action in the queue from executing in milliseconds
     */
    delay(duration: number): ActionContext;
    /**
     * This method will add an action to the queue that will remove the actor from the
     * scene once it has completed its previous  Any actions on the
     * action queue after this action will not be executed.
     */
    die(): ActionContext;
    /**
     * This method allows you to call an arbitrary method as the next action in the
     * action queue. This is useful if you want to execute code in after a specific
     * action, i.e An actor arrives at a destination after traversing a path
     */
    callMethod(method: () => any): ActionContext;
    /**
     * This method will cause the actor to repeat all of the actions built in
     * the `repeatBuilder` callback. If the number of repeats
     * is not specified it will repeat forever. This method is part of
     * the actor 'Action' fluent API allowing action chaining
     *
     * ```typescript
     * // Move up in a zig-zag by repeated moveBy's
     * actor.actions.repeat(repeatCtx => {
     * repeatCtx.moveBy(10, 0, 10);
     * repeatCtx.moveBy(0, 10, 10);
     * }, 5);
     * ```
     * @param repeatBuilder The builder to specify the repeatable list of actions
     * @param times  The number of times to repeat all the previous actions in the action queue. If nothing is specified the actions
     * will repeat forever
     */
    repeat(repeatBuilder: (repeatContext: ActionContext) => any, times?: number): ActionContext;
    /**
     * This method will cause the actor to repeat all of the actions built in
     * the `repeatBuilder` callback. If the number of repeats
     * is not specified it will repeat forever. This method is part of
     * the actor 'Action' fluent API allowing action chaining
     *
     * ```typescript
     * // Move up in a zig-zag by repeated moveBy's
     * actor.actions.repeat(repeatCtx => {
     * repeatCtx.moveBy(10, 0, 10);
     * repeatCtx.moveBy(0, 10, 10);
     * }, 5);
     * ```
     * @param repeatBuilder The builder to specify the repeatable list of actions
     */
    repeatForever(repeatBuilder: (repeatContext: ActionContext) => any): ActionContext;
    /**
     * This method will cause the entity to follow another at a specified distance
     * @param entity           The entity to follow
     * @param followDistance  The distance to maintain when following, if not specified the actor will follow at the current distance.
     */
    follow(entity: Actor, followDistance?: number): ActionContext;
    /**
     * This method will cause the entity to move towards another until they
     * collide "meet" at a specified speed.
     * @param entity  The entity to meet
     * @param speed  The speed in pixels per second to move, if not specified it will match the speed of the other actor
     */
    meet(entity: Actor, speed?: number): ActionContext;
    /**
     * Returns a promise that resolves when the current action queue up to now
     * is finished.
     */
    toPromise(): Promise<void>;
}

/**
 * Type guard for checking if something is an Actor
 * @param x
 */
declare function isActor(x: any): x is Actor;
/**
 * Actor constructor options
 */
type ActorArgs = ColliderArgs & {
    /**
     * Optionally set the name of the actor, default is 'anonymous'
     */
    name?: string;
    /**
     * Optionally set the x position of the actor, default is 0
     */
    x?: number;
    /**
     * Optionally set the y position of the actor, default is 0
     */
    y?: number;
    /**
     * Optionally set the (x, y) position of the actor as a vector, default is (0, 0)
     */
    pos?: Vector;
    /**
     * Optionally set the coordinate plane of the actor, default is {@apilink CoordPlane.World} meaning actor is subject to camera positioning
     */
    coordPlane?: CoordPlane;
    /**
     * Optionally set the velocity of the actor in pixels/sec
     */
    vel?: Vector;
    /**
     * Optionally set the acceleration of the actor in pixels/sec^2
     */
    acc?: Vector;
    /**
     * Optionally se the rotation in radians (180 degrees = Math.PI radians)
     */
    rotation?: number;
    /**
     * Optionally set the angular velocity of the actor in radians/sec (180 degrees = Math.PI radians)
     */
    angularVelocity?: number;
    /**
     * Optionally set the scale of the actor's transform
     */
    scale?: Vector;
    /**
     * Optionally set the z index of the actor, default is 0
     */
    z?: number;
    /**
     * Optionally set the color of an actor, only used if no graphics are present
     * If a width/height or a radius was set a default graphic will be added
     */
    color?: Color;
    /**
     * Optionally set the color of an actor, only used if no graphics are present
     * If a width/height or a radius was set a default graphic will be added
     */
    opacity?: number;
    /**
     * Optionally set the visibility of the actor
     */
    visible?: boolean;
    /**
     * Optionally set the anchor for graphics in the actor
     */
    anchor?: Vector;
    /**
     * Optionally set the anchor for graphics in the actor
     */
    offset?: Vector;
    /**
     * Optionally set the collision type
     */
    collisionType?: CollisionType;
    /**
     * Optionally supply a {@apilink CollisionGroup}
     */
    collisionGroup?: CollisionGroup;
};
type ColliderArgs = // custom collider
{
    /**
     * Optionally supply a collider for an actor, if supplied ignores any supplied width/height
     *
     * No default graphigc is created in this case
     */
    collider?: Collider;
    width?: undefined;
    height?: undefined;
    radius?: undefined;
    color?: undefined;
} | {
    /**
     * Optionally set the width of a box collider for the actor
     */
    width?: number;
    /**
     * Optionally set the height of a box collider for the actor
     */
    height?: number;
    /**
     * Optionally set the color of a rectangle graphic for the actor
     */
    color?: Color;
    collider?: undefined;
    radius?: undefined;
} | {
    /**
     * Optionally set the radius of the circle collider for the actor
     */
    radius?: number;
    /**
     * Optionally set the color on a circle graphic for the actor
     */
    color?: Color;
    collider?: undefined;
    width?: undefined;
    height?: undefined;
};
type ActorEvents = EntityEvents & {
    collisionstart: CollisionStartEvent;
    collisionend: CollisionEndEvent;
    precollision: PreCollisionEvent;
    postcollision: PostCollisionEvent;
    kill: KillEvent;
    prekill: PreKillEvent;
    postkill: PostKillEvent;
    predraw: PreDrawEvent;
    postdraw: PostDrawEvent;
    pretransformdraw: PreDrawEvent;
    posttransformdraw: PostDrawEvent;
    predebugdraw: PreDebugDrawEvent;
    postdebugdraw: PostDebugDrawEvent;
    pointerup: PointerEvent;
    pointerdown: PointerEvent;
    pointerenter: PointerEvent;
    pointerleave: PointerEvent;
    pointermove: PointerEvent;
    pointercancel: PointerEvent;
    pointerwheel: WheelEvent;
    pointerdragstart: PointerEvent;
    pointerdragend: PointerEvent;
    pointerdragenter: PointerEvent;
    pointerdragleave: PointerEvent;
    pointerdragmove: PointerEvent;
    enterviewport: EnterViewPortEvent;
    exitviewport: ExitViewPortEvent;
    actionstart: ActionStartEvent;
    actioncomplete: ActionCompleteEvent;
};
declare const ActorEvents: {
    readonly CollisionStart: "collisionstart";
    readonly CollisionEnd: "collisionend";
    readonly PreCollision: "precollision";
    readonly PostCollision: "postcollision";
    readonly Kill: "kill";
    readonly PreKill: "prekill";
    readonly PostKill: "postkill";
    readonly PreDraw: "predraw";
    readonly PostDraw: "postdraw";
    readonly PreTransformDraw: "pretransformdraw";
    readonly PostTransformDraw: "posttransformdraw";
    readonly PreDebugDraw: "predebugdraw";
    readonly PostDebugDraw: "postdebugdraw";
    readonly PointerUp: "pointerup";
    readonly PointerDown: "pointerdown";
    readonly PointerEnter: "pointerenter";
    readonly PointerLeave: "pointerleave";
    readonly PointerMove: "pointermove";
    readonly PointerCancel: "pointercancel";
    readonly Wheel: "pointerwheel";
    readonly PointerDrag: "pointerdragstart";
    readonly PointerDragEnd: "pointerdragend";
    readonly PointerDragEnter: "pointerdragenter";
    readonly PointerDragLeave: "pointerdragleave";
    readonly PointerDragMove: "pointerdragmove";
    readonly EnterViewPort: "enterviewport";
    readonly ExitViewPort: "exitviewport";
    readonly ActionStart: "actionstart";
    readonly ActionComplete: "actioncomplete";
};
/**
 * The most important primitive in Excalibur is an `Actor`. Anything that
 * can move on the screen, collide with another `Actor`, respond to events,
 * or interact with the current scene, must be an actor. An `Actor` **must**
 * be part of a {@apilink Scene} for it to be drawn to the screen.
 */
declare class Actor extends Entity implements Eventable, PointerEvents$1, CanInitialize, CanUpdate, CanBeKilled {
    events: EventEmitter<ActorEvents>;
    /**
     * Set defaults for all Actors
     */
    static defaults: {
        anchor: Vector;
    };
    /**
     * The physics body the is associated with this actor. The body is the container for all physical properties, like position, velocity,
     * acceleration, mass, inertia, etc.
     */
    body: BodyComponent;
    /**
     * Access the Actor's built in {@apilink TransformComponent}
     */
    transform: TransformComponent;
    /**
     * Access the Actor's built in {@apilink MotionComponent}
     */
    motion: MotionComponent;
    /**
     * Access to the Actor's built in {@apilink GraphicsComponent}
     */
    graphics: GraphicsComponent;
    /**
     * Access to the Actor's built in {@apilink ColliderComponent}
     */
    collider: ColliderComponent;
    /**
     * Access to the Actor's built in {@apilink PointerComponent} config
     */
    pointer: PointerComponent;
    /**
     * Useful for quickly scripting actor behavior, like moving to a place, patrolling back and forth, blinking, etc.
     *
     *  Access to the Actor's built in {@apilink ActionsComponent} which forwards to the
     * {@apilink ActionContext | `Action context`} of the actor.
     */
    actions: ActionsComponent;
    /**
     * Gets the position vector of the actor in pixels
     */
    get pos(): Vector;
    /**
     * Sets the position vector of the actor in pixels
     */
    set pos(thePos: Vector);
    /**
     * Gets the position vector of the actor from the last frame
     */
    get oldPos(): Vector;
    /**
     * Gets the global position vector of the actor from the last frame
     */
    get oldGlobalPos(): Vector;
    /**
     * Sets the position vector of the actor in the last frame
     */
    set oldPos(thePos: Vector);
    /**
     * Gets the velocity vector of the actor in pixels/sec
     */
    get vel(): Vector;
    /**
     * Sets the velocity vector of the actor in pixels/sec
     */
    set vel(theVel: Vector);
    /**
     * Gets the velocity vector of the actor from the last frame
     */
    get oldVel(): Vector;
    /**
     * Sets the velocity vector of the actor from the last frame
     */
    set oldVel(theVel: Vector);
    /**
     * Gets the acceleration vector of the actor in pixels/second/second. An acceleration pointing down such as (0, 100) may be
     * useful to simulate a gravitational effect.
     */
    get acc(): Vector;
    /**
     * Sets the acceleration vector of teh actor in pixels/second/second
     */
    set acc(theAcc: Vector);
    /**
     * Sets the acceleration of the actor from the last frame. This does not include the global acc {@apilink Physics.acc}.
     */
    set oldAcc(theAcc: Vector);
    /**
     * Gets the acceleration of the actor from the last frame. This does not include the global acc {@apilink Physics.acc}.
     */
    get oldAcc(): Vector;
    /**
     * Gets the rotation of the actor in radians. 1 radian = 180/PI Degrees.
     */
    get rotation(): number;
    /**
     * Sets the rotation of the actor in radians. 1 radian = 180/PI Degrees.
     */
    set rotation(theAngle: number);
    /**
     * Gets the rotational velocity of the actor in radians/second
     */
    get angularVelocity(): number;
    /**
     * Sets the rotational velocity of the actor in radians/sec
     */
    set angularVelocity(angularVelocity: number);
    get scale(): Vector;
    set scale(scale: Vector);
    private _anchor;
    /**
     * The anchor to apply all actor related transformations like rotation,
     * translation, and scaling. By default the anchor is in the center of
     * the actor. By default it is set to the center of the actor (.5, .5)
     *
     * An anchor of (.5, .5) will ensure that drawings are centered.
     *
     * Use `anchor.setTo` to set the anchor to a different point using
     * values between 0 and 1. For example, anchoring to the top-left would be
     * `Actor.anchor.setTo(0, 0)` and top-right would be `Actor.anchor.setTo(0, 1)`.
     */
    get anchor(): Vector;
    set anchor(vec: Vector);
    private _handleAnchorChange;
    private _offset;
    /**
     * The offset in pixels to apply to all actor graphics
     *
     * Default offset of (0, 0)
     */
    get offset(): Vector;
    set offset(vec: Vector);
    private _handleOffsetChange;
    /**
     * Indicates whether the actor is physically in the viewport
     */
    get isOffScreen(): boolean;
    /**
     * Convenience reference to the global logger
     */
    logger: Logger;
    /**
     * Draggable helper
     */
    private _draggable;
    private _dragging;
    private _pointerDragStartHandler;
    private _pointerDragEndHandler;
    private _pointerDragMoveHandler;
    private _pointerDragLeaveHandler;
    get draggable(): boolean;
    set draggable(isDraggable: boolean);
    /**
     * Sets the color of the actor's current graphic
     */
    get color(): Color;
    set color(v: Color);
    /**
     *
     * @param config
     */
    constructor(config?: ActorArgs);
    clone(): Actor;
    /**
     * `onInitialize` is called before the first update of the actor. This method is meant to be
     * overridden. This is where initialization of child actors should take place.
     *
     * Synonymous with the event handler `.on('initialize', (evt) => {...})`
     */
    onInitialize(engine: Engine): void;
    /**
     * Initializes this actor and all it's child actors, meant to be called by the Scene before first update not by users of Excalibur.
     *
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     * @internal
     */
    _initialize(engine: Engine): void;
    emit<TEventName extends EventKey<ActorEvents>>(eventName: TEventName, event: ActorEvents[TEventName]): void;
    emit(eventName: string, event?: any): void;
    on<TEventName extends EventKey<ActorEvents>>(eventName: TEventName, handler: Handler<ActorEvents[TEventName]>): Subscription;
    on(eventName: string, handler: Handler<unknown>): Subscription;
    once<TEventName extends EventKey<ActorEvents>>(eventName: TEventName, handler: Handler<ActorEvents[TEventName]>): Subscription;
    once(eventName: string, handler: Handler<unknown>): Subscription;
    off<TEventName extends EventKey<ActorEvents>>(eventName: TEventName, handler: Handler<ActorEvents[TEventName]>): void;
    off(eventName: string, handler: Handler<unknown>): void;
    off(eventName: string): void;
    /**
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * Internal _prekill handler for {@apilink onPreKill} lifecycle event
     * @internal
     */
    _prekill(scene: Scene): void;
    /**
     * Safe to override onPreKill lifecycle event handler. Synonymous with `.on('prekill', (evt) =>{...})`
     *
     * `onPreKill` is called directly before an actor is killed and removed from its current {@apilink Scene}.
     */
    onPreKill(scene: Scene): void;
    /**
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * Internal _prekill handler for {@apilink onPostKill} lifecycle event
     * @internal
     */
    _postkill(scene: Scene): void;
    /**
     * Safe to override onPostKill lifecycle event handler. Synonymous with `.on('postkill', (evt) => {...})`
     *
     * `onPostKill` is called directly after an actor is killed and remove from its current {@apilink Scene}.
     */
    onPostKill(scene: Scene): void;
    /**
     * If the current actor is a member of the scene, this will remove
     * it from the scene graph. It will no longer be drawn or updated.
     */
    kill(): void;
    /**
     * If the current actor is killed, it will now not be killed.
     */
    unkill(): void;
    /**
     * Indicates wether the actor has been killed.
     */
    isKilled(): boolean;
    /**
     * Gets the z-index of an actor. The z-index determines the relative order an actor is drawn in.
     * Actors with a higher z-index are drawn on top of actors with a lower z-index
     */
    get z(): number;
    /**
     * Sets the z-index of an actor and updates it in the drawing list for the scene.
     * The z-index determines the relative order an actor is drawn in.
     * Actors with a higher z-index are drawn on top of actors with a lower z-index
     * @param newZ new z-index to assign
     */
    set z(newZ: number);
    /**
     * Get the center point of an actor (global position)
     */
    get center(): Vector;
    /**
     * Get the local center point of an actor
     */
    get localCenter(): Vector;
    get width(): number;
    get height(): number;
    /**
     * Gets this actor's rotation taking into account any parent relationships
     * @returns Rotation angle in radians
     * @deprecated Use {@apilink globalRotation} instead
     */
    getGlobalRotation(): number;
    /**
     * The actor's rotation (in radians) taking into account any parent relationships
     */
    get globalRotation(): number;
    /**
     * Gets an actor's world position taking into account parent relationships, scaling, rotation, and translation
     * @returns Position in world coordinates
     * @deprecated Use {@apilink globalPos} instead
     */
    getGlobalPos(): Vector;
    /**
     * The actor's world position taking into account parent relationships, scaling, rotation, and translation
     */
    get globalPos(): Vector;
    /**
     * Gets the global scale of the Actor
     * @deprecated Use {@apilink globalScale} instead
     */
    getGlobalScale(): Vector;
    /**
     * The global scale of the Actor
     */
    get globalScale(): Vector;
    /**
     * The global z-index of the actor
     */
    get globalZ(): number;
    /**
     * Tests whether the x/y specified are contained in the actor
     * @param x  X coordinate to test (in world coordinates)
     * @param y  Y coordinate to test (in world coordinates)
     * @param recurse checks whether the x/y are contained in any child actors (if they exist).
     */
    contains(x: number, y: number, recurse?: boolean): boolean;
    /**
     * Returns true if the two actor.collider's surfaces are less than or equal to the distance specified from each other
     * @param actor     Actor to test
     * @param distance  Distance in pixels to test
     */
    within(actor: Actor, distance: number): boolean;
    /**
     * Called by the Engine, updates the state of the actor
     * @internal
     * @param engine The reference to the current game engine
     * @param elapsed  The time elapsed since the last update in milliseconds
     */
    update(engine: Engine, elapsed: number): void;
    /**
     * Safe to override onPreUpdate lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
     *
     * `onPreUpdate` is called directly before an actor is updated.
     * @param engine The reference to the current game engine
     * @param elapsed  The time elapsed since the last update in milliseconds
     */
    onPreUpdate(engine: Engine, elapsed: number): void;
    /**
     * Safe to override onPostUpdate lifecycle event handler. Synonymous with `.on('postupdate', (evt) =>{...})`
     *
     * `onPostUpdate` is called directly after an actor is updated.
     * @param engine The reference to the current game engine
     * @param elapsed  The time elapsed since the last update in milliseconds
     */
    onPostUpdate(engine: Engine, elapsed: number): void;
    /**
     * Fires before every collision resolution for a confirmed contact
     * @param self
     * @param other
     * @param side
     * @param contact
     */
    onPreCollisionResolve(self: Collider, other: Collider, side: Side, contact: CollisionContact): void;
    /**
     * Fires after every resolution for a confirmed contact.
     * @param self
     * @param other
     * @param side
     * @param contact
     */
    onPostCollisionResolve(self: Collider, other: Collider, side: Side, contact: CollisionContact): void;
    /**
     * Fires once when 2 entities with a ColliderComponent first start colliding or touching, if the Colliders stay in contact this
     * does not continue firing until they separate and re-collide.
     * @param self
     * @param other
     * @param side
     * @param contact
     */
    onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact): void;
    /**
     * Fires once when 2 entities with a ColliderComponent separate after having been in contact.
     * @param self
     * @param other
     * @param side
     * @param lastContact
     */
    onCollisionEnd(self: Collider, other: Collider, side: Side, lastContact: CollisionContact): void;
    /**
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * Internal _preupdate handler for {@apilink onPreUpdate} lifecycle event
     * @param engine The reference to the current game engine
     * @param elapsed  The time elapsed since the last update in milliseconds
     * @internal
     */
    _preupdate(engine: Engine, elapsed: number): void;
    /**
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * Internal _preupdate handler for {@apilink onPostUpdate} lifecycle event
     * @param engine The reference to the current game engine
     * @param elapsed  The time elapsed since the last update in milliseconds
     * @internal
     */
    _postupdate(engine: Engine, elapsed: number): void;
}

/**
 * Type guard to detect a screen element
 */
declare function isScreenElement(actor: Actor): actor is ScreenElement;
/**
 * Helper {@apilink Actor} primitive for drawing UI's, optimized for UI drawing. Does
 * not participate in collisions. Drawn on top of all other actors.
 */
declare class ScreenElement extends Actor {
    protected _engine: Engine;
    constructor();
    constructor(config?: ActorArgs);
    _initialize(engine: Engine): void;
    contains(x: number, y: number, useWorld?: boolean): boolean;
}

interface TimerOptions {
    /**
     * If true the timer repeats every interval infinitely
     */
    repeats?: boolean;
    /**
     * If a number is specified then it will only repeat a number of times
     */
    numberOfRepeats?: number;
    /**
     * @deprecated use action: () => void, will be removed in v1.0
     */
    fcn?: () => void;
    /**
     * Action to perform every time the timer fires
     */
    action?: () => void;
    /**
     * Interval in milliseconds for the timer to fire
     */
    interval: number;
    /**
     * Optionally specify a random range of milliseconds for the timer to fire
     */
    randomRange?: [number, number];
    /**
     * Optionally provide a random instance to use for random behavior, otherwise a new random will be created seeded from the current time.
     */
    random?: Random;
}
/**
 * The Excalibur timer hooks into the internal timer and fires callbacks,
 * after a certain interval, optionally repeating.
 */
declare class Timer {
    private _logger;
    private static _MAX_ID;
    id: number;
    private _elapsedTime;
    private _totalTimeAlive;
    private _running;
    private _numberOfTicks;
    private _callbacks;
    interval: number;
    repeats: boolean;
    maxNumberOfRepeats: number;
    randomRange: [number, number];
    random: Random;
    private _baseInterval;
    private _generateRandomInterval;
    private _complete;
    get complete(): boolean;
    scene: Scene;
    constructor(options: TimerOptions);
    /**
     * Adds a new callback to be fired after the interval is complete
     * @param action The callback to be added to the callback list, to be fired after the interval is complete.
     */
    on(action: () => void): void;
    /**
     * Removes a callback from the callback list to be fired after the interval is complete.
     * @param action The callback to be removed from the callback list, to be fired after the interval is complete.
     */
    off(action: () => void): void;
    /**
     * Updates the timer after a certain number of milliseconds have elapsed. This is used internally by the engine.
     * @param elapsed  Number of elapsed milliseconds since the last update.
     */
    update(elapsed: number): void;
    /**
     * Resets the timer so that it can be reused, and optionally reconfigure the timers interval.
     *
     * Warning** you may need to call `timer.start()` again if the timer had completed
     * @param newInterval If specified, sets a new non-negative interval in milliseconds to refire the callback
     * @param newNumberOfRepeats If specified, sets a new non-negative upper limit to the number of time this timer executes
     */
    reset(newInterval?: number, newNumberOfRepeats?: number): void;
    get timesRepeated(): number;
    getTimeRunning(): number;
    /**
     * @returns milliseconds until the next action callback, if complete will return 0
     */
    get timeToNextAction(): number;
    /**
     * @returns milliseconds elapsed toward the next action
     */
    get timeElapsedTowardNextAction(): number;
    get isRunning(): boolean;
    /**
     * Pauses the timer, time will no longer increment towards the next call
     */
    pause(): Timer;
    /**
     * Resumes the timer, time will now increment towards the next call.
     */
    resume(): Timer;
    /**
     * Starts the timer, if the timer was complete it will restart the timer and reset the elapsed time counter
     */
    start(): Timer;
    /**
     * Stops the timer and resets the elapsed time counter towards the next action invocation
     */
    stop(): Timer;
    /**
     * Cancels the timer, preventing any further executions.
     */
    cancel(): void;
}

declare class PointerAbstraction {
    events: EventEmitter<PointerEvents>;
    /**
     * The last position on the document this pointer was at. Can be `null` if pointer was never active.
     */
    lastPagePos: Vector;
    /**
     * The last position on the screen this pointer was at. Can be `null` if pointer was never active.
     */
    lastScreenPos: Vector;
    /**
     * The last position in the game world coordinates this pointer was at. Can be `null` if pointer was never active.
     */
    lastWorldPos: Vector;
    constructor();
    emit<TEventName extends EventKey<PointerEvents>>(eventName: TEventName, event: PointerEvents[TEventName]): void;
    emit(eventName: string, event?: any): void;
    on<TEventName extends EventKey<PointerEvents>>(eventName: TEventName, handler: Handler<PointerEvents[TEventName]>): Subscription;
    on(eventName: string, handler: Handler<unknown>): Subscription;
    once<TEventName extends EventKey<PointerEvents>>(eventName: TEventName, handler: Handler<PointerEvents[TEventName]>): Subscription;
    once(eventName: string, handler: Handler<unknown>): Subscription;
    off<TEventName extends EventKey<PointerEvents>>(eventName: TEventName, handler: Handler<PointerEvents[TEventName]>): void;
    off(eventName: string, handler: Handler<unknown>): void;
    off(eventName: string): void;
    /**
     * Called internally by excalibur to keep pointers up to date
     * @internal
     * @param engine
     */
    _updateWorldPosition(engine: Engine): void;
    private _onPointerMove;
    private _onPointerDown;
}

type NativePointerEvent = globalThis.PointerEvent;
type NativeMouseEvent = globalThis.MouseEvent;
type NativeTouchEvent = globalThis.TouchEvent;
type NativeWheelEvent = globalThis.WheelEvent;
type PointerEvents = {
    move: PointerEvent;
    down: PointerEvent;
    up: PointerEvent;
    wheel: WheelEvent;
};
declare const PointerEvents: {
    Move: string;
    Down: string;
    Up: string;
    Wheel: string;
};
interface PointerInitOptions {
    grabWindowFocus?: boolean;
}
/**
 * The PointerEventProcessor is responsible for collecting all the events from the canvas and transforming them into GlobalCoordinates
 */
declare class PointerEventReceiver {
    readonly target: GlobalEventHandlers & EventTarget;
    engine: Engine;
    events: EventEmitter<PointerEvents>;
    primary: PointerAbstraction;
    private _activeNativePointerIdsToNormalized;
    lastFramePointerCoords: Map<number, GlobalCoordinates>;
    currentFramePointerCoords: Map<number, GlobalCoordinates>;
    currentFramePointerDown: Map<number, boolean>;
    lastFramePointerDown: Map<number, boolean>;
    currentFrameDown: PointerEvent[];
    currentFrameUp: PointerEvent[];
    currentFrameMove: PointerEvent[];
    currentFrameCancel: PointerEvent[];
    currentFrameWheel: WheelEvent[];
    private _enabled;
    constructor(target: GlobalEventHandlers & EventTarget, engine: Engine);
    toggleEnabled(enabled: boolean): void;
    /**
     * Creates a new PointerEventReceiver with a new target and engine while preserving existing pointer event
     * handlers.
     * @param target
     * @param engine
     */
    recreate(target: GlobalEventHandlers & EventTarget, engine: Engine): PointerEventReceiver;
    private _pointers;
    /**
     * Locates a specific pointer by id, creates it if it doesn't exist
     * @param index
     */
    at(index: number): PointerAbstraction;
    /**
     * The number of pointers currently being tracked by excalibur
     */
    count(): number;
    /**
     * Is the specified pointer id down this frame
     * @param pointerId
     */
    isDown(pointerId: number): boolean;
    /**
     * Was the specified pointer id down last frame
     * @param pointerId
     */
    wasDown(pointerId: number): boolean;
    /**
     * Whether the Pointer is currently dragging.
     */
    isDragging(pointerId: number): boolean;
    /**
     * Whether the Pointer just started dragging.
     */
    isDragStart(pointerId: number): boolean;
    /**
     * Whether the Pointer just ended dragging.
     */
    isDragEnd(pointerId: number): boolean;
    emit<TEventName extends EventKey<PointerEvents>>(eventName: TEventName, event: PointerEvents[TEventName]): void;
    emit(eventName: string, event?: any): void;
    on<TEventName extends EventKey<PointerEvents>>(eventName: TEventName, handler: Handler<PointerEvents[TEventName]>): Subscription;
    on(eventName: string, handler: Handler<unknown>): Subscription;
    once<TEventName extends EventKey<PointerEvents>>(eventName: TEventName, handler: Handler<PointerEvents[TEventName]>): Subscription;
    once(eventName: string, handler: Handler<unknown>): Subscription;
    off<TEventName extends EventKey<PointerEvents>>(eventName: TEventName, handler: Handler<PointerEvents[TEventName]>): void;
    off(eventName: string, handler: Handler<unknown>): void;
    off(eventName: string): void;
    /**
     * Called internally by excalibur
     *
     * Updates the current frame pointer info and emits raw pointer events
     *
     * This does not emit events to entities, see PointerSystem
     * @internal
     */
    update(): void;
    /**
     * Clears the current frame event and pointer data
     */
    clear(): void;
    private _boundHandle;
    private _boundWheel;
    /**
     * Initializes the pointer event receiver so that it can start listening to native
     * browser events.
     */
    init(options?: PointerInitOptions): void;
    detach(): void;
    /**
     * Take native pointer id and map it to index in active pointers
     * @param nativePointerId
     */
    private _normalizePointerId;
    /**
     * Responsible for handling and parsing pointer events
     */
    private _handle;
    private _handleWheel;
    /**
     * Triggers an excalibur pointer event in a world space pos
     *
     * Useful for testing pointers in excalibur
     * @param type
     * @param pos
     */
    triggerEvent(type: 'down' | 'up' | 'move' | 'cancel', pos: Vector): void;
    private _nativeButtonToPointerButton;
    private _stringToPointerType;
}

/**
 * Signals that an object has nested pointer events on nested objects that are not an Entity with
 * a PointerComponent. For example TileMap Tiles
 */
interface HasNestedPointerEvents {
    _dispatchPointerEvents(receiver: PointerEventReceiver): void;
    _processPointerToObject(receiver: PointerEventReceiver): void;
}

interface TileMapOptions {
    /**
     * Optionally name the tile map
     */
    name?: string;
    /**
     * Optionally specify the position of the tile map
     */
    pos?: Vector;
    /**
     * Width of an individual tile in pixels
     */
    tileWidth: number;
    /**
     * Height of an individual tile in pixels
     */
    tileHeight: number;
    /**
     * The number of tile columns, or the number of tiles wide
     */
    columns: number;
    /**
     * The number of tile  rows, or the number of tiles high
     */
    rows: number;
    /**
     * Optionally render from the top of the graphic, by default tiles are rendered from the bottom
     */
    renderFromTopOfGraphic?: boolean;
    /**
     * Optionally configure the meshing lookbehind for Tilemap, Tilemaps combine solid tiles into optimal
     * geometry and the lookbehind configures how far back the Tilemap to look for geometry when combining. Meshing
     * is an expensive operation, so when the Tilemap geometry is invalidated it must be recalculated.
     *
     * Default is 10 slots, but if your Tilemap does not change positions or solid tiles often you can increase this to
     * Infinity.
     */
    meshingLookBehind?: number;
}
type TilePointerEvents = {
    pointerup: PointerEvent;
    pointerdown: PointerEvent;
    pointermove: PointerEvent;
    pointercancel: PointerEvent;
    pointerenter: PointerEvent;
    pointerleave: PointerEvent;
};
type TileMapEvents = EntityEvents & TilePointerEvents & {
    preupdate: PreUpdateEvent<TileMap>;
    postupdate: PostUpdateEvent<TileMap>;
    predraw: PreDrawEvent;
    postdraw: PostDrawEvent;
};
declare const TileMapEvents: {
    PreUpdate: string;
    PostUpdate: string;
    PreDraw: string;
    PostDraw: string;
    PointerUp: string;
    PointerDown: string;
    PointerMove: string;
    PointerCancel: string;
};
/**
 * The TileMap provides a mechanism for doing flat 2D tiles rendered in a grid.
 *
 * TileMaps are useful for top down or side scrolling grid oriented games.
 */
declare class TileMap extends Entity implements HasNestedPointerEvents {
    events: EventEmitter<TileMapEvents>;
    private _token;
    private _engine;
    logger: Logger;
    readonly tiles: Tile[];
    private _rows;
    private _cols;
    readonly tileWidth: number;
    readonly tileHeight: number;
    readonly rows: number;
    readonly columns: number;
    renderFromTopOfGraphic: boolean;
    meshingLookBehind: number;
    private _collidersDirty;
    private _pointerEventDispatcher;
    flagCollidersDirty(): void;
    flagTilesDirty(): void;
    pointer: PointerComponent;
    transform: TransformComponent;
    private _motion;
    private _graphics;
    collider: ColliderComponent;
    private _composite;
    get x(): number;
    set x(val: number);
    get y(): number;
    set y(val: number);
    get z(): number;
    set z(val: number);
    private _oldRotation;
    get rotation(): number;
    set rotation(val: number);
    private _oldScale;
    get scale(): Vector;
    set scale(val: Vector);
    private _oldPos;
    get pos(): Vector;
    set pos(val: Vector);
    get vel(): Vector;
    set vel(val: Vector);
    /**
     * Width of the whole tile map in pixels
     */
    get width(): number;
    /**
     * Height of the whole tilemap in pixels
     */
    get height(): number;
    emit<TEventName extends EventKey<TileMapEvents>>(eventName: TEventName, event: TileMapEvents[TEventName]): void;
    emit(eventName: string, event?: any): void;
    on<TEventName extends EventKey<TileMapEvents>>(eventName: TEventName, handler: Handler<TileMapEvents[TEventName]>): Subscription;
    on(eventName: string, handler: Handler<unknown>): Subscription;
    once<TEventName extends EventKey<TileMapEvents>>(eventName: TEventName, handler: Handler<TileMapEvents[TEventName]>): Subscription;
    once(eventName: string, handler: Handler<unknown>): Subscription;
    off<TEventName extends EventKey<TileMapEvents>>(eventName: TEventName, handler: Handler<TileMapEvents[TEventName]>): void;
    off(eventName: string, handler: Handler<unknown>): void;
    off(eventName: string): void;
    /**
     * @param options
     */
    constructor(options: TileMapOptions);
    _initialize(engine: Engine): void;
    private _originalOffsets;
    private _getOrSetColliderOriginalOffset;
    /**
     * Tiles colliders based on the solid tiles in the tilemap.
     */
    private _updateColliders;
    /**
     * Returns the {@apilink Tile} by index (row major order)
     *
     * Returns null if out of bounds
     */
    getTileByIndex(index: number): Tile | null;
    /**
     * Returns the {@apilink Tile} by its x and y integer coordinates
     *
     * Returns null if out of bounds
     *
     * For example, if I want the tile in fifth column (x), and second row (y):
     * `getTile(4, 1)` 0 based, so 0 is the first in row/column
     */
    getTile(x: number, y: number): Tile | null;
    /**
     * Returns the {@apilink Tile} by testing a point in world coordinates,
     * returns `null` if no Tile was found.
     */
    getTileByPoint(point: Vector): Tile | null;
    private _getTileCoordinates;
    getRows(): readonly Tile[][];
    getColumns(): readonly Tile[][];
    /**
     * Returns the on screen tiles for a tilemap, this will overshoot by a small amount because of the internal quad tree data structure.
     *
     * Useful if you need to perform specific logic on onscreen tiles
     */
    getOnScreenTiles(): readonly Tile[];
    /**
     * @internal
     */
    _processPointerToObject(receiver: PointerEventReceiver): void;
    /**
     * @internal
     */
    _dispatchPointerEvents(receiver: PointerEventReceiver): void;
    update(engine: Engine, elapsed: number): void;
    /**
     * Draws the tile map to the screen. Called by the {@apilink Scene}.
     * @param ctx ExcaliburGraphicsContext
     * @param elapsed  The number of milliseconds since the last draw
     */
    draw(ctx: ExcaliburGraphicsContext, elapsed: number): void;
    debug(gfx: ExcaliburGraphicsContext, debugFlags: DebugConfig): void;
}
interface TileOptions {
    /**
     * Integer tile x coordinate
     */
    x: number;
    /**
     * Integer tile y coordinate
     */
    y: number;
    map: TileMap;
    solid?: boolean;
    graphics?: Graphic[];
}
/**
 * TileMap Tile
 *
 * A light-weight object that occupies a space in a collision map. Generally
 * created by a {@apilink TileMap}.
 *
 * Tiles can draw multiple sprites. Note that the order of drawing is the order
 * of the sprites in the array so the last one will be drawn on top. You can
 * use transparency to create layers this way.
 */
declare class Tile {
    private _bounds;
    private _geometry;
    private _pos;
    private _posDirty;
    events: EventEmitter<TilePointerEvents>;
    /**
     * Return the world position of the top left corner of the tile
     */
    get pos(): Vector;
    /**
     * Integer x coordinate of the tile
     */
    readonly x: number;
    /**
     * Integer y coordinate of the tile
     */
    readonly y: number;
    private _width;
    /**
     * Width of the tile in pixels
     */
    get width(): number;
    private _height;
    /**
     * Height of the tile in pixels
     */
    get height(): number;
    /**
     * Reference to the TileMap this tile is associated with
     */
    map: TileMap;
    private _solid;
    /**
     * Wether this tile should be treated as solid by the tilemap
     */
    get solid(): boolean;
    /**
     * Wether this tile should be treated as solid by the tilemap
     */
    set solid(val: boolean);
    private _graphics;
    private _offsets;
    /**
     * Current list of graphics for this tile
     */
    getGraphics(): readonly Graphic[];
    /**
     * Current list of offsets for this tile's graphics
     */
    getGraphicsOffsets(): readonly Vector[];
    /**
     * Add another {@apilink Graphic} to this TileMap tile
     * @param graphic
     */
    addGraphic(graphic: Graphic, options?: {
        offset?: Vector;
    }): void;
    /**
     * Remove an instance of a {@apilink Graphic} from this tile
     */
    removeGraphic(graphic: Graphic): void;
    /**
     * Clear all graphics from this tile
     */
    clearGraphics(): void;
    /**
     * Current list of colliders for this tile
     */
    private _colliders;
    /**
     * Returns the list of colliders
     */
    getColliders(): readonly Collider[];
    /**
     * Adds a custom collider to the {@apilink Tile} to use instead of it's bounds
     *
     * If no collider is set but {@apilink Tile.solid} is set, the tile bounds are used as a collider.
     *
     * **Note!** the {@apilink Tile.solid} must be set to true for it to act as a "fixed" collider
     * @param collider
     */
    addCollider(collider: Collider): void;
    /**
     * Removes a collider from the {@apilink Tile}
     * @param collider
     */
    removeCollider(collider: Collider): void;
    /**
     * Clears all colliders from the {@apilink Tile}
     */
    clearColliders(): void;
    /**
     * Arbitrary data storage per tile, useful for any game specific data
     */
    data: Map<string, any>;
    constructor(options: TileOptions);
    flagDirty(): void;
    private _recalculate;
    /**
     * Tile bounds in world space
     */
    get bounds(): BoundingBox;
    get defaultGeometry(): BoundingBox;
    /**
     * Tile position in world space
     */
    get center(): Vector;
    emit<TEventName extends EventKey<TilePointerEvents>>(eventName: TEventName, event: TilePointerEvents[TEventName]): void;
    emit(eventName: string, event?: any): void;
    on<TEventName extends EventKey<TilePointerEvents>>(eventName: TEventName, handler: Handler<TilePointerEvents[TEventName]>): Subscription;
    on(eventName: string, handler: Handler<unknown>): Subscription;
    once<TEventName extends EventKey<TilePointerEvents>>(eventName: TEventName, handler: Handler<TilePointerEvents[TEventName]>): Subscription;
    once(eventName: string, handler: Handler<unknown>): Subscription;
    off<TEventName extends EventKey<TilePointerEvents>>(eventName: TEventName, handler: Handler<TilePointerEvents[TEventName]>): void;
    off(eventName: string, handler: Handler<unknown>): void;
    off(eventName: string): void;
}

type IsometricTilePointerEvents = {
    pointerup: PointerEvent;
    pointerdown: PointerEvent;
    pointermove: PointerEvent;
    pointercancel: PointerEvent;
    pointerenter: PointerEvent;
    pointerleave: PointerEvent;
};
declare class IsometricTile extends Entity {
    /**
     * Indicates whether this tile is solid
     */
    solid: boolean;
    events: EventEmitter<EntityEvents & IsometricTilePointerEvents>;
    private _gfx;
    private _tileBounds;
    private _graphics;
    getGraphics(): readonly Graphic[];
    /**
     * Tile graphics
     */
    addGraphic(graphic: Graphic, options?: {
        offset?: Vector;
    }): void;
    private _recalculateBounds;
    removeGraphic(graphic: Graphic): void;
    clearGraphics(): void;
    /**
     * Tile colliders
     */
    private _colliders;
    getColliders(): readonly Collider[];
    /**
     * Adds a collider to the IsometricTile
     *
     * **Note!** the {@apilink Tile.solid} must be set to true for it to act as a "fixed" collider
     * @param collider
     */
    addCollider(collider: Collider): void;
    /**
     * Removes a collider from the IsometricTile
     * @param collider
     */
    removeCollider(collider: Collider): void;
    /**
     * Clears all colliders from the IsometricTile
     */
    clearColliders(): void;
    /**
     * Integer tile x coordinate
     */
    readonly x: number;
    /**
     * Integer tile y coordinate
     */
    readonly y: number;
    /**
     * Reference to the {@apilink IsometricMap} this tile is part of
     */
    readonly map: IsometricMap;
    private _transform;
    private _isometricEntityComponent;
    /**
     * Returns the top left corner of the {@apilink IsometricTile} in world space
     */
    get pos(): Vector;
    /**
     * Returns the center of the {@apilink IsometricTile}
     */
    get center(): Vector;
    /**
     * Arbitrary data storage per tile, useful for any game specific data
     */
    data: Map<string, any>;
    /**
     * Construct a new IsometricTile
     * @param x tile coordinate in x (not world position)
     * @param y tile coordinate in y (not world position)
     * @param graphicsOffset offset that tile should be shifted by (default (0, 0))
     * @param map reference to owning IsometricMap
     */
    constructor(x: number, y: number, graphicsOffset: Vector | null, map: IsometricMap);
    draw(gfx: ExcaliburGraphicsContext, _elapsed: number): void;
}
interface IsometricMapOptions {
    /**
     * Optionally name the isometric tile map
     */
    name?: string;
    /**
     * Optionally specify the position of the isometric tile map
     */
    pos?: Vector;
    /**
     * Optionally render from the top of the graphic, by default tiles are rendered from the bottom
     */
    renderFromTopOfGraphic?: boolean;
    /**
     * Optionally present a graphics offset, this can be useful depending on your tile graphics
     */
    graphicsOffset?: Vector;
    /**
     * Width of an individual tile in pixels, this should be the width of the parallelogram of the base of the tile art asset.
     */
    tileWidth: number;
    /**
     * Height of an individual tile in pixels, this should be the height of the parallelogram of the base of the tile art asset.
     */
    tileHeight: number;
    /**
     * The number of tile columns, or the number of tiles wide
     */
    columns: number;
    /**
     * The number of tile  rows, or the number of tiles high
     */
    rows: number;
    elevation?: number;
}
/**
 * The IsometricMap is a special tile map that provides isometric rendering support to Excalibur
 *
 * The tileWidth and tileHeight should be the height and width in pixels of the parallelogram of the base of the tile art asset.
 * The tileWidth and tileHeight is not necessarily the same as your graphic pixel width and height.
 *
 * Please refer to the docs https://excaliburjs.com for more details calculating what your tile width and height should be given
 * your art assets.
 */
declare class IsometricMap extends Entity implements HasNestedPointerEvents {
    readonly elevation: number;
    /**
     * Width of individual tile in pixels
     */
    readonly tileWidth: number;
    /**
     * Height of individual tile in pixels
     */
    readonly tileHeight: number;
    /**
     * Number of tiles wide
     */
    readonly columns: number;
    /**
     * Number of tiles high
     */
    readonly rows: number;
    /**
     * List containing all of the tiles in IsometricMap
     */
    readonly tiles: IsometricTile[];
    /**
     * Whether tiles should be visible
     * @deprecated use isVisible
     */
    get visible(): boolean;
    /**
     * Whether tiles should be visible
     * @deprecated use isVisible
     */
    set visible(val: boolean);
    /**
     * Whether tiles should be visible
     */
    isVisible: boolean;
    /**
     * Opacity of tiles
     */
    opacity: number;
    /**
     * Render the tile graphic from the top instead of the bottom
     *
     * default is `false` meaning rendering from the bottom
     */
    renderFromTopOfGraphic: boolean;
    graphicsOffset: Vector;
    /**
     * Isometric map {@apilink TransformComponent}
     */
    transform: TransformComponent;
    /**
     * Isometric map {@apilink ColliderComponent}
     */
    collider: ColliderComponent;
    pointer: PointerComponent;
    private _composite;
    private _pointerEventDispatcher;
    constructor(options: IsometricMapOptions);
    /**
     * @internal
     */
    _processPointerToObject(receiver: PointerEventReceiver): void;
    /**
     * @internal
     */
    _dispatchPointerEvents(receiver: PointerEventReceiver): void;
    update(): void;
    private _collidersDirty;
    flagCollidersDirty(): void;
    private _originalOffsets;
    private _getOrSetColliderOriginalOffset;
    updateColliders(): void;
    /**
     * Convert world space coordinates to the tile x, y coordinate
     * @param worldCoordinate
     */
    worldToTile(worldCoordinate: Vector): Vector;
    /**
     * Given a tile coordinate, return the top left corner in world space
     * @param tileCoordinate
     */
    tileToWorld(tileCoordinate: Vector): Vector;
    /**
     * Returns the {@apilink IsometricTile} by its x and y coordinates
     */
    getTile(x: number, y: number): IsometricTile | null;
    /**
     * Returns the {@apilink IsometricTile} by testing a point in world coordinates,
     * returns `null` if no Tile was found.
     */
    getTileByPoint(point: Vector): IsometricTile | null;
    private _getMaxZIndex;
    /**
     * Debug draw for IsometricMap, called internally by excalibur when debug mode is toggled on
     * @param gfx
     */
    debug(gfx: ExcaliburGraphicsContext, debugFlags: DebugConfig): void;
}

interface IsometricEntityComponentOptions {
    columns: number;
    rows: number;
    tileWidth: number;
    tileHeight: number;
}
declare class IsometricEntityComponent extends Component {
    /**
     * Vertical "height" in the isometric world
     */
    elevation: number;
    readonly columns: number;
    readonly rows: number;
    readonly tileWidth: number;
    readonly tileHeight: number;
    /**
     * Specify the isometric map to use to position this entity's z-index
     * @param mapOrOptions
     */
    constructor(mapOrOptions: IsometricMap | IsometricEntityComponentOptions);
}

declare class IsometricEntitySystem extends System {
    world: World;
    static priority: number;
    readonly systemType = SystemType.Update;
    query: Query<typeof TransformComponent | typeof IsometricEntityComponent>;
    constructor(world: World);
    update(): void;
}

type TriggerEvents = ActorEvents & {
    exit: ExitTriggerEvent;
    enter: EnterTriggerEvent;
};
declare const TriggerEvents: {
    ExitTrigger: string;
    EnterTrigger: string;
};
/**
 * TriggerOptions
 */
interface TriggerOptions {
    pos?: Vector;
    width?: number;
    height?: number;
    visible?: boolean;
    action?: (entity: Entity) => void;
    target?: Entity;
    filter?: (entity: Entity) => boolean;
    repeat?: number;
}
/**
 * Triggers are a method of firing arbitrary code on collision. These are useful
 * as 'buttons', 'switches', or to trigger effects in a game. By default triggers
 * are invisible, and can only be seen when {@apilink Trigger.visible} is set to `true`.
 */
declare class Trigger extends Actor {
    events: EventEmitter<EntityEvents & {
        collisionstart: CollisionStartEvent;
        collisionend: CollisionEndEvent;
        precollision: PreCollisionEvent;
        postcollision: PostCollisionEvent;
        kill: KillEvent;
        prekill: PreKillEvent;
        postkill: PostKillEvent;
        predraw: PreDrawEvent;
        postdraw: PostDrawEvent;
        pretransformdraw: PreDrawEvent;
        posttransformdraw: PostDrawEvent;
        predebugdraw: PreDebugDrawEvent;
        postdebugdraw: PostDebugDrawEvent;
        pointerup: PointerEvent;
        pointerdown: PointerEvent;
        pointerenter: PointerEvent;
        pointerleave: PointerEvent;
        pointermove: PointerEvent;
        pointercancel: PointerEvent;
        pointerwheel: WheelEvent;
        pointerdragstart: PointerEvent;
        pointerdragend: PointerEvent;
        pointerdragenter: PointerEvent;
        pointerdragleave: PointerEvent;
        pointerdragmove: PointerEvent;
        enterviewport: EnterViewPortEvent;
        exitviewport: ExitViewPortEvent;
        actionstart: ActionStartEvent;
        actioncomplete: ActionCompleteEvent;
    } & {
        exit: ExitTriggerEvent;
        enter: EnterTriggerEvent;
    }>;
    target?: Entity;
    /**
     * Action to fire when triggered by collision
     */
    action: (entity: Entity) => void;
    /**
     * Filter to add additional granularity to action dispatch, if a filter is specified the action will only fire when
     * filter return true for the collided entity.
     */
    filter: (entity: Entity) => boolean;
    /**
     * Number of times to repeat before killing the trigger,
     */
    repeat: number;
    /**
     * @param options Trigger options
     */
    constructor(options: TriggerOptions & ActorArgs);
    private _matchesTarget;
    private _dispatchAction;
}

interface DefaultLoaderOptions {
    /**
     * List of loadables
     */
    loadables?: Loadable<any>[];
}
type LoaderEvents = {
    beforeload: void;
    afterload: void;
    useraction: void;
    loadresourcestart: Loadable<any>;
    loadresourceend: Loadable<any>;
};
declare const LoaderEvents: {
    BeforeLoad: string;
    AfterLoad: string;
    UserAction: string;
    LoadResourceStart: string;
    LoadResourceEnd: string;
};
type LoaderConstructor = new (...args: any[]) => DefaultLoader;
/**
 * Returns true if the constructor is for an Excalibur Loader
 */
declare function isLoaderConstructor(x: any): x is LoaderConstructor;
declare class DefaultLoader implements Loadable<Loadable<any>[]> {
    data: Loadable<any>[];
    events: EventEmitter<LoaderEvents>;
    canvas: Canvas;
    private _resources;
    get resources(): readonly Loadable<any>[];
    private _numLoaded;
    engine: Engine;
    /**
     * @param options Optionally provide the list of resources you want to load at constructor time
     */
    constructor(options?: DefaultLoaderOptions);
    /**
     * Called by the engine before loading
     * @param engine
     */
    onInitialize(engine: Engine): void;
    /**
     * Return a promise that resolves when the user interacts with the loading screen in some way, usually a click.
     *
     * It's important to implement this in order to unlock the audio context in the browser. Browsers automatically prevent
     * audio from playing until the user performs an action.
     *
     */
    onUserAction(): Promise<void>;
    /**
     * Overridable lifecycle method, called directly before loading starts
     */
    onBeforeLoad(): Promise<void>;
    /**
     * Overridable lifecycle method, called after loading has completed
     */
    onAfterLoad(): Promise<void>;
    /**
     * Add a resource to the loader to load
     * @param loadable  Resource to add
     */
    addResource(loadable: Loadable<any>): void;
    /**
     * Add a list of resources to the loader to load
     * @param loadables  The list of resources to load
     */
    addResources(loadables: Loadable<any>[]): void;
    markResourceComplete(): void;
    /**
     * Returns the progress of the loader as a number between [0, 1] inclusive.
     */
    get progress(): number;
    /**
     * Returns true if the loader has completely loaded all resources
     */
    isLoaded(): boolean;
    private _totalTimeMs;
    /**
     * Optionally override the onUpdate
     * @param engine
     * @param elapsed
     */
    onUpdate(engine: Engine, elapsed: number): void;
    /**
     * Optionally override the onDraw
     */
    onDraw(ctx: CanvasRenderingContext2D): void;
    private _loadingFuture;
    areResourcesLoaded(): Promise<void>;
    /**
     * Not meant to be overridden
     *
     * Begin loading all of the supplied resources, returning a promise
     * that resolves when loading of all is complete AND the user has interacted with the loading screen
     */
    load(): Promise<Loadable<any>[]>;
    emit<TEventName extends EventKey<LoaderEvents>>(eventName: TEventName, event: LoaderEvents[TEventName]): void;
    emit(eventName: string, event?: any): void;
    on<TEventName extends EventKey<LoaderEvents>>(eventName: TEventName, handler: Handler<LoaderEvents[TEventName]>): Subscription;
    on(eventName: string, handler: Handler<unknown>): Subscription;
    once<TEventName extends EventKey<LoaderEvents>>(eventName: TEventName, handler: Handler<LoaderEvents[TEventName]>): Subscription;
    once(eventName: string, handler: Handler<unknown>): Subscription;
    off<TEventName extends EventKey<LoaderEvents>>(eventName: TEventName, handler: Handler<LoaderEvents[TEventName]>): void;
    off(eventName: string, handler: Handler<unknown>): void;
    off(eventName: string): void;
}

type CoroutineGenerator = () => Generator<any | number | Promise<any> | undefined, void, number>;
interface CoroutineOptions {
    /**
     * Coroutines run preframe in the clock by default.
     */
    timing?: ScheduledCallbackTiming;
    /**
     * Coroutines auto start by default, set to false to require play();
     */
    autostart?: boolean;
}
type Thenable = PromiseLike<void>['then'];
interface CoroutineInstance extends PromiseLike<void> {
    isRunning(): boolean;
    isComplete(): boolean;
    done: Promise<void>;
    generator: Generator<CoroutineInstance | number | Promise<any> | undefined, void, number>;
    start: () => CoroutineInstance;
    cancel: () => void;
    then: Thenable;
    [Symbol.iterator]: () => Generator<CoroutineInstance | number | Promise<any> | undefined, void, number>;
}
/**
 * Excalibur coroutine helper, returns a [[CoroutineInstance]] which is promise-like when complete. Coroutines run before frame update by default.
 *
 * Each coroutine yield is 1 excalibur frame. Coroutines get passed the elapsed time our of yield. Coroutines
 * run internally on the excalibur clock.
 *
 * If you yield a promise it will be awaited before resumed
 * If you yield a number it will wait that many ms before resumed
 * @param thisArg set the "this" context of the generator, by default is globalThis
 * @param engine pass a specific engine to use for running the coroutine
 * @param coroutineGenerator coroutine generator function
 * @param {CoroutineOptions} options optionally schedule coroutine pre/post update
 */
declare function coroutine(thisArg: any, engine: Engine, coroutineGenerator: CoroutineGenerator, options?: CoroutineOptions): CoroutineInstance;
/**
 * Excalibur coroutine helper, returns a promise when complete. Coroutines run before frame update.
 *
 * Each coroutine yield is 1 excalibur frame. Coroutines get passed the elapsed time our of yield. Coroutines
 * run internally on the excalibur clock.
 *
 * If you yield a promise it will be awaited before resumed
 * If you yield a number it will wait that many ms before resumed
 * @param engine pass a specific engine to use for running the coroutine
 * @param coroutineGenerator coroutine generator function
 * @param {CoroutineOptions} options optionally schedule coroutine pre/post update
 */
declare function coroutine(engine: Engine, coroutineGenerator: CoroutineGenerator, options?: CoroutineOptions): CoroutineInstance;
/**
 * Excalibur coroutine helper, returns a promise when complete. Coroutines run before frame update.
 *
 * Each coroutine yield is 1 excalibur frame. Coroutines get passed the elapsed time our of yield. Coroutines
 * run internally on the excalibur clock.
 *
 * If you yield a promise it will be awaited before resumed
 * If you yield a number it will wait that many ms before resumed
 * @param coroutineGenerator coroutine generator function
 * @param {CoroutineOptions} options optionally schedule coroutine pre/post update
 */
declare function coroutine(coroutineGenerator: CoroutineGenerator, options?: CoroutineOptions): CoroutineInstance;
/**
 * Excalibur coroutine helper, returns a promise when complete. Coroutines run before frame update.
 *
 * Each coroutine yield is 1 excalibur frame. Coroutines get passed the elapsed time our of yield. Coroutines
 * run internally on the excalibur clock.
 *
 * If you yield a promise it will be awaited before resumed
 * If you yield a number it will wait that many ms before resumed
 * @param thisArg set the "this" context of the generator, by default is globalThis
 * @param coroutineGenerator coroutine generator function
 * @param {CoroutineOptions} options optionally schedule coroutine pre/post update
 */
declare function coroutine(thisArg: any, coroutineGenerator: CoroutineGenerator, options?: CoroutineOptions): CoroutineInstance;

interface TransitionOptions {
    /**
     * Transition duration in milliseconds
     */
    duration: number;
    /**
     * Optionally hides the loader during the transition
     *
     * If either the out or in transition have this set to true, then the loader will be hidden.
     *
     * Default false
     */
    hideLoader?: boolean;
    /**
     * Optionally blocks user input during a transition
     *
     * Default false
     */
    blockInput?: boolean;
    /**
     * Optionally specify a easing function, by default linear
     */
    easing?: EasingFunction;
    /**
     * Optionally specify a transition direction, by default 'out'
     *
     * * For 'in' direction transitions start at 1 and complete is at 0
     * * For 'out' direction transitions start at 0 and complete is at 1
     */
    direction?: 'out' | 'in';
}
/**
 * Base Transition that can be extended to provide custom scene transitions in Excalibur.
 */
declare class Transition extends Entity {
    private _logger;
    transform: TransformComponent;
    graphics: GraphicsComponent;
    readonly hideLoader: boolean;
    readonly blockInput: boolean;
    readonly duration: number;
    readonly easing: EasingFunction;
    readonly direction: 'out' | 'in';
    private _completeFuture;
    protected _engine?: Engine;
    private _co?;
    started: boolean;
    private _currentDistance;
    private _currentProgress;
    done: Promise<void>;
    /**
     * Returns a number between [0, 1] indicating what state the transition is in.
     *
     * * For 'out' direction transitions start at 0 and end at 1
     * * For 'in' direction transitions start at 1 and end at 0
     */
    get progress(): number;
    get complete(): boolean;
    constructor(options: TransitionOptions);
    /**
     * Overridable lifecycle method, called before each update.
     *
     * **WARNING BE SURE** to call `super.updateTransition()` if overriding in your own custom implementation
     * @param engine
     * @param elapsed
     */
    updateTransition(engine: Engine, elapsed: number): void;
    /**
     * Overridable lifecycle method, called right before the previous scene has deactivated.
     *
     * This gives incoming transition a chance to grab info from previous scene if desired
     * @param scene
     */
    onPreviousSceneDeactivate(scene: Scene): Promise<void>;
    /**
     * Overridable lifecycle method, called once at the beginning of the transition
     *
     * `progress` is given between 0 and 1
     * @param progress
     */
    onStart(progress: number): void;
    /**
     * Overridable lifecycle method, called every frame of the transition
     *
     * `progress` is given between 0 and 1
     * @param progress
     */
    onUpdate(progress: number): void;
    /**
     * Overridable lifecycle method, called at the end of the transition,
     *
     * `progress` is given between 0 and 1
     * @param progress
     */
    onEnd(progress: number): void;
    /**
     * Overridable lifecycle method, called when the transition is reset
     *
     * Use this to override and provide your own reset logic for internal state in custom transition implementations
     */
    onReset(): void;
    /**
     * reset() is called by the engine to reset transitions
     */
    reset(): void;
    /**
     * @internal
     */
    _addToTargetScene(engine: Engine, targetScene: Scene): CoroutineInstance;
    /**
     * Called internally by excalibur to swap scenes with transition
     * @internal
     */
    _play(): Promise<void>;
    /**
     * execute() is called by the engine every frame to update the Transition lifecycle onStart/onUpdate/onEnd
     * @internal
     */
    _execute(): void;
}

interface FadeOptions {
    duration?: number;
    color?: Color;
}
declare class FadeInOut extends Transition {
    screenCover: Rectangle;
    color: Color;
    constructor(options: FadeOptions & TransitionOptions);
    onInitialize(engine: Engine): void;
    onReset(): void;
    onStart(progress: number): void;
    onEnd(progress: number): void;
    onUpdate(progress: number): void;
}

interface CrossFadeOptions {
    duration: number;
}
/**
 * CrossFades between the previous scene and the destination scene
 *
 * Note: CrossFade only works as an "in" transition
 */
declare class CrossFade extends Transition {
    engine: Engine;
    image: HTMLImageElement;
    screenCover: Sprite;
    constructor(options: TransitionOptions & CrossFadeOptions);
    onPreviousSceneDeactivate(scene: Scene<unknown>): Promise<void>;
    onInitialize(engine: Engine): void;
    onStart(_progress: number): void;
    onReset(): void;
    onEnd(progress: number): void;
    onUpdate(progress: number): void;
}

interface SlideOptions {
    /**
     * Duration of the transition in milliseconds
     */
    duration: number;
    /**
     * Slide direction for the previous scene to move: up, down, left, right
     */
    slideDirection: 'up' | 'down' | 'left' | 'right';
    /**
     * Optionally select an easing function, by default linear (aka lerp)
     */
    easingFunction?: EasingFunction;
}
/**
 * Slide`s between the previous scene and the destination scene
 *
 * Note: Slide` only works as an "in" transition
 */
declare class Slide extends Transition {
    private _image;
    private _screenCover;
    private _easing;
    private _vectorEasing;
    readonly slideDirection: 'up' | 'down' | 'left' | 'right';
    constructor(options: TransitionOptions & SlideOptions);
    onPreviousSceneDeactivate(scene: Scene<unknown>): Promise<void>;
    private _destinationCameraPosition;
    private _startCameraPosition;
    private _camera;
    private _directionOffset;
    onInitialize(engine: Engine): void;
    onUpdate(progress: number): void;
}

interface DirectorNavigationEvent {
    sourceName: string;
    sourceScene: Scene;
    destinationName: string;
    destinationScene: Scene;
}
type DirectorEvents = {
    navigationstart: DirectorNavigationEvent;
    navigation: DirectorNavigationEvent;
    navigationend: DirectorNavigationEvent;
};
declare const DirectorEvents: {
    readonly NavigationStart: "navigationstart";
    readonly Navigation: "navigation";
    readonly NavigationEnd: "navigationend";
};
interface SceneWithOptions {
    /**
     * Scene associated with this route
     *
     * If a constructor is provided it will not be constructed until navigation is requested
     */
    scene: Scene | SceneConstructor;
    /**
     * Specify scene transitions
     */
    transitions?: {
        /**
         * Optionally specify a transition when going "in" to this scene
         */
        in?: Transition;
        /**
         * Optionally specify a transition when going "out" of this scene
         */
        out?: Transition;
    };
    /**
     * Optionally specify a loader for the scene
     */
    loader?: DefaultLoader | LoaderConstructor;
}
type WithRoot<TScenes> = TScenes | 'root';
type SceneMap<TKnownScenes extends string = any> = Record<TKnownScenes, Scene | SceneConstructor | SceneWithOptions>;
interface StartOptions {
    /**
     * Optionally provide first transition from the game start screen
     */
    inTransition?: Transition;
    /**
     * Optionally provide a main loader to run before the game starts
     */
    loader?: DefaultLoader | LoaderConstructor;
}
/**
 * Provide scene activation data and override any existing configured route transitions or loaders
 */
interface GoToOptions<TActivationData = any> {
    /**
     * Optionally supply scene activation data passed to Scene.onActivate
     */
    sceneActivationData?: TActivationData;
    /**
     * Optionally supply destination scene "in" transition, this will override any previously defined transition
     */
    destinationIn?: Transition;
    /**
     * Optionally supply source scene "out" transition, this will override any previously defined transition
     */
    sourceOut?: Transition;
    /**
     * Optionally supply a different loader for the destination scene, this will override any previously defined loader
     */
    loader?: DefaultLoader;
}
/**
 * The Director is responsible for managing scenes and changing scenes in Excalibur.
 *
 * It deals with transitions, scene loaders, switching scenes
 *
 * This is used internally by Excalibur, generally not mean to
 * be instantiated end users directly.
 */
declare class Director<TKnownScenes extends string = any> {
    private _engine;
    events: EventEmitter<DirectorEvents>;
    private _logger;
    private _deferredGoto?;
    private _deferredTransition?;
    private _initialized;
    /**
     * Current scene's name
     */
    currentSceneName: string;
    /**
     * Current scene playing in excalibur
     */
    currentScene: Scene;
    /**
     * Current transition if any
     */
    currentTransition?: Transition;
    /**
     * All registered scenes in Excalibur
     */
    readonly scenes: SceneMap<WithRoot<TKnownScenes>>;
    /**
     * Holds all instantiated scenes
     */
    private _sceneToInstance;
    startScene?: string;
    mainLoader?: DefaultLoader;
    /**
     * The default {@apilink Scene} of the game, use {@apilink Engine.goToScene} to transition to different scenes.
     */
    readonly rootScene: Scene;
    private _sceneToLoader;
    private _sceneToTransition;
    /**
     * Used to keep track of scenes that have already been loaded so we don't load multiple times
     */
    private _loadedScenes;
    private _isTransitioning;
    /**
     * Gets whether the director currently transitioning between scenes
     *
     * Useful if you need to block behavior during transition
     */
    get isTransitioning(): boolean;
    constructor(_engine: Engine, scenes: SceneMap<TKnownScenes>);
    /**
     * Initialize the director's internal state
     */
    onInitialize(): Promise<void>;
    get isInitialized(): boolean;
    /**
     * Configures the start scene, and optionally the transition & loader for the director
     *
     * Typically this is called at the beginning of the game to the start scene and transition and never again.
     * @param startScene
     * @param options
     */
    configureStart(startScene: WithRoot<TKnownScenes>, options?: StartOptions): void;
    private _getLoader;
    private _getInTransition;
    private _getOutTransition;
    getDeferredScene(): Scene<unknown> | SceneConstructor;
    /**
     * Returns a scene by name if it exists, might be the constructor and not the instance of a scene
     * @param name
     */
    getSceneDefinition(name?: string): Scene | SceneConstructor | undefined;
    /**
     * Returns the name of the registered scene, null if none can be found
     * @param scene
     */
    getSceneName(scene: Scene): string | null;
    /**
     * Returns the same Director, but asserts a scene DOES exist to the type system
     * @param name
     */
    assertAdded<TScene extends string>(name: TScene): Director<TKnownScenes | TScene>;
    /**
     * Returns the same Director, but asserts a scene DOES NOT exist to the type system
     * @param name
     */
    assertRemoved<TScene extends string>(name: TScene): Director<Exclude<TKnownScenes, TScene>>;
    /**
     * Adds additional Scenes to the game!
     * @param name
     * @param sceneOrRoute
     */
    add<TScene extends string>(name: TScene, sceneOrRoute: Scene | SceneConstructor | SceneWithOptions): Director<TKnownScenes | TScene>;
    remove(scene: Scene): void;
    remove(sceneCtor: SceneConstructor): void;
    remove(name: WithRoot<TKnownScenes>): void;
    /**
     * Go to a specific scene, and optionally override loaders and transitions
     * @param destinationScene
     * @param options
     */
    goToScene(destinationScene: TKnownScenes | string, options?: GoToOptions): Promise<void>;
    /**
     * Retrieves a scene instance by key if it's registered.
     *
     * This will call any constructors that were given as a definition
     * @param scene
     */
    getSceneInstance(scene: string): Scene | undefined;
    /**
     * Triggers scene loading if has not already been loaded
     * @param scene
     * @param hideLoader
     */
    maybeLoadScene(scene: string, hideLoader?: boolean): Promise<void>;
    /**
     * Plays a transition in the current scene and does book keeping for input.
     * @param transition
     */
    playTransition(transition: Transition, targetScene: Scene): Promise<void>;
    /**
     * Swaps the current and destination scene after performing required lifecycle events
     *
     * Note: swap scene will wait for any pending loader on the destination scene
     * @param destinationScene
     * @param data
     */
    swapScene<TData = undefined>(destinationScene: string, data?: TData): Promise<void>;
    private _emitEvent;
}

/**
 * Future is a wrapper around a native browser Promise to allow resolving/rejecting at any time
 */
declare class Future<T> {
    private _resolver;
    private _rejecter;
    private _isCompleted;
    constructor();
    readonly promise: Promise<T>;
    get isCompleted(): boolean;
    resolve(value: T): void;
    reject(error: Error): void;
}

interface LoaderOptions extends DefaultLoaderOptions {
    /**
     * Go fullscreen after loading and clicking play
     */
    fullscreenAfterLoad?: boolean;
    /**
     * Fullscreen container element or id
     */
    fullscreenContainer?: HTMLElement | string;
}
/**
 * Pre-loading assets
 *
 * The loader provides a mechanism to preload multiple resources at
 * one time. The loader must be passed to the engine in order to
 * trigger the loading progress bar.
 *
 * The {@apilink Loader} itself implements {@apilink Loadable} so you can load loaders.
 *
 * ## Example: Pre-loading resources for a game
 *
 * ```js
 * // create a loader
 * var loader = new ex.Loader();
 *
 * // create a resource dictionary (best practice is to keep a separate file)
 * var resources = {
 *   TextureGround: new ex.Texture("/images/textures/ground.png"),
 *   SoundDeath: new ex.Sound("/sound/death.wav", "/sound/death.mp3")
 * };
 *
 * // loop through dictionary and add to loader
 * for (var loadable in resources) {
 *   if (resources.hasOwnProperty(loadable)) {
 *     loader.addResource(resources[loadable]);
 *   }
 * }
 *
 * // start game
 * game.start(loader).then(function () {
 *   console.log("Game started!");
 * });
 * ```
 *
 * ## Customize the Loader
 *
 * The loader can be customized to show different, text, logo, background color, and button.
 *
 * ```typescript
 * const loader = new ex.Loader([playerTexture]);
 *
 * // The loaders button text can simply modified using this
 * loader.playButtonText = 'Start the best game ever';
 *
 * // The logo can be changed by inserting a base64 image string here
 *
 * loader.logo = 'data:image/png;base64,iVBORw...';
 * loader.logoWidth = 15;
 * loader.logoHeight = 14;
 *
 * // The background color can be changed like so by supplying a valid CSS color string
 *
 * loader.backgroundColor = 'red'
 * loader.backgroundColor = '#176BAA'
 *
 * // To build a completely new button
 * loader.startButtonFactory = () => {
 *     let myButton = document.createElement('button');
 *     myButton.textContent = 'The best button';
 *     return myButton;
 * };
 *
 * engine.start(loader).then(() => {});
 * ```
 */
declare class Loader extends DefaultLoader {
    private _logger;
    private static _DEFAULT_LOADER_OPTIONS;
    private _originalOptions;
    events: EventEmitter<any>;
    screen: Screen;
    private _playButtonShown;
    logo: string;
    logoWidth: number;
    logoHeight: number;
    /**
     * Positions the top left corner of the logo image
     * If not set, the loader automatically positions the logo
     */
    logoPosition: Vector | null;
    /**
     * Positions the top left corner of the play button.
     * If not set, the loader automatically positions the play button
     */
    playButtonPosition: Vector | null;
    /**
     * Positions the top left corner of the loading bar
     * If not set, the loader automatically positions the loading bar
     */
    loadingBarPosition: Vector | null;
    /**
     * Gets or sets the color of the loading bar, default is {@apilink Color.White}
     */
    loadingBarColor: Color;
    /**
     * Gets or sets the background color of the loader as a hex string
     */
    backgroundColor: string;
    protected _imageElement: HTMLImageElement;
    protected _imageLoaded: Future<void>;
    protected get _image(): HTMLImageElement;
    suppressPlayButton: boolean;
    get playButtonRootElement(): HTMLElement | null;
    get playButtonElement(): HTMLButtonElement | null;
    protected _playButtonRootElement: HTMLElement;
    protected _playButtonElement: HTMLButtonElement;
    protected _styleBlock: HTMLStyleElement;
    /** Loads the css from Loader.css */
    protected _playButtonStyles: string;
    protected get _playButton(): HTMLButtonElement;
    /**
     * Get/set play button text
     */
    playButtonText: string;
    /**
     * Return a html button element for excalibur to use as a play button
     */
    startButtonFactory: () => HTMLButtonElement;
    /**
     * @param options Optionally provide options to loader
     */
    constructor(options?: LoaderOptions);
    /**
     * @param loadables  Optionally provide the list of resources you want to load at constructor time
     */
    constructor(loadables?: Loadable<any>[]);
    onInitialize(engine: Engine): void;
    /**
     * Shows the play button and returns a promise that resolves when clicked
     */
    showPlayButton(): Promise<void>;
    hidePlayButton(): void;
    /**
     * Clean up generated elements for the loader
     */
    dispose(): void;
    data: Loadable<any>[];
    onUserAction(): Promise<void>;
    onBeforeLoad(): Promise<void>;
    onAfterLoad(): Promise<void>;
    private _positionPlayButton;
    /**
     * Loader draw function. Draws the default Excalibur loading screen.
     * Override `logo`, `logoWidth`, `logoHeight` and `backgroundColor` properties
     * to customize the drawing, or just override entire method.
     */
    onDraw(ctx: CanvasRenderingContext2D): void;
}

type GamepadEvents = {
    connect: GamepadConnectEvent;
    disconnect: GamepadDisconnectEvent;
    button: GamepadButtonEvent;
    axis: GamepadAxisEvent;
};
declare const GamepadEvents: {
    GamepadConnect: string;
    GamepadDisconnect: string;
    GamepadButton: string;
    GamepadAxis: string;
};
/**
 * Excalibur leverages the HTML5 Gamepad API [where it is supported](http://caniuse.com/#feat=gamepad)
 * to provide controller support for your games.
 */
declare class Gamepads {
    events: EventEmitter<GamepadEvents>;
    /**
     * Whether or not to poll for Gamepad input (default: `false`)
     */
    enabled: boolean;
    /**
     * Whether or not Gamepad API is supported
     */
    supported: boolean;
    /**
     * The minimum value an axis has to move before considering it a change
     */
    static MinAxisMoveThreshold: number;
    private _gamePadTimeStamps;
    private _oldPads;
    private _pads;
    private _initSuccess;
    private _navigator;
    private _minimumConfiguration;
    private _enabled;
    init(): void;
    toggleEnabled(enabled: boolean): void;
    /**
     * Sets the minimum gamepad configuration, for example {axis: 4, buttons: 4} means
     * this game requires at minimum 4 axis inputs and 4 buttons, this is not restrictive
     * all other controllers with more axis or buttons are valid as well. If no minimum
     * configuration is set all pads are valid.
     */
    setMinimumGamepadConfiguration(config: GamepadConfiguration): void;
    /**
     * When implicitly enabled, set the enabled flag and run an update so information is updated
     */
    private _enableAndUpdate;
    /**
     * Checks a navigator gamepad against the minimum configuration if present.
     */
    private _isGamepadValid;
    emit<TEventName extends EventKey<GamepadEvents>>(eventName: TEventName, event: GamepadEvents[TEventName]): void;
    emit(eventName: string, event?: any): void;
    on<TEventName extends EventKey<GamepadEvents>>(eventName: TEventName, handler: Handler<GamepadEvents[TEventName]>): Subscription;
    on(eventName: string, handler: Handler<unknown>): Subscription;
    once<TEventName extends EventKey<GamepadEvents>>(eventName: TEventName, handler: Handler<GamepadEvents[TEventName]>): Subscription;
    once(eventName: string, handler: Handler<unknown>): Subscription;
    off<TEventName extends EventKey<GamepadEvents>>(eventName: TEventName, handler: Handler<GamepadEvents[TEventName]>): void;
    off(eventName: string, handler: Handler<unknown>): void;
    off(eventName: string): void;
    /**
     * Updates Gamepad state and publishes Gamepad events
     */
    update(): void;
    /**
     * Safely retrieves a Gamepad at a specific index and creates one if it doesn't yet exist
     */
    at(index: number): Gamepad;
    /**
     * Returns a list of all valid gamepads that meet the minimum configuration requirement.
     */
    getValidGamepads(): Gamepad[];
    /**
     * Gets the number of connected gamepads
     */
    count(): number;
    private _clonePads;
    /**
     * Fastest way to clone a known object is to do it yourself
     */
    private _clonePad;
}
/**
 * Gamepad holds state information for a connected controller. See {@apilink Gamepads}
 * for more information on handling controller input.
 */
declare class Gamepad {
    events: EventEmitter<GamepadEvents>;
    connected: boolean;
    navigatorGamepad: NavigatorGamepad;
    private _axes;
    private _buttons;
    private _buttonsUp;
    private _buttonsDown;
    constructor();
    update(): void;
    /**
     * Whether or not the given button is pressed
     * @deprecated will be removed in v0.28.0. Use isButtonHeld instead
     * @param button     The button to query
     * @param threshold  The threshold over which the button is considered to be pressed
     */
    isButtonPressed(button: Buttons | number, threshold?: number): boolean;
    /**
     * Tests if a certain button is held down. This is persisted between frames.
     * @param button     The button to query
     * @param threshold  The threshold over which the button is considered to be pressed
     */
    isButtonHeld(button: Buttons | number, threshold?: number): boolean;
    /**
     * Tests if a certain button was just pressed this frame. This is cleared at the end of the update frame.
     * @param button Test whether a button was just pressed
     * @param threshold  The threshold over which the button is considered to be pressed
     */
    wasButtonPressed(button: Buttons | number, threshold?: number): boolean;
    /**
     * Tests if a certain button was just released this frame. This is cleared at the end of the update frame.
     * @param button  Test whether a button was just released
     */
    wasButtonReleased(button: Buttons | number): boolean;
    /**
     * Gets the given button value between 0 and 1
     */
    getButton(button: Buttons | number): number;
    /**
     * Gets the given axis value between -1 and 1. Values below
     * {@apilink MinAxisMoveThreshold} are considered 0.
     */
    getAxes(axes: Axes | number): number;
    updateButton(buttonIndex: number, value: number): void;
    updateAxes(axesIndex: number, value: number): void;
    emit<TEventName extends EventKey<GamepadEvents>>(eventName: TEventName, event: GamepadEvents[TEventName]): void;
    emit(eventName: string, event?: any): void;
    on<TEventName extends EventKey<GamepadEvents>>(eventName: TEventName, handler: Handler<GamepadEvents[TEventName]>): Subscription;
    on(eventName: string, handler: Handler<unknown>): Subscription;
    once<TEventName extends EventKey<GamepadEvents>>(eventName: TEventName, handler: Handler<GamepadEvents[TEventName]>): Subscription;
    once(eventName: string, handler: Handler<unknown>): Subscription;
    off<TEventName extends EventKey<GamepadEvents>>(eventName: TEventName, handler: Handler<GamepadEvents[TEventName]>): void;
    off(eventName: string, handler: Handler<unknown>): void;
    off(eventName: string): void;
}
/**
 * Gamepad Buttons enumeration
 */
declare enum Buttons {
    /**
     * Any button that isn't explicity known by excalibur
     */
    Unknown = -1,
    /**
     * Face 1 button (e.g. A)
     */
    Face1 = 0,
    /**
     * Face 2 button (e.g. B)
     */
    Face2 = 1,
    /**
     * Face 3 button (e.g. X)
     */
    Face3 = 2,
    /**
     * Face 4 button (e.g. Y)
     */
    Face4 = 3,
    /**
     * Left bumper button
     */
    LeftBumper = 4,
    /**
     * Right bumper button
     */
    RightBumper = 5,
    /**
     * Left trigger button
     */
    LeftTrigger = 6,
    /**
     * Right trigger button
     */
    RightTrigger = 7,
    /**
     * Select button
     */
    Select = 8,
    /**
     * Start button
     */
    Start = 9,
    /**
     * Left analog stick press (e.g. L3)
     */
    LeftStick = 10,
    /**
     * Right analog stick press (e.g. R3)
     */
    RightStick = 11,
    /**
     * D-pad up
     */
    DpadUp = 12,
    /**
     * D-pad down
     */
    DpadDown = 13,
    /**
     * D-pad left
     */
    DpadLeft = 14,
    /**
     * D-pad right
     */
    DpadRight = 15,
    /**
     * Center button (e.g. the Nintendo Home Button)
     */
    CenterButton = 16,
    /**
     * Misc button 1 (e.g. Xbox Series X share button, PS5 microphone button, Nintendo Switch Pro capture button, Amazon Luna microphone button)
     * defacto standard not listed on the w3c spec for a standard gamepad https://w3c.github.io/gamepad/#dfn-standard-gamepad
     */
    MiscButton1 = 17
}
/**
 * Gamepad Axes enumeration
 */
declare enum Axes {
    /**
     * Left analogue stick X direction
     */
    LeftStickX = 0,
    /**
     * Left analogue stick Y direction
     */
    LeftStickY = 1,
    /**
     * Right analogue stick X direction
     */
    RightStickX = 2,
    /**
     * Right analogue stick Y direction
     */
    RightStickY = 3
}
/**
 * @internal
 */
interface NavigatorGamepads {
    getGamepads(): (NavigatorGamepad | undefined)[];
}
/**
 * @internal
 */
interface NavigatorGamepad {
    axes: number[];
    buttons: NavigatorGamepadButton[];
    connected: boolean;
    id: string;
    index: number;
    mapping: string;
    timestamp: number;
}
/**
 * @internal
 */
interface NavigatorGamepadButton {
    pressed: boolean;
    value: number;
}
/**
 * @internal
 */
interface NavigatorGamepadEvent {
    gamepad: NavigatorGamepad;
}
/**
 * @internal
 */
interface GamepadConfiguration {
    axis: number;
    buttons: number;
}

/**
 * Enum representing physical input key codes
 *
 * Spec: https://w3c.github.io/uievents-code/#key-alphanumeric-section
 */
declare enum Keys {
    Backquote = "Backquote",
    Backslash = "Backslash",
    BracketLeft = "BracketLeft",
    BracketRight = "BracketRight",
    Comma = "Comma",
    Key0 = "Digit0",
    Key1 = "Digit1",
    Key2 = "Digit2",
    Key3 = "Digit3",
    Key4 = "Digit4",
    Key5 = "Digit5",
    Key6 = "Digit6",
    Key7 = "Digit7",
    Key8 = "Digit8",
    Key9 = "Digit9",
    Digit0 = "Digit0",
    Digit1 = "Digit1",
    Digit2 = "Digit2",
    Digit3 = "Digit3",
    Digit4 = "Digit4",
    Digit5 = "Digit5",
    Digit6 = "Digit6",
    Digit7 = "Digit7",
    Digit8 = "Digit8",
    Digit9 = "Digit9",
    Equal = "Equal",
    IntlBackslash = "IntlBackslash",
    IntlRo = "IntlRo",
    IntlYen = "IntlYen",
    A = "KeyA",
    B = "KeyB",
    C = "KeyC",
    D = "KeyD",
    E = "KeyE",
    F = "KeyF",
    G = "KeyG",
    H = "KeyH",
    I = "KeyI",
    J = "KeyJ",
    K = "KeyK",
    L = "KeyL",
    M = "KeyM",
    N = "KeyN",
    O = "KeyO",
    P = "KeyP",
    Q = "KeyQ",
    R = "KeyR",
    S = "KeyS",
    T = "KeyT",
    U = "KeyU",
    V = "KeyV",
    W = "KeyW",
    X = "KeyX",
    Y = "KeyY",
    Z = "KeyZ",
    KeyA = "KeyA",
    KeyB = "KeyB",
    KeyC = "KeyC",
    KeyD = "KeyD",
    KeyE = "KeyE",
    KeyF = "KeyF",
    KeyG = "KeyG",
    KeyH = "KeyH",
    KeyI = "KeyI",
    KeyJ = "KeyJ",
    KeyK = "KeyK",
    KeyL = "KeyL",
    KeyM = "KeyM",
    KeyN = "KeyN",
    KeyO = "KeyO",
    KeyP = "KeyP",
    KeyQ = "KeyQ",
    KeyR = "KeyR",
    KeyS = "KeyS",
    KeyT = "KeyT",
    KeyU = "KeyU",
    KeyV = "KeyV",
    KeyW = "KeyW",
    KeyX = "KeyX",
    KeyY = "KeyY",
    KeyZ = "KeyZ",
    Minus = "Minus",
    Period = "Period",
    Quote = "Quote",
    Semicolon = "Semicolon",
    Slash = "Slash",
    AltLeft = "AltLeft",
    AltRight = "AltRight",
    Alt = "Alt",
    AltGraph = "AltGraph",
    Backspace = "Backspace",
    CapsLock = "CapsLock",
    ContextMenu = "ContextMenu",
    ControlLeft = "ControlLeft",
    ControlRight = "ControlRight",
    Enter = "Enter",
    MetaLeft = "MetaLeft",
    MetaRight = "MetaRight",
    ShiftLeft = "ShiftLeft",
    ShiftRight = "ShiftRight",
    Space = "Space",
    Tab = "Tab",
    Convert = "Convert",
    KanaMode = "KanaMode",
    NonConvert = "NonConvert",
    Delete = "Delete",
    End = "End",
    Help = "Help",
    Home = "Home",
    Insert = "Insert",
    PageDown = "PageDown",
    PageUp = "PageUp",
    Up = "ArrowUp",
    Down = "ArrowDown",
    Left = "ArrowLeft",
    Right = "ArrowRight",
    ArrowUp = "ArrowUp",
    ArrowDown = "ArrowDown",
    ArrowLeft = "ArrowLeft",
    ArrowRight = "ArrowRight",
    NumLock = "NumLock",
    Numpad0 = "Numpad0",
    Numpad1 = "Numpad1",
    Numpad2 = "Numpad2",
    Numpad3 = "Numpad3",
    Numpad4 = "Numpad4",
    Numpad5 = "Numpad5",
    Numpad6 = "Numpad6",
    Numpad7 = "Numpad7",
    Numpad8 = "Numpad8",
    Numpad9 = "Numpad9",
    Num0 = "Numpad0",
    Num1 = "Numpad1",
    Num2 = "Numpad2",
    Num3 = "Numpad3",
    Num4 = "Numpad4",
    Num5 = "Numpad5",
    Num6 = "Numpad6",
    Num7 = "Numpad7",
    Num8 = "Numpad8",
    Num9 = "Numpad9",
    NumAdd = "NumpadAdd",
    NumpadAdd = "NumpadAdd",
    NumDecimal = "NumpadDecimal",
    NumpadDecimal = "NumpadDecimal",
    NumDivide = "NumpadDivide",
    NumpadDivide = "NumpadDivide",
    NumEnter = "NumpadEnter",
    NumpadEnter = "NumpadEnter",
    NumMultiply = "NumpadMultiply",
    NumpadMultiply = "NumpadMultiply",
    NumSubtract = "NumpadSubtract",
    NumpadSubtract = "NumpadSubtract",
    Esc = "Escape",
    Escape = "Escape",
    F1 = "F1",
    F2 = "F2",
    F3 = "F3",
    F4 = "F4",
    F5 = "F5",
    F6 = "F6",
    F7 = "F7",
    F8 = "F8",
    F9 = "F9",
    F10 = "F10",
    F11 = "F11",
    F12 = "F12",
    F13 = "F13",
    F14 = "F14",
    F15 = "F15",
    F16 = "F16",
    F17 = "F17",
    F18 = "F18",
    F19 = "F19",
    F20 = "F20",
    PrintScreen = "PrintScreen",
    ScrollLock = "ScrollLock",
    Pause = "Pause",
    Unidentified = "Unidentified"
}
/**
 * Event thrown on a game object for a key event
 */
declare class KeyEvent extends GameEvent<any> {
    key: Keys;
    value?: string;
    originalEvent?: KeyboardEvent;
    /**
     * @param key  The key responsible for throwing the event
     * @param value The key's typed value the browser detected
     * @param originalEvent The original keyboard event that Excalibur handled
     */
    constructor(key: Keys, value?: string, originalEvent?: KeyboardEvent);
}
interface KeyboardInitOptions {
    global: GlobalEventHandlers | (() => GlobalEventHandlers);
    grabWindowFocus?: boolean;
}
type KeyEvents = {
    press: KeyEvent;
    hold: KeyEvent;
    release: KeyEvent;
};
declare const KeyEvents: {
    Press: string;
    Hold: string;
    Release: string;
};
/**
 * Provides keyboard support for Excalibur.
 */
declare class Keyboard {
    events: EventEmitter<KeyEvents>;
    private _enabled;
    /**
     * Keys that are currently held down
     */
    private _keys;
    /**
     * Keys up in the current frame
     */
    private _keysUp;
    /**
     * Keys down in the current frame
     */
    private _keysDown;
    emit<TEventName extends EventKey<KeyEvents>>(eventName: TEventName, event: KeyEvents[TEventName]): void;
    emit(eventName: string, event?: any): void;
    on<TEventName extends EventKey<KeyEvents>>(eventName: TEventName, handler: Handler<KeyEvents[TEventName]>): Subscription;
    on(eventName: string, handler: Handler<unknown>): Subscription;
    once<TEventName extends EventKey<KeyEvents>>(eventName: TEventName, handler: Handler<KeyEvents[TEventName]>): Subscription;
    once(eventName: string, handler: Handler<unknown>): Subscription;
    off<TEventName extends EventKey<KeyEvents>>(eventName: TEventName, handler: Handler<KeyEvents[TEventName]>): void;
    off(eventName: string, handler: Handler<unknown>): void;
    off(eventName: string): void;
    /**
     * Initialize Keyboard event listeners
     */
    init(keyboardOptions?: KeyboardInitOptions): void;
    toggleEnabled(enabled: boolean): void;
    private _releaseAllKeys;
    clear(): void;
    private _handleKeyDown;
    private _handleKeyUp;
    update(): void;
    /**
     * Gets list of keys being pressed down
     */
    getKeys(): Keys[];
    /**
     * Tests if a certain key was just pressed this frame. This is cleared at the end of the update frame.
     * @param key Test whether a key was just pressed
     */
    wasPressed(key: Keys): boolean;
    /**
     * Tests if a certain key is held down. This is persisted between frames.
     * @param key  Test whether a key is held down
     */
    isHeld(key: Keys): boolean;
    /**
     * Tests if a certain key was just released this frame. This is cleared at the end of the update frame.
     * @param key  Test whether a key was just released
     */
    wasReleased(key: Keys): boolean;
    /**
     * Trigger a manual key event
     * @param type
     * @param key
     * @param character
     */
    triggerEvent(type: 'down' | 'up', key: Keys, character?: string): void;
}

interface InputsOptions {
    keyboard: Keyboard;
    gamepads: Gamepads;
    pointers: PointerEventReceiver;
}
/**
 * This allows you to map multiple inputs to specific commands! This is especially useful when
 * you need to allow multiple input sources to control a specific action.
 */
declare class InputMapper {
    inputs: InputsOptions;
    private _handlers;
    constructor(inputs: InputsOptions);
    /**
     * Executes the input map, called internally by Excalibur
     */
    execute(): void;
    /**
     * This allows you to map multiple inputs to specific commands! This is useful
     *
     * The inputHandler should return a truthy value if you wish the commandHandler to fire.
     *
     * Example:
     * ```typescript
     * const moveRight = (amount: number) => { actor.vel.x = 100 * amount }
     * const moveLeft = (amount: number) => { actor.vel.x = -100 * amount }
     * const moveUp = (amount: number) => { actor.vel.y = -100 * amount }
     * const moveDown = (amount: number) => { actor.vel.y = 100 * amount }
     *
     * engine.inputMapper.on(({keyboard}) => keyboard.isHeld(ex.Keys.ArrowRight) ? 1 : 0, moveRight);
     * engine.inputMapper.on(({gamepads}) => gamepads.at(0).isButtonPressed(ex.Buttons.DpadRight) ? 1 : 0, moveRight);
     * engine.inputMapper.on(({gamepads}) => gamepads.at(0).getAxes(ex.Axes.LeftStickX) > 0 ?
     *  gamepads.at(0).getAxes(ex.Axes.LeftStickX) : 0, moveRight);
     * ```
     * @param inputHandler
     * @param commandHandler
     */
    on<TInputHandlerData>(inputHandler: (inputs: InputsOptions) => TInputHandlerData | false, commandHandler: (data: TInputHandlerData) => any): void;
}

interface InputHostOptions {
    pointerTarget: Document | HTMLCanvasElement;
    grabWindowFocus: boolean;
    global?: GlobalEventHandlers | (() => GlobalEventHandlers);
    engine: Engine;
}
declare class InputHost {
    private _enabled;
    keyboard: Keyboard;
    pointers: PointerEventReceiver;
    gamepads: Gamepads;
    inputMapper: InputMapper;
    constructor(options: InputHostOptions);
    get enabled(): boolean;
    toggleEnabled(enabled: boolean): void;
    update(): void;
    clear(): void;
}

declare class PreLoadEvent {
    loader: DefaultLoader;
}
type SceneEvents = {
    initialize: InitializeEvent<Scene>;
    activate: ActivateEvent;
    deactivate: DeactivateEvent;
    preupdate: PreUpdateEvent;
    postupdate: PostUpdateEvent;
    predraw: PreDrawEvent;
    postdraw: PostDrawEvent;
    predebugdraw: PreDebugDrawEvent;
    postdebugdraw: PostDebugDrawEvent;
    preload: PreLoadEvent;
    transitionstart: Transition;
    transitionend: Transition;
};
declare const SceneEvents: {
    readonly Initialize: "initialize";
    readonly Activate: "activate";
    readonly Deactivate: "deactivate";
    readonly PreUpdate: "preupdate";
    readonly PostUpdate: "postupdate";
    readonly PreDraw: "predraw";
    readonly PostDraw: "postdraw";
    readonly PreDebugDraw: "predebugdraw";
    readonly PostDebugDraw: "postdebugdraw";
    readonly PreLoad: "preload";
    readonly TransitionStart: "transitionstart";
    readonly TransitionEnd: "transitionend";
};
type SceneConstructor = new (...args: any[]) => Scene;
/**
 *
 */
declare function isSceneConstructor(x: any): x is SceneConstructor;
/**
 * {@apilink Actor | `Actors`} are composed together into groupings called Scenes in
 * Excalibur. The metaphor models the same idea behind real world
 * actors in a scene. Only actors in scenes will be updated and drawn.
 *
 * Typical usages of a scene include: levels, menus, loading screens, etc.
 *
 * Scenes go through the following lifecycle
 * 1. onPreLoad - called once
 * 2. onInitialize - called once
 * 3. onActivate - called the first frame the scene is current
 * 4. onPreUpdate - called every update
 * 5. onPostUpdate - called every update
 * 6. onPreDraw - called every draw
 * 7. onPostDraw - called every draw
 * 8. onDeactivate - called teh first frame thescene is no longer current
 *
 */
declare class Scene<TActivationData = unknown> implements CanInitialize, CanActivate<TActivationData>, CanDeactivate, CanUpdate, CanDraw {
    private _logger;
    events: EventEmitter<SceneEvents>;
    /**
     * Gets or sets the current camera for the scene
     */
    camera: Camera;
    /**
     * Scene specific background color
     */
    backgroundColor?: Color;
    /**
     * The ECS world for the scene
     */
    world: World;
    /**
     * The Excalibur physics world for the scene. Used to interact
     * with colliders included in the scene.
     *
     * Can be used to perform scene ray casts, track colliders, broadphase, and narrowphase.
     */
    physics: PhysicsWorld;
    /**
     * The actors in the current scene
     */
    get actors(): readonly Actor[];
    /**
     * The entities in the current scene
     */
    get entities(): readonly Entity[];
    /**
     * The triggers in the current scene
     */
    get triggers(): readonly Trigger[];
    /**
     * The {@apilink TileMap}s in the scene, if any
     */
    get tileMaps(): readonly TileMap[];
    /**
     * Access to the Excalibur engine
     */
    engine: Engine;
    /**
     * Access scene specific input, handlers on this only fire when this scene is active.
     */
    input: InputHost;
    private _isInitialized;
    private _timers;
    get timers(): readonly Timer[];
    private _cancelQueue;
    constructor();
    emit<TEventName extends EventKey<SceneEvents>>(eventName: TEventName, event: SceneEvents[TEventName]): void;
    emit(eventName: string, event?: any): void;
    on<TEventName extends EventKey<SceneEvents>>(eventName: TEventName, handler: Handler<SceneEvents[TEventName]>): Subscription;
    on(eventName: string, handler: Handler<unknown>): Subscription;
    once<TEventName extends EventKey<SceneEvents>>(eventName: TEventName, handler: Handler<SceneEvents[TEventName]>): Subscription;
    once(eventName: string, handler: Handler<unknown>): Subscription;
    off<TEventName extends EventKey<SceneEvents>>(eventName: TEventName, handler: Handler<SceneEvents[TEventName]>): void;
    off(eventName: string, handler: Handler<unknown>): void;
    off(eventName: string): void;
    /**
     * Event hook to provide Scenes a way of loading scene specific resources.
     *
     * This is called before the Scene.onInitialize during scene transition. It will only ever fire once for a scene.
     * @param loader
     */
    onPreLoad(loader: DefaultLoader): void;
    /**
     * Event hook fired directly before transition, either "in" or "out" of the scene
     *
     * This overrides the Engine scene definition. However transitions specified in goToScene take highest precedence
     *
     * ```typescript
     * // Overrides all
     * Engine.goToScene('scene', { destinationIn: ..., sourceOut: ... });
     * ```
     *
     * This can be used to configure custom transitions for a scene dynamically
     */
    onTransition(direction: 'in' | 'out'): Transition | undefined;
    /**
     * This is called before the first update of the {@apilink Scene}. Initializes scene members like the camera. This method is meant to be
     * overridden. This is where initialization of child actors should take place.
     */
    onInitialize(engine: Engine): void;
    /**
     * This is called when the scene is made active and started. It is meant to be overridden,
     * this is where you should setup any DOM UI or event handlers needed for the scene.
     */
    onActivate(context: SceneActivationContext<TActivationData>): void;
    /**
     * This is called when the scene is made transitioned away from and stopped. It is meant to be overridden,
     * this is where you should cleanup any DOM UI or event handlers needed for the scene.
     * @returns Either data to pass to the next scene activation context as `previousSceneData` or nothing
     */
    onDeactivate(context: SceneActivationContext): any | void;
    /**
     * Safe to override onPreUpdate lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
     *
     * `onPreUpdate` is called directly before a scene is updated.
     * @param engine reference to the engine
     * @param elapsed  Number of milliseconds elapsed since the last draw.
     */
    onPreUpdate(engine: Engine, elapsed: number): void;
    /**
     * Safe to override onPostUpdate lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
     *
     * `onPostUpdate` is called directly after a scene is updated.
     * @param engine reference to the engine
     * @param elapsed  Number of milliseconds elapsed since the last draw.
     */
    onPostUpdate(engine: Engine, elapsed: number): void;
    /**
     * Safe to override onPreDraw lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
     *
     * `onPreDraw` is called directly before a scene is drawn.
     *
     */
    onPreDraw(ctx: ExcaliburGraphicsContext, elapsed: number): void;
    /**
     * Safe to override onPostDraw lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
     *
     * `onPostDraw` is called directly after a scene is drawn.
     *
     */
    onPostDraw(ctx: ExcaliburGraphicsContext, elapsed: number): void;
    /**
     * Initializes actors in the scene
     */
    private _initializeChildren;
    /**
     * Gets whether or not the {@apilink Scene} has been initialized
     */
    get isInitialized(): boolean;
    /**
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * Initializes the scene before the first update, meant to be called by engine not by users of
     * Excalibur
     * @internal
     */
    _initialize(engine: Engine): Promise<void>;
    /**
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * Activates the scene with the base behavior, then calls the overridable `onActivate` implementation.
     * @internal
     */
    _activate(context: SceneActivationContext<TActivationData>): Promise<void>;
    /**
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * Deactivates the scene with the base behavior, then calls the overridable `onDeactivate` implementation.
     * @internal
     */
    _deactivate(context: SceneActivationContext<never>): Promise<any>;
    /**
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * Internal _preupdate handler for {@apilink onPreUpdate} lifecycle event
     * @internal
     */
    _preupdate(engine: Engine, elapsed: number): void;
    /**
     *  It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * Internal _preupdate handler for {@apilink onPostUpdate} lifecycle event
     * @internal
     */
    _postupdate(engine: Engine, elapsed: number): void;
    /**
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * Internal _predraw handler for {@apilink onPreDraw} lifecycle event
     * @internal
     */
    _predraw(ctx: ExcaliburGraphicsContext, elapsed: number): void;
    /**
     * It is not recommended that internal excalibur methods be overridden, do so at your own risk.
     *
     * Internal _postdraw handler for {@apilink onPostDraw} lifecycle event
     * @internal
     */
    _postdraw(ctx: ExcaliburGraphicsContext, elapsed: number): void;
    /**
     * Updates all the actors and timers in the scene. Called by the {@apilink Engine}.
     * @param engine  Reference to the current Engine
     * @param elapsed   The number of milliseconds since the last update
     */
    update(engine: Engine, elapsed: number): void;
    /**
     * Draws all the actors in the Scene. Called by the {@apilink Engine}.
     * @param ctx    The current rendering context
     * @param elapsed  The number of milliseconds since the last draw
     */
    draw(ctx: ExcaliburGraphicsContext, elapsed: number): void;
    /**
     * Draws all the actors' debug information in the Scene. Called by the {@apilink Engine}.
     * @param ctx  The current rendering context
     */
    debugDraw(ctx: ExcaliburGraphicsContext): void;
    /**
     * Checks whether an actor is contained in this scene or not
     */
    contains(actor: Actor): boolean;
    /**
     * Adds a {@apilink Timer} to the current {@apilink Scene}.
     * @param timer  The timer to add to the current {@apilink Scene}.
     */
    add(timer: Timer): void;
    /**
     * Adds a {@apilink TileMap} to the {@apilink Scene}, once this is done the {@apilink TileMap} will be drawn and updated.
     */
    add(tileMap: TileMap): void;
    /**
     * Adds a {@apilink Trigger} to the {@apilink Scene}, once this is done the {@apilink Trigger} will listen for interactions with other actors.
     * @param trigger
     */
    add(trigger: Trigger): void;
    /**
     * Adds an actor to the scene, once this is done the {@apilink Actor} will be drawn and updated.
     * @param actor  The actor to add to the current scene
     */
    add(actor: Actor): void;
    /**
     * Adds an {@apilink Entity} to the scene, once this is done the {@apilink Actor} will be drawn and updated.
     * @param entity The entity to add to the current scene
     */
    add(entity: Entity): void;
    /**
     * Adds a {@apilink ScreenElement} to the scene.
     * @param screenElement  The ScreenElement to add to the current scene
     */
    add(screenElement: ScreenElement): void;
    /**
     * Removes a {@apilink Timer} from it's current scene
     * and adds it to this scene.
     *
     * Useful if you want to have an object be present in only 1 scene at a time.
     * @param timer The Timer to transfer to the current scene
     */
    transfer(timer: Timer): void;
    /**
     * Removes a {@apilink TileMap} from it's current scene
     * and adds it to this scene.
     *
     * Useful if you want to have an object be present in only 1 scene at a time.
     * @param tileMap The TileMap to transfer to the current scene
     */
    transfer(tileMap: TileMap): void;
    /**
     * Removes a {@apilink Trigger} from it's current scene
     * and adds it to this scene.
     *
     * Useful if you want to have an object be present in only 1 scene at a time.
     * @param trigger The Trigger to transfer to the current scene
     */
    transfer(trigger: Trigger): void;
    /**
     * Removes an {@apilink Actor} from it's current scene
     * and adds it to this scene.
     *
     * Useful if you want to have an object be present in only 1 scene at a time.
     * @param actor The Actor to transfer to the current scene
     */
    transfer(actor: Actor): void;
    /**
     * Removes an {@apilink Entity} from it's current scene
     * and adds it to this scene.
     *
     * Useful if you want to have an object be present in only 1 scene at a time.
     * @param entity The Entity to transfer to the current scene
     */
    transfer(entity: Entity): void;
    /**
     * Removes a {@apilink ScreenElement} from it's current scene
     * and adds it to this scene.
     *
     * Useful if you want to have an object be present in only 1 scene at a time.
     * @param screenElement The ScreenElement to transfer to the current scene
     */
    transfer(screenElement: ScreenElement): void;
    /**
     * Removes a {@apilink Timer} from the current scene, it will no longer be updated.
     * @param timer  The timer to remove to the current scene.
     */
    remove(timer: Timer): void;
    /**
     * Removes a {@apilink TileMap} from the scene, it will no longer be drawn or updated.
     * @param tileMap {TileMap}
     */
    remove(tileMap: TileMap): void;
    /**
     * Removes an actor from the scene, it will no longer be drawn or updated.
     * @param actor  The actor to remove from the current scene.
     */
    remove(actor: Actor): void;
    remove(entity: Entity): void;
    /**
     * Removes a {@apilink ScreenElement} to the scene, it will no longer be drawn or updated
     * @param screenElement  The ScreenElement to remove from the current scene
     */
    remove(screenElement: ScreenElement): void;
    /**
     * Removes all entities and timers from the scene, optionally indicate whether deferred should or shouldn't be used.
     *
     * By default entities use deferred removal
     * @param deferred
     */
    clear(deferred?: boolean): void;
    /**
     * Adds a {@apilink Timer} to the scene
     * @param timer  The timer to add
     */
    addTimer(timer: Timer): Timer;
    /**
     * Removes a {@apilink Timer} from the scene.
     * @warning Can be dangerous, use {@apilink cancelTimer} instead
     * @param timer  The timer to remove
     */
    removeTimer(timer: Timer): Timer;
    /**
     * Cancels a {@apilink Timer}, removing it from the scene nicely
     * @param timer  The timer to cancel
     */
    cancelTimer(timer: Timer): Timer;
    /**
     * Tests whether a {@apilink Timer} is active in the scene
     */
    isTimerActive(timer: Timer): boolean;
    isCurrentScene(): boolean;
    private _collectActorStats;
}

declare enum EventTypes {
    Kill = "kill",
    PreKill = "prekill",
    PostKill = "postkill",
    PreDraw = "predraw",
    PostDraw = "postdraw",
    PreDebugDraw = "predebugdraw",
    PostDebugDraw = "postdebugdraw",
    PreUpdate = "preupdate",
    PostUpdate = "postupdate",
    PreFrame = "preframe",
    PostFrame = "postframe",
    PreCollision = "precollision",
    CollisionStart = "collisionstart",
    CollisionEnd = "collisionend",
    PostCollision = "postcollision",
    Initialize = "initialize",
    Activate = "activate",
    Deactivate = "deactivate",
    ExitViewport = "exitviewport",
    EnterViewport = "enterviewport",
    ExitTrigger = "exit",
    EnterTrigger = "enter",
    Connect = "connect",
    Disconnect = "disconnect",
    Button = "button",
    Axis = "axis",
    Visible = "visible",
    Hidden = "hidden",
    Start = "start",
    Stop = "stop",
    PointerUp = "pointerup",
    PointerDown = "pointerdown",
    PointerMove = "pointermove",
    PointerEnter = "pointerenter",
    PointerLeave = "pointerleave",
    PointerCancel = "pointercancel",
    PointerWheel = "pointerwheel",
    Up = "up",
    Down = "down",
    Move = "move",
    Enter = "enter",
    Leave = "leave",
    Cancel = "cancel",
    Wheel = "wheel",
    Press = "press",
    Release = "release",
    Hold = "hold",
    PointerDragStart = "pointerdragstart",
    PointerDragEnd = "pointerdragend",
    PointerDragEnter = "pointerdragenter",
    PointerDragLeave = "pointerdragleave",
    PointerDragMove = "pointerdragmove",
    ActionStart = "actionstart",
    ActionComplete = "actioncomplete",
    Add = "add",
    Remove = "remove"
}
type kill = 'kill';
type prekill = 'prekill';
type postkill = 'postkill';
type predraw = 'predraw';
type postdraw = 'postdraw';
type predebugdraw = 'predebugdraw';
type postdebugdraw = 'postdebugdraw';
type preupdate = 'preupdate';
type postupdate = 'postupdate';
type preframe = 'preframe';
type postframe = 'postframe';
type precollision = 'precollision';
type collisionstart = 'collisionstart';
type collisionend = 'collisionend';
type postcollision = 'postcollision';
type initialize = 'initialize';
type activate = 'activate';
type deactivate = 'deactivate';
type exitviewport = 'exitviewport';
type enterviewport = 'enterviewport';
type exittrigger = 'exit';
type entertrigger = 'enter';
type connect = 'connect';
type disconnect = 'disconnect';
type button = 'button';
type axis = 'axis';
type subscribe = 'subscribe';
type unsubscribe = 'unsubscribe';
type visible = 'visible';
type hidden = 'hidden';
type start = 'start';
type stop = 'stop';
type pointerup = 'pointerup';
type pointerdown = 'pointerdown';
type pointermove = 'pointermove';
type pointerenter = 'pointerenter';
type pointerleave = 'pointerleave';
type pointercancel = 'pointercancel';
type pointerwheel = 'pointerwheel';
type up = 'up';
type down = 'down';
type move = 'move';
type enter = 'enter';
type leave = 'leave';
type cancel = 'cancel';
type wheel = 'wheel';
type press = 'press';
type release = 'release';
type hold = 'hold';
type pointerdragstart = 'pointerdragstart';
type pointerdragend = 'pointerdragend';
type pointerdragenter = 'pointerdragenter';
type pointerdragleave = 'pointerdragleave';
type pointerdragmove = 'pointerdragmove';
type add = 'add';
type remove = 'remove';
/**
 * Base event type in Excalibur that all other event types derive from. Not all event types are thrown on all Excalibur game objects,
 * some events are unique to a type, others are not.
 *
 */
declare class GameEvent<T, U = T> {
    /**
     * Target object for this event.
     */
    target: T;
    /**
     * Other target object for this event
     */
    other: U | null;
    /**
     * If set to false, prevents event from propagating to other actors. If true it will be propagated
     * to all actors that apply.
     */
    get bubbles(): boolean;
    set bubbles(value: boolean);
    private _bubbles;
    /**
     * Prevents event from bubbling
     */
    stopPropagation(): void;
}
/**
 * The 'kill' event is emitted on actors when it is killed. The target is the actor that was killed.
 */
declare class KillEvent extends GameEvent<Entity> {
    self: Entity;
    constructor(self: Entity);
}
/**
 * The 'prekill' event is emitted directly before an actor is killed.
 */
declare class PreKillEvent extends GameEvent<Actor> {
    self: Actor;
    constructor(self: Actor);
}
/**
 * The 'postkill' event is emitted directly after the actor is killed.
 */
declare class PostKillEvent extends GameEvent<Actor> {
    self: Actor;
    constructor(self: Actor);
}
/**
 * The 'start' event is emitted on engine when has started and is ready for interaction.
 */
declare class GameStartEvent extends GameEvent<Engine> {
    self: Engine;
    constructor(self: Engine);
}
/**
 * The 'stop' event is emitted on engine when has been stopped and will no longer take input, update or draw.
 */
declare class GameStopEvent extends GameEvent<Engine> {
    self: Engine;
    constructor(self: Engine);
}
/**
 * The 'predraw' event is emitted on actors, scenes, and engine before drawing starts. Actors' predraw happens inside their graphics
 * transform so that all drawing takes place with the actor as the origin.
 *
 */
declare class PreDrawEvent extends GameEvent<Entity | Scene | Engine | TileMap> {
    ctx: ExcaliburGraphicsContext;
    elapsed: number;
    self: Entity | Scene | Engine | TileMap;
    constructor(ctx: ExcaliburGraphicsContext, elapsed: number, self: Entity | Scene | Engine | TileMap);
}
/**
 * The 'postdraw' event is emitted on actors, scenes, and engine after drawing finishes. Actors' postdraw happens inside their graphics
 * transform so that all drawing takes place with the actor as the origin.
 *
 */
declare class PostDrawEvent extends GameEvent<Entity | Scene | Engine | TileMap> {
    ctx: ExcaliburGraphicsContext;
    elapsed: number;
    self: Entity | Scene | Engine | TileMap;
    constructor(ctx: ExcaliburGraphicsContext, elapsed: number, self: Entity | Scene | Engine | TileMap);
}
/**
 * The 'pretransformdraw' event is emitted on actors/entities before any graphics transforms have taken place.
 * Useful if you need to completely customize the draw or modify the transform before drawing in the draw step (for example needing
 * latest camera positions)
 *
 */
declare class PreTransformDrawEvent extends GameEvent<Entity> {
    ctx: ExcaliburGraphicsContext;
    elapsed: number;
    self: Entity;
    constructor(ctx: ExcaliburGraphicsContext, elapsed: number, self: Entity);
}
/**
 * The 'posttransformdraw' event is emitted on actors/entities after all graphics have been draw and transforms reset.
 * Useful if you need to completely custom the draw after everything is done.
 *
 */
declare class PostTransformDrawEvent extends GameEvent<Entity> {
    ctx: ExcaliburGraphicsContext;
    elapsed: number;
    self: Entity;
    constructor(ctx: ExcaliburGraphicsContext, elapsed: number, self: Entity);
}
/**
 * The 'predebugdraw' event is emitted on actors, scenes, and engine before debug drawing starts.
 */
declare class PreDebugDrawEvent extends GameEvent<Entity | Actor | Scene | Engine> {
    ctx: ExcaliburGraphicsContext;
    self: Entity | Actor | Scene | Engine;
    constructor(ctx: ExcaliburGraphicsContext, self: Entity | Actor | Scene | Engine);
}
/**
 * The 'postdebugdraw' event is emitted on actors, scenes, and engine after debug drawing starts.
 */
declare class PostDebugDrawEvent extends GameEvent<Entity | Actor | Scene | Engine> {
    ctx: ExcaliburGraphicsContext;
    self: Entity | Actor | Scene | Engine;
    constructor(ctx: ExcaliburGraphicsContext, self: Entity | Actor | Scene | Engine);
}
/**
 * The 'preupdate' event is emitted on actors, scenes, camera, and engine before the update starts.
 */
declare class PreUpdateEvent<T extends OnPreUpdate = Entity> extends GameEvent<T> {
    engine: Engine;
    elapsed: number;
    self: T;
    constructor(engine: Engine, elapsed: number, self: T);
}
/**
 * The 'postupdate' event is emitted on actors, scenes, camera, and engine after the update ends.
 */
declare class PostUpdateEvent<T extends OnPostUpdate = Entity> extends GameEvent<T> {
    engine: Engine;
    elapsed: number;
    self: T;
    constructor(engine: Engine, elapsed: number, self: T);
}
/**
 * The 'preframe' event is emitted on the engine, before the frame begins.
 */
declare class PreFrameEvent extends GameEvent<Engine> {
    engine: Engine;
    prevStats: FrameStats;
    constructor(engine: Engine, prevStats: FrameStats);
}
/**
 * The 'postframe' event is emitted on the engine, after a frame ends.
 */
declare class PostFrameEvent extends GameEvent<Engine> {
    engine: Engine;
    stats: FrameStats;
    constructor(engine: Engine, stats: FrameStats);
}
/**
 * Event received when a gamepad is connected to Excalibur. {@apilink Gamepads} receives this event.
 */
declare class GamepadConnectEvent extends GameEvent<Gamepad> {
    index: number;
    gamepad: Gamepad;
    constructor(index: number, gamepad: Gamepad);
}
/**
 * Event received when a gamepad is disconnected from Excalibur. {@apilink Gamepads} receives this event.
 */
declare class GamepadDisconnectEvent extends GameEvent<Gamepad> {
    index: number;
    gamepad: Gamepad;
    constructor(index: number, gamepad: Gamepad);
}
/**
 * Gamepad button event. See {@apilink Gamepads} for information on responding to controller input. {@apilink Gamepad} instances receive this event;
 */
declare class GamepadButtonEvent extends GameEvent<Gamepad> {
    /**
     * The Gamepad {@apilink Buttons} if not known by excalibur {@apilink Buttons.Unknown} is returned, use index to disambiguate.
     */
    button: Buttons;
    /**
     * The canonical index of the gamepad button from the system
     */
    index: number;
    /**
     * A numeric value between 0 and 1
     */
    value: number;
    /**
     * Reference to the gamepad
     */
    self: Gamepad;
    /**
     * @param button  The Gamepad {@apilink Buttons} if not known by excalibur {@apilink Buttons.Unknown} is returned, use index to disambiguate.
     * @param index   The canonical index of the gamepad button from the system
     * @param value   A numeric value between 0 and 1
     * @param self    Reference to the gamepad
     */
    constructor(
    /**
     * The Gamepad {@apilink Buttons} if not known by excalibur {@apilink Buttons.Unknown} is returned, use index to disambiguate.
     */
    button: Buttons, 
    /**
     * The canonical index of the gamepad button from the system
     */
    index: number, 
    /**
     * A numeric value between 0 and 1
     */
    value: number, 
    /**
     * Reference to the gamepad
     */
    self: Gamepad);
}
/**
 * Gamepad axis event. See {@apilink Gamepads} for information on responding to controller input. {@apilink Gamepad} instances receive this event;
 */
declare class GamepadAxisEvent extends GameEvent<Gamepad> {
    /**
     * The Gamepad {@apilink Axis}
     */
    axis: Axes;
    /**
     * A numeric value between -1 and 1, 0 is the neutral axis position.
     */
    value: number;
    /**
     * Reference to the gamepad
     */
    self: Gamepad;
    /**
     * @param axis  The Gamepad axis
     * @param value A numeric value between -1 and 1
     * @param self Reference to the gamepad
     */
    constructor(
    /**
     * The Gamepad {@apilink Axis}
     */
    axis: Axes, 
    /**
     * A numeric value between -1 and 1, 0 is the neutral axis position.
     */
    value: number, 
    /**
     * Reference to the gamepad
     */
    self: Gamepad);
}
/**
 * Event received by the {@apilink Engine} when the browser window is visible on a screen.
 */
declare class VisibleEvent extends GameEvent<Engine> {
    self: Engine;
    constructor(self: Engine);
}
/**
 * Event received by the {@apilink Engine} when the browser window is hidden from all screens.
 */
declare class HiddenEvent extends GameEvent<Engine> {
    self: Engine;
    constructor(self: Engine);
}
/**
 * Event thrown on an {@apilink Actor | `actor`} when a collision will occur this frame if it resolves
 */
declare class PreCollisionEvent<T extends Collider = Collider> extends GameEvent<T> {
    self: T;
    other: T;
    side: Side;
    intersection: Vector;
    contact: CollisionContact;
    /**
     * @param self          The actor the event was thrown on
     * @param other         The actor that will collided with the current actor
     * @param side          The side that will be collided with the current actor
     * @param intersection  Intersection vector
     */
    constructor(self: T, other: T, side: Side, intersection: Vector, contact: CollisionContact);
}
/**
 * Event thrown on an {@apilink Actor | `actor`} when a collision has been resolved (body reacted) this frame
 */
declare class PostCollisionEvent<T extends Collider = Collider> extends GameEvent<T> {
    self: T;
    other: T;
    side: Side;
    intersection: Vector;
    contact: CollisionContact;
    /**
     * @param self          The actor the event was thrown on
     * @param other         The actor that did collide with the current actor
     * @param side          The side that did collide with the current actor
     * @param intersection  Intersection vector
     */
    constructor(self: T, other: T, side: Side, intersection: Vector, contact: CollisionContact);
}
declare class ContactStartEvent<T extends Collider = Collider> {
    self: T;
    other: T;
    side: Side;
    contact: CollisionContact;
    constructor(self: T, other: T, side: Side, contact: CollisionContact);
}
declare class ContactEndEvent<T extends Collider = Collider> {
    self: T;
    other: T;
    side: Side;
    lastContact: CollisionContact;
    constructor(self: T, other: T, side: Side, lastContact: CollisionContact);
}
declare class CollisionPreSolveEvent<T extends Collider = Collider> {
    self: T;
    other: T;
    side: Side;
    intersection: Vector;
    contact: CollisionContact;
    constructor(self: T, other: T, side: Side, intersection: Vector, contact: CollisionContact);
}
declare class CollisionPostSolveEvent<T extends Collider = Collider> {
    self: T;
    other: T;
    side: Side;
    intersection: Vector;
    contact: CollisionContact;
    constructor(self: T, other: T, side: Side, intersection: Vector, contact: CollisionContact);
}
/**
 * Event thrown the first time an {@apilink Actor | `actor`} collides with another, after an actor is in contact normal collision events are fired.
 */
declare class CollisionStartEvent<T extends Collider = Collider> extends GameEvent<T> {
    self: T;
    other: T;
    side: Side;
    contact: CollisionContact;
    /**
     *
     * @param self
     * @param other
     * @param side
     * @param contact
     */
    constructor(self: T, other: T, side: Side, contact: CollisionContact);
}
/**
 * Event thrown when the {@apilink Actor | `actor`} is no longer colliding with another
 */
declare class CollisionEndEvent<T extends Collider = Collider> extends GameEvent<T> {
    self: T;
    other: T;
    side: Side;
    lastContact: CollisionContact;
    /**
     *
     */
    constructor(self: T, other: T, side: Side, lastContact: CollisionContact);
}
/**
 * Event thrown on an {@apilink Actor}, {@apilink Scene}, and {@apilink Engine} only once before the first update call
 */
declare class InitializeEvent<T extends OnInitialize = Entity> extends GameEvent<T> {
    engine: Engine;
    self: T;
    /**
     * @param engine  The reference to the current engine
     */
    constructor(engine: Engine, self: T);
}
/**
 * Event thrown on a {@apilink Scene} on activation
 */
declare class ActivateEvent<TData = undefined> extends GameEvent<Scene> {
    context: SceneActivationContext<TData>;
    self: Scene;
    /**
     * @param context  The context for the scene activation
     */
    constructor(context: SceneActivationContext<TData>, self: Scene);
}
/**
 * Event thrown on a {@apilink Scene} on deactivation
 */
declare class DeactivateEvent extends GameEvent<Scene> {
    context: SceneActivationContext<never>;
    self: Scene;
    /**
     * @param context  The context for the scene deactivation
     */
    constructor(context: SceneActivationContext<never>, self: Scene);
}
/**
 * Event thrown on an {@apilink Actor} when the graphics bounds completely leaves the screen.
 */
declare class ExitViewPortEvent extends GameEvent<Entity> {
    self: Entity;
    constructor(self: Entity);
}
/**
 * Event thrown on an {@apilink Actor} when any part of the graphics bounds are on screen.
 */
declare class EnterViewPortEvent extends GameEvent<Entity> {
    self: Entity;
    constructor(self: Entity);
}
declare class EnterTriggerEvent extends GameEvent<Trigger> {
    self: Trigger;
    entity: Entity;
    constructor(self: Trigger, entity: Entity);
}
declare class ExitTriggerEvent extends GameEvent<Trigger> {
    self: Trigger;
    entity: Entity;
    constructor(self: Trigger, entity: Entity);
}
/**
 * Event thrown on an {@apilink Actor} when an action starts.
 */
declare class ActionStartEvent extends GameEvent<Entity> {
    action: Action;
    self: Entity;
    constructor(action: Action, self: Entity);
}
/**
 * Event thrown on an {@apilink Actor} when an action completes.
 */
declare class ActionCompleteEvent extends GameEvent<Entity> {
    action: Action;
    self: Entity;
    constructor(action: Action, self: Entity);
}
/**
 * Event thrown on an [[Actor]] when an Actor added to scene.
 */
declare class AddEvent<T extends OnAdd> extends GameEvent<T> {
    engine: Engine;
    self: T;
    constructor(engine: Engine, self: T);
}
/**
 * Event thrown on an [[Actor]] when an Actor removed from scene.
 */
declare class RemoveEvent<T extends OnRemove> extends GameEvent<T> {
    engine: Engine;
    self: T;
    constructor(engine: Engine, self: T);
}

type Events_ActionCompleteEvent = ActionCompleteEvent;
declare const Events_ActionCompleteEvent: typeof ActionCompleteEvent;
type Events_ActionStartEvent = ActionStartEvent;
declare const Events_ActionStartEvent: typeof ActionStartEvent;
type Events_ActivateEvent<TData = undefined> = ActivateEvent<TData>;
declare const Events_ActivateEvent: typeof ActivateEvent;
type Events_AddEvent<T extends OnAdd> = AddEvent<T>;
declare const Events_AddEvent: typeof AddEvent;
type Events_CollisionEndEvent<T extends Collider = Collider> = CollisionEndEvent<T>;
declare const Events_CollisionEndEvent: typeof CollisionEndEvent;
type Events_CollisionPostSolveEvent<T extends Collider = Collider> = CollisionPostSolveEvent<T>;
declare const Events_CollisionPostSolveEvent: typeof CollisionPostSolveEvent;
type Events_CollisionPreSolveEvent<T extends Collider = Collider> = CollisionPreSolveEvent<T>;
declare const Events_CollisionPreSolveEvent: typeof CollisionPreSolveEvent;
type Events_CollisionStartEvent<T extends Collider = Collider> = CollisionStartEvent<T>;
declare const Events_CollisionStartEvent: typeof CollisionStartEvent;
type Events_ContactEndEvent<T extends Collider = Collider> = ContactEndEvent<T>;
declare const Events_ContactEndEvent: typeof ContactEndEvent;
type Events_ContactStartEvent<T extends Collider = Collider> = ContactStartEvent<T>;
declare const Events_ContactStartEvent: typeof ContactStartEvent;
type Events_DeactivateEvent = DeactivateEvent;
declare const Events_DeactivateEvent: typeof DeactivateEvent;
type Events_EnterTriggerEvent = EnterTriggerEvent;
declare const Events_EnterTriggerEvent: typeof EnterTriggerEvent;
type Events_EnterViewPortEvent = EnterViewPortEvent;
declare const Events_EnterViewPortEvent: typeof EnterViewPortEvent;
type Events_EventTypes = EventTypes;
declare const Events_EventTypes: typeof EventTypes;
type Events_ExitTriggerEvent = ExitTriggerEvent;
declare const Events_ExitTriggerEvent: typeof ExitTriggerEvent;
type Events_ExitViewPortEvent = ExitViewPortEvent;
declare const Events_ExitViewPortEvent: typeof ExitViewPortEvent;
type Events_GameEvent<T, U = T> = GameEvent<T, U>;
declare const Events_GameEvent: typeof GameEvent;
type Events_GameStartEvent = GameStartEvent;
declare const Events_GameStartEvent: typeof GameStartEvent;
type Events_GameStopEvent = GameStopEvent;
declare const Events_GameStopEvent: typeof GameStopEvent;
type Events_GamepadAxisEvent = GamepadAxisEvent;
declare const Events_GamepadAxisEvent: typeof GamepadAxisEvent;
type Events_GamepadButtonEvent = GamepadButtonEvent;
declare const Events_GamepadButtonEvent: typeof GamepadButtonEvent;
type Events_GamepadConnectEvent = GamepadConnectEvent;
declare const Events_GamepadConnectEvent: typeof GamepadConnectEvent;
type Events_GamepadDisconnectEvent = GamepadDisconnectEvent;
declare const Events_GamepadDisconnectEvent: typeof GamepadDisconnectEvent;
type Events_HiddenEvent = HiddenEvent;
declare const Events_HiddenEvent: typeof HiddenEvent;
type Events_InitializeEvent<T extends OnInitialize = Entity> = InitializeEvent<T>;
declare const Events_InitializeEvent: typeof InitializeEvent;
type Events_KillEvent = KillEvent;
declare const Events_KillEvent: typeof KillEvent;
type Events_PostCollisionEvent<T extends Collider = Collider> = PostCollisionEvent<T>;
declare const Events_PostCollisionEvent: typeof PostCollisionEvent;
type Events_PostDebugDrawEvent = PostDebugDrawEvent;
declare const Events_PostDebugDrawEvent: typeof PostDebugDrawEvent;
type Events_PostDrawEvent = PostDrawEvent;
declare const Events_PostDrawEvent: typeof PostDrawEvent;
type Events_PostFrameEvent = PostFrameEvent;
declare const Events_PostFrameEvent: typeof PostFrameEvent;
type Events_PostKillEvent = PostKillEvent;
declare const Events_PostKillEvent: typeof PostKillEvent;
type Events_PostTransformDrawEvent = PostTransformDrawEvent;
declare const Events_PostTransformDrawEvent: typeof PostTransformDrawEvent;
type Events_PostUpdateEvent<T extends OnPostUpdate = Entity> = PostUpdateEvent<T>;
declare const Events_PostUpdateEvent: typeof PostUpdateEvent;
type Events_PreCollisionEvent<T extends Collider = Collider> = PreCollisionEvent<T>;
declare const Events_PreCollisionEvent: typeof PreCollisionEvent;
type Events_PreDebugDrawEvent = PreDebugDrawEvent;
declare const Events_PreDebugDrawEvent: typeof PreDebugDrawEvent;
type Events_PreDrawEvent = PreDrawEvent;
declare const Events_PreDrawEvent: typeof PreDrawEvent;
type Events_PreFrameEvent = PreFrameEvent;
declare const Events_PreFrameEvent: typeof PreFrameEvent;
type Events_PreKillEvent = PreKillEvent;
declare const Events_PreKillEvent: typeof PreKillEvent;
type Events_PreTransformDrawEvent = PreTransformDrawEvent;
declare const Events_PreTransformDrawEvent: typeof PreTransformDrawEvent;
type Events_PreUpdateEvent<T extends OnPreUpdate = Entity> = PreUpdateEvent<T>;
declare const Events_PreUpdateEvent: typeof PreUpdateEvent;
type Events_RemoveEvent<T extends OnRemove> = RemoveEvent<T>;
declare const Events_RemoveEvent: typeof RemoveEvent;
type Events_VisibleEvent = VisibleEvent;
declare const Events_VisibleEvent: typeof VisibleEvent;
type Events_activate = activate;
type Events_add = add;
type Events_axis = axis;
type Events_button = button;
type Events_cancel = cancel;
type Events_collisionend = collisionend;
type Events_collisionstart = collisionstart;
type Events_connect = connect;
type Events_deactivate = deactivate;
type Events_disconnect = disconnect;
type Events_down = down;
type Events_enter = enter;
type Events_entertrigger = entertrigger;
type Events_enterviewport = enterviewport;
type Events_exittrigger = exittrigger;
type Events_exitviewport = exitviewport;
type Events_hidden = hidden;
type Events_hold = hold;
type Events_initialize = initialize;
type Events_kill = kill;
type Events_leave = leave;
type Events_move = move;
type Events_pointercancel = pointercancel;
type Events_pointerdown = pointerdown;
type Events_pointerdragend = pointerdragend;
type Events_pointerdragenter = pointerdragenter;
type Events_pointerdragleave = pointerdragleave;
type Events_pointerdragmove = pointerdragmove;
type Events_pointerdragstart = pointerdragstart;
type Events_pointerenter = pointerenter;
type Events_pointerleave = pointerleave;
type Events_pointermove = pointermove;
type Events_pointerup = pointerup;
type Events_pointerwheel = pointerwheel;
type Events_postcollision = postcollision;
type Events_postdebugdraw = postdebugdraw;
type Events_postdraw = postdraw;
type Events_postframe = postframe;
type Events_postkill = postkill;
type Events_postupdate = postupdate;
type Events_precollision = precollision;
type Events_predebugdraw = predebugdraw;
type Events_predraw = predraw;
type Events_preframe = preframe;
type Events_prekill = prekill;
type Events_press = press;
type Events_preupdate = preupdate;
type Events_release = release;
type Events_remove = remove;
type Events_start = start;
type Events_stop = stop;
type Events_subscribe = subscribe;
type Events_unsubscribe = unsubscribe;
type Events_up = up;
type Events_visible = visible;
type Events_wheel = wheel;
declare namespace Events {
  export { Events_ActionCompleteEvent as ActionCompleteEvent, Events_ActionStartEvent as ActionStartEvent, Events_ActivateEvent as ActivateEvent, Events_AddEvent as AddEvent, Events_CollisionEndEvent as CollisionEndEvent, Events_CollisionPostSolveEvent as CollisionPostSolveEvent, Events_CollisionPreSolveEvent as CollisionPreSolveEvent, Events_CollisionStartEvent as CollisionStartEvent, Events_ContactEndEvent as ContactEndEvent, Events_ContactStartEvent as ContactStartEvent, Events_DeactivateEvent as DeactivateEvent, Events_EnterTriggerEvent as EnterTriggerEvent, Events_EnterViewPortEvent as EnterViewPortEvent, Events_EventTypes as EventTypes, Events_ExitTriggerEvent as ExitTriggerEvent, Events_ExitViewPortEvent as ExitViewPortEvent, Events_GameEvent as GameEvent, Events_GameStartEvent as GameStartEvent, Events_GameStopEvent as GameStopEvent, Events_GamepadAxisEvent as GamepadAxisEvent, Events_GamepadButtonEvent as GamepadButtonEvent, Events_GamepadConnectEvent as GamepadConnectEvent, Events_GamepadDisconnectEvent as GamepadDisconnectEvent, Events_HiddenEvent as HiddenEvent, Events_InitializeEvent as InitializeEvent, Events_KillEvent as KillEvent, Events_PostCollisionEvent as PostCollisionEvent, Events_PostDebugDrawEvent as PostDebugDrawEvent, Events_PostDrawEvent as PostDrawEvent, Events_PostFrameEvent as PostFrameEvent, Events_PostKillEvent as PostKillEvent, Events_PostTransformDrawEvent as PostTransformDrawEvent, Events_PostUpdateEvent as PostUpdateEvent, Events_PreCollisionEvent as PreCollisionEvent, Events_PreDebugDrawEvent as PreDebugDrawEvent, Events_PreDrawEvent as PreDrawEvent, Events_PreFrameEvent as PreFrameEvent, Events_PreKillEvent as PreKillEvent, Events_PreTransformDrawEvent as PreTransformDrawEvent, Events_PreUpdateEvent as PreUpdateEvent, Events_RemoveEvent as RemoveEvent, Events_VisibleEvent as VisibleEvent, type Events_activate as activate, type Events_add as add, type Events_axis as axis, type Events_button as button, type Events_cancel as cancel, type Events_collisionend as collisionend, type Events_collisionstart as collisionstart, type Events_connect as connect, type Events_deactivate as deactivate, type Events_disconnect as disconnect, type Events_down as down, type Events_enter as enter, type Events_entertrigger as entertrigger, type Events_enterviewport as enterviewport, type Events_exittrigger as exittrigger, type Events_exitviewport as exitviewport, type Events_hidden as hidden, type Events_hold as hold, type Events_initialize as initialize, type Events_kill as kill, type Events_leave as leave, type Events_move as move, type Events_pointercancel as pointercancel, type Events_pointerdown as pointerdown, type Events_pointerdragend as pointerdragend, type Events_pointerdragenter as pointerdragenter, type Events_pointerdragleave as pointerdragleave, type Events_pointerdragmove as pointerdragmove, type Events_pointerdragstart as pointerdragstart, type Events_pointerenter as pointerenter, type Events_pointerleave as pointerleave, type Events_pointermove as pointermove, type Events_pointerup as pointerup, type Events_pointerwheel as pointerwheel, type Events_postcollision as postcollision, type Events_postdebugdraw as postdebugdraw, type Events_postdraw as postdraw, type Events_postframe as postframe, type Events_postkill as postkill, type Events_postupdate as postupdate, type Events_precollision as precollision, type Events_predebugdraw as predebugdraw, type Events_predraw as predraw, type Events_preframe as preframe, type Events_prekill as prekill, type Events_press as press, type Events_preupdate as preupdate, type Events_release as release, type Events_remove as remove, type Events_start as start, type Events_stop as stop, type Events_subscribe as subscribe, type Events_unsubscribe as unsubscribe, type Events_up as up, type Events_visible as visible, type Events_wheel as wheel };
}

interface _initialize {
    _initialize(engine: Engine): void;
}
interface _add {
    onAdd(scene: Scene): void;
}
interface _remove {
    onRemove(engine: Engine): void;
}
/**
 * Type guard checking for internal initialize method
 * @internal
 * @param a
 */
declare function has_initialize(a: any): a is _initialize;
/**
 *
 */
declare function has_add(a: any): a is _add;
/**
 *
 */
declare function has_remove(a: any): a is _remove;
interface OnInitialize {
    onInitialize(engine: Engine): void;
}
/**
 *
 */
declare function hasOnInitialize(a: any): a is OnInitialize;
interface _preupdate {
    _preupdate(engine: Engine, elapsed: number): void;
}
/**
 *
 */
declare function has_preupdate(a: any): a is _preupdate;
interface OnPreUpdate {
    onPreUpdate(engine: Engine, elapsed: number): void;
}
/**
 *
 */
declare function hasOnPreUpdate(a: any): a is OnPreUpdate;
interface _postupdate {
    _postupdate(engine: Engine, elapsed: number): void;
}
/**
 *
 */
declare function has_postupdate(a: any): a is _postupdate;
interface OnPostUpdate {
    onPostUpdate(engine: Engine, elapsed: number): void;
}
/**
 *
 */
declare function hasOnPostUpdate(a: any): a is OnPostUpdate;
interface CanInitialize {
    /**
     * Overridable implementation
     */
    onInitialize(engine: Engine): void;
    /**
     * Event signatures
     */
    on(eventName: initialize, handler: (event: InitializeEvent<any>) => void): void;
    once(eventName: initialize, handler: (event: InitializeEvent<any>) => void): void;
    off(eventName: initialize, handler?: (event: InitializeEvent<any>) => void): void;
}
interface OnAdd {
    onAdd(engine: Engine): void;
}
/**
 *
 */
declare function hasOnAdd(a: any): a is OnAdd;
interface CanAdd {
    onAdd(engine: Engine): void;
    on(eventName: add, handler: (event: AddEvent<any>) => void): void;
    once(eventName: add, handler: (event: AddEvent<any>) => void): void;
    off(eventName: add, handler?: (event: AddEvent<any>) => void): void;
}
interface OnRemove {
    onRemove(engine: Engine): void;
}
/**
 *
 */
declare function hasOnRemove(a: any): a is OnRemove;
interface CanRemove {
    onRemove(engine: Engine): void;
    on(eventName: remove, handler: (event: RemoveEvent<any>) => void): void;
    once(eventName: remove, handler: (event: RemoveEvent<any>) => void): void;
    off(eventName: remove, handler?: (event: RemoveEvent<any>) => void): void;
}
interface SceneActivationContext<TData = undefined, TPreviousSceneData = undefined> {
    data?: TData;
    previousScene: Scene;
    previousSceneData?: TPreviousSceneData;
    nextScene: Scene;
    engine: Engine;
}
interface CanActivate<TData = undefined> {
    /**
     * Overridable implementation
     */
    onActivate(context: SceneActivationContext<TData>): void;
    /**
     * Event signatures
     */
    on(eventName: activate, handler: (event: ActivateEvent) => void): void;
    once(eventName: activate, handler: (event: ActivateEvent) => void): void;
    off(eventName: activate, handler?: (event: ActivateEvent) => void): void;
}
interface CanDeactivate {
    /**
     * Overridable implementation
     */
    onDeactivate(context: SceneActivationContext<never>): void;
    /**
     * Event signature
     */
    on(eventName: deactivate, handler: (event: DeactivateEvent) => void): void;
    once(eventName: deactivate, handler: (event: DeactivateEvent) => void): void;
    off(eventName: deactivate, handler?: (event: DeactivateEvent) => void): void;
}
interface CanUpdate {
    /**
     * Overridable implementation
     */
    onPreUpdate(engine: Engine, elapsed: number): void;
    /**
     * Event signature
     */
    on(eventName: preupdate, handler: (event: PreUpdateEvent<any>) => void): void;
    once(eventName: preupdate, handler: (event: PreUpdateEvent<any>) => void): void;
    off(eventName: preupdate, handler?: (event: PreUpdateEvent<any>) => void): void;
    /**
     * Overridable implementation
     */
    onPostUpdate(engine: Engine, elapsed: number): void;
    /**
     * Event signatures
     */
    on(eventName: postupdate, handler: (event: PostUpdateEvent<any>) => void): void;
    once(eventName: postupdate, handler: (event: PostUpdateEvent<any>) => void): void;
    off(eventName: postupdate, handler?: (event: PostUpdateEvent<any>) => void): void;
}
interface OnPreDraw {
    /**
     * Overridable implementation
     */
    onPreDraw(ctx: ExcaliburGraphicsContext, elapsed: number): void;
    /**
     * Event signatures
     */
    on(eventName: predraw, handler: (event: PreDrawEvent) => void): void;
    once(eventName: predraw, handler: (event: PreDrawEvent) => void): void;
    off(eventName: predraw, handler?: (event: PreDrawEvent) => void): void;
}
interface OnPostDraw {
    /**
     * Overridable implementation
     */
    onPostDraw(ctx: ExcaliburGraphicsContext, elapsed: number): void;
    /**
     * Event signatures
     */
    on(eventName: postdraw, handler: (event: PostDrawEvent) => void): void;
    once(eventName: postdraw, handler: (event: PostDrawEvent) => void): void;
    off(eventName: postdraw, handler?: (event: PostDrawEvent) => void): void;
}
interface CanDraw extends OnPreDraw, OnPostDraw {
    on(eventName: predraw, handler: (event: PreDrawEvent) => void): void;
    on(eventName: postdraw, handler: (event: PostDrawEvent) => void): void;
    once(eventName: predraw, handler: (event: PreDrawEvent) => void): void;
    once(eventName: postdraw, handler: (event: PostDrawEvent) => void): void;
    off(eventName: predraw, handler?: (event: PreDrawEvent) => void): void;
    off(eventName: postdraw, handler?: (event: PostDrawEvent) => void): void;
}
/**
 *
 */
declare function hasPreDraw(a: any): a is OnPreDraw;
/**
 *
 */
declare function hasPostDraw(a: any): a is OnPostDraw;
interface CanBeKilled {
    /**
     * Overridable implementation
     */
    onPreKill(_scene: Scene): void;
    /**
     * Event signatures
     */
    on(eventName: prekill, handler: (event: PreKillEvent) => void): void;
    once(eventName: prekill, handler: (event: PreKillEvent) => void): void;
    off(eventName: prekill, handler: (event: PreKillEvent) => void): void;
    /**
     * Overridable implementation
     */
    onPostKill(_scene: Scene): void;
    /**
     * Event signatures
     */
    on(eventName: postkill, handler: (event: PostKillEvent) => void): void;
    once(eventName: postkill, handler: (event: PostKillEvent) => void): void;
    off(eventName: postkill, handler: (event: PostKillEvent) => void): void;
}

interface Context<TValue> {
    /**
     * Run the callback before popping the context value
     * @param value
     * @param cb
     */
    scope: <TReturn>(value: TValue, cb: () => TReturn) => TReturn;
    value: TValue;
}

type EngineEvents = DirectorEvents & {
    fallbackgraphicscontext: ExcaliburGraphicsContext2DCanvas;
    initialize: InitializeEvent<Engine>;
    visible: VisibleEvent;
    hidden: HiddenEvent;
    start: GameStartEvent;
    stop: GameStopEvent;
    preupdate: PreUpdateEvent<Engine>;
    postupdate: PostUpdateEvent<Engine>;
    preframe: PreFrameEvent;
    postframe: PostFrameEvent;
    predraw: PreDrawEvent;
    postdraw: PostDrawEvent;
};
declare const EngineEvents: {
    readonly NavigationStart: "navigationstart";
    readonly Navigation: "navigation";
    readonly NavigationEnd: "navigationend";
    readonly FallbackGraphicsContext: "fallbackgraphicscontext";
    readonly Initialize: "initialize";
    readonly Visible: "visible";
    readonly Hidden: "hidden";
    readonly Start: "start";
    readonly Stop: "stop";
    readonly PreUpdate: "preupdate";
    readonly PostUpdate: "postupdate";
    readonly PreFrame: "preframe";
    readonly PostFrame: "postframe";
    readonly PreDraw: "predraw";
    readonly PostDraw: "postdraw";
};
/**
 * Enum representing the different mousewheel event bubble prevention
 */
declare enum ScrollPreventionMode {
    /**
     * Do not prevent any page scrolling
     */
    None = 0,
    /**
     * Prevent page scroll if mouse is over the game canvas
     */
    Canvas = 1,
    /**
     * Prevent all page scrolling via mouse wheel
     */
    All = 2
}
/**
 * Defines the available options to configure the Excalibur engine at constructor time.
 */
interface EngineOptions<TKnownScenes extends string = any> {
    /**
     * Optionally configure the width of the viewport in css pixels
     */
    width?: number;
    /**
     * Optionally configure the height of the viewport in css pixels
     */
    height?: number;
    /**
     * Optionally configure the width & height of the viewport in css pixels.
     * Use `viewport` instead of {@apilink EngineOptions.width} and {@apilink EngineOptions.height}, or vice versa.
     */
    viewport?: ViewportDimension;
    /**
     * Optionally specify the size the logical pixel resolution, if not specified it will be width x height.
     * See {@apilink Resolution} for common presets.
     */
    resolution?: Resolution;
    /**
     * Optionally specify antialiasing (smoothing), by default true (smooth pixels)
     *
     *  * `true` - useful for high resolution art work you would like smoothed, this also hints excalibur to load images
     * with default blending {@apilink ImageFiltering.Blended}
     *
     *  * `false` - useful for pixel art style art work you would like sharp, this also hints excalibur to load images
     * with default blending {@apilink ImageFiltering.Pixel}
     *
     * * {@apilink AntialiasOptions} Optionally deeply configure the different antialiasing settings, **WARNING** thar be dragons here.
     * It is recommended you stick to `true` or `false` unless you understand what you're doing and need to control rendering to
     * a high degree.
     */
    antialiasing?: boolean | AntialiasOptions;
    /**
     * Optionally specify excalibur garbage collection, by default true.
     *
     * * `true` - garbage collection defaults are enabled (default)
     *
     * * `false` - garbage collection is completely disabled (not recommended)
     *
     * * {@apilink GarbageCollectionOptions} Optionally deeply configure garbage collection settings, **WARNING** thar be dragons here.
     * It is recommended you stick to `true` or `false` unless you understand what you're doing, it is possible to get into a downward
     * spiral if collection timings are set too low where you are stuck in repeated collection.
     */
    garbageCollection?: boolean | GarbageCollectionOptions;
    /**
     * Quick convenience property to configure Excalibur to use special settings for "pretty" anti-aliased pixel art
     *
     * 1. Turns on special shader condition to blend for pixel art and enables various antialiasing settings,
     *  notice blending is ON for this special mode.
     *
     * Equivalent to:
     * ```javascript
     * antialiasing: {
     *  pixelArtSampler: true,
     *  canvasImageRendering: 'auto',
     *  filtering: ImageFiltering.Blended,
     *  webglAntialiasing: true
     * }
     * ```
     */
    pixelArt?: boolean;
    /**
     * Specify any UV padding you want use in pixels, this brings sampling into the texture if you're using
     * a sprite sheet in one image to prevent sampling bleed.
     *
     * Defaults:
     * * `antialiasing: false` or `filtering: ImageFiltering.Pixel` - 0.0;
     * * `pixelArt: true` - 0.25
     * * All else 0.01
     */
    uvPadding?: number;
    /**
     * Optionally hint the graphics context into a specific power profile
     *
     * Default "high-performance"
     */
    powerPreference?: 'default' | 'high-performance' | 'low-power';
    /**
     * Optionally upscale the number of pixels in the canvas. Normally only useful if you need a smoother look to your assets, especially
     * {@apilink Text} or Pixel Art assets.
     *
     * **WARNING** It is recommended you try using `antialiasing: true` before adjusting pixel ratio. Pixel ratio will consume more memory
     * and on mobile may break if the internal size of the canvas exceeds 4k pixels in width or height.
     *
     * Default is based the display's pixel ratio, for example a HiDPI screen might have the value 2;
     */
    pixelRatio?: number;
    /**
     * Optionally configure the native canvas transparent backdrop
     */
    enableCanvasTransparency?: boolean;
    /**
     * Optionally specify the target canvas DOM element to render the game in
     */
    canvasElementId?: string;
    /**
     * Optionally specify the target canvas DOM element directly
     */
    canvasElement?: HTMLCanvasElement;
    /**
     * Optionally enable the right click context menu on the canvas
     *
     * Default if unset is false
     */
    enableCanvasContextMenu?: boolean;
    /**
     * Optionally snap graphics to nearest pixel, default is false
     */
    snapToPixel?: boolean;
    /**
     * The {@apilink DisplayMode} of the game, by default {@apilink DisplayMode.FitScreen} with aspect ratio 4:3 (800x600).
     * Depending on this value, {@apilink width} and {@apilink height} may be ignored.
     */
    displayMode?: DisplayMode;
    /**
     * Optionally configure the global, or a factory to produce it to listen to for browser events for Excalibur to listen to
     */
    global?: GlobalEventHandlers | (() => GlobalEventHandlers);
    /**
     * Configures the pointer scope. Pointers scoped to the 'Canvas' can only fire events within the canvas viewport; whereas, 'Document'
     * (default) scoped will fire anywhere on the page.
     */
    pointerScope?: PointerScope;
    /**
     * Suppress boot up console message, which contains the "powered by Excalibur message"
     */
    suppressConsoleBootMessage?: boolean;
    /**
     * Suppress minimum browser feature detection, it is not recommended users of excalibur switch this off. This feature ensures that
     * the currently running browser meets the minimum requirements for running excalibur. This can be useful if running on non-standard
     * browsers or if there is a bug in excalibur preventing execution.
     */
    suppressMinimumBrowserFeatureDetection?: boolean;
    /**
     * Suppress HiDPI auto detection and scaling, it is not recommended users of excalibur switch off this feature. This feature detects
     * and scales the drawing canvas appropriately to accommodate HiDPI screens.
     */
    suppressHiDPIScaling?: boolean;
    /**
     * Suppress play button, it is not recommended users of excalibur switch this feature. Some browsers require a user gesture (like a click)
     * for certain browser features to work like web audio.
     */
    suppressPlayButton?: boolean;
    /**
     * Sets the focus of the window, this is needed when hosting excalibur in a cross-origin/same-origin iframe in order for certain events
     * (like keyboard) to work. You can use
     * For example: itch.io or codesandbox.io
     *
     * By default set to true,
     */
    grabWindowFocus?: boolean;
    /**
     * Scroll prevention method.
     */
    scrollPreventionMode?: ScrollPreventionMode;
    /**
     * Optionally set the background color
     */
    backgroundColor?: Color;
    /**
     * Optionally set the maximum fps if not set Excalibur will go as fast as the device allows.
     *
     * You may want to constrain max fps if your game cannot maintain fps consistently, it can look and feel better to have a 30fps game than
     * one that bounces between 30fps and 60fps
     */
    maxFps?: number;
    /**
     * Optionally configure a fixed update timestep in milliseconds, this can be desirable if you need the physics simulation to be very stable. When
     * set the update step and physics will use the same elapsed time for each tick even if the graphical framerate drops. In order for the
     * simulation to be correct, excalibur will run multiple updates in a row (at the configured update elapsed) to catch up, for example
     * there could be X updates and 1 draw each clock step.
     *
     * **NOTE:** This does come at a potential perf cost because each catch-up update will need to be run if the fixed rate is greater than
     * the current instantaneous framerate, or perf gain if the fixed rate is less than the current framerate.
     *
     * By default is unset and updates will use the current instantaneous framerate with 1 update and 1 draw each clock step.
     *
     * **WARN:** `fixedUpdateTimestep` takes precedence over `fixedUpdateFps` use whichever is most convenient.
     */
    fixedUpdateTimestep?: number;
    /**
     * Optionally configure a fixed update fps, this can be desirable if you need the physics simulation to be very stable. When set
     * the update step and physics will use the same elapsed time for each tick even if the graphical framerate drops. In order for the
     * simulation to be correct, excalibur will run multiple updates in a row (at the configured update elapsed) to catch up, for example
     * there could be X updates and 1 draw each clock step.
     *
     * **NOTE:** This does come at a potential perf cost because each catch-up update will need to be run if the fixed rate is greater than
     * the current instantaneous framerate, or perf gain if the fixed rate is less than the current framerate.
     *
     * By default is unset and updates will use the current instantaneous framerate with 1 update and 1 draw each clock step.
     *
     * **WARN:** `fixedUpdateTimestep` takes precedence over `fixedUpdateFps` use whichever is most convenient.
     */
    fixedUpdateFps?: number;
    /**
     * Default `true`, optionally configure excalibur to use optimal draw call sorting, to opt out set this to `false`.
     *
     * Excalibur will automatically sort draw calls by z and priority into renderer batches for maximal draw performance,
     * this can disrupt a specific desired painter order.
     *
     */
    useDrawSorting?: boolean;
    /**
     * Optionally provide a custom handler for the webgl context lost event
     */
    handleContextLost?: (e: Event) => void;
    /**
     * Optionally provide a custom handler for the webgl context restored event
     */
    handleContextRestored?: (e: Event) => void;
    /**
     * Optionally configure how excalibur handles poor performance on a player's browser
     */
    configurePerformanceCanvas2DFallback?: {
        /**
         * By default `false`, this will switch the internal graphics context to Canvas2D which can improve performance on non hardware
         * accelerated browsers.
         */
        allow: boolean;
        /**
         * By default `false`, if set to `true` a dialogue will be presented to the player about their browser and how to potentially
         * address any issues.
         */
        showPlayerMessage?: boolean;
        /**
         * Default `{ numberOfFrames: 100, fps: 20 }`, optionally configure excalibur to fallback to the 2D Canvas renderer
         * if bad performance is detected.
         *
         * In this example of the default if excalibur is running at 20fps or less for 100 frames it will trigger the fallback to the 2D
         * Canvas renderer.
         */
        threshold?: {
            numberOfFrames: number;
            fps: number;
        };
    };
    /**
     * Optionally configure the physics simulation in excalibur
     *
     * If false, Excalibur will not produce a physics simulation.
     *
     * Default is configured to use {@apilink SolverStrategy.Arcade} physics simulation
     */
    physics?: boolean | PhysicsConfig;
    /**
     * Optionally specify scenes with their transitions and loaders to excalibur's scene {@apilink Director}
     *
     * Scene transitions can can overridden dynamically by the `Scene` or by the call to `.goToScene`
     */
    scenes?: SceneMap<TKnownScenes>;
}
/**
 * The Excalibur Engine
 *
 * The {@apilink Engine} is the main driver for a game. It is responsible for
 * starting/stopping the game, maintaining state, transmitting events,
 * loading resources, and managing the scene.
 */
declare class Engine<TKnownScenes extends string = any> implements CanInitialize, CanUpdate, CanDraw {
    static Context: Context<Engine | null>;
    static useEngine(): Engine;
    static InstanceCount: number;
    /**
     * Anything run under scope can use `useEngine()` to inject the current engine
     * @param cb
     */
    scope: <TReturn>(cb: () => TReturn) => TReturn;
    global: GlobalEventHandlers;
    private _garbageCollector;
    readonly garbageCollectorConfig: GarbageCollectionOptions | null;
    /**
     * Current Excalibur version string
     *
     * Useful for plugins or other tools that need to know what features are available
     */
    readonly version: string;
    /**
     * Listen to and emit events on the Engine
     */
    events: EventEmitter<EngineEvents>;
    /**
     * Excalibur browser events abstraction used for wiring to native browser events safely
     */
    browser: BrowserEvents;
    /**
     * Screen abstraction
     */
    screen: Screen;
    /**
     * Scene director, manages all scenes, scene transitions, and loaders in excalibur
     */
    director: Director<TKnownScenes>;
    /**
     * Direct access to the engine's canvas element
     */
    canvas: HTMLCanvasElement;
    /**
     * Direct access to the ExcaliburGraphicsContext used for drawing things to the screen
     */
    graphicsContext: ExcaliburGraphicsContext;
    /**
     * Direct access to the canvas element ID, if an ID exists
     */
    canvasElementId: string;
    /**
     * Direct access to the physics configuration for excalibur
     */
    physics: DeepRequired<PhysicsConfig>;
    /**
     * Optionally set the maximum fps if not set Excalibur will go as fast as the device allows.
     *
     * You may want to constrain max fps if your game cannot maintain fps consistently, it can look and feel better to have a 30fps game than
     * one that bounces between 30fps and 60fps
     */
    maxFps: number;
    /**
     * Optionally configure a fixed update fps, this can be desirable if you need the physics simulation to be very stable. When set
     * the update step and physics will use the same elapsed time for each tick even if the graphical framerate drops. In order for the
     * simulation to be correct, excalibur will run multiple updates in a row (at the configured update elapsed) to catch up, for example
     * there could be X updates and 1 draw each clock step.
     *
     * **NOTE:** This does come at a potential perf cost because each catch-up update will need to be run if the fixed rate is greater than
     * the current instantaneous framerate, or perf gain if the fixed rate is less than the current framerate.
     *
     * By default is unset and updates will use the current instantaneous framerate with 1 update and 1 draw each clock step.
     *
     * **WARN:** `fixedUpdateTimestep` takes precedence over `fixedUpdateFps` use whichever is most convenient.
     */
    readonly fixedUpdateFps?: number;
    /**
     * Optionally configure a fixed update timestep in milliseconds, this can be desirable if you need the physics simulation to be very stable. When
     * set the update step and physics will use the same elapsed time for each tick even if the graphical framerate drops. In order for the
     * simulation to be correct, excalibur will run multiple updates in a row (at the configured update elapsed) to catch up, for example
     * there could be X updates and 1 draw each clock step.
     *
     * **NOTE:** This does come at a potential perf cost because each catch-up update will need to be run if the fixed rate is greater than
     * the current instantaneous framerate, or perf gain if the fixed rate is less than the current framerate.
     *
     * By default is unset and updates will use the current instantaneous framerate with 1 update and 1 draw each clock step.
     *
     * **WARN:** `fixedUpdateTimestep` takes precedence over `fixedUpdateFps` use whichever is most convenient.
     */
    readonly fixedUpdateTimestep?: number;
    /**
     * Direct access to the excalibur clock
     */
    clock: Clock;
    readonly pointerScope: PointerScope;
    readonly grabWindowFocus: boolean;
    /**
     * The width of the game canvas in pixels (physical width component of the
     * resolution of the canvas element)
     */
    get canvasWidth(): number;
    /**
     * Returns half width of the game canvas in pixels (half physical width component)
     */
    get halfCanvasWidth(): number;
    /**
     * The height of the game canvas in pixels, (physical height component of
     * the resolution of the canvas element)
     */
    get canvasHeight(): number;
    /**
     * Returns half height of the game canvas in pixels (half physical height component)
     */
    get halfCanvasHeight(): number;
    /**
     * Returns the width of the engine's visible drawing surface in pixels including zoom and device pixel ratio.
     */
    get drawWidth(): number;
    /**
     * Returns half the width of the engine's visible drawing surface in pixels including zoom and device pixel ratio.
     */
    get halfDrawWidth(): number;
    /**
     * Returns the height of the engine's visible drawing surface in pixels including zoom and device pixel ratio.
     */
    get drawHeight(): number;
    /**
     * Returns half the height of the engine's visible drawing surface in pixels including zoom and device pixel ratio.
     */
    get halfDrawHeight(): number;
    /**
     * Returns whether excalibur detects the current screen to be HiDPI
     */
    get isHiDpi(): boolean;
    /**
     * Access engine input like pointer, keyboard, or gamepad
     */
    input: InputHost;
    /**
     * Map multiple input sources to specific game actions actions
     */
    inputMapper: InputMapper;
    private _inputEnabled;
    /**
     * Access Excalibur debugging functionality.
     *
     * Useful when you want to debug different aspects of built in engine features like
     *   * Transform
     *   * Graphics
     *   * Colliders
     */
    debug: DebugConfig;
    /**
     * Access {@apilink stats} that holds frame statistics.
     */
    get stats(): DebugStats;
    /**
     * The current {@apilink Scene} being drawn and updated on screen
     */
    get currentScene(): Scene;
    /**
     * The current {@apilink Scene} being drawn and updated on screen
     */
    get currentSceneName(): string;
    /**
     * The default {@apilink Scene} of the game, use {@apilink Engine.goToScene} to transition to different scenes.
     */
    get rootScene(): Scene;
    /**
     * Contains all the scenes currently registered with Excalibur
     */
    get scenes(): {
        [key: string]: Scene | SceneConstructor | SceneWithOptions;
    };
    /**
     * Indicates whether the engine is set to fullscreen or not
     */
    get isFullscreen(): boolean;
    /**
     * Indicates the current {@apilink DisplayMode} of the engine.
     */
    get displayMode(): DisplayMode;
    private _suppressPlayButton;
    /**
     * Returns the calculated pixel ration for use in rendering
     */
    get pixelRatio(): number;
    /**
     * Indicates whether audio should be paused when the game is no longer visible.
     */
    pauseAudioWhenHidden: boolean;
    /**
     * Indicates whether the engine should draw with debug information
     */
    private _isDebug;
    get isDebug(): boolean;
    /**
     * Sets the background color for the engine.
     */
    backgroundColor: Color;
    /**
     * Sets the Transparency for the engine.
     */
    enableCanvasTransparency: boolean;
    /**
     * Hints the graphics context to truncate fractional world space coordinates
     */
    get snapToPixel(): boolean;
    set snapToPixel(shouldSnapToPixel: boolean);
    /**
     * The action to take when a fatal exception is thrown
     */
    onFatalException: (e: any) => void;
    /**
     * The mouse wheel scroll prevention mode
     */
    pageScrollPreventionMode: ScrollPreventionMode;
    private _logger;
    private _toaster;
    private _compatible;
    private _timescale;
    private _loader;
    private _isInitialized;
    private _hasCreatedCanvas;
    emit<TEventName extends EventKey<EngineEvents>>(eventName: TEventName, event: EngineEvents[TEventName]): void;
    emit(eventName: string, event?: any): void;
    on<TEventName extends EventKey<EngineEvents>>(eventName: TEventName, handler: Handler<EngineEvents[TEventName]>): Subscription;
    on(eventName: string, handler: Handler<unknown>): Subscription;
    once<TEventName extends EventKey<EngineEvents>>(eventName: TEventName, handler: Handler<EngineEvents[TEventName]>): Subscription;
    once(eventName: string, handler: Handler<unknown>): Subscription;
    off<TEventName extends EventKey<EngineEvents>>(eventName: TEventName, handler: Handler<EngineEvents[TEventName]>): void;
    off(eventName: string, handler: Handler<unknown>): void;
    off(eventName: string): void;
    /**
     * Default {@apilink EngineOptions}
     */
    private static _DEFAULT_ENGINE_OPTIONS;
    private _originalOptions;
    readonly _originalDisplayMode: DisplayMode;
    /**
     * Creates a new game using the given {@apilink EngineOptions}. By default, if no options are provided,
     * the game will be rendered full screen (taking up all available browser window space).
     * You can customize the game rendering through {@apilink EngineOptions}.
     *
     * Example:
     *
     * ```js
     * var game = new ex.Engine({
     *   width: 0, // the width of the canvas
     *   height: 0, // the height of the canvas
     *   enableCanvasTransparency: true, // the transparencySection of the canvas
     *   canvasElementId: '', // the DOM canvas element ID, if you are providing your own
     *   displayMode: ex.DisplayMode.FullScreen, // the display mode
     *   pointerScope: ex.PointerScope.Document, // the scope of capturing pointer (mouse/touch) events
     *   backgroundColor: ex.Color.fromHex('#2185d0') // background color of the engine
     * });
     *
     * // call game.start, which is a Promise
     * game.start().then(function () {
     *   // ready, set, go!
     * });
     * ```
     */
    constructor(options?: EngineOptions<TKnownScenes>);
    private _handleWebGLContextLost;
    private _performanceThresholdTriggered;
    private _fpsSamples;
    private _monitorPerformanceThresholdAndTriggerFallback;
    /**
     * Switches the engine's graphics context to the 2D Canvas.
     * @warning Some features of Excalibur will not work in this mode.
     */
    useCanvas2DFallback(): void;
    private _disposed;
    /**
     * Attempts to completely clean up excalibur resources, including removing the canvas from the dom.
     *
     * To start again you will need to new up an Engine.
     */
    dispose(): void;
    isDisposed(): boolean;
    /**
     * Returns a BoundingBox of the top left corner of the screen
     * and the bottom right corner of the screen.
     */
    getWorldBounds(): BoundingBox;
    /**
     * Gets the current engine timescale factor (default is 1.0 which is 1:1 time)
     */
    get timescale(): number;
    /**
     * Sets the current engine timescale factor. Useful for creating slow-motion effects or fast-forward effects
     * when using time-based movement.
     */
    set timescale(value: number);
    /**
     * Adds a {@apilink Timer} to the {@apilink currentScene}.
     * @param timer  The timer to add to the {@apilink currentScene}.
     */
    addTimer(timer: Timer): Timer;
    /**
     * Removes a {@apilink Timer} from the {@apilink currentScene}.
     * @param timer  The timer to remove to the {@apilink currentScene}.
     */
    removeTimer(timer: Timer): Timer;
    /**
     * Adds a {@apilink Scene} to the engine, think of scenes in Excalibur as you
     * would levels or menus.
     * @param key  The name of the scene, must be unique
     * @param scene The scene to add to the engine
     */
    addScene<TScene extends string>(key: TScene, scene: Scene | SceneConstructor | SceneWithOptions): Engine<TKnownScenes | TScene>;
    /**
     * Removes a {@apilink Scene} instance from the engine
     * @param scene  The scene to remove
     */
    removeScene(scene: Scene | SceneConstructor): void;
    /**
     * Removes a scene from the engine by key
     * @param key  The scene key to remove
     */
    removeScene(key: string): void;
    /**
     * Adds a {@apilink Scene} to the engine, think of scenes in Excalibur as you
     * would levels or menus.
     * @param sceneKey  The key of the scene, must be unique
     * @param scene     The scene to add to the engine
     */
    add(sceneKey: string, scene: Scene | SceneConstructor | SceneWithOptions): void;
    /**
     * Adds a {@apilink Timer} to the {@apilink currentScene}.
     * @param timer  The timer to add to the {@apilink currentScene}.
     */
    add(timer: Timer): void;
    /**
     * Adds a {@apilink TileMap} to the {@apilink currentScene}, once this is done the TileMap
     * will be drawn and updated.
     */
    add(tileMap: TileMap): void;
    /**
     * Adds an actor to the {@apilink currentScene} of the game. This is synonymous
     * to calling `engine.currentScene.add(actor)`.
     *
     * Actors can only be drawn if they are a member of a scene, and only
     * the {@apilink currentScene} may be drawn or updated.
     * @param actor  The actor to add to the {@apilink currentScene}
     */
    add(actor: Actor): void;
    add(entity: Entity): void;
    /**
     * Adds a {@apilink ScreenElement} to the {@apilink currentScene} of the game,
     * ScreenElements do not participate in collisions, instead the
     * remain in the same place on the screen.
     * @param screenElement  The ScreenElement to add to the {@apilink currentScene}
     */
    add(screenElement: ScreenElement): void;
    /**
     * Removes a scene instance from the engine
     * @param scene  The scene to remove
     */
    remove(scene: Scene | SceneConstructor): void;
    /**
     * Removes a scene from the engine by key
     * @param sceneKey  The scene to remove
     */
    remove(sceneKey: string): void;
    /**
     * Removes a {@apilink Timer} from the {@apilink currentScene}.
     * @param timer  The timer to remove to the {@apilink currentScene}.
     */
    remove(timer: Timer): void;
    /**
     * Removes a {@apilink TileMap} from the {@apilink currentScene}, it will no longer be drawn or updated.
     */
    remove(tileMap: TileMap): void;
    /**
     * Removes an actor from the {@apilink currentScene} of the game. This is synonymous
     * to calling `engine.currentScene.removeChild(actor)`.
     * Actors that are removed from a scene will no longer be drawn or updated.
     * @param actor  The actor to remove from the {@apilink currentScene}.
     */
    remove(actor: Actor): void;
    /**
     * Removes a {@apilink ScreenElement} to the scene, it will no longer be drawn or updated
     * @param screenElement  The ScreenElement to remove from the {@apilink currentScene}
     */
    remove(screenElement: ScreenElement): void;
    /**
     * Changes the current scene with optionally supplied:
     * * Activation data
     * * Transitions
     * * Loaders
     *
     * Example:
     * ```typescript
     * game.goToScene('myScene', {
     *   sceneActivationData: {any: 'thing at all'},
     *   destinationIn: new FadeInOut({duration: 1000, direction: 'in'}),
     *   sourceOut: new FadeInOut({duration: 1000, direction: 'out'}),
     *   loader: MyLoader
     * });
     * ```
     *
     * Scenes are defined in the Engine constructor
     * ```typescript
     * const engine = new ex.Engine({
        scenes: {...}
      });
     * ```
     * Or by adding dynamically
     *
     * ```typescript
     * engine.addScene('myScene', new ex.Scene());
     * ```
     * @param destinationScene
     * @param options
     */
    goToScene<TData = undefined>(destinationScene: WithRoot<TKnownScenes>, options?: GoToOptions<TData>): Promise<void>;
    /**
     * Transforms the current x, y from screen coordinates to world coordinates
     * @param point  Screen coordinate to convert
     */
    screenToWorldCoordinates(point: Vector): Vector;
    /**
     * Transforms a world coordinate, to a screen coordinate
     * @param point  World coordinate to convert
     */
    worldToScreenCoordinates(point: Vector): Vector;
    /**
     * Initializes the internal canvas, rendering context, display mode, and native event listeners
     */
    private _initialize;
    toggleInputEnabled(enabled: boolean): void;
    onInitialize(engine: Engine): void;
    /**
     * Gets whether the actor is Initialized
     */
    get isInitialized(): boolean;
    private _overrideInitialize;
    /**
     * Updates the entire state of the game
     * @param elapsed  Number of milliseconds elapsed since the last update.
     */
    private _update;
    /**
     * @internal
     */
    _preupdate(elapsed: number): void;
    /**
     * Safe to override method
     * @param engine The reference to the current game engine
     * @param elapsed  The time elapsed since the last update in milliseconds
     */
    onPreUpdate(engine: Engine, elapsed: number): void;
    /**
     * @internal
     */
    _postupdate(elapsed: number): void;
    /**
     * Safe to override method
     * @param engine The reference to the current game engine
     * @param elapsed  The time elapsed since the last update in milliseconds
     */
    onPostUpdate(engine: Engine, elapsed: number): void;
    /**
     * Draws the entire game
     * @param elapsed  Number of milliseconds elapsed since the last draw.
     */
    private _draw;
    /**
     * @internal
     */
    _predraw(ctx: ExcaliburGraphicsContext, elapsed: number): void;
    /**
     * Safe to override method to hook into pre draw
     * @param ctx {@link ExcaliburGraphicsContext} for drawing
     * @param elapsed  Number of milliseconds elapsed since the last draw.
     */
    onPreDraw(ctx: ExcaliburGraphicsContext, elapsed: number): void;
    /**
     * @internal
     */
    _postdraw(ctx: ExcaliburGraphicsContext, elapsed: number): void;
    /**
     * Safe to override method to hook into pre draw
     * @param ctx {@link ExcaliburGraphicsContext} for drawing
     * @param elapsed  Number of milliseconds elapsed since the last draw.
     */
    onPostDraw(ctx: ExcaliburGraphicsContext, elapsed: number): void;
    /**
     * Enable or disable Excalibur debugging functionality.
     * @param toggle a value that debug drawing will be changed to
     */
    showDebug(toggle: boolean): void;
    /**
     * Toggle Excalibur debugging functionality.
     */
    toggleDebug(): boolean;
    /**
     * Returns true when loading is totally complete and the player has clicked start
     */
    get loadingComplete(): boolean;
    private _isLoading;
    private _hideLoader;
    private _isReadyFuture;
    get ready(): boolean;
    isReady(): Promise<void>;
    /**
     * Starts the internal game loop for Excalibur after loading
     * any provided assets.
     * @param loader  Optional {@apilink Loader} to use to load resources. The default loader is {@apilink Loader},
     * override to provide your own custom loader.
     *
     * Note: start() only resolves AFTER the user has clicked the play button
     */
    start(loader?: DefaultLoader): Promise<void>;
    /**
     * Starts the internal game loop for Excalibur after configuring any routes, loaders, or transitions
     * @param startOptions Optional {@apilink StartOptions} to configure the routes for scenes in Excalibur
     *
     * Note: start() only resolves AFTER the user has clicked the play button
     */
    start(sceneName: WithRoot<TKnownScenes>, options?: StartOptions): Promise<void>;
    /**
     * Starts the internal game loop after any loader is finished
     * @param loader
     */
    start(loader?: DefaultLoader): Promise<void>;
    /**
     * Returns the current frames elapsed milliseconds
     */
    currentFrameElapsedMs: number;
    /**
     * Returns the current frame lag when in fixed update mode
     */
    currentFrameLagMs: number;
    private _lagMs;
    private _mainloop;
    /**
     * Stops Excalibur's main loop, useful for pausing the game.
     */
    stop(): void;
    /**
     * Returns the Engine's running status, Useful for checking whether engine is running or paused.
     */
    isRunning(): boolean;
    private _screenShotRequests;
    /**
     * Takes a screen shot of the current viewport and returns it as an
     * HTML Image Element.
     * @param preserveHiDPIResolution in the case of HiDPI return the full scaled backing image, by default false
     */
    screenshot(preserveHiDPIResolution?: boolean): Promise<HTMLImageElement>;
    private _checkForScreenShots;
    /**
     * Another option available to you to load resources into the game.
     * Immediately after calling this the game will pause and the loading screen
     * will appear.
     * @param loader  Some {@apilink Loadable} such as a {@apilink Loader} collection, {@apilink Sound}, or {@apilink Texture}.
     */
    load(loader: DefaultLoader, hideLoader?: boolean): Promise<void>;
}

type SoundEvents = {
    volumechange: NativeSoundEvent;
    processed: NativeSoundProcessedEvent;
    pause: NativeSoundEvent;
    stop: NativeSoundEvent;
    playbackend: NativeSoundEvent;
    resume: NativeSoundEvent;
    playbackstart: NativeSoundEvent;
};
declare const SoundEvents: {
    VolumeChange: string;
    Processed: string;
    Pause: string;
    Stop: string;
    PlaybackEnd: string;
    Resume: string;
    PlaybackStart: string;
};
interface SoundOptions {
    /**
     * @param paths A list of audio sources (clip.wav, clip.mp3, clip.ogg) for this audio clip. This is done for browser compatibility.
     */
    paths: string[];
    /**
     * Optionally bust the cache on load
     *
     * Default is false
     */
    bustCache?: boolean;
    /**
     * [0-1] 0% to 100%
     *
     * By default 1 (100%)
     */
    volume?: number;
    /**
     * Loop infinitely
     */
    loop?: boolean;
    /**
     * Multiplyer
     *
     * By default 1
     */
    playbackRate?: number;
    /**
     * Seconds?
     *
     * By default unset, will play the natural length of the clip
     */
    duration?: number;
    /**
     * Advance to a position in the audio clip
     */
    position?: number;
}
/**
 * The {@apilink Sound} object allows games built in Excalibur to load audio
 * components, from soundtracks to sound effects. {@apilink Sound} is an {@apilink Loadable}
 * which means it can be passed to a {@apilink Loader} to pre-load before a game or level.
 */
declare class Sound implements Audio, Loadable<AudioBuffer> {
    events: EventEmitter<SoundEvents>;
    logger: Logger;
    data: AudioBuffer;
    private _resource;
    position: number | undefined;
    /**
     * Indicates whether the clip should loop when complete
     * @param value  Set the looping flag
     */
    set loop(value: boolean);
    get loop(): boolean;
    set volume(value: number);
    get volume(): number;
    private _duration;
    /**
     * Get the duration that this audio should play. If unset the total natural playback duration will be used.
     */
    get duration(): number | undefined;
    /**
     * Set the duration that this audio should play. If unset the total natural playback duration will be used.
     *
     * Note: if you seek to a specific point the duration will start from that point, for example
     *
     * If you have a 10 second clip, seek to 5 seconds, then set the duration to 2, it will play the clip from 5-7 seconds.
     */
    set duration(duration: number | undefined);
    /**
     * Return array of Current AudioInstances playing or being paused
     */
    get instances(): Audio[];
    get path(): string;
    set path(val: string);
    /**
     * Should excalibur add a cache busting querystring? By default false.
     * Must be set before loading
     */
    get bustCache(): boolean;
    set bustCache(val: boolean);
    private _loop;
    private _volume;
    private _isStopped;
    private _tracks;
    private _engine?;
    private _wasPlayingOnHidden;
    private _playbackRate;
    private _audioContext;
    /**
     * @param paths A list of audio sources (clip.wav, clip.mp3, clip.ogg) for this audio clip. This is done for browser compatibility.
     */
    constructor(options: SoundOptions);
    constructor(...paths: string[]);
    isLoaded(): boolean;
    load(): Promise<AudioBuffer>;
    decodeAudio(data: ArrayBuffer): Promise<AudioBuffer>;
    wireEngine(engine: Engine): void;
    /**
     * Returns how many instances of the sound are currently playing
     */
    instanceCount(): number;
    /**
     * Whether or not the sound is playing right now
     */
    isPlaying(): boolean;
    isPaused(): boolean;
    isStopped(): boolean;
    /**
     * Play the sound, returns a promise that resolves when the sound is done playing
     * An optional volume argument can be passed in to play the sound. Max volume is 1.0
     */
    play(volume?: number): Promise<boolean>;
    /**
     * Stop the sound, and do not rewind
     */
    pause(): void;
    /**
     * Stop the sound if it is currently playing and rewind the track. If the sound is not playing, rewinds the track.
     */
    stop(): void;
    get playbackRate(): number;
    set playbackRate(playbackRate: number);
    seek(position: number, trackId?: number): void;
    getTotalPlaybackDuration(): number;
    /**
     * Return the current playback time of the playing track in seconds from the start.
     *
     * Optionally specify the track to query if multiple are playing at once.
     * @param trackId
     */
    getPlaybackPosition(trackId?: number): number;
    /**
     * Get Id of provided AudioInstance in current trackList
     * @param track {@apilink Audio} which Id is to be given
     */
    getTrackId(track: Audio): number;
    private _resumePlayback;
    /**
     * Starts playback, returns a promise that resolves when playback is complete
     */
    private _startPlayback;
    private _getTrackInstance;
    emit<TEventName extends EventKey<SoundEvents>>(eventName: TEventName, event: SoundEvents[TEventName]): void;
    emit(eventName: string, event?: any): void;
    on<TEventName extends EventKey<SoundEvents>>(eventName: TEventName, handler: Handler<SoundEvents[TEventName]>): Subscription;
    on(eventName: string, handler: Handler<unknown>): Subscription;
    once<TEventName extends EventKey<SoundEvents>>(eventName: TEventName, handler: Handler<SoundEvents[TEventName]>): Subscription;
    once(eventName: string, handler: Handler<unknown>): Subscription;
    off<TEventName extends EventKey<SoundEvents>>(eventName: TEventName, handler: Handler<SoundEvents[TEventName]>): void;
    off(eventName: string, handler: Handler<unknown>): void;
    off(eventName: string): void;
}

/**
 * Internal class representing a Web Audio AudioBufferSourceNode instance
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
 */
declare class WebAudioInstance implements Audio {
    private _src;
    private _instance;
    private _audioContext;
    private _volumeNode;
    private _playingFuture;
    private _stateMachine;
    private _createNewBufferSource;
    private _handleEnd;
    private _volume;
    private _loop;
    private _playStarted;
    set loop(value: boolean);
    get loop(): boolean;
    set volume(value: number);
    get volume(): number;
    private _duration;
    /**
     * Returns the set duration to play, otherwise returns the total duration if unset
     */
    get duration(): number;
    /**
     * Set the duration that this audio should play.
     *
     * Note: if you seek to a specific point the duration will start from that point, for example
     *
     * If you have a 10 second clip, seek to 5 seconds, then set the duration to 2, it will play the clip from 5-7 seconds.
     */
    set duration(duration: number);
    constructor(_src: AudioBuffer);
    isPlaying(): boolean;
    isPaused(): boolean;
    isStopped(): boolean;
    play(playStarted?: () => any): Promise<boolean>;
    pause(): void;
    stop(): void;
    seek(position: number): void;
    getTotalPlaybackDuration(): number;
    getPlaybackPosition(): number;
    private _playbackRate;
    set playbackRate(playbackRate: number);
    get playbackRate(): number;
}

declare class MediaEvent extends GameEvent<Sound> {
    target: Sound;
    protected _name: string;
    /**
     * Media event cannot bubble
     */
    set bubbles(_value: boolean);
    /**
     * Media event cannot bubble
     */
    get bubbles(): boolean;
    /**
     * Media event cannot bubble, so they have no path
     */
    protected get _path(): Actor[];
    /**
     * Media event cannot bubble, so they have no path
     */
    protected set _path(_val: Actor[]);
    constructor(target: Sound, _name?: string);
    /**
     * Prevents event from bubbling
     */
    stopPropagation(): void;
    /**
     * Action, that calls when event happens
     */
    action(): void;
    /**
     * Propagate event further through event path
     */
    propagate(): void;
    layPath(_actor: Actor): void;
}
declare class NativeSoundEvent extends MediaEvent {
    track?: WebAudioInstance;
    constructor(target: Sound, track?: WebAudioInstance);
}
declare class NativeSoundProcessedEvent extends MediaEvent {
    private _processedData;
    data: string | AudioBuffer;
    constructor(target: Sound, _processedData: string | AudioBuffer);
}

/**
 * Option for creating a label
 */
interface LabelOptions {
    /**
     * Specify the label text
     */
    text?: string;
    /**
     * Specify a max width for the text in pixels, if specified the text will wrap.
     *
     * **Not supported in SpriteFont**
     */
    maxWidth?: number;
    /**
     * Specify the color of the text (does not apply to SpriteFonts)
     */
    color?: Color;
    x?: number;
    y?: number;
    pos?: Vector;
    /**
     * Optionally specify a sprite font, will take precedence over any other {@apilink Font}
     */
    spriteFont?: SpriteFont;
    /**
     * Specify a custom font
     */
    font?: Font;
}
/**
 * Labels are the way to draw small amounts of text to the screen. They are
 * actors and inherit all of the benefits and capabilities.
 */
declare class Label extends Actor {
    private _font;
    private _text;
    set maxWidth(width: number | undefined);
    get maxWidth(): number | undefined;
    get font(): Font;
    set font(newFont: Font);
    /**
     * The text to draw.
     */
    get text(): string;
    set text(text: string);
    get color(): Color;
    set color(color: Color);
    get opacity(): number;
    set opacity(opacity: number);
    private _spriteFont;
    /**
     * The {@apilink SpriteFont} to use, if any. Overrides {@apilink Font | `font`} if present.
     */
    get spriteFont(): SpriteFont;
    set spriteFont(sf: SpriteFont);
    /**
     * Build a new label
     * @param options
     */
    constructor(options?: LabelOptions & ActorArgs);
    _initialize(engine: Engine): void;
    /**
     * Returns the width of the text in the label (in pixels);
     */
    getTextWidth(): number;
}

type ResourceEvents = {
    complete: any;
    load: ProgressEvent<XMLHttpRequestEventTarget>;
    loadstart: ProgressEvent<XMLHttpRequestEventTarget>;
    progress: ProgressEvent<XMLHttpRequestEventTarget>;
    error: ProgressEvent<XMLHttpRequestEventTarget>;
};
declare const ResourceEvents: {
    Complete: string;
    Load: string;
    LoadStart: string;
    Progress: string;
    Error: string;
};
/**
 * The {@apilink Resource} type allows games built in Excalibur to load generic resources.
 * For any type of remote resource it is recommended to use {@apilink Resource} for preloading.
 */
declare class Resource<T> implements Loadable<T> {
    path: string;
    responseType: '' | 'arraybuffer' | 'blob' | 'document' | 'json' | 'text';
    bustCache: boolean;
    data: T;
    logger: Logger;
    events: EventEmitter<any>;
    /**
     * @param path          Path to the remote resource
     * @param responseType  The type to expect as a response: "" | "arraybuffer" | "blob" | "document" | "json" | "text";
     * @param bustCache     Whether or not to cache-bust requests
     */
    constructor(path: string, responseType: '' | 'arraybuffer' | 'blob' | 'document' | 'json' | 'text', bustCache?: boolean);
    /**
     * Returns true if the Resource is completely loaded and is ready
     * to be drawn.
     */
    isLoaded(): boolean;
    private _cacheBust;
    /**
     * Begin loading the resource and returns a promise to be resolved on completion
     */
    load(): Promise<T>;
}

type AnyString = {} & string;
interface ChannelSoundsConfiguration {
    sounds: Sound[];
}
interface SoundConfig<Channel extends string = string> {
    sound: Sound;
    /**
     * Maximum volume for the sound manager to use, all soundManager.play(.5) calls will
     */
    volume?: number;
    /**
     *
     * You may also add a list of string `channels` to do group operations to sounds at once. For example mute all 'background' sounds.
     */
    channels?: Channel[];
}
interface SoundManagerOptions<Channel extends string = string, SoundName extends string = string> {
    /**
     * Optionally specify the possible channels to avoid typo's
     */
    channels?: readonly Channel[];
    /**
     * Optionally set the default maximum volume for all sounds
     *
     * Default is 1 (100%)
     */
    volume?: number;
    /**
     * Optionally set the max `volume` for a `sound` to be when played. All other volume operations will be a fraction of the mix.
     *
     * You may also add a list of string `channels` to do group operations to sounds at once. For example mute all 'background' sounds.
     *
     */
    sounds: Record<SoundName, Sound | SoundConfig<NoInfer<Channel>>>;
}
type PossibleChannels<TSoundManagerOptions> = TSoundManagerOptions extends SoundManagerOptions<infer Channels> ? Channels : never;
type PossibleSounds<TSoundMangerOptions> = TSoundMangerOptions extends SoundManagerOptions ? Extract<keyof TSoundMangerOptions['sounds'], string> : never;
interface SoundManagerApi {
    setVolume(name: string, volume?: number): void;
    play(name: string, volume?: number): Promise<void>;
    stop(name?: string): void;
    mute(name?: string): void;
    unmute(name?: string): void;
    toggle(name?: string): void;
}
declare class ChannelCollection<Channel extends string> implements SoundManagerApi {
    soundManager: SoundManager<Channel, string>;
    constructor(options: SoundManagerOptions<Channel, string>, soundManager: SoundManager<Channel, string>);
    stop(name: string): void;
    setVolume(name: Channel, volume?: number): void;
    play(name: Channel, volume?: number): Promise<void>;
    mute(name: Channel): void;
    unmute(name: Channel): void;
    toggle(name: Channel): void;
}
/**
 * Manage Sound volume levels without mutating the original Sound objects
 */
declare class SoundManager<Channel extends string, SoundName extends string> implements SoundManagerApi {
    private _channelToConfig;
    private _nameToConfig;
    private _mix;
    _muted: Set<Sound>;
    private _all;
    private _defaultVolume;
    set defaultVolume(volume: number);
    get defaultVolume(): number;
    channel: ChannelCollection<Channel>;
    constructor(options: SoundManagerOptions<Channel, SoundName>);
    getSounds(): readonly Sound[];
    getSoundsForChannel(channel: Channel | AnyString): readonly Sound[];
    _isMuted(sound: Sound): boolean;
    _getEffectiveVolume(sound: Sound): number;
    play(soundName: SoundName, volume?: number): Promise<void>;
    getSound(soundName: SoundName | AnyString): Sound | undefined;
    setVolume(soundname: SoundName, volume?: number): void;
    /**
     * Gets the volumn for a sound
     */
    getVolume(soundName: SoundName): number;
    /**
     * Set the maximum volume a sound, if not set assumed to be 1.0 (100% of the source volume)
     */
    private _setMix;
    track(name: SoundName | AnyString, soundOrConfig: Sound | SoundConfig): void;
    /**
     * Remove the maximum volume for a sound, will be 100% of the source volume
     *
     * Untracks the Sound in the sound manager
     */
    untrack(soundName: SoundName): void;
    stop(name?: SoundName): void;
    mute(name?: SoundName): void;
    unmute(name?: SoundName): void;
    toggle(name?: SoundName): void;
    /**
     * Apply a list of channels to a sound instance
     */
    addChannel(soundName: SoundName | AnyString, channels: Channel[] | AnyString[]): void;
    removeChannel(soundName: SoundName | AnyString, channels: Channel[] | AnyString[]): void;
}

/**
 * Internal class used to build instances of AudioContext
 */
declare class AudioContextFactory {
    private static _INSTANCE?;
    static create(): AudioContext;
}

/**
 * The {@apilink Texture} object allows games built in Excalibur to load image resources.
 * {@apilink Texture} is an {@apilink Loadable} which means it can be passed to a {@apilink Loader}
 * to pre-load before starting a level or game.
 */
declare class Gif implements Loadable<ImageSource[]> {
    path: string;
    private _resource;
    /**
     * The width of the texture in pixels
     */
    width: number;
    /**
     * The height of the texture in pixels
     */
    height: number;
    private _stream?;
    private _gif?;
    private _images;
    private _animation?;
    data: ImageSource[];
    private _sprites;
    /**
     * @param path       Path to the image resource
     * @param bustCache  Optionally load texture with cache busting
     */
    constructor(path: string, bustCache?: boolean);
    /**
     * Should excalibur add a cache busting querystring? By default false.
     * Must be set before loading
     */
    get bustCache(): boolean;
    set bustCache(val: boolean);
    /**
     * Begins loading the texture and returns a promise to be resolved on completion
     */
    load(): Promise<ImageSource[]>;
    isLoaded(): boolean;
    /**
     * Return a frame of the gif as a sprite by id
     * @param id
     */
    toSprite(id?: number): Sprite | null;
    /**
     * Return the gif as a spritesheet
     */
    toSpriteSheet(): SpriteSheet | null;
    /**
     * Transform the GIF into an animation with duration per frame
     * @param durationPerFrame Optionally override duration per frame
     */
    toAnimation(durationPerFrame?: number): Animation | null;
    get readCheckBytes(): number[];
}
interface GifFrame {
    sentinel: number;
    type: string;
    leftPos: number;
    topPos: number;
    width: number;
    height: number;
    lctFlag: boolean;
    lctBytes: [number, number, number][];
    interlaced: boolean;
    sorted: boolean;
    reserved: boolean[];
    lctSize: number;
    lzwMinCodeSize: number;
    pixels: number[];
    delayTime: number;
    delayMs: number;
}
declare class Stream {
    data: Uint8Array;
    len: number;
    position: number;
    constructor(dataArray: ArrayBuffer);
    readByte: () => number;
    readBytes: (n: number) => any[];
    read: (n: number) => string;
    readUnsigned: () => any;
}
interface GifBlock {
    sentinel: number;
    type: string;
}
interface GCExtBlock extends GifBlock {
    type: 'ext';
    label: number;
    extType: string;
    reserved: boolean[];
    disposalMethod: number;
    userInputFlag: boolean;
    transparentColorFlag: boolean;
    delayTime: number;
    transparentColorIndex: number;
    terminator: number;
}
/**
 * GifParser for binary format
 *
 * Roughly based on the documentation https://giflib.sourceforge.net/whatsinagif/index.html
 */
declare class GifParser {
    private _st;
    private _handler;
    frames: GifFrame[];
    images: HTMLImageElement[];
    private _currentFrameCanvas;
    private _currentFrameContext;
    globalColorTableBytes: [number, number, number][];
    checkBytes: number[];
    private _gce?;
    private _hdr?;
    constructor(stream: Stream);
    parseColorTableBytes: (entries: number) => [number, number, number][];
    readSubBlocks: () => any;
    parseHeader: () => void;
    parseExt: (block: GCExtBlock) => void;
    parseImg: (img: GifFrame) => void;
    parseBlocks: () => void;
    arrayToImage: (frame: GifFrame, colorTable: [number, number, number][]) => void;
}

interface FontSourceOptions extends Omit<FontOptions, 'family'>, GraphicOptions, RasterOptions {
    /**
     * Whether or not to cache-bust requests
     */
    bustCache?: boolean;
}
declare class FontSource implements Loadable<FontFace> {
    /**
     * Path to the font resource relative from the HTML document hosting the game, or absolute
     */
    readonly path: string;
    /**
     * The font family name
     */
    readonly family: string;
    private _resource;
    private _isLoaded;
    private _options;
    data: FontFace;
    constructor(
    /**
     * Path to the font resource relative from the HTML document hosting the game, or absolute
     */
    path: string, 
    /**
     * The font family name
     */
    family: string, { bustCache, ...options }?: FontSourceOptions);
    load(): Promise<FontFace>;
    isLoaded(): boolean;
    /**
     * Build a font from this FontSource.
     * @param options {FontOptions} Override the font options
     */
    toFont(options?: FontOptions & GraphicOptions & RasterOptions): Font;
}

/**
 * Native browser button enumeration
 */
declare enum NativePointerButton {
    NoButton = -1,
    Left = 0,
    Middle = 1,
    Right = 2,
    Unknown = 3
}

/**
 * Turn on move and drag events for an {@apilink Actor}
 */
interface CapturePointerConfig {
    /**
     * Capture PointerMove events (may be expensive!)
     */
    captureMoveEvents: boolean;
    /**
     * Capture PointerDrag events (may be expensive!)
     */
    captureDragEvents: boolean;
}

/**
 * The PointerSystem is responsible for dispatching pointer events to entities
 * that need them.
 *
 * The PointerSystem can be optionally configured by the {@apilink PointerComponent}, by default Entities use
 * the {@apilink Collider}'s shape for pointer events.
 */
declare class PointerSystem extends System {
    world: World;
    static priority: -5;
    readonly systemType = SystemType.Update;
    private _engine;
    private _receivers;
    private _engineReceiver;
    private _graphicsHashGrid;
    private _graphics;
    private _entityToPointer;
    private _pointerEventDispatcher;
    query: Query<typeof TransformComponent | typeof PointerComponent>;
    constructor(world: World);
    /**
     * Optionally override component configuration for all entities
     */
    overrideUseColliderShape: boolean;
    /**
     * Optionally override component configuration for all entities
     */
    overrideUseGraphicsBounds: boolean;
    private _scene;
    initialize(world: World, scene: Scene): void;
    private _sortedTransforms;
    private _sortedEntities;
    private _zHasChanged;
    private _zIndexUpdate;
    preupdate(): void;
    update(): void;
}

/**
 *
 */
declare function getMinIndex(array: number[]): number;
/**
 * Find the screen position of an HTML element
 */
declare function getPosition(el: HTMLElement): Vector;
/**
 * Add an item to an array list if it doesn't already exist. Returns true if added, false if not and already exists in the array.
 * @deprecated Will be removed in v0.26.0
 */
declare function addItemToArray<T>(item: T, array: T[]): boolean;
/**
 * Remove an item from an list
 * @deprecated Will be removed in v0.26.0
 */
declare function removeItemFromArray<T>(item: T, array: T[]): boolean;
/**
 * See if an array contains something
 */
declare function contains(array: Array<any>, obj: any): boolean;
/**
 * Used for exhaustive checks at compile time
 */
declare function fail(message: never): never;
/**
 * Create a promise that resolves after a certain number of milliseconds
 *
 * It is strongly recommended you pass the excalibur clock so delays are bound to the
 * excalibur clock which would be unaffected by stop/pause.
 * @param milliseconds
 * @param clock
 */
declare function delay(milliseconds: number, clock?: Clock): Promise<void>;
/**
 * Remove keys from object literals
 * @param object
 * @param keys
 */
declare function omit<TObject extends Object, Keys extends keyof TObject>(object: TObject, keys: Keys[]): Omit<TObject, Keys>;
/**
 * Simple object check.
 * @param item
 */
declare function isObject(item: any): item is object;
/**
 * Deep merge two objects.
 * @param target
 * @param sources
 */
declare function mergeDeep<T extends object>(target: T, ...sources: T[]): T;

/**
 * A canvas linecap style. "butt" is the default flush style, "round" is a semi-circle cap with a radius half the width of
 * the line, and "square" is a rectangle that is an equal width and half height cap.
 */
type LineCapStyle = 'butt' | 'round' | 'square';
/**
 * Draw a line on canvas context
 * @param ctx The canvas context
 * @param color The color of the line
 * @param x1 The start x coordinate
 * @param y1 The start y coordinate
 * @param x2 The ending x coordinate
 * @param y2 The ending y coordinate
 * @param thickness The line thickness
 * @param cap The {@apilink LineCapStyle} (butt, round, or square)
 */
declare function line(ctx: CanvasRenderingContext2D, color: Color, x1: number, y1: number, x2: number, y2: number, thickness?: number, cap?: LineCapStyle): void;
/**
 * Draw the vector as a point onto the canvas.
 */
declare function point(ctx: CanvasRenderingContext2D, color: Color, point: Vector): void;
/**
 * Draw the vector as a line onto the canvas starting a origin point.
 */
/**
 *
 */
declare function vector(ctx: CanvasRenderingContext2D, color: Color, origin: Vector, vector: Vector, scale?: number): void;
/**
 * Represents border radius values
 */
interface BorderRadius {
    /**
     * Top-left
     */
    tl: number;
    /**
     * Top-right
     */
    tr: number;
    /**
     * Bottom-right
     */
    br: number;
    /**
     * Bottom-left
     */
    bl: number;
}
/**
 * Draw a round rectangle on a canvas context
 * @param ctx The canvas context
 * @param x The top-left x coordinate
 * @param y The top-left y coordinate
 * @param width The width of the rectangle
 * @param height The height of the rectangle
 * @param radius The border radius of the rectangle
 * @param stroke The {@apilink Color} to stroke rectangle with
 * @param fill The {@apilink Color} to fill rectangle with
 */
declare function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius?: number | BorderRadius, stroke?: Color | null, fill?: Color | null): void;
/**
 *
 */
declare function circle(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, stroke?: Color, fill?: Color): void;

type DrawUtil_BorderRadius = BorderRadius;
type DrawUtil_LineCapStyle = LineCapStyle;
declare const DrawUtil_circle: typeof circle;
declare const DrawUtil_line: typeof line;
declare const DrawUtil_point: typeof point;
declare const DrawUtil_roundRect: typeof roundRect;
declare const DrawUtil_vector: typeof vector;
declare namespace DrawUtil {
  export { type DrawUtil_BorderRadius as BorderRadius, type DrawUtil_LineCapStyle as LineCapStyle, DrawUtil_circle as circle, DrawUtil_line as line, DrawUtil_point as point, DrawUtil_roundRect as roundRect, DrawUtil_vector as vector };
}

type Index_Appender = Appender;
type Index_ConsoleAppender = ConsoleAppender;
declare const Index_ConsoleAppender: typeof ConsoleAppender;
declare const Index_DrawUtil: typeof DrawUtil;
type Index_EasingFunction<TValueToEase = number> = EasingFunction<TValueToEase>;
type Index_EasingFunctions = EasingFunctions;
declare const Index_EasingFunctions: typeof EasingFunctions;
type Index_LogLevel = LogLevel;
declare const Index_LogLevel: typeof LogLevel;
type Index_Logger = Logger;
declare const Index_Logger: typeof Logger;
type Index_MaybeObserver<T> = MaybeObserver<T>;
type Index_Message<T> = Message<T>;
type Index_Observable<T> = Observable<T>;
declare const Index_Observable: typeof Observable;
type Index_Observer<T> = Observer<T>;
type Index_ScreenAppender = ScreenAppender;
declare const Index_ScreenAppender: typeof ScreenAppender;
type Index_ScreenAppenderOptions = ScreenAppenderOptions;
declare const Index_addItemToArray: typeof addItemToArray;
declare const Index_contains: typeof contains;
declare const Index_delay: typeof delay;
declare const Index_fail: typeof fail;
declare const Index_getMinIndex: typeof getMinIndex;
declare const Index_getPosition: typeof getPosition;
declare const Index_isObject: typeof isObject;
declare const Index_mergeDeep: typeof mergeDeep;
declare const Index_omit: typeof omit;
declare const Index_removeItemFromArray: typeof removeItemFromArray;
declare namespace Index {
  export { type Index_Appender as Appender, Index_ConsoleAppender as ConsoleAppender, Index_DrawUtil as DrawUtil, type Index_EasingFunction as EasingFunction, Index_EasingFunctions as EasingFunctions, Index_LogLevel as LogLevel, Index_Logger as Logger, type Index_MaybeObserver as MaybeObserver, type Index_Message as Message, Index_Observable as Observable, type Index_Observer as Observer, Index_ScreenAppender as ScreenAppender, type Index_ScreenAppenderOptions as ScreenAppenderOptions, Index_addItemToArray as addItemToArray, Index_contains as contains, Index_delay as delay, Index_fail as fail, Index_getMinIndex as getMinIndex, Index_getPosition as getPosition, Index_isObject as isObject, Index_mergeDeep as mergeDeep, Index_omit as omit, Index_removeItemFromArray as removeItemFromArray };
}

/**
 * Obsolete decorator options
 */
interface ObsoleteOptions {
    message?: string;
    alternateMethod?: string;
    showStackTrace?: boolean;
}
declare const maxMessages = 5;
declare const resetObsoleteCounter: () => void;
/**
 * Obsolete decorator for marking Excalibur methods obsolete, you can optionally specify a custom message and/or alternate replacement
 * method do the deprecated one. Inspired by https://github.com/jayphelps/core-decorators.js
 */
declare function obsolete(options?: ObsoleteOptions): any;

/**
 * Interface for detected browser features matrix
 */
interface DetectedFeatures {
    readonly canvas: boolean;
    readonly arraybuffer: boolean;
    readonly dataurl: boolean;
    readonly objecturl: boolean;
    readonly rgba: boolean;
    readonly webaudio: boolean;
    readonly webgl: boolean;
    readonly gamepadapi: boolean;
}
/**
 * Excalibur internal feature detection helper class
 */
declare class Detector {
    private _features;
    failedTests: string[];
    constructor();
    /**
     * Returns a map of currently supported browser features. This method
     * treats the features as a singleton and will only calculate feature
     * support if it has not previously been done.
     */
    getBrowserFeatures(): DetectedFeatures;
    /**
     * Report on non-critical browser support for debugging purposes.
     * Use native browser console colors for visibility.
     */
    logBrowserFeatures(): void;
    /**
     * Executes several IIFE's to get a constant reference to supported
     * features within the current execution context.
     */
    private _loadBrowserFeatures;
    private _criticalTests;
    private _warningTest;
    test(): boolean;
}

interface LegacyWebAudioSource {
    playbackState: string;
    PLAYING_STATE: 'playing';
    FINISHED_STATE: 'finished';
}
declare class WebAudio {
    private static _UNLOCKED;
    /**
     * Play an empty sound to unlock Safari WebAudio context. Call this function
     * right after a user interaction event.
     * @source https://paulbakaus.com/tutorials/html5/web-audio-on-ios/
     */
    static unlock(): Promise<boolean>;
    static isUnlocked(): boolean;
}

/**
 * The Toaster is only meant to be called from inside Excalibur to display messages to players
 */
declare class Toaster {
    private _styleBlock;
    private _container;
    private _toasterCss;
    private _isInitialized;
    private _initialize;
    dispose(): void;
    private _createFragment;
    /**
     * Display a toast message to a player
     * @param message Text of the message, messages may have a single "[LINK]" to influence placement
     * @param linkTarget Optionally specify a link location
     * @param linkName Optionally specify a name for that link location
     */
    toast(message: string, linkTarget?: string, linkName?: string): void;
}

interface State<TData> {
    name?: string;
    transitions: string[];
    onEnter?: (context: {
        from: string;
        eventData?: any;
        data: TData;
    }) => boolean | void;
    onState?: () => any;
    onExit?: (context: {
        to: string;
        data: TData;
    }) => boolean | void;
    onUpdate?: (data: TData, elapsed: number) => any;
}
interface StateMachineDescription<TData = any> {
    start: string;
    states: {
        [name: string]: State<TData>;
    };
}
type PossibleStates<TMachine> = TMachine extends StateMachineDescription ? Extract<keyof TMachine['states'], string> : never;
interface StateMachineState<TData> {
    data: TData;
    currentState: string;
}
declare class StateMachine<TPossibleStates extends string, TData> {
    startState: State<TData>;
    private _currentState;
    get currentState(): State<TData>;
    set currentState(state: State<TData>);
    states: Map<string, State<TData>>;
    data: TData;
    static create<TMachine extends StateMachineDescription<TData>, TData>(machineDescription: TMachine, data?: TData): StateMachine<PossibleStates<TMachine>, TData>;
    in(state: TPossibleStates): boolean;
    go(stateName: TPossibleStates, eventData?: any): boolean;
    update(elapsed: number): void;
    save(saveKey: string): void;
    restore(saveKey: string): void;
}

/**
 * Semaphore allows you to limit the amount of async calls happening between `enter()` and `exit()`
 *
 * This can be useful when limiting the number of http calls, browser api calls, etc either for performance or to work
 * around browser limitations like max Image.decode() calls in chromium being 256.
 */
declare class Semaphore {
    private _count;
    private _waitQueue;
    constructor(_count: number);
    get count(): number;
    get waiting(): number;
    enter(): Promise<unknown>;
    exit(count?: number): void;
}

/**
 * Asserts will throw in `process.env.NODE_ENV === 'development'` builds if the expression evaluates false
 */
declare function assert(message: string, expression: () => boolean): void;

declare class RentalPool<T> {
    builder: () => T;
    cleaner: (used: T) => T;
    private _pool;
    private _size;
    constructor(builder: () => T, cleaner: (used: T) => T, preAllocate?: number);
    /**
     * Grow the pool size by an amount
     * @param amount
     */
    grow(amount: number): void;
    /**
     * Rent an object from the pool, optionally clean it. If not cleaned previous state may be set.
     *
     * The pool will automatically double if depleted
     * @param clean
     */
    rent(clean?: boolean): T;
    /**
     * Return an object to the pool
     * @param object
     */
    return(object: T): void;
}

/**
 * The current Excalibur version string
 * @description `process.env.__EX_VERSION` gets replaced by Webpack on build
 */
declare const EX_VERSION: string;

export { type Action, ActionCompleteEvent, ActionContext, type ActionContextMethods, ActionQueue, ActionSequence, ActionStartEvent, type Actionable, ActionsComponent, ActionsSystem, ActivateEvent, Actor, type ActorArgs, ActorEvents, AddEvent, AddedComponent, AffineMatrix, Animation, AnimationDirection, AnimationEvents, type AnimationOptions, AnimationStrategy, type AntialiasOptions, type AnyString, type Appender, ArcadeSolver, type Audio, AudioContextFactory, type AudioImplementation, Axes, Axis, BaseAlign, BezierCurve, type BezierCurveOptions, Blink, BodyComponent, type BodyComponentOptions, BoundingBox, type BoundingBoxOptions, BrowserComponent, BrowserEvents, Buttons, Camera, CameraEvents, type CameraStrategy, type CanActivate, type CanAdd, type CanBeKilled, type CanDeactivate, type CanDraw, type CanInitialize, type CanRemove, type CanUpdate, Canvas, type CanvasOptions, type CapturePointerConfig, ChannelCollection, type ChannelSoundsConfiguration, Circle, CircleCollider, type CircleColliderOptions, type CircleOptions, Clock, type ClockOptions, type Clonable, ClosestLineJumpTable, Collider, ColliderComponent, type ColliderProxy, CollisionContact, CollisionEndEvent, CollisionGroup, CollisionGroupManager, CollisionJumpTable, CollisionPostSolveEvent, CollisionPreSolveEvent, type CollisionProcessor, type CollisionSolver, CollisionStartEvent, CollisionSystem, CollisionType, Color, ColorBlindFlags, ColorBlindnessMode, ColorBlindnessPostProcessor, Component, type ComponentCtor, type ComponentInstance, CompositeCollider, ConsoleAppender, type ContactBias, ContactConstraintPoint, ContactEndEvent, ContactSolveBias, ContactStartEvent, CoordPlane, type CoroutineGenerator, type CoroutineInstance, type CoroutineOptions, CrossFade, type CrossFadeOptions, CurveBy, type CurveByOptions, CurveTo, type CurveToOptions, DeactivateEvent, Debug, DebugConfig, type DebugDraw, DebugGraphicsComponent, type DebugStats, DebugSystem, DebugText, DefaultAntialiasOptions, DefaultGarbageCollectionOptions, DefaultLoader, type DefaultLoaderOptions, DefaultPixelArtOptions, DegreeOfFreedom, Delay, type DestinationSize, type DetectedFeatures, Detector, Die, Direction, Director, DirectorEvents, type DirectorNavigationEvent, DisplayMode, type DistributeEntity, DynamicTree, DynamicTreeCollisionProcessor, type DynamicTreeConfig, EX_VERSION, EaseBy, EaseTo, type EasingFunction, EasingFunctions, Edge, EdgeCollider, type EdgeColliderOptions, ElasticToActorStrategy, EmitterType, Engine, EngineEvents, type EngineOptions, EnterTriggerEvent, EnterViewPortEvent, Entity, type EntityComponent, EntityEvents, EntityManager, type EntityOptions, EventEmitter, type EventKey, type EventMap, EventTypes, type Eventable, Events, ExResponse, type ExResponseType, type ExResponseTypesLookup, type ExcaliburGraphicsContext, ExcaliburGraphicsContext2DCanvas, type ExcaliburGraphicsContext2DOptions, type ExcaliburGraphicsContextOptions, type ExcaliburGraphicsContextState, ExcaliburGraphicsContextWebGL, type ExcaliburGraphicsContextWebGLOptions, ExitTriggerEvent, ExitViewPortEvent, Fade, FadeInOut, type FadeOptions, Flags, Flash, Follow, Font, FontCache, type FontOptions, type FontRenderer, FontSource, type FontSourceOptions, FontStyle, FontUnit, FpsSampler, type FpsSamplerOptions, type Frame, type FrameActorStats, type FrameDurationStats, type FrameEvent, type FrameStatistics, FrameStats, type FromSpriteSheetOptions, type FullScreenChangeEvent, Future, type G_UUID, GameEvent, GameStartEvent, GameStopEvent, Gamepad, GamepadAxisEvent, GamepadButtonEvent, type GamepadConfiguration, GamepadConnectEvent, GamepadDisconnectEvent, Gamepads, type GarbageCollectionOptions, GarbageCollector, type GarbageCollectorOptions, type GetSpriteOptions, Gif, type GifFrame, GifParser, GlobalCoordinates, type GoToOptions, type GpuParticleConfig, GpuParticleEmitter, GpuParticleRenderer, Graph, Graphic, type GraphicOptions, GraphicsComponent, type GraphicsComponentOptions, GraphicsGroup, type GraphicsGrouping, type GraphicsGroupingOptions, type GraphicsShowOptions, type GraphicsStatistics, GraphicsSystem, type HTMLImageSource, type Handler, type HasTick, HashColliderProxy, HashGridCell, HashGridProxy, HiddenEvent, HorizontalFirst, type Id, ImageFiltering, ImageSource, ImageSourceAttributeConstants, type ImageSourceOptions, type ImageWrapConfiguration, ImageWrapping, InitializeEvent, InputHost, type InputHostOptions, InputMapper, type InputsOptions, IsometricEntityComponent, type IsometricEntityComponentOptions, IsometricEntitySystem, IsometricMap, type IsometricMapOptions, IsometricTile, type IsometricTilePointerEvents, KeyEvent, Keyboard, type KeyboardInitOptions, Keys, KillEvent, Label, type LabelOptions, type LegacyWebAudioSource, LimitCameraBoundsStrategy, Line, type LineGraphicsOptions, type LineOptions, LineSegment, type Loadable, Loader, type LoaderConstructor, LoaderEvents, type LoaderOptions, LockCameraToActorAxisStrategy, LockCameraToActorStrategy, LogLevel, Logger, Material, type MaterialImageOptions, type MaterialOptions, Matrix, MatrixLocations, type MaybeKnownComponent, type MaybeObserver, MediaEvent, Meet, type Message, type Motion, MotionComponent, MotionSystem, MoveBy, type MoveByOptions, MoveByWithOptions, MoveTo, type MoveToOptions, MoveToWithOptions, type NativeEventable, type NativeMouseEvent, NativePointerButton, type NativePointerEvent, NativeSoundEvent, NativeSoundProcessedEvent, type NativeTouchEvent, type NativeWheelEvent, type NavigatorGamepad, type NavigatorGamepadButton, type NavigatorGamepadEvent, type NavigatorGamepads, NineSlice, type NineSliceConfig, NineSliceStretch, Node, None, Observable, type Observer, type ObsoleteOptions, OffscreenSystem, type OnAdd, type OnInitialize, type OnPostDraw, type OnPostUpdate, type OnPreDraw, type OnPreUpdate, type OnRemove, Pair, ParallaxComponent, ParallelActions, Particle, type ParticleConfig, ParticleEmitter, type ParticleEmitterArgs, ParticleRenderer, ParticleTransform, type PhysicsConfig, type PhysicsStatistics, PhysicsStats, PhysicsWorld, type PixelRatioChangeEvent, type PointGraphicsOptions, PointerAbstraction, PointerButton, PointerComponent, PointerEvent, PointerEventReceiver, type PointerEvents$1 as PointerEvents, type PointerInitOptions, PointerScope, PointerSystem, PointerType, Polygon, PolygonCollider, type PolygonColliderOptions, type PolygonOptions, Pool, PositionNode, type PossibleChannels, type PossibleSounds, type PossibleStates, PostCollisionEvent, PostDebugDrawEvent, PostDrawEvent, PostFrameEvent, PostKillEvent, type PostProcessor, PostTransformDrawEvent, PostUpdateEvent, PreCollisionEvent, PreDebugDrawEvent, PreDrawEvent, PreFrameEvent, PreKillEvent, PreLoadEvent, PreTransformDrawEvent, PreUpdateEvent, Projection, QuadIndexBuffer, QuadTree, type QuadTreeItem, type QuadTreeOptions, Query, type QueryEntity, QueryManager, type QueryParams, RadiusAroundActorStrategy, Random, Raster, type RasterOptions, Ray, type RayCastHit, type RayCastOptions, RealisticSolver, type RectGraphicsOptions, Rectangle, type RectangleOptions, RemoveEvent, RemovedComponent, type RendererPlugin, RentalPool, Repeat, RepeatForever, Resolution, Resource, ResourceEvents, RotateBy, type RotateByOptions, RotateByWithOptions, RotateTo, type RotateToOptions, RotateToWithOptions, RotationType, ScaleBy, type ScaleByOptions, ScaleByWithOptions, ScaleTo, type ScaleToOptions, ScaleToWithOptions, Scene, type SceneActivationContext, type SceneConstructor, SceneEvents, type SceneMap, type SceneWithOptions, type ScheduleId, type ScheduledCallbackTiming, Screen, ScreenAppender, type ScreenAppenderOptions, ScreenElement, ScreenEvents, type ScreenOptions, type ScreenResizeEvent, ScreenShader, ScrollPreventionMode, Semaphore, SeparatingAxis, SeparationInfo, Shader, type ShaderOptions, Shape, Side, Slide, type SlideOptions, SolverStrategy, Sound, type SoundConfig, SoundEvents, SoundManager, type SoundManagerApi, type SoundManagerOptions, type SoundOptions, type SourceView, SparseHashGrid, SparseHashGridCollisionProcessor, type SparseHashGridConfig, SpatialPartitionStrategy, Sprite, SpriteFont, type SpriteFontOptions, type SpriteOptions, SpriteSheet, type SpriteSheetGridOptions, type SpriteSheetOptions, type SpriteSheetSpacingDimensions, type SpriteSheetSparseOptions, StandardClock, type StartOptions, type State, StateMachine, type StateMachineDescription, type StateMachineState, StrategyContainer, Stream, type Subscription, System, type SystemCtor, SystemManager, SystemPriority, SystemType, TagQuery, TestClock, type TestClockOptions, Text, TextAlign, type TextOptions, TextureLoader, Tile, TileMap, TileMapEvents, type TileMapOptions, type TileOptions, type TilePointerEvents, TiledAnimation, type TiledAnimationOptions, TiledSprite, type TiledSpriteOptions, Timer, type TimerOptions, Toaster, Transform, TransformComponent, Transition, type TransitionOptions, TreeNode, Trigger, TriggerEvents, type TriggerOptions, TwoPI, UniformBuffer, type UniformBufferOptions, type UniformDefinition, type UniformDictionary, type UniformTypeNames, Index as Util, Vector, VectorView, type VectorViewOptions, type VertexAttributeDefinition, VertexBuffer, type VertexBufferOptions, VertexLayout, type VertexLayoutOptions, VerticalFirst, type ViewportDimension, type ViewportUnit, VisibleEvent, WebAudio, WebAudioInstance, type WebGLGraphicsContextInfo, WheelDeltaMode, WheelEvent, type WithRoot, World, type _add, type _initialize, type _postupdate, type _preupdate, type _remove, type activate, type add, approximatelyEqual, assert, type axis, type button, type cancel, canonicalizeAngle, clamp, type collisionend, type collisionstart, type connect, coroutine, createId, type deactivate, type disconnect, type down, type enter, type entertrigger, type enterviewport, type exittrigger, type exitviewport, frac, getDefaultPhysicsConfig, glTypeToUniformTypeName, hasGraphicsTick, hasOnAdd, hasOnInitialize, hasOnPostUpdate, hasOnPreUpdate, hasOnRemove, hasPostDraw, hasPreDraw, has_add, has_initialize, has_postupdate, has_preupdate, has_remove, type hidden, type hold, type initialize, inverseLerp, inverseLerpVector, isActor, isAddedComponent, isComponentCtor, isLoaderConstructor, isMoveByOptions, isMoveToOptions, isRemovedComponent, isRotateByOptions, isRotateToOptions, isScaleByOptions, isScaleToOptions, isSceneConstructor, isScreenElement, isSystemConstructor, type kill, type leave, lerp, lerpAngle, lerpVector, maxMessages, type move, nextActionId, obsolete, parseImageFiltering, parseImageWrapping, pixelSnapEpsilon, type pointercancel, type pointerdown, type pointerdragend, type pointerdragenter, type pointerdragleave, type pointerdragmove, type pointerdragstart, type pointerenter, type pointerleave, type pointermove, type pointerup, type pointerwheel, type postcollision, type postdebugdraw, type postdraw, type postframe, type postkill, type postupdate, type precollision, type predebugdraw, type predraw, type preframe, type prekill, type press, type preupdate, randomInRange, randomIntInRange, range, type release, remap, remapVector, type remove, resetObsoleteCounter, sign, type start, type stop, type subscribe, toDegrees, toRadians, type unsubscribe, type up, vec, type visible, webglUtil as webgl, type wheel };
