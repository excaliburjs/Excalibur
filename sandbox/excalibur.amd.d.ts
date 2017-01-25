/*! excalibur - v0.8.0 - 2017-01-10
* https://github.com/excaliburjs/Excalibur
* Copyright (c) 2017 Excalibur.js <https://github.com/excaliburjs/Excalibur/graphs/contributors>; Licensed BSD-2-Clause
* @preserve */
declare module "Actions/RotationType" {
    /**
     * An enum that describes the strategies that rotation actions can use
     */
    export enum RotationType {
        /**
         * Rotation via `ShortestPath` will use the smallest angle
         * between the starting and ending points. This strategy is the default behavior.
         */
        ShortestPath = 0,
        /**
         * Rotation via `LongestPath` will use the largest angle
         * between the starting and ending points.
         */
        LongestPath = 1,
        /**
         * Rotation via `Clockwise` will travel in a clockwise direction,
         * regardless of the starting and ending points.
         */
        Clockwise = 2,
        /**
         * Rotation via `CounterClockwise` will travel in a counterclockwise direction,
         * regardless of the starting and ending points.
         */
        CounterClockwise = 3,
    }
}
declare module "Algebra" {
    /**
     * A 2D vector on a plane.
     */
    export class Vector {
        x: number;
        y: number;
        /**
         * A (0, 0) vector
         */
        static Zero: Vector;
        /**
         * A (1, 1) vector
         */
        static One: Vector;
        /**
         * A (0.5, 0.5) vector
         */
        static Half: Vector;
        /**
         * A unit vector pointing up (0, -1)
         */
        static Up: Vector;
        /**
         * A unit vector pointing down (0, 1)
         */
        static Down: Vector;
        /**
         * A unit vector pointing left (-1, 0)
         */
        static Left: Vector;
        /**
         * A unit vector pointing right (1, 0)
         */
        static Right: Vector;
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
         * @param x  X component of the Vector
         * @param y  Y component of the Vector
         */
        constructor(x: number, y: number);
        /**
         * Sets the x and y components at once
         */
        setTo(x: number, y: number): void;
        /**
         * Compares this point against another and tests for equality
         * @param point  The other point to compare to
         */
        equals(vector: Vector, tolerance?: number): boolean;
        /**
         * The distance to another vector. If no other Vector is specified, this will return the [[magnitude]].
         * @param v  The other vector. Leave blank to use origin vector.
         */
        distance(v?: Vector): number;
        /**
         * The magnitude (size) of the Vector
         */
        magnitude(): number;
        /**
         * Normalizes a vector to have a magnitude of 1.
         */
        normalize(): Vector;
        /**
         * Returns the average (midpoint) between the current point and the specified
         */
        average(vec: Vector): Vector;
        /**
         * Scales a vector's by a factor of size
         * @param size  The factor to scale the magnitude by
         */
        scale(size: any): Vector;
        /**
         * Adds one vector to another
         * @param v The vector to add
         */
        add(v: Vector): Vector;
        /**
         * Subtracts a vector from another, if you subract vector `B.sub(A)` the resulting vector points from A -> B
         * @param v The vector to subtract
         */
        sub(v: Vector): Vector;
        /**
         * Adds one vector to this one modifying the original
         * @param v The vector to add
         */
        addEqual(v: Vector): Vector;
        /**
         * Subtracts a vector from this one modifying the original
         * @parallel v The vector to subtract
         */
        subEqual(v: Vector): Vector;
        /**
         * Scales this vector by a factor of size and modifies the original
         */
        scaleEqual(size: number): Vector;
        /**
         * Performs a dot product with another vector
         * @param v  The vector to dot
         */
        dot(v: Vector): number;
        /**
         * Performs a 2D cross product with scalar. 2D cross products with a scalar return a vector.
         * @param v  The vector to cross
         */
        cross(v: number): Vector;
        /**
         * Performs a 2D cross product with another vector. 2D cross products return a scalar value not a vector.
         * @param v  The vector to cross
         */
        cross(v: Vector): number;
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
         * Returns the angle of this vector.
         */
        toAngle(): number;
        /**
         * Rotates the current vector around a point by a certain number of
         * degrees in radians
         */
        rotate(angle: number, anchor?: Vector): Vector;
        /**
         * Creates new vector that has the same values as the previous.
         */
        clone(): Vector;
        /**
         * Returns a string repesentation of the vector.
         */
        toString(): string;
    }
    /**
     * A 2D ray that can be cast into the scene to do collision detection
     */
    export class Ray {
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
        intersect(line: Line): number;
        /**
         * Returns the point of intersection given the intersection time
         */
        getPoint(time: number): Vector;
    }
    /**
     * A 2D line segment
     */
    export class Line {
        begin: Vector;
        end: Vector;
        /**
         * @param begin  The starting point of the line segment
         * @param end  The ending point of the line segment
         */
        constructor(begin: Vector, end: Vector);
        /**
         * Gets the raw slope (m) of the line. Will return (+/-)Infinity for vertical lines.
         */
        readonly slope: number;
        /**
         * Gets the Y-intercept (b) of the line. Will return (+/-)Infinity if there is no intercept.
         */
        readonly intercept: number;
        /**
         * Returns the slope of the line in the form of a vector
         */
        getSlope(): Vector;
        /**
         * Returns the length of the line segment in pixels
         */
        getLength(): number;
        /**
         * Finds a point on the line given only an X or a Y value. Given an X value, the function returns
         * a new point with the calculated Y value and vice-versa.
         *
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
     * A 1 dimensional projection on an axis, used to test overlaps
     */
    export class Projection {
        min: number;
        max: number;
        constructor(min: number, max: number);
        overlaps(projection: Projection): boolean;
        getOverlap(projection: Projection): number;
    }
}
declare module "Physics" {
    import { Vector } from "Algebra";
    /**
     * Possible collision resolution strategies
     *
     * The default is [[CollisionResolutionStrategy.Box]] which performs simple axis aligned arcade style physics.
     *
     * More advanced rigid body physics are enabled by setting [[CollisionResolutionStrategy.RigidBody]] which allows for complicated
     * simulated physical interactions.
     */
    export enum CollisionResolutionStrategy {
        Box = 0,
        RigidBody = 1,
    }
    /**
     * Possible broadphase collision pair identification strategies
     *
     * The default strategy is [[BroadphaseStrategy.DynamicAABBTree]] which uses a binary tree of axis-aligned bounding boxes to identify
     * potential collision pairs which is O(nlog(n)) faster. The other possible strategy is the [[BroadphaseStrategy.Naive]] strategy
     * which loops over every object for every object in the scene to identify collision pairs which is O(n^2) slower.
     */
    export enum BroadphaseStrategy {
        Naive = 0,
        DynamicAABBTree = 1,
    }
    /**
     * Possible numerical integrators for position and velocity
     */
    export enum Integrator {
        Euler = 0,
    }
    /**
     * The [[Physics]] object is the global configuration object for all Excalibur physics.
     *
     * [[include:Physics.md]]
     */
    export class Physics {
        /**
         * Global acceleration that is applied to all vanilla actors (it wont effect [[Label|labels]], [[UIActor|ui actors]], or
         * [[Trigger|triggers]] in Excalibur that have an [[CollisionType.Active|active]] collision type).
         *
         *
         * This is a great way to globally simulate effects like gravity.
         */
        static acc: Vector;
        /**
         * Globally switches all Excalibur physics behavior on or off.
         */
        static enabled: boolean;
        /**
         * Gets or sets the number of collision passes for Excalibur to perform on physics bodies.
         *
         * Reducing collision passes may cause things not to collide as expected in your game, but may increase performance.
         *
         * More passes can improve the visual quality of collisions when many objects are on the screen. This can reduce jitter, improve the
         * collision resolution of fast move objects, or the stability of large numbers of objects stacked together.
         *
         * Fewer passes will improve the performance of the game at the cost of collision quality, more passes will improve quality at the
         * cost of performance.
         *
         * The default is set to 5 passes which is a good start.
         */
        static collisionPasses: number;
        /**
         * Gets or sets the broadphase pair identification strategy.
         *
         * The default strategy is [[BroadphaseStrategy.DynamicAABBTree]] which uses a binary tree of axis-aligned bounding boxes to identify
         * potential collision pairs which is O(nlog(n)) faster. The other possible strategy is the [[BroadphaseStrategy.Naive]] strategy
         * which loops over every object for every object in the scene to identify collision pairs which is O(n^2) slower.
         */
        static broadphaseStrategy: BroadphaseStrategy;
        /**
         * Globally switches the debug information for the broadphase strategy
         */
        static broadphaseDebug: boolean;
        /**
         * Show the normals as a result of collision on the screen.
         */
        static showCollisionNormals: boolean;
        /**
         * Show the position, velocity, and acceleration as graphical vectors.
         */
        static showMotionVectors: boolean;
        /**
         * Show the axis-aligned bounding boxes of the collision bodies on the screen.
         */
        static showBounds: boolean;
        /**
         * Show the bounding collision area shapes
         */
        static showArea: boolean;
        /**
         * Show points of collision interpreted by excalibur as a result of collision.
         */
        static showContacts: boolean;
        /**
         * Show the surface normals of the collision areas.
         */
        static showNormals: boolean;
        /**
         * Gets or sets the global collision resolution strategy (narrowphase).
         *
         * The default is [[CollisionResolutionStrategy.Box]] which performs simple axis aligned arcade style physics.
         *
         * More advanced rigid body physics are enabled by setting [[CollisionResolutionStrategy.RigidBody]] which allows for complicated
         * simulated physical interactions.
         */
        static collisionResolutionStrategy: CollisionResolutionStrategy;
        /**
         * The default mass to use if none is specified
         */
        static defaultMass: number;
        /**
         * Gets or sets the position and velocity positional integrator, currently only Euler is supported.
         */
        static integrator: Integrator;
        /**
         * Number of steps to use in integration. A higher number improves the positional accuracy over time. This can be useful to increase
         * if you have fast moving objects in your simulation or you have a large number of objects and need to increase stability.
         */
        static integrationSteps: number;
        /**
         * Gets or sets whether rotation is allowed in a RigidBody collision resolution
         */
        static allowRigidBodyRotation: boolean;
        /**
         * Configures Excalibur to use box physics. Box physics which performs simple axis aligned arcade style physics.
         */
        static useBoxPhysics(): void;
        /**
         * Configures Excalibur to use rigid body physics. Rigid body physics allows for complicated
         * simulated physical interactions.
         */
        static useRigidBodyPhysics(): void;
        /**
         * Small value to help collision passes settle themselves after the narrowphase.
         */
        static collisionShift: number;
        /**
         * Factor to add to the RigidBody BoundingBox, bounding box (dimensions += vel * dynamicTreeVelocityMultiplyer);
         */
        static dynamicTreeVelocityMultiplyer: number;
        /**
         * Pad RigidBody BoundingBox by a constant amount
         */
        static boundsPadding: number;
        /**
         * Surface epsilon is used to help deal with surface penatration
         */
        static surfaceEpsilon: number;
        /**
         * Enable fast moving body checking, this enables checking for collision pairs via raycast for fast moving objects to prevent
         * bodies from tunneling through one another.
         */
        static checkForFastBodies: boolean;
        /**
         * Disable minimum fast moving body raycast, by default if ex.Physics.checkForFastBodies = true Excalibur will only check if the
         * body is moving at least half of its minimum diminension in an update. If ex.Physics.disableMinimumSpeedForFastBody is set to true,
         * Excalibur will always perform the fast body raycast regardless of speed.
         */
        static disableMinimumSpeedForFastBody: boolean;
    }
}
declare module "Util/EasingFunctions" {
    /**
     * A definition of an EasingFunction. See [[EasingFunctions]].
     */
    export interface EasingFunction {
        (currentTime: number, startValue: number, endValue: number, duration: number): number;
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
    export class EasingFunctions {
        static Linear: EasingFunction;
        static EaseInQuad: (currentTime: number, startValue: number, endValue: number, duration: number) => number;
        static EaseOutQuad: EasingFunction;
        static EaseInOutQuad: EasingFunction;
        static EaseInCubic: EasingFunction;
        static EaseOutCubic: EasingFunction;
        static EaseInOutCubic: EasingFunction;
    }
}
declare module "Util/Log" {
    /**
     * Logging level that Excalibur will tag
     */
    export enum LogLevel {
        Debug = 0,
        Info = 1,
        Warn = 2,
        Error = 3,
        Fatal = 4,
    }
    /**
     * Static singleton that represents the logging facility for Excalibur.
     * Excalibur comes built-in with a [[ConsoleAppender]] and [[ScreenAppender]].
     * Derive from [[IAppender]] to create your own logging appenders.
     *
     * [[include:Logger.md]]
     */
    export class Logger {
        private static _instance;
        private _appenders;
        constructor();
        /**
         * Gets or sets the default logging level. Excalibur will only log
         * messages if equal to or above this level. Default: [[LogLevel.Info]]
         */
        defaultLevel: LogLevel;
        /**
         * Gets the current static instance of Logger
         */
        static getInstance(): Logger;
        /**
         * Adds a new [[IAppender]] to the list of appenders to write to
         */
        addAppender(appender: IAppender): void;
        /**
         * Clears all appenders from the logger
         */
        clearAppenders(): void;
        /**
         * Logs a message at a given LogLevel
         * @param level  The LogLevel`to log the message at
         * @param args   An array of arguments to write to an appender
         */
        private _log(level, args);
        /**
         * Writes a log message at the [[LogLevel.Debug]] level
         * @param args  Accepts any number of arguments
         */
        debug(...args: any[]): void;
        /**
         * Writes a log message at the [[LogLevel.Info]] level
         * @param args  Accepts any number of arguments
         */
        info(...args: any[]): void;
        /**
         * Writes a log message at the [[LogLevel.Warn]] level
         * @param args  Accepts any number of arguments
         */
        warn(...args: any[]): void;
        /**
         * Writes a log message at the [[LogLevel.Error]] level
         * @param args  Accepts any number of arguments
         */
        error(...args: any[]): void;
        /**
         * Writes a log message at the [[LogLevel.Fatal]] level
         * @param args  Accepts any number of arguments
         */
        fatal(...args: any[]): void;
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
        log(level: LogLevel, args: any[]): void;
    }
    /**
     * On-screen (canvas) appender
     */
    export class ScreenAppender implements IAppender {
        private _messages;
        private _canvas;
        private _ctx;
        /**
         * @param width   Width of the screen appender in pixels
         * @param height  Height of the screen appender in pixels
         */
        constructor(width?: number, height?: number);
        /**
         * Logs a message at the given [[LogLevel]]
         * @param level  Level to log at
         * @param args   Arguments to log
         */
        log(level: LogLevel, args: any[]): void;
    }
}
declare module "Collision/Side" {
    /**
     * An enum that describes the sides of an Actor for collision
     */
    export enum Side {
        None = 0,
        Top = 1,
        Bottom = 2,
        Left = 3,
        Right = 4,
    }
}
declare module "Util/Util" {
    import { Vector } from "Algebra";
    import { Side } from "Collision/Side";
    /**
     * Two PI constant
     */
    export const TwoPI: number;
    /**
     * Merges one or more objects into a single target object
     *
     * @param deep Whether or not to do a deep clone
     * @param target The target object to attach properties on
     * @param objects The objects whose properties to merge
     * @returns Merged object with properties from other objects
     */
    export function extend(deep: boolean, target: any, ...objects: any[]): any;
    /**
     * Merges one or more objects into a single target object
     *
     * @param target The target object to attach properties on
     * @param objects The objects whose properties to merge
     * @returns Merged object with properties from other objects
     */
    export function extend(target: any, ...objects: any[]): any;
    export function base64Encode(inputStr: string): string;
    /**
     * Clamps a value between a min and max inclusive
     */
    export function clamp(val: number, min: number, max: number): number;
    export function randomInRange(min: number, max: number): number;
    export function randomIntInRange(min: number, max: number): number;
    export function canonicalizeAngle(angle: number): number;
    export function toDegrees(radians: number): number;
    export function toRadians(degrees: number): number;
    export function getPosition(el: HTMLElement): Vector;
    export function addItemToArray<T>(item: T, array: T[]): boolean;
    export function removeItemToArray<T>(item: T, array: T[]): boolean;
    export function contains(array: Array<any>, obj: any): boolean;
    export function getOppositeSide(side: Side): Side;
    export function getSideFromVector(direction: Vector): Side;
    /**
     * Excalibur's dynamically resizing collection
     */
    export class Collection<T> {
        /**
         * Default collection size
         */
        static DefaultSize: number;
        private _internalArray;
        private _endPointer;
        /**
         * @param initialSize  Initial size of the internal backing array
         */
        constructor(initialSize?: number);
        private _resize();
        /**
         * Push elements to the end of the collection
         */
        push(element: T): T;
        /**
         * Removes elements from the end of the collection
         */
        pop(): T;
        /**
         * Returns the count of the collection
         */
        count(): number;
        /**
         * Empties the collection
         */
        clear(): void;
        /**
         * Returns the size of the internal backing array
         */
        internalSize(): number;
        /**
         * Returns an element at a specific index
         * @param index  Index of element to retrieve
         */
        elementAt(index: number): T;
        /**
         * Inserts an element at a specific index
         * @param index  Index to insert the element
         * @param value  Element to insert
         */
        insert(index: number, value: T): T;
        /**
         * Removes an element at a specific index
         * @param index  Index of element to remove
         */
        remove(index: number): T;
        /**
         * Removes an element by reference
         * @param element  Element to retrieve
         */
        removeElement(element: T): void;
        /**
         * Returns a array representing the collection
         */
        toArray(): T[];
        /**
         * Iterate over every element in the collection
         * @param func  Callback to call for each element passing a reference to the element and its index, returned values are ignored
         */
        forEach(func: (element: T, index: number) => any): void;
        /**
         * Mutate every element in the collection
         * @param func  Callback to call for each element passing a reference to the element and its index, any values returned mutate
         * the collection
         */
        map(func: (element: T, index: number) => any): void;
    }
}
declare module "Util/Decorators" {
    /**
     * Obsolete decorator options
     */
    export interface IObsoleteOptions {
        message?: string;
        alternateMethod?: string;
    }
    /**
     * Obsolete decorator for marking Excalibur methods obsolete, you can optionally specify a custom message and/or alternate replacement
     * method do the deprecated one. Inspired by https://github.com/jayphelps/core-decorators.js
     */
    export function obsolete(options?: IObsoleteOptions): (target: any, property: string, descriptor: PropertyDescriptor) => any;
}
declare module "Promises" {
    /**
     * Valid states for a promise to be in
     */
    export enum PromiseState {
        Resolved = 0,
        Rejected = 1,
        Pending = 2,
    }
    export interface IPromise<T> {
        then(successCallback?: (value?: T) => any, rejectCallback?: (value?: T) => any): IPromise<T>;
        error(rejectCallback?: (value?: any) => any): IPromise<T>;
        resolve(value?: T): IPromise<T>;
        reject(value?: any): IPromise<T>;
        state(): PromiseState;
    }
    /**
     * Promises are used to do asynchronous work and they are useful for
     * creating a chain of actions. In Excalibur they are used for loading,
     * sounds, animation, actions, and more.
     *
     * [[include:Promises.md]]
     */
    export class Promise<T> implements IPromise<T> {
        private _state;
        private _value;
        private _successCallbacks;
        private _rejectCallback;
        private _errorCallback;
        private _logger;
        /**
         * Wrap a value in a resolved promise
         * @param value  An optional value to wrap in a resolved promise
         * @obsolete Use [[resolve]] instead. This will be deprecated in future versions.
         */
        static wrap<T>(value?: T): Promise<T>;
        /**
         * Create and resolve a Promise with an optional value
         * @param value  An optional value to wrap in a resolved promise
         */
        static resolve<T>(value?: T): Promise<T>;
        /**
         * Create and reject a Promise with an optional value
         * @param value  An optional value to wrap in a rejected promise
         */
        static reject<T>(value?: T): Promise<T>;
        /**
         * Returns a new promise that resolves when all the promises passed to it resolve, or rejects
         * when at least 1 promise rejects.
         */
        static join<T>(promises: Promise<T>[]): any;
        /**
         * Returns a new promise that resolves when all the promises passed to it resolve, or rejects
         * when at least 1 promise rejects.
         */
        static join<T>(...promises: Promise<T>[]): any;
        /**
         * Chain success and reject callbacks after the promise is resolved
         * @param successCallback  Call on resolution of promise
         * @param rejectCallback   Call on rejection of promise
         */
        then(successCallback?: (value?: T) => any, rejectCallback?: (value?: any) => any): this;
        /**
         * Add an error callback to the promise
         * @param errorCallback  Call if there was an error in a callback
         */
        error(errorCallback?: (value?: any) => any): this;
        /**
         * Resolve the promise and pass an option value to the success callbacks
         * @param value  Value to pass to the success callbacks
         */
        resolve(value?: T): Promise<T>;
        /**
         * Reject the promise and pass an option value to the reject callbacks
         * @param value  Value to pass to the reject callbacks
         */
        reject(value?: any): this;
        /**
         * Inspect the current state of a promise
         */
        state(): PromiseState;
        private _handleError(e);
    }
}
declare module "Camera" {
    import { Engine } from "Engine";
    import { EasingFunction } from "Util/EasingFunctions";
    import { IPromise } from "Promises";
    import { Vector } from "Algebra";
    import { Actor } from "Actor";
    /**
     * Cameras
     *
     * [[BaseCamera]] is the base class for all Excalibur cameras. Cameras are used
     * to move around your game and set focus. They are used to determine
     * what is "off screen" and can be used to scale the game.
     *
     * [[include:Cameras.md]]
     */
    export class BaseCamera {
        protected _follow: Actor;
        z: number;
        dx: number;
        dy: number;
        dz: number;
        ax: number;
        ay: number;
        az: number;
        rotation: number;
        rx: number;
        private _x;
        private _y;
        private _cameraMoving;
        private _currentLerpTime;
        private _lerpDuration;
        private _totalLerpTime;
        private _lerpStart;
        private _lerpEnd;
        private _lerpPromise;
        protected _isShaking: boolean;
        private _shakeMagnitudeX;
        private _shakeMagnitudeY;
        private _shakeDuration;
        private _elapsedShakeTime;
        private _xShake;
        private _yShake;
        protected _isZooming: boolean;
        private _currentZoomScale;
        private _maxZoomScale;
        private _zoomDuration;
        private _elapsedZoomTime;
        private _zoomIncrement;
        private _easing;
        /**
         * Get the camera's x position
         */
        /**
         * Set the camera's x position (cannot be set when following an [[Actor]] or when moving)
         */
        x: number;
        /**
         * Get the camera's y position
         */
        /**
         * Set the camera's y position (cannot be set when following an [[Actor]] or when moving)
         */
        y: number;
        /**
         * Sets the [[Actor]] to follow with the camera
         * @param actor  The actor to follow
         */
        setActorToFollow(actor: Actor): void;
        /**
         * Returns the focal point of the camera, a new point giving the x and y position of the camera
         */
        getFocus(): Vector;
        /**
         * This moves the camera focal point to the specified position using specified easing function. Cannot move when following an Actor.
         *
         * @param pos The target position to move to
         * @param duration The duration in milliseconds the move should last
         * @param [easingFn] An optional easing function ([[ex.EasingFunctions.EaseInOutCubic]] by default)
         * @returns A [[Promise]] that resolves when movement is finished, including if it's interrupted.
         *          The [[Promise]] value is the [[Vector]] of the target position. It will be rejected if a move cannot be made.
         */
        move(pos: Vector, duration: number, easingFn?: EasingFunction): IPromise<Vector>;
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
        zoom(scale: number, duration?: number): void;
        /**
         * Gets the current zoom scale
         */
        getZoom(): number;
        private _setCurrentZoomScale(zoomScale);
        update(engine: Engine, delta: number): void;
        /**
         * Applies the relevant transformations to the game canvas to "move" or apply effects to the Camera
         * @param ctx    Canvas context to apply transformations
         * @param delta  The number of milliseconds since the last update
         */
        draw(ctx: CanvasRenderingContext2D, delta: number): void;
        debugDraw(ctx: CanvasRenderingContext2D): void;
        private _isDoneShaking();
        private _isDoneZooming();
    }
    /**
     * An extension of [[BaseCamera]] that is locked vertically; it will only move side to side.
     *
     * Common usages: platformers.
     */
    export class SideCamera extends BaseCamera {
        getFocus(): Vector;
    }
    /**
     * An extension of [[BaseCamera]] that is locked to an [[Actor]] or
     * [[LockedCamera.getFocus|focal point]]; the actor will appear in the
     * center of the screen.
     *
     * Common usages: RPGs, adventure games, top-down games.
     */
    export class LockedCamera extends BaseCamera {
        getFocus(): Vector;
    }
}
declare module "DebugFlags" {
    export interface IDebugFlags {
    }
}
declare module "Debug" {
    import { Engine } from "Engine";
    import { IDebugFlags } from "DebugFlags";
    /**
     * Represents a frame's individual statistics
     */
    export interface IFrameStats {
        /**
         * The number of the frame
         */
        id: number;
        /**
         * Gets the frame's delta (time since last frame scaled by [[Engine.timescale]]) (in ms)
         */
        delta: number;
        /**
         * Gets the frame's frames-per-second (FPS)
         */
        fps: number;
        /**
         * Duration statistics (in ms)
         */
        duration: IFrameDurationStats;
        /**
         * Actor statistics
         */
        actors: IFrameActorStats;
        /**
         * Physics statistics
         */
        physics: IPhysicsStats;
    }
    /**
     * Represents actor stats for a frame
     */
    export interface IFrameActorStats {
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
    export interface IFrameDurationStats {
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
    export interface IPhysicsStats {
        /**
         * Gets the number of broadphase collision pairs which
         */
        pairs: number;
        /**
         * Gets the number of actural collisons
         */
        collisions: number;
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
    /**
     * Debug statistics and flags for Excalibur. If polling these values, it would be
     * best to do so on the `postupdate` event for [[Engine]], after all values have been
     * updated during a frame.
     */
    export class Debug implements IDebugFlags {
        private _engine;
        constructor(_engine: Engine);
        /**
         * Performance statistics
         */
        stats: {
            currFrame: FrameStats;
            prevFrame: FrameStats;
        };
    }
    /**
     * Implementation of a frame's stats. Meant to have values copied via [[FrameStats.reset]], avoid
     * creating instances of this every frame.
     */
    export class FrameStats implements IFrameStats {
        private _id;
        private _delta;
        private _fps;
        private _actorStats;
        private _durationStats;
        private _physicsStats;
        /**
         * Zero out values or clone other IFrameStat stats. Allows instance reuse.
         *
         * @param [otherStats] Optional stats to clone
         */
        reset(otherStats?: IFrameStats): void;
        /**
         * Provides a clone of this instance.
         */
        clone(): FrameStats;
        /**
         * Gets the frame's id
         */
        /**
         * Sets the frame's id
         */
        id: number;
        /**
         * Gets the frame's delta (time since last frame)
         */
        /**
         * Sets the frame's delta (time since last frame). Internal use only.
         * @internal
         */
        delta: number;
        /**
         * Gets the frame's frames-per-second (FPS)
         */
        /**
         * Sets the frame's frames-per-second (FPS). Internal use only.
         * @internal
         */
        fps: number;
        /**
         * Gets the frame's actor statistics
         */
        readonly actors: IFrameActorStats;
        /**
         * Gets the frame's duration statistics
         */
        readonly duration: IFrameDurationStats;
        /**
         * Gets the frame's physics statistics
         */
        readonly physics: PhysicsStats;
    }
    export class PhysicsStats implements IPhysicsStats {
        private _pairs;
        private _collisions;
        private _fastBodies;
        private _fastBodyCollisions;
        private _broadphase;
        private _narrowphase;
        /**
         * Zero out values or clone other IPhysicsStats stats. Allows instance reuse.
         *
         * @param [otherStats] Optional stats to clone
         */
        reset(otherStats?: IPhysicsStats): void;
        /**
         * Provides a clone of this instance.
         */
        clone(): IPhysicsStats;
        pairs: number;
        collisions: number;
        fastBodies: number;
        fastBodyCollisions: number;
        broadphase: number;
        narrowphase: number;
    }
}
declare module "Interfaces/IEvented" {
    import { GameEvent } from "Events";
    export interface IEvented {
        /**
         * Emits an event for target
         * @param eventName  The name of the event to publish
         * @param event      Optionally pass an event data object to the handler
         */
        emit(eventName: string, event?: GameEvent): any;
        /**
         * Subscribe an event handler to a particular event name, multiple handlers per event name are allowed.
         * @param eventName  The name of the event to subscribe to
         * @param handler    The handler callback to fire on this event
         */
        on(eventName: string, handler: (event?: GameEvent) => void): any;
        /**
         * Unsubscribe an event handler(s) from an event. If a specific handler
         * is specified for an event, only that handler will be unsubscribed.
         * Otherwise all handlers will be unsubscribed for that event.
         *
         * @param eventName  The name of the event to unsubscribe
         * @param handler    Optionally the specific handler to unsubscribe
         *
         */
        off(eventName: string, handler: (event?: GameEvent) => void): any;
    }
}
declare module "EventDispatcher" {
    import { GameEvent } from "Events";
    import { IEvented } from "Interfaces/IEvented";
    /**
     * Excalibur's internal event dispatcher implementation.
     * Callbacks are fired immediately after an event is published.
     * Typically you will use [[Class.eventDispatcher]] since most classes in
     * Excalibur inherit from [[Class]]. You will rarely create an `EventDispatcher`
     * yourself.
     *
     * [[include:Events.md]]
     */
    export class EventDispatcher implements IEvented {
        private _handlers;
        private _wiredEventDispatchers;
        private _target;
        private _log;
        /**
         * @param target  The object that will be the recipient of events from this event dispatcher
         */
        constructor(target: any);
        /**
         * Emits an event for target
         * @param eventName  The name of the event to publish
         * @param event      Optionally pass an event data object to the handler
         */
        emit(eventName: string, event?: GameEvent): void;
        /**
         * Subscribe an event handler to a particular event name, multiple handlers per event name are allowed.
         * @param eventName  The name of the event to subscribe to
         * @param handler    The handler callback to fire on this event
         */
        on(eventName: string, handler: (event?: GameEvent) => void): void;
        /**
         * Unsubscribe an event handler(s) from an event. If a specific handler
         * is specified for an event, only that handler will be unsubscribed.
         * Otherwise all handlers will be unsubscribed for that event.
         *
         * @param eventName  The name of the event to unsubscribe
         * @param handler    Optionally the specific handler to unsubscribe
         *
         */
        off(eventName: string, handler?: (event?: GameEvent) => void): void;
        /**
         * Wires this event dispatcher to also recieve events from another
         */
        wire(eventDispatcher: EventDispatcher): void;
        /**
         * Unwires this event dispatcher from another
         */
        unwire(eventDispatcher: EventDispatcher): void;
    }
}
declare module "Drawing/Color" {
    /**
     * Provides standard colors (e.g. [[Color.Black]])
     * but you can also create custom colors using RGB, HSL, or Hex. Also provides
     * useful color operations like [[Color.lighten]], [[Color.darken]], and more.
     *
     * [[include:Colors.md]]
     */
    export class Color {
        /**
         * Black (#000000)
         */
        static Black: Color;
        /**
         * White (#FFFFFF)
         */
        static White: Color;
        /**
         * Gray (#808080)
         */
        static Gray: Color;
        /**
         * Light gray (#D3D3D3)
         */
        static LightGray: Color;
        /**
         * Dark gray (#A9A9A9)
         */
        static DarkGray: Color;
        /**
         * Yellow (#FFFF00)
         */
        static Yellow: Color;
        /**
         * Orange (#FFA500)
         */
        static Orange: Color;
        /**
         * Red (#FF0000)
         */
        static Red: Color;
        /**
         * Vermillion (#FF5B31)
         */
        static Vermillion: Color;
        /**
         * Rose (#FF007F)
         */
        static Rose: Color;
        /**
         * Magenta (#FF00FF)
         */
        static Magenta: Color;
        /**
         * Violet (#7F00FF)
         */
        static Violet: Color;
        /**
         * Blue (#0000FF)
         */
        static Blue: Color;
        /**
         * Azure (#007FFF)
         */
        static Azure: Color;
        /**
         * Cyan (#00FFFF)
         */
        static Cyan: Color;
        /**
         * Viridian (#59978F)
         */
        static Viridian: Color;
        /**
         * Green (#00FF00)
         */
        static Green: Color;
        /**
         * Chartreuse (#7FFF00)
         */
        static Chartreuse: Color;
        /**
         * Transparent (#FFFFFF00)
         */
        static Transparent: Color;
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
         *
         * @param r  The red component of color (0-255)
         * @param g  The green component of color (0-255)
         * @param b  The blue component of color (0-255)
         * @param a  The alpha component of color (0-1.0)
         */
        constructor(r: number, g: number, b: number, a?: number);
        /**
         * Creates a new instance of Color from an r, g, b, a
         *
         * @param r  The red component of color (0-255)
         * @param g  The green component of color (0-255)
         * @param b  The blue component of color (0-255)
         * @param a  The alpha component of color (0-1.0)
         */
        static fromRGB(r: number, g: number, b: number, a?: number): Color;
        /**
         * Creates a new inscance of Color from a hex string
         *
         * @param hex  CSS color string of the form #ffffff, the alpha component is optional
         */
        static fromHex(hex: string): Color;
        /**
         * Creats a new instance of Color from hsla values
         *
         * @param h  Hue is represented [0-1]
         * @param s  Saturation is represented [0-1]
         * @param l  Luminance is represented [0-1]
         * @param a  Alpha is represented [0-1]
         */
        static fromHSL(h: number, s: number, l: number, a?: number): Color;
        /**
         * Lightens the current color by a specified amount
         *
         * @param factor  The amount to lighten by [0-1]
         */
        lighten(factor?: number): Color;
        /**
         * Darkens the current color by a specified amount
         *
         * @param factor  The amount to darken by [0-1]
         */
        darken(factor?: number): Color;
        /**
         * Saturates the current color by a specified amount
         *
         * @param factor  The amount to saturate by [0-1]
         */
        saturate(factor?: number): Color;
        /**
         * Desaturates the current color by a specified amount
         *
         * @param factor  The amount to desaturate by [0-1]
         */
        desaturate(factor?: number): Color;
        /**
         * Multiplies a color by another, results in a darker color
         *
         * @param color  The other color
         */
        mulitiply(color: Color): Color;
        /**
         * Screens a color by another, results in a lighter color
         *
         * @param color  The other color
         */
        screen(color: Color): Color;
        /**
         * Inverts the current color
         */
        invert(): Color;
        /**
         * Averages the current color with another
         *
         * @param color  The other color
         */
        average(color: Color): Color;
        /**
         * Returns a CSS string representation of a color.
         */
        toString(): string;
        /**
         * Returns a CSS string representation of a color.
         */
        fillStyle(): string;
        /**
         * Returns a clone of the current color.
         */
        clone(): Color;
    }
}
declare module "Collision/CollisionContact" {
    import { ICollisionArea } from "Collision/ICollisionArea";
    import { Vector } from "Algebra";
    import { CollisionResolutionStrategy } from "Physics";
    /**
     * Collision contacts are used internally by Excalibur to resolve collision between actors. This
     * Pair prevents collisions from being evaluated more than one time
     */
    export class CollisionContact {
        /**
         * The id of this collision contact
         */
        id: string;
        /**
         * The first rigid body in the collision
         */
        bodyA: ICollisionArea;
        /**
         * The second rigid body in the collision
         */
        bodyB: ICollisionArea;
        /**
         * The minimum translation vector to resolve penetration, pointing away from bodyA
         */
        mtv: Vector;
        /**
         * The point of collision shared between bodyA and bodyB
         */
        point: Vector;
        /**
         * The collision normal, pointing away from bodyA
         */
        normal: Vector;
        constructor(bodyA: ICollisionArea, bodyB: ICollisionArea, mtv: Vector, point: Vector, normal: Vector);
        resolve(delta: number, strategy: CollisionResolutionStrategy): void;
        private _applyBoxImpluse(bodyA, bodyB, mtv, side);
        private _resolveBoxCollision(delta);
        private _resolveRigidBodyCollision(delta);
    }
}
declare module "Collision/ICollisionArea" {
    import { Color } from "Drawing/Color";
    import { CollisionContact } from "Collision/CollisionContact";
    import { Body } from "Collision/Body";
    import { BoundingBox } from "Collision/BoundingBox";
    import { Vector, Projection, Ray } from "Algebra";
    /**
     * A collision area is a region of space that can detect when other collision areas intersect
     * for the purposes of colliding 2 objects in excalibur.
     */
    export interface ICollisionArea {
        /**
         * Position of the collision area relative to the actor if it exists
         */
        pos: Vector;
        /**
         * Reference to the actor associated with this collision area
         */
        body: Body;
        /**
         * The center point of the collision area, for example if the area is a circle it would be the center.
         */
        getCenter(): Vector;
        /**
         * Find the furthest point on the convex hull of this particular area in a certain direction.
         */
        getFurthestPoint(direction: Vector): Vector;
        /**
         * Return the axis-aligned bounding box of the collision area
         */
        getBounds(): BoundingBox;
        /**
         * Return the axes of this particular shape
         */
        getAxes(): Vector[];
        /**
         * Return the calculated moment of intertia for this area
         */
        getMomentOfInertia(): number;
        collide(area: ICollisionArea): CollisionContact;
        /**
         * Return wether the area contains a point inclusive to it's border
         */
        contains(point: Vector): boolean;
        /**
         * Return the point on the border of the collision area that intersects with a ray (if any).
         */
        rayCast(ray: Ray, max?: number): Vector;
        /**
         * Create a projection of this area along an axis. Think of this as casting a "shadow" along an axis
         */
        project(axis: Vector): Projection;
        /**
         * Recalculates internal caches and values
         */
        recalc(): void;
        debugDraw(ctx: CanvasRenderingContext2D, color: Color): any;
    }
}
declare module "Collision/CollisionJumpTable" {
    import { CircleArea } from "Collision/CircleArea";
    import { CollisionContact } from "Collision/CollisionContact";
    import { PolygonArea } from "Collision/PolygonArea";
    import { EdgeArea } from "Collision/EdgeArea";
    export var CollisionJumpTable: {
        CollideCircleCircle(circleA: CircleArea, circleB: CircleArea): CollisionContact;
        CollideCirclePolygon(circle: CircleArea, polygon: PolygonArea): CollisionContact;
        CollideCircleEdge(circle: CircleArea, edge: EdgeArea): CollisionContact;
        CollideEdgeEdge(edgeA: EdgeArea, edgeB: EdgeArea): CollisionContact;
        CollidePolygonEdge(polygon: PolygonArea, edge: EdgeArea): CollisionContact;
        CollidePolygonPolygon(polyA: PolygonArea, polyB: PolygonArea): CollisionContact;
    };
}
declare module "Collision/CircleArea" {
    import { Body } from "Collision/Body";
    import { BoundingBox } from "Collision/BoundingBox";
    import { ICollisionArea } from "Collision/ICollisionArea";
    import { PolygonArea } from "Collision/PolygonArea";
    import { CollisionContact } from "Collision/CollisionContact";
    import { Vector, Ray, Projection } from "Algebra";
    import { Color } from "Drawing/Color";
    export interface ICircleAreaOptions {
        pos?: Vector;
        radius?: number;
        body?: Body;
    }
    /**
     * This is a circle collision area for the excalibur rigid body physics simulation
     */
    export class CircleArea implements ICollisionArea {
        /**
         * This is the center position of the circle, relative to the body position
         */
        pos: Vector;
        /**
         * This is the radius of the circle
         */
        radius: number;
        /**
         * The actor associated with this collision area
         */
        body: Body;
        constructor(options: ICircleAreaOptions);
        /**
         * Get the center of the collision area in world coordinates
         */
        getCenter(): Vector;
        /**
         * Tests if a point is contained in this collision area
         */
        contains(point: Vector): boolean;
        /**
         * Casts a ray at the CircleArea and returns the nearest point of collision
         * @param ray
         */
        rayCast(ray: Ray, max?: number): Vector;
        /**
         * @inheritdoc
         */
        collide(area: ICollisionArea): CollisionContact;
        /**
         * Find the point on the shape furthest in the direction specified
         */
        getFurthestPoint(direction: Vector): Vector;
        /**
         * Get the axis aligned bounding box for the circle area
         */
        getBounds(): BoundingBox;
        /**
         * Get axis not implemented on circles, since there are infinite axis in a circle
         */
        getAxes(): Vector[];
        /**
         * Returns the moment of inertia of a circle given it's mass
         * https://en.wikipedia.org/wiki/List_of_moments_of_inertia
         */
        getMomentOfInertia(): number;
        /**
         * Tests the separating axis theorem for circles against polygons
         */
        testSeparatingAxisTheorem(polygon: PolygonArea): Vector;
        recalc(): void;
        /**
         * Project the circle along a specified axis
         */
        project(axis: Vector): Projection;
        debugDraw(ctx: CanvasRenderingContext2D, color?: Color): void;
    }
}
declare module "Util/DrawUtil" {
    import { Color } from "Drawing/Color";
    import { Vector } from "Algebra";
    /**
     * A canvas linecap style. "butt" is the default flush style, "round" is a semi-circle cap with a radius half the width of
     * the line, and "square" is a rectangle that is an equal width and half height cap.
     */
    export type LineCapStyle = 'butt' | 'round' | 'square';
    /**
     * Draw a line on canvas context
     *
     * @param ctx The canvas context
     * @param color The color of the line
     * @param x1 The start x coordinate
     * @param y1 The start y coordinate
     * @param x2 The ending x coordinate
     * @param y2 The ending y coordinate
     * @param thickness The line thickness
     * @param cap The [[LineCapStyle]] (butt, round, or square)
     */
    export function line(ctx: CanvasRenderingContext2D, color: Color, x1: number, y1: number, x2: number, y2: number, thickness?: number, cap?: LineCapStyle): void;
    /**
     * Draw the vector as a point onto the canvas.
     */
    export function point(ctx: CanvasRenderingContext2D, color: Color, point: Vector): void;
    /**
     * Draw the vector as a line onto the canvas starting a origin point.
     */
    export function vector(ctx: CanvasRenderingContext2D, color: Color, origin: Vector, vector: Vector, scale?: number): void;
    /**
     * Represents border radius values
     */
    export interface IBorderRadius {
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
     *
     * @param ctx The canvas context
     * @param x The top-left x coordinate
     * @param y The top-left y coordinate
     * @param width The width of the rectangle
     * @param height The height of the rectangle
     * @param radius The border radius of the rectangle
     * @param fill The [[Color]] to fill rectangle with
     * @param stroke The [[Color]] to stroke rectangle with
     */
    export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius?: number | IBorderRadius, stroke?: Color, fill?: Color): void;
    export function circle(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, stroke?: Color, fill?: Color): void;
}
declare module "Collision/Body" {
    import { ICollisionArea } from "Collision/ICollisionArea";
    import { BoundingBox } from "Collision/BoundingBox";
    import { Vector } from "Algebra";
    import { Actor } from "Actor";
    export class Body {
        actor: Actor;
        /**
         * Constructs a new physics body associated with an actor
         */
        constructor(actor: Actor);
        /**
         * [ICollisionArea|Collision area] of this physics body, defines the shape for rigid body collision
         */
        collisionArea: ICollisionArea;
        /**
         * The (x, y) position of the actor this will be in the middle of the actor if the
         * [[Actor.anchor]] is set to (0.5, 0.5) which is default.
         * If you want the (x, y) position to be the top left of the actor specify an anchor of (0, 0).
         */
        pos: Vector;
        /**
         * The position of the actor last frame (x, y) in pixels
         */
        oldPos: Vector;
        /**
         * The current velocity vector (vx, vy) of the actor in pixels/second
         */
        vel: Vector;
        /**
         * The velocity of the actor last frame (vx, vy) in pixels/second
         */
        oldVel: Vector;
        /**
         * The curret acceleration vector (ax, ay) of the actor in pixels/second/second. An acceleration pointing down such as (0, 100) may
         * be useful to simulate a gravitational effect.
         */
        acc: Vector;
        /**
         * The current torque applied to the actor
         */
        torque: number;
        /**
         * The current mass of the actor, mass can be thought of as the resistance to acceleration.
         */
        mass: number;
        /**
         * The current moment of inertia, moi can be thought of as the resistance to rotation.
         */
        moi: number;
        /**
         * The current "motion" of the actor, used to calculated sleep in the physics simulation
         */
        motion: number;
        /**
         * The coefficient of friction on this actor
         */
        friction: number;
        /**
         * The coefficient of restitution of this actor, represents the amount of energy preserved after collision
         */
        restitution: number;
        /**
         * The rotation of the actor in radians
         */
        rotation: number;
        /**
         * The rotational velocity of the actor in radians/second
         */
        rx: number;
        private _totalMtv;
        /**
         * Add minimum translation vectors accumulated during the current frame to resolve collisions.
         */
        addMtv(mtv: Vector): void;
        /**
         * Applies the accumulated translation vectors to the actors position
         */
        applyMtv(): void;
        /**
         * Returns the body's [[BoundingBox]] calculated for this instant in world space.
         */
        getBounds(): BoundingBox;
        /**
         * Returns the actor's [[BoundingBox]] relative to the actors position.
         */
        getRelativeBounds(): BoundingBox;
        /**
         * Updates the collision area geometry and internal caches
         */
        update(): void;
        /**
         * Sets up a box collision area based on the current bounds of the associated actor of this physics body.
         *
         * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
         */
        useBoxCollision(center?: Vector): void;
        /**
         * Sets up a polygon collision area based on a list of of points relative to the anchor of the associated actor of this physics body.
         *
         * Only [convex polygon](https://en.wikipedia.org/wiki/Convex_polygon) definitions are supported.
         *
         * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
         */
        usePolygonCollision(points: Vector[], center?: Vector): void;
        /**
         * Sets up a [[CircleArea|circle collision area]] with a specified radius in pixels.
         *
         * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
         */
        useCircleCollision(radius?: number, center?: Vector): void;
        /**
         * Sets up an [[EdgeArea|edge collision]] with a start point and an end point relative to the anchor of the associated actor
         * of this physics body.
         *
         * By default, the box is center is at (0, 0) which means it is centered around the actors anchor.
         */
        useEdgeCollision(begin: Vector, end: Vector, center?: Vector): void;
        debugDraw(ctx: CanvasRenderingContext2D): void;
    }
}
declare module "Collision/EdgeArea" {
    import { Body } from "Collision/Body";
    import { BoundingBox } from "Collision/BoundingBox";
    import { CollisionContact } from "Collision/CollisionContact";
    import { ICollisionArea } from "Collision/ICollisionArea";
    import { Vector, Ray, Projection } from "Algebra";
    import { Color } from "Drawing/Color";
    export interface IEdgeAreaOptions {
        begin?: Vector;
        end?: Vector;
        body?: Body;
    }
    export class EdgeArea implements ICollisionArea {
        body: Body;
        pos: Vector;
        begin: Vector;
        end: Vector;
        constructor(options: IEdgeAreaOptions);
        /**
         * Get the center of the collision area in world coordinates
         */
        getCenter(): Vector;
        private _getBodyPos();
        private _getTransformedBegin();
        private _getTransformedEnd();
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
        contains(point: Vector): boolean;
        /**
         * @inheritdoc
         */
        rayCast(ray: Ray, max?: number): Vector;
        /**
         * @inheritdoc
         */
        collide(area: ICollisionArea): CollisionContact;
        /**
         * Find the point on the shape furthest in the direction specified
         */
        getFurthestPoint(direction: Vector): Vector;
        /**
         * Get the axis aligned bounding box for the circle area
         */
        getBounds(): BoundingBox;
        /**
         * Get the axis associated with the edge
         */
        getAxes(): Vector[];
        /**
         * Get the moment of inertia for an edge
         * https://en.wikipedia.org/wiki/List_of_moments_of_inertia
         */
        getMomentOfInertia(): number;
        /**
         * @inheritdoc
         */
        recalc(): void;
        /**
         * Project the edge along a specified axis
         */
        project(axis: Vector): Projection;
        debugDraw(ctx: CanvasRenderingContext2D, color?: Color): void;
    }
}
declare module "Collision/PolygonArea" {
    import { Color } from "Drawing/Color";
    import { BoundingBox } from "Collision/BoundingBox";
    import { CollisionContact } from "Collision/CollisionContact";
    import { ICollisionArea } from "Collision/ICollisionArea";
    import { Body } from "Collision/Body";
    import { Vector, Line, Ray, Projection } from "Algebra";
    export interface IPolygonAreaOptions {
        pos?: Vector;
        points?: Vector[];
        clockwiseWinding?: boolean;
        body?: Body;
    }
    /**
     * Polygon collision area for detecting collisions for actors, or independently
     */
    export class PolygonArea implements ICollisionArea {
        pos: Vector;
        points: Vector[];
        body: Body;
        private _transformedPoints;
        private _axes;
        private _sides;
        constructor(options: IPolygonAreaOptions);
        /**
         * Get the center of the collision area in world coordinates
         */
        getCenter(): Vector;
        /**
         * Calculates the underlying transformation from the body relative space to world space
         */
        private _calculateTransformation();
        /**
         * Gets the points that make up the polygon in world space, from actor relative space (if specified)
         */
        getTransformedPoints(): Vector[];
        /**
         * Gets the sides of the polygon in world space
         */
        getSides(): Line[];
        recalc(): void;
        /**
         * Tests if a point is contained in this collision area in world space
         */
        contains(point: Vector): boolean;
        /**
         * Returns a collision contact if the 2 collision areas collide, otherwise collide will
         * return null.
         * @param area
         */
        collide(area: ICollisionArea): CollisionContact;
        /**
         * Find the point on the shape furthest in the direction specified
         */
        getFurthestPoint(direction: Vector): Vector;
        /**
         * Get the axis aligned bounding box for the polygon area
         */
        getBounds(): BoundingBox;
        /**
         * Get the moment of inertia for an arbitrary polygon
         * https://en.wikipedia.org/wiki/List_of_moments_of_inertia
         */
        getMomentOfInertia(): number;
        /**
         * Casts a ray into the polygon and returns a vector representing the point of contact (in world space) or null if no collision.
         */
        rayCast(ray: Ray, max?: number): Vector;
        /**
         * Get the axis associated with the edge
         */
        getAxes(): Vector[];
        /**
         * Perform Separating Axis test against another polygon, returns null if no overlap in polys
         * Reference http://www.dyn4j.org/2010/01/sat/
         */
        testSeparatingAxisTheorem(other: PolygonArea): Vector;
        /**
         * Project the edges of the polygon along a specified axis
         */
        project(axis: Vector): Projection;
        debugDraw(ctx: CanvasRenderingContext2D, color?: Color): void;
    }
}
declare module "Collision/BoundingBox" {
    import { PolygonArea } from "Collision/PolygonArea";
    import { Actor } from "Actor";
    import { Vector, Ray } from "Algebra";
    import { Color } from "Drawing/Color";
    /**
     * Interface all collidable objects must implement
     */
    export interface ICollidable {
        /**
         * Test whether this bounding box collides with another one.
         *
         * @param collidable  Other collidable to test
         * @returns Vector The intersection vector that can be used to resolve the collision.
         * If there is no collision, `null` is returned.
         */
        collides(collidable: ICollidable): Vector;
        /**
         * Tests wether a point is contained within the collidable
         * @param point  The point to test
         */
        contains(point: Vector): boolean;
        debugDraw(ctx: CanvasRenderingContext2D): void;
    }
    /**
     * Axis Aligned collision primitive for Excalibur.
     */
    export class BoundingBox implements ICollidable {
        left: number;
        top: number;
        right: number;
        bottom: number;
        /**
         * @param left    x coordinate of the left edge
         * @param top     y coordinate of the top edge
         * @param right   x coordinate of the right edge
         * @param bottom  y coordinate of the bottom edge
         */
        constructor(left?: number, top?: number, right?: number, bottom?: number);
        static fromPoints(points: Vector[]): BoundingBox;
        /**
         * Returns the calculated width of the bounding box
         */
        getWidth(): number;
        /**
         * Returns the calculated height of the bounding box
         */
        getHeight(): number;
        /**
         * Rotates a bounding box by and angle and around a point, if no point is specified (0, 0) is used by default
         */
        rotate(angle: number, point?: Vector): BoundingBox;
        /**
         * Returns the perimeter of the bounding box
         */
        getPerimeter(): number;
        getPoints(): Vector[];
        /**
         * Creates a Polygon collision area from the points of the bounding box
         */
        toPolygon(actor?: Actor): PolygonArea;
        /**
         * Determines whether a ray intersects with a bounding box
         */
        rayCast(ray: Ray, farClipDistance?: number): boolean;
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
        combine(other: BoundingBox): BoundingBox;
        /**
         * Test wether this bounding box collides with another returning,
         * the intersection vector that can be used to resolve the collision. If there
         * is no collision null is returned.
         * @param collidable  Other collidable to test
         */
        collides(collidable: ICollidable): Vector;
        debugDraw(ctx: CanvasRenderingContext2D, color?: Color): void;
    }
}
declare module "Actions/ActionContext" {
    import { RotationType } from "Actions/RotationType";
    import { Actor } from "Actor";
    import { Promise } from "Promises";
    import { EasingFunction } from "Util/EasingFunctions";
    /**
     * The fluent Action API allows you to perform "actions" on
     * [[Actor|Actors]] such as following, moving, rotating, and
     * more. You can implement your own actions by implementing
     * the [[IAction]] interface.
     *
     * [[include:Actions.md]]
     */
    export class ActionContext {
        private _actors;
        private _queues;
        constructor();
        constructor(actor: Actor);
        constructor(actors: Actor[]);
        /**
         * Clears all queued actions from the Actor
         */
        clearActions(): void;
        addActorToContext(actor: Actor): void;
        removeActorFromContext(actor: Actor): void;
        /**
         * This method will move an actor to the specified `x` and `y` position over the
         * specified duration using a given [[EasingFunctions]] and return back the actor. This
         * method is part of the actor 'Action' fluent API allowing action chaining.
         * @param x         The x location to move the actor to
         * @param y         The y location to move the actor to
         * @param duration  The time it should take the actor to move to the new location in milliseconds
         * @param easingFcn Use [[EasingFunctions]] or a custom function to use to calculate position
         */
        easeTo(x: number, y: number, duration: number, easingFcn?: EasingFunction): this;
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
         * This method will move an actor to the specified x and y position by a
         * certain time (in milliseconds). This method is part of the actor
         * 'Action' fluent API allowing action chaining.
         * @param x     The x location to move the actor to
         * @param y     The y location to move the actor to
         * @param time  The time it should take the actor to move to the new location in milliseconds
         */
        moveBy(x: number, y: number, time: number): ActionContext;
        /**
         * This method will rotate an actor to the specified angle at the speed
         * specified (in radians per second) and return back the actor. This
         * method is part of the actor 'Action' fluent API allowing action chaining.
         * @param angleRadians  The angle to rotate to in radians
         * @param speed         The angular velocity of the rotation specified in radians per second
         * @param rotationType  The [[RotationType]] to use for this rotation
         */
        rotateTo(angleRadians: number, speed: number, rotationType?: RotationType): ActionContext;
        /**
         * This method will rotate an actor to the specified angle by a certain
         * time (in milliseconds) and return back the actor. This method is part
         * of the actor 'Action' fluent API allowing action chaining.
         * @param angleRadians  The angle to rotate to in radians
         * @param time          The time it should take the actor to complete the rotation in milliseconds
         * @param rotationType  The [[RotationType]] to use for this rotation
         */
        rotateBy(angleRadians: number, time: number, rotationType?: RotationType): ActionContext;
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
         * This method will scale an actor to the specified size by a certain time
         * (in milliseconds) and return back the actor. This method is part of the
         * actor 'Action' fluent API allowing action chaining.
         * @param sizeX   The scaling factor to apply on X axis
         * @param sizeY   The scaling factor to apply on Y axis
         * @param time    The time it should take to complete the scaling in milliseconds
         */
        scaleBy(sizeX: number, sizeY: number, time: number): ActionContext;
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
         * @param time     The time it should take to fade the actor (in milliseconds)
         */
        fade(opacity: number, time: number): ActionContext;
        /**
         * This method will delay the next action from executing for a certain
         * amount of time (in milliseconds). This method is part of the actor
         * 'Action' fluent API allowing action chaining.
         * @param time  The amount of time to delay the next action in the queue from executing in milliseconds
         */
        delay(time: number): ActionContext;
        /**
         * This method will add an action to the queue that will remove the actor from the
         * scene once it has completed its previous actions. Any actions on the
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
         * This method will cause the actor to repeat all of the previously
         * called actions a certain number of times. If the number of repeats
         * is not specified it will repeat forever. This method is part of
         * the actor 'Action' fluent API allowing action chaining
         * @param times  The number of times to repeat all the previous actions in the action queue. If nothing is specified the actions
         * will repeat forever
         */
        repeat(times?: number): ActionContext;
        /**
         * This method will cause the actor to repeat all of the previously
         * called actions forever. This method is part of the actor 'Action'
         * fluent API allowing action chaining.
         */
        repeatForever(): ActionContext;
        /**
         * This method will cause the actor to follow another at a specified distance
         * @param actor           The actor to follow
         * @param followDistance  The distance to maintain when following, if not specified the actor will follow at the current distance.
         */
        follow(actor: Actor, followDistance?: number): ActionContext;
        /**
         * This method will cause the actor to move towards another until they
         * collide "meet" at a specified speed.
         * @param actor  The actor to meet
         * @param speed  The speed in pixels per second to move, if not specified it will match the speed of the other actor
         */
        meet(actor: Actor, speed?: number): ActionContext;
        /**
         * Returns a promise that resolves when the current action queue up to now
         * is finished.
         */
        asPromise<T>(): Promise<T>;
    }
}
declare module "Actions/IActionable" {
    import { ActionContext } from "Actions/ActionContext";
    export interface IActionable {
        actions: ActionContext;
    }
}
declare module "Group" {
    import { BoundingBox } from "Collision/BoundingBox";
    import { GameEvent } from "Events";
    import { Vector } from "Algebra";
    import { Scene } from "Scene";
    import { ActionContext } from "Actions/ActionContext";
    import { Actor } from "Actor";
    import { IEvented } from "Interfaces/IEvented";
    import { IActionable } from "Actions/IActionable";
    import { Class } from "Class";
    /**
     * Groups are used for logically grouping Actors so they can be acted upon
     * in bulk.
     *
     * [[include:Groups.md]]
     */
    export class Group extends Class implements IActionable, IEvented {
        name: string;
        scene: Scene;
        private _logger;
        private _members;
        actions: ActionContext;
        constructor(name: string, scene: Scene);
        add(actor: Actor): any;
        add(actors: Actor[]): any;
        remove(actor: Actor): void;
        move(vector: Vector): void;
        move(dx: number, dy: number): void;
        rotate(angle: number): void;
        on(eventName: string, handler: (event?: GameEvent) => void): void;
        off(eventName: string, handler?: (event?: GameEvent) => void): void;
        emit(topic: string, event?: GameEvent): void;
        contains(actor: Actor): boolean;
        getMembers(): Actor[];
        getRandomMember(): Actor;
        getBounds(): BoundingBox;
    }
}
declare module "Drawing/SpriteEffects" {
    /**
     * These effects can be applied to any bitmap image but are mainly used
     * for [[Sprite]] effects or [[Animation]] effects.
     *
     * [[include:SpriteEffects.md]]
     */
    /**
     * @typedoc
     */
    import { Color } from "Drawing/Color";
    /**
     * The interface that all sprite effects must implement
     */
    export interface ISpriteEffect {
        /**
         * Should update individual pixels values
         * @param x          The pixel's x coordinate
         * @param y          The pixel's y coordinate
         * @param imageData  The sprite's raw pixel data
         */
        updatePixel(x: number, y: number, imageData: ImageData): void;
    }
    /**
     * Applies the "Grayscale" effect to a sprite, removing color information.
     */
    export class Grayscale implements ISpriteEffect {
        updatePixel(x: number, y: number, imageData: ImageData): void;
    }
    /**
     * Applies the "Invert" effect to a sprite, inverting the pixel colors.
     */
    export class Invert implements ISpriteEffect {
        updatePixel(x: number, y: number, imageData: ImageData): void;
    }
    /**
     * Applies the "Opacity" effect to a sprite, setting the alpha of all pixels to a given value.
     */
    export class Opacity implements ISpriteEffect {
        opacity: number;
        /**
         * @param opacity  The new opacity of the sprite from 0-1.0
         */
        constructor(opacity: number);
        updatePixel(x: number, y: number, imageData: ImageData): void;
    }
    /**
     * Applies the "Colorize" effect to a sprite, changing the color channels of all the pixels to an
     * average of the original color and the provided color
     */
    export class Colorize implements ISpriteEffect {
        color: Color;
        /**
         * @param color  The color to apply to the sprite
         */
        constructor(color: Color);
        updatePixel(x: number, y: number, imageData: ImageData): void;
    }
    /**
     * Applies the "Lighten" effect to a sprite, changes the lightness of the color according to HSL
     */
    export class Lighten implements ISpriteEffect {
        factor: number;
        /**
         * @param factor  The factor of the effect between 0-1
         */
        constructor(factor?: number);
        updatePixel(x: number, y: number, imageData: ImageData): void;
    }
    /**
     * Applies the "Darken" effect to a sprite, changes the darkness of the color according to HSL
     */
    export class Darken implements ISpriteEffect {
        factor: number;
        /**
         * @param factor  The factor of the effect between 0-1
         */
        constructor(factor?: number);
        updatePixel(x: number, y: number, imageData: ImageData): void;
    }
    /**
     * Applies the "Saturate" effect to a sprite, saturates the color according to HSL
     */
    export class Saturate implements ISpriteEffect {
        factor: number;
        /**
         * @param factor  The factor of the effect between 0-1
         */
        constructor(factor?: number);
        updatePixel(x: number, y: number, imageData: ImageData): void;
    }
    /**
     * Applies the "Desaturate" effect to a sprite, desaturates the color according to HSL
     */
    export class Desaturate implements ISpriteEffect {
        factor: number;
        /**
         * @param factor  The factor of the effect between 0-1
         */
        constructor(factor?: number);
        updatePixel(x: number, y: number, imageData: ImageData): void;
    }
    /**
     * Applies the "Fill" effect to a sprite, changing the color channels of all non-transparent pixels to match
     * a given color
     */
    export class Fill implements ISpriteEffect {
        color: Color;
        /**
         * @param color  The color to apply to the sprite
         */
        constructor(color: Color);
        updatePixel(x: number, y: number, imageData: ImageData): void;
    }
}
declare module "Interfaces/IDrawable" {
    import { Vector } from "Algebra";
    import { ISpriteEffect } from "Drawing/SpriteEffects";
    /**
     * Interface for implementing anything in Excalibur that can be drawn to the screen.
     */
    export interface IDrawable {
        /**
         * Indicates whether the drawing is to be flipped vertically
         */
        flipVertical: boolean;
        /**
         * Indicates whether the drawing is to be flipped horizontally
         */
        flipHorizontal: boolean;
        /**
         * Indicates the current width of the drawing in pixels, factoring in the scale
         */
        width: number;
        /**
         * Indicates the current height of the drawing in pixels, factoring in the scale
         */
        height: number;
        /**
         * Indicates the natural width of the drawing in pixels, this is the original width of the source image
         */
        naturalWidth: number;
        /**
         * Indicates the natural height of the drawing in pixels, this is the original height of the source image
         */
        naturalHeight: number;
        /**
         * Adds a new [[ISpriteEffect]] to this drawing.
         * @param effect  Effect to add to the this drawing
         */
        addEffect(effect: ISpriteEffect): any;
        /**
         * Removes an effect [[ISpriteEffect]] from this drawing.
         * @param effect  Effect to remove from this drawing
         */
        removeEffect(effect: ISpriteEffect): any;
        /**
         * Removes an effect by index from this drawing.
         * @param index  Index of the effect to remove from this drawing
         */
        removeEffect(index: number): any;
        removeEffect(param: any): any;
        /**
         * Clears all effects from the drawing and return it to its original state.
         */
        clearEffects(): any;
        /**
         * Gets or sets the point about which to apply transformations to the drawing relative to the
         * top left corner of the drawing.
         */
        anchor: Vector;
        /**
         * Gets or sets the scale transformation
         */
        scale: Vector;
        /**
         * Sets the current rotation transformation for the drawing.
         */
        rotation: number;
        /**
         * Resets the internal state of the drawing (if any)
         */
        reset(): any;
        /**
         * Draws the sprite appropriately to the 2D rendering context.
         * @param ctx  The 2D rendering context
         * @param x    The x coordinate of where to draw
         * @param y    The y coordinate of where to draw
         */
        draw(ctx: CanvasRenderingContext2D, x: number, y: number): any;
    }
}
declare module "Interfaces/ILoadable" {
    import { Promise } from "Promises";
    import { Engine } from "Engine";
    /**
     * An interface describing loadable resources in Excalibur. Built-in loadable
     * resources include [[Texture]], [[Sound]], and a generic [[Resource]].
     *
     * [[include:Loadables.md]]
     */
    export interface ILoadable {
        /**
         * Begins loading the resource and returns a promise to be resolved on completion
         */
        load(): Promise<any>;
        /**
         * Gets the data that was loaded
         */
        getData(): any;
        /**
         * Sets the data (can be populated from remote request or in-memory data)
         */
        setData(data: any): void;
        /**
         * Processes the downloaded data. Meant to be overridden.
         */
        processData(data: any): any;
        /**
         * Wires engine into loadable to receive game level events
         */
        wireEngine(engine: Engine): void;
        /**
         * onprogress handler
         */
        onprogress: (e: any) => void;
        /**
         * oncomplete handler
         */
        oncomplete: () => void;
        /**
         * onerror handler
         */
        onerror: (e: any) => void;
        /**
         * Returns true if the loadable is loaded
         */
        isLoaded(): boolean;
    }
}
declare module "Resources/Resource" {
    import { ILoadable } from "Interfaces/ILoadable";
    import { Class } from "Class";
    import { Engine } from "Engine";
    import { Promise } from "Promises";
    import { Logger } from "Util/Log";
    /**
     * The [[Resource]] type allows games built in Excalibur to load generic resources.
     * For any type of remote resource it is recommended to use [[Resource]] for preloading.
     *
     * [[include:Resources.md]]
     */
    export class Resource<T> extends Class implements ILoadable {
        path: string;
        responseType: string;
        bustCache: boolean;
        data: T;
        logger: Logger;
        private _engine;
        /**
         * @param path          Path to the remote resource
         * @param responseType  The Content-Type to expect (e.g. `application/json`)
         * @param bustCache     Whether or not to cache-bust requests
         */
        constructor(path: string, responseType: string, bustCache?: boolean);
        /**
         * Returns true if the Resource is completely loaded and is ready
         * to be drawn.
         */
        isLoaded(): boolean;
        wireEngine(engine: Engine): void;
        private _cacheBust(uri);
        private _start(e);
        /**
         * Begin loading the resource and returns a promise to be resolved on completion
         */
        load(): Promise<T>;
        /**
         * Returns the loaded data once the resource is loaded
         */
        getData(): any;
        /**
         * Sets the data for this resource directly
         */
        setData(data: any): void;
        /**
         * This method is meant to be overriden to handle any additional
         * processing. Such as decoding downloaded audio bits.
         */
        processData(data: T): any;
        onprogress: (e: any) => void;
        oncomplete: () => void;
        onerror: (e: any) => void;
    }
}
declare module "Resources/Texture" {
    import { Resource } from "Resources/Resource";
    import { Promise } from "Promises";
    import { Sprite } from "Drawing/Sprite";
    /**
     * The [[Texture]] object allows games built in Excalibur to load image resources.
     * [[Texture]] is an [[ILoadable]] which means it can be passed to a [[Loader]]
     * to pre-load before starting a level or game.
     *
     * [[include:Textures.md]]
     */
    export class Texture extends Resource<HTMLImageElement> {
        path: string;
        bustCache: boolean;
        /**
         * The width of the texture in pixels
         */
        width: number;
        /**
         * The height of the texture in pixels
         */
        height: number;
        /**
         * A [[Promise]] that resolves when the Texture is loaded.
         */
        loaded: Promise<any>;
        private _isLoaded;
        private _sprite;
        /**
         * Populated once loading is complete
         */
        image: HTMLImageElement;
        private _progressCallback;
        private _doneCallback;
        private _errorCallback;
        /**
         * @param path       Path to the image resource
         * @param bustCache  Optionally load texture with cache busting
         */
        constructor(path: string, bustCache?: boolean);
        /**
         * Returns true if the Texture is completely loaded and is ready
         * to be drawn.
         */
        isLoaded(): boolean;
        /**
         * Begins loading the texture and returns a promise to be resolved on completion
         */
        load(): Promise<HTMLImageElement>;
        asSprite(): Sprite;
    }
}
declare module "Drawing/Sprite" {
    import * as Effects from "Drawing/SpriteEffects";
    import { Color } from "Drawing/Color";
    import { IDrawable } from "Interfaces/IDrawable";
    import { Texture } from "Resources/Texture";
    import { Vector } from "Algebra";
    import { Logger } from "Util/Log";
    /**
     * A [[Sprite]] is one of the main drawing primitives. It is responsible for drawing
     * images or parts of images from a [[Texture]] resource to the screen.
     *
     * [[include:Sprites.md]]
     */
    export class Sprite implements IDrawable {
        sx: number;
        sy: number;
        swidth: number;
        sheight: number;
        private _texture;
        rotation: number;
        anchor: Vector;
        scale: Vector;
        logger: Logger;
        /**
         * Draws the sprite flipped vertically
         */
        flipVertical: boolean;
        /**
         * Draws the sprite flipped horizontally
         */
        flipHorizontal: boolean;
        width: number;
        height: number;
        effects: Effects.ISpriteEffect[];
        internalImage: HTMLImageElement;
        naturalWidth: number;
        naturalHeight: number;
        private _spriteCanvas;
        private _spriteCtx;
        private _pixelData;
        private _pixelsLoaded;
        private _dirtyEffect;
        /**
         * @param image   The backing image texture to build the Sprite
         * @param sx      The x position of the sprite
         * @param sy      The y position of the sprite
         * @param swidth  The width of the sprite in pixels
         * @param sheight The height of the sprite in pixels
         */
        constructor(image: Texture, sx: number, sy: number, swidth: number, sheight: number);
        private _loadPixels();
        /**
         * Applies the [[Opacity]] effect to a sprite, setting the alpha of all pixels to a given value
         */
        opacity(value: number): void;
        /**
         * Applies the [[Grayscale]] effect to a sprite, removing color information.
         */
        grayscale(): void;
        /**
         * Applies the [[Invert]] effect to a sprite, inverting the pixel colors.
         */
        invert(): void;
        /**
         * Applies the [[Fill]] effect to a sprite, changing the color channels of all non-transparent pixels to match a given color
         */
        fill(color: Color): void;
        /**
         * Applies the [[Colorize]] effect to a sprite, changing the color channels of all pixels to be the average of the original color
         * and the provided color.
         */
        colorize(color: Color): void;
        /**
         * Applies the [[Lighten]] effect to a sprite, changes the lightness of the color according to HSL
         */
        lighten(factor?: number): void;
        /**
         * Applies the [[Darken]] effect to a sprite, changes the darkness of the color according to HSL
         */
        darken(factor?: number): void;
        /**
         * Applies the [[Saturate]] effect to a sprite, saturates the color according to HSL
         */
        saturate(factor?: number): void;
        /**
         * Applies the [[Desaturate]] effect to a sprite, desaturates the color according to HSL
         */
        desaturate(factor?: number): void;
        /**
         * Adds a new [[ISpriteEffect]] to this drawing.
         * @param effect  Effect to add to the this drawing
         */
        addEffect(effect: Effects.ISpriteEffect): void;
        /**
         * Removes a [[ISpriteEffect]] from this sprite.
         * @param effect  Effect to remove from this sprite
         */
        removeEffect(effect: Effects.ISpriteEffect): void;
        /**
         * Removes an effect given the index from this sprite.
         * @param index  Index of the effect to remove from this sprite
         */
        removeEffect(index: number): void;
        private _applyEffects();
        /**
         * Clears all effects from the drawing and return it to its original state.
         */
        clearEffects(): void;
        /**
         * Resets the internal state of the drawing (if any)
         */
        reset(): void;
        debugDraw(ctx: CanvasRenderingContext2D, x: number, y: number): void;
        /**
         * Draws the sprite appropriately to the 2D rendering context, at an x and y coordinate.
         * @param ctx  The 2D rendering context
         * @param x    The x coordinate of where to draw
         * @param y    The y coordinate of where to draw
         */
        draw(ctx: CanvasRenderingContext2D, x: number, y: number): void;
        /**
         * Produces a copy of the current sprite
         */
        clone(): Sprite;
    }
}
declare module "Drawing/Animation" {
    import { Sprite } from "Drawing/Sprite";
    import * as Effects from "Drawing/SpriteEffects";
    import { Color } from "Drawing/Color";
    import { IDrawable } from "Interfaces/IDrawable";
    import { Vector } from "Algebra";
    import { Engine } from "Engine";
    /**
     * Animations allow you to display a series of images one after another,
     * creating the illusion of change. Generally these images will come from a [[SpriteSheet]] source.
     *
     * [[include:Animations.md]]
     */
    export class Animation implements IDrawable {
        /**
         * The sprite frames to play, in order. See [[SpriteSheet.getAnimationForAll]] to quickly
         * generate an [[Animation]].
         */
        sprites: Sprite[];
        /**
         * Duration to show each frame (in milliseconds)
         */
        speed: number;
        /**
         * Current frame index being shown
         */
        currentFrame: number;
        private _oldTime;
        anchor: Vector;
        rotation: number;
        scale: Vector;
        /**
         * Indicates whether the animation should loop after it is completed
         */
        loop: boolean;
        /**
         * Indicates the frame index the animation should freeze on for a non-looping
         * animation. By default it is the last frame.
         */
        freezeFrame: number;
        private _engine;
        /**
         * Flip each frame vertically. Sets [[Sprite.flipVertical]].
         */
        flipVertical: boolean;
        /**
         * Flip each frame horizontally. Sets [[Sprite.flipHorizontal]].
         */
        flipHorizontal: boolean;
        width: number;
        height: number;
        naturalWidth: number;
        naturalHeight: number;
        /**
         * Typically you will use a [[SpriteSheet]] to generate an [[Animation]].
         *
         * @param engine  Reference to the current game engine
         * @param images  An array of sprites to create the frames for the animation
         * @param speed   The number in milliseconds to display each frame in the animation
         * @param loop    Indicates whether the animation should loop after it is completed
         */
        constructor(engine: Engine, images: Sprite[], speed: number, loop?: boolean);
        /**
         * Applies the opacity effect to a sprite, setting the alpha of all pixels to a given value
         */
        opacity(value: number): void;
        /**
         * Applies the grayscale effect to a sprite, removing color information.
         */
        grayscale(): void;
        /**
         * Applies the invert effect to a sprite, inverting the pixel colors.
         */
        invert(): void;
        /**
         * Applies the fill effect to a sprite, changing the color channels of all non-transparent pixels to match a given color
         */
        fill(color: Color): void;
        /**
         * Applies the colorize effect to a sprite, changing the color channels of all pixels to be the average of the original color and the
         * provided color.
         */
        colorize(color: Color): void;
        /**
         * Applies the lighten effect to a sprite, changes the lightness of the color according to hsl
         */
        lighten(factor?: number): void;
        /**
         * Applies the darken effect to a sprite, changes the darkness of the color according to hsl
         */
        darken(factor?: number): void;
        /**
         * Applies the saturate effect to a sprite, saturates the color according to hsl
         */
        saturate(factor?: number): void;
        /**
         * Applies the desaturate effect to a sprite, desaturates the color according to hsl
         */
        desaturate(factor?: number): void;
        /**
         * Add a [[ISpriteEffect]] manually
         */
        addEffect(effect: Effects.ISpriteEffect): void;
        /**
         * Removes an [[ISpriteEffect]] from this animation.
         * @param effect Effect to remove from this animation
         */
        removeEffect(effect: Effects.ISpriteEffect): void;
        /**
         * Removes an effect given the index from this animation.
         * @param index  Index of the effect to remove from this animation
         */
        removeEffect(index: number): void;
        /**
         * Clear all sprite effects
         */
        clearEffects(): void;
        private _setAnchor(point);
        private _setRotation(radians);
        private _setScale(scale);
        /**
         * Resets the animation to first frame.
         */
        reset(): void;
        /**
         * Indicates whether the animation is complete, animations that loop are never complete.
         */
        isDone(): boolean;
        /**
         * Not meant to be called by game developers. Ticks the animation forward internally and
         * calculates whether to change to the frame.
         * @internal
         */
        tick(): void;
        private _updateValues();
        /**
         * Skips ahead a specified number of frames in the animation
         * @param frames  Frames to skip ahead
         */
        skip(frames: number): void;
        draw(ctx: CanvasRenderingContext2D, x: number, y: number): void;
        /**
         * Plays an animation at an arbitrary location in the game.
         * @param x  The x position in the game to play
         * @param y  The y position in the game to play
         */
        play(x: number, y: number): void;
    }
}
declare module "Drawing/SpriteSheet" {
    import { Sprite } from "Drawing/Sprite";
    import { Animation } from "Drawing/Animation";
    import { Color } from "Drawing/Color";
    import { Texture } from "Resources/Texture";
    import { Engine } from "Engine";
    import { TextAlign, BaseAlign } from "Label";
    /**
     * Sprite sheets are a useful mechanism for slicing up image resources into
     * separate sprites or for generating in game animations. [[Sprite|Sprites]] are organized
     * in row major order in the [[SpriteSheet]].
     *
     * [[include:SpriteSheets.md]]
     */
    export class SpriteSheet {
        image: Texture;
        private columns;
        private rows;
        sprites: Sprite[];
        private _internalImage;
        /**
         * @param image     The backing image texture to build the SpriteSheet
         * @param columns   The number of columns in the image texture
         * @param rows      The number of rows in the image texture
         * @param spWidth   The width of each individual sprite in pixels
         * @param spHeight  The height of each individual sprite in pixels
         */
        constructor(image: Texture, columns: number, rows: number, spWidth: number, spHeight: number);
        /**
         * Create an animation from the this SpriteSheet by listing out the
         * sprite indices. Sprites are organized in row major order in the SpriteSheet.
         * @param engine   Reference to the current game [[Engine]]
         * @param indices  An array of sprite indices to use in the animation
         * @param speed    The number in milliseconds to display each frame in the animation
         */
        getAnimationByIndices(engine: Engine, indices: number[], speed: number): Animation;
        /**
         * Create an animation from the this SpriteSheet by specifing the range of
         * images with the beginning and ending index
         * @param engine      Reference to the current game Engine
         * @param beginIndex  The index to start taking frames
         * @param endIndex    The index to stop taking frames
         * @param speed       The number in milliseconds to display each frame in the animation
         */
        getAnimationBetween(engine: Engine, beginIndex: number, endIndex: number, speed: number): Animation;
        /**
         * Treat the entire SpriteSheet as one animation, organizing the frames in
         * row major order.
         * @param engine  Reference to the current game [[Engine]]
         * @param speed   The number in milliseconds to display each frame the animation
         */
        getAnimationForAll(engine: Engine, speed: number): Animation;
        /**
         * Retreive a specific sprite from the SpriteSheet by its index. Sprites are organized
         * in row major order in the SpriteSheet.
         * @param index  The index of the sprite
         */
        getSprite(index: number): Sprite;
    }
    /**
     * Sprite fonts are a used in conjunction with a [[Label]] to specify
     * a particular bitmap as a font. Note that some font features are not
     * supported by Sprite fonts.
     *
     * [[include:SpriteFonts.md]]
     */
    export class SpriteFont extends SpriteSheet {
        image: Texture;
        private alphabet;
        private caseInsensitive;
        spWidth: number;
        spHeight: number;
        private _spriteLookup;
        private _colorLookup;
        private _currentColor;
        private _currentOpacity;
        private _sprites;
        private _textShadowOn;
        private _textShadowDirty;
        private _textShadowColor;
        private _textShadowSprites;
        private _shadowOffsetX;
        private _shadowOffsetY;
        /**
         * @param image           The backing image texture to build the SpriteFont
         * @param alphabet        A string representing all the characters in the image, in row major order.
         * @param caseInsensitive  Indicate whether this font takes case into account
         * @param columns         The number of columns of characters in the image
         * @param rows            The number of rows of characters in the image
         * @param spWidth         The width of each character in pixels
         * @param spHeight        The height of each character in pixels
         */
        constructor(image: Texture, alphabet: string, caseInsensitive: boolean, columns: number, rows: number, spWidth: number, spHeight: number);
        /**
         * Returns a dictionary that maps each character in the alphabet to the appropriate [[Sprite]].
         */
        getTextSprites(): {
            [key: string]: Sprite;
        };
        /**
         * Sets the text shadow for sprite fonts
         * @param offsetX      The x offset in pixels to place the shadow
         * @param offsetY      The y offset in pixels to place the shadow
         * @param shadowColor  The color of the text shadow
         */
        setTextShadow(offsetX: number, offsetY: number, shadowColor: Color): void;
        /**
         * Toggles text shadows on or off
         */
        useTextShadow(on: boolean): void;
        /**
         * Draws the current sprite font
         */
        draw(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, options: ISpriteFontOptions): void;
        private _parseOptions(options);
    }
    /**
     * Specify various font attributes for sprite fonts
     */
    export interface ISpriteFontOptions {
        color?: Color;
        opacity?: number;
        fontSize?: number;
        letterSpacing?: number;
        textAlign?: TextAlign;
        baseAlign?: BaseAlign;
        maxWidth?: number;
    }
}
declare module "Label" {
    import { Engine } from "Engine";
    import { Color } from "Drawing/Color";
    import { SpriteFont } from "Drawing/SpriteSheet";
    import { Actor } from "Actor";
    /**
     * Enum representing the different font size units
     * https://developer.mozilla.org/en-US/docs/Web/CSS/font-size
     */
    export enum FontUnit {
        /**
         * Em is a scalable unit, 1 em is equal to the current font size of the current element, parent elements can effect em values
         */
        Em = 0,
        /**
         * Rem is similar to the Em, it is a scalable unit. 1 rem is eqaul to the font size of the root element
         */
        Rem = 1,
        /**
         * Pixel is a unit of length in screen pixels
         */
        Px = 2,
        /**
         * Point is a physical unit length (1/72 of an inch)
         */
        Pt = 3,
        /**
         * Percent is a scalable unit similar to Em, the only difference is the Em units scale faster when Text-Size stuff
         */
        Percent = 4,
    }
    /**
     * Enum representing the different horizontal text alignments
     */
    export enum TextAlign {
        /**
         * The text is left-aligned.
         */
        Left = 0,
        /**
         * The text is right-aligned.
         */
        Right = 1,
        /**
         * The text is centered.
         */
        Center = 2,
        /**
         * The text is aligned at the normal start of the line (left-aligned for left-to-right locales,
         * right-aligned for right-to-left locales).
         */
        Start = 3,
        /**
         * The text is aligned at the normal end of the line (right-aligned for left-to-right locales,
         * left-aligned for right-to-left locales).
         */
        End = 4,
    }
    /**
     * Enum representing the different baseline text alignments
     */
    export enum BaseAlign {
        /**
         * The text baseline is the top of the em square.
         */
        Top = 0,
        /**
         * The text baseline is the hanging baseline.  Currently unsupported; this will act like
         * alphabetic.
         */
        Hanging = 1,
        /**
         * The text baseline is the middle of the em square.
         */
        Middle = 2,
        /**
         * The text baseline is the normal alphabetic baseline.
         */
        Alphabetic = 3,
        /**
         * The text baseline is the ideographic baseline; this is the bottom of
         * the body of the characters, if the main body of characters protrudes
         * beneath the alphabetic baseline.  Currently unsupported; this will
         * act like alphabetic.
         */
        Ideographic = 4,
        /**
         * The text baseline is the bottom of the bounding box.  This differs
         * from the ideographic baseline in that the ideographic baseline
         * doesn't consider descenders.
         */
        Bottom = 5,
    }
    /**
     * Labels are the way to draw small amounts of text to the screen. They are
     * actors and inherit all of the benefits and capabilities.
     *
     * [[include:Labels.md]]
     */
    export class Label extends Actor {
        /**
         * The text to draw.
         */
        text: string;
        /**
         * The [[SpriteFont]] to use, if any. Overrides [[fontFamily]] if present.
         */
        spriteFont: SpriteFont;
        /**
         * The CSS font family string (e.g. `sans-serif`, `Droid Sans Pro`). Web fonts
         * are supported, same as in CSS.
         */
        fontFamily: string;
        /**
         * The font size in the selected units, default is 10 (default units is pixel)
         */
        fontSize: number;
        /**
         * The css units for a font size such as px, pt, em (SpriteFont only support px), by default is 'px';
         */
        fontUnit: FontUnit;
        /**
         * Gets or sets the horizontal text alignment property for the label.
         */
        textAlign: TextAlign;
        /**
         * Gets or sets the baseline alignment property for the label.
         */
        baseAlign: BaseAlign;
        /**
         * Gets or sets the maximum width (in pixels) that the label should occupy
         */
        maxWidth: number;
        /**
         * Gets or sets the letter spacing on a Label. Only supported with Sprite Fonts.
         */
        letterSpacing: number;
        /**
         * Whether or not the [[SpriteFont]] will be case-sensitive when matching characters.
         */
        caseInsensitive: boolean;
        private _textShadowOn;
        private _shadowOffsetX;
        private _shadowOffsetY;
        private _shadowColor;
        private _shadowColorDirty;
        private _textSprites;
        private _shadowSprites;
        private _color;
        /**
         * @param text        The text of the label
         * @param x           The x position of the label
         * @param y           The y position of the label
         * @param fontFamily  Use any valid CSS font string for the label's font. Web fonts are supported. Default is `10px sans-serif`.
         * @param spriteFont  Use an Excalibur sprite font for the label's font, if a SpriteFont is provided it will take precedence
         * over a css font.
         */
        constructor(text?: string, x?: number, y?: number, fontFamily?: string, spriteFont?: SpriteFont);
        /**
         * Returns the width of the text in the label (in pixels);
         * @param ctx  Rendering context to measure the string with
         */
        getTextWidth(ctx: CanvasRenderingContext2D): number;
        private _lookupFontUnit(fontUnit);
        private _lookupTextAlign(textAlign);
        private _lookupBaseAlign(baseAlign);
        /**
         * Sets the text shadow for sprite fonts
         * @param offsetX      The x offset in pixels to place the shadow
         * @param offsetY      The y offset in pixels to place the shadow
         * @param shadowColor  The color of the text shadow
         */
        setTextShadow(offsetX: number, offsetY: number, shadowColor: Color): void;
        /**
         * Toggles text shadows on or off, only applies when using sprite fonts
         */
        useTextShadow(on: boolean): void;
        /**
         * Clears the current text shadow
         */
        clearTextShadow(): void;
        update(engine: Engine, delta: number): void;
        draw(ctx: CanvasRenderingContext2D, delta: number): void;
        private _fontDraw(ctx, delta, sprites);
        protected readonly _fontString: string;
        debugDraw(ctx: CanvasRenderingContext2D): void;
    }
}
declare module "Interfaces/IAudio" {
    import { Promise } from "Promises";
    /**
     * Represents an audio control implementation
     */
    export interface IAudio {
        /**
         * Set the volume (between 0 and 1)
         */
        setVolume(volume: number): any;
        /**
         * Set whether the audio should loop (repeat forever)
         */
        setLoop(loop: boolean): any;
        /**
         * Whether or not any audio is playing
         */
        isPlaying(): boolean;
        /**
         * Will play the sound or resume if paused
         */
        play(): Promise<any>;
        /**
         * Pause the sound
         */
        pause(): any;
        /**
         * Stop playing the sound and reset
         */
        stop(): any;
    }
}
declare module "Interfaces/IAudioImplementation" {
    import { Promise } from "Promises";
    import { IAudio } from "Interfaces/IAudio";
    /**
     * Represents an audio implementation like [[AudioTag]] or [[WebAudio]]
     */
    export interface IAudioImplementation {
        /**
         * XHR response type
         */
        responseType: string;
        /**
         * Processes raw data and transforms into sound data
         */
        processData(data: Blob | ArrayBuffer): Promise<string | AudioBuffer>;
        /**
         * Factory method that returns an instance of a played audio track
         */
        createInstance(data: string | AudioBuffer): IAudio;
    }
}
declare module "Resources/Sound" {
    import { ILoadable } from "Interfaces/ILoadable";
    import { IAudioImplementation } from "Interfaces/IAudioImplementation";
    import { IAudio } from "Interfaces/IAudio";
    import { Engine } from "Engine";
    import { Promise } from "Promises";
    /**
     * An audio implementation for HTML5 audio.
     */
    export class AudioTag implements IAudioImplementation {
        responseType: string;
        /**
         * Transforms raw Blob data into a object URL for use in audio tag
         */
        processData(data: Blob): Promise<string>;
        /**
         * Creates a new instance of an audio tag referencing the provided audio URL
         */
        createInstance(url: string): IAudio;
    }
    /**
     * An audio implementation for Web Audio API.
     */
    export class WebAudio implements IAudioImplementation {
        private _logger;
        responseType: string;
        /**
         * Processes raw arraybuffer data and decodes into WebAudio buffer (async).
         */
        processData(data: ArrayBuffer): Promise<AudioBuffer>;
        /**
         * Creates a new WebAudio AudioBufferSourceNode to play a sound instance
         */
        createInstance(buffer: AudioBuffer): IAudio;
        private static _unlocked;
        /**
         * Play an empty sound to unlock Safari WebAudio context. Call this function
         * right after a user interaction event. Typically used by [[PauseAfterLoader]]
         * @source https://paulbakaus.com/tutorials/html5/web-audio-on-ios/
         */
        static unlock(): void;
        static isUnlocked(): boolean;
    }
    /**
     * Factory method that gets the audio implementation to use
     */
    export function getAudioImplementation(): IAudioImplementation;
    /**
     * The [[Sound]] object allows games built in Excalibur to load audio
     * components, from soundtracks to sound effects. [[Sound]] is an [[ILoadable]]
     * which means it can be passed to a [[Loader]] to pre-load before a game or level.
     *
     * [[include:Sounds.md]]
     */
    export class Sound implements ILoadable, IAudio {
        private _logger;
        private _data;
        private _tracks;
        private _isLoaded;
        private _isPaused;
        private _loop;
        private _volume;
        path: string;
        onprogress: (e: any) => void;
        oncomplete: () => void;
        onerror: (e: any) => void;
        private _engine;
        private _wasPlayingOnHidden;
        /**
         * Populated once loading is complete
         */
        sound: IAudioImplementation;
        /**
         * Whether or not the browser can play this file as HTML5 Audio
         */
        static canPlayFile(file: string): boolean;
        /**
         * @param paths A list of audio sources (clip.wav, clip.mp3, clip.ogg) for this audio clip. This is done for browser compatibility.
         */
        constructor(...paths: string[]);
        wireEngine(engine: Engine): void;
        /**
         * Returns how many instances of the sound are currently playing
         */
        instanceCount(): number;
        /**
         * Sets the volume of the sound clip
         * @param volume  A volume value between 0-1.0
         */
        setVolume(volume: number): void;
        /**
         * Indicates whether the clip should loop when complete
         * @param loop  Set the looping flag
         */
        setLoop(loop: boolean): void;
        /**
         * Whether or not the sound is playing right now
         */
        isPlaying(): boolean;
        /**
         * Play the sound, returns a promise that resolves when the sound is done playing
         */
        play(): Promise<boolean>;
        /**
         * Stop the sound, and do not rewind
         */
        pause(): void;
        /**
         * Stop the sound and rewind
         */
        stop(): void;
        /**
         * Returns true if the sound is loaded
         */
        isLoaded(): boolean;
        /**
         * Begins loading the sound and returns a promise to be resolved on completion
         */
        load(): Promise<IAudioImplementation>;
        private _fetchResource(onload);
        /**
         * Gets the raw sound data (e.g. blob URL or AudioBuffer)
         */
        getData(): any;
        /**
         * Sets raw sound data and returns a Promise that is resolved when sound data is processed
         *
         * @param data The XHR data for the sound implementation to process (Blob or ArrayBuffer)
         */
        setData(data: any): Promise<any>;
        /**
         * Set the raw sound data (e.g. blob URL or AudioBuffer)
         */
        processData(data: any): any;
    }
}
declare module "Interfaces/ILoader" {
    import { ILoadable } from "Interfaces/ILoadable";
    import { Engine } from "Engine";
    export interface ILoader extends ILoadable {
        draw(ctx: CanvasRenderingContext2D, delta: number): any;
        update(engine: Engine, delta: number): any;
    }
}
declare module "Loader" {
    import { Promise } from "Promises";
    import { Engine } from "Engine";
    import { ILoadable } from "Interfaces/ILoadable";
    import { ILoader } from "Interfaces/ILoader";
    import { Class } from "Class";
    /**
     * Pre-loading assets
     *
     * The loader provides a mechanism to preload multiple resources at
     * one time. The loader must be passed to the engine in order to
     * trigger the loading progress bar.
     *
     * The [[Loader]] itself implements [[ILoadable]] so you can load loaders.
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
     */
    export class Loader extends Class implements ILoader {
        private _resourceList;
        private _index;
        private _resourceCount;
        private _numLoaded;
        private _progressCounts;
        private _totalCounts;
        private _engine;
        logo: string;
        logoWidth: number;
        logoHeight: number;
        backgroundColor: string;
        protected _imageElement: HTMLImageElement;
        protected readonly _image: HTMLImageElement;
        /**
         * @param loadables  Optionally provide the list of resources you want to load at constructor time
         */
        constructor(loadables?: ILoadable[]);
        wireEngine(engine: Engine): void;
        /**
         * Add a resource to the loader to load
         * @param loadable  Resource to add
         */
        addResource(loadable: ILoadable): void;
        /**
         * Add a list of resources to the loader to load
         * @param loadables  The list of resources to load
         */
        addResources(loadables: ILoadable[]): void;
        private _sumCounts(obj);
        /**
         * Returns true if the loader has completely loaded all resources
         */
        isLoaded(): boolean;
        /**
         * Begin loading all of the supplied resources, returning a promise
         * that resolves when loading of all is complete
         */
        load(): Promise<any>;
        /**
         * Loader draw function. Draws the default Excalibur loading screen.
         * Override `logo`, `logoWidth`, `logoHeight` and `backgroundColor` properties
         * to customize the drawing, or just override entire method.
         */
        draw(ctx: CanvasRenderingContext2D, delta: number): void;
        /**
         * Perform any calculations or logic in the `update` method. The default `Loader` does not
         * do anything in this method so it is safe to override.
         */
        update(engine: Engine, delta: number): void;
        getData: () => any;
        setData: (data: any) => any;
        processData: (data: any) => any;
        onprogress: (e: any) => void;
        oncomplete: () => void;
        onerror: () => void;
    }
    /**
     * A [[Loader]] that pauses after loading to allow user
     * to proceed to play the game. Typically you will
     * want to use this loader for iOS to allow sounds
     * to play after loading (Apple Safari requires user
     * interaction to allow sounds, even for games)
     *
     * **Note:** Because Loader is not part of a Scene, you must
     * call `update` and `draw` manually on "child" objects.
     *
     * ## Implementing a Trigger
     *
     * The `PauseAfterLoader` requires an element to act as the trigger button
     * to start the game.
     *
     * For example, let's create an `<a>` tag to be our trigger and call it `tap-to-play`.
     *
     * ```html
     * <div id="wrapper">
     *    <canvas id="game"></canvas>
     *    <a id="tap-to-play" href='javascript:void(0);'>Tap to Play</a>
     * </div>
     * ```
     *
     * We've put it inside a wrapper to position it properly over the game canvas.
     *
     * Now let's add some CSS to style it (insert into `<head>`):
     *
     * ```html
     * <style>
     *     #wrapper {
     *         position: relative;
     *         width: 500px;
     *         height: 500px;
     *     }
     *     #tap-to-play {
     *         display: none;
     *         font-size: 24px;
     *         font-family: sans-serif;
     *         text-align: center;
     *         border: 3px solid white;
     *         position: absolute;
     *         color: white;
     *         width: 200px;
     *         height: 50px;
     *         line-height: 50px;
     *         text-decoration: none;
     *         left: 147px;
     *         top: 80%;
     *     }
     * </style>
     * ```
     *
     * Now we can create a `PauseAfterLoader` with a reference to our trigger button:
     *
     * ```ts
     * var loader = new ex.PauseAfterLoader('tap-to-play', [...]);
     * ```
     *
     * ## Use PauseAfterLoader for iOS
     *
     * The primary use case for pausing before starting the game is to
     * pass Apple's requirement of user interaction. The Web Audio context
     * in Safari is disabled by default until user interaction.
     *
     * Therefore, you can use this snippet to only use PauseAfterLoader when
     * iOS is detected (see [this thread](http://stackoverflow.com/questions/9038625/detect-if-device-is-ios)
     * for more techniques).
     *
     * ```ts
     * var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(<any>window).MSStream;
     * var loader: ex.Loader = iOS ? new ex.PauseAfterLoader('tap-to-play') : new ex.Loader();
     *
     * loader.addResource(...);
     * ```
     */
    export class PauseAfterLoader extends Loader {
        private _loaded;
        private _loadedValue;
        private _waitPromise;
        private _playTrigger;
        constructor(triggerElementId: string, loadables?: ILoadable[]);
        load(): Promise<any>;
        private _handleOnTrigger;
    }
}
declare module "Interfaces/IActorTrait" {
    import { Actor } from "Actor";
    import { Engine } from "Engine";
    /**
     * An interface describing actor update pipeline traits
     */
    export interface IActorTrait {
        update(actor: Actor, engine: Engine, delta: number): void;
    }
}
declare module "Traits/CapturePointer" {
    import { IActorTrait } from "Interfaces/IActorTrait";
    import { Actor } from "Actor";
    import { Engine } from "Engine";
    export interface ICapturePointerConfig {
        /**
         * Capture PointerMove events (may be expensive!)
         */
        captureMoveEvents: boolean;
    }
    /**
     * Propogates pointer events to the actor
     */
    export class CapturePointer implements IActorTrait {
        update(actor: Actor, engine: Engine, delta: number): void;
    }
}
declare module "Traits/EulerMovement" {
    import { IActorTrait } from "Interfaces/IActorTrait";
    import { Actor } from "Actor";
    import { Engine } from "Engine";
    export class EulerMovement implements IActorTrait {
        update(actor: Actor, engine: Engine, delta: number): void;
    }
}
declare module "Util/CullingBox" {
    import { Actor } from "Actor";
    import { Engine } from "Engine";
    export class CullingBox {
        private _topLeft;
        private _topRight;
        private _bottomLeft;
        private _bottomRight;
        private _xCoords;
        private _yCoords;
        private _xMin;
        private _yMin;
        private _xMax;
        private _yMax;
        private _xMinWorld;
        private _yMinWorld;
        private _xMaxWorld;
        private _yMaxWorld;
        isSpriteOffScreen(actor: Actor, engine: Engine): boolean;
        debugDraw(ctx: CanvasRenderingContext2D): void;
    }
}
declare module "Traits/OffscreenCulling" {
    import { CullingBox } from "Util/CullingBox";
    import { IActorTrait } from "Interfaces/IActorTrait";
    import { Actor } from "Actor";
    import { Engine } from "Engine";
    export class OffscreenCulling implements IActorTrait {
        cullingBox: CullingBox;
        update(actor: Actor, engine: Engine, delta: number): void;
    }
}
declare module "Traits/TileMapCollisionDetection" {
    import { IActorTrait } from "Interfaces/IActorTrait";
    import { Actor } from "Actor";
    import { Engine } from "Engine";
    export class TileMapCollisionDetection implements IActorTrait {
        update(actor: Actor, engine: Engine, delta: number): void;
    }
}
declare module "Traits/Index" {
    export * from "Traits/CapturePointer";
    export * from "Traits/EulerMovement";
    export * from "Traits/OffscreenCulling";
    export * from "Traits/TileMapCollisionDetection";
}
declare module "Particles" {
    import { Engine } from "Engine";
    import { Actor } from "Actor";
    import { Sprite } from "Drawing/Sprite";
    import { Color } from "Drawing/Color";
    import { Vector } from "Algebra";
    import * as Util from "Util/Util";
    /**
     * An enum that represents the types of emitter nozzles
     */
    export enum EmitterType {
        /**
         * Constant for the circular emitter type
         */
        Circle = 0,
        /**
         * Constant for the rectangular emitter type
         */
        Rectangle = 1,
    }
    /**
     * Particle is used in a [[ParticleEmitter]]
     */
    export class Particle {
        position: Vector;
        velocity: Vector;
        acceleration: Vector;
        particleRotationalVelocity: number;
        currentRotation: number;
        focus: Vector;
        focusAccel: number;
        opacity: number;
        beginColor: Color;
        endColor: Color;
        life: number;
        fadeFlag: boolean;
        private _rRate;
        private _gRate;
        private _bRate;
        private _aRate;
        private _currentColor;
        emitter: ParticleEmitter;
        particleSize: number;
        particleSprite: Sprite;
        startSize: number;
        endSize: number;
        sizeRate: number;
        elapsedMultiplier: number;
        constructor(emitter: ParticleEmitter, life?: number, opacity?: number, beginColor?: Color, endColor?: Color, position?: Vector, velocity?: Vector, acceleration?: Vector, startSize?: number, endSize?: number);
        kill(): void;
        update(delta: number): void;
        draw(ctx: CanvasRenderingContext2D): void;
    }
    /**
     * Using a particle emitter is a great way to create interesting effects
     * in your game, like smoke, fire, water, explosions, etc. `ParticleEmitter`
     * extend [[Actor]] allowing you to use all of the features that come with.
     *
     * [[include:Particles.md]]
     */
    export class ParticleEmitter extends Actor {
        private _particlesToEmit;
        numParticles: number;
        /**
         * Gets or sets the isEmitting flag
         */
        isEmitting: boolean;
        /**
         * Gets or sets the backing particle collection
         */
        particles: Util.Collection<Particle>;
        /**
         * Gets or sets the backing deadParticle collection
         */
        deadParticles: Util.Collection<Particle>;
        /**
         * Gets or sets the minimum particle velocity
         */
        minVel: number;
        /**
         * Gets or sets the maximum particle velocity
         */
        maxVel: number;
        /**
         * Gets or sets the acceleration vector for all particles
         */
        acceleration: Vector;
        /**
         * Gets or sets the minimum angle in radians
         */
        minAngle: number;
        /**
         * Gets or sets the maximum angle in radians
         */
        maxAngle: number;
        /**
         * Gets or sets the emission rate for particles (particles/sec)
         */
        emitRate: number;
        /**
         * Gets or sets the life of each particle in milliseconds
         */
        particleLife: number;
        /**
         * Gets or sets the opacity of each particle from 0 to 1.0
         */
        opacity: number;
        /**
         * Gets or sets the fade flag which causes particles to gradually fade out over the course of their life.
         */
        fadeFlag: boolean;
        /**
         * Gets or sets the optional focus where all particles should accelerate towards
         */
        focus: Vector;
        /**
         * Gets or sets the acceleration for focusing particles if a focus has been specified
         */
        focusAccel: number;
        startSize: number;
        endSize: number;
        /**
         * Gets or sets the minimum size of all particles
         */
        minSize: number;
        /**
         * Gets or sets the maximum size of all particles
         */
        maxSize: number;
        /**
         * Gets or sets the beginning color of all particles
         */
        beginColor: Color;
        /**
         * Gets or sets the ending color of all particles
         */
        endColor: Color;
        /**
         * Gets or sets the sprite that a particle should use
         * @warning Performance intensive
         */
        particleSprite: Sprite;
        /**
         * Gets or sets the emitter type for the particle emitter
         */
        emitterType: EmitterType;
        /**
         * Gets or sets the emitter radius, only takes effect when the [[emitterType]] is [[EmitterType.Circle]]
         */
        radius: number;
        /**
         * Gets or sets the particle rotational speed velocity
         */
        particleRotationalVelocity: number;
        /**
         * Indicates whether particles should start with a random rotation
         */
        randomRotation: boolean;
        /**
         * @param x       The x position of the emitter
         * @param y       The y position of the emitter
         * @param width   The width of the emitter
         * @param height  The height of the emitter
         */
        constructor(x?: number, y?: number, width?: number, height?: number);
        removeParticle(particle: Particle): void;
        /**
         * Causes the emitter to emit particles
         * @param particleCount  Number of particles to emit right now
         */
        emitParticles(particleCount: number): void;
        clearParticles(): void;
        private _createParticle();
        update(engine: Engine, delta: number): void;
        draw(ctx: CanvasRenderingContext2D, delta: number): void;
        debugDraw(ctx: CanvasRenderingContext2D): void;
    }
}
declare module "TileMap" {
    import { BoundingBox } from "Collision/BoundingBox";
    import { Class } from "Class";
    import { Engine } from "Engine";
    import { Vector } from "Algebra";
    import { Actor } from "Actor";
    import { Logger } from "Util/Log";
    import { SpriteSheet } from "Drawing/SpriteSheet";
    import * as Events from "Events";
    /**
     * The [[TileMap]] class provides a lightweight way to do large complex scenes with collision
     * without the overhead of actors.
     *
     * [[include:TileMaps.md]]
     */
    export class TileMap extends Class {
        x: number;
        y: number;
        cellWidth: number;
        cellHeight: number;
        rows: number;
        cols: number;
        private _collidingX;
        private _collidingY;
        private _onScreenXStart;
        private _onScreenXEnd;
        private _onScreenYStart;
        private _onScreenYEnd;
        private _spriteSheets;
        logger: Logger;
        data: Cell[];
        on(eventName: Events.preupdate, handler: (event?: Events.PreUpdateEvent) => void): any;
        on(eventName: Events.postupdate, handler: (event?: Events.PostUpdateEvent) => void): any;
        on(eventName: Events.predraw, handler: (event?: Events.PreDrawEvent) => void): any;
        on(eventName: Events.postdraw, handler: (event?: Events.PostDrawEvent) => void): any;
        on(eventName: string, handler: (event?: Events.GameEvent) => void): any;
        /**
         * @param x             The x coordinate to anchor the TileMap's upper left corner (should not be changed once set)
         * @param y             The y coordinate to anchor the TileMap's upper left corner (should not be changed once set)
         * @param cellWidth     The individual width of each cell (in pixels) (should not be changed once set)
         * @param cellHeight    The individual height of each cell (in pixels) (should not be changed once set)
         * @param rows          The number of rows in the TileMap (should not be changed once set)
         * @param cols          The number of cols in the TileMap (should not be changed once set)
         */
        constructor(x: number, y: number, cellWidth: number, cellHeight: number, rows: number, cols: number);
        registerSpriteSheet(key: string, spriteSheet: SpriteSheet): void;
        /**
         * Returns the intersection vector that can be used to resolve collisions with actors. If there
         * is no collision null is returned.
         */
        collides(actor: Actor): Vector;
        /**
         * Returns the [[Cell]] by index (row major order)
         */
        getCellByIndex(index: number): Cell;
        /**
         * Returns the [[Cell]] by its x and y coordinates
         */
        getCell(x: number, y: number): Cell;
        /**
         * Returns the [[Cell]] by testing a point in global coordinates,
         * returns `null` if no cell was found.
         */
        getCellByPoint(x: number, y: number): Cell;
        update(engine: Engine, delta: number): void;
        /**
         * Draws the tile map to the screen. Called by the [[Scene]].
         * @param ctx    The current rendering context
         * @param delta  The number of milliseconds since the last draw
         */
        draw(ctx: CanvasRenderingContext2D, delta: number): void;
        /**
         * Draws all the tile map's debug info. Called by the [[Scene]].
         * @param ctx  The current rendering context
         */
        debugDraw(ctx: CanvasRenderingContext2D): void;
    }
    /**
     * Tile sprites are used to render a specific sprite from a [[TileMap]]'s spritesheet(s)
     */
    export class TileSprite {
        spriteSheetKey: string;
        spriteId: number;
        /**
         * @param spriteSheetKey  The key of the spritesheet to use
         * @param spriteId        The index of the sprite in the [[SpriteSheet]]
         */
        constructor(spriteSheetKey: string, spriteId: number);
    }
    /**
     * TileMap Cell
     *
     * A light-weight object that occupies a space in a collision map. Generally
     * created by a [[TileMap]].
     *
     * Cells can draw multiple sprites. Note that the order of drawing is the order
     * of the sprites in the array so the last one will be drawn on top. You can
     * use transparency to create layers this way.
     */
    export class Cell {
        x: number;
        y: number;
        width: number;
        height: number;
        index: number;
        solid: boolean;
        sprites: TileSprite[];
        private _bounds;
        /**
         * @param x       Gets or sets x coordinate of the cell in world coordinates
         * @param y       Gets or sets y coordinate of the cell in world coordinates
         * @param width   Gets or sets the width of the cell
         * @param height  Gets or sets the height of the cell
         * @param index   The index of the cell in row major order
         * @param solid   Gets or sets whether this cell is solid
         * @param sprites The list of tile sprites to use to draw in this cell (in order)
         */
        constructor(x: number, y: number, width: number, height: number, index: number, solid?: boolean, sprites?: TileSprite[]);
        /**
         * Returns the bounding box for this cell
         */
        getBounds(): BoundingBox;
        /**
         * Gets the center coordinate of this cell
         */
        getCenter(): Vector;
        /**
         * Add another [[TileSprite]] to this cell
         */
        pushSprite(tileSprite: TileSprite): void;
        /**
         * Remove an instance of [[TileSprite]] from this cell
         */
        removeSprite(tileSprite: TileSprite): void;
        /**
         * Clear all sprites from this cell
         */
        clearSprites(): void;
    }
}
declare module "Timer" {
    import { Scene } from "Scene";
    /**
     * The Excalibur timer hooks into the internal timer and fires callbacks,
     * after a certain interval, optionally repeating.
     */
    export class Timer {
        static id: number;
        id: number;
        interval: number;
        fcn: () => void;
        repeats: boolean;
        private _elapsedTime;
        private _totalTimeAlive;
        complete: boolean;
        scene: Scene;
        /**
         * @param fcn        The callback to be fired after the interval is complete.
         * @param interval   Interval length
         * @param repeats    Indicates whether this call back should be fired only once, or repeat after every interval as completed.
         */
        constructor(fcn: () => void, interval: number, repeats?: boolean);
        /**
         * Updates the timer after a certain number of milliseconds have elapsed. This is used internally by the engine.
         * @param delta  Number of elapsed milliseconds since the last update.
         */
        update(delta: number): void;
        getTimeRunning(): number;
        /**
         * Cancels the timer, preventing any further executions.
         */
        cancel(): void;
    }
}
declare module "Trigger" {
    import { Engine } from "Engine";
    import { Actor } from "Actor";
    /**
     * Triggers are a method of firing arbitrary code on collision. These are useful
     * as 'buttons', 'switches', or to trigger effects in a game. By default triggers
     * are invisible, and can only be seen when [[Engine.isDebug]] is set to `true`.
     *
     * [[include:Triggers.md]]
     */
    export class Trigger extends Actor {
        private _action;
        repeats: number;
        target: Actor;
        /**
         * @param x       The x position of the trigger
         * @param y       The y position of the trigger
         * @param width   The width of the trigger
         * @param height  The height of the trigger
         * @param action  Callback to fire when trigger is activated, `this` will be bound to the Trigger instance
         * @param repeats The number of times that this trigger should fire, by default it is 1, if -1 is supplied it will fire indefinitely
         */
        constructor(x?: number, y?: number, width?: number, height?: number, action?: () => void, repeats?: number);
        update(engine: Engine, delta: number): void;
        private _dispatchAction();
        draw(ctx: CanvasRenderingContext2D, delta: number): void;
        debugDraw(ctx: CanvasRenderingContext2D): void;
    }
}
declare module "Actions/Index" {
    export * from "Actions/ActionContext";
    export * from "Actions/IActionable";
    export * from "Actions/RotationType";
    import * as actions from "Actions/Action";
    export { actions as Actions };
    export var Internal: {
        Actions: typeof actions;
    };
}
declare module "Collision/DynamicTree" {
    import { BoundingBox } from "Collision/BoundingBox";
    import { Body } from "Collision/Body";
    import { Ray } from "Algebra";
    /**
     * Dynamic Tree Node used for tracking bounds within the tree
     */
    export class TreeNode {
        parent: any;
        left: TreeNode;
        right: TreeNode;
        bounds: BoundingBox;
        height: number;
        body: Body;
        constructor(parent?: any);
        isLeaf(): boolean;
    }
    /**
     * The DynamicTrees provides a spatial partiioning data structure for quickly querying for overlapping bounding boxes for
     * all tracked bodies. The worst case performance of this is O(n*log(n)) where n is the number of bodies in the tree.
     *
     * Internally the bounding boxes are organized as a balanced binary tree of bounding boxes, where the leaf nodes are tracked bodies.
     * Every non-leaf node is a bounding box that contains child bounding boxes.
     */
    export class DynamicTree {
        worldBounds: BoundingBox;
        root: TreeNode;
        nodes: {
            [key: number]: TreeNode;
        };
        constructor(worldBounds?: BoundingBox);
        /**
         * Inserts a node into the dynamic tree
         */
        private _insert(leaf);
        /**
         * Removes a node from the dynamic tree
         */
        private _remove(leaf);
        /**
         * Tracks a body in the dynamic tree
         */
        trackBody(body: Body): void;
        /**
         * Updates the dynamic tree given the current bounds of each body being tracked
         */
        updateBody(body: Body): boolean;
        /**
         * Untracks a body from the dynamic tree
         */
        untrackBody(body: Body): void;
        /**
         * Balances the tree about a node
         */
        private _balance(node);
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
        query(body: Body, callback: (other: Body) => boolean): void;
        /**
         * Queries the Dynamic Axis Aligned Tree for bodies that could be intersecting. By default the raycast query uses an infinitely
         * long ray to test the tree specified by `max`.
         *
         * In the query callback, it will be passed a potential body that intersects with the racast. Returning true from this
         * callback indicates that your are complete with your query and do not want to continue. Return false will continue searching
         * the tree until all possible bodies that would intersect with the ray have been returned.
         */
        rayCastQuery(ray: Ray, max: number, callback: (other: Body) => boolean): void;
        getNodes(): TreeNode[];
        debugDraw(ctx: CanvasRenderingContext2D, delta: number): void;
    }
}
declare module "Collision/Pair" {
    import { Body } from "Collision/Body";
    import { CollisionContact } from "Collision/CollisionContact";
    import { CollisionResolutionStrategy } from "Physics";
    /**
     * Models a potential collision between 2 bodies
     */
    export class Pair {
        bodyA: Body;
        bodyB: Body;
        id: string;
        collision: CollisionContact;
        constructor(bodyA: Body, bodyB: Body);
        /**
         * Runs the collison intersection logic on the members of this pair
         */
        collide(): void;
        /**
         * Resovles the collision body position and velocity if a collision occured
         */
        resolve(delta: number, strategy: CollisionResolutionStrategy): void;
        /**
         * Calculates the unique pair hash id for this collision pair
         */
        static calculatePairHash(bodyA: Body, bodyB: Body): string;
        debugDraw(ctx: CanvasRenderingContext2D): void;
    }
}
declare module "Collision/ICollisionResolver" {
    import { Body } from "Collision/Body";
    import { FrameStats } from "Debug";
    import { Pair } from "Collision/Pair";
    import { Actor } from "Actor";
    import { CollisionResolutionStrategy } from "Physics";
    /**
     * Definition for collision broadphase
     */
    export interface ICollisionBroadphase {
        /**
         * Track a physics body
         */
        track(target: Body): any;
        /**
         * Untrack a physics body
         */
        untrack(tartet: Body): any;
        /**
         * Detect potential collision pairs
         */
        broadphase(targets: Actor[], delta: number, stats?: FrameStats): Pair[];
        /**
         * Identify actual collisions from those pairs, and calculate collision impulse
         */
        narrowphase(pairs: Pair[], stats?: FrameStats): any;
        /**
         * Resolve the position and velocity of the physics bodies
         */
        resolve(delta: number, strategy: CollisionResolutionStrategy): any;
        /**
         * Update the internal structures to track bodies
         */
        update(targets: Actor[], delta: number): number;
        debugDraw(ctx: any, delta: any): void;
    }
}
declare module "Collision/DynamicTreeCollisionBroadphase" {
    import { ICollisionBroadphase } from "Collision/ICollisionResolver";
    import { Pair } from "Collision/Pair";
    import { Body } from "Collision/Body";
    import { Actor } from "Actor";
    import { FrameStats } from "Debug";
    import { CollisionResolutionStrategy } from "Physics";
    export class DynamicTreeCollisionBroadphase implements ICollisionBroadphase {
        private _dynamicCollisionTree;
        private _collisionHash;
        private _collisionPairCache;
        /**
         * Tracks a physics body for collisions
         */
        track(target: Body): void;
        /**
         * Untracks a physics body
         */
        untrack(target: Body): void;
        private _canCollide(actorA, actorB);
        /**
         * Detects potential collision pairs in a broadphase approach with the dynamic aabb tree strategy
         */
        broadphase(targets: Actor[], delta: number, stats?: FrameStats): Pair[];
        /**
         * Applies narrow phase on collision pairs to find actual area intersections
         */
        narrowphase(pairs: Pair[], stats?: FrameStats): void;
        /**
         * Perform collision resolution given a strategy (rigid body or box) and move objects out of intersect.
         */
        resolve(delta: number, strategy: CollisionResolutionStrategy): void;
        /**
         * Update the dynamic tree positions
         */
        update(targets: Actor[], delta: number): number;
        debugDraw(ctx: CanvasRenderingContext2D, delta: number): void;
    }
}
declare module "Collision/IPhysics" {
    import { Vector } from "Algebra";
    import { BroadphaseStrategy, CollisionResolutionStrategy } from "Physics";
    export interface IEnginePhysics {
        /**
         * Global engine acceleration, useful for defining consistent gravity on all actors
         */
        acc: Vector;
        /**
         * Global to switch physics on or off (switching physics off will improve performance)
         */
        enabled: boolean;
        /**
         * Default mass of new actors created in excalibur
         */
        defaultMass: number;
        /**
         * Number of pos/vel integration steps
         */
        integrationSteps: number;
        /**
         * The integration method
         */
        integrator: string;
        /**
         * Number of collision resolution passes
         */
        collisionPasses: number;
        /**
         * Broadphase strategy for identifying potential collision contacts
         */
        broadphaseStrategy: BroadphaseStrategy;
        /**
         * Collision resolution strategy for handling collision contacts
         */
        collisionResolutionStrategy: CollisionResolutionStrategy;
        /**
         * Bias motion calculation towards the current frame, or the last frame
         */
        motionBias: number;
        /**
         * Allow rotation in the physics simulation
         */
        allowRotation: boolean;
    }
}
declare module "Collision/NaiveCollisionBroadphase" {
    import { Pair } from "Collision/Pair";
    import { Actor } from "Actor";
    import { Body } from "Collision/Body";
    import { ICollisionBroadphase } from "Collision/ICollisionResolver";
    import { CollisionResolutionStrategy } from "Physics";
    export class NaiveCollisionBroadphase implements ICollisionBroadphase {
        track(target: Body): void;
        untrack(tartet: Body): void;
        /**
         * Detects potential collision pairs in a broadphase approach with the dynamic aabb tree strategy
         */
        broadphase(targets: Actor[], delta: number): Pair[];
        /**
         * Identify actual collisions from those pairs, and calculate collision impulse
         */
        narrowphase(pairs: Pair[]): void;
        /**
         * Resolve the position and velocity of the physics bodies
         */
        resolve(delta: number, strategy: CollisionResolutionStrategy): void;
        update(targets: Actor[]): number;
        debugDraw(ctx: CanvasRenderingContext2D, delta: number): void;
    }
}
declare module "Collision/Index" {
    export * from "Collision/Body";
    export * from "Collision/BoundingBox";
    export * from "Collision/CircleArea";
    export * from "Collision/CollisionContact";
    export * from "Collision/CollisionJumpTable";
    export * from "Collision/DynamicTree";
    export * from "Collision/DynamicTreeCollisionBroadphase";
    export * from "Collision/EdgeArea";
    export * from "Collision/ICollisionArea";
    export * from "Collision/ICollisionResolver";
    export * from "Collision/IPhysics";
    export * from "Collision/NaiveCollisionBroadphase";
    export * from "Collision/Pair";
    export * from "Collision/PolygonArea";
    export * from "Collision/Side";
}
declare module "Drawing/Polygon" {
    import { Color } from "Drawing/Color";
    import * as Effects from "Drawing/SpriteEffects";
    import { IDrawable } from "Interfaces/IDrawable";
    import { Vector } from "Algebra";
    /**
     * Creates a closed polygon drawing given a list of [[Vector]]s.
     *
     * @warning Use sparingly as Polygons are performance intensive
     */
    export class Polygon implements IDrawable {
        flipVertical: boolean;
        flipHorizontal: boolean;
        width: number;
        height: number;
        naturalWidth: number;
        naturalHeight: number;
        /**
         * The color to use for the lines of the polygon
         */
        lineColor: Color;
        /**
         * The color to use for the interior of the polygon
         */
        fillColor: Color;
        /**
         * The width of the lines of the polygon
         */
        lineWidth: number;
        /**
         * Indicates whether the polygon is filled or not.
         */
        filled: boolean;
        private _points;
        anchor: Vector;
        rotation: number;
        scale: Vector;
        /**
         * @param points  The vectors to use to build the polygon in order
         */
        constructor(points: Vector[]);
        /**
         * @notimplemented Effects are not supported on `Polygon`
         */
        addEffect(effect: Effects.ISpriteEffect): void;
        /**
         * @notimplemented Effects are not supported on `Polygon`
         */
        removeEffect(index: number): any;
        /**
         * @notimplemented Effects are not supported on `Polygon`
         */
        removeEffect(effect: Effects.ISpriteEffect): any;
        /**
         * @notimplemented Effects are not supported on `Polygon`
         */
        clearEffects(): void;
        reset(): void;
        draw(ctx: CanvasRenderingContext2D, x: number, y: number): void;
    }
}
declare module "Drawing/Index" {
    export * from "Drawing/Animation";
    export * from "Drawing/Color";
    export * from "Drawing/Polygon";
    export * from "Drawing/Sprite";
    export * from "Drawing/SpriteSheet";
    import * as effects from "Drawing/SpriteEffects";
    export { effects as Effects };
}
declare module "Interfaces/Index" {
    export * from "Interfaces/IActorTrait";
    export * from "Interfaces/IAudio";
    export * from "Interfaces/IAudioImplementation";
    export * from "Interfaces/IDrawable";
    export * from "Interfaces/IEvented";
    export * from "Interfaces/ILoadable";
    export * from "Interfaces/ILoader";
}
declare module "Math/Random" {
    /**
     * Pseudo-random number generator following the Mersenne_Twister algorithm. Given a seed this generator will produce the same sequence
     * of numbers each time it is called.
     * See https://en.wikipedia.org/wiki/Mersenne_Twister for more details.
     * Uses the MT19937-32 (2002) implementation documented here http://www.math.sci.hiroshima-u.ac.jp/~m-mat/MT/MT2002/emt19937ar.html
     *
     * Api inspired by http://chancejs.com/# https://github.com/chancejs/chancejs
     */
    export class Random {
        seed: number;
        private _lowerMask;
        private _upperMask;
        private _w;
        private _n;
        private _m;
        private _r;
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
        /**
         * If no seed is specified, the Date.now() is used
         */
        constructor(seed?: number);
        /**
         * Apply the twist
         */
        private _twist();
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
         * @param numPicks must be less than or equal to the number of elements in the array.
         */
        private _pickSetWithoutDuplicates<T>(array, numPicks);
        /**
         * Returns a new array random picking elements from the original allowing duplicates
         * @param numPicks can be any positive number
         */
        private _pickSetWithDuplicates<T>(array, numPicks);
        /**
         * Returns a new array that has it's elements shuffled. Using the Fisher/Yates method
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
    }
}
declare module "Math/PerlinNoise" {
    import { Color } from "Drawing/Color";
    /**
     * Options for the perlin noise generator
     */
    export interface IPerlinGeneratorOptions {
        /**
         * Random number seed for the Perlin noise generator
         */
        seed?: number;
        /**
         * Number of octaves to use when generating the noise, the number of octaves is the number of times the perlin
         * noise is generated and laid on top of itself. Using higher values can increase the curviness of the noise, and
         * make it look more natural.
         */
        octaves?: number;
        /**
         * Frequency to use when generating the noise, the higher the number the more quickly the pattern will oscilate. Another way
         * to think about this is that it is like "zooming" out from an infinite pattern determined by the seed.
         */
        frequency?: number;
        /**
         * The amplitude determines the relative height of the peaks generated in the noise.
         */
        amplitude?: number;
        /**
         * The persistance determines how quickly the amplitude will drop off, a high degree of persistance results in smoother patterns,
         * a low degree of persistance generates spikey patterns.
         */
        persistance?: number;
    }
    /**
     * Generates perlin noise based on the 2002 Siggraph paper http://mrl.nyu.edu/~perlin/noise/
     * Also https://flafla2.github.io/2014/08/09/perlinnoise.html
     */
    export class PerlinGenerator {
        private _perm;
        private _p;
        private _random;
        private _defaultPerlinOptions;
        /**
         * The persistance determines how quickly the amplitude will drop off, a high degree of persistance results in smoother patterns,
         * a low degree of persistance generates spikey patterns.
         */
        persistance: number;
        /**
         * The amplitude determines the relative height of the peaks generated in the noise.
         */
        amplitude: number;
        /**
         * Frequency to use when generating the noise, the higher the number the more quickly the pattern will oscilate. Another way
         * to think about this is that it is like "zooming" out from an infinite pattern determined by the seed.
         */
        frequency: number;
        /**
         * Number of octaves to use when generating the noise, the number of octaves is the number of times the perlin
         * noise is generated and laid on top of itself. Using higher values can increase the curviness of the noise, and
         * make it look more natural.
         */
        octaves: number;
        constructor(options?: IPerlinGeneratorOptions);
        /**
         * Generates 1-Dimensional perlin noise given an x and generates noises values between [0, 1].
         */
        noise(x: number): number;
        /**
         * Generates 2-Dimensional perlin noise given an (x, y) and generates noise values between [0, 1]
         */
        noise(x: number, y: number): number;
        /**
         * Generates 3-Dimensional perlin noise given an (x, y, z) and generates noise values between [0, 1]
         */
        noise(x: number, y: number, z: number): number;
        /**
         * Generates a list starting at 0 and ending at 1 of contious perlin noise, by default the step is 1/length;
         *
         */
        noiseSequence(length: number, step?: number): number[];
        /**
         * Generates a 2D grid of perlin noise given a step value packed into a 1D array i = (x + y*width),
         * by default the step will 1/(min(dimension))
         */
        noiseGrid(width: number, height: number, step?: number): number[];
        private _gradient3d(hash, x, y, z);
        private _gradient2d(hash, x, y);
        private _gradient1d(hash, x);
        private _noise1d(x);
        private _noise2d(x, y);
        private _noise3d(x, y, z);
    }
    /**
     * A helper to draw 2D perlin maps given a perlin generator and a function
     */
    export class PerlinDrawer2D {
        generator: PerlinGenerator;
        colorFcn: (val: number) => Color;
        /**
         * @param generator - An existing perlin generator
         * @param colorFcn - A color function that takes a value between [0, 255] derived from the perlin generator, and returns a color
         */
        constructor(generator: PerlinGenerator, colorFcn?: (val: number) => Color);
        /**
         * Returns an image of 2D perlin noise
         */
        image(width: number, height: number): HTMLImageElement;
        /**
         * This draws a 2D perlin grid on a canvas context, not recommended to be called every frame due to performance
         */
        draw(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void;
    }
}
declare module "Math/Index" {
    export * from "Math/PerlinNoise";
    export * from "Math/Random";
}
declare module "PostProcessing/IPostProcessor" {
    /**
     * Adds post processing support for the engine, can process raw pixel data and manipulate canvas directly.
     *
     * [[include:PostProcessors.md]]
     */
    export interface IPostProcessor {
        process(image: ImageData, out: CanvasRenderingContext2D): void;
    }
}
declare module "PostProcessing/ColorBlindCorrector" {
    import { IPostProcessor } from "PostProcessing/IPostProcessor";
    import { Engine } from "Engine";
    export enum ColorBlindness {
        Protanope = 0,
        Deuteranope = 1,
        Tritanope = 2,
    }
    /**
     * This post processor can correct colors and simulate color blindness.
     * It is possible to use this on every game, but the game's performance
     * will suffer measurably. It's better to use it as a helpful tool while developing your game.
     * Remember, the best practice is to design with color blindness in mind.
     *
     * [[include:ColorBlind.md]]
     */
    export class ColorBlindCorrector implements IPostProcessor {
        engine: Engine;
        simulate: boolean;
        colorMode: ColorBlindness;
        private _vertexShader;
        private _fragmentShader;
        private _internalCanvas;
        private _gl;
        private _program;
        constructor(engine: Engine, simulate?: boolean, colorMode?: ColorBlindness);
        private _getFragmentShaderByMode(colorMode);
        private _setRectangle(gl, x, y, width, height);
        private _getShader(type, program);
        process(image: ImageData, out: CanvasRenderingContext2D): void;
    }
}
declare module "PostProcessing/Index" {
    export * from "PostProcessing/ColorBlindCorrector";
    export * from "PostProcessing/IPostProcessor";
}
declare module "Resources/Index" {
    export * from "Resources/Resource";
    export * from "Resources/Sound";
    export * from "Resources/Texture";
}
declare module "Input/Gamepad" {
    import { Engine } from "Engine";
    import { Class } from "Class";
    import { GameEvent, GamepadConnectEvent, GamepadDisconnectEvent, GamepadButtonEvent, GamepadAxisEvent } from "Events";
    import * as Events from "Events";
    /**
     * Excalibur leverages the HTML5 Gamepad API [where it is supported](http://caniuse.com/#feat=gamepad)
     * to provide controller support for your games.
     *
     * [[include:Gamepads.md]]
     */
    export class Gamepads extends Class {
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
        private _engine;
        private _navigator;
        private _minimumConfiguration;
        constructor(engine: Engine);
        init(): void;
        /**
         * Sets the minimum gamepad configuration, for example {axis: 4, buttons: 4} means
         * this game requires at minimum 4 axis inputs and 4 buttons, this is not restrictive
         * all other controllers with more axis or buttons are valid as well. If no minimum
         * configuration is set all pads are valid.
         */
        setMinimumGamepadConfiguration(config: IGamepadConfiguration): void;
        /**
         * When implicitly enabled, set the enabled flag and run an update so information is updated
         */
        private _enableAndUpdate();
        /**
         * Checks a navigator gamepad against the minimum configuration if present.
         */
        private _isGamepadValid(pad);
        on(eventName: Events.connect, handler: (event?: GamepadConnectEvent) => void): any;
        on(eventName: Events.disconnect, handler: (event?: GamepadDisconnectEvent) => void): any;
        on(eventName: Events.button, handler: (event?: GamepadButtonEvent) => void): any;
        on(eventName: Events.axis, handler: (event?: GamepadAxisEvent) => void): any;
        on(eventName: string, handler: (event?: GameEvent) => void): any;
        off(eventName: string, handler?: (event?: GameEvent) => void): void;
        /**
         * Updates Gamepad state and publishes Gamepad events
         */
        update(delta: number): void;
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
        private _clonePads(pads);
        /**
         * Fastest way to clone a known object is to do it yourself
         */
        private _clonePad(pad);
    }
    /**
     * Gamepad holds state information for a connected controller. See [[Gamepads]]
     * for more information on handling controller input.
     */
    export class Gamepad extends Class {
        connected: boolean;
        navigatorGamepad: INavigatorGamepad;
        private _buttons;
        private _axes;
        constructor();
        /**
         * Whether or not the given button is pressed
         * @param button     The button to query
         * @param threshold  The threshold over which the button is considered to be pressed
         */
        isButtonPressed(button: Buttons, threshold?: number): boolean;
        /**
         * Gets the given button value between 0 and 1
         */
        getButton(button: Buttons): number;
        /**
         * Gets the given axis value between -1 and 1. Values below
         * [[MinAxisMoveThreshold]] are considered 0.
         */
        getAxes(axes: Axes): number;
        updateButton(buttonIndex: number, value: number): void;
        updateAxes(axesIndex: number, value: number): void;
    }
    /**
     * Gamepad Buttons enumeration
     */
    export enum Buttons {
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
    }
    /**
     * Gamepad Axes enumeration
     */
    export enum Axes {
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
        RightStickY = 3,
    }
    /**
     * @internal
     */
    export interface INavigatorGamepad {
        axes: number[];
        buttons: INavigatorGamepadButton[];
        connected: boolean;
        id: string;
        index: number;
        mapping: string;
        timestamp: number;
    }
    /**
     * @internal
     */
    export interface INavigatorGamepadButton {
        pressed: boolean;
        value: number;
    }
    /**
     * @internal
     */
    export interface INavigatorGamepadEvent {
        gamepad: INavigatorGamepad;
    }
    /**
     * @internal
     */
    export interface IGamepadConfiguration {
        axis: number;
        buttons: number;
    }
}
declare module "Input/Pointer" {
    import { Engine } from "Engine";
    import { GameEvent } from "Events";
    import { Class } from "Class";
    import * as Events from "Events";
    /**
     * The type of pointer for a [[PointerEvent]].
     */
    export enum PointerType {
        Touch = 0,
        Mouse = 1,
        Pen = 2,
        Unknown = 3,
    }
    /**
     * The mouse button being pressed.
     */
    export enum PointerButton {
        Left = 0,
        Middle = 1,
        Right = 2,
        Unknown = 3,
    }
    /**
     * Determines the scope of handling mouse/touch events. See [[Pointers]] for more information.
     */
    export enum PointerScope {
        /**
         * Handle events on the `canvas` element only. Events originating outside the
         * `canvas` will not be handled.
         */
        Canvas = 0,
        /**
         * Handles events on the entire document. All events will be handled by Excalibur.
         */
        Document = 1,
    }
    /**
     * Pointer events
     *
     * Represents a mouse, touch, or stylus event. See [[Pointers]] for more information on
     * handling pointer input.
     *
     * For mouse-based events, you can inspect [[PointerEvent.button]] to see what button was pressed.
     */
    export class PointerEvent extends GameEvent {
        x: number;
        y: number;
        index: number;
        pointerType: PointerType;
        button: PointerButton;
        ev: any;
        /**
         * @param x            The `x` coordinate of the event (in world coordinates)
         * @param y            The `y` coordinate of the event (in world coordinates)
         * @param index        The index of the pointer (zero-based)
         * @param pointerType  The type of pointer
         * @param button       The button pressed (if [[PointerType.Mouse]])
         * @param ev           The raw DOM event being handled
         */
        constructor(x: number, y: number, index: number, pointerType: PointerType, button: PointerButton, ev: any);
    }
    /**
     * Handles pointer events (mouse, touch, stylus, etc.) and normalizes to
     * [W3C Pointer Events](http://www.w3.org/TR/pointerevents/).
     *
     * [[include:Pointers.md]]
     */
    export class Pointers extends Class {
        private _engine;
        private _pointerDown;
        private _pointerUp;
        private _pointerMove;
        private _pointerCancel;
        private _pointers;
        private _activePointers;
        constructor(engine: Engine);
        on(eventName: Events.up, handler: (event?: PointerEvent) => void): any;
        on(eventName: Events.down, handler: (event?: PointerEvent) => void): any;
        on(eventName: Events.move, handler: (event?: PointerEvent) => void): any;
        on(eventName: Events.cancel, handler: (event?: PointerEvent) => void): any;
        on(eventName: string, handler: (event?: GameEvent) => void): any;
        /**
         * Primary pointer (mouse, 1 finger, stylus, etc.)
         */
        primary: Pointer;
        /**
         * Initializes pointer event listeners
         */
        init(scope?: PointerScope): void;
        update(delta: number): void;
        /**
         * Safely gets a Pointer at a specific index and initializes one if it doesn't yet exist
         * @param index  The pointer index to retrieve
         */
        at(index: number): Pointer;
        /**
         * Get number of pointers being watched
         */
        count(): number;
        /**
         * Propogates events to actor if necessary
         */
        propogate(actor: any): void;
        private _handleMouseEvent(eventName, eventArr);
        private _handleTouchEvent(eventName, eventArr);
        private _handlePointerEvent(eventName, eventArr);
        /**
         * Gets the index of the pointer specified for the given pointer ID or finds the next empty pointer slot available.
         * This is required because IE10/11 uses incrementing pointer IDs so we need to store a mapping of ID => idx
         */
        private _getPointerIndex(pointerId);
        private _stringToPointerType(s);
    }
    /**
     * Captures and dispatches PointerEvents
     */
    export class Pointer extends Class {
    }
}
declare module "Input/Keyboard" {
    import { Engine } from "Engine";
    import { Class } from "Class";
    import { GameEvent } from "Events";
    import * as Events from "Events";
    /**
     * Enum representing input key codes
     */
    export enum Keys {
        Num1 = 97,
        Num2 = 98,
        Num3 = 99,
        Num4 = 100,
        Num5 = 101,
        Num6 = 102,
        Num7 = 103,
        Num8 = 104,
        Num9 = 105,
        Num0 = 96,
        Numlock = 144,
        Semicolon = 186,
        A = 65,
        B = 66,
        C = 67,
        D = 68,
        E = 69,
        F = 70,
        G = 71,
        H = 72,
        I = 73,
        J = 74,
        K = 75,
        L = 76,
        M = 77,
        N = 78,
        O = 79,
        P = 80,
        Q = 81,
        R = 82,
        S = 83,
        T = 84,
        U = 85,
        V = 86,
        W = 87,
        X = 88,
        Y = 89,
        Z = 90,
        Shift = 16,
        Alt = 18,
        Up = 38,
        Down = 40,
        Left = 37,
        Right = 39,
        Space = 32,
        Esc = 27,
    }
    /**
     * Event thrown on a game object for a key event
     */
    export class KeyEvent extends GameEvent {
        key: Keys;
        /**
         * @param key  The key responsible for throwing the event
         */
        constructor(key: Keys);
    }
    /**
     * Provides keyboard support for Excalibur.
     *
     * [[include:Keyboard.md]]
     */
    export class Keyboard extends Class {
        private _keys;
        private _keysUp;
        private _keysDown;
        private _engine;
        constructor(engine: Engine);
        on(eventName: Events.press, handler: (event?: KeyEvent) => void): any;
        on(eventName: Events.release, handler: (event?: KeyEvent) => void): any;
        on(eventName: Events.hold, handler: (event?: KeyEvent) => void): any;
        on(eventName: string, handler: (event?: GameEvent) => void): any;
        /**
         * Initialize Keyboard event listeners
         */
        init(global?: any): void;
        update(delta: number): void;
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
    }
}
declare module "Input/IEngineInput" {
    import { Keyboard } from "Input/Keyboard";
    import { Gamepads } from "Input/Gamepad";
    import { Pointers } from "Input/Pointer";
    export interface IEngineInput {
        keyboard: Keyboard;
        pointers: Pointers;
        gamepads: Gamepads;
    }
}
declare module "Input/Index" {
    /**
     * Provides support for mice, keyboards, and controllers.
     *
     * [[include:Input.md]]
     */
    /**
     * @typedoc
     */
    export * from "Input/Gamepad";
    export * from "Input/Pointer";
    export * from "Input/Keyboard";
    export * from "Input/IEngineInput";
}
declare module "Util/Index" {
    export * from "Util/Util";
    import * as drawUtil from "Util/DrawUtil";
    export { drawUtil as DrawUtil };
}
declare module "Util/Detector" {
    /**
     * Interface for detected browser features matrix
     */
    export interface IDetectedFeatures {
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
    export class Detector {
        private _features;
        failedTests: string[];
        constructor();
        /**
         * Returns a map of currently supported browser features. This method
         * treats the features as a singleton and will only calculate feature
         * support if it has not previously been done.
         */
        getBrowserFeatures(): IDetectedFeatures;
        /**
         * Report on non-critical browser support for debugging purposes.
         * Use native browser console colors for visibility.
         */
        logBrowserFeatures(): void;
        /**
         * Executes several IIFE's to get a constant reference to supported
         * features within the current execution context.
         */
        private _loadBrowserFeatures();
        private _criticalTests;
        private _warningTest;
        test(): boolean;
    }
}
declare module "Util/SortedList" {
    /**
     * A sorted list implementation. NOTE: this implementation is not self-balancing
     */
    export class SortedList<T> {
        private _getComparable;
        private _root;
        constructor(getComparable: () => any);
        find(element: any): boolean;
        private _find(node, element);
        get(key: number): any[];
        private _get(node, key);
        add(element: any): boolean;
        private _insert(node, element);
        removeByComparable(element: any): void;
        private _remove(node, element);
        private _cleanup(node, element);
        private _findMinNode(node);
        list(): Array<T>;
        private _list(treeNode, results);
    }
    /**
     * A tree node part of [[SortedList]]
     */
    export class BinaryTreeNode {
        private _key;
        private _data;
        private _left;
        private _right;
        constructor(key: number, data: Array<any>, left: BinaryTreeNode, right: BinaryTreeNode);
        getKey(): number;
        setKey(key: number): void;
        getData(): Array<any>;
        setData(data: any): void;
        getLeft(): BinaryTreeNode;
        setLeft(left: BinaryTreeNode): void;
        getRight(): BinaryTreeNode;
        setRight(right: BinaryTreeNode): void;
    }
    /**
     * Mock element for testing
     *
     * @internal
     */
    export class MockedElement {
        private _key;
        constructor(key: number);
        getTheKey(): number;
        setKey(key: number): void;
    }
}
declare module "Index" {
    /**
     * The current Excalibur version string
     */
    export var EX_VERSION: string;
    export * from "Actor";
    export * from "Algebra";
    export * from "Camera";
    export * from "Class";
    export * from "Debug";
    export * from "Engine";
    export * from "EventDispatcher";
    export * from "Events";
    export * from "Group";
    export * from "Label";
    export * from "Loader";
    export * from "Particles";
    export * from "Physics";
    export * from "Promises";
    export * from "Scene";
    export * from "TileMap";
    export * from "Timer";
    export * from "Trigger";
    export * from "UIActor";
    export * from "Actions/Index";
    export * from "Collision/Index";
    export * from "Drawing/Index";
    export * from "Interfaces/Index";
    export * from "Math/Index";
    export * from "PostProcessing/Index";
    export * from "Resources/Index";
    import * as events from "Events";
    export { events as Events };
    import * as input from "Input/Index";
    export { input as Input };
    import * as traits from "Traits/Index";
    export { traits as Traits };
    import * as util from "Util/Index";
    export { util as Util };
    export * from "Util/Decorators";
    export * from "Util/Detector";
    export * from "Util/CullingBox";
    export * from "Util/EasingFunctions";
    export * from "Util/Log";
    export * from "Util/SortedList";
}
declare module "Engine" {
    import { ILoadable } from "Interfaces/ILoadable";
    import { Promise } from "Promises";
    import { Vector } from "Algebra";
    import { UIActor } from "UIActor";
    import { Actor } from "Actor";
    import { Timer } from "Timer";
    import { TileMap } from "TileMap";
    import { Animation } from "Drawing/Animation";
    import { VisibleEvent, HiddenEvent, GameStartEvent, GameStopEvent, PreUpdateEvent, PostUpdateEvent, PreFrameEvent, PostFrameEvent, GameEvent } from "Events";
    import { ILoader } from "Interfaces/ILoader";
    import { Color } from "Drawing/Color";
    import { Scene } from "Scene";
    import { IPostProcessor } from "PostProcessing/IPostProcessor";
    import { Debug, FrameStats } from "Debug";
    import { Class } from "Class";
    import * as Input from "Input/Index";
    import * as Events from "Events";
    /**
     * Enum representing the different display modes available to Excalibur
     */
    export enum DisplayMode {
        /**
         * Show the game as full screen
         */
        FullScreen = 0,
        /**
         * Scale the game to the parent DOM container
         */
        Container = 1,
        /**
         * Show the game as a fixed size
         */
        Fixed = 2,
    }
    /**
     * Defines the available options to configure the Excalibur engine at constructor time.
     */
    export interface IEngineOptions {
        /**
         * Optionally configure the native canvas width of the game
         */
        width?: number;
        /**
         * Optionally configure the native canvas height of the game
         */
        height?: number;
        /**
         * Optionally specify the target canvas DOM element to render the game in
         */
        canvasElementId?: string;
        /**
         * The [[DisplayMode]] of the game. Depending on this value, [[width]] and [[height]] may be ignored.
         */
        displayMode?: DisplayMode;
        /**
         * Configures the pointer scope. Pointers scoped to the 'Canvas' can only fire events within the canvas viewport; whereas, 'Document'
         * (default) scoped will fire anywhere on the page.
         */
        pointerScope?: Input.PointerScope;
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
    }
    /**
     * The Excalibur Engine
     *
     * The [[Engine]] is the main driver for a game. It is responsible for
     * starting/stopping the game, maintaining state, transmitting events,
     * loading resources, and managing the scene.
     *
     * [[include:Engine.md]]
     */
    export class Engine extends Class {
        /**
         * Direct access to the engine's canvas element
         */
        canvas: HTMLCanvasElement;
        /**
         * Direct access to the engine's 2D rendering context
         */
        ctx: CanvasRenderingContext2D;
        /**
         * Direct access to the canvas element ID, if an ID exists
         */
        canvasElementId: string;
        /**
         * The width of the game canvas in pixels
         */
        width: number;
        /**
         * The height of the game canvas in pixels
         */
        height: number;
        /**
         * Access engine input like pointer, keyboard, or gamepad
         */
        input: Input.IEngineInput;
        private _hasStarted;
        /**
         * Current FPS
         * @obsolete Use [[FrameStats.fps|Engine.stats.fps]]. Will be deprecated in future versions.
         */
        readonly fps: number;
        /**
         * Access Excalibur debugging functionality.
         */
        debug: Debug;
        /**
         * Access [[stats]] that holds frame statistics.
         */
        readonly stats: {
            currFrame: FrameStats;
            prevFrame: FrameStats;
        };
        /**
         * Gets or sets the list of post processors to apply at the end of drawing a frame (such as [[ColorBlindCorrector]])
         */
        postProcessors: IPostProcessor[];
        /**
         * The current [[Scene]] being drawn and updated on screen
         */
        currentScene: Scene;
        /**
         * The default [[Scene]] of the game, use [[Engine.goToScene]] to transition to different scenes.
         */
        rootScene: Scene;
        /**
         * Contains all the scenes currently registered with Excalibur
         */
        scenes: {
            [key: string]: Scene;
        };
        private _animations;
        /**
         * Indicates whether the engine is set to fullscreen or not
         */
        isFullscreen: boolean;
        /**
         * Indicates the current [[DisplayMode]] of the engine.
         */
        displayMode: DisplayMode;
        /**
         * Indicates whether audio should be paused when the game is no longer visible.
         */
        pauseAudioWhenHidden: boolean;
        /**
         * Indicates whether the engine should draw with debug information
         */
        isDebug: boolean;
        debugColor: Color;
        /**
         * Sets the background color for the engine.
         */
        backgroundColor: Color;
        /**
         * The action to take when a fatal exception is thrown
         */
        onFatalException: (e: any) => void;
        private _logger;
        private _isSmoothingEnabled;
        private _requestId;
        private _compatible;
        private _timescale;
        private _loader;
        private _isLoading;
        on(eventName: Events.visible, handler: (event?: VisibleEvent) => void): any;
        on(eventName: Events.hidden, handler: (event?: HiddenEvent) => void): any;
        on(eventName: Events.start, handler: (event?: GameStartEvent) => void): any;
        on(eventName: Events.stop, handler: (event?: GameStopEvent) => void): any;
        on(eventName: Events.preupdate, handler: (event?: PreUpdateEvent) => void): any;
        on(eventName: Events.postupdate, handler: (event?: PostUpdateEvent) => void): any;
        on(eventName: Events.preframe, handler: (event?: PreFrameEvent) => void): any;
        on(eventName: Events.postframe, handler: (event?: PostFrameEvent) => void): any;
        on(eventName: string, handler: (event?: GameEvent) => void): any;
        /**
         * Default [[IEngineOptions]]
         */
        private static _DefaultEngineOptions;
        /**
         * Creates a new game using the given [[IEngineOptions]]. By default, if no options are provided,
         * the game will be rendered full screen (taking up all available browser window space).
         * You can customize the game rendering through [[IEngineOptions]].
         *
         * Example:
         *
         * ```js
         * var game = new ex.Engine({
         *   width: 0, // the width of the canvas
         *   height: 0, // the height of the canvas
         *   canvasElementId: '', // the DOM canvas element ID, if you are providing your own
         *   displayMode: ex.DisplayMode.FullScreen, // the display mode
         *   pointerScope: ex.Input.PointerScope.Document // the scope of capturing pointer (mouse/touch) events
         * });
         *
         * // call game.start, which is a Promise
         * game.start().then(function () {
         *   // ready, set, go!
         * });
         * ```
         */
        constructor(options?: IEngineOptions);
        /**
         * Gets the current engine timescale factor (default is 1.0 which is 1:1 time)
         */
        /**
         * Sets the current engine timescale factor. Useful for creating slow-motion effects or fast-forward effects
         * when using time-based movement.
         */
        timescale: number;
        /**
         * Plays a sprite animation on the screen at the specified `x` and `y`
         * (in game coordinates, not screen pixels). These animations play
         * independent of actors, and will be cleaned up internally as soon
         * as they are complete. Note animations that loop will never be
         * cleaned up.
         *
         * @param animation  Animation to play
         * @param x          x game coordinate to play the animation
         * @param y          y game coordinate to play the animation
         */
        playAnimation(animation: Animation, x: number, y: number): void;
        /**
         * Adds a [[TileMap]] to the [[currentScene]], once this is done the TileMap
         * will be drawn and updated.
         */
        addTileMap(tileMap: TileMap): void;
        /**
         * Removes a [[TileMap]] from the [[currentScene]], it will no longer be drawn or updated.
         */
        removeTileMap(tileMap: TileMap): void;
        /**
         * Adds a [[Timer]] to the [[currentScene]].
         * @param timer  The timer to add to the [[currentScene]].
         */
        addTimer(timer: Timer): Timer;
        /**
         * Removes a [[Timer]] from the [[currentScene]].
         * @param timer  The timer to remove to the [[currentScene]].
         */
        removeTimer(timer: Timer): Timer;
        /**
         * Adds a [[Scene]] to the engine, think of scenes in Excalibur as you
         * would levels or menus.
         *
         * @param key  The name of the scene, must be unique
         * @param scene The scene to add to the engine
         */
        addScene(key: string, scene: Scene): void;
        /**
         * Removes a [[Scene]] instance from the engine
         * @param scene  The scene to remove
         */
        removeScene(scene: Scene): void;
        /**
         * Removes a scene from the engine by key
         * @param key  The scene key to remove
         */
        removeScene(key: string): void;
        /**
         * Adds a [[Scene]] to the engine, think of scenes in Excalibur as you
         * would levels or menus.
         * @param sceneKey  The key of the scene, must be unique
         * @param scene     The scene to add to the engine
         */
        add(sceneKey: string, scene: Scene): void;
        /**
         * Adds a [[Timer]] to the [[currentScene]].
         * @param timer  The timer to add to the [[currentScene]].
         */
        add(timer: Timer): void;
        /**
         * Adds a [[TileMap]] to the [[currentScene]], once this is done the TileMap
         * will be drawn and updated.
         */
        add(tileMap: TileMap): void;
        /**
         * Adds an actor to the [[currentScene]] of the game. This is synonymous
         * to calling `engine.currentScene.add(actor)`.
         *
         * Actors can only be drawn if they are a member of a scene, and only
         * the [[currentScene]] may be drawn or updated.
         *
         * @param actor  The actor to add to the [[currentScene]]
         */
        add(actor: Actor): void;
        /**
         * Adds a [[UIActor]] to the [[currentScene]] of the game,
         * UIActors do not participate in collisions, instead the
         * remain in the same place on the screen.
         * @param uiActor  The UIActor to add to the [[currentScene]]
         */
        add(uiActor: UIActor): void;
        /**
         * Removes a scene instance from the engine
         * @param scene  The scene to remove
         */
        remove(scene: Scene): void;
        /**
         * Removes a scene from the engine by key
         * @param sceneKey  The scene to remove
         */
        remove(sceneKey: string): void;
        /**
         * Removes a [[Timer]] from the [[currentScene]].
         * @param timer  The timer to remove to the [[currentScene]].
         */
        remove(timer: Timer): void;
        /**
         * Removes a [[TileMap]] from the [[currentScene]], it will no longer be drawn or updated.
         */
        remove(tileMap: TileMap): void;
        /**
         * Removes an actor from the [[currentScene]] of the game. This is synonymous
         * to calling `engine.currentScene.removeChild(actor)`.
         * Actors that are removed from a scene will no longer be drawn or updated.
         *
         * @param actor  The actor to remove from the [[currentScene]].
         */
        remove(actor: Actor): void;
        /**
         * Removes a [[UIActor]] to the scene, it will no longer be drawn or updated
         * @param uiActor  The UIActor to remove from the [[currentScene]]
         */
        remove(uiActor: UIActor): void;
        /**
         * Adds an actor to the [[currentScene]] of the game. This is synonymous
         * to calling `engine.currentScene.add(actor)`.
         *
         * Actors can only be drawn if they are a member of a scene, and only
         * the [[currentScene]] may be drawn or updated.
         *
         * @param actor  The actor to add to the [[currentScene]]
         */
        protected _addChild(actor: Actor): void;
        /**
         * Removes an actor from the [[currentScene]] of the game. This is synonymous
         * to calling `engine.currentScene.remove(actor)`.
         * Actors that are removed from a scene will no longer be drawn or updated.
         *
         * @param actor  The actor to remove from the [[currentScene]].
         */
        protected _removeChild(actor: Actor): void;
        /**
         * Changes the currently updating and drawing scene to a different,
         * named scene. Calls the [[Scene]] lifecycle events.
         * @param key  The key of the scene to trasition to.
         */
        goToScene(key: string): void;
        /**
         * Returns the width of the engine's drawing surface in pixels.
         */
        getWidth(): number;
        /**
         * Returns the height of the engine's drawing surface in pixels.
         */
        getHeight(): number;
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
         * Sets the internal canvas height based on the selected display mode.
         */
        private _setHeightByDisplayMode(parent);
        /**
         * Initializes the internal canvas, rendering context, displaymode, and native event listeners
         */
        private _initialize(options?);
        /**
         * If supported by the browser, this will set the antialiasing flag on the
         * canvas. Set this to `false` if you want a 'jagged' pixel art look to your
         * image resources.
         * @param isSmooth  Set smoothing to true or false
         */
        setAntialiasing(isSmooth: boolean): void;
        /**
         * Return the current smoothing status of the canvas
         */
        getAntialiasing(): boolean;
        /**
         * Updates the entire state of the game
         * @param delta  Number of milliseconds elapsed since the last update.
         */
        private _update(delta);
        /**
         * Draws the entire game
         * @param delta  Number of milliseconds elapsed since the last draw.
         */
        private _draw(delta);
        /**
         * Starts the internal game loop for Excalibur after loading
         * any provided assets.
         * @param loader  Optional [[ILoader]] to use to load resources. The default loader is [[Loader]], override to provide your own
         * custom loader.
         */
        start(loader?: ILoader): Promise<any>;
        static createMainLoop(game: Engine, raf: (Function) => number, nowFn: () => number): () => void;
        /**
         * Stops Excalibur's main loop, useful for pausing the game.
         */
        stop(): void;
        /**
         * Takes a screen shot of the current viewport and returns it as an
         * HTML Image Element.
         */
        screenshot(): HTMLImageElement;
        /**
         * Another option available to you to load resources into the game.
         * Immediately after calling this the game will pause and the loading screen
         * will appear.
         * @param loader  Some [[ILoadable]] such as a [[Loader]] collection, [[Sound]], or [[Texture]].
         */
        load(loader: ILoadable): Promise<any>;
    }
}
declare module "UIActor" {
    import { Engine } from "Engine";
    import { Actor } from "Actor";
    /**
     * Helper [[Actor]] primitive for drawing UI's, optimized for UI drawing. Does
     * not participate in collisions. Drawn on top of all other actors.
     */
    export class UIActor extends Actor {
        protected _engine: Engine;
        /**
         * @param x       The starting x coordinate of the actor
         * @param y       The starting y coordinate of the actor
         * @param width   The starting width of the actor
         * @param height  The starting height of the actor
         */
        constructor(x?: number, y?: number, width?: number, height?: number);
        onInitialize(engine: Engine): void;
        contains(x: number, y: number, useWorld?: boolean): boolean;
    }
}
declare module "Util/Actors" {
    import { Actor } from "Actor";
    export function isVanillaActor(actor: Actor): boolean;
    export function isUIActor(actor: Actor): boolean;
}
declare module "Scene" {
    import { UIActor } from "UIActor";
    import { InitializeEvent, ActivateEvent, DeactivateEvent, PreUpdateEvent, PostUpdateEvent, PreDrawEvent, PostDrawEvent, PreDebugDrawEvent, PostDebugDrawEvent, GameEvent } from "Events";
    import { Timer } from "Timer";
    import { Engine } from "Engine";
    import { Group } from "Group";
    import { TileMap } from "TileMap";
    import { BaseCamera } from "Camera";
    import { Actor } from "Actor";
    import { Class } from "Class";
    import * as Events from "Events";
    /**
     * [[Actor|Actors]] are composed together into groupings called Scenes in
     * Excalibur. The metaphor models the same idea behind real world
     * actors in a scene. Only actors in scenes will be updated and drawn.
     *
     * Typical usages of a scene include: levels, menus, loading screens, etc.
     *
     * [[include:Scenes.md]]
     */
    export class Scene extends Class {
        /**
         * The actor this scene is attached to, if any
         */
        actor: Actor;
        /**
         * Gets or sets the current camera for the scene
         */
        camera: BaseCamera;
        /**
         * The actors in the current scene
         */
        children: Actor[];
        /**
         * The [[TileMap]]s in the scene, if any
         */
        tileMaps: TileMap[];
        /**
         * The [[Group]]s in the scene, if any
         */
        groups: {
            [key: string]: Group;
        };
        /**
         * Access to the Excalibur engine
         */
        engine: Engine;
        /**
         * The [[UIActor]]s in a scene, if any; these are drawn last
         */
        uiActors: Actor[];
        private _isInitialized;
        private _sortedDrawingTree;
        private _broadphase;
        private _killQueue;
        private _timers;
        private _cancelQueue;
        private _logger;
        constructor(engine?: Engine);
        on(eventName: Events.initialize, handler: (event?: InitializeEvent) => void): any;
        on(eventName: Events.activate, handler: (event?: ActivateEvent) => void): any;
        on(eventName: Events.deactivate, handler: (event?: DeactivateEvent) => void): any;
        on(eventName: Events.preupdate, handler: (event?: PreUpdateEvent) => void): any;
        on(eventName: Events.postupdate, handler: (event?: PostUpdateEvent) => void): any;
        on(eventName: Events.predraw, handler: (event?: PreDrawEvent) => void): any;
        on(eventName: Events.postdraw, handler: (event?: PostDrawEvent) => void): any;
        on(eventName: Events.predebugdraw, handler: (event?: PreDebugDrawEvent) => void): any;
        on(eventName: Events.postdebugdraw, handler: (event?: PostDebugDrawEvent) => void): any;
        on(eventName: string, handler: (event?: GameEvent) => void): any;
        /**
         * This is called before the first update of the [[Scene]]. Initializes scene members like the camera. This method is meant to be
         * overridden. This is where initialization of child actors should take place.
         */
        onInitialize(engine: Engine): void;
        /**
         * This is called when the scene is made active and started. It is meant to be overriden,
         * this is where you should setup any DOM UI or event handlers needed for the scene.
         */
        onActivate(): void;
        /**
         * This is called when the scene is made transitioned away from and stopped. It is meant to be overriden,
         * this is where you should cleanup any DOM UI or event handlers needed for the scene.
         */
        onDeactivate(): void;
        /**
         * Initializes actors in the scene
         */
        private _initializeChildren();
        /**
         * Gets whether or not the [[Scene]] has been initialized
         */
        readonly isInitialized: boolean;
        /**
         * Initializes the scene before the first update, meant to be called by engine not by users of
         * Excalibur
         * @internal
         */
        _initialize(engine: Engine): void;
        /**
         * Updates all the actors and timers in the scene. Called by the [[Engine]].
         * @param engine  Reference to the current Engine
         * @param delta   The number of milliseconds since the last update
         */
        update(engine: Engine, delta: number): void;
        /**
         * Draws all the actors in the Scene. Called by the [[Engine]].
         * @param ctx    The current rendering context
         * @param delta  The number of milliseconds since the last draw
         */
        draw(ctx: CanvasRenderingContext2D, delta: number): void;
        /**
         * Draws all the actors' debug information in the Scene. Called by the [[Engine]].
         * @param ctx  The current rendering context
         */
        debugDraw(ctx: CanvasRenderingContext2D): void;
        /**
         * Checks whether an actor is contained in this scene or not
         */
        contains(actor: Actor): boolean;
        /**
         * Adds a [[Timer]] to the current scene.
         * @param timer  The timer to add to the current scene.
         */
        add(timer: Timer): void;
        /**
         * Adds a [[TileMap]] to the Scene, once this is done the TileMap will be drawn and updated.
         */
        add(tileMap: TileMap): void;
        /**
         * Adds an actor to the scene, once this is done the [[Actor]] will be drawn and updated.
         * @param actor  The actor to add to the current scene
         */
        add(actor: Actor): void;
        /**
         * Adds a [[UIActor]] to the scene.
         * @param uiActor  The UIActor to add to the current scene
         */
        add(uiActor: UIActor): void;
        /**
         * Removes a [[Timer]] from the current scene, it will no longer be updated.
         * @param timer  The timer to remove to the current scene.
         */
        remove(timer: Timer): void;
        /**
         * Removes a [[TileMap]] from the scene, it will no longer be drawn or updated.
         * @param tileMap {TileMap}
         */
        remove(tileMap: TileMap): void;
        /**
         * Removes an actor from the scene, it will no longer be drawn or updated.
         * @param actor  The actor to remove from the current scene.
         */
        remove(actor: Actor): void;
        /**
         * Removes a [[UIActor]] to the scene, it will no longer be drawn or updated
         * @param uiActor  The UIActor to remove from the current scene
         */
        remove(uiActor: UIActor): void;
        /**
         * Adds (any) actor to act as a piece of UI, meaning it is always positioned
         * in screen coordinates. UI actors do not participate in collisions.
         * @todo Should this be `UIActor` only?
         */
        addUIActor(actor: Actor): void;
        /**
         * Removes an actor as a piece of UI
         */
        removeUIActor(actor: Actor): void;
        /**
         * Adds an actor to the scene, once this is done the actor will be drawn and updated.
         */
        protected _addChild(actor: Actor): void;
        /**
         * Adds a [[TileMap]] to the scene, once this is done the TileMap will be drawn and updated.
         */
        addTileMap(tileMap: TileMap): void;
        /**
         * Removes a [[TileMap]] from the scene, it will no longer be drawn or updated.
         */
        removeTileMap(tileMap: TileMap): void;
        /**
         * Removes an actor from the scene, it will no longer be drawn or updated.
         */
        protected _removeChild(actor: Actor): void;
        /**
         * Adds a [[Timer]] to the scene
         * @param timer  The timer to add
         */
        addTimer(timer: Timer): Timer;
        /**
         * Removes a [[Timer]] from the scene.
         * @warning Can be dangerous, use [[cancelTimer]] instead
         * @param timer  The timer to remove
         */
        removeTimer(timer: Timer): Timer;
        /**
         * Cancels a [[Timer]], removing it from the scene nicely
         * @param timer  The timer to cancel
         */
        cancelTimer(timer: Timer): Timer;
        /**
         * Tests whether a [[Timer]] is active in the scene
         */
        isTimerActive(timer: Timer): boolean;
        /**
         * Creates and adds a [[Group]] to the scene with a name
         */
        createGroup(name: string): Group;
        /**
         * Returns a [[Group]] by name
         */
        getGroup(name: string): Group;
        /**
         * Removes a [[Group]] by name
         */
        removeGroup(name: string): void;
        /**
         * Removes a [[Group]] by reference
         */
        removeGroup(group: Group): void;
        /**
         * Removes the given actor from the sorted drawing tree
         */
        cleanupDrawTree(actor: Actor): void;
        /**
         * Updates the given actor's position in the sorted drawing tree
         */
        updateDrawTree(actor: Actor): void;
        private _collectActorStats(engine);
    }
}
declare module "Events" {
    import { Scene } from "Scene";
    import { Vector } from "Algebra";
    import { Actor } from "Actor";
    import { FrameStats } from "Debug";
    import { Engine } from "Engine";
    import { Side } from "Collision/Side";
    import * as Input from "Input/Index";
    export type kill = 'kill';
    export type predraw = 'predraw';
    export type postdraw = 'postdraw';
    export type predebugdraw = 'predebugdraw';
    export type postdebugdraw = 'postdebugdraw';
    export type preupdate = 'preupdate';
    export type postupdate = 'postupdate';
    export type preframe = 'preframe';
    export type postframe = 'postframe';
    export type collision = 'collision';
    export type initialize = 'initialize';
    export type activate = 'activate';
    export type deactivate = 'deactivate';
    export type exitviewport = 'exitviewport';
    export type enterviewport = 'enterviewport';
    export type connect = 'connect';
    export type disconnect = 'disconnect';
    export type button = 'button';
    export type axis = 'axis';
    export type subscribe = 'subscribe';
    export type unsubscribe = 'unsubscribe';
    export type visible = 'visible';
    export type hidden = 'hidden';
    export type start = 'start';
    export type stop = 'stop';
    export type pointerup = 'pointerup';
    export type pointerdown = 'pointerdown';
    export type pointermove = 'pointermove';
    export type pointercancel = 'pointercancel';
    export type up = 'up';
    export type down = 'down';
    export type move = 'move';
    export type cancel = 'cancel';
    export type press = 'press';
    export type release = 'release';
    export type hold = 'hold';
    /**
     * Base event type in Excalibur that all other event types derive from. Not all event types are thrown on all Excalibur game objects,
     * some events are unique to a type, others are not.
     *
     */
    export class GameEvent {
        /**
         * Target object for this event.
         */
        target: any;
    }
    /**
     * The 'kill' event is emitted on actors when it is killed. The target is the actor that was killed.
     */
    export class KillEvent extends GameEvent {
        target: any;
        constructor(target: any);
    }
    /**
     * The 'start' event is emitted on engine when has started and is ready for interaction.
     */
    export class GameStartEvent extends GameEvent {
        target: any;
        constructor(target: any);
    }
    /**
     * The 'stop' event is emitted on engine when has been stopped and will no longer take input, update or draw.
     */
    export class GameStopEvent extends GameEvent {
        target: any;
        constructor(target: any);
    }
    /**
     * The 'predraw' event is emitted on actors, scenes, and engine before drawing starts. Actors' predraw happens inside their graphics
     * transform so that all drawing takes place with the actor as the origin.
     *
     */
    export class PreDrawEvent extends GameEvent {
        ctx: CanvasRenderingContext2D;
        delta: any;
        target: any;
        constructor(ctx: CanvasRenderingContext2D, delta: any, target: any);
    }
    /**
     * The 'postdraw' event is emitted on actors, scenes, and engine after drawing finishes. Actors' postdraw happens inside their graphics
     * transform so that all drawing takes place with the actor as the origin.
     *
     */
    export class PostDrawEvent extends GameEvent {
        ctx: CanvasRenderingContext2D;
        delta: any;
        target: any;
        constructor(ctx: CanvasRenderingContext2D, delta: any, target: any);
    }
    /**
     * The 'predebugdraw' event is emitted on actors, scenes, and engine before debug drawing starts.
     */
    export class PreDebugDrawEvent extends GameEvent {
        ctx: CanvasRenderingContext2D;
        target: any;
        constructor(ctx: CanvasRenderingContext2D, target: any);
    }
    /**
     * The 'postdebugdraw' event is emitted on actors, scenes, and engine after debug drawing starts.
     */
    export class PostDebugDrawEvent extends GameEvent {
        ctx: CanvasRenderingContext2D;
        target: any;
        constructor(ctx: CanvasRenderingContext2D, target: any);
    }
    /**
     * The 'preupdate' event is emitted on actors, scenes, and engine before the update starts.
     */
    export class PreUpdateEvent extends GameEvent {
        engine: Engine;
        delta: any;
        target: any;
        constructor(engine: Engine, delta: any, target: any);
    }
    /**
     * The 'postupdate' event is emitted on actors, scenes, and engine after the update ends. This is equivalent to the obsolete 'update'
     * event.
     */
    export class PostUpdateEvent extends GameEvent {
        engine: Engine;
        delta: any;
        target: any;
        constructor(engine: Engine, delta: any, target: any);
    }
    /**
     * The 'preframe' event is emitted on the engine, before the frame begins.
     */
    export class PreFrameEvent extends GameEvent {
        engine: Engine;
        prevStats: FrameStats;
        target: any;
        constructor(engine: Engine, prevStats: FrameStats, target: any);
    }
    /**
     * The 'postframe' event is emitted on the engine, after a frame ends.
     */
    export class PostFrameEvent extends GameEvent {
        engine: Engine;
        stats: FrameStats;
        target: any;
        constructor(engine: Engine, stats: FrameStats, target: any);
    }
    /**
     * Event received when a gamepad is connected to Excalibur. [[Gamepads]] receives this event.
     */
    export class GamepadConnectEvent extends GameEvent {
        index: number;
        gamepad: Input.Gamepad;
        constructor(index: number, gamepad: Input.Gamepad);
    }
    /**
     * Event received when a gamepad is disconnected from Excalibur. [[Gamepads]] receives this event.
     */
    export class GamepadDisconnectEvent extends GameEvent {
        index: number;
        constructor(index: number);
    }
    /**
     * Gamepad button event. See [[Gamepads]] for information on responding to controller input. [[Gamepad]] instances receive this event;
     */
    export class GamepadButtonEvent extends GameEvent {
        button: Input.Buttons;
        value: number;
        /**
         * @param button  The Gamepad button
         * @param value   A numeric value between 0 and 1
         */
        constructor(button: Input.Buttons, value: number);
    }
    /**
     * Gamepad axis event. See [[Gamepads]] for information on responding to controller input. [[Gamepad]] instances receive this event;
     */
    export class GamepadAxisEvent extends GameEvent {
        axis: Input.Axes;
        value: number;
        /**
         * @param axis  The Gamepad axis
         * @param value A numeric value between -1 and 1
         */
        constructor(axis: Input.Axes, value: number);
    }
    /**
     * Subscribe event thrown when handlers for events other than subscribe are added. Meta event that is received by
     * [[EventDispatcher|event dispatchers]].
     */
    export class SubscribeEvent extends GameEvent {
        topic: string;
        handler: (event?: GameEvent) => void;
        constructor(topic: string, handler: (event?: GameEvent) => void);
    }
    /**
     * Unsubscribe event thrown when handlers for events other than unsubscribe are removed. Meta event that is received by
     * [[EventDispatcher|event dispatchers]].
     */
    export class UnsubscribeEvent extends GameEvent {
        topic: string;
        handler: (event?: GameEvent) => void;
        constructor(topic: string, handler: (event?: GameEvent) => void);
    }
    /**
     * Event received by the [[Engine]] when the browser window is visible on a screen.
     */
    export class VisibleEvent extends GameEvent {
        constructor();
    }
    /**
     * Event received by the [[Engine]] when the browser window is hidden from all screens.
     */
    export class HiddenEvent extends GameEvent {
        constructor();
    }
    /**
     * Event thrown on an [[Actor|actor]] when a collision has occurred
     */
    export class CollisionEvent extends GameEvent {
        actor: Actor;
        other: Actor;
        side: Side;
        intersection: Vector;
        /**
         * @param actor         The actor the event was thrown on
         * @param other         The actor that was collided with
         * @param side          The side that was collided with
         * @param intersection  Intersection vector
         */
        constructor(actor: Actor, other: Actor, side: Side, intersection: Vector);
    }
    /**
     * Event thrown on an [[Actor]] and a [[Scene]] only once before the first update call
     */
    export class InitializeEvent extends GameEvent {
        engine: Engine;
        /**
         * @param engine  The reference to the current engine
         */
        constructor(engine: Engine);
    }
    /**
     * Event thrown on a [[Scene]] on activation
     */
    export class ActivateEvent extends GameEvent {
        oldScene: Scene;
        /**
         * @param oldScene  The reference to the old scene
         */
        constructor(oldScene: Scene);
    }
    /**
     * Event thrown on a [[Scene]] on deactivation
     */
    export class DeactivateEvent extends GameEvent {
        newScene: Scene;
        /**
         * @param newScene  The reference to the new scene
         */
        constructor(newScene: Scene);
    }
    /**
     * Event thrown on an [[Actor]] when it completely leaves the screen.
     */
    export class ExitViewPortEvent extends GameEvent {
        constructor();
    }
    /**
     * Event thrown on an [[Actor]] when it completely leaves the screen.
     */
    export class EnterViewPortEvent extends GameEvent {
        constructor();
    }
}
declare module "Class" {
    import { GameEvent } from "Events";
    import { EventDispatcher } from "EventDispatcher";
    import { IEvented } from "Interfaces/IEvented";
    /**
     * Excalibur base class that provides basic functionality such as [[EventDispatcher]]
     * and extending abilities for vanilla Javascript projects
     */
    export class Class implements IEvented {
        /**
         * Direct access to the game object event dispatcher.
         */
        eventDispatcher: EventDispatcher;
        constructor();
        /**
         * Alias for `addEventListener`. You can listen for a variety of
         * events off of the engine; see the events section below for a complete list.
         * @param eventName  Name of the event to listen for
         * @param handler    Event handler for the thrown event
         */
        on(eventName: string, handler: (event?: GameEvent) => void): void;
        /**
         * Alias for `removeEventListener`. If only the eventName is specified
         * it will remove all handlers registered for that specific event. If the eventName
         * and the handler instance are specified only that handler will be removed.
         *
         * @param eventName  Name of the event to listen for
         * @param handler    Event handler for the thrown event
         */
        off(eventName: string, handler?: (event?: GameEvent) => void): void;
        /**
         * Emits a new event
         * @param eventName   Name of the event to emit
         * @param eventObject Data associated with this event
         */
        emit(eventName: string, eventObject?: GameEvent): void;
        /**
         * You may wish to extend native Excalibur functionality in vanilla Javascript.
         * Any method on a class inheriting [[Class]] may be extended to support
         * additional functionality. In the example below we create a new type called `MyActor`.
         *
         *
         * ```js
         * var MyActor = Actor.extend({
         *
         *    constructor: function() {
         *       this.newprop = 'something';
         *       Actor.apply(this, arguments);
         *    },
         *
         *    update: function(engine, delta) {
         *       // Implement custom update
         *       // Call super constructor update
         *       Actor.prototype.update.call(this, engine, delta);
         *
         *       console.log("Something cool!");
         *    }
         * });
         *
         * var myActor = new MyActor(100, 100, 100, 100, Color.Azure);
         * ```
         *
         * In TypeScript, you only need to use the `extends` syntax, you do not need
         * to use this method of extension.
         *
         * @param methods A JSON object contain any methods/properties you want to extend
         */
        static extend(methods: any): any;
    }
}
declare module "Actor" {
    import { Class } from "Class";
    import { BoundingBox } from "Collision/BoundingBox";
    import { Texture } from "Resources/Texture";
    import { InitializeEvent, KillEvent, PreUpdateEvent, PostUpdateEvent, PreDrawEvent, PostDrawEvent, PreDebugDrawEvent, PostDebugDrawEvent, GameEvent } from "Events";
    import { Engine } from "Engine";
    import { Color } from "Drawing/Color";
    import { Sprite } from "Drawing/Sprite";
    import { IActorTrait } from "Interfaces/IActorTrait";
    import { IDrawable } from "Interfaces/IDrawable";
    import { Scene } from "Scene";
    import { Logger } from "Util/Log";
    import { ActionContext } from "Actions/ActionContext";
    import { ActionQueue } from "Actions/Action";
    import { Vector } from "Algebra";
    import { ICollisionArea } from "Collision/ICollisionArea";
    import { Body } from "Collision/Body";
    import { Side } from "Collision/Side";
    import { IEvented } from "Interfaces/IEvented";
    import { IActionable } from "Actions/IActionable";
    import * as Traits from "Traits/Index";
    import * as Events from "Events";
    /**
     * The most important primitive in Excalibur is an `Actor`. Anything that
     * can move on the screen, collide with another `Actor`, respond to events,
     * or interact with the current scene, must be an actor. An `Actor` **must**
     * be part of a [[Scene]] for it to be drawn to the screen.
     *
     * [[include:Actors.md]]
     *
     */
    export class Actor extends Class implements IActionable, IEvented {
        /**
         * Indicates the next id to be set
         */
        static maxId: number;
        /**
         * The unique identifier for the actor
         */
        id: number;
        /**
         * The physics body the is associated with this actor. The body is the container for all physical properties, like position, velocity,
         * acceleration, mass, inertia, etc.
         */
        body: Body;
        /**
         * Gets the collision area shape to use for collision possible options are [CircleArea|circles], [PolygonArea|polygons], and
         * [EdgeArea|edges].
         */
        /**
         * Gets the collision area shape to use for collision possible options are [CircleArea|circles], [PolygonArea|polygons], and
         * [EdgeArea|edges].
         */
        collisionArea: ICollisionArea;
        /**
         * Gets the x position of the actor relative to it's parent (if any)
         */
        /**
         * Sets the x position of the actor relative to it's parent (if any)
         */
        x: number;
        /**
         * Gets the y position of the actor relative to it's parent (if any)
         */
        /**
         * Sets the y position of the actor relative to it's parent (if any)
         */
        y: number;
        /**
         * Gets the position vector of the actor in pixels
         */
        /**
         * Sets the position vector of the actor in pixels
         */
        pos: Vector;
        /**
         * Gets the position vector of the actor from the last frame
         */
        /**
         * Sets the position vector of the actor in the last frame
         */
        oldPos: Vector;
        /**
         * Gets the velocity vector of the actor in pixels/sec
         */
        /**
         * Sets the velocity vector of the actor in pixels/sec
         */
        vel: Vector;
        /**
         * Gets the velocity vector of the actor from the last frame
         */
        /**
         * Sets the velocity vector of the actor from the last frame
         */
        oldVel: Vector;
        /**
         * Gets the acceleration vector of the actor in pixels/second/second. An acceleration pointing down such as (0, 100) may be
         * useful to simulate a gravitational effect.
         */
        /**
         * Sets the acceleration vector of teh actor in pixels/second/second
         */
        acc: Vector;
        /**
         * Gets the rotation of the actor in radians. 1 radian = 180/PI Degrees.
         */
        /**
         * Sets the rotation of the actor in radians. 1 radian = 180/PI Degrees.
         */
        rotation: number;
        /**
         * Gets the rotational velocity of the actor in radians/second
         */
        /**
         * Sets the rotational velocity of the actor in radians/sec
         */
        rx: number;
        /**
         * Gets the current torque applied to the actor. Torque can be thought of as rotational force
         */
        /**
         * Sets the current torque applied to the actor. Torque can be thought of as rotational force
         */
        torque: number;
        /**
         * Get the current mass of the actor, mass can be thought of as the resistance to acceleration.
         */
        /**
         * Sets the mass of the actor, mass can be thought of as the resistance to acceleration.
         */
        mass: number;
        /**
         * Gets the current moment of inertia, moi can be thought of as the resistance to rotation.
         */
        /**
         * Sets the current moment of inertia, moi can be thought of as the resistance to rotation.
         */
        moi: number;
        /**
         * Gets the coefficient of friction on this actor, this can be thought of as how sticky or slippery an object is.
         */
        /**
         * Sets the coefficient of friction of this actor, this can ve thought of as how stick or slippery an object is.
         */
        friction: number;
        /**
         * Gets the coefficient of restitution of this actor, represents the amount of energy preserved after collision. Think of this
         * as bounciness.
         */
        /**
         * Sets the coefficient of restitution of this actor, represents the amount of energy preserved after collision. Think of this
         * as bounciness.
         */
        restitution: number;
        /**
         * The anchor to apply all actor related transformations like rotation,
         * translation, and rotation. By default the anchor is in the center of
         * the actor. By default it is set to the center of the actor (.5, .5)
         *
         * An anchor of (.5, .5) will ensure that drawings are centered.
         *
         * Use `anchor.setTo` to set the anchor to a different point using
         * values between 0 and 1. For example, anchoring to the top-left would be
         * `Actor.anchor.setTo(0, 0)` and top-right would be `Actor.anchor.setTo(0, 1)`.
         */
        anchor: Vector;
        private _height;
        private _width;
        /**
         * The scale vector of the actor
         */
        scale: Vector;
        /**
         * The x scalar velocity of the actor in scale/second
         */
        sx: number;
        /**
         * The y scalar velocity of the actor in scale/second
         */
        sy: number;
        /**
         * Indicates whether the actor is physically in the viewport
         */
        isOffScreen: boolean;
        /**
         * The visibility of an actor
         */
        visible: boolean;
        /**
         * The opacity of an actor. Passing in a color in the [[constructor]] will use the
         * color's opacity.
         */
        opacity: number;
        previousOpacity: number;
        /**
         * Direct access to the actor's [[ActionQueue]]. Useful if you are building custom actions.
         */
        actionQueue: ActionQueue;
        /**
         * [[ActionContext|Action context]] of the actor. Useful for scripting actor behavior.
         */
        actions: ActionContext;
        /**
         * Convenience reference to the global logger
         */
        logger: Logger;
        /**
         * The scene that the actor is in
         */
        scene: Scene;
        /**
         * The parent of this actor
         */
        parent: Actor;
        /**
         * The children of this actor
         */
        children: Actor[];
        /**
         * Gets or sets the current collision type of this actor. By
         * default it is ([[CollisionType.PreventCollision]]).
         */
        collisionType: CollisionType;
        collisionGroups: string[];
        private _collisionHandlers;
        private _isInitialized;
        frames: {
            [key: string]: IDrawable;
        };
        private _effectsDirty;
        /**
         * Access to the current drawing for the actor, this can be
         * an [[Animation]], [[Sprite]], or [[Polygon]].
         * Set drawings with [[setDrawing]].
         */
        currentDrawing: IDrawable;
        /**
         * Modify the current actor update pipeline.
         */
        traits: IActorTrait[];
        /**
         * Sets the color of the actor. A rectangle of this color will be
         * drawn if no [[IDrawable]] is specified as the actors drawing.
         *
         * The default is `null` which prevents a rectangle from being drawn.
         */
        color: Color;
        /**
         * Whether or not to enable the [[CapturePointer]] trait that propagates
         * pointer events to this actor
         */
        enableCapturePointer: boolean;
        /**
         * Configuration for [[CapturePointer]] trait
         */
        capturePointer: Traits.ICapturePointerConfig;
        private _zIndex;
        private _isKilled;
        private _opacityFx;
        /**
         * @param x       The starting x coordinate of the actor
         * @param y       The starting y coordinate of the actor
         * @param width   The starting width of the actor
         * @param height  The starting height of the actor
         * @param color   The starting color of the actor. Leave null to draw a transparent actor. The opacity of the color will be used as the
         * initial [[opacity]].
         */
        constructor(x?: number, y?: number, width?: number, height?: number, color?: Color);
        /**
         * This is called before the first update of the actor. This method is meant to be
         * overridden. This is where initialization of child actors should take place.
         */
        onInitialize(engine: Engine): void;
        /**
         * Gets wether the actor is Initialized
         */
        readonly isInitialized: boolean;
        /**
         * Initializes this actor and all it's child actors, meant to be called by the Scene before first update not by users of Excalibur.
         * @internal
         */
        _initialize(engine: Engine): void;
        private _checkForPointerOptIn(eventName);
        on(eventName: Events.kill, handler: (event?: KillEvent) => void): any;
        on(eventName: Events.initialize, handler: (event?: InitializeEvent) => void): any;
        on(eventName: Events.preupdate, handler: (event?: PreUpdateEvent) => void): any;
        on(eventName: Events.postupdate, handler: (event?: PostUpdateEvent) => void): any;
        on(eventName: Events.predraw, handler: (event?: PreDrawEvent) => void): any;
        on(eventName: Events.postdraw, handler: (event?: PostDrawEvent) => void): any;
        on(eventName: Events.predebugdraw, handler: (event?: PreDebugDrawEvent) => void): any;
        on(eventName: Events.postdebugdraw, handler: (event?: PostDebugDrawEvent) => void): any;
        on(eventName: Events.pointerup, handler: (event?: PointerEvent) => void): any;
        on(eventName: Events.pointerdown, handler: (event?: PointerEvent) => void): any;
        on(eventName: Events.pointermove, handler: (event?: PointerEvent) => void): any;
        on(eventName: Events.pointercancel, handler: (event?: PointerEvent) => void): any;
        on(eventName: string, handler: (event?: GameEvent) => void): any;
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
         * Adds a child actor to this actor. All movement of the child actor will be
         * relative to the parent actor. Meaning if the parent moves the child will
         * move with it.
         * @param actor The child actor to add
         */
        add(actor: Actor): void;
        /**
         * Removes a child actor from this actor.
         * @param actor The child actor to remove
         */
        remove(actor: Actor): void;
        /**
         * Sets the current drawing of the actor to the drawing corresponding to
         * the key.
         * @param key The key of the drawing
         */
        setDrawing(key: string): any;
        /**
         * Sets the current drawing of the actor to the drawing corresponding to
         * an `enum` key (e.g. `Animations.Left`)
         * @param key The `enum` key of the drawing
         */
        setDrawing(key: number): any;
        /**
         * Adds a whole texture as the "default" drawing. Set a drawing using [[setDrawing]].
         */
        addDrawing(texture: Texture): any;
        /**
         * Adds a whole sprite as the "default" drawing. Set a drawing using [[setDrawing]].
         */
        addDrawing(sprite: Sprite): any;
        /**
         * Adds a drawing to the list of available drawings for an actor. Set a drawing using [[setDrawing]].
         * @param key     The key to associate with a drawing for this actor
         * @param drawing This can be an [[Animation]], [[Sprite]], or [[Polygon]].
         */
        addDrawing(key: any, drawing: IDrawable): any;
        z: number;
        /**
         * Gets the z-index of an actor. The z-index determines the relative order an actor is drawn in.
         * Actors with a higher z-index are drawn on top of actors with a lower z-index
         */
        getZIndex(): number;
        /**
         * Sets the z-index of an actor and updates it in the drawing list for the scene.
         * The z-index determines the relative order an actor is drawn in.
         * Actors with a higher z-index are drawn on top of actors with a lower z-index
         * @param newIndex new z-index to assign
         */
        setZIndex(newIndex: number): void;
        /**
         * Adds an actor to a collision group. Actors with no named collision groups are
         * considered to be in every collision group.
         *
         * Once in a collision group(s) actors will only collide with other actors in
         * that group.
         *
         * @param name The name of the collision group
         */
        addCollisionGroup(name: string): void;
        /**
         * Removes an actor from a collision group.
         * @param name The name of the collision group
         */
        removeCollisionGroup(name: string): void;
        /**
         * Get the center point of an actor
         */
        getCenter(): Vector;
        /**
         * Gets the calculated width of an actor, factoring in scale
         */
        getWidth(): number;
        /**
         * Sets the width of an actor, factoring in the current scale
         */
        setWidth(width: any): void;
        /**
         * Gets the calculated height of an actor, factoring in scale
         */
        getHeight(): number;
        /**
         * Sets the height of an actor, factoring in the current scale
         */
        setHeight(height: any): void;
        /**
         * Gets the left edge of the actor
         */
        getLeft(): number;
        /**
         * Gets the right edge of the actor
         */
        getRight(): number;
        /**
         * Gets the top edge of the actor
         */
        getTop(): number;
        /**
         * Gets the bottom edge of the actor
         */
        getBottom(): number;
        /**
         * Gets this actor's rotation taking into account any parent relationships
         *
         * @returns Rotation angle in radians
         */
        getWorldRotation(): number;
        /**
         * Gets an actor's world position taking into account parent relationships, scaling, rotation, and translation
         *
         * @returns Position in world coordinates
         */
        getWorldPos(): Vector;
        /**
         * Gets the global scale of the Actor
         */
        getGlobalScale(): Vector;
        /**
         * Returns the actor's [[BoundingBox]] calculated for this instant in world space.
         */
        getBounds(): BoundingBox;
        /**
         * Returns the actor's [[BoundingBox]] relative to the actors position.
         */
        getRelativeBounds(): BoundingBox;
        /**
         * Tests whether the x/y specified are contained in the actor
         * @param x  X coordinate to test (in world coordinates)
         * @param y  Y coordinate to test (in world coordinates)
         * @param recurse checks whether the x/y are contained in any child actors (if they exist).
         */
        contains(x: number, y: number, recurse?: boolean): boolean;
        /**
         * Returns the side of the collision based on the intersection
         * @param intersect The displacement vector returned by a collision
         */
        getSideFromIntersect(intersect: Vector): Side;
        /**
         * Test whether the actor has collided with another actor, returns the side of the current actor that collided.
         * @param actor The other actor to test
         */
        collidesWithSide(actor: Actor): Side;
        /**
         * Test whether the actor has collided with another actor, returns the intersection vector on collision. Returns
         * `null` when there is no collision;
         * @param actor The other actor to test
         */
        collides(actor: Actor): Vector;
        /**
         * Register a handler to fire when this actor collides with another in a specified group
         * @param group The group name to listen for
         * @param func The callback to fire on collision with another actor from the group. The callback is passed the other actor.
         */
        onCollidesWith(group: string, func: (actor: Actor) => void): void;
        getCollisionHandlers(): {
            [key: string]: {
                (actor: Actor): void;
            }[];
        };
        /**
         * Removes all collision handlers for this group on this actor
         * @param group Group to remove all handlers for on this actor.
         */
        removeCollidesWith(group: string): void;
        /**
         * Returns true if the two actors are less than or equal to the distance specified from each other
         * @param actor     Actor to test
         * @param distance  Distance in pixels to test
         */
        within(actor: Actor, distance: number): boolean;
        private _getCalculatedAnchor();
        protected _reapplyEffects(drawing: IDrawable): void;
        /**
         * Perform euler integration at the specified time step
         */
        integrate(delta: number): void;
        /**
         * Called by the Engine, updates the state of the actor
         * @param engine The reference to the current game engine
         * @param delta  The time elapsed since the last update in milliseconds
         */
        update(engine: Engine, delta: number): void;
        /**
         * Called by the Engine, draws the actor to the screen
         * @param ctx   The rendering context
         * @param delta The time since the last draw in milliseconds
         */
        draw(ctx: CanvasRenderingContext2D, delta: number): void;
        /**
         * Called by the Engine, draws the actors debugging to the screen
         * @param ctx The rendering context
         */
        debugDraw(ctx: CanvasRenderingContext2D): void;
    }
    /**
     * An enum that describes the types of collisions actors can participate in
     */
    export enum CollisionType {
        /**
         * Actors with the `PreventCollision` setting do not participate in any
         * collisions and do not raise collision events.
         */
        PreventCollision = 0,
        /**
         * Actors with the `Passive` setting only raise collision events, but are not
         * influenced or moved by other actors and do not influence or move other actors.
         */
        Passive = 1,
        /**
         * Actors with the `Active` setting raise collision events and participate
         * in collisions with other actors and will be push or moved by actors sharing
         * the `Active` or `Fixed` setting.
         */
        Active = 2,
        /**
         * Actors with the `Elastic` setting will behave the same as `Active`, except that they will
         * "bounce" in the opposite direction given their velocity dx/dy. This is a naive implementation meant for
         * prototyping, for a more robust elastic collision listen to the "collision" event and perform your custom logic.
         * @obsolete This behavior will be handled by a future physics system
         */
        Elastic = 3,
        /**
         * Actors with the `Fixed` setting raise collision events and participate in
         * collisions with other actors. Actors with the `Fixed` setting will not be
         * pushed or moved by other actors sharing the `Fixed`. Think of Fixed
         * actors as "immovable/onstoppable" objects. If two `Fixed` actors meet they will
         * not be pushed or moved by each other, they will not interact except to throw
         * collision events.
         */
        Fixed = 4,
    }
}
declare module "Actions/Action" {
    import { RotationType } from "Actions/RotationType";
    import { Actor } from "Actor";
    /**
     * Used for implementing actions for the [[ActionContext|Action API]].
     */
    export interface IAction {
        update(delta: number): void;
        isComplete(actor: Actor): boolean;
        reset(): void;
        stop(): void;
    }
    export class EaseTo implements IAction {
        actor: Actor;
        easingFcn: (currentTime: number, startValue: number, endValue: number, duration: number) => number;
        private _currentLerpTime;
        private _lerpDuration;
        private _lerpStart;
        private _lerpEnd;
        private _initialized;
        private _stopped;
        private _distance;
        constructor(actor: Actor, x: number, y: number, duration: number, easingFcn: (currentTime: number, startValue: number, endValue: number, duration: number) => number);
        private _initialize();
        update(delta: number): void;
        isComplete(actor: Actor): boolean;
        reset(): void;
        stop(): void;
    }
    export class MoveTo implements IAction {
        private _actor;
        x: number;
        y: number;
        private _start;
        private _end;
        private _dir;
        private _speed;
        private _distance;
        private _started;
        private _stopped;
        constructor(actor: Actor, destx: number, desty: number, speed: number);
        update(delta: number): void;
        isComplete(actor: Actor): boolean;
        stop(): void;
        reset(): void;
    }
    export class MoveBy implements IAction {
        private _actor;
        x: number;
        y: number;
        private _distance;
        private _speed;
        private _time;
        private _start;
        private _end;
        private _dir;
        private _started;
        private _stopped;
        constructor(actor: Actor, destx: number, desty: number, time: number);
        update(delta: Number): void;
        isComplete(actor: Actor): boolean;
        stop(): void;
        reset(): void;
    }
    export class Follow implements IAction {
        private _actor;
        private _actorToFollow;
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
        constructor(actor: Actor, actorToFollow: Actor, followDistance?: number);
        update(delta: number): void;
        stop(): void;
        isComplete(actor: Actor): boolean;
        reset(): void;
    }
    export class Meet implements IAction {
        private _actor;
        private _actorToMeet;
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
        constructor(actor: Actor, actorToMeet: Actor, speed?: number);
        update(delta: number): void;
        isComplete(actor: Actor): boolean;
        stop(): void;
        reset(): void;
    }
    export class RotateTo implements IAction {
        private _actor;
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
        private _started;
        private _stopped;
        constructor(actor: Actor, angleRadians: number, speed: number, rotationType?: RotationType);
        update(delta: number): void;
        isComplete(actor: Actor): boolean;
        stop(): void;
        reset(): void;
    }
    export class RotateBy implements IAction {
        private _actor;
        x: number;
        y: number;
        private _start;
        private _end;
        private _speed;
        private _time;
        private _rotationType;
        private _direction;
        private _distance;
        private _shortDistance;
        private _longDistance;
        private _shortestPathIsPositive;
        private _started;
        private _stopped;
        constructor(actor: Actor, angleRadians: number, time: number, rotationType?: RotationType);
        update(delta: number): void;
        isComplete(actor: Actor): boolean;
        stop(): void;
        reset(): void;
    }
    export class ScaleTo implements IAction {
        private _actor;
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
        constructor(actor: Actor, scaleX: number, scaleY: number, speedX: number, speedY: number);
        update(delta: number): void;
        isComplete(actor: Actor): boolean;
        stop(): void;
        reset(): void;
    }
    export class ScaleBy implements IAction {
        private _actor;
        x: number;
        y: number;
        private _startX;
        private _startY;
        private _endX;
        private _endY;
        private _time;
        private _distanceX;
        private _distanceY;
        private _started;
        private _stopped;
        private _speedX;
        private _speedY;
        constructor(actor: Actor, scaleX: number, scaleY: number, time: number);
        update(delta: number): void;
        isComplete(actor: Actor): boolean;
        stop(): void;
        reset(): void;
    }
    export class Delay implements IAction {
        x: number;
        y: number;
        private _actor;
        private _elapsedTime;
        private _delay;
        private _started;
        private _stopped;
        constructor(actor: Actor, delay: number);
        update(delta: number): void;
        isComplete(actor: Actor): boolean;
        stop(): void;
        reset(): void;
    }
    export class Blink implements IAction {
        private _timeVisible;
        private _timeNotVisible;
        private _elapsedTime;
        private _totalTime;
        private _actor;
        private _duration;
        private _stopped;
        private _started;
        constructor(actor: Actor, timeVisible: number, timeNotVisible: number, numBlinks?: number);
        update(delta: any): void;
        isComplete(actor: Actor): boolean;
        stop(): void;
        reset(): void;
    }
    export class Fade implements IAction {
        x: number;
        y: number;
        private _actor;
        private _endOpacity;
        private _speed;
        private _multiplier;
        private _started;
        private _stopped;
        constructor(actor: Actor, endOpacity: number, speed: number);
        update(delta: number): void;
        isComplete(actor: Actor): boolean;
        stop(): void;
        reset(): void;
    }
    export class Die implements IAction {
        x: number;
        y: number;
        private _actor;
        private _started;
        private _stopped;
        constructor(actor: Actor);
        update(delta: number): void;
        isComplete(): boolean;
        stop(): void;
        reset(): void;
    }
    export class CallMethod implements IAction {
        x: number;
        y: number;
        private _method;
        private _actor;
        private _hasBeenCalled;
        constructor(actor: Actor, method: () => any);
        update(delta: number): void;
        isComplete(actor: Actor): boolean;
        reset(): void;
        stop(): void;
    }
    export class Repeat implements IAction {
        x: number;
        y: number;
        private _actor;
        private _actionQueue;
        private _repeat;
        private _originalRepeat;
        private _stopped;
        constructor(actor: Actor, repeat: number, actions: IAction[]);
        update(delta: any): void;
        isComplete(): boolean;
        stop(): void;
        reset(): void;
    }
    export class RepeatForever implements IAction {
        x: number;
        y: number;
        private _actor;
        private _actionQueue;
        private _stopped;
        constructor(actor: Actor, actions: IAction[]);
        update(delta: any): void;
        isComplete(): boolean;
        stop(): void;
        reset(): void;
    }
    /**
     * Action Queues
     *
     * Action queues are part of the [[ActionContext|Action API]] and
     * store the list of actions to be executed for an [[Actor]].
     *
     * Actors implement [[Actor.actions]] which can be manipulated by
     * advanced users to adjust the actions currently being executed in the
     * queue.
     */
    export class ActionQueue {
        private _actor;
        private _actions;
        private _currentAction;
        private _completedActions;
        constructor(actor: Actor);
        add(action: IAction): void;
        remove(action: IAction): void;
        clearActions(): void;
        getActions(): IAction[];
        hasNext(): boolean;
        reset(): void;
        update(delta: number): void;
    }
}
